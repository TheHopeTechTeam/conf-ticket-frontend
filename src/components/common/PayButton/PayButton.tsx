import React from 'react';
import './PayButton.scss';

const PAYMENT_TYPES = {
  APPLE_PAY: 'apple-pay',
  GOOGLE_PAY: 'google-pay',
  SAMSUNG_PAY: 'samsung-pay',
} as const;

interface PayButtonProps {
  paymentType: string;
  isApplePayReady: boolean;
  isGooglePayReady: boolean;
  isSamsungPayReady: boolean;
  setupGooglePay: () => void;
  setupApplePay: () => void;
  setupSamsungPay: () => void;
}

const PayButton: React.FC<PayButtonProps> = ({
  paymentType,
  isApplePayReady,
  isGooglePayReady,
  isSamsungPayReady,
  setupGooglePay,
  setupApplePay,
  setupSamsungPay,
}) => {
  const renderPaymentButton = () => {
    switch (paymentType) {
      case PAYMENT_TYPES.APPLE_PAY:
        return isApplePayReady ? (
          <div id="apple-pay-button-container" onClick={setupApplePay} />
        ) : (
          <button
            type="button"
            className="pay-button apple-pay-button"
            disabled
          />
        );

      case PAYMENT_TYPES.GOOGLE_PAY:
        return (
          <button
            type="button"
            className="pay-button google-pay-button"
            onClick={isGooglePayReady ? setupGooglePay : undefined}
            disabled={!isGooglePayReady}
          />
        );

      case PAYMENT_TYPES.SAMSUNG_PAY:
        return (
          <button
            type="button"
            className="pay-button samsung-pay-button"
            onClick={isSamsungPayReady ? setupSamsungPay : undefined}
            disabled={!isSamsungPayReady}
          />
        );

      default:
        return null;
    }
  };

  return <div className="pay-button-container">{renderPaymentButton()}</div>;
};

export default PayButton;
