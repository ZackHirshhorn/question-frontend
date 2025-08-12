import React, { useEffect, useState } from 'react';
import { deleteTemplate, getUserTemplates } from '../api/template';
import CreateTemplate from './CreateTemplate';
import GenericList from './GenericList';
import './CreateTemplate.css';
import Loading from './Loading';
import TemplateListItem from './TemplateListItem';
import { useSorter } from './Sorter';

interface Template {
  id: string;
  name: string;
}

interface TemplatesProps {
  onTemplateClick: (templateId: string) => void;
}

import './Button.css';
import PlusWhiteIcon from '../assets/icons/PlusWhiteIcon';

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

  const { sortedItems, Controls } = useSorter(
    templates,
    {
      'לפי האלפבית': (a, b) => a.name.localeCompare(b.name),
      'לפי תאריך': () => 0,
    },
    'לפי האלפבית',
  );

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <button
          className="button-primary"
          onClick={handleAddNew}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            borderRadius: '4px',
            border: '1px solid #0957D0',
            fontSize: '16px',
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
            שאלון חדש
          </span>
          <PlusWhiteIcon />
        </button>
        <Controls />
      </div>
      <GenericList
        items={sortedItems}
        keyExtractor={(item) => item.id}
        renderItem={(item) => (
          <TemplateListItem
            content={item.name}
            onClick={() => onTemplateClick(item.id)}
            onDeleteClick={() => handleDelete(item.id)}
          />
        )}
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
