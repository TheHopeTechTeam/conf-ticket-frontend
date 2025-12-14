import { MAIL } from './common';

export interface TicketFeature {
  text: string;
}

// 票券狀態常數
export const TICKET_STATUS = {
  PURCHASED: 'purchased',
  COLLECTED: 'collected', 
  REFUNDED: 'refunded',
  COMPLETED: 'completed',
} as const;

// UI 顯示的票券狀態類型（排除 API 專用的狀態）
export type TicketStatusType = 'purchased' | 'collected' | 'refunded';

// 票券狀態提醒內容
export const TICKET_ALERT_MESSAGES = {
  [TICKET_STATUS.PURCHASED]: {
    lines: [
      '購買票券後，請先進行分票，系統將寄送取票通知至您填寫的信箱。',
      '於信件點擊開通票券後，可至「票券系統」→「我的票券」→「已取票」查看，票券也將自動歸戶至您的 App 帳戶。',
    ],
  },
  [TICKET_STATUS.COLLECTED]: {
    lines: [
      '已取票之票券將自動與您的 App 帳戶同步，作為活動報到與入場憑證。',
      '每人僅限持有一張票券。',
    ],
  },
  [TICKET_STATUS.REFUNDED]: {
    lines: [
      '退票需於購票日起 180 天內辦理。',
      '完成退票手續後，系統將於 5 個工作天內退款至您原付款的信用卡。',
      `如需開立收據，請來信至 ${MAIL.CONTACT_EMAIL}，並附上需開立收據的票號。`,
    ],
  },
} as const;

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketInfo {
  id: string;
  name: string;
  image?: {
    url: string;
    alt: string;
  };
  caption?: string;
  description: any[];
  isMemberInfoRequired: boolean;
  price: number;
  bundleSize: number; // 套票人數 - 票種需以此人數的倍數購買
  quantity?: number;
  updatedBy: User;
  deletedAt: string | null;
  deletedBy: User | null;
  updatedAt: string;
  createdAt: string;
  available?: number;
  maxTickets?: number;
  meta?: {
    knownField?: string;
    [key: string]: any;
  };
}

export interface TicketTypesResponse {
  docs: TicketInfo[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}
