import React, { useState, useEffect } from 'react';
import './Notification.scss';
import { STATUS } from '../../../constants/common';

interface NotificationProps {
  status?: 'success' | 'error' | 'warning' | 'info';
  text?: string;
  onClose?: () => void; // 可選的回調函數
}

export const NotificationMessage: React.FC<NotificationProps> = ({
  status = STATUS.SUCCESS,
  text = '您已成功註冊The Hope Conference票券系統會員。',
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // 5 秒後開始淡出
    const fadeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    // 淡出動畫完成後移除組件
    const removeTimer = setTimeout(() => {
      setShouldRender(false);
      onClose?.(); // 呼叫回調函數（如果有提供）
    }, 5300); // 多給 300ms 讓淡出動畫完成

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [onClose]);

  const getIcon = () => {
    switch (status) {
      case STATUS.SUCCESS:
        return <i className="success-icon" />;
      default:
        return null;
    }
  };

  if (!shouldRender) return null;

  return (
    <div className={`notification-container ${!isVisible ? 'fade-out' : ''}`}>
      {getIcon()}
      <p>{text}</p>
    </div>
  );
};
