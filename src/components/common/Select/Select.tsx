import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { SelectProps } from '../../interface/Option';
import './Select.scss';

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = '請選擇...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownId = useRef(
    `dropdown-${Math.random().toString(36).substr(2, 9)}`
  ).current;

  const selectedOption = options.find(option => option.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // 檢查點擊是否在按鈕內
      if (buttonRef.current && buttonRef.current.contains(target)) {
        return;
      }

      // 檢查點擊是否在當前下拉選單內
      const currentDropdown = document.getElementById(dropdownId);
      if (currentDropdown && currentDropdown.contains(target)) {
        return;
      }

      setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // 監聽視窗大小調整和滾動事件，更新下拉選單位置
      window.addEventListener('resize', updateDropdownPosition);
      window.addEventListener('scroll', updateDropdownPosition, true);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('resize', updateDropdownPosition);
        window.removeEventListener('scroll', updateDropdownPosition, true);
      };
    }
  }, [isOpen]);

  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 2,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  const handleButtonClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    if (!isOpen) {
      updateDropdownPosition();
    }
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (optionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    onChange(optionId);
    setIsOpen(false);
  };

  return (
    <div className="select-container">
      {/* Select Trigger */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleButtonClick}
        className={`select-button ${isOpen ? 'select-button-open' : ''}`}
      >
        <span className={selectedOption ? 'selected-text' : 'placeholder-text'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`chevron-icon ${isOpen ? 'chevron-icon-rotated' : ''}`}
        />
      </button>

      {/* Dropdown Menu - rendered in portal */}
      {isOpen &&
        createPortal(
          <div
            id={dropdownId}
            className="dropdown-menu dropdown-portal"
            style={{
              position: 'absolute',
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
              zIndex: 99999,
            }}
          >
            {options.map(option => (
              <div
                key={option.id}
                onClick={event => handleOptionClick(option.id, event)}
                className={`option ${option.id === value ? 'option-selected' : ''}`}
              >
                {option.label}
              </div>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
};
