import { useRef, useEffect, useState, useCallback } from 'react';

const CHART_POINTS = [20, 35, 25, 50, 45, 65, 55, 75, 70, 90];

/**
 * BentoTrackingCard — "متابعة دقيقة"
 *
 * Dashboard widget with:
 * - Circular SVG progress ring (animates 0→90% on scroll into view)
 * - Mini line chart that "draws" itself via stroke-dasharray
 * - 3D tilt on hover
 */
export const BentoTrackingCard = () => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });

    // Intersection Observer for scroll-trigger
    useEffect(() => {
        const el = cardRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.4 },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // 3D tilt on hover
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
        setTilt({ x, y });
    }, []);

    const handleMouseLeave = useCallback(() => setTilt({ x: 0, y: 0 }), []);

    // SVG progress ring calculations
    const RADIUS = 40;
    const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
    const PROGRESS = 0.9;
    const progressOffset = inView ? CIRCUMFERENCE * (1 - PROGRESS) : CIRCUMFERENCE;

    // Line chart path
    const chartWidth = 200;
    const chartHeight = 60;
    const stepX = chartWidth / (CHART_POINTS.length - 1);
    const points = CHART_POINTS.map(
        (val, i) => `${i * stepX},${chartHeight - (val / 100) * chartHeight}`,
    ).join(' ');
    const polylineLength = 600;

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
                <p className="text-slate-grey dark:text-slate-300 text-sm mb-5 leading-relaxed">
                    تقارير مفصلة لأولياء الأمور عن تقدم الأبناء
                </p>

                {/* Dashboard widgets */}
                <div className="flex-1 flex items-center justify-center gap-4 sm:gap-6 mt-auto">
                    {/* Circular progress ring */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0">
                        <svg
                            viewBox="0 0 100 100"
                            className="w-full h-full -rotate-90"
                        >
                            {/* Track */}
                            <circle
                                cx="50"
                                cy="50"
                                r={RADIUS}
                                fill="none"
                                stroke="currentColor"
                                className="text-slate-200 dark:text-slate-700"
                                strokeWidth="8"
                            />
                            {/* Progress */}
                            <circle
                                cx="50"
                                cy="50"
                                r={RADIUS}
                                fill="none"
                                stroke="url(#progressGradient)"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={CIRCUMFERENCE}
                                strokeDashoffset={progressOffset}
                                className="transition-all duration-[2000ms] ease-out"
                            />
                            <defs>
                                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#af0c15" />
                                    <stop offset="100%" stopColor="#10b981" />
                                </linearGradient>
                            </defs>
                        </svg>
                        {/* Center text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xl sm:text-2xl font-bold text-charcoal dark:text-white transition-all duration-[2000ms]">
                                {inView ? '90%' : '0%'}
                            </span>
                            <span className="text-slate-grey dark:text-slate-400 text-[10px]">التقدم</span>
                        </div>
                    </div>

                    {/* Mini line chart */}
                    <div className="flex-1 min-w-0">
                        <div className="text-slate-grey dark:text-slate-400 text-[10px] mb-1 font-medium">الأداء الأسبوعي</div>
                        <svg
                            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                            className="w-full h-auto"
                            preserveAspectRatio="none"
                        >
                            {/* Grid lines */}
                            {[0, 25, 50, 75, 100].map((v) => (
                                <line
                                    key={v}
                                    x1="0"
                                    y1={chartHeight - (v / 100) * chartHeight}
                                    x2={chartWidth}
                                    y2={chartHeight - (v / 100) * chartHeight}
                                    stroke="currentColor"
                                    className="text-slate-200 dark:text-slate-700"
                                    strokeWidth="0.5"
                                />
                            ))}

                            {/* Area fill */}
                            <polygon
                                points={`0,${chartHeight} ${points} ${chartWidth},${chartHeight}`}
                                fill="url(#areaGradient)"
                                className="transition-opacity duration-[2000ms]"
                                style={{ opacity: inView ? 0.4 : 0 }}
                            />

                            {/* Line */}
                            <polyline
                                points={points}
                                fill="none"
                                stroke="url(#lineGradient)"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeDasharray={polylineLength}
                                strokeDashoffset={inView ? 0 : polylineLength}
                                className="transition-all duration-[2000ms] ease-out"
                            />

                            <defs>
                                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#af0c15" />
                                    <stop offset="100%" stopColor="#10b981" />
                                </linearGradient>
                                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#af0c15" stopOpacity="0.15" />
                                    <stop offset="100%" stopColor="#af0c15" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                        </svg>

                        {/* Stats row */}
                        <div className="flex gap-3 mt-2">
                            {[
                                { label: 'هذا الأسبوع', value: '90%', color: 'text-emerald-600' },
                                { label: 'التحسن', value: '+12%', color: 'text-shibl-crimson' },
                            ].map((stat, i) => (
                                <div key={i}>
                                    <div className="text-slate-400 text-[9px]">{stat.label}</div>
                                    <div className={`${stat.color} text-xs font-bold`}>{stat.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
