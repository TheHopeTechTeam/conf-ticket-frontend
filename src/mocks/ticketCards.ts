// TicketCard 假資料

import { TICKET_STATUS } from '../constants/tickets';

// 已購買票券 - 早鳥票（未分票）
export const mockPurchasedTicket = {
  title: '早鳥票',
  quantity: 2,
  orderNumber: 'ORD-20260311-12345678',
  details: ['含特會全程參與資格', '2026.04.30(四) 18:00 - 2026.05.02(六) 21:30', '台北國際會議中心'],
  ticketCaption: '限量早鳥優惠',
  status: TICKET_STATUS.PURCHASED,
  user: {
    undistributed: [
      { id: 'ticket-1', status: 'undistributed' },
      { id: 'ticket-2', status: 'undistributed' },
    ],
    distributedNotCollected: [],
    distributedAndCollected: [],
  },
  ticketIds: ['ticket-1', 'ticket-2'],
  updatedAt: '2026-03-11T10:30:00.000Z',
  ticketImageUrl: '/images/ticket-sample.png',
  hasDistributedTicket: false,
  bundleSize: 1,
  ticketMeta: {},
};

// 已購買票券 - 部分已分票但未取票
export const mockPartiallyDistributedTicket = {
  title: '標準票',
  quantity: 4,
  orderNumber: 'ORD-20260310-87654321',
  details: ['含特會全程參與資格', '2026.04.30(四) 18:00 - 2026.05.02(六) 21:30', '台北國際會議中心'],
  ticketCaption: '一般票種',
  status: TICKET_STATUS.PURCHASED,
  user: {
    undistributed: [
      { id: 'ticket-5', status: 'undistributed' },
    ],
    distributedNotCollected: [
      {
        id: 'ticket-6',
        status: 'distributed',
        user: { email: 'user1@example.com' }
      },
      {
        id: 'ticket-7',
        status: 'distributed',
        user: { email: 'user2@example.com' }
      },
    ],
    distributedAndCollected: [
      {
        id: 'ticket-8',
        status: 'collected',
        user: { email: 'user3@example.com' }
      },
    ],
  },
  ticketIds: ['ticket-5', 'ticket-6', 'ticket-7', 'ticket-8'],
  updatedAt: '2026-03-10T15:20:00.000Z',
  ticketImageUrl: '/images/ticket-sample.png',
  hasDistributedTicket: true,
  bundleSize: 1,
  ticketMeta: {},
};

// 已購買票券 - 全部已分票且已取票
export const mockFullyCollectedTicket = {
  title: '教會優惠早鳥票',
  quantity: 12,
  orderNumber: 'ORD-20260309-11223344',
  details: ['含特會全程參與資格', '限教會團體購買', '2026.04.30(四) 18:00 - 2026.05.02(六) 21:30', '台北國際會議中心'],
  ticketCaption: '教會專屬優惠',
  status: TICKET_STATUS.PURCHASED,
  user: {
    undistributed: [],
    distributedNotCollected: [],
    distributedAndCollected: Array.from({ length: 12 }, (_, i) => ({
      id: `ticket-${i + 10}`,
      status: 'collected',
      user: { email: `church-member${i + 1}@example.com` }
    })),
  },
  ticketIds: Array.from({ length: 12 }, (_, i) => `ticket-${i + 10}`),
  updatedAt: '2026-03-09T09:00:00.000Z',
  ticketImageUrl: '/images/ticket-sample.png',
  hasDistributedTicket: true,
  bundleSize: 1,
  ticketMeta: {},
};

// 已取票 - 一般票券
export const mockCollectedTicket = {
  title: '早鳥票',
  quantity: 1,
  orderNumber: 'ORD-20260308-99887766',
  details: ['含特會全程參與資格', '2026.04.30(四) 18:00 - 2026.05.02(六) 21:30', '台北國際會議中心'],
  ticketCaption: '限量早鳥優惠',
  status: TICKET_STATUS.COLLECTED,
  user: {
    undistributed: [],
    distributedNotCollected: [],
    distributedAndCollected: [
      {
        id: 'ticket-100',
        status: 'collected',
        user: {
          email: 'john.doe@example.com',
          name: '王小明'
        }
      },
    ],
  },
  ticketIds: ['ticket-100'],
  updatedAt: '2026-03-08T14:30:00.000Z',
  ticketImageUrl: '/images/ticket-sample.png',
  hasDistributedTicket: false,
  bundleSize: 1,
  ticketMeta: {},
  ticketUserName: '王小明',
  ticketUserEmail: 'john.doe@example.com',
  ticketId: 'ticket-100',
};

// 已取票 - 口譯機（不應顯示「前往報到」按鈕）
export const mockCollectedInterpreterDevice = {
  title: '口譯機租借',
  quantity: 1,
  orderNumber: 'ORD-20260308-99887766',
  details: ['提供英語同步口譯', '請於報到時領取', '活動結束後歸還'],
  ticketCaption: '同步口譯設備',
  status: TICKET_STATUS.COLLECTED,
  user: {
    undistributed: [],
    distributedNotCollected: [],
    distributedAndCollected: [
      {
        id: 'interpreter-ticket-1',
        status: 'collected',
        user: {
          email: 'john.doe@example.com',
          name: '王小明'
        }
      },
    ],
  },
  ticketIds: ['interpreter-ticket-1'],
  updatedAt: '2026-03-08T14:30:00.000Z',
  ticketImageUrl: '/images/ticket-sample.png',
  hasDistributedTicket: false,
  bundleSize: 1,
  ticketMeta: {
    isAddon: true, // 標記為加購項目
  },
  ticketUserName: '王小明',
  ticketUserEmail: 'john.doe@example.com',
  ticketId: 'interpreter-ticket-1',
};

// 已退票
export const mockRefundedTicket = {
  title: '標準票',
  quantity: 3,
  orderNumber: 'ORD-20260305-55443322',
  details: ['含特會全程參與資格', '2026.04.30(四) 18:00 - 2026.05.02(六) 21:30', '台北國際會議中心'],
  ticketCaption: '一般票種',
  status: TICKET_STATUS.REFUNDED,
  user: {
    undistributed: [],
    distributedNotCollected: [],
    distributedAndCollected: [],
  },
  ticketIds: ['ticket-200', 'ticket-201', 'ticket-202'],
  updatedAt: '2026-03-05T16:45:00.000Z',
  ticketImageUrl: '/images/ticket-sample.png',
  hasDistributedTicket: false,
  bundleSize: 1,
  ticketMeta: {},
};

// 組合票券範例（套票）
export const mockBundleTicket = {
  title: '家庭套票',
  quantity: 8, // 2組 x 4人
  orderNumber: 'ORD-20260307-66554433',
  details: ['含特會全程參與資格', '4人為一組', '2026.04.30(四) 18:00 - 2026.05.02(六) 21:30', '台北國際會議中心'],
  ticketCaption: '家庭專屬優惠',
  status: TICKET_STATUS.PURCHASED,
  user: {
    undistributed: Array.from({ length: 8 }, (_, i) => ({
      id: `bundle-ticket-${i + 1}`,
      status: 'undistributed'
    })),
    distributedNotCollected: [],
    distributedAndCollected: [],
  },
  ticketIds: Array.from({ length: 8 }, (_, i) => `bundle-ticket-${i + 1}`),
  updatedAt: '2026-03-07T11:15:00.000Z',
  ticketImageUrl: '/images/ticket-sample.png',
  hasDistributedTicket: false,
  bundleSize: 4, // 4人一組
  ticketMeta: {},
};

// 所有假資料集合
export const mockTicketCards = [
  mockPurchasedTicket,
  mockPartiallyDistributedTicket,
  mockFullyCollectedTicket,
  mockCollectedTicket,
  mockCollectedInterpreterDevice,
  mockRefundedTicket,
  mockBundleTicket,
];
