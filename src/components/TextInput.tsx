import React from 'react';
import './TextInput.css';
import CheckIcon from '../assets/icons/CheckIcon';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showCheck?: boolean;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  wrapperClassName?: string;
  inputClassName?: string;
}

const TextInput: React.FC<TextInputProps> = ({ showCheck, startAdornment, endAdornment, wrapperClassName, inputClassName, ...props }) => {
  return (
    <div className={`input-wrapper${wrapperClassName ? ` ${wrapperClassName}` : ''}`}>
      {startAdornment}
      {showCheck && !startAdornment && <CheckIcon />}
      <input className={inputClassName} {...props} />
      {endAdornment}
    </div>
  );
};

export default TextInput;
