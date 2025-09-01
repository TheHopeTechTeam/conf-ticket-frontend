export const PAYMENT_TYPES = {
  APPLE_PAY: 'apple-pay',
  GOOGLE_PAY: 'google-pay',
  SAMSUNG_PAY: 'samsung-pay',
  CREDIT_CARD: 'credit-card',
} as const;

export type PaymentType = (typeof PAYMENT_TYPES)[keyof typeof PAYMENT_TYPES];

export const CREDIT_CARD_STATUS_MESSAGES = {
  REQUIRED_NUMBER: '請輸入信用卡卡號',
  REQUIRED_EXPIRY: '請輸入有效期限',
  REQUIRED_CCV: '請輸入安全碼',
  INVALID_NUMBER: '卡號無效',
  INVALID_EXPIRY: '到期日無效',
  INVALID_CCV: '安全碼無效',
} as const;

export const SUPPORTED_NETWORKS = {
  COMMON: ['AMEX', 'JCB', 'MASTERCARD', 'VISA'],
  SAMSUNG_LIMITED: ['MASTERCARD', 'VISA'],
} as const;
