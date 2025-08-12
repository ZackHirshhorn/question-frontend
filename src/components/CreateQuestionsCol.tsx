import React, { useEffect, useState } from 'react';
import './CreateTemplate.css';
import './Button.css';
import TextInput from './TextInput';
import AnimatedErrorMessage from './AnimatedErrorMessage';
import { createQuestionsCol } from '../api/questions';
import GreenCheckIcon from '../assets/icons/GreenCheckIcon';
import AddQuestionForm from './AddQuestionForm';
import TrashIcon from '../assets/icons/TrashIcon';
import EditIcon from '../assets/icons/EditIcon';
import ConfirmDeletePopup from './ConfirmDeletePopup';

interface CreateQuestionsColProps {
  onClose: () => void;
  onCreated: () => void;
  existingNames: string[];
}

const CreateQuestionsCol: React.FC<CreateQuestionsColProps> = ({ onClose, onCreated, existingNames }) => {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [description, setDescription] = useState('');
  // Committed questions that exist in the persisted set
  const [questions, setQuestions] = useState<any[]>([
    // Used to test the display when there are questions in the set:
    // { q: 'שאלה לדוגמה', qType: 'text', required: false },
  ]);
  // Local drafts (do not affect the empty state or green check until saved)
  const [draftQuestions, setDraftQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null);

  const LS_KEY = 'create_questions_col_saved_questions';

  // Load saved questions from localStorage on mount
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setQuestions(parsed);
        }
      }
    } catch (e) {
      // ignore localStorage errors
    }
  }, []);

  useEffect(() => {
    const trimmed = name.trim();
    if (trimmed.length > 0 && existingNames.includes(trimmed)) {
      setNameError('שם התבנית כבר קיים');
    } else if (trimmed.length > 0 && trimmed.length < 2) {
      setNameError('שם התבנית קצר מדי');
    } else {
      setNameError('');
    }
  }, [name, existingNames]);

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
      const payloadQuestions = questions.map((q) => {
        const qText = String(q?.q ?? '').trim();
        const qType = q?.qType ?? 'טקסט';
        const required = !!q?.required;
        let choice: string[] = [];
        if (qType === 'בחירה מרובה' || qType === 'בחירה יחידה') {
          const arr = Array.isArray(q?.choice) ? q.choice : [];
          choice = arr.map((c: any) => String(c ?? '').trim()).filter(Boolean);
        }
        return { q: qText, qType, required, choice } as any;
      });
      await createQuestionsCol(trimmed, payloadQuestions);
      onCreated();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'אירעה שגיאה ביצירת התבנית';
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

    // Normalize selectedIndex persistence rules
    const normalized: any = { ...newQ };
    // Do not persist selected option for single-choice; remove if present
    if ('selectedIndex' in normalized) delete normalized.selectedIndex;

    const updated =
      editingIndex !== null
        ? questions.map((q, i) => (i === editingIndex ? normalized : q))
        : [...questions, normalized];
    setQuestions(updated);
    setDraftQuestions([]); // close the new question frame
    setEditingIndex(null);
    try {
      window.localStorage.setItem(LS_KEY, JSON.stringify(updated));
    } catch (e) {
      // ignore localStorage errors
    }
  };

  const handleDeleteQuestion = (index: number) => {
    setQuestions((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      try {
        window.localStorage.setItem(LS_KEY, JSON.stringify(updated));
      } catch (e) {
        // ignore localStorage errors
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
        <h2>יצירת תבנית חדשה</h2>
        <p className="popup-subtitle">צור תבנית חדשה עם שאלות ואפשרויות מענה</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="colName" className="popup-label">כותרת התבנית</label>
            <TextInput
              id="colName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="כותרת"
              showCheck={!!name.trim() && !nameError}
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
              placeholder="תיאור"
            />
            <div className="popup-warning">שדה זה לא נשמר כרגע</div>
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
            />
          ) : (
            <div className="popup-divider" />
          )}

          {submitError && <div className="error-message show">{submitError}</div>}
          <div className="form-actions">
            <button type="submit" className="button-primary" disabled={loading || !!nameError || !name.trim()}>
              {loading ? 'יוצר…' : 'צור תבנית'}
            </button>
            <button type="button" className="button-secondary button-cancel" onClick={onClose} disabled={loading}>
              ביטול
            </button>
          </div>
        </form>
        {confirmDeleteIndex !== null && (
          <ConfirmDeletePopup
            message="בטוח למחוק?"
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

export default CreateQuestionsCol;
