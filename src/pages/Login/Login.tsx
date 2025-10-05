import { useEffect, useState } from 'react';
import { apiService } from '../../api';
import './Login.scss';
import { useLoading } from '../../contexts/LoadingContext';
import { MAIL } from '../../constants/common';

const OTP_TIMER_KEY = 'otpTimerEndTime';
const EMAIL_KEY = 'loginEmail';
const TIMER_DURATION = 60; // 1分鐘

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const { showLoading, hideLoading } = useLoading();

  // 初始化計時器和 email
  useEffect(() => {
    const savedEndTime = localStorage.getItem(OTP_TIMER_KEY);
    const savedEmail = localStorage.getItem(EMAIL_KEY);

    if (savedEmail) {
      setEmail(savedEmail);
    }

    if (savedEndTime) {
      const endTime = parseInt(savedEndTime);
      const now = Date.now();
      const remainingTime = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimerSeconds(remainingTime);

      // 根據計時器狀態設定 isEmailSubmitted
      if (remainingTime > 0) {
        setIsEmailSubmitted(true); // 時間還沒跑完，顯示已發送狀態
      } else {
        setIsEmailSubmitted(false); // 時間已跑完，顯示輸入 email 狀態
      }
    }
  }, []);

  useEffect(() => {
    if (timerSeconds <= 0) return;

    const interval = setInterval(() => {
      setTimerSeconds(prevSeconds => {
        if (prevSeconds <= 1) {
          // 計時結束，清除 localStorage 並切換到輸入 email 狀態
          localStorage.removeItem(OTP_TIMER_KEY);
          setIsEmailSubmitted(false);
          return 0;
        }
        return prevSeconds - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerSeconds]);

  // 必填驗證
  // Email 驗證 (結合必填和格式檢查)
  const validateEmail = (emailValue: string) => {
    if (!emailValue.trim()) {
      return '請輸入電子郵件';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      return '輸入格式錯誤';
    }

    return '';
  };

  // 輸入變更處理 - Email
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    // 即時驗證
    if (emailError) {
      const errorMsg = validateEmail(value);
      setEmailError(errorMsg);
    }
  };

  // Email blur 驗證
  const handleEmailBlur = () => {
    const errorMsg = validateEmail(email);
    setEmailError(errorMsg);
  };

  // 第一步：提交 Email，發送登入連結至信箱
  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setEmailError('');

      const errorMsg = validateEmail(email);

      if (errorMsg) {
        setEmailError(errorMsg);
        return;
      }

      showLoading('發送中...');
      // 調用發送 OTP 的 API
      await apiService.memberAuthentication.postAuth({ email });
      hideLoading();

      // 成功後切換到 OTP 輸入階段
      setIsEmailSubmitted(true);
      resetTimer();
    } catch (error: any) {
      hideLoading();
      console.error('發送 OTP 失敗:', error.message);
      setEmailError(error.message || '發送失敗，請稍後再試');
    } finally {
      hideLoading();
    }
  };

  // 重置計時器
  const resetTimer = () => {
    const endTime = Date.now() + TIMER_DURATION * 1000;
    localStorage.setItem(OTP_TIMER_KEY, endTime.toString());
    setTimerSeconds(TIMER_DURATION);
  };

  // 根據狀態渲染不同的表單
  return (
    <div className="form-container login-form">
      {!isEmailSubmitted ? (
        // 第一階段：輸入 Email
        <form onSubmit={handleEmailSubmit}>
          <div className="form-block">
            <h1 className="mb-16">登入/註冊帳戶</h1>
            <p className="form-description">
              請輸入您的電子郵件地址，並按下「發送電子郵件」，您將收到來自{MAIL.NOREPLAY_EMAIL}寄送的一次性密碼。
            </p>
            <div className="form-label">
              <label htmlFor="email">電子郵件</label>
            </div>
            <input
              id="email"
              className={`form-input ${emailError ? 'invalid' : 'valid'}`}
              type="email"
              placeholder="請輸入電子郵件"
              value={email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              aria-label="請輸入電子郵件"
              aria-required
              required
            />
            {emailError && <p className="invaild-text">{emailError}</p>}
          </div>

          <div className="btn-container">
            <button className="btn send-btn" type="submit">
              發送電子郵件
            </button>
          </div>
        </form>
      ) : (
        // 第二階段：登入連結已發送
        <>
          <div className="form-block">
            <h1 className="mb-16">登入連結已發送</h1>
            <div className="form-description-register">
              <p>
                系統已將登入連結寄至{' '}
                <span className="important-text">{email}</span>
                ，請前往您填寫的信箱，點擊信件中的連結登入票券系統。
              </p>
              <p>
                若未收到郵件，系統將於
                <span className="important-text">1分鐘</span>
                後自動回到上一頁，您可重新發送登入連結至您的電子郵件。
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
