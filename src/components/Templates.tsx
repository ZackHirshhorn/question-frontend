import React, { useEffect, useState } from 'react';
import { getUserTemplates } from '../api/template';
import GenericList from './GenericList';
import Loading from './Loading';
import TemplateListItem from './TemplateListItem';
// import AddItemListItem from './AddItemListItem';
// import CreateQuestionnaire from './CreateQuestionnaire';
// import './CreateQuestionnaire.css';

interface Template {
  id: string;
  name: string;
}

// const ADD_NEW_ID = 'add-new-questionnaire';
// const addNewPlaceholder: Template = {
//   _id: ADD_NEW_ID,
//   name: 'צור שאלון חדש',
// };

interface TemplatesProps {
  onTemplateClick: (templateId: string) => void;
}

const Templates: React.FC<TemplatesProps> = ({ onTemplateClick }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // const [isPopupOpen, setPopupOpen] = useState(false);
  // const [canCreate, setCanCreate] = useState(false);

  // const checkPermissions = async () => {
  //   try {
  //     await canCreateQuestionnaires();
  //     setCanCreate(true);
  //   } catch (error) {
  //     setCanCreate(false);
  //   }
  // };

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
    // checkPermissions();
    fetchTemplates();
  }, []);

  // const handleAddNew = () => {
  //   setPopupOpen(true);
  // };

  // const handleClosePopup = () => {
  //   setPopupOpen(false);
  // };

  // const handleQuestionnaireCreated = () => {
  //   // After creating a questionnaire, we might want to switch to the responses tab
  //   // or show a success message. For now, we just close the popup.
  //   setPopupOpen(false);
  // };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  // const displayTemplates = canCreate ? [...templates, addNewPlaceholder] : templates;

  return (
    <>
      <GenericList
        items={templates}
        keyExtractor={(item) => item.id}
        renderItem={(item) => {
          // if (item._id === ADD_NEW_ID) {
          //   return <AddItemListItem text={item.name} onClick={handleAddNew} />;
          // }
          return (
            <TemplateListItem
              content={item.name}
              onClick={() => onTemplateClick(item.id)}
              onEditClick={() => console.log('Edit clicked for', item.name)}
              onDeleteClick={() => console.log('Delete clicked for', item.name)}
              onPlusClick={() => console.log('Plus clicked for', item.name)}
            />
          );
        }}
      />
      {/* {isPopupOpen && (
        <CreateQuestionnaire
          onClose={handleClosePopup}
          onQuestionnaireCreated={handleQuestionnaireCreated}
        />
      )} */}
    </>
  );
};

export default Templates;