import React from 'react';
import '../Button.css';

interface NoEmailWarningPopupProps {
  onCancel: () => void;
  onContinue: () => void;
}

const NoEmailWarningPopup: React.FC<NoEmailWarningPopupProps> = ({ onCancel, onContinue }) => {
  return (
    <div className="popup-overlay popup-overlay--center">
      <div className="popup-content" style={{ width: 560, maxWidth: '90vw' }}>
        <h2 style={{ marginBottom: '8px' }}>המשך ללא דוא"ל</h2>
        <p style={{ marginTop: 0, marginBottom: '16px', textAlign: 'right', color: '#555' }}>
          ללא כתובת דוא"ל לא ניתן יהיה לצאת מהשאלון ולהמשיך מאוחר יותר.
        </p>
        <div className="form-actions" style={{ justifyContent: 'space-between', direction: 'rtl', width: '100%' }}>
          <button type="button" className="button-secondary" onClick={onCancel}>
            ביטול
          </button>
          <button type="button" className="button-primary" onClick={onContinue}>
            המשך
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoEmailWarningPopup;
