import React, { useEffect, useState } from 'react';
import SearchIcon from '../assets/icons/SearchIcon';
import PlusWhiteIcon from '../assets/icons/PlusWhiteIcon';
import './Button.css';
import { searchQuestionCollections } from '../api/questions';
import CreateQuestionsCol from './CreateQuestionsCol';

type QuestionCollection = { _id: string; name: string };

const Questions: React.FC = () => {
  const [query, setQuery] = useState('');
  const [collections, setCollections] = useState<QuestionCollection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchCollections = () => {
    let active = true;
    setLoading(true);
    setError(null);
    searchQuestionCollections()
      .then((res) => {
        if (!active) return;
        const data = res.data as { collection?: QuestionCollection[] };
        setCollections(Array.isArray(data.collection) ? data.collection : []);
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

  useEffect(() => {
    const cancel = fetchCollections();
    return cancel;
  }, []);

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
          onClick={() => setIsCreateOpen(true)}
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
                  minHeight: '80px',
                  padding: '12px',
                  boxShadow: '0 1px 1px #b3b3b3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
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
                  {col.name}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {isCreateOpen && (
        <CreateQuestionsCol
          onClose={() => setIsCreateOpen(false)}
          onCreated={() => {
            setIsCreateOpen(false);
            fetchCollections();
          }}
          existingNames={collections.map((c) => c.name.trim())}
        />
      )}
    </div>
  );
};

export default Questions;
