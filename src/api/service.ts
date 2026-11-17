import { ROUTES } from '../constants/routes';
import { errorHandler } from '../utils/errorHandler';

/** 一般 API 的預設逾時 */
export const DEFAULT_TIMEOUT_MS = 15_000;

export interface RequestConfig {
  /** 逾時毫秒數（包含讀取 response body），預設 DEFAULT_TIMEOUT_MS */
  timeoutMs?: number;
  /** true 時非 2xx 不自動跳錯誤框（例如背景輪詢，由呼叫端自行處理） */
  silent?: boolean;
}

/** 前端等待逾時（沒有拿到後端回應，不代表後端沒有處理） */
export class RequestTimeoutError extends Error {
  endpoint: string;
  timeoutMs: number;

  constructor(endpoint: string, timeoutMs: number) {
    super(`Request timeout: ${endpoint} (${timeoutMs}ms)`);
    this.name = 'RequestTimeoutError';
    this.endpoint = endpoint;
    this.timeoutMs = timeoutMs;
  }
}

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

  private async request(
    endpoint: string,
    options: RequestInit = {},
    { timeoutMs = DEFAULT_TIMEOUT_MS, silent = false }: RequestConfig = {}
  ) {
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

    // 用 AbortController + setTimeout（而非 AbortSignal.timeout）以相容舊版 Safari。
    // timer 在 finally 才清除，因此逾時也涵蓋 response.json() 讀取 body 的時間。
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...finalOptions,
        signal: controller.signal,
      });

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

          // 統一在這裡使用 WarnDialog 顯示錯誤訊息（silent 時略過）
          if (silent) {
            // 不顯示
          } else if (errorData.message && Array.isArray(errorData.message)) {
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
      if (controller.signal.aborted) {
        throw new RequestTimeoutError(endpoint, timeoutMs);
      }
      // 其他錯誤（例如網路中斷的 TypeError: Failed to fetch）原樣丟出
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  // HTTP 方法
  async get(
    endpoint: string,
    params?: Record<string, any>,
    config?: RequestConfig
  ) {
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
    return this.request(url, { method: 'GET' }, config);
  }

  async post(endpoint: string, data: any, config?: RequestConfig) {
    return this.request(
      endpoint,
      { method: 'POST', body: JSON.stringify(data) },
      config
    );
  }

  async patch(endpoint: string, data: any, config?: RequestConfig) {
    return this.request(
      endpoint,
      { method: 'PATCH', body: JSON.stringify(data) },
      config
    );
  }

  async put(endpoint: string, data: any, config?: RequestConfig) {
    return this.request(
      endpoint,
      { method: 'PUT', body: JSON.stringify(data) },
      config
    );
  }

  async delete(endpoint: string, config?: RequestConfig) {
    return this.request(endpoint, { method: 'DELETE' }, config);
  }
}

export const httpClient = new FetchService('/api');
