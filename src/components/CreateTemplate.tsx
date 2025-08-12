import React, { useState } from 'react';
import { createTemplate } from '../api/template';

interface CreateTemplateProps {
  onClose: () => void;
  onTemplateCreated: () => void;
}

import './Button.css';

const CreateTemplate: React.FC<CreateTemplateProps> = ({ onClose, onTemplateCreated }) => {
  const [name, setName] = useState('');
  const [categories, setCategories] = useState([{ name: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCategoryChange = (index: number, value: string) => {
    const newCategories = [...categories];
    newCategories[index].name = value;
    setCategories(newCategories);
  };

  const addCategory = () => {
    setCategories([...categories, { name: '' }]);
  };

  const removeCategory = (index: number) => {
    const newCategories = categories.filter((_, i) => i !== index);
    setCategories(newCategories);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name) {
      setError('אנא הכנס שם תבנית.');
      return;
    }
    if (categories.some(c => !c.name)) {
      setError('אנא מלא את כל שמות הקטגוריות.');
      return;
    }
    setLoading(true);
    setError(null);

    const templatePayload = {
      template: {
        name,
        categories: categories.map(c => ({ ...c, questions: [] })),
      }
    };

    createTemplate(templatePayload)
      .then(() => {
        setLoading(false);
        onTemplateCreated();
        onClose();
      })
      .catch(err => {
        setLoading(false);
        setError('יצירת התבנית נכשלה. אנא נסה שוב.');
        console.error(err);
      });
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

          <div className="form-group">
            <label>קטגוריות</label>
            {categories.map((category, index) => (
              <div key={index} className="category-row">
                <input
                  type="text"
                  value={category.name}
                  onChange={(e) => handleCategoryChange(index, e.target.value)}
                  required
                />
                <button type="button" className="button-secondary" onClick={() => removeCategory(index)}>
                  הסר
                </button>
              </div>
            ))}
            <button type="button" className="button-secondary" onClick={addCategory}>
              הוסף קטגוריה
            </button>
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

export default CreateTemplate;
