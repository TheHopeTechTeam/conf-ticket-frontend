import { useEffect, useCallback } from 'react';
import { TapPayEnvironment, CreditCardStatus } from '../types/payment';
import { CREDIT_CARD_STATUS_MESSAGES } from '../constants/payment';

declare global {
  interface Window {
    TPDirect: any;
  }
}

export const useTapPay = (
  setCreditCardStatus: React.Dispatch<React.SetStateAction<CreditCardStatus>>
) => {
  const initializeTapPay = useCallback(() => {
    const config: TapPayEnvironment = {
      appId: Number(import.meta.env.VITE_TAPPAY_APP_ID) || 0,
      appKey: import.meta.env.VITE_TAPPAY_APP_KEY || '',
      appleMerchantId: import.meta.env.VITE_APPLE_MERCHANT_ID || '',
      googleMerchantId: import.meta.env.VITE_GOOGLE_MERCHANT_ID || '',
    };

    if (!config.appId || !config.appKey) {
      console.error('Missing TapPay configuration in environment variables.');
      return false;
    }

    try {
      window.TPDirect.setupSDK(config.appId, config.appKey, 'sandbox');

      // Setup payment methods
      window.TPDirect.paymentRequestApi.checkAvailability();

      window.TPDirect.paymentRequestApi.setupApplePay({
        merchantIdentifier: config.appleMerchantId,
        countryCode: 'TW',
      });

      const googlePaySetting = {
        googleMerchantId: config.googleMerchantId,
        allowedCardAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
        merchantName: 'The Hope',
      };
      window.TPDirect.googlePay.setupGooglePay(googlePaySetting);

      window.TPDirect.samsungPay.setup({
        country_code: 'tw',
      });

      return true;
    } catch (error) {
      console.error('TapPay initialization failed:', error);
      return false;
    }
  }, []);

  const setupCreditCardValidation = useCallback(() => {
    window.TPDirect.card.onUpdate((update: any) => {
      const isInvalid = (status: number) => status === 3 || status === 2;
      const isRequired = (status: number) => status === 1;

      setCreditCardStatus({
        number: isRequired(update.status.number)
          ? CREDIT_CARD_STATUS_MESSAGES.REQUIRED_NUMBER
          : isInvalid(update.status.number)
            ? CREDIT_CARD_STATUS_MESSAGES.INVALID_NUMBER
            : '',
        expiry: isRequired(update.status.expiry)
          ? CREDIT_CARD_STATUS_MESSAGES.REQUIRED_EXPIRY
          : isInvalid(update.status.expiry)
            ? CREDIT_CARD_STATUS_MESSAGES.INVALID_EXPIRY
            : '',
        ccv: isRequired(update.status.ccv)
          ? CREDIT_CARD_STATUS_MESSAGES.REQUIRED_CCV
          : isInvalid(update.status.ccv)
            ? CREDIT_CARD_STATUS_MESSAGES.INVALID_CCV
            : '',
      });
    });
  }, [setCreditCardStatus]);

  useEffect(() => {
    initializeTapPay();
  }, [initializeTapPay]);

  useEffect(() => {
    setupCreditCardValidation();
  }, [setupCreditCardValidation]);

  return {
    initializeTapPay,
    setupCreditCardValidation,
  };
};
