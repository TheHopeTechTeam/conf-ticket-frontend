import { useCallback } from 'react';
import { apiService } from '../api/fetchService';
import { PAYMENT_TYPES, SUPPORTED_NETWORKS } from '../constants/payment';
import { PaymentData, PaymentReadyState } from '../types/payment';
import { STATUS } from '../constants/common';

declare global {
  interface Window {
    TPDirect: any;
  }
}

export const usePaymentMethods = (
  paymentData: PaymentData,
  updatePaymentReady: (updates: Partial<PaymentReadyState>) => void,
  setPaymentStatus: (status: 'form' | 'success' | 'error') => void,
  user: any
) => {
  const processPayment = useCallback(
    async (prime: string) => {
      try {
        await apiService.payments.postPayments({
          prime: prime,
          amount: paymentData.summary.totalAmount,
          name: user.name,
          email: user.email,
          telNumber: user.tel,
          paymentType: PAYMENT_TYPES.CREDIT_CARD,
        });
        setPaymentStatus(STATUS.SUCCESS);
      } catch (error) {
        console.error('Payment failed:', error);
        setPaymentStatus('error');
      }
    },
    [setPaymentStatus, paymentData, user]
  );

  const setupGooglePay = useCallback(() => {
    if (!paymentData) return;

    updatePaymentReady({ isGooglePayReady: true });

    const paymentRequest = {
      allowedNetworks: SUPPORTED_NETWORKS.COMMON,
      price: paymentData.summary.totalAmount.toString(),
      currency: 'TWD',
    };

    window.TPDirect.googlePay.setupPaymentRequest(
      paymentRequest,
      function (err: any, result: any) {
        if (err) {
          console.error('Google Pay setup error:', err);
          return;
        }

        if (result.canUseGooglePay) {
          window.TPDirect.googlePay.getPrime(function (err: any, prime: any) {
            if (err) {
              console.error('Google Pay getPrime error:', err);
              alert('此裝置不支援 Google Pay');
              setPaymentStatus('error');
              return;
            }
            processPayment(prime).catch(error => {
              console.error('Google Pay processPayment error:', error);
            });
          });
        }
      }
    );
  }, [paymentData, updatePaymentReady, processPayment, setPaymentStatus]);

  const setupApplePay = useCallback(async () => {
    if (!paymentData) return;

    updatePaymentReady({ isApplePayReady: true });

    const paymentRequest = {
      supportedNetworks: SUPPORTED_NETWORKS.COMMON,
      supportedMethods: ['apple_pay'],
      displayItems: [
        {
          label: 'TapPay',
          amount: {
            currency: 'TWD',
            value: paymentData.summary.totalAmount.toString(),
          },
        },
      ],
      total: {
        label: '付給 TapPay',
        amount: {
          currency: 'TWD',
          value: paymentData.summary.totalAmount.toString(),
        },
      },
    };

    const result: {
      browserSupportPaymentRequest: boolean;
      canMakePaymentWithActiveCard: boolean;
    } = await new Promise(resolve => {
      window.TPDirect.paymentRequestApi.setupPaymentRequest(
        paymentRequest,
        resolve
      );
    });

    if (!result.browserSupportPaymentRequest) {
      updatePaymentReady({ isApplePayReady: false });
      alert('此裝置不支援 Apple Pay');
      return;
    }

    if (!result.canMakePaymentWithActiveCard) {
      updatePaymentReady({ isApplePayReady: false });
      alert('此裝置沒有支援的卡片可以付款');
      return;
    }

    setTimeout(() => {
      const button = document.querySelector('#apple-pay-button-container');
      if (button) {
        button.innerHTML = '';
        window.TPDirect.paymentRequestApi.setupTappayPaymentButton(
          '#apple-pay-button-container',
          (getPrimeResult: any) => {
            processPayment(getPrimeResult.prime).catch(error => {
              console.error('Apple Pay processPayment error:', error);
            });
          }
        );
      }
    }, 100);
  }, [paymentData, updatePaymentReady, processPayment, setPaymentStatus]);

  const setupSamsungPay = useCallback(() => {
    if (!paymentData) return;

    updatePaymentReady({ isSamsungPayReady: true });

    const paymentRequest = {
      supportedNetworks: SUPPORTED_NETWORKS.SAMSUNG_LIMITED,
      total: {
        label: 'The Hope',
        amount: {
          currency: 'TWD',
          value: paymentData.summary.totalAmount.toString(),
        },
      },
    };

    window.TPDirect.samsungPay.setupPaymentRequest(paymentRequest);
    window.TPDirect.samsungPay.getPrime(function (result: any) {
      if (result.status !== 0) {
        console.error('Samsung Pay error:', result);
        alert('此裝置不支援 Samsung Pay');
        setPaymentStatus('error');
        return;
      }

      processPayment(result.prime).catch(error => {
        console.error('Samsung Pay processPayment error:', error);
      });
    });
  }, [paymentData, updatePaymentReady, processPayment, setPaymentStatus]);

  return {
    setupGooglePay,
    setupApplePay,
    setupSamsungPay,
  };
};
