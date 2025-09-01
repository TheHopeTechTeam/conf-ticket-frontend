import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Dialog from '../../components/common/Dialog/Dialog';
import { SuccessOrError } from '../../components/common/SuccessOrError/SuccessOrError';
import {
  RecipientInfo,
  TicketDistributionProps,
  TicketInfo,
} from '../../components/interface/TicketDistribution';
import { ROUTES } from '../../constants/routes';
import './TicketDistribution.scss';
import { STATUS } from '../../constants/common';

export const TicketDistribution: React.FC<TicketDistributionProps> = ({
  ticketInfo,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [distributionStatus, setDistributionStatus] = useState<
    'form' | 'success' | 'error'
  >('form');

  // 從路由狀態或 props 獲取票券資訊
  const currentTicketInfo: TicketInfo = useMemo(() => {
    return (
      ticketInfo ||
      location.state?.ticketInfo || {
        ticketType: 'CREATIVE PASS',
        ticketCount: 2,
        useDate: '2026.05.01-2026.05.03',
      }
    );
  }, [ticketInfo, location.state]);

  // 動態生成取票者狀態
  const [recipients, setRecipients] = useState<RecipientInfo[]>(() =>
    Array.from({ length: currentTicketInfo.ticketCount }, (_, index) => ({
      id: `recipient-${index + 1}`,
      email: '',
      isSelected: false,
      isEmailValid: false,
    }))
  );

  // Dialog 狀態
  const [isTicketDistributionDialogOpen, setTicketDistributionDialogOpen] =
    useState(false);

  // 表單錯誤狀態
  const [formError, setFormError] = useState('');

  // 郵件驗證函式
  const validateEmail = (email: string): boolean => {
    if (!email.trim()) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 檢查郵件是否重複
  const checkDuplicateEmail = (email: string, currentId: string): boolean => {
    return recipients.some(
      recipient =>
        recipient.id !== currentId &&
        recipient.email.toLowerCase() === email.toLowerCase() &&
        recipient.email.trim() !== ''
    );
  };

  // 處理郵件輸入變更
  const handleEmailChange = (recipientId: string, email: string) => {
    const isEmailValid = validateEmail(email);
    const isDuplicate = checkDuplicateEmail(email, recipientId);

    // 清除表單錯誤
    if (formError) setFormError('');

    setRecipients(prev =>
      prev.map(recipient => {
        if (recipient.id === recipientId) {
          // 如果郵件無效或重複，取消勾選 checkbox
          const shouldUncheck = !isEmailValid || isDuplicate;
          return {
            ...recipient,
            email,
            isEmailValid: isEmailValid && !isDuplicate,
            isSelected: shouldUncheck ? false : recipient.isSelected,
          };
        }
        return recipient;
      })
    );
  };

  // 處理 checkbox 狀態變更
  const handleCheckboxChange = (recipientId: string, isChecked: boolean) => {
    // 清除表單錯誤
    if (formError) setFormError('');

    setRecipients(prev =>
      prev.map(recipient => {
        if (recipient.id === recipientId) {
          // 只有當郵件有效時才允許勾選
          return {
            ...recipient,
            isSelected: recipient.isEmailValid ? isChecked : false,
          };
        }
        return recipient;
      })
    );
  };

  // 檢查是否至少有一個勾選的項目
  const hasSelectedRecipients = recipients.some(
    recipient => recipient.isSelected
  );

  // 檢查是否至少有一個有效的郵件（且沒有重複）
  const hasValidEmail = recipients.some(recipient => recipient.isEmailValid);

  // 表單提交處理
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const selectedRecipients = recipients.filter(
      recipient => recipient.isSelected
    );

    if (selectedRecipients.length === 0) {
      setFormError('請至少輸入一位取票者資訊');
      return;
    }

    // 清除錯誤訊息並顯示確認 Dialog
    setFormError('');
    setTicketDistributionDialogOpen(true);
  };

  // Dialog 確認處理
  const handleTicketDistributionConfirm = () => {
    const selectedRecipients = recipients.filter(
      recipient => recipient.isSelected
    );

    console.log('分票資訊:', {
      ticketInfo: currentTicketInfo,
      selectedRecipients,
    });

    setTicketDistributionDialogOpen(false);
    setDistributionStatus(STATUS.ERROR);
  };

  // Dialog 取消處理
  const handleTicketDistributionCancel = () => {
    setTicketDistributionDialogOpen(false);
  };

  // 返回上一頁
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <>
      {distributionStatus === 'form' && (
        <form
          className="form-container distribution-container"
          onSubmit={onSubmit}
        >
          <div className="distribution-header">
            <h1>填寫取票者資訊</h1>
            <div className="distribution-header-content">
              <p className="distribution-header-content-title">
                您要分票的票券資訊為：
              </p>
              <div className="distribution-header-content-info">
                <div className="distribution-header-content-info-item">
                  <p className="distribution-header-content-info-item-label">
                    票券票種
                  </p>
                  <p className="distribution-header-content-info-item-content">
                    {currentTicketInfo.ticketType}
                  </p>
                </div>
                <div className="distribution-header-content-info-item">
                  <p className="distribution-header-content-info-item-label">
                    票券張數
                  </p>
                  <p className="distribution-header-content-info-item-content">
                    {currentTicketInfo.ticketCount}
                  </p>
                </div>
                <div className="distribution-header-content-info-item">
                  <p className="distribution-header-content-info-item-label">
                    使用日期
                  </p>
                  <p className="distribution-header-content-info-item-content">
                    {currentTicketInfo.useDate}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="distribution-form">
            <p className="distribution-form-title">
              請勾選要分出的票券，並填寫取票者的電子郵件，系統將自動發送取票資訊至填寫的信箱。
            </p>

            {/* 動態生成表單項目 */}
            {recipients.map((recipient, index) => {
              const isDuplicate = checkDuplicateEmail(
                recipient.email,
                recipient.id
              );
              const hasError =
                recipient.email.trim() !== '' &&
                (!recipient.isEmailValid || isDuplicate);

              return (
                <div key={recipient.id} className="distribution-form-item">
                  <input
                    id={`checkbox-${recipient.id}`}
                    type="checkbox"
                    className="email-checkbox"
                    checked={recipient.isSelected}
                    disabled={!recipient.isEmailValid || isDuplicate}
                    onChange={e =>
                      handleCheckboxChange(recipient.id, e.target.checked)
                    }
                  />
                  <div className="distribution-form-item-content">
                    <label htmlFor={`checkbox-${recipient.id}`}>
                      取票者{index + 1}
                    </label>
                    <input
                      id={`email-${recipient.id}`}
                      className={`form-input ${hasError ? 'invalid' : ''}`}
                      type="email"
                      placeholder="請輸入電子郵件"
                      value={recipient.email}
                      onChange={e =>
                        handleEmailChange(recipient.id, e.target.value)
                      }
                      aria-label={`取票者${index + 1}的電子郵件`}
                    />
                    {hasError && (
                      <p className="error-text">
                        {isDuplicate
                          ? '此電子郵件已經使用過'
                          : '請輸入有效的電子郵件格式'}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* 表單錯誤訊息 */}
            {formError && (
              <div className="form-error-container">
                <p className="error-text">{formError}</p>
              </div>
            )}
          </div>

          <div className="distribution-footer">
            <button
              className={`btn send-btn ${
                !hasValidEmail || !hasSelectedRecipients ? 'disabled' : ''
              }`}
              type="submit"
              disabled={!hasValidEmail || !hasSelectedRecipients}
            >
              前往分票
            </button>
            <button
              className="btn cancel-btn"
              type="button"
              onClick={handleGoBack}
            >
              返回
            </button>
          </div>
        </form>
      )}

      {distributionStatus === STATUS.SUCCESS && (
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

      {distributionStatus === STATUS.ERROR && (
        <SuccessOrError
          type="error"
          message="系統發生錯誤，請再試一次。"
          titlePrefix="分票"
          errorText="失敗"
          retryButtonText="再試一次"
          backButtonText="返回票券系統"
          onRetryClick={() => setDistributionStatus('form')}
          onBackClick={() => navigate(ROUTES.HOME)}
        />
      )}

      <Dialog
        isOpen={isTicketDistributionDialogOpen}
        onClose={() => setTicketDistributionDialogOpen(false)}
        confirmText="確定分票"
        cancelText="取消"
        className="ticket-distribution-dialog"
        onConfirm={handleTicketDistributionConfirm}
        onCancel={handleTicketDistributionCancel}
      >
        <div className="distribution-dialog-content">
          <div className="distribution-dialog-header">
            <img
              className="dialog-icon"
              src="/src/assets/images/warn.svg"
              alt=""
            />
            <h1>確認取票者資訊</h1>
            <p>票券一旦分出，將歸戶至取票者的帳戶，無法再次分票或申請退票</p>
          </div>
          <div className="distribution-dialog-info">
            {recipients
              .filter(recipient => recipient.isSelected)
              .map((recipient, index) => (
                <div
                  key={recipient.id}
                  className="distribution-dialog-info-item"
                >
                  <p className="distribution-dialog-info-item-label">
                    取票者{index + 1}電子郵件
                  </p>
                  <p className="distribution-dialog-info-item-content">
                    {recipient.email}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </Dialog>
    </>
  );
};
