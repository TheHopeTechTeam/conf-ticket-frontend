import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EXTRA_ROUTES, ROUTES } from '../../../constants/routes';
import './Header.scss';

export const Header = () => {
  const navigate = useNavigate();
  // local storage 裡是否有 token
  const token = localStorage.getItem('token');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleClick = () => {
    if (token) {
      // 登出：移除 token 並導向登入頁面
      localStorage.removeItem('token');
      navigate(ROUTES.Introduction);
    } else {
      // 前往票券系統：導向 Home 頁面
      navigate(ROUTES.HOME);
    }
  };

  // 共用的導航項目
  const navItems = (
    <>
      <p
        className="cursor-pointer"
        onClick={() => (window.location.href = EXTRA_ROUTES.CONF2026)}
      >
        The Hope 特會
      </p>
      <p onClick={handleClick} className="cursor-pointer">
        {token ? '登出' : '登入購票系統'}
      </p>
    </>
  );

  return (
    <>
      <header className="header">
        <div className="header-top">
          <img
            src="/images/logo.svg?v=2"
            alt="The Hope Logo"
            onClick={() => (window.location.href = EXTRA_ROUTES.MAIN_SITE)}
            className="cursor-pointer"
          />
          {/* 手機版：768px 以下顯示 */}
          <div className="header-mobile">
            <button
              className={isMenuOpen ? '' : 'hamburger-btn'}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
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
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path d="M20 7H4V5H20V7Z" fill="black" />
                  <path d="M20 13H4V11H20V13Z" fill="black" />
                  <path d="M20 19H4V17H20V19Z" fill="black" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* 桌面版：768px 以上顯示 */}
        <div className="header-right">{navItems}</div>

        {/* 手機版選單 */}
        {isMenuOpen && <div className="mobile-menu">{navItems}</div>}
      </header>
    </>
  );
};
