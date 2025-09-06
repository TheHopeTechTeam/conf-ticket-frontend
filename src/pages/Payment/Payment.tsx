import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
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

import { apiService } from '../../api/fetchService';
import { MODE, STATUS } from '../../constants/common';
import { ROUTES } from '../../constants/routes';
import { useAuthContext } from '../../contexts/AuthContext';
import './Payment.scss';

export const Payment: React.FC = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<
    'form' | 'success' | 'error'
  >('form');
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
    checkSamsungPayAvailability 
  } = usePaymentMethods(
    paymentData!,
    updatePaymentReady,
    setPaymentStatus,
    user,
    navigate
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
  }, [paymentType, paymentData, checkApplePayAvailability, checkGooglePayAvailability, checkSamsungPayAvailability]);

  const {
    register,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
  });

  // 載入訂單資料
  useEffect(() => {
    const loadPaymentData = () => {
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
  }, [navigate]);

  const handleCreditCardPayment = () => {
    if (!paymentData || !user) {
      setPaymentStatus(STATUS.ERROR);
      return;
    }

    // 檢查用戶是否有完整資料，如果沒有先導向 profile 頁面
    if (!user.name) {
      navigate(ROUTES.PROFILE);
      return;
    }

    // 檢查信用卡欄位狀態
    const tappayStatus = TPDirect.card.getTappayFieldsStatus();
    const isValidCard =
      tappayStatus.status.number === 0 &&
      tappayStatus.status.expiry === 0 &&
      tappayStatus.status.ccv === 0;

    if (!isValidCard) {
      alert('請檢查信用卡資訊是否正確填寫');
      return;
    }

    TPDirect.card.getPrime(async (result: any) => {
      if (result.status !== 0) {
        alert('信用卡資訊驗證失敗，請重新檢查');
        setPaymentStatus(STATUS.ERROR);
        return;
      }

      try {
        await apiService.payments.postPayments({
          prime: result.card.prime,
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
    });
  };

  // Computed values
  const { groupPassTicket: _groupPassTicket } =
    useMemo(() => {
      if (!paymentData) return { groupPassTicket: null, groupPassQuantity: 0 };

      const ticket = paymentData.tickets.find(
        ticket => ticket.isMemberInfoRequired
      );

      return {
        groupPassTicket: ticket || null,
        groupPassQuantity: ticket?.selectedQuantity || 0,
      };
    }, [paymentData]);

  if (!paymentData) {
    return <div className="loading">載入中...</div>;
  }

  return (
    <>
      {paymentStatus === 'form' && (
        <div className="form-container payment-container">
          <h1>確認訂單</h1>

          <div className="order-content">
            {/* 票券列表 */}
            <div className="ticket-section">
              <h2>請確認您選購的票券類型與數量</h2>
              <div className="ticket-list">
                {paymentData.tickets.map(ticket => {
                  if (ticket.isMemberInfoRequired) {
                    const ticketFormData = paymentData.groupPassFormData[ticket.id] || [];
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
                      mode="view"
                      ticket={ticket}
                      quantity={ticket.selectedQuantity}
                    />
                  );
                })}
              </div>
            </div>

            <div className="order-summary">
              <p className="order-summary-title">
                共{paymentData.summary.totalQuantity}張，總計
                {paymentData.summary.totalAmount.toLocaleString()}元
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
          message="票券已購買成功，請前往我的票券查看。<br/>如需開立發票請寄信至conf@thehope.co"
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
          onRetryClick={() => setPaymentStatus('form')}
          onBackClick={() => navigate(ROUTES.HOME)}
        />
      )}
    </>
  );
};

