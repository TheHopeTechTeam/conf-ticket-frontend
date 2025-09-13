import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import './Header.scss';

export const Header = () => {
  const navigate = useNavigate();
  // local storage 裡是否有 token
  const token = localStorage.getItem('token');

  const handleClick = () => {
    if (token) {
      // 登出：移除 token 並導向登入頁面
      localStorage.removeItem('token');
      navigate(ROUTES.LOGIN);
    } else {
      // 前往票券系統：導向 Home 頁面
      navigate(ROUTES.HOME);
    }
  };

  return (
    <>
      <header className="header">
        <img
          src="/images/logo.png"
          alt=""
          onClick={() => navigate(ROUTES.HOME)}
          className="cursor-pointer"
        />
        <p onClick={handleClick} className="cursor-pointer">
          {token ? '登出' : '前往票券系統'}
        </p>
      </header>
    </>
  );
};

