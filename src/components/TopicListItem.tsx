import React from 'react';
import GenericListItem from './GenericListItem';
import EditIcon from '../assets/icons/EditIcon';
import TrashIcon from '../assets/icons/TrashIcon';
import PlusWithQuestionIcon from '../assets/icons/PlusWithQuestionIcon';
import '../assets/icons/Icon.css';
import Tooltip from './Tooltip';

interface TopicListItemProps {
  content: string;
  onClick?: () => void;
  onRenameClick?: () => void;
  onDeleteClick?: () => void;
  onPlusQuestionClick?: () => void;
}

const IconWrapper = ({ tooltipText, onClick, children }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  return (
    <div
      className="icon-wrapper"
      onClick={(e) => { e.stopPropagation(); onClick && onClick(); }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      <Tooltip text={tooltipText} visible={isHovered} />
    </div>
  );
};

const TopicListItem: React.FC<TopicListItemProps> = ({
  content,
  onClick,
  onRenameClick,
  onDeleteClick,
  onPlusQuestionClick,
}) => {
  // Background color requested: same for default and hover
  const color = '#FFC9DD';

  const actions = (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      <IconWrapper tooltipText="הוספת שאלה" onClick={onPlusQuestionClick}>
        <PlusWithQuestionIcon />
      </IconWrapper>
      <IconWrapper tooltipText="מחיקה" onClick={onDeleteClick}>
        <TrashIcon />
      </IconWrapper>
      <IconWrapper tooltipText="שינוי שם" onClick={onRenameClick}>
        <EditIcon />
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
      backgroundColor={color}
      hoverBackgroundColor={color}
    />
  );
};

export default TopicListItem;
