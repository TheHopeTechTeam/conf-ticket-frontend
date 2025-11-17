import { Order } from '../types/payment';

export type InitiateTapPayServiceArgs = {
  /** TapPay Partner Key */
  partnerKey: string;

  /** TapPay Merchant ID, depending on the payment method */
  merchantId: string;

  /** TapPay REST API endpoint */
  tapPayEndpoint: string;

  /** URL to be passed to TapPay for frontend redirection */
  frontendRedirectUrl: string;

  /** URL to be passed to TapPay for backend notification re payment status */
  backendNotifyUrl: string;
};

export type InitiateTapPayPaymentInput = {
  /**
   * The order to pay for.
   * Must correspond to an existing order with status 'pending'.
   */
  order: Order;

  /**
   * Required for TapPay pay by prime.
   * @see {@link https://docs.tappaysdk.com/tutorial/zh/web/front.html#get-prime}
   */
  prime: string;
};

/**
 * Service to initiate a TapPay payment for an existing order
 * @see https://docs.tappaysdk.com/tutorial/en/back.html#pay-by-prime-api
 */
export class InitiateTapPayService {
  #partnerKey: string;
  #merchantId: string;
  #tapPayEndpoint: string;
  #frontendRedirectUrl: string;
  #backendNotifyUrl: string;

  constructor(params: InitiateTapPayServiceArgs) {
    this.#partnerKey = params.partnerKey;
    this.#merchantId = params.merchantId;
    this.#tapPayEndpoint = params.tapPayEndpoint;
    this.#frontendRedirectUrl = params.frontendRedirectUrl;
    this.#backendNotifyUrl = params.backendNotifyUrl;
  }

  async execute(input: InitiateTapPayPaymentInput): Promise<boolean> {
    const tapPayRequest = toTapPayPayByPrimeParams({
      partnerKey: this.#partnerKey,
      merchantId: this.#merchantId,
      frontendRedirectUrl: this.#frontendRedirectUrl,
      backendNotifyUrl: this.#backendNotifyUrl,
      prime: input.prime,
      order: input.order,
    });

    try {
      const response = await fetch(this.#tapPayEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.#partnerKey,
        },
        body: JSON.stringify(tapPayRequest),
      });

      //#region 非3D驗證才會執行到的流程
      const tapPayResponse: {
        msg: string;
        status: number;
      } = await response.json();

      // Per TapPay docs, status 0 means success
      // Ref: https://docs.tappaysdk.com/tutorial/en/back.html#request-body
      if (tapPayResponse.status !== 0) {
        // NOTE: Throw error with TapPay API status for debugging
        throw new Error(
          `TapPay API Error: ${tapPayResponse.msg} (Status: ${tapPayResponse.status})`
        );
      }

      return true;
      //#endregion

      // NOTE: Log error for debugging
      // } catch (error) {
      //   console.error(
      //     `[TapPay] Payment execution failed for Order ${validInput.order.id}: ${(error as Error).message}`,
      //   );
    } catch {
      return false;
    }
  }
}

export const newInitiateTapPayService = (params: InitiateTapPayServiceArgs) =>
  new InitiateTapPayService(params);

/** @see https://docs.tappaysdk.com/tutorial/en/back.html#pay-by-prime-api */
const toTapPayPayByPrimeParams = (params: {
  partnerKey: string;
  merchantId: string;
  prime: string;
  order: Order;
  frontendRedirectUrl: string;
  backendNotifyUrl: string;
}) => ({
  prime: params.prime,
  partner_key: params.partnerKey,
  merchant_id: params.merchantId,
  amount: params.order.total,
  currency: 'TWD',
  order_number: params.order.id, // Use orderId for TapPay's order_number
  details: `Order ID ${params.order.id}`,
  cardholder: {
    phone_number: params.order.member.tel, // Assumes `tel` field exists on Member
    name: params.order.member.name,
    email: params.order.member.email,
  },
  three_domain_secure: true,
  result_url: {
    frontend_redirect_url: params.frontendRedirectUrl,
    backend_notify_url: params.backendNotifyUrl,
  },
});
