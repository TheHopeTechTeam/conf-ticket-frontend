import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import './Header.scss';

export const Header = () => {
  const navigate = useNavigate();
  // local storage 裡是否有 auth_token
  const token = localStorage.getItem('auth_token');

  const handleClick = () => {
    if (token) {
      // 登出：移除 token 並導向登入頁面
      localStorage.removeItem('auth_token');
      navigate(ROUTES.LOGIN);
    } else {
      // 前往票券系統：導向 main 頁面
      navigate(ROUTES.MAIN);
    }
  };

  return (
    <>
      <header className="header">
        <img
          src="/images/logo.png"
          alt=""
          onClick={() => navigate(ROUTES.MAIN)}
          className="cursor-pointer"
        />
        <p onClick={handleClick} className="cursor-pointer">
          {token ? '登出' : '前往票券系統'}
        </p>
      </header>
    </>
  );
};
