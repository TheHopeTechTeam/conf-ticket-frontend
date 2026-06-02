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
  noticeDisabled?: boolean;
}

const PayButton: React.FC<PayButtonProps> = ({
  paymentType,
  isApplePayReady,
  isGooglePayReady,
  setupGooglePay,
  setupApplePay,
  noticeDisabled = false,
}) => {
  const renderPaymentButton = () => {
    switch (paymentType) {
      case PAYMENT_TYPES.APPLE_PAY:
        return (
          <button
            type="button"
            className={`pay-button apple-pay-button${noticeDisabled ? ' notice-disabled' : ''}`}
            onClick={isApplePayReady && !noticeDisabled ? setupApplePay : undefined}
            disabled={!isApplePayReady || noticeDisabled}
          />
        );

      case PAYMENT_TYPES.GOOGLE_PAY:
        return (
          <button
            type="button"
            className={`pay-button google-pay-button${noticeDisabled ? ' notice-disabled' : ''}`}
            onClick={isGooglePayReady && !noticeDisabled ? setupGooglePay : undefined}
            disabled={!isGooglePayReady || noticeDisabled}
          />
        );

      default:
        return null;
    }
  };

  return <div className="pay-button-container">{renderPaymentButton()}</div>;
};

export default PayButton;
