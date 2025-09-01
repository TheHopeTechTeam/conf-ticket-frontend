import React, { useState, useRef, useEffect } from 'react';
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
  };

  return (
    <div className="select-container" ref={dropdownRef}>
      {/* Select Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`select-button ${isOpen ? 'select-button-open' : ''}`}
      >
        <span className={selectedOption ? 'selected-text' : 'placeholder-text'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`chevron-icon ${isOpen ? 'chevron-icon-rotated' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="dropdown-menu">
          {options.map(option => (
            <div
              key={option.id}
              onClick={() => handleOptionClick(option.id)}
              className={`option ${option.id === value ? 'option-selected' : ''}`}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
