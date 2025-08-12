import React from 'react';
import TextInput from './TextInput';

interface QuestionNumberProps {
  value?: string | number;
  onChange: (next: string) => void;
}

const QuestionNumber: React.FC<QuestionNumberProps> = ({ value, onChange }) => {
  return (
    <div className="question-options-stack">
      <div className="question-form-label question-options-title">בחר מספר</div>
      <TextInput
        type="number"
        inputMode="numeric"
        value={value as any as string}
        onChange={(e) => onChange(e.target.value)}
        placeholder="...הזן מספר"
      />
    </div>
  );
};

export default QuestionNumber;

