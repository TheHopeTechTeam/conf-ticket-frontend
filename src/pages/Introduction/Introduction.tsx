import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import './Introduction.scss';

export const Introduction: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="form-container introduction-container">
      <img
        src="/images/intro-banner.png"
        alt=""
        className="introduction-image"
      />
      <div className="introduction-content">
        <div className="introduction-title">
          <h1>
            The Hope Conference
            <br /> 2026《PRESENCE》
            <br /> 購票網站
          </h1>
        </div>
        <p className="introduction-text">
          在這為期三天的特會裡，你將會看見
          <br />
          無論我們來自哪裡，都能一起來到神的面前。
          <br />
          當我們對神夠坦誠，卸下逞強或質疑，
          <br />
          我們將一同見證美麗又令人敬畏的風景。
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
