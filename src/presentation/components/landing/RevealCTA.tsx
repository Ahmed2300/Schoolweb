import { useRef, useCallback, type ReactNode } from 'react';

interface RevealCTAProps {
    children: ReactNode;
    /** Radius of the reveal circle in pixels. Default: 200 */
    revealRadius?: number;
    /** CSS classes for the outer container */
    className?: string;
}

/**
 * RevealCTA — Huly-style cursor reveal masking effect.
 *
 * Renders a hidden "dashboard UI" layer ON TOP of the main content.
 * The reveal layer uses CSS mask-image to be invisible except for
 * a radial-gradient circle centered on the cursor, creating the
 * effect of "peeling back" the red surface to reveal the dashboard.
 *
 * Uses CSS custom properties (--reveal-x, --reveal-y) updated via
 * requestAnimationFrame for 60fps performance without layout thrashing.
 */
export const RevealCTA = ({
    children,
    revealRadius = 200,
    className = '',
}: RevealCTAProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rafId = useRef<number>(0);

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (rafId.current) cancelAnimationFrame(rafId.current);

            rafId.current = requestAnimationFrame(() => {
                const container = containerRef.current;
                if (!container) return;

                const rect = container.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                container.style.setProperty('--reveal-x', `${x}px`);
                container.style.setProperty('--reveal-y', `${y}px`);
                container.style.setProperty('--reveal-opacity', '1');
            });
        },
        [],
    );

    const handleMouseLeave = useCallback(() => {
        if (rafId.current) cancelAnimationFrame(rafId.current);
        const container = containerRef.current;
        if (container) {
            container.style.setProperty('--reveal-opacity', '0');
        }
    }, []);

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`relative overflow-hidden cursor-none ${className}`}
            style={{
                '--reveal-x': '50%',
                '--reveal-y': '50%',
                '--reveal-opacity': '0',
            } as React.CSSProperties}
        >
            {/* === Main visible content (red gradient CTA) — base layer === */}
            <div className="relative z-[1]">
                {children}
            </div>

            {/* === Reveal Layer — Dashboard UI Mockup (ON TOP, masked) === */}
            <div
                className="absolute inset-0 z-[2] pointer-events-none transition-opacity duration-300"
                style={{
                    opacity: 'var(--reveal-opacity)',
                    maskImage: `radial-gradient(circle ${revealRadius}px at var(--reveal-x) var(--reveal-y), rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 40%, transparent 70%)`,
                    WebkitMaskImage: `radial-gradient(circle ${revealRadius}px at var(--reveal-x) var(--reveal-y), rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 40%, transparent 70%)`,
                }}
            >
                {/* Dashboard dark background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-[inherit]" />

                {/* Dashboard skeleton UI */}
                <div className="absolute inset-0 p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col gap-4 opacity-90">
                    {/* Top navigation bar */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-shibl-crimson/40 flex items-center justify-center">
                            <div className="w-4 h-4 rounded-sm bg-white/50" />
                        </div>
                        <div className="h-3 w-20 rounded-full bg-white/20" />
                        <div className="flex-1" />
                        <div className="flex gap-2">
                            <div className="h-3 w-14 rounded-full bg-white/15" />
                            <div className="h-3 w-14 rounded-full bg-white/15" />
                            <div className="h-3 w-14 rounded-full bg-white/15" />
                        </div>
                        <div className="w-8 h-8 rounded-full bg-shibl-crimson/30" />
                    </div>

                    {/* Main content area */}
                    <div className="flex-1 flex gap-4">
                        {/* Sidebar */}
                        <div className="w-1/5 hidden md:flex flex-col gap-3 pt-2">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className={`w-4 h-4 rounded ${i === 1 ? 'bg-shibl-crimson/40' : 'bg-white/10'}`} />
                                    <div className={`h-2 rounded-full ${i === 1 ? 'w-16 bg-white/30' : 'w-12 bg-white/10'}`} />
                                </div>
                            ))}
                        </div>

                        {/* Dashboard content */}
                        <div className="flex-1 flex flex-col gap-3">
                            {/* Stats row */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { color: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
                                    { color: 'bg-blue-500/20', border: 'border-blue-500/30' },
                                    { color: 'bg-amber-500/20', border: 'border-amber-500/30' },
                                ].map((stat, i) => (
                                    <div
                                        key={i}
                                        className={`rounded-xl ${stat.color} border ${stat.border} p-3 flex flex-col gap-1.5`}
                                    >
                                        <div className="h-2 w-12 rounded-full bg-white/20" />
                                        <div className="h-4 w-8 rounded bg-white/30" />
                                    </div>
                                ))}
                            </div>

                            {/* Course progress cards */}
                            <div className="grid grid-cols-2 gap-3 flex-1">
                                {[1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className="rounded-xl bg-white/5 border border-white/10 p-3 flex flex-col gap-2"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-lg bg-shibl-crimson/20" />
                                            <div className="h-2 w-20 rounded-full bg-white/15" />
                                        </div>
                                        {/* Progress bar */}
                                        <div className="h-1.5 rounded-full bg-white/10 mt-auto">
                                            <div
                                                className="h-full rounded-full bg-shibl-crimson/50"
                                                style={{ width: `${30 + i * 15}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subtle grid pattern overlay */}
                <div
                    className="absolute inset-0 opacity-20 pointer-events-none rounded-[inherit]"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
                        `,
                        backgroundSize: '40px 40px',
                    }}
                />
            </div>

            {/* Custom cursor dot for this section */}
            <div
                className="absolute z-[3] pointer-events-none w-5 h-5 rounded-full border-2 border-white/80 transition-opacity duration-300"
                style={{
                    left: 'var(--reveal-x)',
                    top: 'var(--reveal-y)',
                    transform: 'translate(-50%, -50%)',
                    opacity: 'var(--reveal-opacity)',
                    boxShadow: '0 0 20px rgba(255,255,255,0.3)',
                }}
            />
        </div>
    );
};
