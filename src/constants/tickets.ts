export interface TicketFeature {
  text: string;
}

// 票券狀態常數
export const TICKET_STATUS = {
  PURCHASED: 'purchased',
  COLLECTED: 'collected',
  REFUNDED: 'refunded',
} as const;

export type TicketStatusType = typeof TICKET_STATUS[keyof typeof TICKET_STATUS];

// 票券狀態提醒內容
export const TICKET_ALERT_MESSAGES = {
  [TICKET_STATUS.PURCHASED]: {
    lines: [
      '購買票券後，請先進行分票，系統將寄送取票通知至您填寫的信箱。',
      '於信件點擊開通票券後，可至「票券系統」→「我的票券」→「已取票」查看，票券也將自動歸戶至您的 App 帳戶。'
    ]
  },
  [TICKET_STATUS.COLLECTED]: {
    lines: [
      '已取票之票券將自動與您的 App 帳戶同步，作為活動報到與入場憑證。',
      '每人僅限持有一張票券。'
    ]
  },
  [TICKET_STATUS.REFUNDED]: {
    lines: [
      '退票需於購票日起 180 天內辦理。',
      '完成退票手續後，系統將於 5 個工作天內退款至您原付款的信用卡。',
      '如需開立發票，請來信至 conf@thehope.co'
    ]
  },
} as const;

export interface TicketInfo {
  id: string;
  name: string;
  price: number;
  image: string;
  features: TicketFeature[];
  remark?: string;
  isGroupPass?: boolean;
  isSpecialAccess?: boolean;
}

export const TICKET_TYPES: TicketInfo[] = [
  {
    id: 'regular',
    name: 'Regular Pass',
    price: 2800,
    image: '/src/assets/images/ticket-sample.png',
    features: [
      {
        text: '特會全場次 & WORKSHOP & 特會影片（一個月線上觀看權限）',
      },
    ],
  },
  {
    id: 'special-a',
    name: 'Special A Pass',
    price: 3200,
    image: '/src/assets/images/ticket-sample.png',
    features: [
      {
        text: '特會全場次 & WORKSHOP & 特會影片（一個月線上觀看權限）',
      },
      {
        text: '5/2 與 Wade Joye 牧師午餐及 Live QA',
      },
      {
        text: '會場深度配有即時翻譯',
      },
    ],
  },
  {
    id: 'special-b',
    name: 'Special B Pass',
    price: 3400,
    image: '/src/assets/images/ticket-sample.png',
    features: [
      {
        text: '特會全場次 & WORKSHOP & 特會影片（一個月線上觀看權限）',
      },
    ],
  },
  {
    id: 'group',
    name: 'Group Pass',
    price: 16800,
    image: '/src/assets/images/ticket-sample.png',
    remark: '※一組為6張REGULAR PASS',
    isGroupPass: true,
    isSpecialAccess: true,
    features: [
      {
        text: '特會全場次 & WORKSHOP & 特會影片（一個月線上觀看權限）',
      },
      {
        text: '5/2 與 Wade Joye 牧師午餐及 Live QA',
      },
      {
        text: '5/3 與 Pastors 午餐及 Live QA\n與談牧者：萬力豪牧師、周巽正牧師、柳子駿牧師、葉豪軒牧師',
      },
    ],
  },
  {
    id: 'leadership',
    name: 'Leadership Pass',
    price: 3400,
    image: '/src/assets/images/ticket-sample.png',
    remark: '※限牧者、傳道人、事工負責人報名參加',
    isSpecialAccess: true,
    features: [
      {
        text: '特會全場次 & WORKSHOP & 特會影片（一個月線上觀看權限）',
      },
      {
        text: '5/3 與 Pastors 午餐及 Live QA\n與談牧者：萬力豪牧師、周巽正牧師、柳子駿牧師、葉豪軒牧師',
      },
    ],
  },
];

