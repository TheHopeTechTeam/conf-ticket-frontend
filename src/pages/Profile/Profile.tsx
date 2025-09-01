import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../api/fetchService';
import {
  PrivacyPolicyDialog,
  UserTermsDialog,
} from '../../components/common/Dialog';
import { NotificationMessage } from '../../components/common/Notification/Notification';
import { Select } from '../../components/common/Select/Select';
import {
  CHURCH_IDENTITY_OPTIONS,
  CHURCH_OPTIONS,
  GENDER_OPTIONS,
  ValidChurchType,
} from '../../constants/profile';
import { ROUTES } from '../../constants/routes';
import { useAuthContext } from '../../contexts/AuthContext';
import './Profile.scss';
import { STATUS } from '../../constants/common';

export const Profile: React.FC = () => {
  const [showNotification, setShowNotification] = useState('');
  const navigate = useNavigate();
  const [isUserTermsDialogOpen, setUserTermsDialogOpen] = React.useState(false);
  const [isPrivacyPolicyDialogOpen, setPrivacyPolicyDialogOpen] =
    React.useState(false);
  const [isUserTermsCheckBoxDisabled, setUserTermsCheckBoxDisabled] =
    React.useState(true);
  const [isPrivacyPolicyCheckBoxDisabled, setPrivacyPolicyCheckBoxDisabled] =
    React.useState(true);
  const [isUserTermsChecked, setUserTermsChecked] = React.useState(false);
  const [isPrivacyPolicyChecked, setPrivacyPolicyChecked] =
    React.useState(false);

  const { user } = useAuthContext();
  if (user?.id) {
    console.log('User Info:', user);
  }

  useEffect(() => {
    if (user?.name) {
      const isValidChurch = Object.values(ValidChurchType).includes(
        user.location as ValidChurchType
      );

      setFields(prev => ({
        ...prev,
        fullName: user.name,
        tel: user.tel,
        gender: user.gender,
        churchIdentity: user.role,
        church: isValidChurch ? user.location : ValidChurchType.OTHER,
        churchName: isValidChurch ? '' : user.location,
      }));
    }
  }, [user]);

  const [fields, setFields] = useState({
    fullName: '',
    tel: '',
    churchName: '',
    gender: '',
    church: '',
    churchIdentity: '',
  });

  const [errors, setErrors] = useState({
    fullName: '',
    tel: '',
    churchName: '',
    gender: '',
    church: '',
    churchIdentity: '',
  });

  const handleUserTermsConfirm = () => {
    setUserTermsDialogOpen(false);
    setUserTermsCheckBoxDisabled(false);
    setUserTermsChecked(true);
  };

  const handleUserTermsCancel = () => {
    setUserTermsDialogOpen(false);
  };

  const handlePrivacyPolicyConfirm = () => {
    setPrivacyPolicyCheckBoxDisabled(false);
    setPrivacyPolicyDialogOpen(false);
    setPrivacyPolicyChecked(true);
  };

  const handlePrivacyPolicyCancel = () => {
    setPrivacyPolicyDialogOpen(false);
  };

  // 儲存個人檔案
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 驗證所有必填欄位
    const newErrors = {
      fullName: validateField(fields.fullName, 'fullName'),
      tel: validateField(fields.tel, 'tel'),
      churchName:
        fields.church === ValidChurchType.OTHER
          ? validateField(fields.churchName, 'churchName')
          : '',
      gender: validateField(fields.gender, 'gender'),
      church: validateField(fields.church, 'church'),
      churchIdentity: validateField(fields.churchIdentity, 'churchIdentity'),
    };

    setErrors(newErrors);

    // 檢查是否有錯誤
    const hasErrors = Object.values(newErrors).some(error => error !== '');

    // 檢查checkbox是否已勾選
    const checkboxError = !isUserTermsChecked || !isPrivacyPolicyChecked;

    if (!hasErrors && !checkboxError) {
      try {
        await apiService.members.patchMembers(user.id, {
          email: user.email,
          name: fields.fullName,
          gender: fields.gender,
          tel: fields.tel,
          role: fields.churchIdentity,
          location:
            fields.church === ValidChurchType.OTHER
              ? fields.churchName
              : fields.church,
        });
        // 儲存個人檔案成功後導向 main
        sessionStorage.setItem('fromProfile', 'true');
        navigate(ROUTES.MAIN, { replace: true });
      } catch (error) {
        console.error('Save profile failed:', error);
      }
    } else if (checkboxError) {
      alert('請先閱讀並同意使用者條款和隱私權保護政策');
    }
  };

  // 欄位驗證
  const validateField = (value: string, fieldName: keyof typeof fields) => {
    if (!value.trim()) {
      const errorMessages = {
        fullName: '請輸入姓名',
        tel: '請輸入電話',
        churchName: '請輸入教會名稱',
        gender: '請選擇性別',
        church: '請選擇所屬教會',
        churchIdentity: '請選擇所屬教會身份',
      };
      return errorMessages[fieldName];
    }
    return '';
  };

  // 通用輸入變更處理
  const handleFieldChange =
    (fieldName: keyof typeof fields) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFields(prev => ({ ...prev, [fieldName]: value }));

      // 即時驗證
      if (errors[fieldName]) {
        const requiredMsg = validateField(value, fieldName);
        setErrors(prev => ({ ...prev, [fieldName]: requiredMsg }));
      }
    };

  // 通用 blur 驗證
  const handleFieldBlur = (fieldName: keyof typeof fields) => () => {
    const requiredMsg = validateField(fields[fieldName], fieldName);
    setErrors(prev => ({ ...prev, [fieldName]: requiredMsg }));
  };

  // 通用 Select 變更處理
  const handleSelectChange =
    (fieldName: keyof typeof fields) => (value: string) => {
      setFields(prev => ({ ...prev, [fieldName]: value }));

      // 即時驗證
      if (errors[fieldName]) {
        const requiredMsg = validateField(value, fieldName);
        setErrors(prev => ({ ...prev, [fieldName]: requiredMsg }));
      }
    };

  // 組件邏輯
  return (
    <div>
      {showNotification && (
        <NotificationMessage
          status={STATUS.SUCCESS}
          text="您已成功註冊The Hope Conference票券系統會員。"
          onClose={() => setShowNotification('')}
        />
      )}

      <form
        onSubmit={handleSubmit}
        className="form-container profile-container"
      >
        <div className="profile-header">
          <h1>{user.name ? '編輯' : '建立'}個人檔案</h1>
          <p>
            為提供後續良好的特會報到體驗，請填寫以下資訊，讓我們更多認識您。
          </p>
        </div>
        <div className="profile-form">
          <div className="form-item">
            <div className="form-label">
              <label htmlFor="name">電子郵件</label>
            </div>
            <input
              id="name"
              className={`form-input`}
              type="text"
              value={user.email}
              aria-required
              disabled
            />
          </div>
          <div className="form-item">
            <div className="form-label">
              <label htmlFor="name">姓名</label>
              <p className="invaild-text">必填</p>
            </div>
            <input
              id="name"
              className={`form-input ${errors.fullName ? 'invalid' : 'valid'}`}
              type="text"
              onChange={handleFieldChange('fullName')}
              onBlur={handleFieldBlur('fullName')}
              value={fields.fullName}
              placeholder="請輸入姓名"
              aria-label="請輸入姓名"
              aria-required
              required
            />
            {errors.fullName && (
              <p className="invaild-text">{errors.fullName}</p>
            )}
          </div>
          <div className="form-item">
            <div className="form-label">
              <label htmlFor="tel">電話</label>
              <p className="invaild-text">必填</p>
            </div>
            <input
              id="tel"
              className={`form-input ${errors.tel ? 'invalid' : 'valid'}`}
              type="text"
              onChange={handleFieldChange('tel')}
              onBlur={handleFieldBlur('tel')}
              value={fields.tel}
              placeholder="請輸入電話"
              aria-label="請輸入電話"
              aria-required
              required
            />
            {errors.tel && <p className="invaild-text">{errors.tel}</p>}
          </div>
          <div className="form-item">
            <div className="form-label">
              <label htmlFor="gender">性別</label>
              <p className="invaild-text">必填</p>
            </div>
            <Select
              options={GENDER_OPTIONS}
              value={fields.gender}
              onChange={handleSelectChange('gender')}
              placeholder="請選擇"
            />
            {errors.gender && <p className="invaild-text">{errors.gender}</p>}
          </div>
          <div className="form-item">
            <div className="form-label">
              <label htmlFor="church">所屬教會</label>
              <p className="invaild-text">必填</p>
            </div>
            <Select
              options={CHURCH_OPTIONS}
              value={fields.church}
              onChange={handleSelectChange('church')}
              placeholder="請選擇"
            />
            {errors.church && <p className="invaild-text">{errors.church}</p>}
          </div>
          {fields.church === ValidChurchType.OTHER && (
            <div className="form-item">
              <div className="form-label">
                <label htmlFor="church-name">所屬教會姓名</label>
                <p className="invaild-text">必填</p>
              </div>
              <input
                id="church-name"
                className={`form-input ${errors.churchName ? 'invalid' : 'valid'}`}
                type="text"
                onChange={handleFieldChange('churchName')}
                onBlur={handleFieldBlur('churchName')}
                value={fields.churchName}
                placeholder="請輸入教會名稱"
                aria-label="請輸入教會名稱"
                aria-required
                required={fields.church === ValidChurchType.OTHER}
              />
              {errors.churchName && (
                <p className="invaild-text">{errors.churchName}</p>
              )}
            </div>
          )}
          <div className="form-item">
            <div className="form-label">
              <label htmlFor="church-identity">所屬教會身份</label>
              <p className="invaild-text">必填</p>
            </div>
            <Select
              options={CHURCH_IDENTITY_OPTIONS}
              value={fields.churchIdentity}
              onChange={handleSelectChange('churchIdentity')}
              placeholder="請選擇"
            />
            {errors.churchIdentity && (
              <p className="invaild-text">{errors.churchIdentity}</p>
            )}
          </div>
        </div>
        <div className="profile-checkbox-button">
          <div className="profile-checkbox">
            <div>
              <input
                type="checkbox"
                id="user-terms"
                disabled={isUserTermsCheckBoxDisabled}
                checked={isUserTermsChecked}
                onChange={e => setUserTermsChecked(e.target.checked)}
              />
              <label htmlFor="user-terms">我已閱讀並同意</label>
              <button
                type="button"
                className="link-button"
                onClick={() => setUserTermsDialogOpen(true)}
              >
                使用者條款
              </button>
            </div>
            <div>
              <input
                type="checkbox"
                id="privacy-policy"
                disabled={isPrivacyPolicyCheckBoxDisabled}
                checked={isPrivacyPolicyChecked}
                onChange={e => setPrivacyPolicyChecked(e.target.checked)}
              />
              <label htmlFor="privacy-policy">我已閱讀並同意</label>
              <button
                type="button"
                className="link-button"
                onClick={() => setPrivacyPolicyDialogOpen(true)}
              >
                隱私權保護政策
              </button>
            </div>
          </div>
          <div className="profile-button">
            <button className="btn send-btn" type="submit">
              儲存個人檔案
            </button>
          </div>
        </div>
      </form>

      <UserTermsDialog
        isOpen={isUserTermsDialogOpen}
        onClose={() => setUserTermsDialogOpen(false)}
        onConfirm={handleUserTermsConfirm}
        onCancel={handleUserTermsCancel}
      />
      <PrivacyPolicyDialog
        isOpen={isPrivacyPolicyDialogOpen}
        onClose={() => setPrivacyPolicyDialogOpen(false)}
        onConfirm={handlePrivacyPolicyConfirm}
        onCancel={handlePrivacyPolicyCancel}
      />
    </div>
  );
};
