import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

/**
 * BentoVideoCard — "محتوى فيديو متميز"
 *
 * Glassmorphic video player floating over a soft thumbnail.
 * On hover: player scales 1.05×, play button glows,
 * colored backlight shifts with cursor position.
 */
export const BentoVideoCard = () => {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--bl-x', `${x}%`);
        card.style.setProperty('--bl-y', `${y}%`);
    }, []);

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            className="relative h-full group"
            style={{ '--bl-x': '50%', '--bl-y': '50%' } as React.CSSProperties}
        >
            {/* Dynamic backlight — follows cursor */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[inherit] pointer-events-none"
                style={{
                    background: 'radial-gradient(400px circle at var(--bl-x) var(--bl-y), rgba(175, 12, 21, 0.08), transparent 60%)',
                }}
            />

            {/* Card content area */}
            <div className="relative z-10 p-5 sm:p-6 md:p-8 h-full flex flex-col">
                {/* Title + description */}
                <h3 className="text-lg sm:text-xl font-bold text-charcoal dark:text-white mb-2">محتوى فيديو متميز</h3>
                <p className="text-slate-grey dark:text-slate-300 text-sm mb-5 leading-relaxed">
                    دروس مسجلة بأعلى جودة مع إمكانية المشاهدة في أي وقت
                </p>

                {/* Glassmorphic video player mockup */}
                <div className="flex-1 flex items-center justify-center mt-auto">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="relative w-full max-w-[280px] aspect-video rounded-2xl overflow-hidden shadow-lg"
                    >
                        {/* Video thumbnail background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-shibl-crimson/10 via-shibl-crimson/5 to-slate-100" />

                        {/* Thumbnail skeleton lines */}
                        <div className="absolute inset-0 p-3 flex flex-col justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-shibl-crimson/40" />
                                <div className="h-1.5 w-16 rounded-full bg-charcoal/10 dark:bg-white/20" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <div className="h-1.5 w-3/4 rounded-full bg-charcoal/8 dark:bg-white/10" />
                                <div className="h-1.5 w-1/2 rounded-full bg-charcoal/8 dark:bg-white/10" />
                            </div>
                        </div>

                        {/* Glassmorphic frame */}
                        <div className="absolute inset-0 border border-charcoal/[0.06] dark:border-white/10 rounded-2xl backdrop-blur-sm bg-white/40 dark:bg-white/5" />

                        {/* Glowing play button */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-white/70 dark:bg-white/10 backdrop-blur-md border border-charcoal/10 dark:border-white/10 flex items-center justify-center group-hover:bg-shibl-crimson/10 group-hover:border-shibl-crimson/30 group-hover:shadow-[0_0_30px_rgba(175,12,21,0.15)] transition-all duration-500 shadow-md">
                                <Play size={20} className="text-shibl-crimson fill-shibl-crimson/80 ml-0.5" />
                            </div>
                        </div>

                        {/* Progress bar at bottom */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-charcoal/5 dark:bg-white/10">
                            <div className="h-full w-[35%] bg-shibl-crimson/50 rounded-r-full" />
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
