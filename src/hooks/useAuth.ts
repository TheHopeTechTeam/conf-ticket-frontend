import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../api/fetchService';
import { ROUTES } from '../constants/routes';

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: any | null;
  memberData: any | null; // 完整的 members API response
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    user: null,
    memberData: null,
    error: null,
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [location.pathname]);

  const checkAuth = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      // 只對 conf-ticket 路徑執行認證檢查
      const protectedRoutes = Object.values(ROUTES);
      const currentPath = location.pathname;
      const needsAuth = protectedRoutes.includes(currentPath as any) && currentPath !== ROUTES.LOGIN;

      if (!needsAuth) {
        // 不需要認證的路徑，直接設為已驗證狀態
        setAuthState({
          isLoading: false,
          isAuthenticated: true,
          user: null,
          memberData: null,
          error: null,
        });
        return;
      }

      // 檢查是否有 token
      const token = localStorage.getItem('token');
      if (!token) {
        // 沒有 token，直接導向登入頁
        navigate(ROUTES.LOGIN);
        return;
      }

      // 有 token，打 getMembers API 驗證
      const response = await apiService.members.getMembers();

      if (response && response.docs && response.docs.length > 0) {
        // 驗證成功
        setAuthState({
          isLoading: false,
          isAuthenticated: true,
          user: response.docs[0],
          memberData: response, // 儲存完整的 API response
          error: null,
        });
      } else {
        // API 回應無效，清除 token 並導向登入
        localStorage.removeItem('token');
        navigate(ROUTES.LOGIN);
      }
    } catch (error) {
      console.error('Auth check failed:', error);

      // API 錯誤，清除 token 並導向登入
      localStorage.removeItem('token');
      setAuthState({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        memberData: null,
        error: 'Authentication failed',
      });
      navigate(ROUTES.LOGIN);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({
      isLoading: false,
      isAuthenticated: false,
      user: null,
      memberData: null,
      error: null,
    });
    navigate(ROUTES.LOGIN);
  };

  return {
    ...authState,
    checkAuth,
    logout,
  };
};
