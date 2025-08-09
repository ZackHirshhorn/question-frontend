import React from 'react';
import GenericListItem from './GenericListItem';
import EditIcon from '../assets/icons/EditIcon';
import TrashIcon from '../assets/icons/TrashIcon';
import PlusIcon from '../assets/icons/PlusIcon';

interface TemplateListItemProps {
  content: string;
  onClick: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onPlusClick: () => void;
}

const TemplateListItem: React.FC<TemplateListItemProps> = ({
  content,
  onClick,
  onEditClick,
  onDeleteClick,
  onPlusClick,
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
      <span style={iconStyle} onClick={(e) => { e.stopPropagation(); onPlusClick(); }}><PlusIcon /></span>
      <span style={iconStyle} onClick={(e) => { e.stopPropagation(); onDeleteClick(); }}><TrashIcon /></span>
      <span style={iconStyle} onClick={(e) => { e.stopPropagation(); onEditClick(); }}><EditIcon /></span>
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

export default TemplateListItem;
