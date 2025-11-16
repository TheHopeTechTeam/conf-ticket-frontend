import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
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

export const Payment: React.FC = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<
    'form' | 'success' | 'error'
  >(STATUS.FORM);
  const { showLoading, hideLoading } = useLoading();
  const [isWarnDialogOpen, setIsWarnDialogOpen] = useState(false);
  const [warnMessage, setWarnMessage] = useState('');

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
    setupSamsungPay,
    checkApplePayAvailability,
    checkGooglePayAvailability,
    checkSamsungPayAvailability,
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
      case PAYMENT_TYPES.SAMSUNG_PAY:
        checkSamsungPayAvailability();
        break;
    }
  }, [
    paymentType,
    paymentData,
    checkApplePayAvailability,
    checkGooglePayAvailability,
    checkSamsungPayAvailability,
  ]);

  const {
    register,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
  });

  // 檢查是否為 3D 驗證回調
  useEffect(() => {
    const status = searchParams.get('status');

    if (status !== null) {
      console.log('[3D 驗證回調] 收到 status:', status);

      if (status === '0') {
        console.log('[3D 驗證回調] 付款成功');

        // 清除暫存資料
        sessionStorage.removeItem('pending3DPayment');
        sessionStorage.removeItem('ticketOrderData');

        setPaymentStatus(STATUS.SUCCESS);
      } else {
        console.error('[3D 驗證回調] 付款失敗，status:', status);

        // 清除暫存資料
        sessionStorage.removeItem('pending3DPayment');

        setPaymentStatus(STATUS.ERROR);
      }
    }
  }, [searchParams]);

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

  const handleCreditCardPayment = () => {
    if (!paymentData || !user) {
      setPaymentStatus(STATUS.ERROR);
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

    // 儲存付款資料，以防 3D 驗證跳轉後需要恢復狀態
    sessionStorage.setItem(
      'pending3DPayment',
      JSON.stringify({
        userId: user.id,
        paymentData: paymentData,
        timestamp: Date.now(),
      })
    );

    showLoading('處理付款中...');

    // 使用 TapPay 的 getPrime 取得付款 token
    TPDirect.card.getPrime(async (result: any) => {
      console.log('[付款流程] Step 1: getPrime result', result);

      if (result.status !== 0) {
        console.error('[付款流程] Step 1 失敗: getPrime failed', result);
        hideLoading();
        sessionStorage.removeItem('pending3DPayment');
        setWarnMessage('信用卡資訊驗證失敗，請重新檢查');
        setIsWarnDialogOpen(true);
        setPaymentStatus(STATUS.ERROR);
        return;
      }

      console.log('[付款流程] Step 1 成功: Prime 取得成功', result.card.prime);

      try {
        console.log('[付款流程] Step 2: 開始呼叫後端 API');
        const response = await apiService.orders.postOrderCreate({
          memberId: user.id,
          prime: result.card.prime,
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

        console.log('[付款流程] Step 2 成功: 訂單建立成功', response);
        hideLoading();

        // 清除暫存資料
        sessionStorage.removeItem('pending3DPayment');
        sessionStorage.removeItem('ticketOrderData');

        setPaymentStatus(STATUS.SUCCESS);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (error: any) {
        console.error('[付款流程] Step 2 失敗: 後端 API 失敗', error);
        hideLoading();

        // 如果後端回傳的是 3D 驗證 URL，則進行跳轉
        // 注意：這部分需要根據你們後端實際的回應格式調整
        if (error.response?.data?.payment_url) {
          console.log('[3D 驗證] 需要進行 3D 驗證，導向銀行頁面');
          // 跳轉到 3D 驗證頁面（會保留 sessionStorage 中的資料）
          window.location.href = error.response.data.payment_url;
          return;
        }

        // 一般錯誤處理
        sessionStorage.removeItem('pending3DPayment');
        console.error('Payment failed:', error);
        setPaymentStatus(STATUS.ERROR);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
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
                            quantity={ticket.selectedQuantity}
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
                {paymentData?.summary.totalAmount.toLocaleString()}元
              </p>
            </div>
          </div>

          <div className="payment-section">
            <PaymentSelect
              value={paymentType}
              onChange={handlePaymentTypeChange}
            />
            {paymentType === PAYMENT_TYPES.CREDIT_CARD && (
              <CreditCard
                paymentType={paymentType}
                register={register}
                errors={errors}
                creditCardStatus={creditCardStatus}
              />
            )}
          </div>

          {/* 按鈕區 */}
          <div className="payment-buttons">
            {paymentType === PAYMENT_TYPES.CREDIT_CARD ? (
              <button
                className="btn send-btn"
                onClick={handleCreditCardPayment}
              >
                前往付款
              </button>
            ) : (
              <div className="other-payment-method">
                <PayButton
                  paymentType={paymentType}
                  setupGooglePay={setupGooglePay}
                  setupApplePay={setupApplePay}
                  setupSamsungPay={setupSamsungPay}
                  isApplePayReady={paymentReady.isApplePayReady}
                  isGooglePayReady={paymentReady.isGooglePayReady}
                  isSamsungPayReady={paymentReady.isSamsungPayReady}
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
