import { useCallback } from 'react';
import { apiService } from '../api';
import { STATUS } from '../constants/common';
import { SUPPORTED_NETWORKS } from '../constants/payment';
import { ROUTES } from '../constants/routes';
import { useLoading } from '../contexts/LoadingContext';
import { PaymentData, PaymentReadyState } from '../types/payment';

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
  navigate: (route: string) => void,
  setWarnMessage: (message: string) => void,
  setIsWarnDialogOpen: (isOpen: boolean) => void,
  setErrorDetails?: (details: string) => void
) => {
  const { showLoading, hideLoading } = useLoading();
  const processPayment = useCallback(
    async (prime: string) => {
      // 檢查用戶是否有完整資料，如果沒有先導向 profile 頁面
      if (!user?.name) {
        navigate(ROUTES.PROFILE);
        return;
      }

      try {
        showLoading('處理付款中...');
        await apiService.orders.postOrderCreate({
          memberId: user.id,
          prime: prime,
          items: paymentData.tickets.map(ticket => ({
            ticketTypeId: ticket.id,
            quantity: ticket.selectedQuantity * (ticket.bundleSize || 1),
            members: (paymentData.groupPassFormData[ticket.id] || []).map(
              member => ({
                ...member,
                role: member.role,
              })
            ),
          })),
        });
        hideLoading();
        setPaymentStatus(STATUS.SUCCESS);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (error: any) {
        hideLoading();
        console.error('Payment failed:', error);

        // 捕捉後端錯誤訊息
        const backendError =
          error?.response?.data?.message || error?.message || '';
        if (backendError && setErrorDetails) {
          setErrorDetails(`Payment API Error:\n${backendError}`);
        }

        setPaymentStatus(STATUS.ERROR);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
          setWarnMessage('此裝置不支援 Google Pay');
          setIsWarnDialogOpen(true);
        }
      }
    );
  }, [paymentData, updatePaymentReady, setWarnMessage, setIsWarnDialogOpen]);

  const setupGooglePay = useCallback(() => {
    if (!paymentData) return;

    window.TPDirect.googlePay.getPrime(function (err: any, prime: any) {
      if (err) {
        console.error('Google Pay getPrime error:', err);
        setWarnMessage('此裝置不支援 Google Pay');
        setIsWarnDialogOpen(true);
        setPaymentStatus(STATUS.ERROR);
        return;
      }
      processPayment(prime).catch(error => {
        console.error('Google Pay processPayment error:', error);
      });
    });
  }, [paymentData, processPayment, setPaymentStatus]);

  const checkApplePayAvailability = useCallback(async () => {
    if (!paymentData) return;

    // 首先檢查瀏覽器和設備支援度
    const isAvailable = window.TPDirect.paymentRequestApi.checkAvailability();

    if (!isAvailable) {
      updatePaymentReady({ isApplePayReady: false });
      return;
    }

    // 設定 Apple Pay 基本配置
    window.TPDirect.paymentRequestApi.setupApplePay({
      merchantIdentifier: import.meta.env.VITE_APPLE_MERCHANT_ID || '',
      countryCode: 'TW',
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
        label: 'The Hope 線上付款',
        amount: {
          currency: 'TWD',
          value: paymentData.summary.totalAmount.toString(),
        },
      },
    };

    // 驗證付款能力
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
      setWarnMessage('此裝置不支援 Apple Pay');
      setIsWarnDialogOpen(true);
      return;
    }

    if (!result.canMakePaymentWithActiveCard) {
      updatePaymentReady({ isApplePayReady: false });
      setWarnMessage('此裝置沒有支援的卡片可以付款');
      setIsWarnDialogOpen(true);
      return;
    }

    updatePaymentReady({ isApplePayReady: true });
  }, [paymentData, updatePaymentReady, setWarnMessage, setIsWarnDialogOpen]);

  const setupApplePay = useCallback(() => {
    if (!paymentData) return;

    // 在 usePaymentMethods.ts:167-176 的地方加強錯誤處理
    window.TPDirect.paymentRequestApi.getPrime((result: any) => {
      if (result.status === 0) {
        processPayment(result.prime).catch(error => {
          console.error('Apple Pay processPayment error:', error);
        });
      } else {
        // 更詳細的錯誤資訊
        console.error('Apple Pay getPrime error:', result);
        console.error('Error status:', result.status);
        console.error('Error message:', result.msg);

        // 設定詳細錯誤資訊
        const errorDetails = `Apple Pay Error:\nStatus: ${result.status}\nMessage: ${result.msg}\nMerchant ID: ${import.meta.env.VITE_APPLE_MERCHANT_ID}`;
        if (setErrorDetails) {
          setErrorDetails(errorDetails);
        }

        // 根據不同錯誤給出不同提示
        if (result.status === 403) {
          setWarnMessage('Apple Pay 服務暫時無法使用，請嘗試其他付款方式');
        } else {
          setWarnMessage('Apple Pay 付款失敗，請重試或選擇其他付款方式');
        }
        setIsWarnDialogOpen(true);
        setPaymentStatus('error');
      }
    });
  }, [paymentData, processPayment, setPaymentStatus]);

  return {
    setupGooglePay,
    setupApplePay,
    checkApplePayAvailability,
    checkGooglePayAvailability,
  };
};
