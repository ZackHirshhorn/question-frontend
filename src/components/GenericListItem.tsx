import React from 'react';

interface GenericListItemProps {
  /** The content to display inside the list item. */
  content: string;
}

const GenericListItem: React.FC<GenericListItemProps> = ({ content }) => {
  const itemStyle: React.CSSProperties = {
    padding: '15px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    marginBottom: '10px',
    backgroundColor: '#f9f9f9',
    textAlign: 'start', // Aligns to the right in RTL, left in LTR
  };

  return (
    <div style={itemStyle}>
      {content}
    </div>
  );
};

export default GenericListItem;