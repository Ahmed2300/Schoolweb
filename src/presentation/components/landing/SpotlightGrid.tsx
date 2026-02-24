import {
    useRef,
    useCallback,
    useState,
    useEffect,
    type ReactNode,
    type CSSProperties,
} from 'react';

interface SpotlightGridProps {
    children: ReactNode;
    className?: string;
    /** Spotlight radius in px. Default: 250 */
    spotlightRadius?: number;
    /** Border color of the spotlight. Default: 'rgba(175, 12, 21, 0.5)' (shibl-crimson) */
    spotlightColor?: string;
    /** Grid gap in px. Default: 1 — the "border" is actually a gap revealing the gradient underneath */
    borderWidth?: number;
}

/**
 * SpotlightGrid — Huly-style proximity border spotlight.
 *
 * Technique: The wrapper has a dark/gradient background. The cards inside have solid
 * backgrounds that cover the wrapper. A 1px gap between cards reveals the wrapper's
 * background. A radial-gradient mask is applied to the wrapper background, centered
 * on the mouse position, creating the illusion that card borders "light up" near the cursor.
 *
 * This is the EXACT technique used by huly.io, linear.app, and Stripe's pricing cards.
 */
export const SpotlightGrid = ({
    children,
    className = '',
    spotlightRadius = 250,
    spotlightColor = 'rgba(175, 12, 21, 0.5)',
    borderWidth = 1,
}: SpotlightGridProps) => {
    const gridRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
    const [isActive, setIsActive] = useState(false);
    const rafRef = useRef<number>(0);
    const lastMouse = useRef({ x: 0, y: 0 });

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!gridRef.current) return;

            const rect = gridRef.current.getBoundingClientRect();
            lastMouse.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };

            // Throttle via rAF for smooth 60fps updates
            if (!rafRef.current) {
                rafRef.current = requestAnimationFrame(() => {
                    setMousePos({ ...lastMouse.current });
                    rafRef.current = 0;
                });
            }
        },
        []
    );

    const handleMouseEnter = useCallback(() => {
        setIsActive(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsActive(false);
        setMousePos(null);
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = 0;
        }
    }, []);

    useEffect(() => {
        const grid = gridRef.current;
        if (!grid) return;

        grid.addEventListener('mousemove', handleMouseMove, { passive: true });
        grid.addEventListener('mouseenter', handleMouseEnter);
        grid.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            grid.removeEventListener('mousemove', handleMouseMove);
            grid.removeEventListener('mouseenter', handleMouseEnter);
            grid.removeEventListener('mouseleave', handleMouseLeave);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [handleMouseMove, handleMouseEnter, handleMouseLeave]);

    const wrapperStyle: CSSProperties = {
        // The "border" is the gap between cards that reveals the gradient background
        gap: `${borderWidth}px`,
        padding: `${borderWidth}px`,
        borderRadius: '1.5rem',
        // Gradient background — visible only through the gaps between cards
        background: mousePos && isActive
            ? `radial-gradient(${spotlightRadius}px circle at ${mousePos.x}px ${mousePos.y}px, ${spotlightColor}, transparent 70%)`
            : 'transparent',
        transition: isActive ? 'none' : 'background 0.3s ease',
    };

    return (
        <div
            ref={gridRef}
            className={`spotlight-grid ${className}`}
            style={wrapperStyle}
        >
            {children}
        </div>
    );
};
