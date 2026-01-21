import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationMessage } from '../../components/common/Notification/Notification';
import { RECRUIT_MESSAGES, STATUS } from '../../constants/common';
import { ROUTES } from '../../constants/routes';
import { useAuthContext } from '../../contexts/AuthContext';
import './Main.scss';

// 箭頭圖示組件
const ArrowIcon: React.FC = () => (
  <>
    <svg
      className="icon-default"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M8.96088 7.8691L10.2299 6.6001L15.6299 12.0001L10.2299 17.4001L8.96088 16.1311L13.0829 12.0001L8.96088 7.8691Z"
        fill="black"
      />
      <circle cx="12" cy="12" r="11" stroke="black" strokeWidth="2" />
    </svg>
    <svg
      className="icon-hover"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M8.96088 7.8691L10.2299 6.6001L15.6299 12.0001L10.2299 17.4001L8.96088 16.1311L13.0829 12.0001L8.96088 7.8691Z"
        fill="white"
      />
      <circle cx="12" cy="12" r="11" stroke="white" strokeWidth="2" />
    </svg>
  </>
);

// 按鈕配置
interface MainButton {
  label: string;
  route: string;
}

export const Main: React.FC = () => {
  const [showNotification, setShowNotification] = useState(false);
  const navigate = useNavigate();
  const { vip } = useAuthContext();

  // 根據 VIP 權限決定按鈕列表
  const MAIN_BUTTONS: MainButton[] = vip
    ? [
      { label: '購買教會團體票券', route: `${ROUTES.BOOKING}?discount=true` },
      { label: '購買一般票券', route: ROUTES.BOOKING },
      { label: '我的票券', route: ROUTES.TICKETS },
      { label: '個人檔案', route: ROUTES.PROFILE },
    ]
    : [
      { label: '購買票券', route: ROUTES.BOOKING },
      { label: '我的票券', route: ROUTES.TICKETS },
      { label: '個人檔案', route: ROUTES.PROFILE },
    ];

  useEffect(() => {
    // Print recruit message only once upon initial frontend load */
    RECRUIT_MESSAGES.forEach(message => {
      console.log(message);
    });

    const fromProfile = sessionStorage.getItem('fromProfile');

    if (fromProfile === 'true') {
      setShowNotification(true);
      sessionStorage.removeItem('fromProfile');
    }
  }, []);

  return (
    <>
      {showNotification && (
        <NotificationMessage
          status={STATUS.SUCCESS}
          text="您的個人檔案已儲存成功"
          onClose={() => setShowNotification(false)}
        />
      )}
      <div className="main-container">
        <h1>票券系統</h1>
        <div className="main-buttons">
          {MAIN_BUTTONS.map(button => (
            <div
              key={button.route}
              className="button-block"
              onClick={() => navigate(button.route)}
            >
              <p>{button.label}</p>
              <ArrowIcon />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
