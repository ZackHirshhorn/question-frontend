// src/components/ConfirmDeletePopup.tsx
import React from 'react';
import './Button.css';

interface ConfirmDeletePopupProps {
  message: string;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmDeletePopup: React.FC<ConfirmDeletePopupProps> = ({ message, onClose, onConfirm }) => {
  return (
    <div className="popup-overlay popup-overlay--center">
      <div className="popup-content">
        <h2 style={{ marginBottom: '20px' }}>{message}</h2>
        <div className="form-actions">
          <button type="button" className="button-secondary" onClick={onClose}>
            ביטול
          </button>
          <button type="button" className="button-danger" onClick={onConfirm}>
            מחיקה
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeletePopup;
