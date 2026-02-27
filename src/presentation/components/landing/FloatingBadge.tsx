import { useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import gsap from 'gsap';

interface FloatingBadgeProps {
    children: ReactNode;
    /** Base Y-axis float range in px. Default: 12 */
    floatRange?: number;
    /** Float animation duration in seconds. Default: 3 */
    floatDuration?: number;
    /** How strongly this badge reacts to mouse movement (0-1). Default: 0.05 */
    mouseReactivity?: number;
    /** Delay before float starts, to stagger independent speeds. Default: 0 */
    floatDelay?: number;
    className?: string;
}

/**
 * FloatingBadge — Continuously floats on Y-axis with a looping yoyo GSAP Sine ease,
 * and reacts slightly to global mouse movement via a mousemove listener.
 */
export const FloatingBadge = ({
    children,
    floatRange = 12,
    floatDuration = 3,
    mouseReactivity = 0.05,
    floatDelay = 0,
    className = '',
}: FloatingBadgeProps) => {
    const badgeRef = useRef<HTMLDivElement>(null);
    const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

    // Continuous float animation
    useEffect(() => {
        const badge = badgeRef.current;
        if (!badge) return;

        const ctx = gsap.context(() => {
            gsap.to(badge, {
                y: floatRange,
                duration: floatDuration,
                ease: 'sine.inOut',
                yoyo: true,
                repeat: -1,
                delay: floatDelay,
            });
        });

        return () => ctx.revert();
    }, [floatRange, floatDuration, floatDelay]);

    // Mouse reactivity — listen to global mousemove
    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            // Map cursor position to a small translate offset
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const offsetX = (e.clientX - centerX) * mouseReactivity;
            const offsetY = (e.clientY - centerY) * mouseReactivity;
            setMouseOffset({ x: offsetX, y: offsetY });
        },
        [mouseReactivity]
    );

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [handleMouseMove]);

    return (
        <div
            ref={badgeRef}
            className={className}
            style={{
                transform: `translate(${mouseOffset.x}px, ${mouseOffset.y}px)`,
                transition: 'transform 0.3s ease-out',
                willChange: 'transform',
            }}
        >
            {children}
        </div>
    );
};
