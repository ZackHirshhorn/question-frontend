import React from 'react';
import GenericListItem from './GenericListItem';
import TrashIcon from '../../assets/icons/TrashIcon';
import EditIcon from '../../assets/icons/EditIcon';
import LinkIcon from '../../assets/icons/LinkIcon';
import '../../assets/icons/Icon.css';
import Tooltip from '../Tooltip';

interface TemplateListItemProps {
  content: string;
  onClick: () => void;
  onDeleteClick: () => void;
  onRenameClick?: () => void;
  onLinkClick?: () => void;
}

const IconWrapper: React.FC<{ tooltipText: string; onClick?: () => void; children: React.ReactNode }>
  = ({ tooltipText, onClick, children }) => {
    const [isHovered, setIsHovered] = React.useState(false);
    return (
      <button
        type="button"
        className="icon-wrapper"
        aria-label={tooltipText}
        onClick={(e) => { e.stopPropagation(); if (onClick) onClick(); }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
      >
        {children}
        <Tooltip text={tooltipText} visible={isHovered} />
      </button>
    );
  };

const TemplateListItem: React.FC<TemplateListItemProps> = ({
  content,
  onClick,
  onDeleteClick,
  onRenameClick,
  onLinkClick,
}) => {
  const actions = (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      <IconWrapper tooltipText="קישור" onClick={onLinkClick}>
        <LinkIcon />
      </IconWrapper>
      <IconWrapper tooltipText="מחיקה" onClick={onDeleteClick}>
        <div data-testid="delete-icon">
        <TrashIcon />
        </div>
      </IconWrapper>
      <IconWrapper tooltipText="שינוי שם" onClick={onRenameClick}>
        <div data-testid="edit-icon">
        <EditIcon />
        </div>
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
    />
  );
};

export default TemplateListItem;
