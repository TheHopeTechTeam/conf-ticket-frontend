import React from 'react';
import './Layout.scss';
import { Footer } from '../Footer/Footer';
import { Header } from '../Header/Header';
import { BreadCrumbs } from '../BreadCrumbs/BreadCrumbs';
import { ProtectedRoute } from '../ProtectedRoute/ProtectedRoute';

interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  showBreadCrumbs?: boolean;
  className?: string;
  requireAuth?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  showHeader = true,
  showFooter = true,
  showBreadCrumbs = false,
  className = '',
  requireAuth = true,
}) => {
  const content = (
    <div className={`layout ${className}`}>
      {showHeader && <Header />}
      {showBreadCrumbs && <BreadCrumbs />}
      <main className={`main ${showBreadCrumbs ? 'with-breadcrumbs' : ''}`}>{children}</main>
      {showFooter && <Footer />}
    </div>
  );

  return requireAuth ? <ProtectedRoute>{content}</ProtectedRoute> : content;
};
