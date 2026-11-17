import React from 'react';
import './SuccessOrError.scss';
import { STATUS } from '../../../constants/common';

interface SuccessOrErrorProps {
  /** pending：結果不明（例如付款結果確認中），顯示警示圖示，主要按鈕用 success 系列 props，並顯示返回按鈕 */
  type?: 'success' | 'error' | 'pending';
  message?: string;
  useList?: boolean;
  titlePrefix?: string;
  successText?: string;
  errorText?: string;
  pendingText?: string;
  successButtonText?: string;
  retryButtonText?: string;
  backButtonText?: string;
  onSuccessClick?: () => void;
  onRetryClick?: () => void;
  onBackClick?: () => void;
  hideButtons?: boolean;
}

const ICONS = {
  [STATUS.SUCCESS]: '/images/success.svg',
  [STATUS.ERROR]: '/images/error.svg',
  [STATUS.PENDING]: '/images/warn.svg',
} as const;

export const SuccessOrError: React.FC<SuccessOrErrorProps> = ({
  type = STATUS.SUCCESS,
  message = '',
  useList = false,
  titlePrefix = '退票',
  successText = '成功',
  errorText = '失敗',
  pendingText = '確認中',
  successButtonText = '返回票券系統',
  retryButtonText = '再試一次',
  backButtonText = '返回票券系統',
  onSuccessClick,
  onRetryClick,
  onBackClick,
  hideButtons = false,
}) => {
  const isError = type === STATUS.ERROR;
  const titleText =
    type === STATUS.SUCCESS
      ? successText
      : type === STATUS.PENDING
        ? pendingText
        : errorText;

  return (
    <div className="success-error-container">
      <div className="success-error-content-container">
        <img src={ICONS[type]} alt="" className="success-error-icon" />
        <h1 className="success-error-title">
          {titlePrefix}
          {titleText}
        </h1>
        {useList ? (
          <ul
            className="success-error-list"
            dangerouslySetInnerHTML={{
              __html: message
                ? message
                    .split('<br/>')
                    .map(item => item.trim())
                    .filter(item => item)
                    .map(item => `<li>${item.replace(/^[•\-\*]\s*/, '')}</li>`)
                    .join('')
                : '',
            }}
          />
        ) : (
          <div
            className="success-error-content"
            dangerouslySetInnerHTML={{
              __html: message ? message.replace(/\n/g, '<br />') : '',
            }}
          />
        )}
      </div>
      {!hideButtons && (
        <div className="success-error-btn-container">
          <button
            className="btn send-btn"
            onClick={isError ? onRetryClick : onSuccessClick}
          >
            {isError ? retryButtonText : successButtonText}
          </button>
          {type !== STATUS.SUCCESS && (
            <button className="btn cancel-btn" onClick={onBackClick}>
              {backButtonText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
