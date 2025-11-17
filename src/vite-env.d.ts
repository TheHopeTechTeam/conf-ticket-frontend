/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** TapPay Partner Key */
  readonly VITE_TAPPAY_PARTNER_KEY: string;

  /** TapPay Merchant ID for credit card payment */
  readonly VITE_TAPPAY_CREDIT_CARD_MERCHANT_ID: string;

  /** URL to be passed to TapPay for backend notification re payment status */
  readonly VITE_TAPPAY_BACKEND_NOTIFY_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
