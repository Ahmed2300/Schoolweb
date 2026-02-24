import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BentoVideoCard } from './bento/BentoVideoCard';
import { BentoLiveCard } from './bento/BentoLiveCard';
import { BentoQuizCard } from './bento/BentoQuizCard';
import { BentoTrackingCard } from './bento/BentoTrackingCard';

/**
 * BentoFeatureGrid — Dark-themed 2×2 bento grid with Huly-style proximity glow.
 *
 * Uses a single mousemove listener on the grid container to update
 * CSS custom properties on each card for the radial-gradient glow border.
 */
export const BentoFeatureGrid = () => {
    const gridRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const grid = gridRef.current;
        if (!grid) return;

        const cards = grid.querySelectorAll<HTMLElement>('[data-bento-card]');
        cards.forEach((card) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--glow-x', `${x}px`);
            card.style.setProperty('--glow-y', `${y}px`);
        });
    }, []);

    const cards = [
        { key: 'video', component: <BentoVideoCard /> },
        { key: 'live', component: <BentoLiveCard /> },
        { key: 'quiz', component: <BentoQuizCard /> },
        { key: 'tracking', component: <BentoTrackingCard /> },
    ];

    return (
        <div
            ref={gridRef}
            onMouseMove={handleMouseMove}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6"
        >
            {cards.map((card, idx) => (
                <motion.div
                    key={card.key}
                    data-bento-card
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: idx * 0.12 }}
                    className="bento-card relative rounded-2xl sm:rounded-3xl overflow-hidden min-h-[320px] sm:min-h-[360px]"
                    style={{
                        '--glow-x': '50%',
                        '--glow-y': '50%',
                    } as React.CSSProperties}
                >
                    {/* Card surface — light bg with subtle border */}
                    <div className="absolute inset-0 bg-white dark:bg-charcoal/80 border border-slate-200/70 dark:border-white/10 rounded-[inherit] shadow-sm" />

                    {/* Ambient glow behind card content on hover */}
                    <div
                        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-[inherit] pointer-events-none"
                        style={{
                            background: 'radial-gradient(600px circle at var(--glow-x) var(--glow-y), rgba(175,12,21,0.04), transparent 40%)',
                        }}
                    />

                    {/* Card content */}
                    <div className="relative z-10 h-full">
                        {card.component}
                    </div>
                </motion.div>
            ))}
        </div>
    );
};
