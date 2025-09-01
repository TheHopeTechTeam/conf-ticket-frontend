// 路由常數
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  PROFILE: '/profile',
  MAIN: '/main',
  BOOKING: '/booking',
  TICKETS: '/tickets',
  PAYMENT: '/payment',
  REFUND: '/refund',
  TICKET_DISTRIBUTION: '/ticket-distribution',
} as const;

// 路由類型
export type RouteType = (typeof ROUTES)[keyof typeof ROUTES];
