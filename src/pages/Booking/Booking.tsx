import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../api';
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
            bundleSize: ticket.bundleSize || 1,
            updatedBy: ticket.updatedBy,
            deletedAt: ticket.deletedAt,
            deletedBy: ticket.deletedBy,
            updatedAt: ticket.updatedAt,
            createdAt: ticket.createdAt,
            maxTickets: ticket.maxTickets,
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

  const handleNextStep = () => {
    const ticketInfo = getSelectedTickets();
    console.log(ticketInfo);

    // 檢查是否購買了多種不同類型的票券（翻譯機除外）
    const nonTranslationTickets: string[] = [];

    ticketInfo.tickets.forEach((ticket: any) => {
      // 如果票券名稱包含「翻譯機」或「Translation」，則跳過檢查
      const isTranslationTicket =
        ticket.name.includes('翻譯機') ||
        ticket.name.toLowerCase().includes('translation');

      if (!isTranslationTicket) {
        nonTranslationTickets.push(ticket.name);
      }
    });

    // 檢查是否有多種不同的票券類型
    const uniqueTicketTypes = [...new Set(nonTranslationTickets)];

    if (uniqueTicketTypes.length > 1) {
      alert(
        `不可同時購買多種不同類型的票券，目前選擇了：${uniqueTicketTypes.join('、')}`
      );
      return;
    }

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
    </div>
  );
};
