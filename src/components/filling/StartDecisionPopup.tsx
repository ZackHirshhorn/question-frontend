import React from 'react';
import '../Button.css';

interface StartDecisionPopupProps {
  templateId?: string;
  onLogin: () => void;
  onContinueWithoutLogin: () => void;
}

const StartDecisionPopup: React.FC<StartDecisionPopupProps> = ({ onLogin, onContinueWithoutLogin }) => {
  return (
    <div className="popup-overlay popup-overlay--center">
      <div className="popup-content" style={{ width: 560, maxWidth: '90vw' }}>
        <h2 style={{ marginBottom: '8px' }}>תחילת מענה לשאלון</h2>
        <p style={{ marginTop: 0, marginBottom: '16px', textAlign: 'right', color: '#555' }}>
          ניתן להמשיך כמחובר/ת כדי לשמור שיוך לחשבונך, או להמשיך ללא התחברות.
        </p>
        <div className="form-actions" style={{ justifyContent: 'space-between', direction: 'rtl', width: '100%' }}>
          <button type="button" className="button-primary" onClick={onLogin}>
            התחברות
          </button>
          <button type="button" className="button-secondary" onClick={onContinueWithoutLogin}>
            המשך ללא התחברות
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartDecisionPopup;
