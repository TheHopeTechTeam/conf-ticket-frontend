import { ROUTES } from '../constants/routes';

class FetchService {
  private baseURL: string;
  private readonly TOKEN_KEY = 'auth_token';

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

        // 重定向到登入頁面
        window.location.href = ROUTES.LOGIN;
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
          } else {
            alert(`請求失敗: ${response.status} ${response.statusText}`);
          }

          const error = new Error(
            `HTTP Error: ${response.status} ${response.statusText}`
          );
          (error as any).response = errorData;
          (error as any).status = response.status;
          throw error;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (jsonError) {
          // 如果無法解析 JSON，使用原始錯誤
          alert(`請求失敗: ${response.status} ${response.statusText}`);
          throw new Error(
            `HTTP Error: ${response.status} ${response.statusText}`
          );
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
    getMembers: async () => {
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
      }
    ) => {
      const response = await fetchClient.patch(`/v1/members/${id}`, data);
      return response;
    },
  },
  payments: {
    postPayments: async (data: {
      prime: string;
      amount: number;
      name: string;
      email: string;
      telCountryCode?: string;
      telNumber: string;
      paymentType: string;
    }) => {
      const response = await fetchClient.post('/v1/payments', data);
      return response;
    },
  },
};

export { fetchClient };
