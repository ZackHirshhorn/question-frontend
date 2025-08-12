import React, { useState } from 'react';
import './Button.css';
import TextInput from './TextInput';

interface RenameCategoryPopupProps {
  currentName: string;
  onClose: () => void;
  onSave: (newName: string) => void;
}

const RenameCategoryPopup: React.FC<RenameCategoryPopupProps> = ({ currentName, onClose, onSave }) => {
  const [newName, setNewName] = useState(currentName);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (newName.trim() && newName.trim() !== currentName) {
      onSave(newName.trim());
    } else {
      onClose(); // Close if the name is unchanged or empty
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>שינוי שם קטגוריה</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="category-new-name">שם חדש</label>
            <TextInput
              id="category-new-name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="form-actions">
            <button type="button" className="button-secondary" onClick={onClose}>
              ביטול
            </button>
            <button type="submit" className="button-primary">
              שמירה
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RenameCategoryPopup;
