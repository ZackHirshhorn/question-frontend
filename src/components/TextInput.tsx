import React from 'react';
import './TextInput.css';
import CheckIcon from '../assets/icons/CheckIcon';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showCheck?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({ showCheck, ...props }) => {
  return (
    <div className="input-wrapper">
      {showCheck && <CheckIcon />}
      <input {...props} />
    </div>
  );
};

export default TextInput;
