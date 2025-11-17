export interface SelectedTicket {
  id: string;
  name: string;
  price: number;
  selectedQuantity: number;
  totalPrice: number;
  remark?: string;
  features: { text: string }[];
  image: string;
}

export interface GroupPassFormData {
  name: string;
  email: string;
  role?: string;
  location: string;
  tel: string;
  dietaryRequirement?: string;
}

export interface PaymentData {
  tickets: any[];
  groupPassFormData: { [ticketId: string]: GroupPassFormData[] };
  summary: {
    totalAmount: number;
    totalQuantity: number;
  };
}

export interface CreditCardStatus {
  number: string;
  expiry: string;
  ccv: string;
}

export interface PaymentReadyState {
  isApplePayReady: boolean;
  isGooglePayReady: boolean;
  isSamsungPayReady: boolean;
}

export interface TapPayEnvironment {
  appId: number;
  appKey: string;
  appleMerchantId?: string;
  googleMerchantId?: string;
}

// 會員資訊介面
export interface Member {
  name: string;
  email: string;
  role: string;
  location: string;
  tel: string;
}

// 票券類型介面
export interface TicketType {
  id: string;
  name: string;
  price: number;
  image: number;
  caption?: string;
  description: Array<{
    id: string;
    bulletpoint: string;
  }>;
  isMemberInfoRequired?: boolean;
  updatedBy?: string;
  deletedAt?: string | null;
  deletedBy?: string | null;
  updatedAt: string;
  createdAt: string;
}

// 訂單項目介面
export interface OrderItem {
  id: string;
  order: {
    id: string;
    member: string;
    status: string;
    total: number;
    tapPayTradeId?: string | null;
    items: string[];
    tickets: string[];
    updatedBy?: string | null;
    deletedAt?: string | null;
    deletedBy?: string | null;
    updatedAt: string;
    createdAt: string;
  };
  ticketType: TicketType;
  quantity: number;
  priceAtPurchase: number;
  updatedBy?: string | null;
  deletedAt?: string | null;
  deletedBy?: string | null;
  updatedAt: string;
  createdAt: string;
}

// 票券介面
export interface Ticket {
  id: string;
  order: {
    id: string;
    member: string;
    status: string;
    total: number;
    tapPayTradeId?: string | null;
    items: string[];
    tickets: string[];
    updatedBy?: string | null;
    deletedAt?: string | null;
    deletedBy?: string | null;
    updatedAt: string;
    createdAt: string;
  };
  type: TicketType;
  owner: {
    id: string;
    email: string;
    name: string;
    gender: string;
    tel: string;
    role: string;
    location: string;
    consentedAt: string;
    loginTokenIssuedAt: number;
    orders: any[];
    updatedBy?: any;
    deletedAt?: string | null;
    deletedBy?: string | null;
    updatedAt: string;
    createdAt: string;
  };
  user?: any | null;
  isRedeemed: boolean;
  isCheckedIn: boolean;
  updatedBy?: string | null;
  deletedAt?: string | null;
  deletedBy?: any | null;
  updatedAt: string;
  createdAt: string;
}

// 完整訂單介面
/**
 * 會眾票券訂單
 */
export interface Order {
  id: string;
  /**
   * 創建此訂單的會眾
   */
  member: {
    id: string;
    email: string;
    name: string;
    gender: string;
    tel: string;
    role: string;
    location: string;
    consentedAt: string;
    loginTokenIssuedAt: number;
    orders: any[];
    updatedBy?: any;
    deletedAt?: string | null;
    deletedBy?: string | null;
    updatedAt: string;
    createdAt: string;
  };
  /**
   * 訂單目前的狀態
   */
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  /**
   * 訂單的總金額（以新台幣為單位）
   */
  total: number;
  /**
   * TapPay 交易成功後回傳的 rec_trade_id，可以用於退款操作
   */
  tapPayTradeId?: string | null;
  /**
   * 此訂單包含的票券項目，每項包含了票種與數量
   */
  items: OrderItem[];
  /**
   * 此訂單包含的所有票券
   */
  tickets: Ticket[];
  updatedBy?: string | null;
  deletedAt?: string | null;
  deletedBy?: string | null;
  updatedAt: string;
  createdAt: string;
}

// 建立訂單請求介面
export interface PostOrderCreateRequest {
  memberId: string;
  prime: string;
  items: {
    ticketTypeId: string;
    quantity: number;
    members: GroupPassFormData[];
  }[];
}

// 分票請求介面
export interface TicketSplitRequest {
  memberId: string;
  tickets: {
    ticketId: string;
    email: string;
  }[];
}
