import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../api';
import { TicketsCard } from '../../components/common/TicketsCard/TicketsCard';
import { ROUTES } from '../../constants/routes';
import {
  TICKET_ALERT_MESSAGES,
  TICKET_STATUS,
  TicketStatusType,
} from '../../constants/tickets';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLoading } from '../../contexts/LoadingContext';
import './Tickets.scss';

export const Tickets = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext(); // 取得用戶資料和完整的 API response
  const [activeStatus, setActiveStatus] = useState<TicketStatusType>(
    TICKET_STATUS.COLLECTED
  );
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const { showLoading, hideLoading } = useLoading();

  // 根據狀態過濾票券的函數
  const getFilteredTickets = (orders: any[], status: TicketStatusType) => {
    // 從所有訂單中提取所有票券
    const allTickets = orders.flatMap(order => order.tickets || []);

    return allTickets.filter(ticket => {
      switch (status) {
        case TICKET_STATUS.PURCHASED:
          // 已購買：票券所屬訂單完成且票券未取票
          return ticket.order?.status === 'completed' && !ticket.isRedeemed;

        case TICKET_STATUS.COLLECTED:
          // 已取票：票券所屬訂單完成且票券已取票
          return (
            ticket.order?.status === 'completed' &&
            ticket.isRedeemed &&
            ticket.user?.id === user?.id
          );

        case TICKET_STATUS.REFUNDED:
          // 退款記錄：票券所屬訂單退款
          return ticket.order?.status === 'refunded';

        default:
          return false;
      }
    });
  };

  // 根據 order.id 和 ticket.type.id 分組票券的函數
  const groupTicketsByOrderAndType = (tickets: any[]): any[][] => {
    const grouped = tickets.reduce((groups: any, ticket: any) => {
      const orderId = ticket.order?.id || 'unknown';
      const typeId = ticket.type?.id || 'unknown';
      const groupKey = `${orderId}-${typeId}`;

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(ticket);
      return groups;
    }, {});

    return Object.values(grouped) as any[][];
  };

  // 初始化時調用 getTickets API
  useEffect(() => {
    const fetchTickets = async () => {
      if (user?.id) {
        try {
          showLoading('載入票券中...');
          const response = await apiService.orders.getOrders(user.id);
          hideLoading();
          const orders = response.docs || [];
          setAllOrders(orders);

          // 設定預設 Tab：若已購買有票券則跳到已購買，否則跳到已取票
          const purchasedTickets = getFilteredTickets(
            orders,
            TICKET_STATUS.PURCHASED
          );
          if (purchasedTickets.length > 0) {
            setActiveStatus(TICKET_STATUS.PURCHASED);
          } else {
            setActiveStatus(TICKET_STATUS.COLLECTED);
          }
        } catch (error) {
          hideLoading();
          console.error('Failed to fetch orders:', error);
          setAllOrders([]);
        }
      }
    };

    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // 票券狀態數據
  const ticketStatuses = [
    {
      key: TICKET_STATUS.PURCHASED,
      title: '已購買',
      count: getFilteredTickets(allOrders, TICKET_STATUS.PURCHASED).length,
    },
    {
      key: TICKET_STATUS.COLLECTED,
      title: '已取票',
      count: getFilteredTickets(allOrders, TICKET_STATUS.COLLECTED).length,
    },
    {
      key: TICKET_STATUS.REFUNDED,
      title: '退票紀錄',
      count: getFilteredTickets(allOrders, TICKET_STATUS.REFUNDED).length,
    },
  ];

  // 點擊處理函數
  const handleStatusClick = (statusKey: TicketStatusType) => {
    setActiveStatus(statusKey);
  };

  const noTicketText = () => {
    switch (activeStatus) {
      case TICKET_STATUS.PURCHASED:
        return '您尚未購買任何票券';
      case TICKET_STATUS.COLLECTED:
        return '您尚未持有任何票券';
      case TICKET_STATUS.REFUNDED:
        return '目前尚無退票紀錄';
      default:
        return '您尚未持有任何票券';
    }
  };

  const getAlertContent = () => {
    const messages =
      TICKET_ALERT_MESSAGES[activeStatus] ||
      TICKET_ALERT_MESSAGES[TICKET_STATUS.COLLECTED];
    return (
      <>
        {messages.lines.map((line, index) => (
          <span key={index}>
            {line}
            {index < messages.lines.length - 1 && <br />}
          </span>
        ))}
      </>
    );
  };

  // 組件邏輯
  return (
    <>
      <div className="tickets-container">
        <div className="tickets-header">
          <h1>我的票券</h1>
          <div className="ticket-header-status">
            {ticketStatuses.map(status => (
              <div
                key={status.key}
                className={`ticket-header-status-item ${activeStatus === status.key ? 'active' : ''}`}
                onClick={() => handleStatusClick(status.key)}
              >
                <p className="status-title">{status.title}</p>
                <div className="status-count-wrapper">
                  <p className="status-count">{status.count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="tickets-alert-container">
          <div className="ticket-alert-title">
            <img src="/images/ticket-alert-dot.svg" alt="" />
            <p>貼心提醒</p>
          </div>
          <div className="ticket-alert-content">{getAlertContent()}</div>
        </div>
        <div className="tickets-content-container">
          {(() => {
            const filteredTickets = getFilteredTickets(allOrders, activeStatus);
            const groupedTickets = groupTicketsByOrderAndType(filteredTickets);

            return filteredTickets.length === 0 ? (
              <>
                <img
                  src="/images/ticket-sample.png"
                  alt=""
                  className="ticket-pic"
                />
                <p>{noTicketText()}</p>
              </>
            ) : (
              <>
                {groupedTickets.map(
                  (ticketGroup: any[], groupIndex: number) => {
                    // 取得該票券組的基本資訊（從第一張票券取得）
                    const firstTicket = ticketGroup[0];
                    const order = firstTicket.order;
                    const ticketType = firstTicket.type;

                    // 取得 ticketGroup 裡的 id
                    const ticketIds = ticketGroup.map(ticket => ticket.id);

                    // 計算該票種的數量
                    const quantity = ticketGroup.length;

                    // 取得票券的詳細描述
                    const ticketDetails =
                      ticketType?.description?.map(
                        (desc: any) => desc.bulletpoint
                      ) || [];

                    return (
                      <TicketsCard
                        key={`${order?.id}-${ticketType?.id}-${groupIndex}`}
                        title={ticketType?.name || '票券'}
                        quantity={quantity}
                        orderNumber={order?.id || 'N/A'}
                        details={ticketDetails}
                        status={activeStatus}
                        ticketIds={ticketIds}
                        user={ticketGroup.map(ticket => ticket.user)}
                      />
                    );
                  }
                )}
              </>
            );
          })()}
        </div>
        {(() => {
          const filteredTickets = getFilteredTickets(allOrders, activeStatus);

          return (
            filteredTickets.length === 0 &&
            (activeStatus === TICKET_STATUS.PURCHASED ||
              activeStatus === TICKET_STATUS.COLLECTED)
          );
        })() && (
          <div className="tickets-btn-container">
            {(activeStatus === TICKET_STATUS.PURCHASED ||
              activeStatus === TICKET_STATUS.COLLECTED) && (
              <button
                className="btn send-btn m-b-16"
                onClick={() => navigate(ROUTES.BOOKING)}
              >
                前往購票
              </button>
            )}
          </div>
        )}
        <button
          className="btn cancel-btn"
          onClick={() => navigate(ROUTES.HOME)}
        >
          返回票券系統
        </button>
      </div>
    </>
  );
};
