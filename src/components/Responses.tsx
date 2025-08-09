import React, { useEffect, useState } from 'react';
import { getQuestionnaires, getQuestionnaire } from '../api/questionnaire';
import { canCreateQuestionnaires } from '../api/template';
import GenericList from './GenericList';
import GenericListItem from './GenericListItem';
import AddItemListItem from './AddItemListItem';
import CreateQuestionnaire from './CreateQuestionnaire';
import './CreateQuestionnaire.css';

// This interface should match the structure of your questionnaire data
interface Questionnaire {
  id: string;
  template: {
    name: string;
  };
}

// A special object for the "Add New" item.
const ADD_NEW_ID = 'add-new-questionnaire';
const addNewPlaceholder: Questionnaire = {
  id: ADD_NEW_ID,
  template: {
    name: 'שאלון חדש',
  },
};

const Responses: React.FC = () => {
  const [items, setItems] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [canCreate, setCanCreate] = useState(false);

  const checkPermissions = async () => {
    try {
      await canCreateQuestionnaires();
      setCanCreate(true);
    } catch (error) {
      setCanCreate(false);
    }
  };

  const fetchQuestionnaires = async () => {
    setLoading(true);
    try {
      const response = await getQuestionnaires();
      const questionnaireInfo: { id: string }[] = response.data;
      const detailedQuestionnaires = await Promise.all(
        questionnaireInfo.map(async (info: { id: string }) => {
          // at the time of adding this code, this is the only
          // way to get the template name, since the questionnaire
          // endpoint returns just questionnaire ids.
          const details = await getQuestionnaire(info.id);
          return details.data;
        })
      );
      setItems(detailedQuestionnaires);
    } catch (err) {
      console.error('Failed to fetch questionnaires:', err);
      setError('Failed to fetch questionnaires. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkPermissions();
    fetchQuestionnaires();
  }, []);

  const handleAddNew = () => {
    setPopupOpen(true);
  };

  const handleClosePopup = () => {
    setPopupOpen(false);
  };

  const handleQuestionnaireCreated = () => {
    fetchQuestionnaires();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', fontSize: '24px', padding: '50px' }}>
        בטעינה...
      </div>
    );
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  const displayItems = canCreate ? [...items, addNewPlaceholder] : items;

  return (
    <>
      <GenericList
        items={displayItems}
        keyExtractor={(item) => item.id}
        renderItem={(item) => {
          if (item.id === ADD_NEW_ID) {
            return <AddItemListItem text={item.template.name} onClick={handleAddNew} />;
          }
          return (
    <GenericListItem
        content={item.template.name}
        onEditClick={() => console.log('Edit clicked for', item.template.name)}
        onDeleteClick={() => console.log('Delete clicked for', item.template.name)}
        onPlusClick={() => console.log('Plus clicked for', item.template.name)}
    />
);
        }}
      />
      {isPopupOpen && (
        <CreateQuestionnaire
          onClose={handleClosePopup}
          onQuestionnaireCreated={handleQuestionnaireCreated}
        />
      )}
    </>
  );
};

export default Responses;