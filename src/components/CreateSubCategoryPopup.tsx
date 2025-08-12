import React, { useState } from 'react';

interface CreateSubCategoryPopupProps {
  categoryName: string;
  onClose: () => void;
  onCreate: (names: string[]) => void;
}

import './Button.css';

const CreateSubCategoryPopup: React.FC<CreateSubCategoryPopupProps> = ({
  onClose,
  onCreate,
  categoryName,
}) => {
  const [inputs, setInputs] = useState(['']);

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const addInput = () => {
    setInputs([...inputs, '']);
  };

  const removeInput = (index: number) => {
    const newInputs = inputs.filter((_, i) => i !== index);
    setInputs(newInputs);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onCreate(inputs);
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>הוספת תת קטגוריה חדשה עבור {categoryName}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>שם תת הקטגוריה</label>
            {inputs.map((input, index) => (
              <div key={index} style={{ display: 'flex', marginBottom: '10px' }}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  required
                  style={{ flexGrow: 1, marginRight: '10px' }}
                />
                <button type="button" className="button-secondary" onClick={() => removeInput(index)}>
                  הסר
                </button>
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
            <button type="submit" className="button-primary">
              שמור
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSubCategoryPopup;
