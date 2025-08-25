import { useEffect, useRef, useState } from 'react';

export interface UndoableAction<TSnapshot> {
  label: string;
  snapshot: TSnapshot;
  applyOptimistic: () => void;
  commit: () => Promise<void> | void;
  restore: (snapshot: TSnapshot) => void;
}

export interface UseUndoableDeleteReturn<TSnapshot> {
  pending: { label: string } | null;
  trigger: (action: UndoableAction<TSnapshot>) => void;
  undo: () => void;
}

/**
 * Provides a simple, single-slot undo mechanism for destructive actions.
 * - Applies the change optimistically
 * - Shows a pending state for 5 seconds
 * - Commits after 5s unless undone
 * - Restores snapshot on undo or on commit failure
 */
export function useUndoableDelete<TSnapshot>(): UseUndoableDeleteReturn<TSnapshot> {
  const [pending, setPending] = useState<{ label: string } | null>(null);
  const timerRef = useRef<number | null>(null);
  const actionRef = useRef<UndoableAction<TSnapshot> | null>(null);

  const trigger = (action: UndoableAction<TSnapshot>) => {
    if (actionRef.current) {
      // Only one pending action at a time
      return;
    }
    actionRef.current = action;
    action.applyOptimistic();
    setPending({ label: action.label });

    timerRef.current = window.setTimeout(async () => {
      try {
        await action.commit();
      } catch {
        try {
          action.restore(action.snapshot);
        } catch {
          /* ignore restore failures */
        }
      } finally {
        setPending(null);
        actionRef.current = null;
        timerRef.current = null;
      }
    }, 5000);
  };

  const undo = () => {
    if (!actionRef.current) return;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    try {
      actionRef.current.restore(actionRef.current.snapshot);
    } catch {
      /* ignore restore failures */
    }
    setPending(null);
    actionRef.current = null;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      actionRef.current = null;
    };
  }, []);

  return { pending, trigger, undo };
}
