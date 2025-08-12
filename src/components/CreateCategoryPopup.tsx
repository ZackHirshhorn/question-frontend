import React, { useState } from 'react';
import './Button.css';
import './CreateTemplate.css'; // Re-use styles from CreateTemplate
import CheckIcon from '../assets/icons/CheckIcon';
import AnimatedErrorMessage from './AnimatedErrorMessage';
import TextInput from './TextInput';

interface CreateCategoryPopupProps {
  onClose: () => void;
  onCreate: (names: string[]) => void;
  existingCategoryNames: string[];
}

const CreateCategoryPopup: React.FC<CreateCategoryPopupProps> = ({ onClose, onCreate, existingCategoryNames }) => {
  const [inputs, setInputs] = useState([{ name: '', error: '' }]);

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...inputs];
    newInputs[index].name = value;
    
    const isDuplicate = existingCategoryNames.includes(value.trim()) || 
                        inputs.some((input, i) => i !== index && input.name.trim() === value.trim());
    
    newInputs[index].error = isDuplicate ? 'קטגוריה עם שם זה כבר קיימת.' : '';
    
    setInputs(newInputs);
  };

  const addInput = () => {
    setInputs([...inputs, { name: '', error: '' }]);
  };

  const removeInput = (index: number) => {
    const newInputs = inputs.filter((_, i) => i !== index);
    setInputs(newInputs);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const hasErrors = inputs.some(input => input.error);
    if (hasErrors) {
      return;
    }
    const names = inputs.map(input => input.name.trim()).filter(name => name);
    if (names.length > 0) {
      onCreate(names);
    }
  };

  const hasErrors = inputs.some(input => input.error) || inputs.some(input => !input.name.trim());

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>יצירת קטגוריה חדשה</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>שמות הקטגוריות</label>
            {inputs.map((input, index) => (
              <div key={index} style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ flexGrow: 1 }}>
                    <TextInput
                      type="text"
                      value={input.name}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      required
                      showCheck={input.name && !input.error}
                    />
                  </div>
                  {inputs.length > 1 && (
                    <button type="button" className="button-secondary" onClick={() => removeInput(index)} style={{ marginRight: '10px' }}>
                      הסר
                    </button>
                  )}
                </div>
                <AnimatedErrorMessage message={input.error} />
              </div>
            ))}
          </div>
          <button type="button" className="button-secondary" onClick={addInput} style={{ marginBottom: '10px' }}>
            הוסף קטגוריה נוספת
          </button>
          <div className="form-actions">
            <button type="button" className="button-secondary" onClick={onClose}>
              ביטול
            </button>
            <button type="submit" className="button-primary" disabled={hasErrors}>
              יצירה
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCategoryPopup;

