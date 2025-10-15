import React, { useEffect, useState } from 'react';
import './QuantitySelector.scss';

interface QuantitySelectorProps {
  initialValue?: number;
  min?: number;
  max?: number;
  step?: number; // 每次增減的數量（用於套票）
  onChange?: (value: number) => void;
}

interface MinusIconProps {
  disabled: boolean;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  initialValue = 0,
  min = 0,
  max = 0,
  step = 1, // 預設每次增減 1
  onChange,
}) => {
  const [quantity, setQuantity] = useState(initialValue);

  // 當 initialValue 變化時，更新內部狀態
  useEffect(() => {
    setQuantity(initialValue);
  }, [initialValue]);

  const handleDecrease = () => {
    if (quantity > min) {
      const newValue = Math.max(quantity - step, min);
      setQuantity(newValue);
      onChange?.(newValue);
    }
  };

  const handleIncrease = () => {
    if (quantity < max) {
      const newValue = Math.min(quantity + step, max);
      setQuantity(newValue);
      onChange?.(newValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!max) return; // 如果 max 為 0 或未定義，則不允許輸入
    const value = parseInt(e.target.value) || 0;

    // 檢查輸入值是否為 step 的倍數
    if (value >= min && value <= max && value % step === 0) {
      setQuantity(value);
      onChange?.(value);
    }
  };

  const MinusIcon: React.FC<MinusIconProps> = ({ disabled }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={`icon ${disabled ? 'disabled' : ''}`}
    >
      <path
        d="M19 12.998H5V10.998H19V12.998Z"
        fill={disabled ? '#A5A9AB' : 'black'}
      />
    </svg>
  );

  const PlusIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className="icon"
    >
      <path
        d="M19 12.998H13V18.998H11V12.998H5V10.998H11V4.99805H13V10.998H19V12.998Z"
        fill={!max ? '#A5A9AB' : 'black'}
      />
    </svg>
  );

  return (
    <div className={`quantity-selector ${!max ? 'disabled' : ''}`}>
      <button
        className="quantity-btn decrease"
        onClick={handleDecrease}
        disabled={quantity <= min}
        type="button"
      >
        <MinusIcon disabled={quantity <= min} />
      </button>

      <input
        type="number"
        className={`quantity-input ${!max ? 'disabled' : ''}`}
        value={quantity}
        onChange={handleInputChange}
        min={min}
        max={max}
      />

      <button
        className="quantity-btn increase"
        onClick={handleIncrease}
        disabled={quantity >= max}
        type="button"
      >
        <PlusIcon />
      </button>
    </div>
  );
};
