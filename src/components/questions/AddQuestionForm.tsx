import React from 'react';
import TextInput from '../TextInput';
import AnimatedErrorMessage from '../AnimatedErrorMessage';
import QuestionOptions from './QuestionOptions';
import TypeSelect from '../TypeSelect';
import QuestionNumber from './QuestionNumber';

// Minimal shape used by the UI to assemble a question draft
type QuestionDraft = {
  q?: string;
  qType?: string;
  choice?: string[];
  selectedIndex?: number | null;
  numberValue?: number;
  required?: boolean;
  // Allow arbitrary additional fields without triggering `any`
  [key: string]: unknown;
};

interface AddQuestionFormProps {
  draft: QuestionDraft;
  onChange: (next: QuestionDraft) => void;
  onSave: () => void;
  onCancel: () => void;
  existingNames?: string[]; // existing committed question names (trimmed)
  editingOriginalName?: string; // when editing, allow keeping same name
}

const AddQuestionForm: React.FC<AddQuestionFormProps> = ({ draft, onChange, onSave, onCancel, existingNames = [], editingOriginalName }) => {
  const trimmed = String(draft?.q || '').trim();
  const isDuplicate = !!trimmed && existingNames.includes(trimmed) && (!editingOriginalName || trimmed !== editingOriginalName.trim());
  const isSaveDisabled = !trimmed || isDuplicate;
  return (
    <div className="popup-question-form">
      <div className="question-form-grid">
        <div className="question-form-cell"><div className="question-form-label">טקסט השאלה</div></div>
        <div className="question-form-cell"><div className="question-form-label">סוג השאלה</div></div>
        <div className="question-form-cell">
          <div className="question-form-vertical">
            <TextInput
              value={draft?.q || ''}
              onChange={(e) => onChange({ ...draft, q: e.target.value })}
              placeholder="הזן את השאלה"
            />
            <AnimatedErrorMessage message={isDuplicate ? 'שאלה עם שם זה כבר קיימת.' : ''} />
          </div>
        </div>
        <div className="question-form-cell">
          <div className="question-form-vertical">
            <TypeSelect
              ariaLabel="סוג השאלה"
              value={draft?.qType || 'טקסט'}
              options={[
                { value: 'טקסט', label: 'טקסט' },
                { value: 'בחירה מרובה', label: 'בחירה מרובה' },
                { value: 'בחירה יחידה', label: 'בחירה יחידה' },
                { value: 'מספר', label: 'מספר' },
              ]}
              onChange={(val) => onChange({ ...draft, qType: val })}
            />
            <div className="popup-warning">רשימת הסוגים מוגדרת מקומית כרגע</div>
          </div>
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
