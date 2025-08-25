import { render, screen, fireEvent } from '@testing-library/react';
import React, { useState } from 'react';
import { useUndoableDelete } from './useUndoableDelete';

function Harness({ failCommit = false }: { failCommit?: boolean }) {
  const [items, setItems] = useState<number[]>([1, 2, 3]);
  const { pending, trigger, undo } = useUndoableDelete<number[]>();

  const handleTrigger = () => {
    const snapshot = items;
    const updated = items.slice(0, -1);
    trigger({
      label: `Deleted ${items[items.length - 1]}`,
      snapshot,
      applyOptimistic: () => setItems(updated),
      commit: async () => {
        if (failCommit) throw new Error('boom');
      },
      restore: (snap) => setItems(snap),
    });
  };

  return (
    <div>
      <div>count:{items.length}</div>
      {pending && <div role="alert">{pending.label}</div>}
      <button onClick={handleTrigger}>trigger</button>
      <button onClick={undo}>undo</button>
    </div>
  );
}

describe('useUndoableDelete', () => {
  it('applies optimistic change and shows pending label', async () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('trigger'));
    // optimistic removal
    expect(screen.getByText(/count:2/)).toBeInTheDocument();
    // pending banner shown
    expect(screen.getByRole('alert')).toHaveTextContent('Deleted 3');
  });

  it('undo restores snapshot and clears pending', async () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('trigger'));
    expect(screen.getByText(/count:2/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('undo'));
    // restored
    expect(screen.getByText(/count:3/)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
