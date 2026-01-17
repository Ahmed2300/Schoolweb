import { useState, useCallback } from 'react';

interface HistoryState<T> {
    past: T[];
    present: T | null;
    future: T[];
}

export function useUndoRedo<T>(initialState: T) {
    const [history, setHistory] = useState<HistoryState<T>>({
        past: [],
        present: initialState,
        future: [],
    });

    const canUndo = history.past.length > 0;
    const canRedo = history.future.length > 0;

    const undo = useCallback(() => {
        setHistory(currentState => {
            const { past, present, future } = currentState;
            if (past.length === 0) return currentState;

            const previous = past[past.length - 1];
            const newPast = past.slice(0, past.length - 1);

            return {
                past: newPast,
                present: previous,
                future: [present!, ...future],
            };
        });
    }, []);

    const redo = useCallback(() => {
        setHistory(currentState => {
            const { past, present, future } = currentState;
            if (future.length === 0) return currentState;

            const next = future[0];
            const newFuture = future.slice(1);

            return {
                past: [...past, present!],
                present: next,
                future: newFuture,
            };
        });
    }, []);

    const set = useCallback((newState: T) => {
        setHistory(currentState => {
            const { past, present } = currentState;

            // Simple optimization: don't push if state matches deeply? 
            // For now, assume caller handles deduping or we just push.
            if (JSON.stringify(present) === JSON.stringify(newState)) {
                return currentState;
            }

            return {
                past: [...past, present!].slice(-50), // Limit history to 50
                present: newState,
                future: [],
            };
        });
    }, []);

    return {
        state: history.present as T,
        set,
        undo,
        redo,
        canUndo,
        canRedo,
        history,
    };
}
