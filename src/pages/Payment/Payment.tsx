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

export const Payment: React.FC = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<
    'form' | 'success' | 'error'
  >(STATUS.FORM);
  const { showLoading, hideLoading } = useLoading();
  const [isWarnDialogOpen, setIsWarnDialogOpen] = useState(false);
  const [warnMessage, setWarnMessage] = useState('');
  const [isNoticeChecked, setIsNoticeChecked] = useState(false);
  const hasProcessed3DCallback = useRef(false);

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
    setPaymentStatus,
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
      if (orderNumber && status !== null) {
        hasProcessed3DCallback.current = true;
        showLoading('確認付款結果...');

        try {
          if (status === '0') {
            // 3D 驗證成功，輪詢訂單狀態
            let isCancelled = false;
            let pollCount = 0;
            const maxPolls = 5;
            const pollInterval = 1000; // 1 秒

            const pollOrder = async () => {
              if (isCancelled || pollCount >= maxPolls) {
                // 超過最大輪詢次數仍未完成
                if (pollCount >= maxPolls) {
                  hideLoading();
                  setWarnMessage('訂單處理超時，請稍後至「我的票券」確認');
                  setIsWarnDialogOpen(true);
                  setPaymentStatus(STATUS.ERROR);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  window.history.replaceState({}, '', window.location.pathname);
                }
                return;
              }

              try {
                const orderResponse =
                  await apiService.orders.getOrdersByOrderId(orderNumber);

                if (orderResponse.status === TICKET_STATUS.COMPLETED) {
                  // 訂單完成
                  hideLoading();
                  sessionStorage.removeItem('ticketOrderData');
                  setPaymentStatus(STATUS.SUCCESS);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  window.history.replaceState({}, '', window.location.pathname);
                } else if (orderResponse.status === 'failed') {
                  // 訂單失敗
                  hideLoading();
                  setWarnMessage('訂單處理失敗，請重新購買');
                  setIsWarnDialogOpen(true);
                  setPaymentStatus(STATUS.ERROR);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  window.history.replaceState({}, '', window.location.pathname);
                } else {
                  // 訂單仍在處理中，繼續輪詢
                  pollCount++;
                  if (pollCount < maxPolls) {
                    setTimeout(pollOrder, pollInterval);
                  }
                }
              } catch (error) {
                console.error('輪詢訂單失敗', error);
                hideLoading();
                setWarnMessage('付款確認失敗，請聯繫客服');
                setIsWarnDialogOpen(true);
                setPaymentStatus(STATUS.ERROR);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            };

            pollOrder();
          } else {
            // 3D 驗證失敗
            hideLoading();
            setWarnMessage('3D 驗證失敗，請重新嘗試');
            setIsWarnDialogOpen(true);
            setPaymentStatus(STATUS.ERROR);
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // 清除 URL 參數
            window.history.replaceState({}, '', window.location.pathname);
          }
        } catch (error) {
          console.error('3D 驗證後訂單確認失敗', error);
          hideLoading();
          setWarnMessage('付款確認失敗，請聯繫客服');
          setIsWarnDialogOpen(true);
          setPaymentStatus(STATUS.ERROR);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    };

    handleThreeDSecureCallback();
  }, [navigate, showLoading, hideLoading]);

  const handleCreditCardPayment = async () => {
    if (!paymentData || !user) {
      setPaymentStatus(STATUS.ERROR);
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

    try {
      showLoading('建立訂單中...');

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

      // 取得 orderId
      const createdOrderId = orderResponse.orderId;

      // 取得 Prime
      showLoading('處理付款中...');
      TPDirect.card.getPrime(async (result: any) => {
        if (result.status !== 0) {
          console.error('getPrime failed', result);
          hideLoading();
          setWarnMessage('取得付款資訊失敗，請重新檢查信用卡資訊');
          setIsWarnDialogOpen(true);
          setPaymentStatus(STATUS.ERROR);
          return;
        }

        try {
          // 呼叫付款 API
          const paymentResponse = await apiService.payment.postPayment({
            prime: result.card.prime,
            orderId: createdOrderId,
            payer: {
              name: cardholderName,
              email: user.email,
              tel: user.tel,
            },
          });

          // 檢查是否有 redirectUrl
          if (paymentResponse.redirectUrl) {
            // 有 redirectUrl，導向到 3D 驗證頁面
            window.location.href = paymentResponse.redirectUrl;
            return;
          } else {
            // 沒有 redirectUrl，表示付款失敗
            console.error('付款失敗：未取得 3D 驗證頁面');
            hideLoading();
            setWarnMessage('付款處理異常，請重試或聯繫客服');
            setIsWarnDialogOpen(true);
            setPaymentStatus(STATUS.ERROR);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        } catch (error: any) {
          console.error('付款處理失敗', error);
          hideLoading();
          setWarnMessage('交易失敗：' + error.message);
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
    </>
  );
};
