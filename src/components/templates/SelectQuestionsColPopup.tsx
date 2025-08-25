/**
 * Popup for selecting a single question collection.
 *
 * Behavior:
 * - Reads available collections from Redux. If none are loaded, fetches them once on mount.
 * - Displays a radio list with name, description, and size (if provided by API).
 * - Calls `onSelect` with the chosen collection when the user confirms.
 *
 * This popup is used from the Template view when the user clicks the
 * "הוספת שאלה" icon on a category, subcategory, or topic.
 */
import React, { useEffect, useReducer, useRef } from 'react';
import '../Button.css';
import { useDispatch, useSelector } from 'react-redux';
import { searchQuestionCollections } from '../../api/questions';
import {
  fetchFailure,
  fetchStart,
  fetchSuccess,
  selectCollections,
  selectCollectionsError,
  selectCollectionsLoading,
  type QuestionCollection,
} from '../../store/questionCollectionsSlice';

/**
 * Props for SelectQuestionsColPopup
 * - title: optional dialog title shown at the top
 * - onClose: called when the dialog is dismissed without selection or after confirming
 * - onSelect: optional callback with the selected collection upon confirmation
 */
interface SelectQuestionsColPopupProps {
  title?: string;
  onClose: () => void;
  onSelect?: (collection: QuestionCollection) => void;
  /** Optional initially selected collection id */
  initialSelectedId?: string;
}

const SelectQuestionsColPopup: React.FC<SelectQuestionsColPopupProps> = ({ title = 'בחירת אסופת שאלות', onClose, onSelect, initialSelectedId }) => {
  const dispatch = useDispatch();
  const collections = useSelector(selectCollections);
  const loading = useSelector(selectCollectionsLoading);
  const error = useSelector(selectCollectionsError);
  const selectedIdRef = useRef<string>(initialSelectedId || '');
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  // Keep the current selection aligned with the provided initial id (e.g. when reopening the popup)
  useEffect(() => {
    selectedIdRef.current = initialSelectedId || '';
    forceUpdate();
  }, [initialSelectedId]);

  // On first mount: load collections if not already available
  useEffect(() => {
    let active = true;
    // Fetch only if list is empty to avoid refetch storms when reopened
    if (!collections || collections.length === 0) {
      dispatch(fetchStart());
      searchQuestionCollections()
        .then((res) => {
          if (!active) return;
          const data = res.data as {
            collection?: Array<{
              _id?: string;
              id?: string;
              name?: string;
              description?: string;
              size?: number;
            }>;
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
    }
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedIdRef.current) return;
    const exists = collections.some((c) => c._id === selectedIdRef.current);
    if (!exists) {
      selectedIdRef.current = '';
      forceUpdate();
    }
  }, [collections]);

  const handleSelect = (id: string) => {
    selectedIdRef.current = id;
    forceUpdate();
  };

  const selected = collections.find((c) => c._id === selectedIdRef.current);

  return (
    <div className="popup-overlay popup-overlay--center">
      <div className="popup-content" style={{ maxWidth: 560 }}>
        <h2 style={{ marginTop: 0, marginBottom: 16 }}>{title}</h2>

        {loading ? (
          <div style={{ marginTop: 12 }}>טוען…</div>
        ) : error ? (
          <div style={{ marginTop: 12, color: '#b00020' }}>{error}</div>
        ) : (
          <div
            role="radiogroup"
            aria-label="רשימת אסופות"
            style={{
              maxHeight: 320,
              overflowY: 'auto',
              border: '1px solid #e0e0e0',
              borderRadius: 8,
              padding: 8,
            }}
          >
            {collections.length === 0 ? (
              <div style={{ padding: 8, color: '#666' }}>אין אסופות שאלות להצגה</div>
            ) : (
              collections.map((col) => (
                <label
                  key={col._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '8px 10px',
                    borderRadius: 6,
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="collection"
                    value={col._id}
                    checked={selectedIdRef.current === col._id}
                    onChange={() => handleSelect(col._id)}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600 }}>{col.name}</span>
                    <span style={{ fontSize: 12, color: '#666' }}>
                      {col.description?.trim() || 'אין תיאור'}
                      {typeof col.size === 'number' ? ` • ${col.size}\u00A0שאלות` : ''}
                    </span>
                  </div>
                </label>
              ))
            )}
          </div>
        )}

        <div className="form-actions" style={{ marginTop: 16 }}>
          <button type="button" className="button-secondary" onClick={onClose}>
            ביטול
          </button>
          <button
            type="button"
            className="button-primary"
            disabled={!selected}
            onClick={() => {
              if (selected && onSelect) onSelect(selected);
              onClose();
            }}
          >
            בחירה
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectQuestionsColPopup;
