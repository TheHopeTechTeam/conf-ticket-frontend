import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import CreditCard from '../../components/common/CreditCard/CreditCard';
import { GroupPassForm } from '../../components/common/GroupPassForm/GroupPassForm';
import PayButton from '../../components/common/PayButton/PayButton';
import { PaymentSelect } from '../../components/common/PaymentSelect/PaymentSelect';
import { TicketItem } from '../../components/common/TicketItem/TicketItem';

// Constants and types
import { PAYMENT_TYPES } from '../../constants/payment';
import { CreditCardStatus, PaymentData } from '../../types/payment';

// Custom hooks
import { SuccessOrError } from '../../components/common/SuccessOrError/SuccessOrError';
import { usePaymentMethods } from '../../hooks/usePaymentMethods';
import {
  ORDER_STATUS_TIMEOUT_MS,
  PaymentResultStatus,
  usePaymentResult,
} from '../../hooks/usePaymentResult';
import { usePaymentState } from '../../hooks/usePaymentState';
import { useTapPay } from '../../hooks/useTapPay';

import { apiService } from '../../api';
import { WarnDialog } from '../../components/common/Dialog/WarnDialog';
import { MAIL, MODE, STATUS } from '../../constants/common';
import { ROUTES } from '../../constants/routes';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLoading } from '../../contexts/LoadingContext';
import './Payment.scss';
import { TICKET_STATUS } from '../../constants/tickets';

const isCreditCardPaymentSupported = true;
const messageCreditCardPaymentUnavailable =
  '信用卡功能修復中，請先使用 Apple Pay 或 Google Pay 購票，謝謝！';

/**
 * 3DS 回傳後輪詢訂單的間隔（逐步拉長，合計約 20 秒、8 次）。
 * webhook 更新訂單需經過 TapPay Record API + 寫訂單 + 同步寄信，可能超過 5 秒。
 */
const POLL_DELAYS_MS = [1000, 1000, 2000, 2000, 3000, 3000, 4000, 4000];

const cleanUrl = () =>
  window.history.replaceState({}, '', window.location.pathname);

export const Payment: React.FC = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentResultStatus>(
    STATUS.FORM
  );
  const { showLoading, hideLoading } = useLoading();
  const [isWarnDialogOpen, setIsWarnDialogOpen] = useState(false);
  const [warnMessage, setWarnMessage] = useState('');
  const [isNoticeChecked, setIsNoticeChecked] = useState(false);
  const hasProcessed3DCallback = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const paymentResult = usePaymentResult(
    setPaymentStatus,
    setWarnMessage,
    setIsWarnDialogOpen
  );
  const { finishWithSuccess, finishWithError, finishWithPending } =
    paymentResult;

  // 千分位格式化函數
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const [creditCardStatus, setCreditCardStatus] = useState<CreditCardStatus>({
    number: '',
    expiry: '',
    ccv: '',
  });

  // Custom hooks
  const {
    paymentType,
    paymentReady,
    handlePaymentTypeChange,
    updatePaymentReady,
  } = usePaymentState();
  useTapPay(setCreditCardStatus);
  const {
    setupGooglePay,
    setupApplePay,
    checkApplePayAvailability,
    checkGooglePayAvailability,
  } = usePaymentMethods(
    paymentData!,
    updatePaymentReady,
    paymentResult,
    user,
    navigate,
    setWarnMessage,
    setIsWarnDialogOpen
  );

  // 當付款方式改變時，檢查相應付款方法的可用性
  useEffect(() => {
    if (!paymentData) return;

    switch (paymentType) {
      case PAYMENT_TYPES.APPLE_PAY:
        checkApplePayAvailability();
        break;
      case PAYMENT_TYPES.GOOGLE_PAY:
        checkGooglePayAvailability();
        break;
    }
  }, [
    paymentType,
    paymentData,
    checkApplePayAvailability,
    checkGooglePayAvailability,
  ]);

  const {
    register,
    formState: { errors },
    getValues,
  } = useForm({
    mode: 'onChange',
  });

  // 載入訂單資料
  useEffect(() => {
    const loadPaymentData = () => {
      // 先嘗試從 location.state 取得資料
      const stateData = location.state?.ticketOrderData;

      if (stateData) {
        setPaymentData(stateData as PaymentData);
        // 同時儲存到 sessionStorage，以防 3D 驗證跳轉後遺失
        sessionStorage.setItem('ticketOrderData', JSON.stringify(stateData));
        return;
      }

      // 向下相容：如果 state 沒有資料，再從 sessionStorage 讀取
      const storedData = sessionStorage.getItem('ticketOrderData');
      if (!storedData) {
        navigate(ROUTES.BOOKING);
        return;
      }

      try {
        const data = JSON.parse(storedData) as PaymentData;
        setPaymentData(data);
      } catch (error) {
        console.error('解析訂單資料失敗:', error);
        navigate(ROUTES.BOOKING);
      }
    };

    loadPaymentData();
  }, [navigate, location.state]);

  // 處理 3D 驗證回傳
  useEffect(() => {
    const handleThreeDSecureCallback = async () => {
      // 防止重複執行
      if (hasProcessed3DCallback.current) {
        return;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const orderNumber = urlParams.get('order_number');
      const status = urlParams.get('status');

      // 如果 URL 中有 order_number 和 status，表示是從 3D 驗證頁面返回
      if (!orderNumber || status === null) return;

      hasProcessed3DCallback.current = true;

      if (status !== '0') {
        // 3D 驗證失敗
        finishWithError('3D 驗證失敗，請重新嘗試');
        cleanUrl();
        return;
      }

      // 3D 驗證成功，輪詢訂單狀態直到 completed / failed 或達上限
      showLoading('確認付款結果...');
      let attempt = 0;

      const pollOrder = async () => {
        // 離開頁面就停止輪詢（不在 effect cleanup 清 timer，避免 effect 重跑時中斷輪詢）
        if (!isMountedRef.current) {
          hideLoading();
          return;
        }

        try {
          const order = await apiService.orders.getOrdersByOrderId(
            orderNumber,
            // silent：查詢失敗會繼續輪詢，不跳錯誤框以免使用者誤以為付款失敗
            { timeoutMs: ORDER_STATUS_TIMEOUT_MS, silent: true }
          );

          if (order?.status === TICKET_STATUS.COMPLETED) {
            finishWithSuccess();
            cleanUrl();
            return;
          }
          if (order?.status === 'failed') {
            finishWithError('付款失敗，請重新購買');
            cleanUrl();
            return;
          }
          // 其他（pending 等）→ 繼續輪詢
        } catch (error) {
          // 查詢本身失敗（網路／逾時）不代表付款失敗，繼續輪詢
          console.error('輪詢訂單失敗', error);
        }

        attempt++;
        if (attempt >= POLL_DELAYS_MS.length) {
          // 達上限仍無結果：結果確認中（不可判定為失敗，避免使用者重複付款）
          finishWithPending();
          cleanUrl();
          return;
        }
        setTimeout(pollOrder, POLL_DELAYS_MS[attempt]);
      };

      setTimeout(pollOrder, POLL_DELAYS_MS[0]);
    };

    handleThreeDSecureCallback();
  }, [
    showLoading,
    hideLoading,
    finishWithSuccess,
    finishWithError,
    finishWithPending,
  ]);

  const handleCreditCardPayment = async () => {
    if (!paymentData || !user) {
      finishWithError('付款資料遺失，請重新選購票券');
      return;
    }

    // 取得持卡人姓名
    const cardholderName = getValues('name');
    if (!cardholderName?.trim()) {
      setWarnMessage('請輸入持卡人姓名');
      setIsWarnDialogOpen(true);
      return;
    }

    // 檢查信用卡欄位狀態
    const tappayStatus = TPDirect.card.getTappayFieldsStatus();
    const isValidCard =
      tappayStatus.status.number === 0 &&
      tappayStatus.status.expiry === 0 &&
      tappayStatus.status.ccv === 0;

    if (!isValidCard) {
      setWarnMessage('請檢查信用卡資訊是否正確填寫');
      setIsWarnDialogOpen(true);
      return;
    }

    // 先建立訂單（失敗時 createOrder 已顯示失敗畫面）
    const createdOrderId = await paymentResult.createOrder(paymentData, user.id);
    if (!createdOrderId) return;

    // 取得 Prime（callback 內的錯誤由 pay 自行處理）
    showLoading('處理付款中...');
    TPDirect.card.getPrime(async (result: any) => {
      if (result.status !== 0) {
        console.error('getPrime failed', result);
        finishWithError('取得付款資訊失敗，請重新檢查信用卡資訊');
        return;
      }

      // 依回應判斷同步成功（200，無 redirectUrl）或 3DS 導轉（202）
      await paymentResult.pay(createdOrderId, result.card.prime, {
        name: cardholderName,
        email: user.email,
        tel: user.tel,
      });
    });
  };

  // Meta Pixel: 購買成功時觸發 Purchase 事件
  useEffect(() => {
    if (
      paymentStatus === STATUS.SUCCESS &&
      paymentData &&
      typeof fbq === 'function'
    ) {
      const ticketNames = paymentData.tickets
        .map(ticket => ticket.name)
        .join(', ');

      fbq('track', 'Purchase', {
        value: paymentData.summary.totalAmount,
        currency: 'TWD',
        content_name: ticketNames,
        num_items: paymentData.summary.totalQuantity,
        content_type: 'product',
      });
    }
  }, [paymentStatus, paymentData]);

  // Computed values
  const { groupPassTicket: _groupPassTicket } = useMemo(() => {
    if (!paymentData) return { groupPassTicket: null, groupPassQuantity: 0 };

    const ticket = paymentData.tickets.find(
      ticket => ticket.isMemberInfoRequired
    );

    return {
      groupPassTicket: ticket || null,
      groupPassQuantity: ticket?.selectedQuantity || 0,
    };
  }, [paymentData]);

  const red = (text: string) => (
    <span style={{ color: '#EE1B0A', fontWeight: 600 }}>{text}</span>
  );

  const getAlertContent = () => (
    <ol>
      <li>退票期限：最遲須於活動前 {red('10 天')}辦理，並酌收 {red('10%')} 手續費。</li>
      <li>退票限制：僅限{red('整筆訂單')}退票，恕不接受單張或部分退票。</li>
      <li>分票注意：團體/雙人票一旦在系統完成{red('「分票」')}，即無法辦理退票。</li>
      <li>刷退時效：因銀行作業限制，退票須於購票日起 {red('180 天內')} 完成辦理。</li>
    </ol>
  );

  return (
    <>
      <WarnDialog
        isOpen={isWarnDialogOpen}
        onClose={() => setIsWarnDialogOpen(false)}
        message={warnMessage}
      />
      {paymentStatus === STATUS.FORM && (
        <div className="form-container payment-container">
          <h1>確認訂單</h1>

          <div className="order-content">
            {/* 票券列表 */}
            <div className="ticket-section">
              <h2>請確認您選購的票券類型與數量</h2>
              <div className="ticket-list">
                {paymentData?.tickets.map(ticket => {
                  if (ticket.isMemberInfoRequired) {
                    const ticketFormData =
                      paymentData.groupPassFormData[ticket.id] || [];
                    return (
                      <div key={ticket.id} className="booking-group-pass-item">
                        <TicketItem
                          mode={MODE.VIEW}
                          ticket={ticket}
                          quantity={ticket.selectedQuantity}
                        />
                        {ticketFormData.length > 0 && (
                          <GroupPassForm
                            mode={MODE.VIEW}
                            quantity={
                              ticket.selectedQuantity * (ticket.bundleSize || 1)
                            }
                            formData={ticketFormData}
                          />
                        )}
                      </div>
                    );
                  }

                  return (
                    <TicketItem
                      key={ticket.id}
                      mode={MODE.VIEW}
                      ticket={ticket}
                      quantity={ticket.selectedQuantity}
                    />
                  );
                })}
              </div>
            </div>

            <div className="order-summary">
              <p className="order-summary-title">
                總計 NT$
                {paymentData?.summary.totalAmount &&
                  formatNumber(paymentData.summary.totalAmount)}
                元
              </p>
            </div>
          </div>

          <div className="payment-section">
            <PaymentSelect
              value={paymentType}
              onChange={handlePaymentTypeChange}
            />
            {paymentType === PAYMENT_TYPES.CREDIT_CARD &&
              (isCreditCardPaymentSupported ? (
                <CreditCard
                  paymentType={paymentType}
                  register={register}
                  errors={errors}
                  creditCardStatus={creditCardStatus}
                />
              ) : (
                messageCreditCardPaymentUnavailable
              ))}
          </div>

          <div className="payment-notice-container">
            <div className="payment-notice-title">
              <img src="/images/ticket-alert-dot.svg" alt="" />
              <p>付款前請確認重要權益</p>
            </div>
            <div className="payment-notice-content">{getAlertContent()}</div>
          </div>

          <div className="payment-notice-checkbox-container">
            <input
              type="checkbox"
              id="notice-agree"
              className="payment-notice-checkbox-input"
              checked={isNoticeChecked}
              onChange={e => setIsNoticeChecked(e.target.checked)}
            />
            <label htmlFor="notice-agree" className="payment-notice-checkbox-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <g clipPath="url(#clip0_notice)">
                  <path
                    d="M19 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.11 21 21 20.1 21 19V5C21 3.9 20.11 3 19 3ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
                    fill={isNoticeChecked ? '#3C5464' : '#C5CCD1'}
                  />
                </g>
                <defs>
                  <clipPath id="clip0_notice">
                    <rect width="24" height="24" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              我已閱讀並同意以上購票須知
            </label>
          </div>

          {/* 按鈕區 */}
          <div className="payment-buttons">
            {paymentType === PAYMENT_TYPES.CREDIT_CARD ? (
              <button
                className="btn send-btn"
                onClick={handleCreditCardPayment}
                disabled={!isCreditCardPaymentSupported || !isNoticeChecked}
              >
                前往付款
              </button>
            ) : (
              <div className="other-payment-method">
                <PayButton
                  paymentType={paymentType}
                  setupGooglePay={setupGooglePay}
                  setupApplePay={setupApplePay}
                  isApplePayReady={paymentReady.isApplePayReady}
                  isGooglePayReady={paymentReady.isGooglePayReady}
                  noticeDisabled={!isNoticeChecked}
                />
              </div>
            )}
            <button className="btn cancel-btn" onClick={() => navigate(-1)}>
              返回修改
            </button>
          </div>
        </div>
      )}

      {paymentStatus === STATUS.SUCCESS && (
        <SuccessOrError
          type={STATUS.SUCCESS}
          message={`票券已購買成功，請立即前往取票。<br/>如需開立發票請寄信至${MAIL.CONTACT_EMAIL}。`}
          titlePrefix="購買"
          successText="成功"
          successButtonText="前往取票"
          onSuccessClick={() =>
            navigate(ROUTES.TICKETS, {
              state: { defaultTab: TICKET_STATUS.PURCHASED },
            })
          }
        />
      )}
      {paymentStatus === STATUS.ERROR && (
        <SuccessOrError
          type={STATUS.ERROR}
          message="系統發生錯誤，請再試一次。"
          titlePrefix="購買"
          errorText="失敗"
          retryButtonText="前往購買票券"
          backButtonText="返回票券系統"
          onRetryClick={() => setPaymentStatus(STATUS.FORM)}
          onBackClick={() => navigate(ROUTES.HOME)}
        />
      )}
      {/* 結果不明：不提供重新付款，避免重複扣款 */}
      {paymentStatus === STATUS.PENDING && (
        <SuccessOrError
          type={STATUS.PENDING}
          message={`請稍候幾分鐘後至「我的票券」查看。<br/>若 10 分鐘後仍未看到票券，<strong>請勿重複付款</strong>，並來信 ${MAIL.CONTACT_EMAIL} 聯繫客服。`}
          titlePrefix="付款結果"
          pendingText="確認中"
          successButtonText="前往我的票券"
          backButtonText="返回票券系統"
          onSuccessClick={() =>
            navigate(ROUTES.TICKETS, {
              state: { defaultTab: TICKET_STATUS.PURCHASED },
            })
          }
          onBackClick={() => navigate(ROUTES.HOME)}
        />
      )}
    </>
  );
};
