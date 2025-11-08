import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiService } from '../../api';
import Dialog from '../../components/common/Dialog/Dialog';
import { SuccessOrError } from '../../components/common/SuccessOrError/SuccessOrError';
import {
  RecipientInfo,
  TicketDistributionProps,
  TicketInfo,
} from '../../components/interface/TicketDistribution';
import { STATUS } from '../../constants/common';
import { ROUTES } from '../../constants/routes';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLoading } from '../../contexts/LoadingContext';
import './TicketDistribution.scss';

export const TicketDistribution: React.FC<TicketDistributionProps> = ({
  ticketInfo,
}) => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [distributionStatus, setDistributionStatus] = useState<
    'form' | 'success' | 'error'
  >(STATUS.FORM);
  const { showLoading, hideLoading } = useLoading();

  // 從路由狀態或 props 獲取票券資訊
  const currentTicketInfo: TicketInfo = useMemo(() => {
    return ticketInfo || location.state?.ticketInfo;
  }, [ticketInfo, location.state]);

  // 檢查是否有訪問權限，沒有則導回首頁
  useEffect(() => {
    const canAccess = sessionStorage.getItem('canAccessTicketDistribution');

    if (canAccess === 'true') {
      // 立即清除標記，確保只能使用一次
      sessionStorage.removeItem('canAccessTicketDistribution');
    } else {
      // 如果沒有訪問標記，導回首頁
      navigate(ROUTES.TICKETS);
    }
  }, [navigate]);

  // 檢查是否有票券資訊，沒有則導回首頁
  useEffect(() => {
    if (!currentTicketInfo) {
      navigate(ROUTES.TICKETS);
    }
  }, [currentTicketInfo, navigate]);

  // 動態生成取票者狀態
  const [recipients, setRecipients] = useState<RecipientInfo[]>(() =>
    Array.from({ length: currentTicketInfo?.ticketCount || 0 }, (_, index) => {
      const ticket = currentTicketInfo?.tickets?.[index];
      const userEmail = ticket?.user?.email || '';
      const hasConsented = Boolean(ticket?.user?.consentedAt);
      const isRedeemed = Boolean(ticket?.isRedeemed);

      // distributedAndCollected: 已分出已取票 (有 consentedAt 且 isRedeemed = true) -> disabled
      // distributedNotCollected: 已分出未取票 (無 consentedAt 且 isRedeemed = true) -> 預帶但不 disabled
      // undistributed: 未分出 (isRedeemed = false) -> 不預帶
      const shouldDisable = hasConsented && isRedeemed;
      const shouldAutoFill = Boolean(userEmail);

      return {
        id: `recipient-${index + 1}`,
        email: userEmail,
        isSelected: shouldAutoFill,
        isEmailValid: shouldAutoFill,
        isDisabled: shouldDisable,
      };
    })
  );

  // Dialog 狀態
  const [isTicketDistributionDialogOpen, setTicketDistributionDialogOpen] =
    useState(false);

  // 表單錯誤狀態
  const [formError, setFormError] = useState('');

  // 如果沒有票券資訊，導回票券頁面
  if (!currentTicketInfo) {
    navigate(ROUTES.TICKETS);
    return null;
  }

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
    // 清除表單錯誤
    if (formError) setFormError('');

    setRecipients(prev =>
      prev.map(recipient => {
        if (recipient.id === recipientId) {
          // 如果是 disabled 狀態，不進行驗證，只更新 email
          if (recipient.isDisabled) {
            return {
              ...recipient,
              email,
            };
          }

          // 非 disabled 狀態才進行完整驗證
          const isEmailValid = validateEmail(email);
          const isDuplicate = checkDuplicateEmail(email, recipientId);

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

  // 檢查是否至少有一個勾選的項目（排除 disabled 的項目）
  const hasSelectedRecipients = recipients.some(
    recipient => recipient.isSelected && !recipient.isDisabled
  );

  // 檢查是否至少有一個有效的郵件（且沒有重複）
  const hasValidEmail = recipients.some(recipient => recipient.isEmailValid);

  // 計算未分出的票券數量
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const undistributedCount = useMemo(() => {
    return (
      currentTicketInfo?.tickets?.filter(ticket => !ticket.isRedeemed).length ||
      0
    );
  }, [currentTicketInfo]);

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

  // 表單驗證和分票邏輯檢查
  const handleTicketDistributionConfirm = () => {
    const selectedRecipients = recipients.filter(
      recipient => recipient.isSelected
    );

    if (selectedRecipients.length === 0) {
      setFormError('請至少輸入一位取票者資訊');
      return;
    }

    // 清除錯誤訊息並打開確認 dialog
    setFormError('');
    setTicketDistributionDialogOpen(true);
  };

  // Dialog 確認處理 - 執行分票 API
  const handleDialogConfirm = async () => {
    const selectedRecipients = recipients.filter(
      recipient => recipient.isSelected && !recipient.isDisabled
    );

    try {
      // 準備 patchTicketsSplit 的資料
      const splitData = {
        memberId: user.id, // 需要從 currentTicketInfo 或其他地方取得
        tickets: selectedRecipients.map(recipient => {
          // 找到該 recipient 在原始 recipients 陣列中的索引
          const originalIndex = recipients.findIndex(
            r => r.id === recipient.id
          );
          return {
            ticketId: currentTicketInfo.ticketIds?.[originalIndex] || '', // 從 ticketIds 取得對應的 ticketId
            email: recipient.email,
          };
        }),
      };

      // 調用分票 API
      showLoading('分票中...');
      await apiService.tickets.postTicketsSplit(splitData);
      // 分票成功，關閉 dialog 並顯示成功頁面
      setTicketDistributionDialogOpen(false);
      setDistributionStatus(STATUS.SUCCESS);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      hideLoading();
    } catch (error) {
      console.error('分票 API 失敗:', error);
      // 分票失敗，關閉 dialog 並顯示錯誤頁面
      setTicketDistributionDialogOpen(false);
      setDistributionStatus(STATUS.ERROR);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      hideLoading();
    }
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
      {distributionStatus === STATUS.FORM && (
        <form
          className="form-container distribution-container"
          onSubmit={onSubmit}
        >
          <div className="distribution-header">
            <h1>填寫取票者資訊</h1>
            <div className="distribution-header-content-alert">
              請注意：一旦分票後，此筆內的所有票券將無法申請退票與退款。
            </div>
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
                    {currentTicketInfo.ticketCount !== undistributedCount && (
                      <span className="undistributed-count">
                        （尚有 {undistributedCount} 張未分出）
                      </span>
                    )}
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
                <div
                  key={recipient.id}
                  className={`distribution-form-item ${recipient.isDisabled ? 'disabled' : ''}`}
                >
                  <input
                    id={`checkbox-${recipient.id}`}
                    type="checkbox"
                    className="email-checkbox"
                    checked={recipient.isSelected}
                    disabled={
                      recipient.isDisabled ||
                      !recipient.isEmailValid ||
                      isDuplicate
                    }
                    onChange={e =>
                      handleCheckboxChange(recipient.id, e.target.checked)
                    }
                  />
                  <div className="distribution-form-item-content">
                    <label
                      htmlFor={`checkbox-${recipient.id}`}
                      className={(() => {
                        const ticket = currentTicketInfo?.tickets?.[index];
                        const hasConsented = Boolean(ticket?.user?.consentedAt);
                        const isRedeemed = Boolean(ticket?.isRedeemed);
                        return hasConsented && isRedeemed
                          ? 'status-collected'
                          : '';
                      })()}
                    >
                      取票者{index + 1}
                      {(() => {
                        const ticket = currentTicketInfo?.tickets?.[index];
                        const hasConsented = Boolean(ticket?.user?.consentedAt);
                        const isRedeemed = Boolean(ticket?.isRedeemed);

                        if (hasConsented && isRedeemed) {
                          return '（已分出已取票）';
                        } else if (isRedeemed && !hasConsented) {
                          return '（已分出未取票，可重新分票）';
                        }
                        return '';
                      })()}
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
                      disabled={recipient.isDisabled}
                      aria-label={`取票者${index + 1}的電子郵件`}
                    />
                    {hasError && (
                      <p className="error-text">
                        {isDuplicate ? '此電子郵件已經使用過' : '輸入格式錯誤'}
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
              type="button"
              disabled={!hasValidEmail || !hasSelectedRecipients}
              onClick={handleTicketDistributionConfirm}
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
          onRetryClick={() => setDistributionStatus(STATUS.FORM)}
          onBackClick={() => navigate(ROUTES.HOME)}
        />
      )}

      <Dialog
        isOpen={isTicketDistributionDialogOpen}
        onClose={() => setTicketDistributionDialogOpen(false)}
        confirmText="確定分票"
        cancelText="取消"
        className="ticket-distribution-dialog"
        contentClassName="p-0"
        onConfirm={handleDialogConfirm}
        onCancel={handleTicketDistributionCancel}
      >
        <div className="distribution-dialog-content">
          <div className="distribution-dialog-header">
            <img className="dialog-icon" src="/images/warn.svg" alt="" />
            <h1>確認取票者資訊</h1>
            <p className="dialog-info">
              請注意：一旦分票後，此筆內的所有票券將無法申請退票與退款。
            </p>
          </div>
          <div className="distribution-dialog-info">
            {recipients
              .filter(
                recipient => recipient.isSelected && !recipient.isDisabled
              )
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
