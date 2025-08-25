import React, { useEffect, useState } from 'react';
import SearchIcon from '../assets/icons/SearchIcon';
import PlusWhiteIcon from '../assets/icons/PlusWhiteIcon';
import EditIcon from '../assets/icons/EditIcon';
import TrashIcon from '../assets/icons/TrashIcon';
import PreviewIcon from '../assets/icons/PreviewIcon';
import PlusOneIcon from '../assets/icons/PlusOneIcon';
import './Button.css';
import './Questions.css';
import { searchQuestionCollections, getQuestionCollection, deleteQuestionCollection, updateQuestionCollection } from '../api/questions';
import ConfirmDeletePopup from './ConfirmDeletePopup';
import RenameCategoryPopup from './RenameCategoryPopup';
import PreviewQuestionsColPopup from './PreviewQuestionsColPopup';
import CreateQuestionsCol from './CreateQuestionsCol';

type QuestionCollection = {
  _id: string;
  name: string;
  description?: string;
  size?: number;
};

const Questions: React.FC = () => {
  const [query, setQuery] = useState('');
  const [collections, setCollections] = useState<QuestionCollection[]>([]);
  // Keep a separate list of all names for uniqueness validation in the create modal
  const [allNames, setAllNames] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  // Rely on API-provided size; no per-item count fetching
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [initialCol, setInitialCol] = useState<{ name?: string; description?: string; questions?: any[] } | null>(null);
  const [renameTarget, setRenameTarget] = useState<{ id: string; name: string } | null>(null);
  const [previewTarget, setPreviewTarget] = useState<{ id: string; name: string; questions: any[]; description?: string } | null>(null);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);

  const fetchCollections = (value?: string) => {
    let active = true;
    setLoading(true);
    setError(null);
    searchQuestionCollections(value)
      .then((res) => {
        if (!active) return;
        const data = res.data as { collection?: any[] };
        const list = Array.isArray(data.collection) ? data.collection : [];
        // Normalize ID field: backend may return `id` (via toJSON) instead of `_id`
        const normalized: QuestionCollection[] = list
          .map((c: any) => {
            return {
              _id: c?._id || c?.id,
              name: c?.name,
              description: c?.description,
              size: typeof c?.size === 'number' ? c.size : undefined,
            } as QuestionCollection;
          })
        // Filter out any items that still lack an id to avoid bad requests
        .filter((c) => typeof c._id === 'string' && c._id.length > 0);
        setCollections(normalized);
        // No fallback hydration; items without size will display an em dash
      })
      .catch((e) => {
        if (!active) return;
        setError('שגיאה בטעינת אסופות השאלות');
        console.error(e);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  };

  // Fetch all names (unfiltered) for create modal validation
  const fetchAllNames = () => {
    let active = true;
    searchQuestionCollections(undefined)
      .then((res) => {
        if (!active) return;
        const data = res.data as { collection?: QuestionCollection[] };
        const list = Array.isArray(data.collection) ? data.collection : [];
        setAllNames(list.map((c) => c.name?.trim()).filter(Boolean));
      })
      .catch(() => {
        // ignore name prefetch errors; backend will still validate
      });
    return () => {
      active = false;
    };
  };

  useEffect(() => {
    const cancel = fetchCollections(query);
    return cancel;
  }, [query]);

  // No per-item count fetch effect; rely solely on API size

  // When opening the create modal, prefetch all names for uniqueness check
  useEffect(() => {
    if (isCreateOpen) {
      const cancel = fetchAllNames();
      return cancel;
    }
  }, [isCreateOpen]);

  return (
    <div>
      <div style={{ position: 'relative' }}>
        <SearchIcon
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            fill: '#9aa0a6',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חיפוש"
          style={{
            width: '100%',
            backgroundColor: '#F6F6F9',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '12px 16px',
            paddingRight: '40px',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ marginTop: '12px', marginBottom: '12px' }}>
        <button
          type="button"
          className="button-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: 'calc((100% - 24px) / 3)',
            borderRadius: '4px',
            border: '1px solid #0957D0',
            fontSize: '16px',
          }}
          onClick={() => {
            setInitialCol(null);
            setIsCreateOpen(true);
          }}
        >
          <span
            style={{
              fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
              fontWeight: 700,
              fontSize: '20px',
              lineHeight: '100%',
              letterSpacing: '0',
              textAlign: 'right',
            }}
          >
            תבנית חדשה
          </span>
          <PlusWhiteIcon />
        </button>
      </div>

      {loading ? (
        <div style={{ marginTop: '16px' }}>טוען…</div>
      ) : error ? (
        <div style={{ marginTop: '16px', color: '#b00020' }}>{error}</div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginTop: '16px',
          }}
        >
          {collections.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#666' }}>
              אין אסופות שאלות להצגה
            </div>
          ) : (
            collections.map((col) => (
              <div
                key={col._id}
                style={{
                  backgroundColor: '#F6F6F9',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  minHeight: '120px',
                  padding: '12px',
                  boxShadow: '0 1px 1px #b3b3b3',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                onClick={async () => {
                  try {
                    const res = await getQuestionCollection(col._id);
                    const data = res.data || {};
                    setInitialCol({
                      name: data?.name || col.name,
                      description: data?.description || col.description || '',
                      questions: Array.isArray(data?.questions) ? data.questions : [],
                    });
                    setIsCreateOpen(true);
                  } catch (e) {
                    console.error(e);
                  }
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 1,
                    paddingTop: '12px',
                    paddingBottom: '12px',
                  }}
                >
                  <span className="questions-item-title">{col.name}</span>
                  <span className="questions-item-desc">{col.description?.trim() || 'אין תיאור'}</span>
                </div>
                <div className="questions-card-divider" />
                <div className="questions-card-actions">
                  <span className="questions-card-count">
                    {typeof col.size === 'number'
                      ? `${col.size}\u00A0שאלות`
                      : `—\u00A0שאלות`}
                  </span>
                  <div className="questions-card-icons" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="questions-icon-button"
                      aria-label="תצוגה מקדימה"
                      onClick={async () => {
                        try {
                          setPreviewTarget({ id: col._id, name: col.name, questions: [], description: col.description });
                          setPreviewLoading(true);
                          const res = await getQuestionCollection(col._id);
                          const data = res.data || {};
                          setPreviewTarget({ id: col._id, name: col.name, questions: Array.isArray(data?.questions) ? data.questions : [], description: data?.description || col.description });
                        } catch (e) {
                          console.error(e);
                        } finally {
                          setPreviewLoading(false);
                        }
                      }}
                    >
                      <PreviewIcon />
                    </button>
                    <button
                      type="button"
                      className="questions-icon-button"
                      aria-label="מחיקה"
                      onClick={() => setConfirmDeleteId(col._id)}
                    >
                      <TrashIcon />
                    </button>
                    <button
                      type="button"
                      className="questions-icon-button"
                      aria-label="שינוי שם"
                      onClick={() => setRenameTarget({ id: col._id, name: col.name })}
                    >
                      <EditIcon />
                    </button>
                    <button
                      type="button"
                      className="questions-icon-button"
                      aria-label="פלוס אחד"
                      onClick={async () => {
                        try {
                          const res = await getQuestionCollection(col._id);
                          const data = res.data || {};
                          setInitialCol({
                            name: data?.name || col.name,
                            description: data?.description || col.description || '',
                            questions: Array.isArray(data?.questions) ? data.questions : [],
                          });
                          setIsCreateOpen(true);
                        } catch (e) {
                          console.error(e);
                        }
                      }}
                    >
                      <PlusOneIcon />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {isCreateOpen && (
        <CreateQuestionsCol
          onClose={() => {
            setIsCreateOpen(false);
            setInitialCol(null);
          }}
          onCreated={() => {
            setIsCreateOpen(false);
            setInitialCol(null);
            fetchCollections();
          }}
          existingNames={initialCol?.name ? allNames.filter((n) => n.trim() !== initialCol?.name?.trim()) : allNames}
          initial={initialCol || undefined}
        />
      )}

      {confirmDeleteId && (
        <ConfirmDeletePopup
          message="בטוח למחוק?"
          onClose={() => setConfirmDeleteId(null)}
          onConfirm={async () => {
            if (!confirmDeleteId) return;
            try {
              setDeleting(true);
              await deleteQuestionCollection(confirmDeleteId);
              // Optimistically remove from UI
              setCollections((prev) => prev.filter((c) => c._id !== confirmDeleteId));
              setConfirmDeleteId(null);
            } catch (e) {
              console.error(e);
              setError('מחיקה נכשלה');
            } finally {
              setDeleting(false);
            }
          }}
        />
      )}

      {renameTarget && (
        <RenameCategoryPopup
          currentName={renameTarget.name}
          onClose={() => setRenameTarget(null)}
          title="שינוי שם אסופת שאלות"
          existingNames={collections
            .map((c) => c.name)
            .filter((n) => n && n.trim() !== renameTarget.name.trim())}
          onSave={async (newName) => {
            try {
              await updateQuestionCollection(renameTarget.id, { colName: newName });
              // Update UI names
              setCollections((prev) => prev.map((c) => (c._id === renameTarget.id ? { ...c, name: newName } : c)));
              setAllNames((prev) => {
                const withoutOld = prev.filter((n) => n.trim() !== renameTarget.name.trim());
                return [...withoutOld, newName];
              });
              setRenameTarget(null);
            } catch (e) {
              console.error('Rename failed', e);
            }
          }}
        />
      )}

      {previewTarget && (
        <PreviewQuestionsColPopup
          name={previewTarget.name}
          questions={previewTarget.questions}
          description={previewTarget.description}
          loading={previewLoading}
          onClose={() => setPreviewTarget(null)}
        />
      )}
    </div>
  );
};

export default Questions;
