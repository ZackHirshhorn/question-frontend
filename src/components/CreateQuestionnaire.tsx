
import React, { useState, useEffect } from 'react';
import { createQuestionnaire } from '../api/questionnaire';
import { getTemplates } from '../api/template'; // Import getTemplates

interface Template {
  id: string;
  name: string;
}

interface CreateQuestionnaireProps {
  onClose: () => void;
  onQuestionnaireCreated: () => void;
}

import './Button.css';

const CreateQuestionnaire: React.FC<CreateQuestionnaireProps> = ({
  templateId,
  onClose,
  onQuestionnaireCreated,
}) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name) {
      setError('יש להזין שם לשאלון.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await createQuestionnaire({ name, templateId });
      setLoading(false);
      onQuestionnaireCreated();
      onClose();
    } catch (err) {
      setLoading(false);
      setError('יצירת השאלון נכשלה. יש לנסות שוב.');
      console.error(err);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>יצירת שאלון חדש</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">שם השאלון</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="form-actions">
            <button type="button" className="button-secondary" onClick={onClose} disabled={loading}>
              ביטול
            </button>
            <button type="submit" className="button-primary" disabled={loading}>
              {loading ? 'בתהליך יצירה...' : 'יצירה'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuestionnaire;
