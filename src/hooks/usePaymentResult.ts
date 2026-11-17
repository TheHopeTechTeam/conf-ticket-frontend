import { useCallback } from 'react';
import { apiService } from '../api';
import { STATUS } from '../constants/common';
import { TICKET_STATUS } from '../constants/tickets';
import { useLoading } from '../contexts/LoadingContext';
import { PaymentData } from '../types/payment';
import {
  isHttpError,
  isPossiblyChargedError,
  resolvePaymentResponse,
} from '../utils/payment';

export type PaymentResultStatus = 'form' | 'success' | 'error' | 'pending';

/** 單次查詢訂單狀態的逾時（3DS 輪詢、結果不明時確認） */
export const ORDER_STATUS_TIMEOUT_MS = 5_000;

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

interface Payer {
  name: string;
  email: string;
  tel: string;
}

/**
 * 付款流程共用的「收尾」與「建立訂單 → 付款」處理。
 * 結果分三種：success（成功）、error（確定失敗，可重試）、pending（結果不明，不可重新付款）。
 */
export const usePaymentResult = (
  setPaymentStatus: (status: PaymentResultStatus) => void,
  setWarnMessage: (message: string) => void,
  setIsWarnDialogOpen: (isOpen: boolean) => void
) => {
  const { showLoading, hideLoading } = useLoading();

  const finishWithSuccess = useCallback(() => {
    hideLoading();
    sessionStorage.removeItem('ticketOrderData');
    setPaymentStatus(STATUS.SUCCESS);
    scrollToTop();
  }, [hideLoading, setPaymentStatus]);

  /**
   * @param message 提示框訊息；傳 null 表示不開付款頁的提示框
   *   （後端回 HTTP 錯誤時，service.ts 已用全域提示框顯示 BE 的訊息，避免疊兩個）
   */
  const finishWithError = useCallback(
    (message: string | null) => {
      hideLoading();
      if (message) {
        setWarnMessage(message);
        setIsWarnDialogOpen(true);
      }
      setPaymentStatus(STATUS.ERROR);
      scrollToTop();
    },
    [hideLoading, setWarnMessage, setIsWarnDialogOpen, setPaymentStatus]
  );

  /** 結果不明：不清 ticketOrderData、不開 WarnDialog，由結果畫面說明 */
  const finishWithPending = useCallback(() => {
    hideLoading();
    setPaymentStatus(STATUS.PENDING);
    scrollToTop();
  }, [hideLoading, setPaymentStatus]);

  /**
   * 建立訂單。此時尚未送出 prime，不可能已扣款，任何失敗都算「確定失敗」。
   * @returns orderId；失敗時已顯示失敗畫面並回傳 null
   */
  const createOrder = useCallback(
    async (paymentData: PaymentData, memberId: string) => {
      showLoading('建立訂單中...');
      try {
        const orderResponse = await apiService.orders.postOrderCreate({
          memberId,
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

        if (!orderResponse?.orderId) {
          finishWithError('建立訂單失敗，請重試');
          return null;
        }
        return orderResponse.orderId as string;
      } catch (error) {
        console.error('建立訂單失敗', error);
        // HTTP 錯誤時 BE 訊息已由全域提示框顯示；逾時／網路錯誤則由這裡提示
        finishWithError(isHttpError(error) ? null : '建立訂單失敗，請重試');
        return null;
      }
    },
    [showLoading, finishWithError]
  );

  /**
   * 付款 API 沒有明確結果（逾時、網路中斷）時，查一次訂單狀態。
   * 同步付款若成功，後端在回 200 前就已把訂單改為 completed。
   */
  const confirmOrderAfterUncertainPayment = useCallback(
    async (orderId: string) => {
      showLoading('確認付款結果...');
      try {
        const order = await apiService.orders.getOrdersByOrderId(orderId, {
          timeoutMs: ORDER_STATUS_TIMEOUT_MS,
          silent: true,
        });
        if (order?.status === TICKET_STATUS.COMPLETED) {
          finishWithSuccess();
          return;
        }
      } catch (error) {
        console.error('確認付款結果失敗', error);
      }
      finishWithPending();
    },
    [showLoading, finishWithSuccess, finishWithPending]
  );

  /** 呼叫付款 API 並依結果收尾（成功／3DS 導轉／確定失敗／結果不明） */
  const pay = useCallback(
    async (orderId: string, prime: string, payer: Payer) => {
      showLoading('處理付款中...');
      try {
        const paymentResponse = await apiService.payment.postPayment({
          prime,
          orderId,
          payer,
        });

        const next = resolvePaymentResponse(paymentResponse);
        switch (next.type) {
          case 'redirect':
            // 導轉 3DS 驗證頁，保持 loading
            window.location.href = next.url;
            return;
          case 'success':
            finishWithSuccess();
            return;
          case 'unknown':
            finishWithPending();
            return;
        }
      } catch (error) {
        console.error('付款處理失敗', error);
        if (isHttpError(error)) {
          if (isPossiblyChargedError(error)) {
            // TapPay 已扣款但 BE 寫入付款紀錄失敗：不可讓使用者重試，避免重複扣款
            finishWithPending();
            return;
          }
          // 後端明確回錯誤（例如 TapPay 失敗，未扣款）：確定失敗，可重試。
          // BE 訊息已由全域提示框顯示，不再另開付款頁提示框
          finishWithError(null);
          return;
        }
        // 逾時或網路中斷：後端可能已扣款，不可當成失敗
        await confirmOrderAfterUncertainPayment(orderId);
      }
    },
    [
      showLoading,
      finishWithSuccess,
      finishWithError,
      finishWithPending,
      confirmOrderAfterUncertainPayment,
    ]
  );

  return {
    finishWithSuccess,
    finishWithError,
    finishWithPending,
    createOrder,
    pay,
  };
};
