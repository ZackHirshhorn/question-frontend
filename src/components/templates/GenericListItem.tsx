import React, { useState } from 'react';

interface GenericListItemProps {
  /** The content to display inside the list item. */
  content: React.ReactNode;
  /** Optional actions to display on hover. */
  actions?: React.ReactNode;
  /** Optional icon to display on the left, independent of hover. */
  leftIcon?: React.ReactNode;
  /** Optional click handler for the entire item. */
  onClick?: () => void;
  /** Optional background color for the item. */
  backgroundColor?: string;
  /** Optional background color for the item on hover. */
  hoverBackgroundColor?: string;
}

const GenericListItem: React.FC<GenericListItemProps> = ({
  content,
  actions,
  leftIcon,
  onClick,
  backgroundColor = '#f6f6f9',
  hoverBackgroundColor = '#97c9fc',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const itemStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 15px',
    minHeight: '50px',
    borderRadius: '4px',
    marginBottom: '10px',
    backgroundColor: isHovered ? hoverBackgroundColor : backgroundColor,
    textAlign: 'start',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'background-color 0.3s ease',
    boxShadow: '0 1px 1px #b3b3b3',
    position: 'relative', // Needed for absolute positioning of leftIcon
  };

  const leftIconContainerStyle: React.CSSProperties = {
    position: 'absolute',
    left: '15px', // Aligns with padding
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    alignItems: 'center',
  };

  const contentStyle: React.CSSProperties = {
    flexGrow: 1,
  };

  return (
    <div
      style={itemStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {leftIcon && <div style={leftIconContainerStyle}>{leftIcon}</div>}
      <div style={contentStyle}>{content}</div>
      {isHovered && actions}
    </div>
  );
};

export default GenericListItem;
