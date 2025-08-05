import React, { useEffect, useState } from 'react';
import { getQuestionnaires } from '../api/questionnaire';
import GenericList from './GenericList';
import GenericListItem from './GenericListItem';
import AddItemListItem from './AddItemListItem';

// This interface should match the structure of your questionnaire data
interface Questionnaire {
  id: string;
  userName: string; // Assuming 'userName' is the title you want to display
}

// A special object for the "Add New" item.
// We use a type union to allow our list to contain either a Questionnaire or this special item.
const ADD_NEW_ID = 'add-new-questionnaire';
const addNewPlaceholder: Questionnaire = {
  id: ADD_NEW_ID,
  userName: 'שאלון חדש',
};

const Questionnaires: React.FC = () => {
  const [items, setItems] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getQuestionnaires()
      .then(response => {
        // Always add the placeholder to the end of the fetched list
        setItems([...response.data, addNewPlaceholder]);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch questionnaires:', err);
        setError('Failed to fetch questionnaires. Please try again later.');
        setLoading(false);
      });
  }, []);

  const handleAddNew = () => {
    // Logic to create a new questionnaire will go here.
    console.log('Add new questionnaire clicked!');
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

  return (
    <GenericList
      items={items}
      keyExtractor={(item) => item.id}
      renderItem={(item) => {
        if (item.id === ADD_NEW_ID) {
          return <AddItemListItem text={item.userName} onClick={handleAddNew} />;
        }
        return <GenericListItem content={item.userName} />;
      }}
    />
  );
};

export default Questionnaires;
