import React from 'react';

export type Comparator<T> = (a: T, b: T) => number;

interface SorterProps<T> {
  items: T[];
  orders: Record<string, Comparator<T>>;
  defaultOrderKey?: string;
  render: (sortedItems: T[]) => React.ReactNode;
}

export function useSorter<T>(
  items: T[],
  orders: Record<string, Comparator<T>>,
  defaultOrderKey?: string,
) {
  const orderKeys = React.useMemo(() => Object.keys(orders), [orders]);
  const initialKey = defaultOrderKey && orderKeys.includes(defaultOrderKey)
    ? defaultOrderKey
    : (orderKeys[0] || '');

  const [selectedKey, setSelectedKey] = React.useState<string>(initialKey);

  React.useEffect(() => {
    if (!orderKeys.includes(selectedKey)) {
      setSelectedKey(orderKeys[0] || '');
    }
  }, [orderKeys, selectedKey]);

  const sortedItems = React.useMemo(() => {
    const comparator = orders[selectedKey];
    if (!comparator) return items.slice();
    return items.slice().sort(comparator);
  }, [items, orders, selectedKey]);

  const Controls = () => (
    <div style={{ width: '25%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      {orderKeys.map((key, idx) => (
        <React.Fragment key={key}>
          <span
            style={{
              cursor: 'pointer',
              fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
              fontWeight: 400, // Selected typography specifies Regular 400
              fontSize: selectedKey === key ? '16px' : '16px',
              lineHeight: '100%',
              letterSpacing: '0',
              textAlign: 'right',
            }}
            onClick={() => setSelectedKey(key)}
          >
            {key}
          </span>
          {idx < orderKeys.length - 1 && (
            <hr style={{
              alignSelf: 'stretch',
              width: '100%',
              margin: '6px 0',
              border: 'none',
              borderTop: '1px solid black',
            }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return { selectedKey, setSelectedKey, sortedItems, Controls } as const;
}

function Sorter<T>({ items, orders, defaultOrderKey, render }: SorterProps<T>) {
  const orderKeys = React.useMemo(() => Object.keys(orders), [orders]);
  const initialKey = defaultOrderKey && orderKeys.includes(defaultOrderKey)
    ? defaultOrderKey
    : (orderKeys[0] || '');

  const [selectedKey, setSelectedKey] = React.useState<string>(initialKey);

  React.useEffect(() => {
    // If orders change, ensure selectedKey is still valid
    if (!orderKeys.includes(selectedKey)) {
      setSelectedKey(orderKeys[0] || '');
    }
  }, [orderKeys, selectedKey]);

  const sortedItems = React.useMemo(() => {
    const comparator = orders[selectedKey];
    if (!comparator) return items.slice();
    return items.slice().sort(comparator);
  }, [items, orders, selectedKey]);

  return (
    <div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
        {orderKeys.map((key, idx) => (
          <React.Fragment key={key}>
            <span
              style={{ cursor: 'pointer', fontWeight: selectedKey === key ? 700 : 400 }}
              onClick={() => setSelectedKey(key)}
            >
              {key}
            </span>
            {idx < orderKeys.length - 1 && <span style={{ opacity: 0.5 }}>|</span>}
          </React.Fragment>
        ))}
      </div>
      <div style={{ marginTop: '12px' }}>{render(sortedItems)}</div>
    </div>
  );
}

export default Sorter;
