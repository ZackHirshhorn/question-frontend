
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

const CreateQuestionnaire: React.FC<CreateQuestionnaireProps> = ({ onClose, onQuestionnaireCreated }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch templates when the component mounts
    getTemplates()
      .then(response => {
        const templatesData = Array.isArray(response.data) ? response.data : response.data.templates;
        setTemplates(templatesData);
        if (templatesData.length > 0) {
          setSelectedTemplate(templatesData[0].id);
        }
      })
      .catch(err => {
        console.error('Failed to fetch templates:', err);
        setError('טעינת התבניות נכשלה. אנא נסה שוב מאוחר יותר.');
      });
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedTemplate) {
      setError('אנא בחר תבנית.');
      return;
    }
    setLoading(true);
    setError(null);

    createQuestionnaire({ templateId: selectedTemplate })
      .then(() => {
        setLoading(false);
        onQuestionnaireCreated();
        onClose();
      })
      .catch(err => {
        setLoading(false);
        setError('יצירת השאלון נכשלה. אנא נסה שוב.');
        console.error(err);
      });
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>יצירת שאלון חדש</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="template">תבנית</label>
            <select
              id="template"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              required
            >
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="form-actions">
            <button type="button" onClick={onClose} disabled={loading}>
              ביטול
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'בתהליך יצירה...' : 'יצירה'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuestionnaire;
