import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SuccessOrError } from '../../components/common/SuccessOrError/SuccessOrError';
import { ROUTES } from '../../constants/routes';
import { MAIL, STATUS } from '../../constants/common';

/**
 * 3D 驗證回調頁面
 * TapPay 會在 3D 驗證完成後導回此頁面，帶上 status 查詢參數 (0 表示成功)
 *
 * 注意：此版本直接信任 URL 參數，不安全（參數可被偽造）
 * 生產環境建議呼叫後端 API 確認訂單狀態
 */
export const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'error'>('error');

  useEffect(() => {
    // 從 URL 取得 TapPay 回傳的 status (0 = 成功)
    const status = searchParams.get('status');

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
  }, [searchParams]);

  if (paymentStatus === STATUS.SUCCESS) {
    return (
      <SuccessOrError
        type={STATUS.SUCCESS}
        message={`票券已購買成功，請前往我的票券查看。<br/>如需開立發票請寄信至${MAIL.CONTACT_EMAIL}。`}
        titlePrefix="購買"
        successText="成功"
        successButtonText="前往我的票券"
        onSuccessClick={() => navigate(ROUTES.TICKETS)}
      />
    );
  }

  return (
    <SuccessOrError
      type={STATUS.ERROR}
      message="3D 驗證失敗，請再試一次或聯繫發卡銀行。"
      titlePrefix="付款"
      errorText="失敗"
      retryButtonText="返回付款頁面"
      backButtonText="返回票券系統"
      onRetryClick={() => {
        // 嘗試恢復付款資料
        const pendingPayment = sessionStorage.getItem('pending3DPayment');
        if (pendingPayment) {
          try {
            const { paymentData } = JSON.parse(pendingPayment);
            navigate(ROUTES.PAYMENT, { state: { ticketOrderData: paymentData } });
          } catch (error) {
            console.error('恢復付款資料失敗:', error);
            navigate(ROUTES.BOOKING);
          }
        } else {
          navigate(ROUTES.BOOKING);
        }
      }}
      onBackClick={() => navigate(ROUTES.HOME)}
    />
  );
};
