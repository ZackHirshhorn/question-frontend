// src/components/CreateCategoryPopup.tsx
import React, { useState } from 'react';
import './Button.css';

interface CreateCategoryPopupProps {
  onClose: () => void;
  onCreate: (names: string[]) => void;
}

const CreateCategoryPopup: React.FC<CreateCategoryPopupProps> = ({ onClose, onCreate }) => {
  const [names, setNames] = useState(['']);

  const handleInputChange = (index: number, value: string) => {
    const newNames = [...names];
    newNames[index] = value;
    setNames(newNames);
  };

  const addInput = () => {
    setNames([...names, '']);
  };

  const removeInput = (index: number) => {
    const newNames = names.filter((_, i) => i !== index);
    setNames(newNames);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const filteredNames = names.map(name => name.trim()).filter(name => name);
    if (filteredNames.length > 0) {
      onCreate(filteredNames);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>יצירת קטגוריה חדשה</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>שמות הקטגוריות</label>
            {names.map((name, index) => (
              <div key={index} style={{ display: 'flex', marginBottom: '10px' }}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  required
                  style={{ flexGrow: 1, marginRight: '10px' }}
                />
                {names.length > 1 && (
                  <button type="button" className="button-secondary" onClick={() => removeInput(index)}>
                    הסר
                  </button>
                )}
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
            <button type="submit" className="button-primary">
              יצירה
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCategoryPopup;
