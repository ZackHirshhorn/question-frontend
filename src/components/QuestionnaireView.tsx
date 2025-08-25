import React from 'react';

export type PreviewQuestion = {
  q: string;
  qType: 'Text' | 'Multiple' | 'Single' | 'Number' | string;
  choice?: string[];
  required?: boolean;
};

interface QuestionnaireViewProps {
  questions: PreviewQuestion[] | undefined | null;
}

const QuestionnaireView: React.FC<QuestionnaireViewProps> = ({ questions }) => {
  const list = Array.isArray(questions) ? questions : [];
  if (list.length === 0) {
    return <div style={{ color: '#666', textAlign: 'center', marginTop: 12 }}>אין שאלות להצגה</div>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {list.map((q, idx) => {
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
                readOnly
              />
            )}
            {isNumber && (
              <input
                type="number"
                style={{ padding: '8px 10px', border: '1px solid #EDEDEF', borderRadius: 4, justifySelf: 'start' }}
                placeholder="0"
                readOnly
              />
            )}
            {(isMultiple || isSingle) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
                {(q.choice || []).map((opt, i) => (
                  <label key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type={isSingle ? 'radio' : 'checkbox'} name={nameAttr} style={{ width: 20, height: 20 }} readOnly />
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
  );
};

export default QuestionnaireView;

