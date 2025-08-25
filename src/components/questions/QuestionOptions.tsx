import React, { useId } from 'react';
import TextInput from '../TextInput';
import TrashIcon from '../../assets/icons/TrashIcon';

interface QuestionOptionsProps {
  choices?: string[];
  onChange: (nextChoices: string[]) => void;
  mode?: 'multiple' | 'single';
  selectedIndex?: number | null;
  onSelectedIndexChange?: (index: number | null) => void;
}

const QuestionOptions: React.FC<QuestionOptionsProps> = ({ choices, onChange, mode = 'multiple', selectedIndex = null, onSelectedIndexChange }) => {
  const groupId = useId();
  const base = Array.isArray(choices) ? [...choices] : [];
  while (base.length < 2) base.push('');
  const allFilled = base.every((opt) => String(opt).trim().length > 0);
  const effective = allFilled ? [...base, ''] : base;

  return (
    <div className="question-options-stack">
      <div className="question-form-label question-options-title">אפשרויות</div>
      {effective.map((val, idx) => {
        const isPersisted = idx < base.length; // hide delete for trailing auto-empty
        return (
          <div className="question-option-row" key={idx}>
            <TextInput
              value={String(val || '')}
              onChange={(e) => {
                const v = e.target.value;
                const next = Array.isArray(choices) ? [...choices] : [];
                while (next.length <= idx) next.push('');
                next[idx] = v;
                while (next.length < 2) next.push('');
                if (next.every((opt) => String(opt).trim().length > 0)) {
                  next.push('');
                }
                onChange(next);
              }}
              placeholder={`אפשרות ${idx + 1}`}
              startAdornment={mode === 'single' ? (
                <input
                  type="radio"
                  className="question-option-radio"
                  name={`option-${groupId}`}
                  checked={selectedIndex === idx}
                  onChange={() => onSelectedIndexChange && onSelectedIndexChange(idx)}
                />
              ) : undefined}
              endAdornment={isPersisted ? (
                <button
                  type="button"
                  className="icon-button input-icon-button"
                  aria-label={`מחיקת אפשרות ${idx + 1}`}
                  onClick={() => {
                    const next = Array.isArray(choices) ? [...choices] : [];
                    next.splice(idx, 1);
                    while (next.length < 2) next.push('');
                    onChange(next);
                    if (mode === 'single' && onSelectedIndexChange) {
                      if (selectedIndex === null) {
                        // nothing
                      } else if (selectedIndex === idx) {
                        onSelectedIndexChange(null);
                      } else if (selectedIndex > idx) {
                        onSelectedIndexChange(selectedIndex - 1);
                      }
                    }
                  }}
                >
                  <TrashIcon />
                </button>
              ) : undefined}
            />
          </div>
        );
      })}
    </div>
  );
};

export default QuestionOptions;
