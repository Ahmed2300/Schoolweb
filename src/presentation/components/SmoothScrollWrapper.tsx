import { ReactLenis } from 'lenis/react';
import React from 'react';

interface SmoothScrollWrapperProps {
    children: React.ReactNode;
}

export const SmoothScrollWrapper: React.FC<SmoothScrollWrapperProps> = ({ children }) => {
    return (
        <ReactLenis root options={{
            lerp: 0.1,
            duration: 1.5,
            smoothWheel: true,
            prevent: (nodeElement: Element) => {
                return nodeElement.closest(
                    '.custom-scrollbar, .overflow-y-auto, .overscroll-contain, [data-lenis-prevent]'
                ) !== null;
            }
        }}>
            {children}
        </ReactLenis>
    );
};
