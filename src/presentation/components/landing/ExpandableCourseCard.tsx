import { useState, useRef, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';

interface ExpandableCourseCardProps {
    icon: ReactNode;
    title: string;
    description: string;
    /** Gradient classes for the card background, e.g. "from-red-50 to-rose-50" */
    gradientClasses: string;
    /** Icon color class, e.g. "text-shibl-crimson" */
    iconColor: string;
    /** Optional video URL for the preview. Falls back to animated placeholder. */
    videoSrc?: string;
    /** Optional poster/thumbnail for the video. */
    videoPoster?: string;
    /** CTA text — default: "تصفح الدورات" */
    ctaText?: string;
    /** Click handler for the CTA */
    onCtaClick?: () => void;
    /** Unique ID for Framer Motion layout animation */
    layoutId: string;
    /** Animation delay for staggered entrance */
    delay?: number;
    /** Whether RTL — used for arrow direction */
    isRTL?: boolean;
}

/**
 * ExpandableCourseCard — Huly-style card that expands on hover to reveal
 * a video preview (or animated gradient placeholder).
 *
 * Uses Framer Motion `layout` for smooth FLIP-style height animations
 * and `AnimatePresence` for the preview content fade-in.
 */
export const ExpandableCourseCard = ({
    icon,
    title,
    description,
    gradientClasses,
    iconColor,
    videoSrc,
    videoPoster,
    ctaText = 'تصفح الدورات',
    onCtaClick,
    layoutId,
    delay = 0,
    isRTL = true,
}: ExpandableCourseCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const hoverTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

    const handleMouseEnter = useCallback(() => {
        // Small delay to avoid accidental expand on quick scroll-by
        hoverTimeout.current = setTimeout(() => {
            setIsExpanded(true);
            if (videoRef.current) {
                videoRef.current.currentTime = 0;
                videoRef.current.play().catch(() => {
                    // Autoplay blocked — silently ignore
                });
            }
        }, 150);
    }, []);

    const handleMouseLeave = useCallback(() => {
        if (hoverTimeout.current) {
            clearTimeout(hoverTimeout.current);
        }
        setIsExpanded(false);
        if (videoRef.current) {
            videoRef.current.pause();
        }
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            layout
            layoutId={layoutId}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`
                relative overflow-hidden rounded-3xl sm:rounded-[32px] md:rounded-[40px]
                bg-gradient-to-br ${gradientClasses} dark:from-charcoal/80 dark:to-charcoal
                border border-white dark:border-white/10 shadow-sm
                cursor-default group
                transition-shadow duration-300
                ${isExpanded ? 'shadow-xl dark:shadow-black/50' : 'hover:shadow-lg dark:hover:shadow-black/30'}
            `}
        >
            {/* Main card content — always visible */}
            <motion.div
                layout="position"
                className="p-5 sm:p-6 md:p-8 flex flex-col items-center text-center relative z-10"
            >
                <motion.div
                    layout="position"
                    className={`${iconColor} mb-4 sm:mb-6 md:mb-8 transition-transform duration-300 ${isExpanded ? 'scale-110' : 'group-hover:scale-105'}`}
                >
                    {icon}
                </motion.div>

                <motion.h3
                    layout="position"
                    className="text-lg sm:text-xl md:text-2xl font-extrabold text-charcoal dark:text-white mb-2 sm:mb-3"
                >
                    {title}
                </motion.h3>

                <motion.p
                    layout="position"
                    className="text-slate-grey dark:text-slate-300 font-bold mb-4 sm:mb-5 md:mb-6 opacity-80 text-sm sm:text-base"
                >
                    {description}
                </motion.p>

                <motion.div
                    layout="position"
                    onClick={onCtaClick}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-extrabold text-charcoal dark:text-white text-sm sm:text-base cursor-pointer hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-sm dark:hover:shadow-none transition-all"
                    style={{ lineHeight: 1 }}
                >
                    <span className="flex items-center">{ctaText}</span>
                    <motion.span
                        animate={{ x: isExpanded ? (isRTL ? -4 : 4) : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="transition-transform"
                            style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }}
                        >
                            <path d="m12 19-7-7 7-7" />
                            <path d="M19 12H5" />
                        </svg>
                    </motion.span>
                </motion.div>
            </motion.div>

            {/* Expandable video preview — slides in on hover */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                            height: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                            opacity: { duration: 0.3, delay: 0.1 },
                        }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6">
                            <div className="rounded-2xl overflow-hidden bg-charcoal/5 relative aspect-video">
                                {videoSrc ? (
                                    /* Actual video */
                                    <video
                                        ref={videoRef}
                                        src={videoSrc}
                                        poster={videoPoster}
                                        muted
                                        loop
                                        playsInline
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    /* Animated gradient placeholder — simulates a course preview */
                                    <div className="w-full h-full relative overflow-hidden">
                                        {/* Animated gradient background */}
                                        <div
                                            className="absolute inset-0"
                                            style={{
                                                background: `linear-gradient(135deg, 
                                                    rgba(175, 12, 21, 0.08) 0%, 
                                                    rgba(175, 12, 21, 0.15) 30%, 
                                                    rgba(140, 10, 17, 0.08) 60%, 
                                                    rgba(175, 12, 21, 0.12) 100%)`,
                                                animation: 'shimmerPreview 3s ease-in-out infinite',
                                            }}
                                        />

                                        {/* Fake UI skeleton — mimics a course interface */}
                                        <div className="absolute inset-0 p-3 sm:p-4 flex flex-col gap-2">
                                            {/* Top bar skeleton */}
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-shibl-crimson/20" />
                                                <div className="h-2.5 w-24 rounded-full bg-charcoal/10" />
                                                <div className="flex-1" />
                                                <div className="h-2.5 w-12 rounded-full bg-charcoal/8" />
                                            </div>

                                            {/* Content area */}
                                            <div className="flex-1 flex gap-2 mt-1">
                                                {/* Sidebar */}
                                                <div className="w-1/4 flex flex-col gap-1.5">
                                                    {[1, 2, 3, 4].map((i) => (
                                                        <div
                                                            key={i}
                                                            className={`h-2 rounded-full ${i === 2 ? 'bg-shibl-crimson/20 w-full' : 'bg-charcoal/8 w-4/5'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>

                                                {/* Main content placeholder */}
                                                <div className="flex-1 rounded-xl bg-white/40 flex items-center justify-center">
                                                    <motion.div
                                                        initial={{ scale: 0.8, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        transition={{ delay: 0.3, duration: 0.4 }}
                                                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-shibl-crimson/15 flex items-center justify-center"
                                                    >
                                                        <Play size={18} className="text-shibl-crimson/60 ml-0.5" />
                                                    </motion.div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Shimmer sweep */}
                                        <div
                                            className="absolute inset-0 pointer-events-none"
                                            style={{
                                                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                                                backgroundSize: '200% 100%',
                                                animation: 'shimmerSweep 2.5s ease-in-out infinite',
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
