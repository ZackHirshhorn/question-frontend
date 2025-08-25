import React from 'react';
import '../Button.css';

interface InfoPopupProps {
  title?: string;
  message: React.ReactNode;
  onClose: () => void;
  acknowledgeLabel?: string;
}

const InfoPopup: React.FC<InfoPopupProps> = ({ title, message, onClose, acknowledgeLabel = 'הבנתי' }) => {
  return (
    <div className="popup-overlay popup-overlay--center" role="dialog" aria-modal="true">
      <div className="popup-content" style={{ maxWidth: 520 }}>
        {title && <h2 style={{ marginTop: 0 }}>{title}</h2>}
        <div style={{ margin: '16px 0', lineHeight: 1.5 }}>{message}</div>
        <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="button-primary" onClick={onClose}>
            {acknowledgeLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoPopup;
