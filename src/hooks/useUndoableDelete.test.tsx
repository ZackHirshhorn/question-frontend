import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import React, { useState } from 'react';
import { useUndoableDelete } from './useUndoableDelete';

interface HarnessProps {
  failCommit?: boolean;
  commitSpy?: () => Promise<void> | void;
  restoreSpy?: (snapshot: number[]) => void;
}

function Harness({ failCommit = false, commitSpy, restoreSpy }: HarnessProps) {
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
        if (commitSpy) {
          await commitSpy();
          return;
        }
        if (failCommit) throw new Error('boom');
      },
      restore: (snap) => {
        restoreSpy?.(snap);
        setItems(snap);
      },
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
  afterEach(() => {
    vi.useRealTimers();
  });

  it('applies optimistic change and shows pending label', () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('trigger'));
    // optimistic removal
    expect(screen.getByText(/count:2/)).toBeInTheDocument();
    // pending banner shown
    expect(screen.getByRole('alert')).toHaveTextContent('Deleted 3');
  });

  it('undo restores snapshot and clears pending', () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('trigger'));
    expect(screen.getByText(/count:2/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('undo'));
    // restored
    expect(screen.getByText(/count:3/)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('commits automatically after 5 seconds', async () => {
    vi.useFakeTimers();
    let commitResolve: (() => void) | null = null;
    const commitPromise = new Promise<void>((resolve) => {
      commitResolve = resolve;
    });
    const commitSpy = vi.fn().mockImplementation(async () => {
      commitResolve?.();
    });
    render(<Harness commitSpy={commitSpy} />);

    fireEvent.click(screen.getByText('trigger'));
    expect(commitSpy).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    await vi.runOnlyPendingTimersAsync();
    await commitPromise;
    expect(commitSpy).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('restores snapshot when commit rejects', async () => {
    vi.useFakeTimers();
    let restoreResolve: ((snapshot: number[]) => void) | null = null;
    const restorePromise = new Promise<number[]>((resolve) => {
      restoreResolve = resolve;
    });
    const commitSpy = vi.fn().mockRejectedValue(new Error('nope'));
    const restoreSpy = vi.fn((snapshot: number[]) => {
      restoreResolve?.(snapshot);
    });
    render(<Harness commitSpy={commitSpy} restoreSpy={restoreSpy} />);

    fireEvent.click(screen.getByText('trigger'));

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    await vi.runOnlyPendingTimersAsync();
    const snapshot = await restorePromise;
    expect(snapshot).toEqual([1, 2, 3]);
    expect(restoreSpy).toHaveBeenCalledWith([1, 2, 3]);
    expect(screen.getByText(/count:3/)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
