import { useCallback } from 'react';
import { SUPPORTED_NETWORKS } from '../constants/payment';
import { ROUTES } from '../constants/routes';
import { useLoading } from '../contexts/LoadingContext';
import { PaymentData, PaymentReadyState } from '../types/payment';
import { usePaymentResult } from './usePaymentResult';

declare global {
  interface Window {
    TPDirect: any;
  }
}

export const usePaymentMethods = (
  paymentData: PaymentData,
  updatePaymentReady: (updates: Partial<PaymentReadyState>) => void,
  paymentResult: ReturnType<typeof usePaymentResult>,
  user: any,
  navigate: (route: string) => void,
  setWarnMessage: (message: string) => void,
  setIsWarnDialogOpen: (isOpen: boolean) => void,
  setErrorDetails?: (details: string) => void
) => {
  const { showLoading } = useLoading();
  const { finishWithError, createOrder, pay } = paymentResult;

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

  const setupGooglePay = useCallback(async () => {
    if (!paymentData || !user) {
      finishWithError('付款資料遺失，請重新選購票券');
      return;
    }

    // 檢查用戶是否有完整資料
    if (!user?.name) {
      navigate(ROUTES.PROFILE);
      return;
    }

    try {
      showLoading('啟動 Google Pay...');

      // 直接啟動 Google Pay（必須在用戶手勢中同步執行）
      window.TPDirect.googlePay.getPrime(async function (err: any, prime: any) {
        if (err) {
          console.error('Google Pay getPrime error:', err);
          finishWithError('Google Pay 付款失敗，請重試或選擇其他付款方式');
          return;
        }

        // Google Pay 成功後才建立訂單
        const orderId = await createOrder(paymentData, user.id);
        if (!orderId) return;

        await pay(orderId, prime, {
          name: user.name,
          email: user.email,
          tel: user.tel,
        });
      });
    } catch (error: any) {
      console.error('啟動 Google Pay 失敗', error);
      finishWithError('Google Pay 付款失敗，請重試或選擇其他付款方式');
    }
  }, [paymentData, user, navigate, showLoading, finishWithError, createOrder, pay]);

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

    updatePaymentReady({ isApplePayReady: true });
  }, [paymentData, updatePaymentReady, setWarnMessage, setIsWarnDialogOpen]);

  const setupApplePay = useCallback(async () => {
    if (!paymentData || !user) {
      finishWithError('付款資料遺失，請重新選購票券');
      return;
    }

    // 檢查用戶是否有完整資料
    if (!user?.name) {
      navigate(ROUTES.PROFILE);
      return;
    }

    try {
      showLoading('啟動 Apple Pay...');
      // 直接啟動 Apple Pay（必須在用戶手勢中同步執行）
      window.TPDirect.paymentRequestApi.getPrime(async (result: any) => {
        if (result.status !== 0) {
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
          finishWithError(
            result.status === 403
              ? 'Apple Pay 服務暫時無法使用，請嘗試其他付款方式'
              : 'Apple Pay 付款失敗，請重試或選擇其他付款方式'
          );
          return;
        }

        // Apple Pay 成功後才建立訂單
        const orderId = await createOrder(paymentData, user.id);
        if (!orderId) return;

        // 依回應判斷同步成功或 3DS 導轉（202 不可直接顯示成功）
        await pay(orderId, result.prime, {
          name: user.name,
          email: user.email,
          tel: user.tel,
        });
      });
    } catch (error: any) {
      console.error('啟動 Apple Pay 失敗', error);
      finishWithError('Apple Pay 付款失敗，請重試或選擇其他付款方式');
    }
  }, [
    paymentData,
    user,
    navigate,
    showLoading,
    finishWithError,
    createOrder,
    pay,
    setErrorDetails,
  ]);

  return {
    setupGooglePay,
    setupApplePay,
    checkApplePayAvailability,
    checkGooglePayAvailability,
  };
};
