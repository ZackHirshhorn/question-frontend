import React from 'react';
import TextInput from './TextInput';
import QuestionOptions from './QuestionOptions';
import QuestionNumber from './QuestionNumber';

type QuestionDraft = any;

interface AddQuestionFormProps {
  draft: QuestionDraft;
  onChange: (next: QuestionDraft) => void;
  onSave: () => void;
  onCancel: () => void;
}

const AddQuestionForm: React.FC<AddQuestionFormProps> = ({ draft, onChange, onSave, onCancel }) => {
  const isSaveDisabled = !String(draft?.q || '').trim();
  return (
    <div className="popup-question-form">
      <div className="question-form-grid">
        <div className="question-form-cell"><div className="question-form-label">טקסט השאלה</div></div>
        <div className="question-form-cell"><div className="question-form-label">סוג השאלה</div></div>
        <div className="question-form-cell">
          <TextInput
            value={draft?.q || ''}
            onChange={(e) => onChange({ ...draft, q: e.target.value })}
            placeholder="הזן את השאלה"
          />
        </div>
        <div className="question-form-cell">
          <select
            value={draft?.qType || 'טקסט'}
            onChange={(e) => onChange({ ...draft, qType: e.target.value })}
          >
            <option value="טקסט">טקסט</option>
            <option value="בחירה מרובה">בחירה מרובה</option>
            <option value="בחירה יחידה">בחירה יחידה</option>
            <option value="מספר">מספר</option>
          </select>
        </div>
        <div className="question-form-cell question-form-warning">
          <div className="popup-warning">רשימת הסוגים מוגדרת מקומית כרגע</div>
        </div>
        {(draft?.qType === 'בחירה מרובה' || draft?.qType === 'בחירה יחידה') && (
          <div className="question-form-cell question-form-right">
            <QuestionOptions
              choices={draft?.choice}
              onChange={(next) => onChange({ ...draft, choice: next })}
              mode={draft?.qType === 'בחירה יחידה' ? 'single' : 'multiple'}
              selectedIndex={draft?.selectedIndex ?? null}
              onSelectedIndexChange={(index) => onChange({ ...draft, selectedIndex: index })}
            />
          </div>
        )}
        {draft?.qType === 'מספר' && (
          <div className="question-form-cell question-form-right">
            <QuestionNumber
              value={draft?.numberValue}
              onChange={(v) => onChange({ ...draft, numberValue: v })}
            />
          </div>
        )}
        {/* Spacer row to create visual separation between row 2 and row 3 */}
        <div className="question-form-spacer" />
        <div className="question-form-cell">
          <label className="toggle-required">
            <input
              type="checkbox"
              checked={!!draft?.required}
              onChange={(e) => onChange({ ...draft, required: e.target.checked })}
            />
            <span className="toggle-ui" aria-hidden="true" />
            <span className="toggle-text">שאלת חובה</span>
          </label>
        </div>
        <div className="question-form-cell">
          <div className="question-form-actions">
            <button type="button" className="button-primary button-save" onClick={onSave} disabled={isSaveDisabled}>שמור שאלה</button>
            <button type="button" className="button-secondary button-cancel" onClick={onCancel}>ביטול</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddQuestionForm;
