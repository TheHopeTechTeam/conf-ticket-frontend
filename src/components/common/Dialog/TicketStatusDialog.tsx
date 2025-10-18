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
          <h3>{ticketType}</h3>
          <span className="total-count">共 {totalCount} 張</span>
          <button className="dialog-close-btn" onClick={onClose}>
            ✕
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
                <div className="undistributed-note">尚未分配給使用者</div>
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
                <div className="user-list">
                  {distributedNotActivatedUsers.map((user, index) => (
                    <div key={index} className="user-item">
                      <span className="user-icon">👤</span>
                      <span className="user-email">{user.email}</span>
                      <span className="user-status pending">待開通</span>
                    </div>
                  ))}
                </div>
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
                <div className="user-list">
                  {distributedActivatedUsers.map((user, index) => (
                    <div key={index} className="user-item">
                      <span className="user-icon">👤</span>
                      <span className="user-email">{user.email}</span>
                      <span className="user-status active">已開通</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
