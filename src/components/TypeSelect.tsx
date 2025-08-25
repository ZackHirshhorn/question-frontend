import React from 'react';

type Option = { value: string; label: string };

interface TypeSelectProps {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  ariaLabel?: string;
}

const TypeSelect: React.FC<TypeSelectProps> = ({ value, options, onChange, ariaLabel }) => {
  const [open, setOpen] = React.useState(false);
  const [highlight, setHighlight] = React.useState<number>(() => Math.max(0, options.findIndex(o => o.value === value)));
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const menuRef = React.useRef<HTMLUListElement | null>(null);
  const menuId = React.useId();

  React.useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current && !triggerRef.current) return;
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  React.useEffect(() => {
    // keep highlight in range if options change
    setHighlight((h) => {
      if (h < 0) return 0;
      if (h >= options.length) return Math.max(0, options.length - 1);
      return h;
    });
  }, [options.length]);

  const valueLabel = options.find(o => o.value === value)?.label ?? value;

  const openMenu = () => {
    setOpen(true);
    const idx = options.findIndex(o => o.value === value);
    setHighlight(idx >= 0 ? idx : 0);
  };
  const closeMenu = () => setOpen(false);

  const selectIndex = (idx: number) => {
    const opt = options[idx];
    if (!opt) return;
    onChange(opt.value);
    closeMenu();
    triggerRef.current?.focus();
  };

  const onTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'Down') {
      e.preventDefault();
      if (!open) {
        openMenu();
      } else {
        setHighlight((h) => Math.min(options.length - 1, h + 1));
      }
    } else if (e.key === 'ArrowUp' || e.key === 'Up') {
      e.preventDefault();
      if (!open) {
        openMenu();
      } else {
        setHighlight((h) => Math.max(0, h - 1));
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!open) {
        openMenu();
      } else {
        selectIndex(highlight);
      }
    } else if (e.key === 'Escape' || e.key === 'Esc') {
      e.preventDefault();
      closeMenu();
    }
  };

  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'Down') {
      e.preventDefault();
      setHighlight((h) => Math.min(options.length - 1, h + 1));
    } else if (e.key === 'ArrowUp' || e.key === 'Up') {
      e.preventDefault();
      setHighlight((h) => Math.max(0, h - 1));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      selectIndex(highlight);
    } else if (e.key === 'Escape' || e.key === 'Esc') {
      e.preventDefault();
      closeMenu();
      triggerRef.current?.focus();
    }
  };

  return (
    <div className="custom-select" style={{ direction: 'rtl' }}>
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
        <span className="custom-select-caret" aria-hidden>▾</span>
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
          {options.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isActive = idx === highlight;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                className={`custom-select-option${isSelected ? ' is-selected' : ''}${isActive ? ' is-active' : ''}`}
                onMouseEnter={() => setHighlight(idx)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectIndex(idx)}
              >
                <span className="custom-select-option-icon" aria-hidden>
                  {(() => {
                    switch (opt.value) {
                      case 'טקסט':
                        return 'T';
                      case 'בחירה מרובה':
                        return '☑';
                      case 'בחירה יחידה':
                        return '◉';
                      case 'מספר':
                        return '#';
                      default:
                        return '';
                    }
                  })()}
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

export default TypeSelect;
