import { ROUTES } from '../constants/routes';
import { errorHandler } from '../utils/errorHandler';

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
    const loginEmail = localStorage.getItem('loginEmail');

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
        'x-member-auth': loginEmail || '',
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

          // 統一在這裡使用 WarnDialog 顯示錯誤訊息
          if (errorData.message && Array.isArray(errorData.message)) {
            // 處理 message 陣列格式的錯誤
            const errorMessages = errorData.message
              .map(
                (err: { ticketId: string; message: string; status: number }) =>
                  err.message
              )
              .join('\n');
            errorHandler.showError(errorMessages);
          } else if (errorData.errors) {
            // 處理 errors 陣列格式的錯誤
            if (Array.isArray(errorData.errors)) {
              if (typeof errorData.errors[0] === 'string') {
                // 處理字串陣列格式：["error message 1", "error message 2"]
                const errorMessages = errorData.errors.join('\n');
                errorHandler.showError(errorMessages);
              } else {
                // 處理物件陣列格式：[{field: "name", message: "error"}]
                const errorMessages = errorData.errors
                  .map((err: { field: string; message: string }) => err.message)
                  .join('\n');
                errorHandler.showError(errorMessages);
              }
            }
          } else if (!errorData.success) {
            // 處理一般錯誤格式
            errorHandler.showError(errorData.message);
          }

          const error = new Error(
            `HTTP Error: ${response.status} ${response.statusText}`
          );
          (error as any).response = errorData;
          (error as any).status = response.status;
          throw error;
        } catch (jsonError) {
          throw jsonError;
        }
      }

      if (response.status === 204) {
        return { success: true };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  // HTTP 方法
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

export const httpClient = new FetchService('/api');
