import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationMessage } from '../../components/common/Notification/Notification';
import { ROUTES } from '../../constants/routes';
import './Main.scss';
import { STATUS } from '../../constants/common';

export const Main: React.FC = () => {
  const [showNotification, setShowNotification] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fromProfile = sessionStorage.getItem('fromProfile');

    if (fromProfile === 'true') {
      setShowNotification('true');
      // 立即清除標記
      sessionStorage.removeItem('fromProfile');
    }
  }, []);

  // 組件邏輯
  return (
    <>
      {showNotification && (
        <NotificationMessage
          status={STATUS.SUCCESS}
          text="您的個人檔案已儲存成功"
          onClose={() => setShowNotification('')}
        />
      )}
      <div className="main-container">
        <h1>票券系統</h1>
        <div className="main-buttons">
          <div
            className="button-block"
            onClick={() => navigate(ROUTES.BOOKING)}
          >
            <p>購買票券</p>
            <img src="/src/assets/images/black-arrow-right-icon.svg" alt="" />
          </div>
          <div
            className="button-block"
            onClick={() => navigate(ROUTES.TICKETS)}
          >
            <p>我的票券</p>
            <img src="/src/assets/images/black-arrow-right-icon.svg" alt="" />
          </div>
          <div
            className="button-block"
            onClick={() => navigate(ROUTES.PROFILE)}
          >
            <p>個人檔案</p>
            <img src="/src/assets/images/black-arrow-right-icon.svg" alt="" />
          </div>
        </div>
      </div>
    </>
  );
};
