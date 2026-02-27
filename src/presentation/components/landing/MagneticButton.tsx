import { useRef, useState, useCallback, type ReactNode } from 'react';

interface MagneticButtonProps {
    children: ReactNode;
    className?: string;
    /** How strongly the button is pulled toward the cursor (0-1). Default: 0.3 */
    strength?: number;
    /** Boundary radius in px around the button that triggers the effect. Default: 100 */
    boundaryRadius?: number;
    as?: 'button' | 'a' | 'div';
    onClick?: () => void;
    [key: string]: unknown;
}

/**
 * MagneticButton — When the cursor approaches, the button is pulled slightly toward it.
 * Uses mousemove within a padding boundary and applies transform: translate(x, y).
 */
export const MagneticButton = ({
    children,
    className = '',
    strength = 0.3,
    boundaryRadius = 100,
    as: Component = 'div',
    onClick,
    ...rest
}: MagneticButtonProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const [transform, setTransform] = useState({ x: 0, y: 0 });

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            if (!ref.current) return;

            const rect = ref.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const distX = e.clientX - centerX;
            const distY = e.clientY - centerY;

            const distance = Math.sqrt(distX * distX + distY * distY);
            const maxDist = boundaryRadius + Math.max(rect.width, rect.height) / 2;

            if (distance < maxDist) {
                setTransform({
                    x: distX * strength,
                    y: distY * strength,
                });
            }
        },
        [strength, boundaryRadius]
    );

    const handleMouseLeave = useCallback(() => {
        setTransform({ x: 0, y: 0 });
    }, []);

    return (
        <div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                padding: `${boundaryRadius}px`,
                margin: `-${boundaryRadius}px`,
                display: 'inline-block',
            }}
        >
            <div
                ref={ref}
                className={className}
                onClick={onClick}
                style={{
                    transform: `translate(${transform.x}px, ${transform.y}px)`,
                    transition: transform.x === 0 ? 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)' : 'transform 0.15s ease-out',
                    willChange: 'transform',
                }}
                {...rest}
            >
                {children}
            </div>
        </div>
    );
};
