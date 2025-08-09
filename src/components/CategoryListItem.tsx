import React from 'react';
import GenericListItem from './GenericListItem';
import EditIcon from '../assets/icons/EditIcon';
import TrashIcon from '../assets/icons/TrashIcon';
import PlusIcon from '../assets/icons/PlusIcon';
import PlusWithQuestionIcon from '../assets/icons/PlusWithQuestionIcon';
import NewIcon from '../assets/icons/NewIcon';

interface CategoryListItemProps {
  content: string;
  onClick: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onPlusClick: () => void;
  onSimplePlusClick: () => void;
  onNewClick: () => void;
}

const CategoryListItem: React.FC<CategoryListItemProps> = ({
  content,
  onClick,
  onEditClick,
  onDeleteClick,
  onPlusClick,
  onSimplePlusClick,
  onNewClick,
}) => {
  const iconContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    position: 'relative',
    top: '2px',
  };

  const iconStyle: React.CSSProperties = {
    cursor: 'pointer',
  };

  const actions = (
    <div style={iconContainerStyle}>
      <span style={iconStyle} onClick={(e) => { e.stopPropagation(); onPlusClick(); }}><PlusWithQuestionIcon /></span>
      <span style={iconStyle} onClick={(e) => { e.stopPropagation(); onSimplePlusClick(); }}><PlusIcon /></span>
      <span style={iconStyle} onClick={(e) => { e.stopPropagation(); onDeleteClick(); }}><TrashIcon /></span>
      <span style={iconStyle} onClick={(e) => { e.stopPropagation(); onEditClick(); }}><EditIcon /></span>
      <span style={iconStyle} onClick={(e) => { e.stopPropagation(); onNewClick(); }}><NewIcon /></span>
    </div>
  );

  return (
    <GenericListItem
      content={content}
      onClick={onClick}
      actions={actions}
    />
  );
};

export default CategoryListItem;
