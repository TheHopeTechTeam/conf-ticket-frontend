import React, { useEffect, useMemo, useState } from 'react';
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
  const [orderId, setOrderId] = useState<string>('');
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
      const urlParams = new URLSearchParams(window.location.search);
      const orderNumber = urlParams.get('order_number');
      const status = urlParams.get('status');

      // 如果 URL 中有 order_number 和 status，表示是從 3D 驗證頁面返回
      if (orderNumber && status !== null) {
        showLoading('確認付款結果...');

        try {
          if (status === '0') {
            // 3D 驗證成功，使用 order_number 確認訂單
            const orderResponse =
              await apiService.orders.getOrdersByOrderId(orderNumber);
            console.log('3D 驗證訂單回應:', orderResponse);

            // 檢查訂單狀態是否為 completed
            if (orderResponse.status === 'completed') {
              hideLoading();

              // 清除暫存資料
              sessionStorage.removeItem('ticketOrderData');

              setPaymentStatus(STATUS.SUCCESS);
              window.scrollTo({ top: 0, behavior: 'smooth' });

              // 清除 URL 參數
              window.history.replaceState({}, '', window.location.pathname);
            } else {
              // 訂單狀態不是 completed
              hideLoading();
              setWarnMessage(
                `訂單狀態異常：${orderResponse.status || '未知狀態'}`
              );
              setIsWarnDialogOpen(true);
              setPaymentStatus(STATUS.ERROR);
              window.scrollTo({ top: 0, behavior: 'smooth' });

              // 清除 URL 參數
              window.history.replaceState({}, '', window.location.pathname);
            }
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
      console.log('開始建立訂單');

      // 先建立訂單
      const response = await apiService.orders.postOrderCreate({
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
      if (!response.orderId) {
        hideLoading();
        setWarnMessage('建立訂單失敗，請重試');
        setIsWarnDialogOpen(true);
        setPaymentStatus(STATUS.ERROR);
        return;
      }

      // 儲存 orderId
      setOrderId(response.orderId);
      console.log('訂單建立成功，orderId:', response.orderId);

      // 取得 Prime
      showLoading('處理付款中...');
      TPDirect.card.getPrime(async (result: any) => {
        console.log('getPrime result', result);

        if (result.status !== 0) {
          console.error('getPrime failed', result);
          hideLoading();
          setWarnMessage('取得付款資訊失敗，請重新檢查信用卡資訊');
          setIsWarnDialogOpen(true);
          setPaymentStatus(STATUS.ERROR);
          return;
        }

        try {
          console.log('開始處理付款，prime:', result.card.prime);

          // 呼叫付款 API
          const response = await apiService.payment.postPayment({
            prime: result.card.prime,
            orderId: orderId,
            payer: {
              name: cardholderName,
              email: user.email,
              tel: user.tel,
            },
          });

          // 檢查是否有 redirectUrl
          if (response.redirectUrl) {
            // 有 redirectUrl，導向到 3D 驗證頁面
            console.log('導向 3D 驗證頁面:', response.redirectUrl);
            window.location.href = response.redirectUrl;
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
                總計
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

          {/* 按鈕區 */}
          <div className="payment-buttons">
            {paymentType === PAYMENT_TYPES.CREDIT_CARD ? (
              <button
                className="btn send-btn"
                onClick={handleCreditCardPayment}
                disabled={!isCreditCardPaymentSupported}
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
                />
              </div>
            )}
            <button
              className="btn cancel-btn"
              onClick={() => navigate(ROUTES.BOOKING)}
            >
              返回修改
            </button>
          </div>
        </div>
      )}

      {paymentStatus === STATUS.SUCCESS && (
        <SuccessOrError
          type={STATUS.SUCCESS}
          message={`票券已購買成功，請前往我的票券查看。<br/>如需開立發票請寄信至${MAIL.CONTACT_EMAIL}。`}
          titlePrefix="購買"
          successText="成功"
          successButtonText="前往我的票券"
          onSuccessClick={() => navigate(ROUTES.TICKETS)}
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
