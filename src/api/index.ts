import { PostOrderCreateRequest, TicketSplitRequest } from '../types/payment';
import {
  mockMemberResponse,
  mockRegularTicketTypesResponse,
  mockDiscountTicketTypesResponse,
  mockAllTicketTypesResponse,
} from '../mocks';
import { httpClient } from './service';

const EMAIL_KEY = 'loginEmail';
const IS_DEV = import.meta.env.DEV;

export interface AuthRequest {
  email: string;
}

export interface MemberUpdateRequest {
  email: string;
  name: string;
  gender: string;
  tel: string;
  role: string;
  location: string;
  consentedAt: string;
}

// 認證相關 API
export const authApi = {
  postAuth: async (email: AuthRequest) => {
    return await httpClient.post('/v1/auth', email);
  },
};

// 會員相關 API
export const membersApi = {
  getMember: async () => {
    // 開發環境使用假資料
    if (IS_DEV) {
      console.log('[DEV] 使用 mock 會員資料，vip:', mockMemberResponse.docs[0].meta?.vip);
      return mockMemberResponse;
    }

    const emailParam = encodeURIComponent(
      localStorage.getItem(EMAIL_KEY) as string
    );
    return await httpClient.get(
      `/v1/members?page=1&limit=1&sort=-createdAt&where%5Bemail%5D%5Bequals%5D=${emailParam}`
    );
  },

  updateMember: async (id: string, data: MemberUpdateRequest) => {
    return await httpClient.patch(`/v1/members/${id}`, data);
  },

  getMembersByEmail: async (emails: string[]) => {
    const baseQuery = `where[and][1][email][in]=${emails.join(',')}`;
    return await httpClient.get(`/v1/members?${baseQuery}`);
  },

  getMemberRoles: async () => {
    return await httpClient.get('/v1/members/roles');
  },
};

// 票種相關 API
export const ticketTypesApi = {
  getTicketTypes: async (params?: { discounts?: string; where?: any }) => {
    // 開發環境使用假資料
    if (IS_DEV) {
      if (params?.discounts === 'none') {
        console.log('[DEV] 使用 mock 一般票券資料');
        return mockRegularTicketTypesResponse;
      }
      if (params?.where?.['meta.discounts']?.exists) {
        console.log('[DEV] 使用 mock 優惠票券資料');
        return mockDiscountTicketTypesResponse;
      }
      console.log('[DEV] 使用 mock 全部票券資料');
      return mockAllTicketTypesResponse;
    }

    const baseUrl = '/v1/ticketTypes';

    if (!params) {
      return await httpClient.get(baseUrl);
    }

    // 處理 discounts=none 的情況（一般票券）
    if (params.discounts === 'none') {
      return await httpClient.get(`${baseUrl}?discounts=none`);
    }

    // 處理 where[meta.discounts][exists]=true 的情況（優惠票券）
    if (params.where?.['meta.discounts']?.exists) {
      return await httpClient.get(
        `${baseUrl}?where[meta.discounts][exists]=true`
      );
    }

    return await httpClient.get(baseUrl);
  },
};

// 訂單相關 API
export const ordersApi = {
  getOrdersByMember: async (memberId: string) => {
    return await httpClient.get(
      `/v1/orders?page=1&limit=100&sort=-createdAt&where[member][equals]=${memberId}`
    );
  },

  getOrdersByOrderId: async (orderId: string) => {
    return await httpClient.get(`/v1/orders/${orderId}`);
  },

  createOrder: async (data: PostOrderCreateRequest) => {
    return await httpClient.post('/v1/orders/create', data);
  },

  postOrdersRefund: async (orderId: string) => {
    return await httpClient.post('/v1/orders/refund', { orderId });
  },
};

// 分/領票、退票相關 API
export const ticketApi = {
  postTicketsSplit: async (data: TicketSplitRequest) => {
    return await httpClient.post('/v1/tickets/split', data);
  },
  getTickets: async (id: string) => {
    return await httpClient.get(
      `/v1/tickets?where[and][0][user][equals]=${id}&where[and][1][isRedeemed][equals]=true`
    );
  },
};

// Tappay 相關 API
export const paymentApi = {
  postPayment: async (data: any) => {
    return await httpClient.post('/v1/payments/create', data);
  },
};

// 匯出所有 API（向後兼容）
export const apiService = {
  memberAuthentication: authApi,
  members: {
    getMember: membersApi.getMember,
    patchMembers: membersApi.updateMember,
    getMembers: membersApi.getMembersByEmail,
    getMembersRoles: membersApi.getMemberRoles,
  },
  ticketsTypes: {
    getTicketsTypes: ticketTypesApi.getTicketTypes,
  },
  orders: {
    getOrders: ordersApi.getOrdersByMember,
    getOrdersByOrderId: ordersApi.getOrdersByOrderId,
    postOrderCreate: ordersApi.createOrder,
    postOrdersRefund: ordersApi.postOrdersRefund,
  },
  tickets: {
    postTicketsSplit: ticketApi.postTicketsSplit,
    getTickets: ticketApi.getTickets,
  },
  payment: {
    postPayment: paymentApi.postPayment,
  },
};

// 匯出 HTTP 客戶端以供需要直接使用的情況
export { httpClient } from './service';
