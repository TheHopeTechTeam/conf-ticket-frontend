import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GroupPassForm } from '../../components/common/GroupPassForm/GroupPassForm';
import { TicketItem } from '../../components/common/TicketItem/TicketItem';
import { ROUTES } from '../../constants/routes';
import { TICKET_TYPES } from '../../constants/tickets';
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

export const Booking: React.FC = () => {
  const navigate = useNavigate();

  // 初始化時檢查是否有儲存的資料（從 sessionStorage）
  const initializeFromStorage = () => {
    const storedData = sessionStorage.getItem('ticketOrderData');
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        const quantities: TicketQuantities = {};

        // 從儲存的票券資料重建數量狀態
        data.tickets.forEach((ticket: any) => {
          quantities[ticket.id] = ticket.selectedQuantity;
        });

        return {
          quantities,
          formData: data.groupPassFormData || [],
        };
      } catch (error) {
        console.error('解析儲存資料失敗:', error);
      }
    }

    // 預設值
    return {
      quantities: TICKET_TYPES.reduce((acc, ticket) => {
        acc[ticket.id] = 0;
        return acc;
      }, {} as TicketQuantities),
      formData: [],
    };
  };

  const initialData = initializeFromStorage();

  const [ticketQuantities, setTicketQuantities] = useState<TicketQuantities>(
    initialData.quantities
  );

  const [groupPassFormData, setGroupPassFormData] = useState<
    GroupPassFormData[]
  >(initialData.formData);

  const [isGroupFormValid, setIsGroupFormValid] = useState(false);

  // 監控群組表單有效性
  React.useEffect(() => {
    console.log('群組表單是否有效:', isGroupFormValid);
  }, [isGroupFormValid]);

  const handleQuantityChange = (ticketId: string, quantity: number) => {
    setTicketQuantities(prev => ({
      ...prev,
      [ticketId]: quantity,
    }));
  };

  const handleGroupPassFormChange = useCallback(
    (index: number, formData: GroupPassFormData) => {
      setGroupPassFormData(prev => {
        const updated = [...prev];
        updated[index] = formData;
        return updated;
      });
    },
    []
  );

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
        const ticket = TICKET_TYPES.find(t => t.id === ticketId);
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

    return {
      tickets: selectedTickets,
      groupPassFormData:
        groupPassQuantity > 0
          ? groupPassFormData.slice(0, groupPassQuantity)
          : [],
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

  const groupPassQuantity = ticketQuantities['group'] || 0;

  // 下一步按鈕禁用條件：
  // 1. 沒有選擇任何票券
  // 2. 有選擇群組票券但群組表單無效
  const isNextButtonDisabled =
    getTotalQuantity() === 0 || (groupPassQuantity > 0 && !isGroupFormValid);
  return (
    <div className="form-container booking-container">
      <h1>選擇票券類型與數量</h1>
      <div className="booking-content">
        {TICKET_TYPES.map(ticket => {
          if (ticket.isGroupPass) {
            return (
              <div key={ticket.id} className="booking-group-pass-item">
                <TicketItem
                  mode="edit"
                  ticket={ticket}
                  quantity={ticketQuantities[ticket.id] || 0}
                  onQuantityChange={handleQuantityChange}
                />
                <GroupPassForm
                  mode="edit"
                  quantity={groupPassQuantity}
                  formData={groupPassFormData}
                  onFormDataChange={handleGroupPassFormChange}
                  onValidationChange={setIsGroupFormValid}
                />
              </div>
            );
          }

          return (
            <TicketItem
              mode="edit"
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
