import React, { useState } from 'react';
import AnimatedErrorMessage from './AnimatedErrorMessage';
import './CreateTemplate.css';
import TextInput from './TextInput';

interface CreateSubCategoryPopupProps {
  categoryName: string;
  onClose: () => void;
  onCreate: (names: string[]) => void;
  existingSubCategoryNames: string[];
}

import './Button.css';

const CreateSubCategoryPopup: React.FC<CreateSubCategoryPopupProps> = ({
  onClose,
  onCreate,
  categoryName,
  existingSubCategoryNames,
}) => {
  const [inputs, setInputs] = useState([{ name: '', error: '' }]);

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...inputs];
    newInputs[index].name = value;

    const trimmed = value.trim();
    const isDuplicateExisting = existingSubCategoryNames.includes(trimmed);
    const isDuplicateLocal = newInputs.some((inp, i) => i !== index && inp.name.trim() === trimmed);
    newInputs[index].error = trimmed && (isDuplicateExisting || isDuplicateLocal) ? 'תת-קטגוריה עם שם זה כבר קיימת.' : '';

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
    const names = inputs.map(i => i.name.trim()).filter(Boolean);
    if (names.length) {
      onCreate(names);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>הוספת תת קטגוריה חדשה עבור {categoryName}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>שם תת הקטגוריה</label>
            {inputs.map((input, index) => (
              <div key={index} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex' }}>
                  <div style={{ flexGrow: 1, marginRight: '10px' }}>
                    <TextInput
                      type="text"
                      value={input.name}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      required
                    />
                  </div>
                  <button type="button" className="button-secondary" onClick={() => removeInput(index)}>
                    הסר
                  </button>
                </div>
                <AnimatedErrorMessage message={input.error} />
              </div>
            ))}
          </div>
          <button type="button" className="button-secondary" onClick={addInput} style={{ marginBottom: '10px' }}>
            הוסף עוד
          </button>
          <div className="form-actions">
            <button type="button" className="button-secondary" onClick={onClose}>
              ביטול
            </button>
            <button type="submit" className="button-primary" disabled={inputs.some(i => i.error) || inputs.some(i => !i.name.trim())}>
              שמור
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSubCategoryPopup;
