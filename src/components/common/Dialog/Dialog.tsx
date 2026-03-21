import React from 'react';
import './Dialog.scss';

interface DialogProps {
  isShowButton?: boolean; // 是否顯示確認和取消按鈕
  isOpen: boolean;
  onClose: () => void;
  title1?: string;
  title2?: string;
  children: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCloseButton?: boolean;
  className?: string;
  contentClassName?: string;
  requireScrollToBottom?: boolean; // 新增：是否需要滾動到底部才能確認
  isShowCancelButton?: boolean;
}

const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title1,
  title2,
  children,
  confirmText = '確認',
  cancelText = '取消',
  onConfirm,
  onCancel,
  showCloseButton = true,
  className = '',
  requireScrollToBottom = false,
  contentClassName = '',
  isShowButton = true, // 是否顯示確認和取消按鈕
  isShowCancelButton = true,
}) => {
  const [canConfirm, setCanConfirm] = React.useState(!requireScrollToBottom);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // 處理背景頁面滾動禁用
  React.useEffect(() => {
    if (isOpen) {
      // 禁止背景頁面滾動
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // 清理函數：恢復背景頁面滾動
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // 重置狀態當對話框開啟時
  React.useEffect(() => {
    if (isOpen) {
      // 確保內容從頂部開始顯示
      const element = contentRef.current;
      if (element) {
        element.scrollTop = 0;
      }

      if (requireScrollToBottom) {
        setCanConfirm(false);

        // 檢查是否需要滾動
        const checkScrollNeeded = () => {
          if (element) {
            const needsScroll = element.scrollHeight > element.clientHeight;
            // 如果內容不需要滾動，直接允許確認
            setCanConfirm(!needsScroll);
          }
        };

        // 延遲檢查確保DOM已渲染
        const timer = setTimeout(checkScrollNeeded, 100);
        return () => clearTimeout(timer);
      } else {
        setCanConfirm(true);
      }
    }
  }, [isOpen, requireScrollToBottom]);

  // 檢查是否滾動到底部
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!requireScrollToBottom) return;

    const element = e.currentTarget;
    const isAtBottom =
      Math.abs(
        element.scrollHeight - element.clientHeight - element.scrollTop
      ) < 5; // 5px 的容差值

    setCanConfirm(isAtBottom);
  };
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="dialog-overlay" onClick={handleOverlayClick}>
      <div className={`dialog-container ${className}`}>
        {/* 標題區域 */}
        <div className="dialog-header">
          <h1 className="dialog-title">{title1}</h1>
          <h1 className="dialog-title">{title2}</h1>
          {showCloseButton && (
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
          )}
        </div>

        {/* 內容區域 */}
        <div
          className={`dialog-content ${contentClassName}`}
          ref={contentRef}
          onScroll={handleScroll}
          style={{ marginBottom: isShowButton ? '0' : '40px' }}
        >
          {children}
        </div>

        {/* 按鈕區域 */}
        {isShowButton && (
          <div className="dialog-actions">
            <button
              className="btn send-btn"
              onClick={handleConfirm}
              disabled={!canConfirm}
            >
              {confirmText}
            </button>
            {isShowCancelButton && (
              <button className="btn cancel-btn" onClick={handleCancel}>
                {cancelText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dialog;
