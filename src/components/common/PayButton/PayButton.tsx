import React from 'react';
import './PayButton.scss';

const PAYMENT_TYPES = {
  APPLE_PAY: 'apple-pay',
  GOOGLE_PAY: 'google-pay',
} as const;

interface PayButtonProps {
  paymentType: string;
  isApplePayReady: boolean;
  isGooglePayReady: boolean;
  setupGooglePay: () => void;
  setupApplePay: () => void;
}

const PayButton: React.FC<PayButtonProps> = ({
  paymentType,
  isApplePayReady,
  isGooglePayReady,
  setupGooglePay,
  setupApplePay,
}) => {
  const renderPaymentButton = () => {
    switch (paymentType) {
      case PAYMENT_TYPES.APPLE_PAY:
        return (
          <button
            type="button"
            className="pay-button apple-pay-button"
            onClick={isApplePayReady ? setupApplePay : undefined}
            disabled={!isApplePayReady}
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

      default:
        return null;
    }
  };

  return <div className="pay-button-container">{renderPaymentButton()}</div>;
};

export default PayButton;
