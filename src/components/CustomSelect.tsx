import React from 'react';
import DropdownIcon from '../assets/icons/DropdownIcon';

export type CustomSelectOption = {
  value: string;
  label: string;
  icon?: React.ReactNode;
};

interface CustomSelectProps {
  value: string;
  options: CustomSelectOption[];
  onChange: (next: string) => void;
  ariaLabel?: string;
  className?: string;
  direction?: 'rtl' | 'ltr';
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  options,
  onChange,
  ariaLabel,
  className,
  direction = 'rtl',
}) => {
  const [open, setOpen] = React.useState(false);
  const [highlight, setHighlight] = React.useState<number>(() => {
    const idx = options.findIndex((opt) => opt.value === value);
    return idx >= 0 ? idx : 0;
  });
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const menuRef = React.useRef<HTMLUListElement | null>(null);
  const menuId = React.useId();

  React.useEffect(() => {
    if (!open) return;
    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [open]);

  React.useEffect(() => {
    setHighlight((current) => {
      if (options.length === 0) return 0;
      if (current >= options.length) return options.length - 1;
      if (current < 0) return 0;
      return current;
    });
  }, [options.length]);

  React.useEffect(() => {
    const idx = options.findIndex((opt) => opt.value === value);
    if (idx >= 0) {
      setHighlight(idx);
    }
  }, [value, options]);

  const valueLabel = options.find((opt) => opt.value === value)?.label ?? value;

  const openMenu = () => {
    if (options.length === 0) return;
    const idx = options.findIndex((opt) => opt.value === value);
    setHighlight(idx >= 0 ? idx : 0);
    setOpen(true);
  };

  const closeMenu = () => setOpen(false);

  const selectIndex = (index: number) => {
    const opt = options[index];
    if (!opt) return;
    onChange(opt.value);
    closeMenu();
    triggerRef.current?.focus();
  };

  const onTriggerKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'Down') {
      event.preventDefault();
      if (!open) {
        openMenu();
      } else {
        setHighlight((h) => Math.min(options.length - 1, h + 1));
      }
    } else if (event.key === 'ArrowUp' || event.key === 'Up') {
      event.preventDefault();
      if (!open) {
        openMenu();
      } else {
        setHighlight((h) => Math.max(0, h - 1));
      }
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!open) {
        openMenu();
      } else {
        selectIndex(highlight);
      }
    } else if (event.key === 'Escape' || event.key === 'Esc') {
      event.preventDefault();
      closeMenu();
    }
  };

  const onMenuKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'Down') {
      event.preventDefault();
      setHighlight((h) => Math.min(options.length - 1, h + 1));
    } else if (event.key === 'ArrowUp' || event.key === 'Up') {
      event.preventDefault();
      setHighlight((h) => Math.max(0, h - 1));
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectIndex(highlight);
    } else if (event.key === 'Escape' || event.key === 'Esc') {
      event.preventDefault();
      closeMenu();
      triggerRef.current?.focus();
    }
  };

  const wrapperClassName = ['custom-select', className].filter(Boolean).join(' ');

  return (
    <div className={wrapperClassName} style={{ direction }}>
      <button
        ref={triggerRef}
        type="button"
        className="custom-select-trigger"
        role="combobox"
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={onTriggerKeyDown}
      >
        <span className="custom-select-label">{valueLabel}</span>
        <span className="custom-select-caret" aria-hidden>
          <DropdownIcon />
        </span>
      </button>
      {open && (
        <ul
          ref={menuRef}
          id={menuId}
          role="listbox"
          className="custom-select-menu"
          tabIndex={-1}
          onKeyDown={onMenuKeyDown}
        >
          {options.map((opt, index) => {
            const isSelected = opt.value === value;
            const isActive = index === highlight;
            const optionClassName = `custom-select-option${isSelected ? ' is-selected' : ''}${isActive ? ' is-active' : ''}`;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                className={optionClassName}
                onMouseEnter={() => setHighlight(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectIndex(index)}
              >
                <span className="custom-select-option-icon" aria-hidden>
                  {opt.icon ?? ''}
                </span>
                <span className="custom-select-option-text">{opt.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;
