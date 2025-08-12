import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { useSorter } from './Sorter';

function TestSorter({ items }: { items: { name: string }[] }) {
  const { selectedKey, sortedItems, Controls } = useSorter(
    items,
    {
      'לפי האלפבית': (a, b) => a.name.localeCompare(b.name),
      'לפי תאריך': () => 0,
    },
    'לפי האלפבית',
  );
  return (
    <div>
      <Controls />
      <div data-testid="selected">{selectedKey}</div>
      <ul>{sortedItems.map(i => <li key={i.name}>{i.name}</li>)}</ul>
    </div>
  );
}

describe('useSorter', () => {
  it('sorts by default key and switches order on click', () => {
    const items = [{ name: 'Beta' }, { name: 'Alpha' }, { name: 'Gamma' }];
    render(<TestSorter items={items} />);

    expect(screen.getByTestId('selected').textContent).toBe('לפי האלפבית');
    const listItems = screen.getAllByRole('listitem').map(li => li.textContent);
    expect(listItems).toEqual(['Alpha', 'Beta', 'Gamma']);

    fireEvent.click(screen.getByText('לפי תאריך'));
    expect(screen.getByTestId('selected').textContent).toBe('לפי תאריך');
    const listItems2 = screen.getAllByRole('listitem').map(li => li.textContent);
    expect(listItems2).toEqual(['Beta', 'Alpha', 'Gamma']);
  });
});

