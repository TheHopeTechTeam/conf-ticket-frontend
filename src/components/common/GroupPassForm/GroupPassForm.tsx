import React, { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { apiService } from '../../../api';
import { Option } from '../../../components/interface/Option';
import { MODE } from '../../../constants/common';
import { GroupPassFormData } from '../../../types/payment';
import { PhoneInput, validatePhoneNumber } from '../PhoneInput';
import { Select } from '../Select/Select';
import './GroupPassForm.scss';

interface GroupPassFormProps {
  quantity: number;
  mode: string;
  onFormDataChange?: (index: number, formData: GroupPassFormData) => void;
  onValidationChange?: (isValid: boolean) => void;
  formData?: GroupPassFormData[];
  ticketName?: string;
}

interface FormData {
  users: GroupPassFormData[];
}

export const GroupPassForm: React.FC<GroupPassFormProps> = ({
  quantity,
  mode,
  onFormDataChange,
  onValidationChange,
  formData,
  ticketName,
}) => {
  const {
    register,
    control,
    formState: { errors, isValid },
    watch,
    trigger,
    getValues,
    setValue,
    clearErrors,
  } = useForm<FormData>({
    mode: 'onTouched', // 只在用戶觸碰欄位後才驗證
    reValidateMode: 'onChange', // 觸碰後則即時驗證
    defaultValues: {
      users: Array.from(
        { length: quantity },
        (_, index) =>
          formData?.[index] || {
            name: '',
            email: '',
            location: '',
            tel: '',
            role: '',
            dietaryRequirement: '',
          }
      ),
    },
    shouldUnregister: false,
  });

  const { fields, replace, append, remove } = useFieldArray({
    control,
    name: 'users',
  });

  const watchedUsers = watch('users');

  // 控制每個 details 的展開狀態
  const [openStates, setOpenStates] = useState<{ [key: string]: boolean }>({});
  const [churchIdentityOptions, setChurchIdentityOptions] = useState<Option[]>(
    []
  );

  useEffect(() => {
    const loadChurchIdentityOptions = async () => {
      try {
        const response = await apiService.members.getMembersRoles();

        // 只有當 ticketName 包含 'LEADERSHIP' 時才進行過濾
        const filteredResponse = ticketName?.includes('LEADERSHIP')
          ? (response || []).filter(
              (item: { label: string; value: string }) =>
                item.value !== 'pastor' &&
                item.value !== 'staff' &&
                item.value !== 'seminarian' &&
                item.value !== 'default'
            )
          : response || [];

        const transformedOptions = filteredResponse.map(
          (item: { label: string; value: string }) => ({
            id: item.value,
            label: item.label,
          })
        );
        setChurchIdentityOptions(transformedOptions);
      } catch (error) {
        console.error('Failed to load church identity options:', error);
      }
    };

    loadChurchIdentityOptions();
  }, [ticketName]);

  // 當 quantity 變化時智能更新表單（使用 append/remove 保持 details 狀態）
  const prevQuantityRef = React.useRef(quantity);

  useEffect(() => {
    const currentLength = fields.length;

    // 只有在數量真的變化時才處理
    if (currentLength !== quantity) {
      if (quantity > currentLength) {
        // 增加欄位 - 使用 append 保留現有資料
        const toAdd = quantity - currentLength;
        for (let i = 0; i < toAdd; i++) {
          append({
            name: '',
            email: '',
            location: '',
            tel: '',
            role: '',
            dietaryRequirement: '',
          });
        }
      } else if (quantity < currentLength) {
        // 減少欄位 - 使用 remove 保留前面的資料
        const toRemove = currentLength - quantity;
        for (let i = 0; i < toRemove; i++) {
          remove(currentLength - 1 - i); // 從後面開始移除
        }
      }

      // 清除所有錯誤狀態（但保留已填寫的值）
      clearErrors();

      prevQuantityRef.current = quantity;
    }
  }, [quantity, fields.length, append, remove, clearErrors]);

  // 單獨處理 formData 恢復
  useEffect(() => {
    if (formData && formData.length > 0) {
      replace(formData);
      setTimeout(() => {
        trigger(); // 觸發整個表單驗證
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 只在組件初始化時執行一次

  // 監控表單有效性變化
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isValid);
    }
  }, [isValid, onValidationChange]);

  // 監控表單資料變化並通知父組件（使用 getValues 而不是 watch）
  const prevFormValuesRef = React.useRef<string>('');

  useEffect(() => {
    const handleFormChange = () => {
      const currentValues = getValues();
      const currentUsersString = JSON.stringify(currentValues.users);

      // 只有在資料真正變化時才通知父組件
      if (
        onFormDataChange &&
        prevFormValuesRef.current !== currentUsersString
      ) {
        currentValues.users.forEach((user, index) => {
          onFormDataChange(index, user);
        });
        prevFormValuesRef.current = currentUsersString;
      }
    };

    // 設定定時器來定期檢查表單變化
    const interval = setInterval(handleFormChange, 500); // 每500ms檢查一次

    return () => clearInterval(interval);
  }, [getValues, onFormDataChange, mode]);

  const handleBlur = async (
    index: number,
    field: 'name' | 'email' | 'location' | 'tel' | 'role' | 'dietaryRequirement'
  ) => {
    await trigger(`users.${index}.${field}` as any);
  };

  const handleSelectChange =
    (index: number, field: string) => (value: string) => {
      setValue(`users.${index}.${field}` as any, value);
      trigger(`users.${index}.${field}` as any);
    };

  // 處理展開收合
  const toggleOpen = (fieldId: string) => {
    setOpenStates(prev => ({
      ...prev,
      [fieldId]: !prev[fieldId],
    }));
  };

  if (quantity === 0) {
    return null;
  }

  return (
    <div className="group-pass-form">
      <p
        className={`group-pass-form-title ${mode !== MODE.EDIT && 'group-pass-form-record-title'}`}
      >
        {' '}
        {mode === MODE.EDIT
          ? '請填寫實際使用此票券者之資訊'
          : '請確認實際使用此票券者之資訊'}{' '}
      </p>
      {fields.map((field, index) => (
        <div key={field.id} className="group-pass-form-details">
          <div
            className="group-pass-form-summary"
            onClick={() => toggleOpen(field.id)}
          >
            <span className={`title ${mode !== MODE.EDIT && 'record-title'}`}>
              與會者{index + 1}
            </span>
            <svg
              className="icon"
              viewBox="0 0 24 24"
              fill="black"
              width="24"
              height="24"
            >
              <path
                d={
                  openStates[field.id]
                    ? 'm7 14 5-5 5 5H7z'
                    : 'm7 10 5 5 5-5H7z '
                }
              />
            </svg>
          </div>
          <div
            className={`group-pass-form-content ${openStates[field.id] ? 'open' : ''}`}
          >
            <div className="group-pass-form-input">
              <div className="form-item">
                <div
                  className={`form-label ${mode !== MODE.EDIT && 'form-record-label'}`}
                >
                  <label htmlFor={`name-${index}`}>與會者姓名</label>
                </div>
                {mode === MODE.EDIT ? (
                  <>
                    <input
                      id={`name-${index}`}
                      className={`form-input ${errors.users?.[index]?.name ? 'error' : ''}`}
                      type="text"
                      placeholder="請輸入與會者姓名"
                      {...register(`users.${index}.name`, {
                        required: '請輸入與會者姓名',
                        validate: value =>
                          value?.trim() ? true : '請輸入與會者姓名',
                      })}
                      onBlur={() => handleBlur(index, 'name')}
                      aria-label="請輸入與會者姓名"
                      aria-required
                    />
                    {errors.users?.[index]?.name && (
                      <span className="error-message">
                        {errors.users[index].name?.message}
                      </span>
                    )}
                  </>
                ) : (
                  <p className="form-record-item">
                    {watchedUsers?.[index]?.name}
                  </p>
                )}
              </div>
              <div className="form-item">
                <div
                  className={`form-label ${mode !== MODE.EDIT && 'form-record-label'}`}
                >
                  <label htmlFor={`email-${index}`}>電子郵件</label>
                </div>
                {mode === MODE.EDIT ? (
                  <>
                    <input
                      id={`email-${index}`}
                      className={`form-input ${errors.users?.[index]?.email ? 'error' : ''}`}
                      type="email"
                      placeholder="請輸入電子郵件"
                      {...register(`users.${index}.email`, {
                        required: '請輸入電子郵件',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: '輸入格式錯誤',
                        },
                      })}
                      onBlur={() => handleBlur(index, 'email')}
                      aria-label="請輸入電子郵件"
                      aria-required
                    />
                    {errors.users?.[index]?.email && (
                      <span className="error-message">
                        {errors.users[index].email?.message}
                      </span>
                    )}
                    {ticketName?.includes('LEADERSHIP') && (
                      <p className="form-tip">
                        請填寫實際使用此票券者的電子郵件，每個電子郵件限購一張
                        Leadership Pass
                      </p>
                    )}
                  </>
                ) : (
                  <p className="form-record-item">
                    {watchedUsers?.[index]?.email}
                  </p>
                )}
              </div>
              <div className="form-item">
                <div
                  className={`form-label ${mode !== MODE.EDIT && 'form-record-label'}`}
                >
                  <label htmlFor={`dietaryRequirement-${index}`}>
                    餐食選擇
                  </label>
                </div>
                {mode === MODE.EDIT ? (
                  <>
                    <input
                      type="hidden"
                      {...register(`users.${index}.dietaryRequirement`, {
                        required: '請選擇餐食偏好',
                      })}
                    />
                    <Select
                      options={[
                        { id: '葷食', label: '葷食' },
                        { id: '素食', label: '素食' },
                      ]}
                      value={watchedUsers?.[index]?.dietaryRequirement || ''}
                      onChange={handleSelectChange(index, 'dietaryRequirement')}
                      placeholder="請選擇葷/素"
                      hasError={!!errors.users?.[index]?.dietaryRequirement}
                    />
                    {errors.users?.[index]?.dietaryRequirement && (
                      <span className="error-message">
                        {errors.users[index].dietaryRequirement?.message}
                      </span>
                    )}
                  </>
                ) : (
                  <p className="form-record-item">
                    {watchedUsers?.[index]?.dietaryRequirement === '葷食'
                      ? '葷食'
                      : '素食'}
                  </p>
                )}
              </div>
            </div>
            <div className="group-pass-form-input">
              <div className="form-item">
                <div
                  className={`form-label ${mode !== MODE.EDIT && 'form-record-label'}`}
                >
                  <label htmlFor={`location-${index}`}>所屬教會名稱</label>
                </div>
                {mode === MODE.EDIT ? (
                  <>
                    <input
                      id={`location-${index}`}
                      className={`form-input ${errors.users?.[index]?.location ? 'error' : ''}`}
                      type="text"
                      placeholder="請輸入所屬教會名稱"
                      {...register(`users.${index}.location`, {
                        required: '請輸入所屬教會名稱',
                        validate: value =>
                          value?.trim() ? true : '請輸入所屬教會名稱',
                      })}
                      onBlur={() => handleBlur(index, 'location')}
                      aria-label="請輸入所屬教會名稱"
                      aria-required
                    />
                    {errors.users?.[index]?.location && (
                      <span className="error-message">
                        {errors.users[index].location?.message}
                      </span>
                    )}
                  </>
                ) : (
                  <p className="form-record-item">
                    {watchedUsers?.[index]?.location}
                  </p>
                )}
              </div>
              <div
                className={`form-item ${mode === MODE.EDIT && ticketName?.includes('LEADERSHIP') && 'form-item-role'}`}
              >
                <div
                  className={`form-label ${mode !== MODE.EDIT && 'form-record-label'}`}
                >
                  <label htmlFor={`role-${index}`}>所屬教會身份</label>
                </div>
                {mode === MODE.EDIT ? (
                  <>
                    <input
                      type="hidden"
                      {...register(`users.${index}.role`, {
                        required: '請選擇所屬教會身份',
                      })}
                    />
                    <Select
                      options={churchIdentityOptions}
                      value={watchedUsers?.[index]?.role || ''}
                      onChange={handleSelectChange(index, 'role')}
                      placeholder="請選擇"
                      hasError={!!errors.users?.[index]?.role}
                    />
                    {errors.users?.[index]?.role && (
                      <span className="error-message">
                        {errors.users[index].role?.message}
                      </span>
                    )}
                  </>
                ) : (
                  <p className="form-record-item">
                    {churchIdentityOptions.find(
                      option => option.id === watchedUsers?.[index]?.role
                    )?.label || watchedUsers?.[index]?.role}
                  </p>
                )}
              </div>
              <div className="form-item">
                <div
                  className={`form-label ${mode !== MODE.EDIT && 'form-record-label'}`}
                >
                  <label htmlFor={`tel-${index}`}>所屬教會電話</label>
                </div>
                {mode === MODE.EDIT ? (
                  <>
                    <Controller
                      name={`users.${index}.tel`}
                      control={control}
                      rules={{
                        required: '請輸入所屬教會電話',
                        validate: value => {
                          if (!value || !value.trim()) {
                            return '請輸入所屬教會電話';
                          }
                          if (!validatePhoneNumber(value)) {
                            return '請輸入有效的電話號碼';
                          }
                          return true;
                        },
                      }}
                      render={({ field }) => (
                        <PhoneInput
                          country="tw"
                          value={field.value || ''}
                          onChange={field.onChange}
                          onBlur={() => handleBlur(index, 'tel')}
                          hasError={!!errors.users?.[index]?.tel}
                          placeholder="請輸入所屬教會電話"
                        />
                      )}
                    />
                    {errors.users?.[index]?.tel && (
                      <span className="error-message">
                        {errors.users[index].tel?.message}
                      </span>
                    )}
                  </>
                ) : (
                  <p className="form-record-item">
                    {watchedUsers?.[index]?.tel}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
