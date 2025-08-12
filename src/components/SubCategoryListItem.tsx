// src/components/SubCategoryListItem.tsx
import React from 'react';
import GenericListItem from './GenericListItem';
import EditIcon from '../assets/icons/EditIcon';
import TrashIcon from '../assets/icons/TrashIcon';
import PlusWithQuestionIcon from '../assets/icons/PlusWithQuestionIcon';
import NewIcon from '../assets/icons/NewIcon';
import '../assets/icons/Icon.css';
import Tooltip from './Tooltip';

interface SubCategoryListItemProps {
  content: string;
  onClick: () => void;
  onRenameClick: () => void;
  onDeleteClick: () => void;
  onPlusQuestionClick: () => void;
  onNewClick: () => void; // Assuming this will be for adding topics later
}

const IconWrapper = ({ tooltipText, onClick, children }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  return (
    <div
      className="icon-wrapper"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      <Tooltip text={tooltipText} visible={isHovered} />
    </div>
  );
};

const SubCategoryListItem: React.FC<SubCategoryListItemProps> = ({
  content,
  onClick,
  onRenameClick,
  onDeleteClick,
  onPlusQuestionClick,
  onNewClick,
}) => {
  const iconContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  };

  const actions = (
    <div style={iconContainerStyle}>
      <IconWrapper tooltipText="הוספת שאלה" onClick={onPlusQuestionClick}>
        <PlusWithQuestionIcon />
      </IconWrapper>
      <IconWrapper tooltipText="מחיקה" onClick={onDeleteClick}>
        <TrashIcon />
      </IconWrapper>
      <IconWrapper tooltipText="שינוי שם" onClick={onRenameClick}>
        <EditIcon />
      </IconWrapper>
      <IconWrapper tooltipText="הוספת נושא" onClick={onNewClick}>
        <NewIcon />
      </IconWrapper>
    </div>
  );

  return (
    <GenericListItem
      content={content}
      onClick={onClick}
      actions={actions}
      backgroundColor="#dffeee"
      hoverBackgroundColor="#b8f4d4"
    />
  );
};

export default SubCategoryListItem;
