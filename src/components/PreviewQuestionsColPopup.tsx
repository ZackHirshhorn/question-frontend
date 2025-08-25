import React from 'react';
import './CreateTemplate.css';
import './Button.css';
import Loading from './Loading';

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
          {loading ? (
            <Loading />
          ) : questions?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {questions.map((q, idx) => {
                const type = String(q.qType || '').trim();
                const isText = type === 'Text';
                const isMultiple = type === 'Multiple';
                const isSingle = type === 'Single';
                const isNumber = type === 'Number';
                const nameAttr = `preview-q-${idx}`;
                return (
                  <div key={idx} style={{ display: 'grid', background: '#FFFFFF', border: '1px solid #EDEDEF', borderRadius: 4, padding: '12px 16px' }}>
                    <div style={{
                      fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
                      fontWeight: 700,
                      fontStyle: 'normal',
                      fontSize: '22px',
                      lineHeight: '100%',
                      letterSpacing: 0,
                      textAlign: 'right',
                      marginBottom: 30,
                    }}>
                      {q.q || '—'}{q.required ? ' *' : ''}
                    </div>
                    {isText && (
                      <input
                        type="text"
                        className="preview-text-input"
                        style={{ padding: '8px 10px', border: '1px solid #EDEDEF', borderRadius: 4, minWidth: 0, textAlign: 'right' }}
                        placeholder="הקלד כאן"
                      />
                    )}
                    {isNumber && (
                      <input
                        type="number"
                        style={{ padding: '8px 10px', border: '1px solid #EDEDEF', borderRadius: 4, justifySelf: 'start' }}
                        placeholder="0"
                      />
                    )}
                    {(isMultiple || isSingle) && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
                        {(q.choice || []).map((opt, i) => (
                          <label key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                            <input type={isSingle ? 'radio' : 'checkbox'} name={nameAttr} style={{ width: 20, height: 20 }} />
                            <span
                              style={{
                                fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
                                fontWeight: 500,
                                fontStyle: 'normal',
                                fontSize: '20px',
                                lineHeight: '100%',
                                letterSpacing: 0,
                                textAlign: 'right',
                              }}
                            >
                              {opt}
                            </span>
                          </label>
                        ))}
                        {(!q.choice || q.choice.length === 0) && (
                          <div style={{ color: '#888', fontSize: 14 }}>אין אפשרויות</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ color: '#666', textAlign: 'center', marginTop: 12 }}>אין שאלות להצגה</div>
          )}
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
