import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Dialog from '../../components/common/Dialog/Dialog';
import { SuccessOrError } from '../../components/common/SuccessOrError/SuccessOrError';
import { ROUTES } from '../../constants/routes';
import './Refund.scss';
import { STATUS } from '../../constants/common';

export const Refund: React.FC = () => {
  const navigate = useNavigate();
  const [isRefundDialogOpen, setRefundDialogOpen] = React.useState(false);
  const [isRefundCheckBoxDisabled, setRefundCheckBoxDisabled] =
    React.useState(true);
  const [isCheckboxChecked, setIsCheckboxChecked] = React.useState(false);
  const [refundStatus, setRefundStatus] = useState<
    'form' | 'success' | 'error'
  >('form');

  const handleRefundConfirm = () => {
    setRefundDialogOpen(false);
    setRefundCheckBoxDisabled(false); // 閱讀完條款後，啟用 checkbox
  };

  const handleRefundCancel = () => {
    setRefundDialogOpen(false);
  };

  const handleCheckboxChange = () => {
    setIsCheckboxChecked(!isCheckboxChecked);
  };

  // 確定退票
  const handleRefund = () => {
    setRefundStatus(STATUS.SUCCESS);
  };

  // 組件邏輯
  return (
    <>
      {refundStatus === 'form' && (
        <div className="form-container refund-container">
          <div className="refund-header">
            <h1>確認退票資訊</h1>
            <div className="refund-header-content">
              <p className="refund-header-content-title">
                退票申請前，請詳閱以下退票需知：
              </p>
              <div>
                <ul className="refund-header-content-list">
                  <li>
                    <span className="number">1.</span>退款將會酌收10%手續費
                  </li>
                  <li>
                    <span className="number">2.</span>將於 20
                    個工作天退款至原先付款的方式
                  </li>
                  <li>
                    <span className="number">3.</span>
                    辦理退票後，銀行入帳時間會因機構不同略有差異，請以銀行回報為準。若原付款交易超過
                    180
                    天，因銀行端技術限制可能需透過其他方式退費，具體方式將另行通知。
                  </li>
                  <li>
                    <span className="number">4.</span>
                    若有疑問請來信 conference@thehope.co
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="refund-content">
            <p className="refund-content-title">請確認您欲申請退票之資訊：</p>
            <div className="refund-content-info">
              <div className="refund-content-info-item">
                <p className="refund-content-info-item-label">票券票種</p>
                <p className="refund-content-info-item-content">
                  CREATIVE PASS
                </p>
              </div>
              <div className="refund-content-info-item">
                <p className="refund-content-info-item-label">票券張數</p>
                <p className="refund-content-info-item-content">2</p>
              </div>
              <div className="refund-content-info-item">
                <p className="refund-content-info-item-label">訂單編號</p>
                <p className="refund-content-info-item-content">1139475023</p>
              </div>
              <div className="refund-content-info-item">
                <p className="refund-content-info-item-label">使用日期</p>
                <p className="refund-content-info-item-content">
                  2026.05.01-2026.05.03
                </p>
              </div>
            </div>
          </div>
          <div className="refund-checkbox-container">
            <input
              type="checkbox"
              id="refund"
              className="refund-checkbox"
              checked={isCheckboxChecked}
              onChange={handleCheckboxChange}
              disabled={isRefundCheckBoxDisabled}
            />
            <label htmlFor="refund">我已閱讀並同意</label>
            <button
              className="refund-terms-link"
              onClick={() => setRefundDialogOpen(true)}
            >
              退票條款
            </button>
          </div>
          <div className="refund-button">
            <button
              className="btn send-btn"
              disabled={!isCheckboxChecked}
              onClick={handleRefund}
            >
              確定退票
            </button>
            <button className="btn cancel-btn">取消</button>
          </div>

          <Dialog
            isOpen={isRefundDialogOpen}
            onClose={() => setRefundDialogOpen(false)}
            title1="退票條款"
            confirmText="我同意"
            cancelText="取消"
            onConfirm={handleRefundConfirm}
            onCancel={handleRefundCancel}
            requireScrollToBottom={true} // 啟用滾動到底部功能
          >
            <div>
              <p className="mb-4">一、退票手續費</p>
              <ul className="dialog-content-list">
                <li>
                  <span className="number">• </span>
                  各種票種退票均收取票面金額 10% 的手續費。
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-4">二、退換票規定</p>
              <ul className="dialog-content-list">
                <li>
                  <span className="number">• </span>
                  活動開始前 10 天內，不提供退票服務。
                </li>
                <li>
                  <span className="number">• </span>
                  由於團體票為折扣票，並不開放分開退票，只能進行整筆訂單退票。
                </li>
                <li>
                  <span className="number">• </span>
                  活動不開放更換票種，若需要換票，請退掉原先的票券後購買新的票券。
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-4">三、退票期限</p>
              <ul className="dialog-content-list">
                <li>
                  <span className="number">• </span>
                  若活動於 2025 年 5 月 1 日起始，則最晚退票時間為 2025 年 4 月
                  20 日 23:59。
                </li>
                <li>
                  <span className="number">• </span>
                  「前十天」指的是不包含活動當天，即活動前第 10 天為最後退票日。
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-4">四、退票方式</p>
              <ul className="dialog-content-list">
                <li>
                  <span className="number">• </span>
                  退票款項將於 20 天內退回原付款方式。
                </li>
                <li>
                  <span className="number">• </span>若原付款交易超過 180
                  天，由於銀行端技術限制可能需透過其他方式退費，具體方式將另行通知。
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-4">五、票券使用限制</p>
              <ul className="dialog-content-list">
                <li>
                  <span className="number">• </span>
                  每張電子票僅能使用一次，完成 Check-in 後即視為已使用。
                </li>
                <li>
                  <span className="number">• </span>進場需透過 Conference App
                  進行實名驗證，資料須與購票時一致。
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-4">六、不可退票情形</p>
              <ul className="dialog-content-list">
                <li>
                  <span className="number">• </span>
                  票券在購買後轉售、轉讓者，或已分票、取票者，恕不接受退票。
                </li>
                <li>
                  <span className="number">• </span>若活動已開始（2025 年 4 月
                  30 日 15:00後）或票券已使用，恕不接受任何理由之退票。
                </li>
              </ul>
            </div>
          </Dialog>
        </div>
      )}
      {refundStatus === STATUS.SUCCESS && (
        <SuccessOrError
          type={STATUS.SUCCESS}
          useList={true}
          message="• 取件資訊已寄至您填寫的信箱，請通知取票者查收信件並開通票券。<br/>• 完成後可至「購票系統」→「我的票券」→「已取票」查看。"
          titlePrefix="分票"
          successText="成功"
          successButtonText="返回我的票券"
          onSuccessClick={() => navigate(ROUTES.TICKETS)}
        />
      )}

      {refundStatus === STATUS.ERROR && (
        <SuccessOrError
          type={STATUS.ERROR}
          message="系統發生錯誤，請再試一次。"
          titlePrefix="分票"
          errorText="失敗"
          retryButtonText="再試一次"
          backButtonText="返回票券系統"
          onRetryClick={() => setRefundStatus('form')}
          onBackClick={() => navigate(ROUTES.MAIN)}
        />
      )}
    </>
  );
};
