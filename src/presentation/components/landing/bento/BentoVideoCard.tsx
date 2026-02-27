import { useRef, useCallback } from 'react';
import { Play } from 'lucide-react';

/**
 * BentoVideoCard — "محتوى فيديو متميز"
 *
 * Displays a real video content screenshot with hover effects.
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
                <h3 className="text-lg sm:text-xl font-bold text-charcoal dark:text-white mb-2">محتوى فيديو متميز</h3>
                <p className="text-slate-grey dark:text-slate-300 text-sm mb-5 leading-relaxed">
                    دروس مسجلة بأعلى جودة مع إمكانية المشاهدة في أي وقت
                </p>

                {/* Video content image */}
                <div className="flex-1 flex items-center justify-center mt-auto">
                    <div className="relative w-full rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-500">
                        <picture>
                            <source srcSet="/images/video-content.webp" type="image/webp" />
                            <img
                                src="/images/video-content.png"
                                alt="محتوى فيديو متميز - دروس مسجلة بأعلى جودة"
                                className="w-full h-full object-cover rounded-2xl transition-transform duration-700 ease-out group-hover:scale-105"
                                loading="lazy"
                                decoding="async"
                            />
                        </picture>

                        {/* Glowing play button overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-white/80 dark:bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center group-hover:bg-shibl-crimson/20 group-hover:border-shibl-crimson/40 group-hover:shadow-[0_0_30px_rgba(175,12,21,0.25)] transition-all duration-500 shadow-md">
                                <Play size={20} className="text-shibl-crimson fill-shibl-crimson/80 ml-0.5" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
