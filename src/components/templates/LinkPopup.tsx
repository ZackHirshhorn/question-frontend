import React from 'react';
import '../Button.css';
import TextInput from '../TextInput';

interface LinkPopupProps {
  url: string;
  onClose: () => void;
}

const LinkPopup: React.FC<LinkPopupProps> = ({ url, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback: select text for manual copy
      const el = document.getElementById('template-link') as HTMLInputElement | null;
      if (el) {
        el.select();
        document.execCommand('copy');
      }
    }
    setCopied(true);
  };

  return (
    <div className="popup-overlay popup-overlay--center">
      <div className="popup-content" style={{ width: 560, maxWidth: '90vw' }}>
        <h2 style={{ marginBottom: '16px' }}>קישור למענה לשאלון</h2>
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <TextInput
            id="template-link"
            type="text"
            value={url}
            readOnly
            aria-label="קישור לשיתוף"
            title={url}
            onFocus={(e) => e.currentTarget.select()}
            // Show the beginning of the URL and allow horizontal scroll
            style={{ width: '100%' }}
            inputClassName="ltr-url-input"
          />
        </div>
        <div className="form-actions">
          <button type="button" className="button-secondary" onClick={onClose}>
            סגור
          </button>
          <button
            type="button"
            className="button-primary"
            onClick={handleCopy}
            style={{
              backgroundColor: copied ? '#2BB673' : undefined,
              transition: 'background-color 0.2s ease-in-out',
            }}
          >
            {copied ? 'הועתק!' : 'העתק'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkPopup;
