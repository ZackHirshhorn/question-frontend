import React from 'react';

// By using generics (<T>), this component can work with any type of data.
interface GenericListProps<T> {
  /** The array of data items to render. */
  items: T[];
  /** A function that takes an item and returns a unique key for that item. */
  keyExtractor: (item: T) => string | number;
  /** A function that takes an item and returns the JSX to render for it. */
  renderItem: (item: T) => React.ReactNode;
  /** Optional CSS class for the list container. */
  className?: string;
  /** Optional inline styles for the list container. */
  style?: React.CSSProperties;
}

const listStyle: React.CSSProperties = {
  listStyleType: 'none',
  padding: 0,
  margin: 0,
};

/**
 * A reusable component that renders a list of items.
 * It is unopinionated about how the items are rendered, which is
 * controlled by the `renderItem` prop.
 */
const GenericList = <T extends {}>({
  items,
  keyExtractor,
  renderItem,
  className,
  style,
}: GenericListProps<T>) => {
  return (
    <ul className={className} style={{ ...listStyle, ...style }}>
      {items.map((item) => (
        <li key={keyExtractor(item)}>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
};

export default GenericList;
