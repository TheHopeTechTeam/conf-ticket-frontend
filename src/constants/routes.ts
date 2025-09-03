// 路由常數
export const ROUTES = {
  HOME: '/conf-ticket',
  LOGIN: '/conf-ticket/login',
  PROFILE: '/conf-ticket/profile',
  MAIN: '/conf-ticket/main',
  BOOKING: '/conf-ticket/booking',
  TICKETS: '/conf-ticket/tickets',
  PAYMENT: '/conf-ticket/payment',
  REFUND: '/conf-ticket/refund',
  TICKET_DISTRIBUTION: '/conf-ticket/ticket-distribution',
} as const;

// 路由常數
export const EXTRA_ROUTES = {
  MAIN_SITE: 'https://thehope.co/',
  FACEBOOK: 'https://www.facebook.com/insideTheHope',
  INSTAGRAM: 'https://www.instagram.com/thehope.co/',
  YOUTUBE: 'https://www.youtube.com/c/TheHopeTV',
} as const;

// 路由類型
export type RouteType = (typeof ROUTES)[keyof typeof ROUTES];
