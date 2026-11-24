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
 * 寫入付款紀錄失敗或 TapPay 請求結果不明時，付款可能已完成。
 * TapPay 明確拒絕付款則不使用這些 code。
 */
export const PAYMENT_RECORD_CREATION_FAILURE_CODE =
  'ERROR_PAYMENT_PAYMENT_RECORD_CREATION_FAILURE';

/** 付款 API 的錯誤是否代表「付款結果不明、可能已扣款」（不可讓使用者重試） */
export const isPossiblyChargedError = (error: unknown): boolean => {
  const response = (
    error as { response?: { code?: unknown; message?: unknown } } | null
  )?.response;

  return (
    response?.code === PAYMENT_RECORD_CREATION_FAILURE_CODE ||
    response?.code === 'PAYMENT_OUTCOME_UNKNOWN'
  );
};
