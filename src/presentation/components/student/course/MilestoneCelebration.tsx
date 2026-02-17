import { useEffect, useState, useCallback } from 'react';
import { Trophy, Sparkles, PartyPopper, ChevronLeft } from 'lucide-react';
import { getLocalizedName } from '../../../../data/api/studentService';

export type MilestoneType = 'unit' | 'course';

export interface MilestoneData {
    type: MilestoneType;
    title: string;           // Unit or Course name
    nextUnitTitle?: string;  // Only for unit completion
}

interface MilestoneCelebrationProps {
    milestone: MilestoneData | null;
    onDismiss: () => void;
}

// Simple CSS confetti ✨ — no external dependency
function ConfettiParticles() {
    const colors = ['#f59e0b', '#ef4444', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#14b8a6'];
    const particles = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        color: colors[i % colors.length],
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 1.5}s`,
        duration: `${2 + Math.random() * 2}s`,
        size: `${4 + Math.random() * 6}px`,
        rotation: `${Math.random() * 360}deg`,
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {particles.map(p => (
                <div
                    key={p.id}
                    className="absolute animate-confetti-fall"
                    style={{
                        left: p.left,
                        top: '-10px',
                        width: p.size,
                        height: p.size,
                        backgroundColor: p.color,
                        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                        animationDelay: p.delay,
                        animationDuration: p.duration,
                        transform: `rotate(${p.rotation})`,
                    }}
                />
            ))}
        </div>
    );
}

export function MilestoneCelebration({ milestone, onDismiss }: MilestoneCelebrationProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        if (milestone) {
            // Small delay so animation starts after mount
            const timer = setTimeout(() => setIsVisible(true), 50);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [milestone]);

    const handleDismiss = useCallback(() => {
        setIsLeaving(true);
        setTimeout(() => {
            setIsLeaving(false);
            setIsVisible(false);
            onDismiss();
        }, 300);
    }, [onDismiss]);

    // Auto-dismiss after 8 seconds
    useEffect(() => {
        if (!milestone) return;
        const timer = setTimeout(handleDismiss, 8000);
        return () => clearTimeout(timer);
    }, [milestone, handleDismiss]);

    if (!milestone) return null;

    const isCourseComplete = milestone.type === 'course';

    return (
        <div
            className={`
                fixed inset-0 z-[9999] flex items-center justify-center p-4
                transition-all duration-300 ease-out
                ${isVisible && !isLeaving ? 'opacity-100' : 'opacity-0 pointer-events-none'}
            `}
            onClick={handleDismiss}
        >
            {/* Backdrop */}
            <div className={`
                absolute inset-0 transition-all duration-500
                ${isCourseComplete
                    ? 'bg-gradient-to-br from-amber-900/80 via-amber-800/70 to-yellow-900/80 backdrop-blur-md'
                    : 'bg-slate-900/60 backdrop-blur-sm'
                }
            `} />

            {/* Confetti */}
            <ConfettiParticles />

            {/* Card */}
            <div
                className={`
                    relative z-10 max-w-md w-full rounded-3xl p-8 text-center
                    transition-all duration-500 ease-out
                    ${isVisible && !isLeaving
                        ? 'scale-100 translate-y-0'
                        : 'scale-90 translate-y-8'
                    }
                    ${isCourseComplete
                        ? 'bg-gradient-to-b from-amber-50 to-white shadow-2xl shadow-amber-200/50 ring-2 ring-amber-200'
                        : 'bg-white shadow-2xl shadow-emerald-200/30 ring-1 ring-emerald-100'
                    }
                `}
                onClick={e => e.stopPropagation()}
            >
                {/* Icon */}
                <div className={`
                    w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center
                    ${isCourseComplete
                        ? 'bg-gradient-to-br from-amber-400 to-yellow-500 shadow-lg shadow-amber-300/50'
                        : 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-300/50'
                    }
                `}>
                    {isCourseComplete
                        ? <Trophy size={36} className="text-white" strokeWidth={2.5} />
                        : <PartyPopper size={36} className="text-white" strokeWidth={2.5} />
                    }
                </div>

                {/* Sparkle decorations */}
                <Sparkles size={18} className={`absolute top-6 right-8 ${isCourseComplete ? 'text-amber-400' : 'text-emerald-400'} animate-pulse`} />
                <Sparkles size={14} className={`absolute top-12 left-10 ${isCourseComplete ? 'text-yellow-400' : 'text-teal-400'} animate-pulse`} style={{ animationDelay: '0.5s' }} />
                <Sparkles size={16} className={`absolute bottom-16 right-12 ${isCourseComplete ? 'text-amber-300' : 'text-emerald-300'} animate-pulse`} style={{ animationDelay: '1s' }} />

                {/* Title */}
                <h2 className={`
                    text-2xl font-black mb-2 leading-tight
                    ${isCourseComplete ? 'text-amber-800' : 'text-slate-800'}
                `}>
                    {isCourseComplete ? '🎉 أحسنت! أكملت الدورة بالكامل!' : '🎉 أحسنت! أكملت الوحدة!'}
                </h2>

                {/* Description */}
                <p className="text-slate-500 font-medium text-sm mb-4 leading-relaxed">
                    {isCourseComplete
                        ? (
                            <>
                                لقد أنهيت بنجاح جميع دروس واختبارات{' '}
                                <span className="font-bold text-amber-700">{getLocalizedName(milestone.title, 'Course')}</span>
                            </>
                        )
                        : (
                            <>
                                أكملت جميع محتويات وحدة{' '}
                                <span className="font-bold text-emerald-700">{getLocalizedName(milestone.title, 'Unit')}</span>
                            </>
                        )
                    }
                </p>

                {/* Next Unit Hint (only for unit completion) */}
                {!isCourseComplete && milestone.nextUnitTitle && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
                        <ChevronLeft size={16} className="text-emerald-500 shrink-0" />
                        <p className="text-xs text-emerald-700 font-bold">
                            تم فتح الوحدة التالية: <span className="text-emerald-900">{getLocalizedName(milestone.nextUnitTitle, 'Unit')}</span>
                        </p>
                    </div>
                )}

                {/* Dismiss Button */}
                <button
                    onClick={handleDismiss}
                    className={`
                        w-full py-3.5 rounded-xl font-bold text-white text-sm
                        transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                        ${isCourseComplete
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 shadow-md shadow-amber-200/50'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-md shadow-emerald-200/50'
                        }
                    `}
                >
                    {isCourseComplete ? 'رائع!' : 'متابعة'}
                </button>
            </div>
        </div>
    );
}
