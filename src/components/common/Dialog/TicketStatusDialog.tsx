import React from 'react';
import './TicketStatusDialog.scss';

interface TicketUser {
  email: string;
  status: 'pending' | 'active';
}

interface TicketStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ticketType: string;
  totalCount: number;
  undistributedCount: number;
  distributedNotActivatedCount: number;
  distributedNotActivatedUsers: TicketUser[];
  distributedActivatedCount: number;
  distributedActivatedUsers: TicketUser[];
}

export const TicketStatusDialog: React.FC<TicketStatusDialogProps> = ({
  isOpen,
  onClose,
  ticketType,
  totalCount,
  undistributedCount,
  distributedNotActivatedCount,
  distributedNotActivatedUsers,
  distributedActivatedCount,
  distributedActivatedUsers,
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="dialog-overlay" onClick={handleOverlayClick}>
      <div className="ticket-status-dialog">
        <div className="ticket-header">
          <p className="ticket-type">{ticketType}</p>
          <span className="total-count">共 {totalCount} 張</span>
          <button className="dialog-close-btn" onClick={onClose}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M26.0015 7.84174L24.1597 6L16.0015 14.1712L7.84321 6L6.00146 7.84174L14.1727 16L6.00146 24.1583L7.84321 26L16.0015 17.8288L24.1597 26L26.0015 24.1583L17.8303 16L26.0015 7.84174Z"
                fill="black"
              />
            </svg>
          </button>
        </div>

        <div className="status-summary">
          {/* 未分票 */}
          {undistributedCount > 0 && (
            <div className="status-item">
              <span className="status-dot undistributed"></span>
              <div className="status-content">
                <div className="status-header">
                  <span className="label">未分票</span>
                  <span className="count">{undistributedCount} 張</span>
                </div>
              </div>
            </div>
          )}

          {/* 已分票未開通 */}
          {distributedNotActivatedCount > 0 && (
            <div className="status-item">
              <span className="status-dot distributed"></span>
              <div className="status-content">
                <div className="status-header">
                  <span className="label">已分票未開通</span>
                  <span className="count">
                    {distributedNotActivatedCount} 張
                  </span>
                </div>
                {distributedNotActivatedUsers.map((user, index) => (
                  <div key={index} className="user-item">
                    <p className="user-email">{user.email}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 已分票已開通 */}
          {distributedActivatedCount > 0 && (
            <div className="status-item">
              <span className="status-dot activated"></span>
              <div className="status-content">
                <div className="status-header">
                  <span className="label">已分票已開通</span>
                  <span className="count">{distributedActivatedCount} 張</span>
                </div>
                {distributedActivatedUsers.map((user, index) => (
                  <div key={index} className="user-item">
                    <p className="user-email">{user.email}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <p className="ticket-warn">
          此筆票券已進行過分票流程，故無法申請退票。
        </p>
      </div>
    </div>
  );
};
