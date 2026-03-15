import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiService } from '../../api';
import { WarnDialog } from '../../components/common/Dialog/WarnDialog';
import { GroupPassForm } from '../../components/common/GroupPassForm/GroupPassForm';
import { SuccessOrError } from '../../components/common/SuccessOrError/SuccessOrError';
import { TicketItem } from '../../components/common/TicketItem/TicketItem';
import { MODE } from '../../constants/common';
import { ROUTES } from '../../constants/routes';
import { TicketInfo } from '../../constants/tickets';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLoading } from '../../contexts/LoadingContext';
import './Booking.scss';

const DEFAULT_MIN_TICKETS = 12;
interface TicketQuantities {
  [key: string]: number;
}

interface GroupPassFormData {
  name: string;
  email: string;
  role?: string;
  location: string;
  tel: string;
}

interface TicketFormData {
  [ticketId: string]: GroupPassFormData[];
}

interface TicketValidationState {
  [ticketId: string]: boolean;
}

export const Booking: React.FC = () => {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const { vip } = useAuthContext();
  const [ticketTypes, setTicketTypes] = useState<TicketInfo[]>([]);

  // 檢查是否為優惠模式
  const [searchParams] = useSearchParams();
  const isDiscountMode = searchParams.get('discount') === 'true';

  // 優惠模式權限檢查 (資安隱蔽機制：偽裝 404)
  // 若非 VIP 嘗試訪問優惠路徑，直接渲染「找不到頁面」，不進行跳轉
  // 目的：讓好奇的使用者以為該 URL 參數無效，避免路徑被窺探
  if (isDiscountMode && !vip) {
    return (
      <SuccessOrError
        type="error"
        titlePrefix="頁面"
        errorText="不存在"
        message="抱歉，您訪問的頁面不存在或已移除。"
        hideButtons
      />
    );
  }

  // 載入票券類型
  useEffect(() => {
    const loadTicketTypes = async () => {
      try {
        showLoading('載入票券類型中...');

        // 根據模式決定 API 參數（後端過濾，避免價格窺探）
        const queryParams = isDiscountMode
          ? { where: { 'meta.discounts': { exists: true } } }  // 優惠模式：取優惠票券 + 口譯機
          : { discounts: 'none' };                              // 一般模式：只取沒有 discounts 的票券

        const { docs } = await apiService.ticketsTypes.getTicketsTypes(queryParams);

        setTicketTypes(
          docs.filter((ticket: TicketInfo) => !ticket.meta?.isPublic).map((ticket: TicketInfo) => ({
            id: ticket.id,
            name: ticket.name,
            price: ticket.price,
            image: ticket.image,
            caption: ticket.caption || '',
            available: ticket.available || 0,
            description: ticket.description || [],
            isMemberInfoRequired: Boolean(ticket.isMemberInfoRequired),
            bundleSize: ticket.bundleSize || 1,
            updatedBy: ticket.updatedBy,
            deletedAt: ticket.deletedAt,
            deletedBy: ticket.deletedBy,
            updatedAt: ticket.updatedAt,
            createdAt: ticket.createdAt,
            maxTickets: ticket.maxTickets,
            meta: ticket.meta,
          }))
        );
        hideLoading();
      } catch (error) {
        hideLoading();
        console.error('載入票券類型失敗:', error);
      }
    };

    loadTicketTypes();
  }, [isDiscountMode]);

  const [ticketQuantities, setTicketQuantities] = useState<TicketQuantities>(
    {}
  );

  const [ticketFormData, setTicketFormData] = useState<TicketFormData>({});
  const [ticketValidationStates, setTicketValidationStates] =
    useState<TicketValidationState>({});
  const [isWarnDialogOpen, setIsWarnDialogOpen] = useState(false);

  const handleQuantityChange = (ticketId: string, quantity: number) => {
    setTicketQuantities(prev => {
      const updated = {
        ...prev,
        [ticketId]: quantity,
      };

      // 計算所有非 addon 票券的總數量
      const nonAddonTotal = ticketTypes.reduce((total, t) => {
        if (!t.meta?.isAddon) {
          return total + (updated[t.id] || 0);
        }
        return total;
      }, 0);

      // 如果所有非 addon 票券都是 0，則將所有 addon 票券也設為 0
      if (nonAddonTotal === 0) {
        ticketTypes.forEach(t => {
          if (t.meta?.isAddon) {
            updated[t.id] = 0;
          }
        });
      }

      return updated;
    });
  };

  const handleFormDataChange = useCallback(
    (ticketId: string, index: number, formData: GroupPassFormData) => {
      setTicketFormData(prev => {
        const currentTicketData = prev[ticketId] || [];
        const updatedData = [...currentTicketData];
        updatedData[index] = formData;

        return {
          ...prev,
          [ticketId]: updatedData,
        };
      });
    },
    []
  );

  const handleValidationChange = useCallback(
    (ticketId: string, isValid: boolean) => {
      setTicketValidationStates(prev => ({
        ...prev,
        [ticketId]: isValid,
      }));
    },
    []
  );

  // 為每個票券創建穩定的回調函數
  const ticketHandlers = useMemo(() => {
    const handlers: {
      [ticketId: string]: {
        onFormDataChange: (index: number, formData: GroupPassFormData) => void;
        onValidationChange: (isValid: boolean) => void;
      };
    } = {};

    ticketTypes.forEach(ticket => {
      if (ticket.isMemberInfoRequired) {
        handlers[ticket.id] = {
          onFormDataChange: (index: number, formData: GroupPassFormData) =>
            handleFormDataChange(ticket.id, index, formData),
          onValidationChange: (isValid: boolean) =>
            handleValidationChange(ticket.id, isValid),
        };
      }
    });

    return handlers;
  }, [ticketTypes, handleFormDataChange, handleValidationChange]);

  const getTotalQuantity = () => {
    return Object.values(ticketQuantities).reduce(
      (sum, quantity) => sum + quantity,
      0
    );
  };

  // 計算非口譯機票券的總數量（用於優惠模式最低數量驗證）
  const getNonAddonTotalQuantity = () => {
    return ticketTypes.reduce((sum, ticket) => {
      if (ticket.meta?.isAddon) return sum;
      return sum + (ticketQuantities[ticket.id] || 0);
    }, 0);
  };

  const getSelectedTickets = () => {
    const selectedTickets = Object.entries(ticketQuantities)
      .filter(([, quantity]) => quantity > 0)
      .map(([ticketId, quantity]) => {
        const ticket = ticketTypes.find(t => t.id === ticketId);
        const bundleSize = ticket?.bundleSize || 1;
        return {
          ...ticket,
          selectedQuantity: quantity,
          totalPrice: (ticket?.price || 0) * quantity * bundleSize,
        };
      });

    const totalAmount = selectedTickets.reduce(
      (sum, ticket) => sum + ticket.totalPrice,
      0
    );
    const totalQuantity = selectedTickets.reduce(
      (sum, ticket) => sum + ticket.selectedQuantity,
      0
    );

    // 收集所有票券的表單資料，按票券 ID 分組
    const groupedFormData: { [ticketId: string]: GroupPassFormData[] } = {};
    ticketTypes.forEach(ticket => {
      if (ticket.isMemberInfoRequired) {
        const quantity = ticketQuantities[ticket.id] || 0;
        const bundleSize = ticket.bundleSize || 1;
        const totalForms = quantity * bundleSize;
        const formData = ticketFormData[ticket.id] || [];
        const validFormData: GroupPassFormData[] = [];

        for (let i = 0; i < totalForms; i++) {
          if (formData[i]) {
            validFormData.push(formData[i]);
          }
        }

        if (validFormData.length > 0) {
          groupedFormData[ticket.id] = validFormData;
        }
      }
    });

    return {
      tickets: selectedTickets,
      groupPassFormData: groupedFormData,
      summary: {
        totalAmount,
        totalQuantity,
      },
    };
  };

  const handleNextStep = () => {
    // 優惠模式下，未滿最低票數則顯示提示 dialog
    if (isDiscountMode && quantityForMinCheck < minTickets) {
      setIsWarnDialogOpen(true);
      return;
    }

    const ticketInfo = getSelectedTickets();

    // 導航到付款頁面，直接傳遞票券資訊
    navigate(ROUTES.PAYMENT, {
      state: { ticketOrderData: ticketInfo, isDiscountMode },
    });
  };

  // 檢查所有需要會員資訊的票券的表單是否都有效
  const areAllFormsValid = () => {
    const memberInfoRequiredTickets = ticketTypes.filter(
      ticket => ticket.isMemberInfoRequired
    );
    return memberInfoRequiredTickets.every(ticket => {
      const quantity = ticketQuantities[ticket.id] || 0;
      if (quantity === 0) return true; // 沒有選擇的票券不需要驗證
      return ticketValidationStates[ticket.id] === true;
    });
  };

  // 計算最低購買數量（優惠模式從票券 meta 取得，一般模式為 1）
  const minTickets = useMemo(() => {
    if (!isDiscountMode) return 1;

    const minValues = ticketTypes
      .map(ticket => ticket.meta?.discounts?.condition?.gte)
      .filter((v): v is number => typeof v === 'number');

    return minValues.length > 0 ? Math.max(...minValues) : DEFAULT_MIN_TICKETS;
  }, [isDiscountMode, ticketTypes]);

  // 下一步按鈕禁用條件
  const totalQuantity = getTotalQuantity();
  // 優惠模式：最低數量驗證不包含口譯機
  const quantityForMinCheck = isDiscountMode ? getNonAddonTotalQuantity() : totalQuantity;
  // 優惠模式下，minTickets 不足時顯示 dialog 而非禁用按鈕
  const isNextButtonDisabled = isDiscountMode
    ? !areAllFormsValid()
    : quantityForMinCheck < minTickets || !areAllFormsValid();

  // 計算口譯機票券的最大數量
  const getMaxQuantityForTicket = (ticket: TicketInfo) => {
    if (!ticket.meta?.isAddon) {
      return ticket.available ?? 0;
    }

    // 計算所有非口譯機票券的總人數（票券數量 × bundleSize）
    const totalPeople = ticketTypes.reduce((total, t) => {
      if (!t.meta?.isAddon) {
        const quantity = ticketQuantities[t.id] || 0;
        const bundleSize = t.bundleSize || 1;
        return total + quantity * bundleSize;
      }
      return total;
    }, 0);

    // 口譯機的最大數量 = 總人數 × 口譯機的 bundleSize
    return totalPeople * (ticket.bundleSize || 1);
  };

  // 檢查票券是否應該被 disabled（口譯機除外）
  const isTicketDisabled = (ticket: TicketInfo) => {
    // 優惠模式：無單一票種限制，可混購多種
    if (isDiscountMode) return false;

    if (ticket.meta?.isAddon) {
      return false;
    }

    // 一般模式：檢查是否已經選擇了其他非口譯機票券
    const hasOtherTicketSelected = ticketTypes.some(t => {
      // 跳過口譯機和當前票券本身
      if (t.meta?.isAddon || t.id === ticket.id) {
        return false;
      }

      // 檢查是否有選擇數量
      return (ticketQuantities[t.id] || 0) > 0;
    });

    return hasOtherTicketSelected;
  };

  return (
    <div className={`form-container booking-container ${isDiscountMode ? 'discount' : ''}`}>
      <div className="booking-title">
        <h1>選擇票券類型與數量</h1>
        {isDiscountMode ? (
          <p className="booking-title-warn" style={{ textAlign: 'left', margin: '0 auto' }}>
            ※教會團體票每筆需滿 {minTickets} 張，不包含租借口譯機。
            <br />
            ※若剩餘票數不足，請來信至 conference@thehope.co
          </p>
        ) : (
          <p className="booking-title-warn">
            每筆訂單限購一種票券，一張票券僅可加購一台口譯機。
          </p>
        )}
      </div>

      <div className="booking-content">
        {ticketTypes.map(ticket => {
          if (ticket.isMemberInfoRequired) {
            const currentTicketQuantity = ticketQuantities[ticket.id] || 0;
            return (
              <div key={ticket.id} className="booking-group-pass-item">
                <TicketItem
                  mode={MODE.EDIT}
                  ticket={ticket}
                  quantity={currentTicketQuantity}
                  onQuantityChange={handleQuantityChange}
                  maxQuantity={getMaxQuantityForTicket(ticket)}
                  disabled={isTicketDisabled(ticket)}
                />
                {currentTicketQuantity > 0 && ticketHandlers[ticket.id] && (
                  <GroupPassForm
                    mode={MODE.EDIT}
                    quantity={currentTicketQuantity * (ticket.bundleSize || 1)}
                    formData={ticketFormData[ticket.id] || []}
                    onFormDataChange={
                      ticketHandlers[ticket.id].onFormDataChange
                    }
                    onValidationChange={
                      ticketHandlers[ticket.id].onValidationChange
                    }
                    ticketName={ticket.name}
                  />
                )}
              </div>
            );
          }

          return (

            <TicketItem
              mode={MODE.EDIT}
              key={ticket.id}
              ticket={ticket}
              quantity={ticketQuantities[ticket.id] || 0}
              onQuantityChange={handleQuantityChange}
              maxQuantity={getMaxQuantityForTicket(ticket)}
              disabled={isTicketDisabled(ticket)}
            />
          );
        })}
      </div>
      <div className="booking-button">
        <button
          className={`btn send-btn ${isNextButtonDisabled ? 'disabled' : ''}`}
          disabled={isNextButtonDisabled}
          onClick={handleNextStep}
        >
          下一步
        </button>
        <button
          className="btn cancel-btn"
          onClick={() => navigate(ROUTES.HOME)}
        >
          返回票券系統
        </button>
      </div>

      <WarnDialog
        isOpen={isWarnDialogOpen}
        onClose={() => setIsWarnDialogOpen(false)}
        onConfirm={() => setIsWarnDialogOpen(false)}
        message={`團體票需滿 ${minTickets} 張才可下單（不含租借口譯機）。`}
      />
    </div>
  );
};
