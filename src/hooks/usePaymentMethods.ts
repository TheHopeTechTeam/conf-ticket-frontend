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
      setPaymentStatus(STATUS.ERROR);
      return;
    }

    // 檢查用戶是否有完整資料
    if (!user?.name) {
      navigate(ROUTES.PROFILE);
      return;
    }

    try {
      showLoading('建立訂單中...');
      console.log('開始建立訂單');

      // 先建立訂單
      const orderResponse = await apiService.orders.postOrderCreate({
        memberId: user.id,
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

      // 確認有 orderId
      if (!orderResponse.orderId) {
        hideLoading();
        setWarnMessage('建立訂單失敗，請重試');
        setIsWarnDialogOpen(true);
        setPaymentStatus(STATUS.ERROR);
        return;
      }

      const createdOrderId = orderResponse.orderId;
      console.log('訂單建立成功，orderId:', createdOrderId);

      // 處理 Google Pay 付款
      showLoading('處理付款中...');
      window.TPDirect.googlePay.getPrime(async function (err: any, prime: any) {
        if (err) {
          console.error('Google Pay getPrime error:', err);
          hideLoading();
          setWarnMessage('Google Pay 付款失敗，請重試或選擇其他付款方式');
          setIsWarnDialogOpen(true);
          setPaymentStatus(STATUS.ERROR);
          return;
        }

        try {
          console.log('開始處理 Google Pay 付款，prime:', prime);

          // 呼叫付款 API
          await apiService.payment.postPayment({
            prime: prime,
            orderId: createdOrderId,
            payer: {
              name: user.name,
              email: user.email,
              tel: user.tel,
            },
          });

          // Google Pay 付款成功，直接跳轉到成功頁面
          console.log('Google Pay 付款成功');
          hideLoading();
          setPaymentStatus(STATUS.SUCCESS);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error: any) {
          console.error('Google Pay 付款處理失敗', error);
          hideLoading();
          setWarnMessage('Google Pay 交易失敗：' + error.message);
          setIsWarnDialogOpen(true);
          setPaymentStatus(STATUS.ERROR);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    } catch (error: any) {
      console.error('建立訂單失敗', error);
      hideLoading();
      setWarnMessage('建立訂單失敗，請重試');
      setIsWarnDialogOpen(true);
      setPaymentStatus(STATUS.ERROR);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [paymentData, user, navigate, showLoading, hideLoading, setWarnMessage, setIsWarnDialogOpen, setPaymentStatus]);

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

  const setupApplePay = useCallback(async () => {
    if (!paymentData || !user) {
      setPaymentStatus(STATUS.ERROR);
      return;
    }

    // 檢查用戶是否有完整資料
    if (!user?.name) {
      navigate(ROUTES.PROFILE);
      return;
    }

    try {
      showLoading('建立訂單中...');
      console.log('開始建立訂單');

      // 先建立訂單
      const orderResponse = await apiService.orders.postOrderCreate({
        memberId: user.id,
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

      // 確認有 orderId
      if (!orderResponse.orderId) {
        hideLoading();
        setWarnMessage('建立訂單失敗，請重試');
        setIsWarnDialogOpen(true);
        setPaymentStatus(STATUS.ERROR);
        return;
      }

      const createdOrderId = orderResponse.orderId;
      console.log('訂單建立成功，orderId:', createdOrderId);

      // 處理 Apple Pay 付款
      showLoading('處理付款中...');
      window.TPDirect.paymentRequestApi.getPrime(async (result: any) => {
        if (result.status !== 0) {
          // 更詳細的錯誤資訊
          console.error('Apple Pay getPrime error:', result);
          console.error('Error status:', result.status);
          console.error('Error message:', result.msg);

          hideLoading();

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
          setPaymentStatus(STATUS.ERROR);
          return;
        }

        try {
          console.log('開始處理 Apple Pay 付款，prime:', result.prime);

          // 呼叫付款 API
          await apiService.payment.postPayment({
            prime: result.prime,
            orderId: createdOrderId,
            payer: {
              name: user.name,
              email: user.email,
              tel: user.tel,
            },
          });

          // Apple Pay 付款成功，直接跳轉到成功頁面
          console.log('Apple Pay 付款成功');
          hideLoading();
          setPaymentStatus(STATUS.SUCCESS);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error: any) {
          console.error('Apple Pay 付款處理失敗', error);
          hideLoading();
          setWarnMessage('Apple Pay 交易失敗：' + error.message);
          setIsWarnDialogOpen(true);
          setPaymentStatus(STATUS.ERROR);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    } catch (error: any) {
      console.error('建立訂單失敗', error);
      hideLoading();
      setWarnMessage('建立訂單失敗，請重試');
      setIsWarnDialogOpen(true);
      setPaymentStatus(STATUS.ERROR);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [paymentData, user, navigate, showLoading, hideLoading, setWarnMessage, setIsWarnDialogOpen, setPaymentStatus, setErrorDetails]);

  return {
    setupGooglePay,
    setupApplePay,
    checkApplePayAvailability,
    checkGooglePayAvailability,
  };
};
