import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { TICKET_STATUS, TicketStatusType } from '../../../constants/tickets';
import { TicketStatusDialog } from '../Dialog/TicketStatusDialog';
import './TicketsCard.scss';

interface TicketsByStatus {
  undistributed: any[];
  distributedNotCollected: any[];
  distributedAndCollected: any[];
}

interface TicketProps {
  title: string;
  quantity: number;
  orderNumber: string;
  details: string[];
  status?: TicketStatusType;
  user: TicketsByStatus;
  ticketIds?: string[];
  updatedAt?: string;
  ticketTypeId?: string;
  ticketImageUrl?: string;
  hasDistributedTicket?: boolean;
  ticketCaption?: string;
}

export const TicketsCard: React.FC<TicketProps> = ({
  title,
  quantity,
  orderNumber,
  details,
  ticketCaption,
  status,
  user,
  ticketIds,
  updatedAt,
  ticketImageUrl = '/images/ticket-sample.png',
  hasDistributedTicket = false,
}) => {
  const navigate = useNavigate();
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

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
        <p>{title}</p>
        {status === TICKET_STATUS.PURCHASED && (
          <div
            onClick={() => setIsStatusDialogOpen(true)}
            style={{ cursor: 'pointer' }}
          >
            <div className="detail-btn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
              >
                <path
                  d="M6.41699 9.91699H7.58366V6.41699H6.41699V9.91699ZM7.00033 5.25033C7.1656 5.25033 7.30424 5.19433 7.41624 5.08233C7.52824 4.97033 7.58405 4.83188 7.58366 4.66699C7.58327 4.5021 7.52727 4.36366 7.41566 4.25166C7.30405 4.13966 7.1656 4.08366 7.00033 4.08366C6.83505 4.08366 6.6966 4.13966 6.58499 4.25166C6.47338 4.36366 6.41738 4.5021 6.41699 4.66699C6.4166 4.83188 6.4726 4.97052 6.58499 5.08291C6.69738 5.1953 6.83583 5.2511 7.00033 5.25033ZM7.00033 12.8337C6.19338 12.8337 5.43505 12.6804 4.72533 12.374C4.0156 12.0675 3.39824 11.652 2.87324 11.1274C2.34824 10.6028 1.93272 9.98544 1.62666 9.27533C1.3206 8.56521 1.16738 7.80688 1.16699 7.00033C1.1666 6.19377 1.31983 5.43544 1.62666 4.72533C1.93349 4.01521 2.34902 3.39785 2.87324 2.87324C3.39747 2.34863 4.01483 1.9331 4.72533 1.62666C5.43583 1.32021 6.19416 1.16699 7.00033 1.16699C7.80649 1.16699 8.56483 1.32021 9.27533 1.62666C9.98583 1.9331 10.6032 2.34863 11.1274 2.87324C11.6516 3.39785 12.0674 4.01521 12.3746 4.72533C12.6818 5.43544 12.8348 6.19377 12.8337 7.00033C12.8325 7.80688 12.6793 8.56521 12.374 9.27533C12.0687 9.98544 11.6532 10.6028 11.1274 11.1274C10.6016 11.652 9.98427 12.0677 9.27533 12.3746C8.56638 12.6814 7.80805 12.8344 7.00033 12.8337ZM7.00033 11.667C8.3031 11.667 9.40658 11.2149 10.3107 10.3107C11.2149 9.40658 11.667 8.3031 11.667 7.00033C11.667 5.69755 11.2149 4.59408 10.3107 3.68991C9.40658 2.78574 8.3031 2.33366 7.00033 2.33366C5.69755 2.33366 4.59408 2.78574 3.68991 3.68991C2.78574 4.59408 2.33366 5.69755 2.33366 7.00033C2.33366 8.3031 2.78574 9.40658 3.68991 10.3107C4.59408 11.2149 5.69755 11.667 7.00033 11.667Z"
                  fill="white"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
      <div className="ticket-card-content">
        <img src={ticketImageUrl} alt={title} className="ticket-card-pic" />
        <div className="ticket-card-info">
          <div className="ticket-card-info-time">
            <div className="ticket-card-info-start">
              <p className="year">2026</p>
              <div className="ticket-card-info-date">
                <p className="date">04.30</p>
                <div className="ticket-card-info-day">
                  <p>四</p>
                  <p>18:00</p>
                </div>
              </div>
            </div>
            <div className="ticket-card-info-line"></div>
            <div className="ticket-card-info-start">
              <p className="year">2026</p>
              <div className="ticket-card-info-date">
                <p className="date">05.02</p>
                <div className="ticket-card-info-day">
                  <p>六</p>
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
            <div
              className="ticket-card-info-oreder-number-item"
              onClick={() => {
                navigator.clipboard.writeText(orderNumber);
              }}
              style={{ cursor: 'pointer' }}
            >
              <p className="order-number">訂單編號</p>
              <p className="number">{orderNumber.slice(-8)}</p>
            </div>
          </div>
        </div>
      </div>
      {status === TICKET_STATUS.PURCHASED && (
        <div className="ticket-card-btns">
          <div
            className={`distribution ${user.distributedAndCollected.length === quantity ? 'distribution-disabled' : ''}`}
            onClick={() => {
              if (user.distributedAndCollected.length === quantity) return;

              // 將三種狀態的 tickets 合併成一個陣列，保持順序：未分出 > 已分出未取票 > 已分出已取票
              const allTickets = [
                ...user.distributedAndCollected,
                ...user.distributedNotCollected,
                ...user.undistributed,
              ];

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
                    tickets: allTickets,
                    useDate: '2026.04.30-2026.05.02',
                  },
                },
              });
            }}
          >
            <p className="text">前往分票/領票</p>
            {user.distributedAndCollected.length === quantity ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
              >
                <path
                  d="M6.72091 5.90195L7.67266 4.9502L11.7227 9.0002L7.67266 13.0502L6.72091 12.0984L9.81241 9.0002L6.72091 5.90195Z"
                  fill="#A5A9AB"
                />
                <circle
                  cx="9"
                  cy="9"
                  r="8.25"
                  stroke="#A5A9AB"
                  stroke-width="1.5"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
              >
                <path
                  d="M6.71993 5.90195L7.67168 4.9502L11.7217 9.0002L7.67168 13.0502L6.71993 12.0984L9.81143 9.0002L6.71993 5.90195Z"
                  fill="white"
                />
                <circle
                  cx="9"
                  cy="9"
                  r="8.25"
                  stroke="white"
                  stroke-width="1.5"
                />
              </svg>
            )}
          </div>
          <div
            className={`refund ${!canRefund() || hasDistributedTicket ? 'refund-disabled' : ''}`}
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
                        useDate: '2026.04.30-2026.05.02',
                      },
                    },
                  });
                }
              }}
            >
              申請退票
            </p>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
            >
              <path
                d="M6.71993 5.90195L7.67168 4.9502L11.7217 9.0002L7.67168 13.0502L6.71993 12.0984L9.81143 9.0002L6.71993 5.90195Z"
                fill={
                  !canRefund() || hasDistributedTicket ? '#C5CCD1' : 'white'
                }
              />
              <circle
                cx="9"
                cy="9"
                r="8.25"
                stroke={
                  !canRefund() || hasDistributedTicket ? '#C5CCD1' : 'white'
                }
                stroke-width="1.5"
              />
            </svg>
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
          <p className="details-content-caption">※{ticketCaption}</p>
          {details.map((detail, index) => (
            <div key={index} className="detail-item">
              <span className="text">{detail}</span>
            </div>
          ))}
        </div>
      </details>

      <TicketStatusDialog
        isOpen={isStatusDialogOpen}
        onClose={() => setIsStatusDialogOpen(false)}
        ticketType={title}
        totalCount={quantity}
        undistributedCount={user.undistributed?.length || 0}
        distributedNotActivatedCount={user.distributedNotCollected?.length || 0}
        distributedNotActivatedUsers={
          user.distributedNotCollected?.map(ticket => ({
            email: ticket.user?.email || '',
            status: 'pending' as const,
          })) || []
        }
        distributedActivatedCount={user.distributedAndCollected?.length || 0}
        distributedActivatedUsers={
          user.distributedAndCollected?.map(ticket => ({
            email: ticket.user?.email || '',
            status: 'active' as const,
          })) || []
        }
      />
    </div>
  );
};
