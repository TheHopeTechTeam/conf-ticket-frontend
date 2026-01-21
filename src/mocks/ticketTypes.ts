// 票券假資料

// 一般票券（無 meta.discounts）
export const mockRegularTickets = [
  {
    id: 'regular-early-bird',
    name: '早鳥票',
    price: 1000,
    image: null,
    caption: '限量早鳥優惠',
    description: [{ text: '含特會全程參與資格' }],
    isMemberInfoRequired: false,
    bundleSize: 1,
    available: 100,
    maxTickets: 10,
    updatedBy: { id: 'admin', name: 'Admin' },
    deletedAt: null,
    deletedBy: null,
    updatedAt: '2024-01-01T00:00:00.000Z',
    createdAt: '2024-01-01T00:00:00.000Z',
    meta: {},
  },
  {
    id: 'regular-standard',
    name: '標準票',
    price: 1200,
    image: null,
    caption: '一般票種',
    description: [{ text: '含特會全程參與資格' }],
    isMemberInfoRequired: false,
    bundleSize: 1,
    available: 200,
    maxTickets: 10,
    updatedBy: { id: 'admin', name: 'Admin' },
    deletedAt: null,
    deletedBy: null,
    updatedAt: '2024-01-01T00:00:00.000Z',
    createdAt: '2024-01-01T00:00:00.000Z',
    meta: {},
  },
  {
    id: 'regular-late-bird',
    name: '晚鳥票',
    price: 1500,
    image: null,
    caption: '最後機會',
    description: [{ text: '含特會全程參與資格' }],
    isMemberInfoRequired: false,
    bundleSize: 1,
    available: 300,
    maxTickets: 10,
    updatedBy: { id: 'admin', name: 'Admin' },
    deletedAt: null,
    deletedBy: null,
    updatedAt: '2024-01-01T00:00:00.000Z',
    createdAt: '2024-01-01T00:00:00.000Z',
    meta: {},
  },
];

// 教會優惠票券（有 meta.discounts）
export const mockDiscountTickets = [
  {
    id: 'discount-early-bird',
    name: '教會優惠早鳥票',
    price: 700,
    image: null,
    caption: '教會專屬優惠',
    description: [{ text: '含特會全程參與資格' }, { text: '限教會團體購買' }],
    isMemberInfoRequired: false,
    bundleSize: 1,
    available: 100,
    maxTickets: 50,
    updatedBy: { id: 'admin', name: 'Admin' },
    deletedAt: null,
    deletedBy: null,
    updatedAt: '2024-01-01T00:00:00.000Z',
    createdAt: '2024-01-01T00:00:00.000Z',
    meta: {
      discounts: {
        id: '優惠1',
        condition: {
          gte: 12, // 最少購買 12 張
        },
      },
    },
  },
  {
    id: 'discount-standard',
    name: '教會優惠標準票',
    price: 840,
    image: null,
    caption: '教會專屬優惠',
    description: [{ text: '含特會全程參與資格' }, { text: '限教會團體購買' }],
    isMemberInfoRequired: false,
    bundleSize: 1,
    available: 200,
    maxTickets: 50,
    updatedBy: { id: 'admin', name: 'Admin' },
    deletedAt: null,
    deletedBy: null,
    updatedAt: '2024-01-01T00:00:00.000Z',
    createdAt: '2024-01-01T00:00:00.000Z',
    meta: {
      discounts: {
        id: '優惠1',
        condition: {
          gte: 12,
        },
      },
    },
  },
  {
    id: 'discount-late-bird',
    name: '教會優惠晚鳥票',
    price: 1050,
    image: null,
    caption: '教會專屬優惠',
    description: [{ text: '含特會全程參與資格' }, { text: '限教會團體購買' }],
    isMemberInfoRequired: false,
    bundleSize: 1,
    available: 300,
    maxTickets: 50,
    updatedBy: { id: 'admin', name: 'Admin' },
    deletedAt: null,
    deletedBy: null,
    updatedAt: '2024-01-01T00:00:00.000Z',
    createdAt: '2024-01-01T00:00:00.000Z',
    meta: {
      discounts: {
        id: '優惠1',
        condition: {
          gte: 12,
        },
      },
    },
  },
];

// 口譯機（兩種模式都會顯示）
export const mockInterpreterDevice = {
  id: 'interpreter-device',
  name: '口譯機租借',
  price: 200,
  image: null,
  caption: '同步口譯設備',
  description: [{ text: '提供英語同步口譯' }],
  isMemberInfoRequired: false,
  bundleSize: 1,
  available: 500,
  maxTickets: 100,
  updatedBy: { id: 'admin', name: 'Admin' },
  deletedAt: null,
  deletedBy: null,
  updatedAt: '2024-01-01T00:00:00.000Z',
  createdAt: '2024-01-01T00:00:00.000Z',
  meta: {
    isAddon: true,
  },
};

// 一般模式回傳（無 discounts 的票券 + 口譯機）
export const mockRegularTicketTypesResponse = {
  docs: [...mockRegularTickets, mockInterpreterDevice],
  totalDocs: 4,
  limit: 20,
  totalPages: 1,
  page: 1,
  pagingCounter: 1,
  hasPrevPage: false,
  hasNextPage: false,
  prevPage: null,
  nextPage: null,
};

// 優惠模式回傳（有 discounts 的票券 + 口譯機）
export const mockDiscountTicketTypesResponse = {
  docs: [...mockDiscountTickets, mockInterpreterDevice],
  totalDocs: 4,
  limit: 20,
  totalPages: 1,
  page: 1,
  pagingCounter: 1,
  hasPrevPage: false,
  hasNextPage: false,
  prevPage: null,
  nextPage: null,
};

// 所有票券（預設回傳）
export const mockAllTicketTypesResponse = {
  docs: [...mockRegularTickets, ...mockDiscountTickets, mockInterpreterDevice],
  totalDocs: 7,
  limit: 20,
  totalPages: 1,
  page: 1,
  pagingCounter: 1,
  hasPrevPage: false,
  hasNextPage: false,
  prevPage: null,
  nextPage: null,
};
