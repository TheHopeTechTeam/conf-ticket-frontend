
export interface SelectedTicket {
  id: string;
  name: string;
  price: number;
  selectedQuantity: number;
  totalPrice: number;
  remark?: string;
  features: { text: string }[];
  image: string;
}

export interface GroupPassFormData {
  name: string;
  email: string;
  church: string;
  phone: string;
}

export interface PaymentData {
  tickets: any[];
  groupPassFormData: { [ticketId: string]: GroupPassFormData[] };
  summary: {
    totalAmount: number;
    totalQuantity: number;
  };
}

export interface CreditCardStatus {
  number: string;
  expiry: string;
  ccv: string;
}

export interface PaymentReadyState {
  isApplePayReady: boolean;
  isGooglePayReady: boolean;
  isSamsungPayReady: boolean;
}

export interface TapPayEnvironment {
  appId: number;
  appKey: string;
  appleMerchantId?: string;
  googleMerchantId?: string;
}

