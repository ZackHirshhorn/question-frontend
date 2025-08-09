import React, { useState } from 'react';

interface GenericListItemProps {
  /** The content to display inside the list item. */
  content: React.ReactNode;
  /** Optional actions to display on hover. */
  actions?: React.ReactNode;
  /** Optional click handler for the entire item. */
  onClick?: () => void;
}

const GenericListItem: React.FC<GenericListItemProps> = ({ content, actions, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const itemStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 15px',
    minHeight: '50px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    marginBottom: '10px',
    backgroundColor: isHovered ? '#97c9fc' : '#f6f6f9',
    textAlign: 'start',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
    boxShadow: isHovered ? '0 8px 16px rgba(0, 0, 0, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
  };

  return (
    <div
      style={itemStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div>{content}</div>
      {isHovered && actions}
    </div>
  );
};

export default GenericListItem;