import React, { useState } from 'react';
import GenericListItem from './GenericListItem';
import TrashIcon from '../assets/icons/TrashIcon';
import '../assets/icons/Icon.css';
import Tooltip from './Tooltip';

interface TemplateListItemProps {
  content: string;
  onClick: () => void;
  onDeleteClick: () => void;
}

const TemplateListItem: React.FC<TemplateListItemProps> = ({
  content,
  onClick,
  onDeleteClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const actions = (
    <div 
      className="icon-wrapper" 
      onClick={(e) => { e.stopPropagation(); onDeleteClick(); }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <TrashIcon />
      <Tooltip text="מחיקה" visible={isHovered} />
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
    />
  );
};

export default TemplateListItem;
