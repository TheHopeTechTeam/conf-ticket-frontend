import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { TICKET_STATUS, TicketStatusType } from '../../../constants/tickets';
import './TicketsCard.scss';

interface TicketProps {
  title: string;
  quantity: number;
  orderNumber: string;
  details: string[];
  status?: TicketStatusType;
  user: any[];
  ticketIds?: string[];
  updatedAt?: string;
  ticketTypeId?: string;
  ticketImageUrl?: string;
  hasDistributedTicket?: boolean;
}

export const TicketsCard: React.FC<TicketProps> = ({
  title,
  quantity,
  orderNumber,
  details,
  status,
  user,
  ticketIds,
  updatedAt,
  ticketImageUrl = '/images/ticket-sample.png',
  hasDistributedTicket = false,
}) => {
  const navigate = useNavigate();

  // 格式化日期函數
  const formatRefundDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `已於 ${year}.${month}.${day} 完成退票手續`;
  };

  // 檢查是否可以退票（活動開始前十天不能退票）
  const canRefund = () => {
    const eventStartDate = new Date('2026-05-01');
    const today = new Date();
    const tenDaysBeforeEvent = new Date(eventStartDate);
    tenDaysBeforeEvent.setDate(eventStartDate.getDate() - 10);

    return today < tenDaysBeforeEvent;
  };

  return (
    <div
      className={`ticket-card-container ${status === TICKET_STATUS.REFUNDED ? 'ticket-refund-card-container' : ''}`}
    >
      <div className="ticket-card-title">
        {title}
        {status === TICKET_STATUS.PURCHASED && user?.length > 0 && (
          <p>
            {user.map((u, index) => (
              <React.Fragment key={u.id || index}>
                已分給 {u.email} 未取票
                {index < user.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        )}
      </div>
      <div className="ticket-card-content">
        <img src={ticketImageUrl} alt={title} className="ticket-card-pic" />
        <div className="ticket-card-info">
          <div className="ticket-card-info-time">
            <div className="ticket-card-info-start">
              <p className="year">2026</p>
              <div className="ticket-card-info-date">
                <p className="date">05.01</p>
                <div className="ticket-card-info-day">
                  <p>五</p>
                  <p>18:00</p>
                </div>
              </div>
            </div>
            <div className="ticket-card-info-line"></div>
            <div className="ticket-card-info-start">
              <p className="year">2026</p>
              <div className="ticket-card-info-date">
                <p className="date">05.03</p>
                <div className="ticket-card-info-day">
                  <p>日</p>
                  <p>21:30</p>
                </div>
              </div>
            </div>
          </div>
          <div className="ticket-card-info-quantity-order">
            <div className="ticket-card-info-quantity-item">
              <p className="quantity">張數</p>
              <p className="number">{quantity}</p>
            </div>
            <div className="ticket-card-info-oreder-number-item">
              <p className="order-number">訂單編號</p>
              <p className="number">{orderNumber.slice(-8)}</p>
            </div>
          </div>
        </div>
      </div>
      {status === TICKET_STATUS.PURCHASED && (
        <div className="ticket-card-btns">
          <div
            className="distribution"
            onClick={() => {
              navigate(ROUTES.TICKET_DISTRIBUTION, {
                state: {
                  ticketInfo: {
                    ticketType: title,
                    ticketCount: quantity,
                    orderNumber: orderNumber,
                    details: details,
                    status: status,
                    user: user,
                    ticketIds: ticketIds,
                    useDate: '2026.05.01-2026.05.03',
                  },
                },
              });
            }}
          >
            <p className="text">前往分票/領票</p>
            <img
              src="/images/white-arrow-right-icon.svg"
              alt=""
              className="arrow"
            />
          </div>
          <div
            className={`refund ${!canRefund() || hasDistributedTicket ? 'disabled' : ''}`}
          >
            <p
              className="text"
              onClick={() => {
                if (canRefund() && !hasDistributedTicket) {
                  navigate(ROUTES.REFUND, {
                    state: {
                      ticketInfo: {
                        ticketType: title,
                        ticketCount: quantity,
                        orderNumber: orderNumber,
                        details: details,
                        status: status,
                        user: user,
                        ticketIds: ticketIds,
                        useDate: '2026.05.01-2026.05.03',
                      },
                    },
                  });
                } else {
                  alert('活動開始前十天不開放退票');
                }
              }}
            >
              {hasDistributedTicket ? '已分票不可退' : '申請退票'}
            </p>
            <img
              src="/images/white-arrow-right-icon.svg"
              alt=""
              className="arrow"
            />
          </div>
        </div>
      )}
      {status === TICKET_STATUS.REFUNDED && (
        <div className="ticket-card-refund">
          <p className="refund-text">{formatRefundDate(updatedAt)}</p>
        </div>
      )}
      <details className="ticket-card-details">
        <summary>
          <span className="title">票券詳情</span>
          <svg
            className="icon plus"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <svg
            className="icon minus"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </summary>

        <div className="details-content">
          {details.map((detail, index) => (
            <div key={index} className="detail-item">
              <span className="text">{detail}</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
};
