import React, { useId } from 'react';

export type QuestionAnswer = string | number | boolean | string[] | Record<string, unknown> | null | undefined;

export type PreviewQuestion = {
  q: string;
  qType: 'Text' | 'Multiple' | 'Single' | 'Number' | string;
  choice?: string[];
  required?: boolean;
  answer?: QuestionAnswer;
};

interface QuestionnaireViewProps {
  questions: PreviewQuestion[] | undefined | null;
  mode?: 'read' | 'answer';
  onAnswerChange?: (questionIndex: number, value: QuestionAnswer) => void;
}

const QuestionnaireView: React.FC<QuestionnaireViewProps> = ({ questions, mode = 'read', onAnswerChange }) => {
  const list = Array.isArray(questions) ? questions : [];
  if (list.length === 0) {
    return <div style={{ color: '#666', textAlign: 'center', marginTop: 12 }}>אין שאלות להצגה</div>;
  }
  const nameBase = useId().replace(/:/g, '-');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {list.map((q, idx) => {
        const type = String(q.qType || '').trim();
        const isText = type === 'Text';
        const isMultiple = type === 'Multiple';
        const isSingle = type === 'Single';
        const isNumber = type === 'Number';
        const nameAttr = `preview-q-${nameBase}-${idx}`;
        const isReadOnly = mode === 'read';
        const handleChange = (value: QuestionAnswer) => {
          if (isReadOnly || !onAnswerChange) return;
          onAnswerChange(idx, value);
        };
        const answer = q.answer;
        const selectionContains = (value: string): boolean => {
          if (Array.isArray(answer)) {
            return answer.includes(value);
          }
          if (typeof answer === 'string') {
            return answer === value;
          }
          return false;
        };

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
                readOnly={isReadOnly}
                value={typeof answer === 'string' ? answer : ''}
                onChange={(event) => {
                  if (isReadOnly) return;
                  handleChange(event.target.value);
                }}
              />
            )}
            {isNumber && (
              <input
                type="number"
                style={{ padding: '8px 10px', border: '1px solid #EDEDEF', borderRadius: 4, justifySelf: 'start' }}
                placeholder="0"
                readOnly={isReadOnly}
                value={typeof answer === 'number' || typeof answer === 'string' ? answer : ''}
                onChange={(event) => {
                  if (isReadOnly) return;
                  const next = event.target.value;
                  if (next === '') {
                    handleChange(null);
                    return;
                  }
                  const parsed = Number(next);
                  handleChange(Number.isNaN(parsed) ? null : parsed);
                }}
              />
            )}
            {(isMultiple || isSingle) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
                {(q.choice || []).map((opt, i) => {
                  const optionValue = typeof opt === 'string' ? opt : '';
                  return (
                    <label key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input
                        type={isSingle ? 'radio' : 'checkbox'}
                        name={nameAttr}
                        style={{ width: 20, height: 20 }}
                        readOnly={isReadOnly}
                        checked={selectionContains(optionValue)}
                        value={optionValue}
                        onChange={() => {
                          if (isReadOnly || !onAnswerChange) return;
                          if (isSingle) {
                            handleChange(optionValue);
                          } else {
                            const current = Array.isArray(answer) ? answer : [];
                            if (current.includes(optionValue)) {
                              handleChange(current.filter((val) => val !== optionValue));
                            } else {
                              handleChange([...current, optionValue]);
                            }
                          }
                        }}
                      />
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
                        {optionValue}
                      </span>
                    </label>
                  );
                })}
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
