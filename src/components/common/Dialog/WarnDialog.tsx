import React from 'react';
import Dialog from './Dialog';

interface WarnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  isShowButton?: boolean;
  message?: string;
}

export const WarnDialog: React.FC<WarnDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isShowButton = true,
  message,
}) => {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      confirmText="返回"
      className="warn-dialog"
      contentClassName="p-0"
      onConfirm={onConfirm}
      isShowButton={isShowButton}
      isShowCancelButton={false}
      requireScrollToBottom={true}
    >
      <div className="warn-dialog-content">
        <div className="warn-dialog-header">
          <img className="warn-icon" src="/images/warn.svg" alt="" />
          <h1>提醒您</h1>
        </div>
        <div className="warn-dialog-info">
          {message && <p style={{ whiteSpace: 'pre-line' }}>{message}</p>}
        </div>
      </div>
    </Dialog>
  );
};
