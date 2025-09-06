import { useCallback } from 'react';
import { apiService } from '../api/fetchService';
import { STATUS } from '../constants/common';
import { PAYMENT_TYPES, SUPPORTED_NETWORKS } from '../constants/payment';
import { PaymentData, PaymentReadyState } from '../types/payment';
import { ROUTES } from '../constants/routes';

declare global {
  interface Window {
    TPDirect: any;
  }
}

export const usePaymentMethods = (
  paymentData: PaymentData,
  updatePaymentReady: (updates: Partial<PaymentReadyState>) => void,
  setPaymentStatus: (status: 'form' | 'success' | 'error') => void,
  user: any,
  navigate: (route: string) => void
) => {
  const processPayment = useCallback(
    async (prime: string) => {
      // 檢查用戶是否有完整資料，如果沒有先導向 profile 頁面
      if (!user?.name) {
        navigate(ROUTES.PROFILE);
        return;
      }

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
        setPaymentStatus(STATUS.ERROR);
      }
    },
    [setPaymentStatus, paymentData, user, navigate]
  );

  const checkGooglePayAvailability = useCallback(() => {
    if (!paymentData) return;

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
          updatePaymentReady({ isGooglePayReady: false });
          return;
        }

        if (result.canUseGooglePay) {
          updatePaymentReady({ isGooglePayReady: true });
        } else {
          updatePaymentReady({ isGooglePayReady: false });
          alert('此裝置不支援 Google Pay');
        }
      }
    );
  }, [paymentData, updatePaymentReady]);

  const setupGooglePay = useCallback(() => {
    if (!paymentData) return;

    // 立即滾動到頂部
    window.scrollTo({ top: 0, behavior: 'smooth' });

    window.TPDirect.googlePay.getPrime(function (err: any, prime: any) {
      if (err) {
        console.error('Google Pay getPrime error:', err);
        alert('此裝置不支援 Google Pay');
        setPaymentStatus(STATUS.ERROR);
        return;
      }
      processPayment(prime).catch(error => {
        console.error('Google Pay processPayment error:', error);
      });
    });
  }, [paymentData, processPayment, setPaymentStatus]);

  const checkApplePayAvailability = useCallback(() => {
    if (!paymentData) return;

    // 首先檢查瀏覽器和設備支援度
    const isAvailable = window.TPDirect.paymentRequestApi.checkAvailability();
    
    if (!isAvailable) {
      updatePaymentReady({ isApplePayReady: false });
      return;
    }

    // 設定 Apple Pay 基本配置
    window.TPDirect.paymentRequestApi.setupApplePay({
      merchantIdentifier: 'merchant.your.app.id', // 需要替換為實際的 merchant ID
      countryCode: 'TW'
    });

    // 設定付款請求但不立即觸發
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

    // 驗證付款能力
    window.TPDirect.paymentRequestApi.setupPaymentRequest(
      paymentRequest,
      (result: any) => {
        if (result.browserSupportPaymentRequest && result.canMakePaymentWithActiveCard) {
          updatePaymentReady({ isApplePayReady: true });
        } else {
          updatePaymentReady({ isApplePayReady: false });
          if (!result.browserSupportPaymentRequest) {
            alert('此裝置不支援 Apple Pay');
          } else if (!result.canMakePaymentWithActiveCard) {
            alert('此裝置沒有支援的卡片可以付款');
          }
        }
      }
    );
  }, [paymentData, updatePaymentReady]);

  const setupApplePay = useCallback(() => {
    if (!paymentData) return;

    // 立即滾動到頂部
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 只有在用戶點擊時才獲取 prime 並處理付款
    window.TPDirect.paymentRequestApi.getPrime((result: any) => {
      if (result.status === 0) {
        processPayment(result.prime).catch(error => {
          console.error('Apple Pay processPayment error:', error);
        });
      } else {
        console.error('Apple Pay getPrime error:', result);
        setPaymentStatus('error');
      }
    });
  }, [paymentData, processPayment, setPaymentStatus]);

  const checkSamsungPayAvailability = useCallback(() => {
    if (!paymentData) return;

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

    try {
      window.TPDirect.samsungPay.setupPaymentRequest(paymentRequest);
      updatePaymentReady({ isSamsungPayReady: true });
    } catch (error) {
      console.error('Samsung Pay setup error:', error);
      updatePaymentReady({ isSamsungPayReady: false });
      alert('此裝置不支援 Samsung Pay');
    }
  }, [paymentData, updatePaymentReady]);

  const setupSamsungPay = useCallback(() => {
    if (!paymentData) return;

    // 立即滾動到頂部
    window.scrollTo({ top: 0, behavior: 'smooth' });

    window.TPDirect.samsungPay.getPrime(function (result: any) {
      if (result.status !== 0) {
        console.error('Samsung Pay error:', result);
        alert('此裝置不支援 Samsung Pay');
        setPaymentStatus(STATUS.ERROR);
        return;
      }

      processPayment(result.prime).catch(error => {
        console.error('Samsung Pay processPayment error:', error);
      });
    });
  }, [paymentData, processPayment, setPaymentStatus]);

  return {
    setupGooglePay,
    setupApplePay,
    setupSamsungPay,
    checkApplePayAvailability,
    checkGooglePayAvailability,
    checkSamsungPayAvailability,
  };
};
