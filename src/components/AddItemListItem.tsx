import React from 'react';

interface AddItemListItemProps {
  onClick: () => void;
  text: string;
}

const AddItemListItem: React.FC<AddItemListItemProps> = ({ onClick, text }) => {
  const itemStyle: React.CSSProperties = {
    padding: '15px',
    border: '2px dashed #ccc',
    borderRadius: '8px',
    marginBottom: '10px',
    backgroundColor: '#fafafa',
    textAlign: 'start',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    color: '#555',
  };

  const plusIconStyle: React.CSSProperties = {
    fontSize: '24px',
    marginRight: '10px', // In RTL, this will be margin-inline-start
    fontWeight: 'bold',
  };

  return (
    <div style={itemStyle} onClick={onClick}>
      <span style={plusIconStyle}>+</span>&nbsp;{text}
    </div>
  );
};

export default AddItemListItem;
