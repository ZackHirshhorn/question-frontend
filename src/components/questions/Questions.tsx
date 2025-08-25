import React, { useCallback, useEffect, useState } from 'react';
import SearchIcon from '../../assets/icons/SearchIcon';
import PlusWhiteIcon from '../../assets/icons/PlusWhiteIcon';
import EditIcon from '../../assets/icons/EditIcon';
import TrashIcon from '../../assets/icons/TrashIcon';
import PreviewIcon from '../../assets/icons/PreviewIcon';
import PlusOneIcon from '../../assets/icons/PlusOneIcon';
import '../Button.css';
import './Questions.css';
import { searchQuestionCollections, getQuestionCollection, deleteQuestionCollection, updateQuestionCollection } from '../../api/questions';
import ConfirmDeletePopup from '../ConfirmDeletePopup';
import RenamePopup from '../RenamePopup';
import PreviewQuestionsColPopup from './PreviewQuestionsColPopup';
import CreateQuestionsCol, { type CreateQuestionsColInitial } from './CreateQuestionsColPopup';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchStart,
  fetchSuccess,
  fetchFailure,
  selectCollections,
  selectCollectionsLoading,
  selectCollectionsError,
  selectAllCollectionNames,
  setAllNames as setAllNamesAction,
  type QuestionCollection,
} from '../../store/questionCollectionsSlice';

const Questions: React.FC = () => {
  const [query, setQuery] = useState('');
  const dispatch = useDispatch();
  const collections = useSelector(selectCollections);
  const loading = useSelector(selectCollectionsLoading);
  const fetchError = useSelector(selectCollectionsError);
  const allNames = useSelector(selectAllCollectionNames);
  const [opError, setOpError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  // Rely on API-provided size; no per-item count fetching
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  // Removing unused local deleting state to satisfy lint; UI uses optimistic remove
  const [initialCol, setInitialCol] = useState<CreateQuestionsColInitial | null>(null);
  const [renameTarget, setRenameTarget] = useState<{ id: string; name: string } | null>(null);
  const [previewTarget, setPreviewTarget] = useState<{ id: string; name: string; questions: unknown[]; description?: string } | null>(null);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);

  const fetchCollections = useCallback((value?: string) => {
    let active = true;
    dispatch(fetchStart());
    searchQuestionCollections(value)
      .then((res) => {
        if (!active) return;
        const data = res.data as {
          collection?: Array<{ _id?: string; id?: string; name?: string; description?: string; size?: number }>;
        };
        const list = Array.isArray(data.collection) ? data.collection : [];
        const normalized: QuestionCollection[] = list
          .map((c) => ({
            _id: (c?._id || c?.id || '') as string,
            name: c?.name || '',
            description: c?.description,
            size: typeof c?.size === 'number' ? c.size : undefined,
          }))
          .filter((c) => typeof c._id === 'string' && c._id.length > 0);
        dispatch(fetchSuccess(normalized));
      })
      .catch((e) => {
        if (!active) return;
        console.error(e);
        dispatch(fetchFailure('שגיאה בטעינת אסופות השאלות'));
      });
    return () => {
      active = false;
    };
  }, [dispatch]);

  // Fetch all names (unfiltered) for create modal validation
  const fetchAllNames = useCallback(() => {
    let active = true;
    searchQuestionCollections(undefined)
      .then((res) => {
        if (!active) return;
        const data = res.data as { collection?: Array<{ name?: string }> };
        const list = Array.isArray(data.collection) ? data.collection : [];
        const names = list.map((c) => (c.name || '').trim()).filter(Boolean) as string[];
        dispatch(setAllNamesAction(names));
      })
      .catch(() => {
        // ignore name prefetch errors; backend will still validate
      });
    return () => {
      active = false;
    };
  }, [dispatch]);

  useEffect(() => {
    const cancel = fetchCollections(query);
    return cancel;
  }, [query, fetchCollections]);

  // No per-item count fetch effect; rely solely on API size

  // When opening the create modal, prefetch all names for uniqueness check
  useEffect(() => {
    if (isCreateOpen) {
      const cancel = fetchAllNames();
      return cancel;
    }
  }, [isCreateOpen, fetchAllNames]);

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
      ) : fetchError || opError ? (
        <div style={{ marginTop: '16px', color: '#b00020' }}>{opError || fetchError}</div>
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
                      id: col._id,
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
                      onClick={() => setConfirmDelete({ id: col._id, name: col.name })}
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
                            id: col._id,
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

      {confirmDelete && (
        <ConfirmDeletePopup
          message={`למחוק '${confirmDelete.name}'?`}
          onClose={() => setConfirmDelete(null)}
          onConfirm={async () => {
            if (!confirmDelete?.id) return;
            try {
              await deleteQuestionCollection(confirmDelete.id);
              const next = collections.filter((c) => c._id !== confirmDelete.id);
              dispatch(fetchSuccess(next));
              setConfirmDelete(null);
            } catch (e) {
              console.error(e);
              setOpError('מחיקה נכשלה');
            } finally {
              // no-op
            }
          }}
        />
      )}

      {renameTarget && (
        <RenamePopup
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
              const next = collections.map((c) => (c._id === renameTarget.id ? { ...c, name: newName } : c));
              dispatch(fetchSuccess(next));
              const withoutOld = allNames.filter((n) => n.trim() !== renameTarget.name.trim());
              dispatch(setAllNamesAction([...withoutOld, newName]));
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
