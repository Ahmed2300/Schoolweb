import { useRef, useCallback, useState, useEffect } from 'react';
import { Mic, Video, MessageCircle, Hand, Phone, ThumbsUp, Sparkles } from 'lucide-react';

const AVATARS = [
    { id: 1, initials: 'أ', color: 'bg-blue-500', depth: 0.6 },
    { id: 2, initials: 'م', color: 'bg-emerald-500', depth: 0.9 },
    { id: 3, initials: 'ن', color: 'bg-amber-500', depth: 0.4 },
    { id: 4, initials: 'ع', color: 'bg-purple-500', depth: 1.2 },
    { id: 5, initials: 'ي', color: 'bg-pink-500', depth: 0.7 },
];

const CHAT_BUBBLES = [
    { content: <ThumbsUp size={14} className="text-amber-500" />, delay: 0 },
    { content: <span>سؤال ممتاز!</span>, delay: 400 },
    { content: <Sparkles size={14} className="text-pink-500" />, delay: 800 },
];

/**
 * BentoLiveCard — "حصص مباشرة تفاعلية"
 *
 * Stylized video call UI with overlapping avatars and control bar.
 * On hover: avatars float apart (parallax), animated chat bubbles pop up.
 */
export const BentoLiveCard = () => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
    const [visibleBubbles, setVisibleBubbles] = useState<number[]>([]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        setMouseOffset({ x, y });
    }, []);

    // Show chat bubbles sequentially on hover
    useEffect(() => {
        if (!isHovered) {
            setVisibleBubbles([]);
            return;
        }
        const timers: ReturnType<typeof setTimeout>[] = [];
        CHAT_BUBBLES.forEach((bubble, i) => {
            timers.push(setTimeout(() => {
                setVisibleBubbles(prev => [...prev, i]);
            }, bubble.delay + 300));
        });
        return () => timers.forEach(clearTimeout);
    }, [isHovered]);

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => { setIsHovered(false); setMouseOffset({ x: 0, y: 0 }); }}
            className="relative h-full group"
        >
            <div className="relative z-10 p-5 sm:p-6 md:p-8 h-full flex flex-col">
                <h3 className="text-lg sm:text-xl font-bold text-charcoal dark:text-white mb-2">حصص مباشرة تفاعلية</h3>
                <p className="text-slate-grey dark:text-slate-300 text-sm mb-5 leading-relaxed">
                    تواصل مباشر مع المعلمين عبر حصص لايف
                </p>

                {/* Call UI mockup */}
                <div className="flex-1 flex flex-col items-center justify-center gap-4 mt-auto relative">
                    {/* LIVE badge */}
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 self-start">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-red-600 text-xs font-bold uppercase tracking-wider">Live</span>
                    </div>

                    {/* Overlapping avatars with parallax */}
                    <div className="flex items-center -space-x-3 rtl:space-x-reverse">
                        {AVATARS.map((avatar) => (
                            <div
                                key={avatar.id}
                                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${avatar.color} border-2 border-white dark:border-charcoal flex items-center justify-center text-white text-sm font-bold shadow-md transition-transform duration-500 ease-out`}
                                style={{
                                    transform: isHovered
                                        ? `translate(${mouseOffset.x * avatar.depth * 20}px, ${mouseOffset.y * avatar.depth * 15}px)`
                                        : 'translate(0, 0)',
                                    zIndex: avatar.id,
                                }}
                            >
                                {avatar.initials}
                            </div>
                        ))}
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-charcoal flex items-center justify-center text-slate-500 dark:text-slate-300 text-xs font-bold shadow-sm">
                            +12
                        </div>
                    </div>

                    {/* Control bar */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm">
                        {[
                            <Mic key="mic" size={14} />,
                            <Video key="video" size={14} />,
                            <MessageCircle key="chat" size={14} />,
                            <Hand key="hand" size={14} />
                        ].map((icon, i) => (
                            <div
                                key={i}
                                className="w-7 h-7 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-xs hover:bg-slate-100 dark:hover:bg-white/20 transition-colors cursor-default shadow-sm text-charcoal dark:text-white"
                            >
                                {icon}
                            </div>
                        ))}
                        <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-xs cursor-default text-red-600 dark:text-red-400">
                            <Phone size={14} className="fill-current" />
                        </div>
                    </div>

                    {/* Animated chat bubbles */}
                    <div className="absolute bottom-0 right-2 flex flex-col gap-1.5 items-end">
                        {CHAT_BUBBLES.map((bubble, i) => (
                            <div
                                key={i}
                                className="px-2.5 py-1 rounded-xl bg-white dark:bg-charcoal border border-slate-200 dark:border-white/20 text-charcoal dark:text-white text-xs font-medium shadow-sm transition-all duration-500"
                                style={{
                                    opacity: visibleBubbles.includes(i) ? 1 : 0,
                                    transform: visibleBubbles.includes(i)
                                        ? 'translateY(0) scale(1)'
                                        : 'translateY(10px) scale(0.8)',
                                }}
                            >
                                {bubble.content}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
