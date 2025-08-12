// src/components/SubCategoryList.tsx
import React from 'react';
import GenericList from './GenericList';
import SubCategoryListItem from './SubCategoryListItem';

interface SubCategory {
  name: string;
  questions: any[];
  topics: any[];
}

interface SubCategoryListProps {
  subCategories: SubCategory[];
  onRenameClick: (subCategoryName: string) => void;
  onDeleteClick: (subCategoryName: string) => void;
  onPlusQuestionClick: (subCategoryName: string) => void;
  onNewClick: (subCategoryName: string) => void;
}

const SubCategoryList: React.FC<SubCategoryListProps> = ({
  subCategories,
  onRenameClick,
  onDeleteClick,
  onPlusQuestionClick,
  onNewClick,
}) => {
  if (!subCategories || subCategories.length === 0) {
    return null;
  }

  return (
    <div style={{ marginLeft: '40px', paddingLeft: '10px', marginTop: '10px' }}>
      <GenericList
        items={subCategories}
        keyExtractor={(item) => item.name}
        renderItem={(item) => (
          <SubCategoryListItem
            content={item.name}
            onClick={() => console.log('SubCategory clicked:', item.name)}
            onRenameClick={() => onRenameClick(item.name)}
            onDeleteClick={() => onDeleteClick(item.name)}
            onPlusQuestionClick={() => onPlusQuestionClick(item.name)}
            onNewClick={() => onNewClick(item.name)}
          />
        )}
      />
    </div>
  );
};

export default SubCategoryList;
