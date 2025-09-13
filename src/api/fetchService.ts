import { ROUTES } from '../constants/routes';
import { PostOrderCreateRequest } from '../types/payment';

class FetchService {
  private baseURL: string;
  private readonly TOKEN_KEY = 'token';

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  //  Token 管理方法
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  hasToken(): boolean {
    return !!this.getToken();
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;

    //  從 localStorage 取得 token
    const token = this.getToken();

    // 預設設定
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    //  如果有 token，加到 Authorization header
    if (token) {
      defaultOptions.headers = {
        ...defaultOptions.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    // 合併設定
    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, finalOptions);

      // 攔截器：處理 401/403 錯誤
      if (response.status === 401 || response.status === 403) {
        this.clearToken();
        window.location.href = ROUTES.LOGIN;
        return;
      }

      if (!response.ok) {
        // 處理各種錯誤狀態並附加回應資料
        try {
          const errorData = await response.json();

          // 統一在這裡 alert 錯誤訊息
          if (errorData.errors) {
            // 處理欄位驗證錯誤格式
            const errorMessages = errorData.errors
              .map((err: { field: string; message: string }) => err.message)
              .join('\n');
            alert(errorMessages);
          } else if (!errorData.success) {
            // 處理一般錯誤格式
            alert(errorData.message);
          }

          const error = new Error(
            `HTTP Error: ${response.status} ${response.statusText}`
          );
          (error as any).response = errorData;
          (error as any).status = response.status;
          throw error;
        } catch (jsonError) {
          console.log(jsonError);
        }
      }

      if (response.status === 204) {
        return { success: true };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Fetch Error:', error);
      throw error;
    }
  }

  // API 方法保持不變
  async get(endpoint: string, params?: Record<string, any>) {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
      const paramString = searchParams.toString();
      if (paramString) {
        url += `?${paramString}`;
      }
    }
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

const fetchClient = new FetchService('/api');
const EMAIL_KEY = 'loginEmail';

//  API 服務定義
export const apiService = {
  // 認證相關 API
  memberAuthentication: {
    postAuth: async (email: { email: string }) => {
      const response = await fetchClient.post('/v1/auth', email);
      return response;
    },
  },
  members: {
    getMember: async () => {
      const response = await fetchClient.get(
        `/v1/members?page=1&limit=1&sort=-createdAt&where%5Bemail%5D%5Bequals%5D=${encodeURIComponent(localStorage.getItem(EMAIL_KEY) as string)}`
      );
      return response;
    },
    patchMembers: async (
      id: string,
      data: {
        email: string;
        name: string;
        gender: string;
        tel: string;
        role: string;
        location: string;
        consentedAt: string;
      }
    ) => {
      const response = await fetchClient.patch(`/v1/members/${id}`, data);
      return response;
    },
    getMembers: async (mail: string[]) => {
      const response = await fetchClient.get(`/v1/members?where[and][role][in]=paster,senior-paster&where[or][0][email][in]=${mail.join(',')}`);
      return response;
    },
  },
  ticketsTypes: {
    getTicketsTypes: async () => {
      const response = await fetchClient.get(
        '/v1/ticketTypes?page=1&limit=20&sort=-createdAt'
      );
      return response;
    },
  },
  orders: {
    getOrders: async (id: string) => {
      const response = await fetchClient.get(
        `/v1/orders?page=1&limit=100&sort=-createdAt&where[member][equals]=${id}`
      );
      return response;
    },
    postOrderCreate: async (data: PostOrderCreateRequest) => {
      const response = await fetchClient.post('/v1/orders/create', data);
      return response;
    },
  }
};

export { fetchClient };

