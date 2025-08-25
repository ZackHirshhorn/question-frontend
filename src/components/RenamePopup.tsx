import React, { useMemo, useState } from 'react';
import './Button.css';
import TextInput from './TextInput';
import AnimatedErrorMessage from './AnimatedErrorMessage';
import './CreateTemplate.css';
import SpinnerIcon from '../assets/icons/SpinnerIcon';

interface RenamePopupProps {
  currentName: string;
  onClose: () => void;
  onSave: (newName: string) => void;
  title: string;
  existingNames: string[];
  saving?: boolean;
}

const RenamePopup: React.FC<RenamePopupProps> = ({ currentName, onClose, onSave, title, existingNames, saving = false }) => {
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
            <button type="button" className="button-secondary" onClick={onClose} disabled={saving}>
              ביטול
            </button>
            <button type="submit" className="button-primary" disabled={!canSave || saving} aria-busy={saving}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              {saving && <SpinnerIcon />}
              {saving ? 'שומר…' : 'שמירה'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RenamePopup;
