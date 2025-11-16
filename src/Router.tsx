import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom';
import { Layout } from './components/common/Layout/Layout';
import { EXTRA_ROUTES, ROUTES } from './constants/routes';
import { LoadingProvider } from './contexts/LoadingContext';
import { ErrorProvider } from './contexts/ErrorContext';
import { Booking } from './pages/Booking/Booking';
import { Login } from './pages/Login/Login';
import { Main } from './pages/Main/Main';
import { Payment } from './pages/Payment/Payment';
import { Profile } from './pages/Profile/Profile';
import { Refund } from './pages/Refund/Refund';
import { TicketDistribution } from './pages/TicketDistribution/TicketDistribution';
import { Tickets } from './pages/Tickets/Tickets';
import { ScrollToTop } from './components/common/ScrollToTop/ScrollToTop';
import { Introduction } from './pages/Introduction/Introduction';

const ExternalRedirect = ({ url }: { url: string }) => {
  window.location.href = url;
  return <div>Redirecting...</div>;
};

const AppRouter = () => {
  return (
    <ErrorProvider>
      <LoadingProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* 根路徑 - 導向外部網站 */}
            <Route
              path="/"
              element={<ExternalRedirect url={EXTRA_ROUTES.MAIN_SITE} />}
            />

            {/* 不需要認證的路由 */}
            <Route
              path={ROUTES.LOGIN}
              element={
                <Layout requireAuth={false}>
                  <Login />
                </Layout>
              }
            />

            {/* 不需要認證的路由 */}
            <Route
              path={ROUTES.Introduction}
              element={
                <Layout requireAuth={false}>
                  <Introduction />
                </Layout>
              }
            />

            {/* 需要認證的路由 */}
            <Route
              path={ROUTES.HOME}
              element={
                <Layout>
                  <Main />
                </Layout>
              }
            />
            <Route
              path={ROUTES.BOOKING}
              element={
                <Layout showBreadCrumbs={true}>
                  <Booking />
                </Layout>
              }
            />
            <Route
              path={ROUTES.TICKETS}
              element={
                <Layout showBreadCrumbs={true}>
                  <Tickets />
                </Layout>
              }
            />
            <Route
              path={ROUTES.PAYMENT}
              element={
                <Layout showBreadCrumbs={true}>
                  <Payment />
                </Layout>
              }
            />
            <Route
              path={ROUTES.PROFILE}
              element={
                <Layout showBreadCrumbs={true}>
                  <Profile />
                </Layout>
              }
            />
            <Route
              path={ROUTES.REFUND}
              element={
                <Layout showBreadCrumbs={true}>
                  <Refund />
                </Layout>
              }
            />
            <Route
              path={ROUTES.TICKET_DISTRIBUTION}
              element={
                <Layout showBreadCrumbs={true}>
                  <TicketDistribution />
                </Layout>
              }
            />

            {/* 捕獲所有未匹配的路由，重定向到首頁 */}
            <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
          </Routes>
        </Router>
      </LoadingProvider>
    </ErrorProvider>
  );
};

export default AppRouter;
