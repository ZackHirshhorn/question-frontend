import React from 'react';
import './TextInput.css';
import CheckIcon from '../assets/icons/CheckIcon';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showCheck?: boolean;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

const TextInput: React.FC<TextInputProps> = ({ showCheck, startAdornment, endAdornment, ...props }) => {
  return (
    <div className="input-wrapper">
      {startAdornment}
      {showCheck && !startAdornment && <CheckIcon />}
      <input {...props} />
      {endAdornment}
    </div>
  );
};

export default TextInput;
