import React from 'react';
import CustomSelect from './CustomSelect';
import type { CustomSelectOption } from './CustomSelect';

type Option = { value: string; label: string };

interface TypeSelectProps {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  ariaLabel?: string;
}

const TypeSelect: React.FC<TypeSelectProps> = ({ value, options, onChange, ariaLabel }) => {
  const mapped: CustomSelectOption[] = React.useMemo(
    () =>
      options.map((opt) => {
        let icon: React.ReactNode = '';
        switch (opt.value) {
          case 'טקסט':
            icon = 'T';
            break;
          case 'בחירה מרובה':
            icon = '☑';
            break;
          case 'בחירה יחידה':
            icon = '◉';
            break;
          case 'מספר':
            icon = '#';
            break;
          default:
            icon = '';
        }
        return { ...opt, icon };
      }),
    [options],
  );

  return (
    <CustomSelect
      value={value}
      options={mapped}
      onChange={onChange}
      ariaLabel={ariaLabel}
      direction="rtl"
    />
  );
};

export default TypeSelect;
