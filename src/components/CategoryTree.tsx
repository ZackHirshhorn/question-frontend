import React from 'react';
import GenericList from './GenericList';
import CategoryListItem from './CategoryListItem';
import SubCategoryList from './SubCategoryList';
import type { UITopic as Topic, UISubCategory as SubCategory, UICategory as Category } from '../types/template';

interface CategoryTreeProps {
  categories: Category[];
  expandedCategoryId: string | null;
  onToggleCategory: (id: string) => void;
  onCategoryRenameClick: (category: Category) => void;
  onCategoryDeleteClick: (category: Category) => void;
  onNewSubCategoryClick: (category: Category) => void;
  onSubCategoryRenameClick: (subCategoryName: string, category: Category) => void;
  onSubCategoryDeleteClick: (subCategory: SubCategory, category: Category) => void;
  onNewTopicClick: (subCategoryName: string, category: Category) => void;
  onTopicRenameClick: (topicName: string, category: Category, subCategoryName: string) => void;
  onTopicDeleteClick: (topicName: string, category: Category, subCategoryName: string) => void;
  onTopicPlusQuestionClick: (topicName: string, category: Category, subCategoryName: string) => void;
}

const CategoryTree: React.FC<CategoryTreeProps> = ({
  categories,
  expandedCategoryId,
  onToggleCategory,
  onCategoryRenameClick,
  onCategoryDeleteClick,
  onNewSubCategoryClick,
  onSubCategoryRenameClick,
  onSubCategoryDeleteClick,
  onNewTopicClick,
  onTopicRenameClick,
  onTopicDeleteClick,
  onTopicPlusQuestionClick,
}) => {
  return (
    <GenericList
      items={categories}
      keyExtractor={(item) => item.id}
      renderItem={(item) => (
        <div>
          <CategoryListItem
            content={item.name}
            isExpanded={expandedCategoryId === item.id}
            onClick={() => onToggleCategory(item.id)}
            onRenameClick={() => onCategoryRenameClick(item)}
            onDeleteClick={() => onCategoryDeleteClick(item)}
            onPlusQuestionClick={() => console.log('Plus Question clicked for', item.name)}
            onNewClick={() => onNewSubCategoryClick(item)}
          />
          {expandedCategoryId === item.id && (
            <SubCategoryList
              subCategories={item.subCategories}
              onRenameClick={(subCategory) => onSubCategoryRenameClick(subCategory, item)}
              onDeleteClick={(subCategory) => onSubCategoryDeleteClick(subCategory as any, item)}
              onPlusQuestionClick={(subCategoryName) => console.log('Plus Question clicked for subcategory:', subCategoryName)}
              onNewClick={(subCategoryName) => onNewTopicClick(subCategoryName, item)}
              onTopicRenameClick={(topicName, subCatName) => onTopicRenameClick(topicName, item, subCatName)}
              onTopicDeleteClick={(topicName, subCatName) => onTopicDeleteClick(topicName, item, subCatName)}
              onTopicPlusQuestionClick={(topicName, subCatName) => onTopicPlusQuestionClick(topicName, item, subCatName)}
            />
          )}
        </div>
      )}
    />
  );
};

export default CategoryTree;
