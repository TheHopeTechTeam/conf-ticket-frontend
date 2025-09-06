import React, { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { MODE } from '../../../constants/common';
import './GroupPassForm.scss';

export interface GroupPassFormData {
  name: string;
  email: string;
  church: string;
  phone: string;
}

interface GroupPassFormProps {
  quantity: number;
  mode: string;
  onFormDataChange?: (index: number, formData: GroupPassFormData) => void;
  onValidationChange?: (isValid: boolean) => void;
  formData?: GroupPassFormData[];
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
}) => {
  const {
    register,
    control,
    formState: { errors, isValid },
    watch,
    trigger,
    getValues,
  } = useForm<FormData>({
    mode: 'onChange', // 改為 onChange 以即時更新 isValid
    defaultValues: {
      users: Array.from(
        { length: quantity },
        (_, index) =>
          formData?.[index] || {
            name: '',
            email: '',
            church: '',
            phone: '',
          }
      ),
    },
  });

  const { fields, replace, append, remove } = useFieldArray({
    control,
    name: 'users',
  });

  const watchedUsers = watch('users');

  // 調試：直接監控 watchedUsers
  useEffect(() => {
    console.log('watchedUsers 直接變化:', watchedUsers);
  }, [watchedUsers]);

  // 當 quantity 變化時智能更新表單（使用 append/remove 保持 details 狀態）
  const prevQuantityRef = React.useRef(quantity);

  useEffect(() => {
    const currentLength = fields.length;

    // 只有在數量真的變化時才處理
    if (prevQuantityRef.current !== quantity && currentLength !== quantity) {
      if (quantity > currentLength) {
        // 增加欄位 - 使用 append 而不是 replace
        const toAdd = quantity - currentLength;
        for (let i = 0; i < toAdd; i++) {
          append({
            name: '',
            email: '',
            church: '',
            phone: '',
          });
        }
      } else if (quantity < currentLength) {
        // 減少欄位 - 使用 remove 而不是 replace
        const toRemove = currentLength - quantity;
        for (let i = 0; i < toRemove; i++) {
          remove(currentLength - 1 - i); // 從後面開始移除
        }
      }

      prevQuantityRef.current = quantity;
    }
  }, [quantity, fields.length, append, remove]);

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
    field: 'name' | 'email' | 'church' | 'phone'
  ) => {
    await trigger(`users.${index}.${field}` as any);
  };

  if (quantity === 0) {
    return null;
  }

  return (
    <div className="group-pass-form">
      <p
        className={`group-pass-form-title ${mode !== 'edit' && 'group-pass-form-record-title'}`}
      >
        {' '}
        {mode === MODE.EDIT
          ? '請填寫實際使用此票券者之資訊'
          : '請確認實際使用此票券者之資訊'}{' '}
      </p>
      {fields.map((field, index) => (
        <details key={field.id} className="group-pass-form-details">
          <summary>
            <span className={`title ${mode !== 'edit' && 'record-title'}`}>
              使用者{index + 1}
            </span>
            <svg
              className="icon arrow-up"
              viewBox="0 0 24 24"
              fill="black"
              width="24"
              height="24"
            >
              <path d="m7 14 5-5 5 5H7z" />
            </svg>
            <svg
              className="icon arrow-down"
              viewBox="0 0 24 24"
              fill="black"
              width="24"
              height="24"
            >
              <path d="m7 10 5 5 5-5H7z" />
            </svg>
          </summary>
          <div className="group-pass-form-content">
            <div className="group-pass-form-input">
              <div className="form-item">
                <div
                  className={`form-label ${mode === MODE.EDIT ? 'p-l-6' : 'form-record-label'}`}
                >
                  <label htmlFor={`name-${index}`}>使用者姓名</label>
                </div>
                {mode === MODE.EDIT ? (
                  <>
                    <input
                      id={`name-${index}`}
                      className={`form-input ${errors.users?.[index]?.name ? 'error' : ''}`}
                      type="text"
                      placeholder="請輸入使用者姓名"
                      {...register(`users.${index}.name`, {
                        required: '請輸入使用者姓名',
                        validate: value =>
                          value?.trim() ? true : '請輸入使用者姓名',
                      })}
                      onBlur={() => handleBlur(index, 'name')}
                      aria-label="請輸入使用者姓名"
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
                  className={`form-label ${mode === MODE.EDIT ? 'p-l-6' : 'form-record-label'}`}
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
                          message: '請輸入有效的電子郵件格式',
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
                  </>
                ) : (
                  <p>{watchedUsers?.[index]?.email}</p>
                )}
              </div>
            </div>
            <div className="group-pass-form-input">
              <div className="form-item">
                <div
                  className={`form-label ${mode === MODE.EDIT ? 'p-l-6' : 'form-record-label'}`}
                >
                  <label htmlFor={`church-${index}`}>所屬教會名稱</label>
                </div>
                {mode === MODE.EDIT ? (
                  <>
                    <input
                      id={`church-${index}`}
                      className={`form-input ${errors.users?.[index]?.church ? 'error' : ''}`}
                      type="text"
                      placeholder="請輸入所屬教會名稱"
                      {...register(`users.${index}.church`, {
                        required: '請輸入所屬教會名稱',
                        validate: value =>
                          value?.trim() ? true : '請輸入所屬教會名稱',
                      })}
                      onBlur={() => handleBlur(index, 'church')}
                      aria-label="請輸入所屬教會名稱"
                      aria-required
                    />
                    {errors.users?.[index]?.church && (
                      <span className="error-message">
                        {errors.users[index].church?.message}
                      </span>
                    )}
                  </>
                ) : (
                  <p>{watchedUsers?.[index]?.church}</p>
                )}
              </div>
              <div className="form-item">
                <div
                  className={`form-label ${mode === MODE.EDIT ? 'p-l-6' : 'form-record-label'}`}
                >
                  <label htmlFor={`phone-${index}`}>所屬教會電話</label>
                </div>
                {mode === MODE.EDIT ? (
                  <>
                    <input
                      id={`phone-${index}`}
                      className={`form-input ${errors.users?.[index]?.phone ? 'error' : ''}`}
                      type="tel"
                      placeholder="請輸入所屬教會電話"
                      {...register(`users.${index}.phone`, {
                        required: '請輸入所屬教會電話',
                        validate: value =>
                          value?.trim() ? true : '請輸入所屬教會電話',
                      })}
                      onBlur={() => handleBlur(index, 'phone')}
                      aria-label="請輸入所屬教會電話"
                      aria-required
                    />
                    {errors.users?.[index]?.phone && (
                      <span className="error-message">
                        {errors.users[index].phone?.message}
                      </span>
                    )}
                  </>
                ) : (
                  <p>{watchedUsers?.[index]?.phone}</p>
                )}
              </div>
            </div>
          </div>
        </details>
      ))}
    </div>
  );
};

