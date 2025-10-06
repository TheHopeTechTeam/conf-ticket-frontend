import { PostOrderCreateRequest, TicketSplitRequest } from '../types/payment';
import { httpClient } from './service';

const EMAIL_KEY = 'loginEmail';

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

  getMembersByEmail: async (emails: string[], filterByRole: boolean = true) => {
    const baseQuery = `where[and][1][email][in]=${emails.join(',')}`;
    const roleFilter = filterByRole
      ? '&where[and][0][role][in]=pastor,senior-pastor,minister,ministry-leader,seminarian'
      : '';
    return await httpClient.get(`/v1/members?${baseQuery}${roleFilter}`);
  },

  getMemberRoles: async () => {
    return await httpClient.get('/v1/members/roles');
  },
};

// 票種相關 API
export const ticketTypesApi = {
  getTicketTypes: async () => {
    return await httpClient.get(
      '/v1/ticketTypes?page=1&limit=20&sort=-createdAt'
    );
  },
};

// 訂單相關 API
export const ordersApi = {
  getOrdersByMember: async (memberId: string) => {
    return await httpClient.get(
      `/v1/orders?page=1&limit=100&sort=-createdAt&where[member][equals]=${memberId}`
    );
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
    postOrderCreate: ordersApi.createOrder,
    postOrdersRefund: ordersApi.postOrdersRefund,
  },
  tickets: {
    postTicketsSplit: ticketApi.postTicketsSplit,
  },
};

// 匯出 HTTP 客戶端以供需要直接使用的情況
export { httpClient } from './service';
