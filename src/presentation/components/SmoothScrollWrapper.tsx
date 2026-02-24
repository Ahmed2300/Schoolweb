import { ReactLenis } from 'lenis/react';
import React from 'react';

interface SmoothScrollWrapperProps {
    children: React.ReactNode;
}

export const SmoothScrollWrapper: React.FC<SmoothScrollWrapperProps> = ({ children }) => {
    React.useEffect(() => {
        const handler = (e: WheelEvent) => {
            const isPrevented = e.defaultPrevented;
            if (isPrevented) {
                console.log('Wheel default prevented on:', e.target);
            }
        };
        window.addEventListener('wheel', handler, { passive: false });
        // NOTE: Lenis runs before this if we use capture, but wheel bubbling lets us inspect the end state
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
                return scrollableParent !== null;
            }
        }}>
            {children}
        </ReactLenis>
    );
};
