/// <reference types="vite/client" />

// Meta Pixel (Facebook Pixel) global type
interface MetaPixelEventData {
  value?: number;
  currency?: string;
  content_name?: string;
  num_items?: number;
  content_type?: string;
  [key: string]: unknown;
}

type FbqFunction = {
  (action: 'init', pixelId: string): void;
  (action: 'track', eventName: string, data?: MetaPixelEventData): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  loaded: boolean;
  version: string;
  push: (...args: unknown[]) => void;
};

declare const fbq: FbqFunction;

interface Window {
  fbq: FbqFunction;
  _fbq: FbqFunction;
}

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
