import { ReactLenis } from 'lenis/react';
import React from 'react';

interface SmoothScrollWrapperProps {
    children: React.ReactNode;
}

export const SmoothScrollWrapper: React.FC<SmoothScrollWrapperProps> = ({ children }) => {
    React.useEffect(() => {
        const handler = (e: WheelEvent) => {
            if (e.defaultPrevented) {
                console.log('[DEBUG] Wheel default prevented on:', e.target);
            }
        };
        window.addEventListener('wheel', handler, { passive: false });
        return () => window.removeEventListener('wheel', handler);
    }, []);

    return (
        <ReactLenis root options={{
            lerp: 0.1,
            duration: 1.5,
            smoothWheel: true,
            prevent: (nodeElement: Element) => {
                const scrollableParent = nodeElement.closest(
                    '.custom-scrollbar, .overflow-y-auto, .overscroll-contain, [data-lenis-prevent]'
                );

                // Add debug logging to trace exact issue with input hovering
                const isPrevented = scrollableParent !== null;
                console.log('[DEBUG] Lenis prevent called on', nodeElement.tagName, nodeElement.className, '=> Returns', isPrevented, 'Parent:', scrollableParent?.className);

                return isPrevented;
            }
        }}>
            {children}
        </ReactLenis>
    );
};
