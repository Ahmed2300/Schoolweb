import { useRef, useCallback, useState, type ReactNode } from 'react';

interface TiltCardProps {
    children: ReactNode;
    className?: string;
    /** Max tilt angle in degrees. Default: 8 */
    maxTilt?: number;
    /** Glare intensity (0-1). Default: 0.15 */
    glareIntensity?: number;
    /** Perspective distance in px. Default: 1000 */
    perspective?: number;
    /** Scale on hover. Default: 1.02 */
    hoverScale?: number;
}

/**
 * TiltCard — 3D perspective tilt that follows the mouse with a moving glare overlay.
 * Custom implementation (no vanilla-tilt dependency) using pure React + CSS transforms.
 */
export const TiltCard = ({
    children,
    className = '',
    maxTilt = 8,
    glareIntensity = 0.15,
    perspective = 1000,
    hoverScale = 1.02,
}: TiltCardProps) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
    const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            if (!cardRef.current) return;

            const rect = cardRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Normalize cursor position to -1..1
            const normalX = (e.clientX - centerX) / (rect.width / 2);
            const normalY = (e.clientY - centerY) / (rect.height / 2);

            // Tilt: rotate around opposite axis (X for vertical movement, Y for horizontal)
            setTilt({
                rotateX: -normalY * maxTilt,
                rotateY: normalX * maxTilt,
            });

            // Glare position: follow cursor as a percentage
            const percentX = ((e.clientX - rect.left) / rect.width) * 100;
            const percentY = ((e.clientY - rect.top) / rect.height) * 100;
            setGlare({ x: percentX, y: percentY, opacity: glareIntensity });
        },
        [maxTilt, glareIntensity]
    );

    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
        setTilt({ rotateX: 0, rotateY: 0 });
        setGlare((prev) => ({ ...prev, opacity: 0 }));
    }, []);

    return (
        <div
            ref={cardRef}
            className={`tilt-card-wrapper ${className}`}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
                perspective: `${perspective}px`,
                transformStyle: 'preserve-3d',
            }}
        >
            <div
                className="tilt-card-inner relative"
                style={{
                    transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(${isHovered ? hoverScale : 1})`,
                    transition: isHovered
                        ? 'transform 0.1s ease-out'
                        : 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
                    transformStyle: 'preserve-3d',
                    willChange: 'transform',
                }}
            >
                {children}

                {/* Glare overlay — simulates light reflection moving across the card surface */}
                <div
                    className="absolute inset-0 rounded-[inherit] pointer-events-none z-10"
                    style={{
                        background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}) 0%, transparent 70%)`,
                        transition: 'opacity 0.3s ease',
                        opacity: isHovered ? 1 : 0,
                    }}
                />
            </div>
        </div>
    );
};
