import React, { useState, useEffect } from 'react';
import './QuantitySelector.scss';

interface QuantitySelectorProps {
  initialValue?: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
}

interface MinusIconProps {
  disabled: boolean;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  initialValue = 0,
  min = 0,
  max = 99,
  onChange,
}) => {
  const [quantity, setQuantity] = useState(initialValue);

  // 當 initialValue 變化時，更新內部狀態
  useEffect(() => {
    setQuantity(initialValue);
  }, [initialValue]);

  const handleDecrease = () => {
    if (quantity > min) {
      const newValue = quantity - 1;
      setQuantity(newValue);
      onChange?.(newValue);
    }
  };

  const handleIncrease = () => {
    if (quantity < max) {
      const newValue = quantity + 1;
      setQuantity(newValue);
      onChange?.(newValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    if (value >= min && value <= max) {
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
        fill={disabled ? '#a5a9ab' : 'black'}
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
        fill="black"
      />
    </svg>
  );

  return (
    <div className="quantity-selector">
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
        className="quantity-input"
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
