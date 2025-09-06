import React from 'react';
import { AuthProvider, useAuthContext } from '../../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRouteContent: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuthContext();

  // 如果已驗證，顯示子組件
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // 其他情況（會由 useAuth 自動導向登入頁）
  return null;
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  return (
    <AuthProvider>
      <ProtectedRouteContent>{children}</ProtectedRouteContent>
    </AuthProvider>
  );
};

