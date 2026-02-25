import { useRef, useState } from 'react';

/**
 * BentoLiveCard — "حصص مباشرة تفاعلية"
 *
 * Displays a real live-session screenshot with subtle hover zoom effect.
 */
export const BentoLiveCard = () => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            ref={cardRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative h-full group overflow-hidden"
        >
            <div className="relative z-10 p-5 sm:p-6 md:p-8 h-full flex flex-col">
                <h3 className="text-lg sm:text-xl font-bold text-charcoal dark:text-white mb-2">حصص مباشرة تفاعلية</h3>
                <p className="text-slate-grey dark:text-slate-300 text-sm mb-4 leading-relaxed">
                    تواصل مباشر مع المعلمين عبر حصص لايف
                </p>

                {/* Live session image */}
                <div className="flex-1 flex items-center justify-center mt-auto relative rounded-xl overflow-hidden shadow-lg">
                    <img
                        src="/images/live-session.png"
                        alt="حصة مباشرة تفاعلية مع المعلم والطلاب"
                        className="w-full h-full object-cover rounded-xl transition-transform duration-700 ease-out"
                        style={{
                            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                        }}
                        loading="lazy"
                    />
                    {/* LIVE badge overlay */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 dark:bg-charcoal/90 backdrop-blur-sm border border-red-200 dark:border-red-800 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider">Live</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
