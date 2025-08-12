// src/components/SubCategoryList.tsx
import React, { useState } from 'react';
import GenericList from './GenericList';
import SubCategoryListItem from './SubCategoryListItem';
import TopicList from './TopicList';
import type { UISubCategory } from '../types/template';

type SubCategory = UISubCategory;

interface SubCategoryListProps {
  subCategories: SubCategory[];
  onRenameClick: (subCategoryName: string) => void;
  onDeleteClick: (subCategory: SubCategory) => void;
  onPlusQuestionClick: (subCategoryName: string) => void;
  onNewClick: (subCategoryName: string) => void;
  onTopicRenameClick?: (topicName: string, subCategoryName: string) => void;
  onTopicDeleteClick?: (topicName: string, subCategoryName: string) => void;
  onTopicPlusQuestionClick?: (topicName: string, subCategoryName: string) => void;
}

const SubCategoryList: React.FC<SubCategoryListProps> = ({
  subCategories,
  onRenameClick,
  onDeleteClick,
  onPlusQuestionClick,
  onNewClick,
  onTopicRenameClick,
  onTopicDeleteClick,
  onTopicPlusQuestionClick,
}) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };
  if (!subCategories || subCategories.length === 0) {
    return null;
  }

  return (
    <div style={{ marginLeft: '40px', paddingLeft: '10px', marginTop: '10px' }}>
      <GenericList
        items={subCategories}
        keyExtractor={(item) => item.id}
        renderItem={(item) => (
          <div>
            <SubCategoryListItem
              content={item.name}
              isExpanded={!!expanded[item.id]}
              onClick={() => toggle(item.id)}
              onRenameClick={() => onRenameClick(item.name)}
              onDeleteClick={() => { setExpanded(prev => ({ ...prev, [item.id]: false })); onDeleteClick(item); }}
              onPlusQuestionClick={() => onPlusQuestionClick(item.name)}
              onNewClick={() => onNewClick(item.name)}
            />
            {!!expanded[item.id] && (
              <TopicList
                topics={item.topics}
                onRenameClick={(topicName) => onTopicRenameClick && onTopicRenameClick(topicName, item.name)}
                onDeleteClick={(topicName) => onTopicDeleteClick && onTopicDeleteClick(topicName, item.name)}
                onPlusQuestionClick={(topicName) => onTopicPlusQuestionClick && onTopicPlusQuestionClick(topicName, item.name)}
              />
            )}
          </div>
        )}
      />
    </div>
  );
};

export default SubCategoryList;
