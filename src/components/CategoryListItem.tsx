import React from 'react';
import GenericListItem from './GenericListItem';
import EditIcon from '../assets/icons/EditIcon';
import TrashIcon from '../assets/icons/TrashIcon';
import PlusWithQuestionIcon from '../assets/icons/PlusWithQuestionIcon';
import NewIcon from '../assets/icons/NewIcon';
import TriangleIcon from '../assets/icons/TriangleIcon';
import '../assets/icons/Icon.css';
import Tooltip from './Tooltip';

interface CategoryListItemProps {
  content: string;
  isExpanded: boolean;
  onClick: () => void;
  onRenameClick: () => void;
  onDeleteClick: () => void;
  onPlusQuestionClick: () => void;
  onNewClick: () => void;
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

const CategoryListItem: React.FC<CategoryListItemProps> = ({
  content,
  isExpanded,
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
    transition: 'margin-left 0.3s ease-in-out',
    marginLeft: isExpanded ? '24px' : '0px', // Creates space for the triangle
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
      <IconWrapper tooltipText="הוספת תת-קטגוריה" onClick={onNewClick}>
        <NewIcon />
      </IconWrapper>
    </div>
  );

  return (
    <GenericListItem
      content={
        <span
          style={{
            fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
            fontWeight: 500,
            fontSize: '20px',
            lineHeight: '100%',
            letterSpacing: '0',
            textAlign: 'right',
          }}
        >
          {content}
        </span>
      }
      onClick={onClick}
      actions={actions}
      leftIcon={<TriangleIcon isRotated={isExpanded} isVisible={isExpanded} />}
      backgroundColor="#d3e9fe"
      hoverBackgroundColor="#97c9fc"
    />
  );
};

export default CategoryListItem;

