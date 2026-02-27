import { ReactLenis } from 'lenis/react';
import React, { useState, useEffect } from 'react';

interface SmoothScrollWrapperProps {
    children: React.ReactNode;
}

/**
 * SmoothScrollWrapper — Defers Lenis smooth-scroll initialization.
 *
 * Lenis runs a rAF loop that adds ~50ms TBT on mobile during initial load.
 * By delaying activation until 2s after mount (or first user interaction),
 * we avoid penalizing FCP/TBT while preserving the smooth scroll experience
 * once the user starts interacting.
 */
export const SmoothScrollWrapper: React.FC<SmoothScrollWrapperProps> = ({ children }) => {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Activate on first interaction OR after 2s — whichever comes first.
        const activate = () => {
            setIsReady(true);
            cleanup();
        };

        const timer = setTimeout(activate, 2000);

        const events = ['scroll', 'wheel', 'touchstart', 'keydown'] as const;
        events.forEach(e => window.addEventListener(e, activate, { once: true, passive: true }));

        const cleanup = () => {
            clearTimeout(timer);
            events.forEach(e => window.removeEventListener(e, activate));
        };

        return cleanup;
    }, []);

    if (!isReady) {
        return <>{children}</>;
    }

    return (
        <ReactLenis root options={{
            lerp: 0.1,
            duration: 1.5,
            smoothWheel: true,
            prevent: (nodeElement: Element) => {
                return nodeElement.closest(
                    '[role="dialog"], .modal-content, .custom-scrollbar, .overflow-y-auto, .overscroll-contain, [data-lenis-prevent]'
                ) !== null;
            }
        }}>
            {children}
        </ReactLenis>
    );
};
