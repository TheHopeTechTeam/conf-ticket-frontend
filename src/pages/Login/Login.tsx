import { useEffect, useState } from 'react';
import { apiService } from '../../api/fetchService';
import './Login.scss';

const OTP_TIMER_KEY = 'otpTimerEndTime';
const EMAIL_KEY = 'loginEmail';
const TIMER_DURATION = 300; // 5分鐘

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

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
      setIsLoading(true);
      setEmailError('');

      const errorMsg = validateEmail(email);

      if (errorMsg) {
        setEmailError(errorMsg);
        return;
      }

      // 調用發送 OTP 的 API
      await apiService.memberAuthentication.postAuth({ email });

      // 成功後切換到 OTP 輸入階段
      setIsEmailSubmitted(true);
      localStorage.setItem(EMAIL_KEY, email);
      resetTimer();
    } catch (error: any) {
      console.error('發送 OTP 失敗:', error.message);
      setEmailError(error.message || '發送失敗，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  // 重新發送 email
  const handleResendOTP = async () => {
    if (timerSeconds > 0) return;
    try {
      setIsLoading(true);

      const response = await apiService.memberAuthentication.postAuth({
        email,
      });
      resetTimer();
      console.log('OTP 發送成功：', response);
    } catch (error: any) {
      console.error('重新發送失敗:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 格式化時間為 MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}分${remainingSeconds.toString().padStart(2, '0')}秒`;
  };

  // 重置計時器
  const resetTimer = () => {
    const endTime = Date.now() + TIMER_DURATION * 1000;
    localStorage.setItem(OTP_TIMER_KEY, endTime.toString());
    setTimerSeconds(TIMER_DURATION);
  };

  // 清除計時器（可在登入成功後調用）
  // const clearTimer = () => {
  //   localStorage.removeItem(OTP_TIMER_KEY);
  //   setTimerSeconds(0);
  // };

  // 根據狀態渲染不同的表單
  return (
    <div className="form-container login-form">
      {!isEmailSubmitted ? (
        // 第一階段：輸入 Email
        <form onSubmit={handleEmailSubmit}>
          <div className="form-block">
            <h1 className="mb-16">登入/註冊帳戶</h1>
            <p className="form-description">
              請輸入您的電子郵件地址，並按下「發送電子郵件」，您將收到來自conf@thehope.co寄送的一次性密碼。
            </p>
            <div className="form-label">
              <label htmlFor="email">電子郵件</label>
              <p className="label-invaild-text">必填</p>
            </div>
            <input
              id="email"
              className={`form-input ${emailError ? 'invalid' : 'valid'}`}
              type="email"
              placeholder="請輸入電子郵件"
              value={email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              disabled={isLoading}
              aria-label="請輸入電子郵件"
              aria-required
              required
            />
            {emailError && <p className="invaild-text">{emailError}</p>}
          </div>

          <div className="btn-container">
            <button className="btn send-btn" type="submit" disabled={isLoading}>
              發送電子郵件
            </button>
          </div>
        </form>
      ) : (
        // 第二階段：登入連結已發送
        <>
          <div className="form-block">
            <h1 className="mb-16">登入連結已發送</h1>
            <p className="form-description">
              系統已將登入連結寄至 {email}
              ，請前往您填寫的信箱，點擊信件中的連結登入票券系統。
            </p>
          </div>

          <div className="otp-actions">
            <p>沒有收到郵件？</p>
            <p
              className={`${timerSeconds > 0 ? 'disabled' : ''} resend-otp`}
              onClick={handleResendOTP}
            >
              {timerSeconds > 0
                ? `${formatTime(timerSeconds)}可重新發送`
                : '重新發送'}
            </p>
          </div>
        </>
      )}
    </div>
  );
};
