import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import './Introduction.scss';

export const Introduction: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="form-container introduction-container">
      <img
        src="/images/intro-banner-2027.png"
        alt=""
        className="introduction-image"
      />
      <div className="introduction-content">
        <div className="introduction-title">
          <h1>
            The Hope 特會 2027
            <br />
            《Holy Spirit, You are Welcome Here》
            <br /> 購票網站
          </h1>
        </div>
        <p className="introduction-text">
          「Holy Spirit, You are Welcome Here」不只是一句口號，更是靈魂深處的呼求。在為期三天的特會中，我們不滿足於瞬間的感動，而是渴望看見「超自然的工作」轉化為「門徒生活的日常」。我們受邀放下過去的認知侷限或屬靈失望，以敬畏且全然敞開的心，重新建立與聖靈的親密連結。
        </p>
        <p className="introduction-text-second">
          為確保您有良好的特會體驗，接下來幾分鐘，需要先註冊此購票系統，來完成特會購票流程，以利特會當下報到使用。
        </p>
      </div>
      <div className="booking-button">
        <button
          className="btn send-btn"
          // 導到註冊頁面
          onClick={() => navigate(ROUTES.LOGIN)}
        >
          我知道了
        </button>
      </div>
    </div>
  );
};
