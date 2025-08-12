import React, { useMemo, useState } from 'react';
import './Button.css';
import TextInput from './TextInput';
import AnimatedErrorMessage from './AnimatedErrorMessage';
import './CreateTemplate.css';

interface RenameCategoryPopupProps {
  currentName: string;
  onClose: () => void;
  onSave: (newName: string) => void;
  title: string;
  existingNames: string[];
}

const RenameCategoryPopup: React.FC<RenameCategoryPopupProps> = ({ currentName, onClose, onSave, title, existingNames }) => {
  const [newName, setNewName] = useState(currentName);

  const trimmed = newName.trim();
  const isUnchanged = trimmed === currentName;
  const isEmpty = trimmed.length === 0;
  const isDuplicate = useMemo(() => {
    const target = trimmed;
    if (!target) return false;
    // Allow keeping the same name; otherwise block if name exists among siblings
    if (target === currentName) return false;
    return existingNames.includes(target);
  }, [trimmed, existingNames, currentName]);

  const error = isEmpty ? '' : (isDuplicate ? 'שם זה כבר קיים.' : '');
  const canSave = !isEmpty && !isUnchanged && !isDuplicate;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (canSave) {
      onSave(trimmed);
    } else {
      onClose(); // Close if the name is unchanged or empty
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>{title}</h2>
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
            <AnimatedErrorMessage message={error} />
          </div>
          <div className="form-actions">
            <button type="button" className="button-secondary" onClick={onClose}>
              ביטול
            </button>
            <button type="submit" className="button-primary" disabled={!canSave}>
              שמירה
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RenameCategoryPopup;
