import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiService } from '../api';
import { ROUTES } from '../constants/routes';
import { useLoading } from '../contexts/LoadingContext';

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: any | null;
  memberData: any | null; // 完整的 members API response
  vip: boolean; // 是否有 VIP 權限（來源：member API 的 meta.vip）
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    user: null,
    memberData: null,
    vip: false,
    error: null,
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    checkAuth();
  }, [location.pathname]);

  const checkAuth = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      // 只對 conf-ticket 路徑執行認證檢查
      const protectedRoutes = Object.values(ROUTES);
      const currentPath = location.pathname;
      const needsAuth =
        protectedRoutes.includes(currentPath as any) &&
        currentPath !== ROUTES.LOGIN;

      if (!needsAuth) {
        // 不需要認證的路徑，直接設為已驗證狀態
        setAuthState({
          isLoading: false,
          isAuthenticated: true,
          user: null,
          memberData: null,
          vip: false,
          error: null,
        });
        return;
      }

      // 檢查是否有 token
      const token = localStorage.getItem('token');
      if (!token) {
        // 沒有 token，直接導向登入頁
        navigate(ROUTES.Introduction);
        return;
      }

      showLoading();
      // 有 token，打 getMember API 驗證
      const response = await apiService.members.getMember();

      if (response && response.docs && response.docs.length > 0) {
        hideLoading();

        // 檢查是否有 name，如果沒有則導向 PROFILE 頁面
        if (!response.docs[0].name && currentPath !== ROUTES.PROFILE) {
          navigate(ROUTES.PROFILE);
        }

        // 驗證成功
        setAuthState({
          isLoading: false,
          isAuthenticated: true,
          user: response.docs[0],
          memberData: response, // 儲存完整的 API response
          vip: response.docs[0].meta?.vip || false,
          error: null,
        });
      }
    } catch (error) {
      hideLoading();
      console.error('Auth check failed:', error);

      // API 錯誤，清除 token 並導向登入
      localStorage.removeItem('token');
      setAuthState({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        memberData: null,
        vip: false,
        error: 'Authentication failed',
      });
      navigate(ROUTES.Introduction);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({
      isLoading: false,
      isAuthenticated: false,
      user: null,
      memberData: null,
      vip: false,
      error: null,
    });
    navigate(ROUTES.Introduction);
  };

  return {
    ...authState,
    checkAuth,
    logout,
  };
};
