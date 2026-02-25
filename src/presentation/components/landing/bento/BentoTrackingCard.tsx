import { useRef, useCallback, useState } from 'react';

/**
 * BentoTrackingCard — "متابعة دقيقة"
 *
 * Displays a real tracking dashboard screenshot with 3D tilt on hover.
 */
export const BentoTrackingCard = () => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
        setTilt({ x, y });
    }, []);

    const handleMouseLeave = useCallback(() => setTilt({ x: 0, y: 0 }), []);

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative h-full group"
            style={{
                transform: `perspective(600px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
                transition: 'transform 0.3s ease-out',
            }}
        >
            <div className="relative z-10 p-5 sm:p-6 md:p-8 h-full flex flex-col">
                <h3 className="text-lg sm:text-xl font-bold text-charcoal dark:text-white mb-2">متابعة دقيقة</h3>
                <p className="text-slate-grey dark:text-slate-300 text-sm mb-4 leading-relaxed">
                    تقارير مفصلة لأولياء الأمور عن تقدم الأبناء
                </p>

                {/* Tracking dashboard image */}
                <div className="flex-1 flex items-center justify-center mt-auto">
                    <div className="relative w-full rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-500">
                        <img
                            src="/images/tracking-dashboard.png"
                            alt="متابعة دقيقة - تقارير تقدم الطلاب"
                            className="w-full h-full object-cover rounded-2xl transition-transform duration-700 ease-out group-hover:scale-105"
                            loading="lazy"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
