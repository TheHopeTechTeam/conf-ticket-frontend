import { useState, useCallback } from 'react';
import { PaymentReadyState } from '../types/payment';
import { PAYMENT_TYPES } from '../constants/payment';

export const usePaymentState = () => {
  const [paymentType, setPaymentType] = useState<string>('');
  const [paymentReady, setPaymentReady] = useState<PaymentReadyState>({
    isApplePayReady: false,
    isGooglePayReady: false,
    isSamsungPayReady: false,
  });

  const handlePaymentTypeChange = useCallback((selectedType: string) => {
    console.log('選擇的支付方式:', selectedType);
    setPaymentType(selectedType);

    const newPaymentReady: PaymentReadyState = {
      isApplePayReady: selectedType === PAYMENT_TYPES.APPLE_PAY,
      isGooglePayReady: selectedType === PAYMENT_TYPES.GOOGLE_PAY,
      isSamsungPayReady: selectedType === PAYMENT_TYPES.SAMSUNG_PAY,
    };

    setPaymentReady(newPaymentReady);
  }, []);

  const updatePaymentReady = useCallback(
    (updates: Partial<PaymentReadyState>) => {
      setPaymentReady(prev => ({ ...prev, ...updates }));
    },
    []
  );

  return {
    paymentType,
    paymentReady,
    handlePaymentTypeChange,
    updatePaymentReady,
  };
};
