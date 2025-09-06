import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../api/fetchService';
import { GroupPassForm } from '../../components/common/GroupPassForm/GroupPassForm';
import { TicketItem } from '../../components/common/TicketItem/TicketItem';
import { MODE } from '../../constants/common';
import { ROUTES } from '../../constants/routes';
import { TicketInfo } from '../../constants/tickets';
import './Booking.scss';
interface TicketQuantities {
  [key: string]: number;
}

interface GroupPassFormData {
  name: string;
  email: string;
  church: string;
  phone: string;
}

interface TicketFormData {
  [ticketId: string]: GroupPassFormData[];
}

interface TicketValidationState {
  [ticketId: string]: boolean;
}

export const Booking: React.FC = () => {
  const navigate = useNavigate();
  const [ticketTypes, setTicketTypes] = useState<TicketInfo[]>([]);

  // 載入票券類型
  useEffect(() => {
    const loadTicketTypes = async () => {
      try {
        const { docs } = await apiService.ticketsTypes.getTicketsTypes();

        setTicketTypes(docs.map((ticket: TicketInfo) => ({
          id: ticket.id,
          name: ticket.name,
          price: ticket.price,
          image: ticket.image,
          caption: ticket.caption || '',
          description: ticket.description || [],
          isMemberInfoRequired: Boolean(ticket.isMemberInfoRequired),
        })));

      } catch (error) {
        console.error('載入票券類型失敗:', error);
      }
    };

    loadTicketTypes();
  }, []);

  // 初始化時檢查是否有儲存的資料（從 sessionStorage）
  const initializeFromStorage = () => {
    const storedData = sessionStorage.getItem('ticketOrderData');
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        const quantities: TicketQuantities = {};
        const formData: TicketFormData = {};

        // 從儲存的票券資料重建數量狀態
        data.tickets.forEach((ticket: any) => {
          quantities[ticket.id] = ticket.selectedQuantity;
        });

        // 還原表單資料（如果存在且是對象格式）
        if (data.groupPassFormData && typeof data.groupPassFormData === 'object') {
          Object.keys(data.groupPassFormData).forEach(ticketId => {
            if (Array.isArray(data.groupPassFormData[ticketId])) {
              formData[ticketId] = data.groupPassFormData[ticketId];
            }
          });
        }

        return {
          quantities,
          formData,
        };
      } catch (error) {
        console.error('解析儲存資料失敗:', error);
      }
    }

    // 預設值
    return {
      quantities: {},
      formData: {},
    };
  };

  const initialData = initializeFromStorage();

  const [ticketQuantities, setTicketQuantities] = useState<TicketQuantities>(
    initialData.quantities
  );

  const [ticketFormData, setTicketFormData] = useState<TicketFormData>(
    initialData.formData
  );
  const [ticketValidationStates, setTicketValidationStates] = useState<TicketValidationState>({});

  // 監控表單有效性
  React.useEffect(() => {
    // console.log('表單驗證狀態:', ticketValidationStates);
  }, [ticketValidationStates]);

  const handleQuantityChange = (ticketId: string, quantity: number) => {
    setTicketQuantities(prev => ({
      ...prev,
      [ticketId]: quantity,
    }));
  };

  const handleFormDataChange = useCallback((ticketId: string, index: number, formData: GroupPassFormData) => {
    setTicketFormData(prev => {
      const currentTicketData = prev[ticketId] || [];
      const updatedData = [...currentTicketData];
      updatedData[index] = formData;

      return {
        ...prev,
        [ticketId]: updatedData
      };
    });
  }, []);

  const handleValidationChange = useCallback((ticketId: string, isValid: boolean) => {
    setTicketValidationStates(prev => ({
      ...prev,
      [ticketId]: isValid
    }));
  }, []);

  // 為每個票券創建穩定的回調函數
  const ticketHandlers = useMemo(() => {
    const handlers: {
      [ticketId: string]: {
        onFormDataChange: (index: number, formData: GroupPassFormData) => void;
        onValidationChange: (isValid: boolean) => void;
      }
    } = {};

    ticketTypes.forEach(ticket => {
      if (ticket.isMemberInfoRequired) {
        handlers[ticket.id] = {
          onFormDataChange: (index: number, formData: GroupPassFormData) =>
            handleFormDataChange(ticket.id, index, formData),
          onValidationChange: (isValid: boolean) =>
            handleValidationChange(ticket.id, isValid)
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
    // 將票券資訊存入 sessionStorage
    sessionStorage.setItem('ticketOrderData', JSON.stringify(ticketInfo));

    // 導航到付款頁面
    navigate(ROUTES.PAYMENT);
  };

  // 檢查所有需要會員資訊的票券的表單是否都有效
  const areAllFormsValid = () => {
    const memberInfoRequiredTickets = ticketTypes.filter(ticket => ticket.isMemberInfoRequired);
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
      <h1>選擇票券類型與數量</h1>
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
                    onFormDataChange={ticketHandlers[ticket.id].onFormDataChange}
                    onValidationChange={ticketHandlers[ticket.id].onValidationChange}
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

