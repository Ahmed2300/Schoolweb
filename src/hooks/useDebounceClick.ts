/**
 * useDebounceClick Hook
 * 
 * Prevents double-clicks and rapid multiple submissions.
 * Useful for join session buttons and other critical actions.
 */

import { useState, useCallback, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface UseDebounceClickOptions {
    /** Delay in milliseconds before allowing another click. Default: 1000ms */
    delay?: number;
    /** If true, shows a loading state during the delay period */
    showLoading?: boolean;
}

export interface UseDebounceClickReturn {
    /** Wrapped click handler with debounce protection */
    handleClick: () => void;
    /** Whether the button is currently debouncing */
    isDebouncing: boolean;
    /** Reset the debounce state (useful for error recovery) */
    reset: () => void;
}

// ═══════════════════════════════════════════════════════════════
// Hook Implementation
// ═══════════════════════════════════════════════════════════════

/**
 * Hook to prevent rapid double-clicks on buttons.
 * 
 * @example
 * ```tsx
 * const { handleClick, isDebouncing } = useDebounceClick(() => {
 *     joinSession();
 * }, { delay: 2000 });
 * 
 * <button onClick={handleClick} disabled={isDebouncing}>
 *     {isDebouncing ? 'جاري التحميل...' : 'انضم للجلسة'}
 * </button>
 * ```
 */
export function useDebounceClick(
    onClick: () => void | Promise<void>,
    options: UseDebounceClickOptions = {}
): UseDebounceClickReturn {
    const { delay = 1000, showLoading = true } = options;

    const [isDebouncing, setIsDebouncing] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const onClickRef = useRef(onClick);

    // Keep the callback ref updated
    onClickRef.current = onClick;

    const handleClick = useCallback(() => {
        if (isDebouncing) return;

        setIsDebouncing(true);

        // Execute the click handler
        const result = onClickRef.current();

        // If it returns a promise, wait for it before starting the delay
        if (result instanceof Promise) {
            result.finally(() => {
                timeoutRef.current = setTimeout(() => {
                    setIsDebouncing(false);
                }, delay);
            });
        } else {
            timeoutRef.current = setTimeout(() => {
                setIsDebouncing(false);
            }, delay);
        }
    }, [delay, isDebouncing]);

    const reset = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setIsDebouncing(false);
    }, []);

    return { handleClick, isDebouncing, reset };
}

// ═══════════════════════════════════════════════════════════════
// Alternative: useThrottleClick (for rate limiting multiple clicks)
// ═══════════════════════════════════════════════════════════════

export interface UseThrottleClickOptions {
    /** Minimum interval between clicks in milliseconds. Default: 500ms */
    interval?: number;
}

export interface UseThrottleClickReturn {
    /** Wrapped click handler with throttle protection */
    handleClick: () => void;
    /** Time remaining until next click is allowed (in ms) */
    timeRemaining: number;
}

/**
 * Hook to limit the rate of clicks (allows click immediately but throttles subsequent ones).
 * Unlike debounce, throttle executes immediately then limits further calls.
 */
export function useThrottleClick(
    onClick: () => void,
    options: UseThrottleClickOptions = {}
): UseThrottleClickReturn {
    const { interval = 500 } = options;

    const lastClickTimeRef = useRef<number>(0);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const onClickRef = useRef(onClick);

    onClickRef.current = onClick;

    const handleClick = useCallback(() => {
        const now = Date.now();
        const timeSinceLastClick = now - lastClickTimeRef.current;

        if (timeSinceLastClick >= interval) {
            lastClickTimeRef.current = now;
            setTimeRemaining(interval);
            onClickRef.current();

            // Update time remaining periodically
            const updateInterval = setInterval(() => {
                const remaining = interval - (Date.now() - lastClickTimeRef.current);
                if (remaining <= 0) {
                    setTimeRemaining(0);
                    clearInterval(updateInterval);
                } else {
                    setTimeRemaining(remaining);
                }
            }, 100);
        } else {
            setTimeRemaining(interval - timeSinceLastClick);
        }
    }, [interval]);

    return { handleClick, timeRemaining };
}

// ═══════════════════════════════════════════════════════════════
// Utility: withDebounce HOC for simple cases
// ═══════════════════════════════════════════════════════════════

/**
 * Simple function wrapper that debounces any async/sync function.
 * 
 * @example
 * ```tsx
 * const debouncedSubmit = debounceFunction(handleSubmit, 1000);
 * <button onClick={debouncedSubmit}>Submit</button>
 * ```
 */
export function debounceFunction<T extends (...args: unknown[]) => unknown>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let isDebouncing = false;

    return (...args: Parameters<T>) => {
        if (isDebouncing) return;

        isDebouncing = true;
        fn(...args);

        setTimeout(() => {
            isDebouncing = false;
        }, delay);
    };
}
