import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Layout } from './components/common/Layout/Layout';
import { Booking } from './pages/Booking/Booking';
import { Login } from './pages/Login/Login';
import { Main } from './pages/Main/Main';
import { Profile } from './pages/Profile/Profile';
import { Tickets } from './pages/Tickets/Tickets';
import { Refund } from './pages/Refund/Refund';
import { TicketDistribution } from './pages/TicketDistribution/TicketDistribution';
import { Payment } from './pages/Payment/Payment';
import { ROUTES } from './constants/routes';

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* 不需要認證的路由 */}
        <Route
          path={ROUTES.LOGIN}
          element={
            <Layout requireAuth={false}>
              <Login />
            </Layout>
          }
        />

        {/* 需要認證的路由 */}
        <Route path={ROUTES.HOME} element={<Layout><Main /></Layout>} />
        <Route path={ROUTES.BOOKING} element={<Layout><Booking /></Layout>} />
        <Route path={ROUTES.TICKETS} element={<Layout showBreadCrumbs={true}><Tickets /></Layout>} />
        <Route path={ROUTES.PAYMENT} element={<Layout><Payment /></Layout>} />
        <Route path={ROUTES.PROFILE} element={<Layout><Profile /></Layout>} />
        <Route path={ROUTES.REFUND} element={<Layout><Refund /></Layout>} />
        <Route path={ROUTES.TICKET_DISTRIBUTION} element={<Layout><TicketDistribution /></Layout>} />
        
        {/* 捕獲所有未匹配的路由，重定向到首頁 */}
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
