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
}

export const TicketsCard: React.FC<TicketProps> = ({
  title,
  quantity,
  orderNumber,
  details,
  status,
}) => {
  const navigate = useNavigate();

  return (
    <div
      className={`ticket-card-container ${status === TICKET_STATUS.REFUNDED ? 'ticket-refund-card-container' : ''}`}
    >
      <div className="ticket-card-title">{title}</div>
      <div className="ticket-card-content">
        <img
          src="/images/ticket-sample.png"
          alt=""
          className="ticket-card-pic"
        />
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
              <p className="number">{orderNumber}</p>
            </div>
          </div>
        </div>
      </div>
      {status === TICKET_STATUS.PURCHASED && (
        <div className="ticket-card-btns">
          <div
            className="distribution"
            onClick={() =>
              navigate(ROUTES.TICKET_DISTRIBUTION, {
                state: {
                  ticketInfo: {
                    ticketType: title,
                    ticketCount: quantity,
                    orderNumber: orderNumber,
                    details: details,
                    status: status,
                    useDate: '2026.05.01-2026.05.03',
                  },
                },
              })
            }
          >
            <p className="text">前往分票</p>
            <img
              src="/images/white-arrow-right-icon.svg"
              alt=""
              className="arrow"
            />
          </div>
          <div className="refund">
            <p
              className="text"
              onClick={() =>
                navigate(ROUTES.REFUND, {
                  state: {
                    ticketInfo: {
                      ticketType: title,
                      ticketCount: quantity,
                      orderNumber: orderNumber,
                      details: details,
                      status: status,
                      useDate: '2026.05.01-2026.05.03',
                    },
                  },
                })
              }
            >
              申請退票
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
          <p className="refund-text">已於2026.04.30完成退票手續</p>
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

        {/* <div className="details-content">
          {details.map((detail, index) => (
            <div key={index} className="detail-item">
              <span className="text">{detail}</span>
            </div>
          ))}
        </div> */}
      </details>
    </div>
  );
};
