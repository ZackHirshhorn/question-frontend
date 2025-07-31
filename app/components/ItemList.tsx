import React from 'react';

interface Item {
  id: string;
  name: string;
}

interface ItemListProps {
  items: Item[];
  onItemClick: (id: string) => void;
  selectedItem: string | null;
}

const ItemList: React.FC<ItemListProps> = ({ items, onItemClick, selectedItem }) => {
  return (
    <div className="item-list-container">
      <ul className="item-list">
        {items.map((item) => (
          <li
            key={item.id}
            className={`item-list-item ${selectedItem === item.id ? 'selected' : ''}`}
            onClick={() => onItemClick(item.id)}
          >
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ItemList;
