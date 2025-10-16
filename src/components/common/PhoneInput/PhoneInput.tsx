import React from 'react';
import ReactPhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import {
  parsePhoneNumberWithError,
  isValidPhoneNumber,
} from 'libphonenumber-js';
import './PhoneInput.scss';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  hasError?: boolean;
  disabled?: boolean;
  country?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  onBlur,
  placeholder = '請輸入電話',
  hasError = false,
  disabled = false,
  country = 'tw',
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [dropdownWidth, setDropdownWidth] = React.useState<number>(0);

  React.useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setDropdownWidth(width);
      }
    };

    // 初始化寬度
    updateWidth();

    // 使用 debounce 優化 resize 事件
    let timeoutId: number;
    const debouncedUpdateWidth = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(updateWidth, 150);
    };

    // 監聽視窗調整大小
    window.addEventListener('resize', debouncedUpdateWidth);

    return () => {
      window.removeEventListener('resize', debouncedUpdateWidth);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div ref={containerRef} className="phone-input-wrapper">
      <ReactPhoneInput
        country={country}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        inputClass={hasError ? 'invalid' : 'valid'}
        buttonClass={hasError ? 'flag-button-invalid' : 'flag-button-valid'}
        containerClass="phone-input-container"
        dropdownClass="phone-dropdown-menu"
        searchClass="phone-search-input"
        placeholder={placeholder}
        disabled={disabled}
        dropdownStyle={{
          width: dropdownWidth > 0 ? `${dropdownWidth}px` : '100%',
        }}
      />
    </div>
  );
};

// 驗證電話號碼的輔助函數
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  if (!phoneNumber || phoneNumber.trim() === '') {
    return false;
  }

  try {
    // 嘗試解析電話號碼，需要加上 + 號
    const phoneWithPlus = phoneNumber.startsWith('+')
      ? phoneNumber
      : `+${phoneNumber}`;
    return isValidPhoneNumber(phoneWithPlus);
  } catch (error) {
    return false;
  }
};

// 格式化電話號碼的輔助函數
export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber || phoneNumber.trim() === '') {
    return '';
  }

  try {
    const phoneWithPlus = phoneNumber.startsWith('+')
      ? phoneNumber
      : `+${phoneNumber}`;
    const parsed = parsePhoneNumberWithError(phoneWithPlus);
    return parsed ? parsed.formatInternational() : phoneNumber;
  } catch (error) {
    return phoneNumber;
  }
};

// 取得電話號碼的國家代碼
export const getPhoneCountry = (phoneNumber: string): string | undefined => {
  if (!phoneNumber || phoneNumber.trim() === '') {
    return undefined;
  }

  try {
    const phoneWithPlus = phoneNumber.startsWith('+')
      ? phoneNumber
      : `+${phoneNumber}`;
    const parsed = parsePhoneNumberWithError(phoneWithPlus);
    return parsed?.country;
  } catch (error) {
    return undefined;
  }
};
