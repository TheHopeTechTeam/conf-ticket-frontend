import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TicketsCard } from '../../components/common/TicketsCard/TicketsCard';
import { useAuthContext } from '../../contexts/AuthContext';
import { ROUTES } from '../../constants/routes';
import { TICKET_ALERT_MESSAGES, TICKET_STATUS, TicketStatusType } from '../../constants/tickets';
import './Tickets.scss';

export const Tickets = () => {
  const navigate = useNavigate();
  const { user, memberData } = useAuthContext(); // 取得用戶資料和完整的 API response
  const [activeStatus, setActiveStatus] = useState<TicketStatusType>(TICKET_STATUS.COLLECTED);

  // 現在您可以使用 memberData 中的所有資料
  console.log('Member Data:', memberData);
  console.log('User Info:', user);

  const allTickets: any = [
    {
      id: 1,
      title: "SPECIAL A PASS",
      startDate: "05.01",
      endDate: "05.03",
      startTime: "18:00",
      endTime: "21:30",
      quantity: 1,
      orderNumber: "1139475023",
      status: TICKET_STATUS.PURCHASED,
      details: [
        "特會全場次＆WORKSHOP＆特會影片（一個月線上觀看權限）",
        "5/2 與 Wade Joye 牧師午餐及 Live QA",
        "5/3 與 Pastors 午餐及 Live QA（與談牧者：高力豪牧師、周學正牧師、柳子駿牧師、葉豐軒牧師）"
      ]
    },
    {
      id: 2,
      title: "VIP PASS",
      startDate: "05.02",
      endDate: "05.03",
      startTime: "19:00",
      endTime: "22:00",
      quantity: 2,
      orderNumber: "1139475024",
      status: TICKET_STATUS.COLLECTED,
      details: [
        "特會全場次入場權限",
        "VIP 座位區域",
        "專屬休息區使用權"
      ]
    },
    {
      id: 3,
      title: "GENERAL PASS",
      startDate: "05.03",
      endDate: "05.03",
      startTime: "20:00",
      endTime: "21:30",
      quantity: 1,
      orderNumber: "1139475025",
      status: TICKET_STATUS.REFUNDED,
      details: [
        "特會當日入場權限",
        "一般座位區域"
      ]
    }
  ];

  // 根據當前狀態過濾票券
  const tickets = allTickets.filter((ticket: any) => ticket.status === activeStatus);

  // 票券狀態數據
  const ticketStatuses = [
    { key: TICKET_STATUS.PURCHASED, title: '已購買', count: allTickets.filter((t: any) => t.status === TICKET_STATUS.PURCHASED).length },
    { key: TICKET_STATUS.COLLECTED, title: '已取票', count: allTickets.filter((t: any) => t.status === TICKET_STATUS.COLLECTED).length },
    { key: TICKET_STATUS.REFUNDED, title: '退票紀錄', count: allTickets.filter((t: any) => t.status === TICKET_STATUS.REFUNDED).length },
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
    const messages = TICKET_ALERT_MESSAGES[activeStatus] || TICKET_ALERT_MESSAGES[TICKET_STATUS.COLLECTED];
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
            <img src="/src/assets/images/ticket-alert-dot.svg" alt="" />
            <p>貼心提醒</p>
          </div>
          <div className="ticket-alert-content">{getAlertContent()}</div>
        </div>
        <div className="tickets-content-container">
          {tickets.length === 0 ? (
            <>
              <img
                src="/src/assets/images/ticket-sample.png"
                alt=""
                className="ticket-pic"
              />
              <p>{noTicketText()}</p>
            </>
          ) : (
            <>
              {tickets.map((ticket: any) => (
                <TicketsCard
                  key={ticket.id}
                  title={ticket.title}
                  startDate={ticket.startDate}
                  endDate={ticket.endDate}
                  startTime={ticket.startTime}
                  endTime={ticket.endTime}
                  quantity={ticket.quantity}
                  orderNumber={ticket.orderNumber}
                  details={ticket.details}
                  status={ticket.status}
                />
              ))}
            </>
          )}
        </div>
        {tickets.length === 0 && (activeStatus === TICKET_STATUS.PURCHASED || activeStatus === TICKET_STATUS.COLLECTED) && (
          <div className="tickets-btn-container">
            {(activeStatus === TICKET_STATUS.PURCHASED || activeStatus === TICKET_STATUS.COLLECTED) && (
              <button className="btn send-btn" onClick={() => navigate(ROUTES.BOOKING)}>
                前往購票
              </button>
            )}
            {activeStatus === TICKET_STATUS.COLLECTED && (
              <button className="btn cancel-btn" onClick={() => navigate(ROUTES.MAIN)}>
                返回票券系統
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};