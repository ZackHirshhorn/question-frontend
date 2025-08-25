import React, { useImperativeHandle, useRef } from 'react';
import CalendarIcon from '../assets/icons/CalendarIcon';

export interface DatePickerHandle {
  focus: () => void;
  openPicker: () => void;
}

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  placeholder?: string;
  buttonAriaLabel: string;
}

const formatDisplayValue = (value: string, fallback: string): string => {
  if (!value) {
    return fallback;
  }
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) {
    return fallback;
  }
  return `${day}.${month}.${year}`;
};

const DatePicker = React.forwardRef<DatePickerHandle, DatePickerProps>(
  ({ value, onChange, ariaLabel, placeholder = 'xx.xx.xxxx', buttonAriaLabel }, ref) => {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const openPicker = () => {
      const input = inputRef.current;
      if (!input) {
        return;
      }
      if (typeof input.showPicker === 'function') {
        input.showPicker();
        return;
      }
      input.focus();
      input.click();
    };

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
      },
      openPicker,
    }));

    const handleContainerClick = () => {
      openPicker();
    };

    const displayValue = formatDisplayValue(value, placeholder);
    const hasValue = Boolean(value);

    return (
      <div className="responses-dateInputWrapper" onClick={handleContainerClick} role="group" aria-label={ariaLabel}>
        <input
          ref={inputRef}
          type="date"
          aria-label={ariaLabel}
          className="responses-dateInputNative"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <span
          className={`responses-dateDisplay${hasValue ? ' responses-dateDisplay--filled' : ''}`}
          aria-hidden="true"
        >
          {displayValue}
        </span>
        <button
          type="button"
          className="responses-dateIconButton"
          aria-label={buttonAriaLabel}
          onClick={(event) => {
            event.stopPropagation();
            openPicker();
          }}
        >
          <CalendarIcon aria-hidden="true" />
        </button>
      </div>
    );
  },
);

DatePicker.displayName = 'DatePicker';

export default DatePicker;
