import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../api';
import { WarnDialog } from '../../components/common/Dialog/WarnDialog';
import { GroupPassForm } from '../../components/common/GroupPassForm/GroupPassForm';
import { TicketItem } from '../../components/common/TicketItem/TicketItem';
import { MODE } from '../../constants/common';
import { ROUTES } from '../../constants/routes';
import { TicketInfo } from '../../constants/tickets';
import { useLoading } from '../../contexts/LoadingContext';
import './Booking.scss';
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
  const [ticketTypes, setTicketTypes] = useState<TicketInfo[]>([]);

  // 載入票券類型
  useEffect(() => {
    const loadTicketTypes = async () => {
      try {
        showLoading('載入票券類型中...');
        const { docs } = await apiService.ticketsTypes.getTicketsTypes();

        setTicketTypes(
          docs.map((ticket: TicketInfo) => ({
            id: ticket.id,
            name: ticket.name,
            price: ticket.price,
            image: ticket.image,
            caption: ticket.caption || '',
            available: ticket.available || 0,
            description: ticket.description || [],
            isMemberInfoRequired: Boolean(ticket.isMemberInfoRequired),
          }))
        );
        hideLoading();
      } catch (error) {
        hideLoading();
        console.error('載入票券類型失敗:', error);
      }
    };

    loadTicketTypes();
  }, []);

  const [ticketQuantities, setTicketQuantities] = useState<TicketQuantities>(
    {}
  );

  const [ticketFormData, setTicketFormData] = useState<TicketFormData>({});
  const [ticketValidationStates, setTicketValidationStates] =
    useState<TicketValidationState>({});
  const [isWarnDialogOpen, setIsWarnDialogOpen] = useState(false);
  const [warnMessage, setWarnMessage] = useState('');

  const handleQuantityChange = (ticketId: string, quantity: number) => {
    setTicketQuantities(prev => ({
      ...prev,
      [ticketId]: quantity,
    }));
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

  const getSelectedTickets = () => {
    const selectedTickets = Object.entries(ticketQuantities)
      .filter(([, quantity]) => quantity > 0)
      .map(([ticketId, quantity]) => {
        const ticket = ticketTypes.find(t => t.id === ticketId);
        return {
          ...ticket,
          selectedQuantity: quantity,
          totalPrice: (ticket?.price || 0) * quantity,
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
        const formData = ticketFormData[ticket.id] || [];
        const validFormData: GroupPassFormData[] = [];

        for (let i = 0; i < quantity; i++) {
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

  const handleNextStep = async () => {
    const ticketInfo = getSelectedTickets();

    // 收集所有表單中的 email
    const emailsToCheck: string[] = [];
    Object.values(ticketInfo.groupPassFormData).forEach(formDataArray => {
      formDataArray.forEach(formData => {
        if (formData.email) {
          emailsToCheck.push(formData.email);
        }
      });
    });

    // 如果有 email 需要檢查，先檢查是否有重複資料
    if (emailsToCheck.length > 0) {
      try {
        showLoading('檢查會員資料中...');
        const response = await apiService.members.getMembers(emailsToCheck);

        // 找出不在資料庫中的 email（不符合資格的）
        const existingEmails =
          response.docs?.map((member: any) => member.email) || [];
        const invalidEmails = emailsToCheck.filter(
          email => !existingEmails.includes(email)
        );

        if (invalidEmails.length > 0) {
          // 有不符合資格的 email
          hideLoading();
          setWarnMessage(
            `以下 email 不屬於主任牧師 牧師 傳道 事工團隊領袖 神學生：${invalidEmails.join(', ')}`
          );
          setIsWarnDialogOpen(true);
          return; // 不繼續執行
        }
      } catch (error) {
        hideLoading();
        console.error('檢查會員資料失敗:', error);
        alert('檢查會員資料時發生錯誤，請稍後再試');
        return;
      }
    }

    // 沒有重複資料，繼續執行原本的邏輯
    hideLoading();

    // 導航到付款頁面，直接傳遞票券資訊
    navigate(ROUTES.PAYMENT, {
      state: { ticketOrderData: ticketInfo },
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

  // 下一步按鈕禁用條件：
  // 1. 沒有選擇任何票券
  // 2. 有選擇需要會員資訊的票券但表單無效
  const isNextButtonDisabled = getTotalQuantity() === 0 || !areAllFormsValid();

  return (
    <div className="form-container booking-container">
      <h1 className="booking-title">選擇票券類型與數量</h1>
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
                />
                {currentTicketQuantity > 0 && ticketHandlers[ticket.id] && (
                  <GroupPassForm
                    mode={MODE.EDIT}
                    quantity={currentTicketQuantity}
                    formData={ticketFormData[ticket.id] || []}
                    onFormDataChange={
                      ticketHandlers[ticket.id].onFormDataChange
                    }
                    onValidationChange={
                      ticketHandlers[ticket.id].onValidationChange
                    }
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
        message={warnMessage}
      />
    </div>
  );
};
