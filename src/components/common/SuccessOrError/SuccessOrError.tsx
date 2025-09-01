import React from 'react';
import './SuccessOrError.scss';
import { STATUS } from '../../../constants/common';

interface SuccessOrErrorProps {
  type?: 'success' | 'error';
  message?: string;
  useList?: boolean;
  titlePrefix?: string;
  successText?: string;
  errorText?: string;
  successButtonText?: string;
  retryButtonText?: string;
  backButtonText?: string;
  onSuccessClick?: () => void;
  onRetryClick?: () => void;
  onBackClick?: () => void;
}

export const SuccessOrError: React.FC<SuccessOrErrorProps> = ({
  type = STATUS.SUCCESS,
  message = '',
  useList = false,
  titlePrefix = '退票',
  successText = '成功',
  errorText = '失敗',
  successButtonText = '返回票券系統',
  retryButtonText = '再試一次',
  backButtonText = '返回票券系統',
  onSuccessClick,
  onRetryClick,
  onBackClick,
}) => {
  return (
    <div className="success-error-container">
      <div className="success-error-content-container">
        <img
          src={`${type === STATUS.SUCCESS ? '/src/assets/images/success.svg' : '/src/assets/images/error.svg'}`}
          alt=""
          className="success-error-icon"
        />
        <h1 className="success-error-title">
          {titlePrefix}
          {type === STATUS.SUCCESS ? successText : errorText}
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
      <div className="success-error-btn-container">
        <button
          className="btn send-btn"
          onClick={type === STATUS.SUCCESS ? onSuccessClick : onRetryClick}
        >
          {type === STATUS.SUCCESS ? successButtonText : retryButtonText}
        </button>
        {type === STATUS.ERROR && (
          <button className="btn cancel-btn" onClick={onBackClick}>
            {backButtonText}
          </button>
        )}
      </div>
    </div>
  );
};
