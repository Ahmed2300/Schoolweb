import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';

interface TextRevealProps {
    children: ReactNode;
    /** Delay before the animation starts, in seconds. Default: 0 */
    delay?: number;
    /** Duration per word animation, in seconds. Default: 0.6 */
    duration?: number;
    /** Stagger between words, in seconds. Default: 0.08 */
    stagger?: number;
    className?: string;
    as?: React.ElementType;
}

/**
 * TextReveal — Animates each child line/block with a staggered slide-up + fade.
 *
 * Instead of splitting text into individual words (which breaks bg-clip-text gradients),
 * this component animates each direct child as a whole block.
 * Each child block slides up and fades in with a staggered delay.
 */
export const TextReveal = ({
    children,
    delay = 0,
    duration = 0.6,
    stagger = 0.15,
    className = '',
    as: Tag = 'div',
}: TextRevealProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Animate each direct child element (each <span className="block">) as a whole
        const childElements = container.querySelectorAll<HTMLElement>(':scope > *');
        if (childElements.length === 0) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                childElements,
                { y: 60, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration,
                    stagger,
                    delay,
                    ease: 'power3.out',
                }
            );
        }, container);

        return () => ctx.revert();
    }, [delay, duration, stagger]);

    const TagComponent = Tag as React.ElementType;

    return (
        <TagComponent ref={containerRef} className={className}>
            {children}
        </TagComponent>
    );
};
