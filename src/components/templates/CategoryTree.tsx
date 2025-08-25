/**
 * Renders the hierarchical category tree with actions for categories, subcategories, and topics.
 *
 * This component is a pure view: it delegates all behavior to callback props
 * supplied by the parent (e.g., TemplateView). It does not own server state.
 */
import React from 'react';
import GenericList from './GenericList';
import CategoryListItem from './CategoryListItem';
import SubCategoryList from './SubCategoryList';
import type { UISubCategory as SubCategory, UICategory as Category } from '../../types/template';

/**
 * Props for CategoryTree
 * - categories: list of categories to render (already sorted by caller if needed)
 * - expandedCategoryId: which category's subcategories are currently expanded
 * - onToggleCategory: expand/collapse category node
 * - onCategoryRenameClick/onCategoryDeleteClick: category-level actions
 * - onNewSubCategoryClick: open create flow for subcategory under a category
 * - onSubCategoryRenameClick/onSubCategoryDeleteClick: subcategory-level actions
 * - onNewTopicClick: open create flow for topic under a subcategory
 * - onTopicRenameClick/onTopicDeleteClick: topic-level actions
 * - onCategoryPlusQuestionClick/onSubCategoryPlusQuestionClick/onTopicPlusQuestionClick:
 *   fired when the user clicks the "הוספת שאלה" icon at the respective level
 */
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
  onCategoryPlusQuestionClick: (category: Category) => void;
  onSubCategoryPlusQuestionClick: (subCategoryName: string, category: Category) => void;
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
  onCategoryPlusQuestionClick,
  onSubCategoryPlusQuestionClick,
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
            onPlusQuestionClick={() => onCategoryPlusQuestionClick(item)}
            onNewClick={() => onNewSubCategoryClick(item)}
          />
          {expandedCategoryId === item.id && (
            <SubCategoryList
              subCategories={item.subCategories}
              onRenameClick={(subCategory) => onSubCategoryRenameClick(subCategory, item)}
              onDeleteClick={(subCategory) => onSubCategoryDeleteClick(subCategory, item)}
              onPlusQuestionClick={(subCategoryName) => onSubCategoryPlusQuestionClick(subCategoryName, item)}
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
