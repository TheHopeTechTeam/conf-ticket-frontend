export type PaymentApiResponse =
  | { message?: string; redirectUrl?: string }
  | undefined;

export type PaymentNextStep =
  | { type: 'redirect'; url: string }
  | { type: 'success' }
  | { type: 'unknown' };

/**
 * 依 POST /v1/payments/create 的回應決定下一步。
 * 契約（BE payments/create/route.ts）：202 一定有 redirectUrl（需 3DS）；200 一定沒有（同步成功）。
 * 呼叫前提：postPayment 沒有丟錯（即 HTTP 2xx）。
 */
export const resolvePaymentResponse = (
  res: PaymentApiResponse
): PaymentNextStep => {
  // 例如 401/403 時 httpClient 回 undefined：無法判斷結果
  if (!res) return { type: 'unknown' };
  if (res.redirectUrl) return { type: 'redirect', url: res.redirectUrl };
  return { type: 'success' };
};

/**
 * 是否為後端明確回應的 HTTP 錯誤（4xx/5xx）。
 * 其餘錯誤（逾時、網路中斷、回應無法解析）都代表「沒拿到確定結果」。
 */
export const isHttpError = (error: unknown): boolean =>
  typeof (error as { status?: unknown } | null)?.status === 'number';

/**
 * BE 在 TapPay 已扣款成功、但寫入付款紀錄失敗時回 500
 * （conf-ticket-backend: payments/create/route.ts，訊息為 ERROR_PAYMENT_PAYMENT_RECORD_CREATION_FAILURE）。
 * 與 TapPay 失敗（未扣款）同為 500，目前只能用訊息文字區分。
 * TODO: BE 錯誤回應加上 code 欄位後，改為判斷 code。
 */
const CHARGED_ERROR_MESSAGE_KEYWORD = '已進入付款流程';

/** 付款 API 的錯誤是否代表「可能已扣款」（不可讓使用者重試） */
export const isPossiblyChargedError = (error: unknown): boolean => {
  const message = (error as { response?: { message?: unknown } } | null)
    ?.response?.message;
  return (
    typeof message === 'string' &&
    message.includes(CHARGED_ERROR_MESSAGE_KEYWORD)
  );
};
