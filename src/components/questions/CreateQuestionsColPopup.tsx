import React, { useEffect, useState } from 'react';
import '../CreateTemplate.css';
import '../Button.css';
import TextInput from '../TextInput';
import AnimatedErrorMessage from '../AnimatedErrorMessage';
import { createQuestionsCol, updateQuestionCollection } from '../../api/questions';
import GreenCheckIcon from '../../assets/icons/GreenCheckIcon';
import AddQuestionForm from './AddQuestionForm';
import TrashIcon from '../../assets/icons/TrashIcon';
import EditIcon from '../../assets/icons/EditIcon';
import ConfirmDeletePopup from '../ConfirmDeletePopup';
import ExitButton from '../../assets/icons/ExitButton';
import SpinnerIcon from '../../assets/icons/SpinnerIcon';

export interface CreateQuestionsColInitial {
  id?: string;
  name?: string;
  description?: string;
  questions?: ColQuestion[];
}

interface CreateQuestionsColProps {
  onClose: () => void;
  onCreated: () => void;
  existingNames: string[];
  initial?: CreateQuestionsColInitial;
}

type ColQuestion = {
  id?: string;
  q?: string;
  qType?: string;
  required?: boolean;
  choice?: string[];
  selectedIndex?: number | null;
  numberValue?: number;
};

const uiToBackendMap: Record<string, 'Text' | 'Multiple' | 'Single' | 'Number'> = {
  'טקסט': 'Text',
  'בחירה מרובה': 'Multiple',
  'בחירה יחידה': 'Single',
  'מספר': 'Number',
};

const backendToUiMap: Record<string, string> = Object.fromEntries(
  Object.entries(uiToBackendMap).map(([ui, server]) => [server, ui]),
);

const toUiQType = (value?: string): string => {
  if (!value) return 'טקסט';
  return backendToUiMap[value] || value;
};

const toBackendQType = (value?: string): 'Text' | 'Multiple' | 'Single' | 'Number' => {
  if (value && value in uiToBackendMap) {
    return uiToBackendMap[value];
  }
  if (value && backendToUiMap[value]) {
    return value as 'Text' | 'Multiple' | 'Single' | 'Number';
  }
  return 'Text';
};

const sanitizeChoices = (choices?: unknown[]): string[] => {
  if (!Array.isArray(choices)) return [];
  return choices.map((choice) => String(choice ?? '')).filter((choice) => choice.trim().length > 0);
};

const normalizeIncomingQuestion = (question: ColQuestion): ColQuestion => ({
  ...question,
  qType: toUiQType(typeof question?.qType === 'string' ? question.qType : undefined),
  choice: sanitizeChoices(question?.choice),
});

const CreateQuestionsColPopup: React.FC<CreateQuestionsColProps> = ({ onClose, onCreated, existingNames, initial }) => {
  const isEdit = !!initial?.id;
  const collectionId = initial?.id;
  const [name, setName] = useState(initial?.name || '');
  const [nameError, setNameError] = useState('');
  const [description, setDescription] = useState(initial?.description || '');
  // Committed questions that exist in the persisted set
  const [questions, setQuestions] = useState<ColQuestion[]>(initial?.questions || [
    // Used to test the display when there are questions in the set:
    // { q: 'שאלה לדוגמה', qType: 'text', required: false },
  ]);
  // Local drafts (do not affect the empty state or green check until saved)
  const [draftQuestions, setDraftQuestions] = useState<ColQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null);
  const [nameActivated, setNameActivated] = useState(false);
  const [descActivated, setDescActivated] = useState(false);

  const LS_KEY = 'create_questions_col_saved_questions';

  // Initialize/refresh when `initial` changes
  useEffect(() => {
    if (initial) {
      setName(initial.name || '');
      setDescription(initial.description || '');
      const incoming = Array.isArray(initial.questions) ? initial.questions : [];
      setQuestions(incoming.map(normalizeIncomingQuestion));
      return; // when editing existing, skip localStorage hydration
    }
    // Load saved questions from localStorage on mount when creating new
    setName('');
    setDescription('');
    try {
      const raw = window.localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setQuestions(parsed.map(normalizeIncomingQuestion));
        }
        return;
      }
    } catch {
      // ignore localStorage errors
    }
    setQuestions([]);
  }, [initial]);

  useEffect(() => {
    const trimmed = name.trim();
    const isDuplicate = existingNames.includes(trimmed) && (!initial || trimmed !== (initial.name || '').trim());
    if (trimmed.length > 0 && isDuplicate) {
      setNameError('שם התבנית כבר קיים');
    } else if (trimmed.length > 0 && trimmed.length < 2) {
      setNameError('שם התבנית קצר מדי');
    } else {
      setNameError('');
    }
  }, [name, existingNames, initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setSubmitError('נא להזין שם תבנית');
      return;
    }
    if (nameError) return;

    setLoading(true);
    setSubmitError(null);
    try {
      // Normalize questions for server
      const trimmedDescription = description.trim();
      const payloadQuestions = questions
        .map((q) => {
          const qText = String(q?.q ?? '').trim();
          if (!qText) return null;
          const backendType = toBackendQType(typeof q?.qType === 'string' ? q.qType : undefined);
          const required = !!q?.required;
          const choice = backendType === 'Multiple' || backendType === 'Single'
            ? sanitizeChoices(q?.choice)
            : [];
          const base = {
            q: qText,
            qType: backendType,
            required,
            choice,
          } as { q: string; qType: 'Text' | 'Multiple' | 'Single' | 'Number'; required: boolean; choice: string[]; id?: string };
          if (q?.id && String(q.id).trim().length > 0) {
            base.id = String(q.id).trim();
          }
          return base;
        })
        .filter((item): item is { q: string; qType: 'Text' | 'Multiple' | 'Single' | 'Number'; required: boolean; choice: string[]; id?: string } => item !== null);

      const payloadDescription = trimmedDescription.length > 0 ? trimmedDescription : undefined;

      if (collectionId) {
        await updateQuestionCollection(collectionId, {
          colName: trimmed,
          description: payloadDescription,
          questions: payloadQuestions,
        });
      } else {
        await createQuestionsCol(trimmed, payloadQuestions, payloadDescription);
        // On successful creation, clear any locally saved questions
        try {
          window.localStorage.removeItem(LS_KEY);
        } catch {
          // ignore localStorage errors
        }
      }

      onCreated();
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message || 'אירעה שגיאה ביצירת התבנית';
      setSubmitError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setDraftQuestions((prev) => [
      ...prev,
      { q: '', qType: 'טקסט', required: false, choice: [] },
    ]);
  };

  const handleCancelDraft = () => {
    setDraftQuestions([]);
    setEditingIndex(null);
  };

  const handleSaveDraft = () => {
    if (!draftQuestions[0]) return;
    const newQ = draftQuestions[0];
    const title = String(newQ.q ?? '').trim();
    if (!title) return; // prevent saving when question name is empty

    // Prevent duplicates by question text (trimmed)
    const existingNames = questions.map((q) => String(q?.q ?? '').trim()).filter(Boolean);
    const original = editingIndex !== null ? String(questions[editingIndex]?.q || '').trim() : null;
    const isDuplicate = existingNames.includes(title) && (!original || title !== original);
    if (isDuplicate) {
      return; // logical guard; UI also disables save
    }

    // Normalize selectedIndex persistence rules
    const normalized: ColQuestion = { ...newQ };
    // Do not persist UI-only/answer-like fields
    if ('selectedIndex' in normalized) delete normalized.selectedIndex; // single-choice selection
    if ('numberValue' in normalized) delete normalized.numberValue; // transient numeric input

    const updated =
      editingIndex !== null
        ? questions.map((q, i) => (i === editingIndex ? normalized : q))
        : [...questions, normalized];
    setQuestions(updated);
    setDraftQuestions([]); // close the new question frame
    setEditingIndex(null);
    if (!isEdit) {
      try {
        window.localStorage.setItem(LS_KEY, JSON.stringify(updated));
      } catch {
        // ignore localStorage errors
      }
    }
  };

  const handleDeleteQuestion = (index: number) => {
    setQuestions((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (!isEdit) {
        try {
          window.localStorage.setItem(LS_KEY, JSON.stringify(updated));
        } catch {
          // ignore localStorage errors
        }
      }
      return updated;
    });
  };

  const handleEditQuestion = (index: number) => {
    const q = questions[index];
    setEditingIndex(index);
    setDraftQuestions([ { ...q } ]);
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content popup-content--square">
        <button
          type="button"
          className="popup-close-button"
          aria-label="סגור"
          onClick={onClose}
        >
          <ExitButton />
        </button>
        <div className="popup-header">
          <h2>{isEdit ? 'עריכת תבנית קיימת' : 'יצירת תבנית חדשה'}</h2>
          <p className="popup-subtitle">{isEdit ? 'ערוך תבנית' : 'צור תבנית חדשה עם שאלות ואפשרויות מענה'}</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="colName" className="popup-label">כותרת התבנית</label>
            <TextInput
              id="colName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setNameActivated(true)}
              required
              placeholder="כותרת"
              showCheck={!!name.trim() && !nameError}
              wrapperClassName={!isEdit && !nameActivated ? 'input-wrapper--muted' : undefined}
            />
            <AnimatedErrorMessage message={nameError} />
          </div>

          <div className="form-group">
            <label htmlFor="colDesc" className="popup-label">תיאור (אופציונלי)</label>
            <TextInput
              id="colDesc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onFocus={() => setDescActivated(true)}
              placeholder="תיאור"
              wrapperClassName={!isEdit && !descActivated ? 'input-wrapper--muted' : undefined}
            />
            
          </div>

          <div className="popup-section-header">
            <h3 className="popup-section-title">שאלות בתבנית</h3>
            {questions.length > 0 && <GreenCheckIcon />}
          </div>

          {questions.length === 0 && draftQuestions.length === 0 && (
            <div className="popup-empty-questions">
              אין שאלות בתבנית זו עדיין. הוסף שאלה באמצעות הכפתור למטה
            </div>
          )}

          {/* Show saved questions (read-only) above the add button */}
          {questions.length > 0 && draftQuestions.length === 0 && (
            <div className="popup-actions-start">
              <div className="popup-questions-list">
                {questions.map((q, idx) => (
                  <div key={idx} className="popup-question-item">
                    <div className="popup-question-item-row">
                      <div className="popup-question-textblock">
                        <div className="popup-question-text">{q.q || '—'}</div>
                        <div className="popup-question-meta">{q.qType}</div>
                      </div>
                      <div className="popup-question-actions">
                        <button
                          type="button"
                          className="icon-button"
                          aria-label="מחיקה"
                          onClick={() => setConfirmDeleteIndex(idx)}
                        >
                          <TrashIcon />
                        </button>
                        <button
                          type="button"
                          className="icon-button"
                          aria-label="עריכה"
                          onClick={() => handleEditQuestion(idx)}
                        >
                          <EditIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {draftQuestions.length === 0 && (
            <div className="popup-actions-start">
              <button type="button" className="button-add-question" onClick={handleAddQuestion}>
                הוסף שאלה חדשה +
              </button>
            </div>
          )}

          {draftQuestions.length > 0 ? (
            <AddQuestionForm
              draft={draftQuestions[0]}
              onChange={(next) => setDraftQuestions((prev) => { const copy = [...prev]; copy[0] = next; return copy; })}
              onSave={handleSaveDraft}
              onCancel={handleCancelDraft}
              existingNames={questions.map((q) => String(q?.q ?? '').trim()).filter(Boolean)}
              editingOriginalName={editingIndex !== null ? String(questions[editingIndex]?.q || '').trim() : undefined}
            />
          ) : (
            <div className="popup-divider" />
          )}

          {submitError && <div className="error-message show">{submitError}</div>}
          <div className="form-actions">
            <button type="submit" className="button-primary" disabled={loading || !!nameError || !name.trim()} aria-busy={loading}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              {loading && <SpinnerIcon />}
              {loading ? (isEdit ? 'שומר…' : 'יוצר…') : (isEdit ? 'שמור שינויים' : 'צור תבנית')}
            </button>
            <button type="button" className="button-secondary button-cancel" onClick={onClose} disabled={loading}>
              ביטול
            </button>
          </div>
        </form>
        {confirmDeleteIndex !== null && (
          <ConfirmDeletePopup
            message={`למחוק '${questions[confirmDeleteIndex]?.q || ''}'?`}
            onClose={() => setConfirmDeleteIndex(null)}
            onConfirm={() => {
              if (confirmDeleteIndex !== null) {
                handleDeleteQuestion(confirmDeleteIndex);
              }
              setConfirmDeleteIndex(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default CreateQuestionsColPopup;
