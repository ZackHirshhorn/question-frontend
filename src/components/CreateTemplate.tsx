import React, { useState, useEffect } from 'react';
import { createTemplate } from '../api/template';
import CheckIcon from '../assets/icons/CheckIcon';
import AnimatedErrorMessage from './AnimatedErrorMessage';
import TextInput from './TextInput';

interface CreateTemplateProps {
  onClose: () => void;
  onTemplateCreated: () => void;
  existingTemplateNames: string[];
}

import './Button.css';

const CreateTemplate: React.FC<CreateTemplateProps> = ({ onClose, onTemplateCreated, existingTemplateNames }) => {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [categories, setCategories] = useState([{ name: '' }]);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (existingTemplateNames.includes(name.trim())) {
      setNameError('שם תבנית זה כבר קיים.');
    } else {
      setNameError('');
    }
  }, [name, existingTemplateNames]);

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
    if (!name.trim()) {
      setSubmitError('אנא הכנס שם תבנית.');
      return;
    }
    if (nameError) {
      return;
    }

    const categoryNames = categories.map(c => c.name.trim()).filter(c => c);
    const uniqueCategoryNames = new Set(categoryNames);
    if (uniqueCategoryNames.size !== categoryNames.length) {
      setSubmitError('לא ניתן להוסיף קטגוריות עם אותו שם.');
      return;
    }

    setLoading(true);
    setSubmitError(null);

    const templatePayload = {
      template: {
        name: name.trim(),
        categories: categoryNames.map(catName => ({ name: catName, questions: [] })),
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
        setSubmitError('יצירת התבנית נכשלה. אנא נסה שוב.');
        console.error(err);
      });
  };

  const isSubmitDisabled = loading || !!nameError || !name.trim();

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>יצירת שאלון חדש</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">שם השאלון</label>
            <TextInput
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              showCheck={name.trim() && !nameError}
            />
            <AnimatedErrorMessage message={nameError} />
          </div>

          <div className="form-group">
            <label>קטגוריות</label>
            {categories.map((category, index) => (
              <div key={index} className="category-row" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ flexGrow: 1, marginRight: '10px' }}>
                  <TextInput
                    type="text"
                    value={category.name}
                    onChange={(e) => handleCategoryChange(index, e.target.value)}
                  />
                </div>
                <button type="button" className="button-secondary" onClick={() => removeCategory(index)}>
                  הסר
                </button>
              </div>
            ))}
            <button type="button" className="button-secondary" onClick={addCategory}>
              הוסף קטגוריה
            </button>
          </div>

          {submitError && <div className="error-message show">{submitError}</div>}
          <div className="form-actions">
            <button type="button" className="button-secondary" onClick={onClose} disabled={loading}>
              ביטול
            </button>
            <button type="submit" className="button-primary" disabled={isSubmitDisabled}>
              {loading ? 'בתהליך יצירה...' : 'יצירה'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTemplate;
