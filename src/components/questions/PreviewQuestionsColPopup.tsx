import React from 'react';
import '../CreateTemplate.css';
import '../Button.css';
import Loading from '../Loading';
import QuestionnaireView from '../questionnaires/QuestionnaireView';

interface PreviewQuestionsColPopupProps {
  name: string;
  questions: Array<{
    q: string;
    qType: 'Text' | 'Multiple' | 'Single' | 'Number' | string;
    choice?: string[];
    required?: boolean;
  }>;
  description?: string;
  loading?: boolean;
  onClose: () => void;
}

const PreviewQuestionsColPopup: React.FC<PreviewQuestionsColPopupProps> = ({ name, questions, description, loading, onClose }) => {
  return (
    <div className="popup-overlay" role="dialog" aria-modal="true">
      <div className="popup-content popup-content--square">
        <h2
          style={{
            fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
            fontWeight: 600, // Semi Bold
            fontStyle: 'normal',
            fontSize: '24px',
            lineHeight: '100%',
            letterSpacing: 0,
            textAlign: 'right',
            marginTop: 0,
            marginBottom: 16,
          }}
        >
          {`תצוגה מקדימה: ${name}`}
        </h2>

        <p
          style={{
            fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
            fontWeight: 400, // Regular
            fontStyle: 'normal',
            fontSize: '16px',
            lineHeight: '100%',
            letterSpacing: 0,
            textAlign: 'right',
            marginTop: 0,
            marginBottom: 16,
          }}
        >
          כך יראה שאלון המשתמש בתבנית זו
        </p>

        {description && (
          <p
            style={{
              fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
              fontWeight: 400,
              fontStyle: 'normal',
              fontSize: '14px',
              lineHeight: '100%',
              letterSpacing: 0,
              textAlign: 'right',
              color: '#666',
              marginTop: 0,
              marginBottom: 16,
            }}
          >
            {description}
          </p>
        )}

        {/* Questions preview list */}
        <div style={{ direction: 'rtl' }}>
          {loading ? <Loading /> : <QuestionnaireView questions={questions} />}
        </div>

        <div className="form-actions" style={{ marginTop: 16 }}>
          <button type="button" className="button-secondary" onClick={onClose}>
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewQuestionsColPopup;
