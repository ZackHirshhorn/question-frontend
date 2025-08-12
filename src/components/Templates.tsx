import React, { useEffect, useState } from 'react';
import { deleteTemplate, getUserTemplates } from '../api/template';
import CreateTemplate from './CreateTemplate';
import GenericList from './GenericList';
import './CreateTemplate.css';
import Loading from './Loading';
import TemplateListItem from './TemplateListItem';

interface Template {
  id: string;
  name: string;
}

interface TemplatesProps {
  onTemplateClick: (templateId: string) => void;
}

import './Button.css';

const Templates: React.FC<TemplatesProps> = ({ onTemplateClick }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isPopupOpen, setPopupOpen] = useState(false);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await getUserTemplates();
      setTemplates(response.data.templates);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      setError('Failed to fetch templates. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDelete = async (templateId: string) => {
    try {
      await deleteTemplate(templateId);
      setTemplates((prevTemplates) =>
        prevTemplates.filter((template) => template.id !== templateId),
      );
    } catch (err) {
      console.error('Failed to delete template:', err);
      setError('Failed to delete template. Please try again later.');
    }
  };

  const handleAddNew = () => {
    setPopupOpen(true);
  };

  const handleClosePopup = () => {
    setPopupOpen(false);
  };

  const handleTemplateCreated = () => {
    // After creating a questionnaire, we might want to switch to the responses tab
    // or show a success message. For now, we just close the popup.
    setPopupOpen(false);
    fetchTemplates();
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <>
      <div style={{ marginBottom: '1rem' }}>
        <button className="button-primary" onClick={handleAddNew}>
          + שאלון חדש
        </button>
      </div>
      <GenericList
        items={templates}
        keyExtractor={(item) => item.id}
        renderItem={(item) => {
          return (
            <TemplateListItem
              content={item.name}
              onClick={() => onTemplateClick(item.id)}
              onDeleteClick={() => handleDelete(item.id)}
            />
          );
        }}
      />
      {isPopupOpen && (
        <CreateTemplate
          onClose={handleClosePopup}
          onTemplateCreated={handleTemplateCreated}
          existingTemplateNames={templates.map(t => t.name)}
        />
      )}
    </>
  );
};

export default Templates;