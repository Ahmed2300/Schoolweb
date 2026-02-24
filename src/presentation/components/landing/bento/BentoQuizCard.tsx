import { useState } from 'react';
import { Star, Check } from 'lucide-react';

const OPTIONS = [
    { id: 'a', text: 'الجواب الأول', correct: false },
    { id: 'b', text: 'الجواب الثاني', correct: true },
    { id: 'c', text: 'الجواب الثالث', correct: false },
    { id: 'd', text: 'الجواب الرابع', correct: false },
];

/**
 * BentoQuizCard — "اختبارات ذكية"
 *
 * Glowing MCQ interface. Hover over the correct option → green glow
 * and "+10 نقاط" badge slides up. Wrong options get a subtle red pulse.
 */
export const BentoQuizCard = () => {
    const [hoveredOption, setHoveredOption] = useState<string | null>(null);
    const isCorrectHovered = hoveredOption === 'b';

    return (
        <div className="relative h-full group">
            <div className="relative z-10 p-5 sm:p-6 md:p-8 h-full flex flex-col">
                <h3 className="text-lg sm:text-xl font-bold text-charcoal dark:text-white mb-2">اختبارات ذكية</h3>
                <p className="text-slate-grey dark:text-slate-300 text-sm mb-5 leading-relaxed">
                    اختبارات MCQ مع تصحيح تلقائي وتقييم فوري
                </p>

                {/* Quiz mockup */}
                <div className="flex-1 flex flex-col mt-auto">
                    {/* Question */}
                    <div className="mb-3 px-3 py-2 rounded-xl bg-soft-cloud dark:bg-white/5 border border-slate-200 dark:border-white/10">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-shibl-crimson text-xs font-bold">سؤال 3/10</span>
                            <div className="h-1 flex-1 rounded-full bg-slate-200 dark:bg-slate-700">
                                <div className="h-full w-[30%] rounded-full bg-shibl-crimson/60" />
                            </div>
                        </div>
                        <p className="text-charcoal dark:text-white text-xs sm:text-sm">ما هو الناتج الصحيح للعملية التالية؟</p>
                    </div>

                    {/* Options */}
                    <div className="flex flex-col gap-2 relative">
                        {OPTIONS.map((opt) => {
                            const isThis = hoveredOption === opt.id;
                            const isCorrect = opt.correct;

                            return (
                                <div
                                    key={opt.id}
                                    onMouseEnter={() => setHoveredOption(opt.id)}
                                    onMouseLeave={() => setHoveredOption(null)}
                                    className={`
                                        px-3 py-2 rounded-xl border text-xs sm:text-sm cursor-default
                                        transition-all duration-300 flex items-center gap-2
                                        ${isThis && isCorrect
                                            ? 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-400 dark:border-emerald-500/50 text-emerald-700 dark:text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.12)]'
                                            : isThis && !isCorrect
                                                ? 'bg-red-50 dark:bg-red-900/40 border-red-300 dark:border-red-500/50 text-red-600 dark:text-red-400'
                                                : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20'
                                        }
                                    `}
                                >
                                    <span className={`
                                        w-5 h-5 rounded-full border text-[10px] flex items-center justify-center font-bold shrink-0
                                        ${isThis && isCorrect
                                            ? 'border-emerald-500 bg-emerald-100 dark:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                                            : isThis && !isCorrect
                                                ? 'border-red-400 bg-red-100 dark:bg-red-500/30 text-red-600 dark:text-red-300'
                                                : 'border-slate-300 dark:border-white/20 text-slate-400 dark:text-slate-500'
                                        }
                                    `}>
                                        {opt.id.toUpperCase()}
                                    </span>
                                    <span>{opt.text}</span>

                                    {/* Checkmark for correct */}
                                    {isThis && isCorrect && (
                                        <Check size={16} className="mr-auto text-emerald-500" />
                                    )}
                                </div>
                            );
                        })}

                        {/* +10 Points badge */}
                        <div
                            className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-500/50 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-all duration-500 pointer-events-none shadow-sm flex items-center gap-1"
                            style={{
                                opacity: isCorrectHovered ? 1 : 0,
                                transform: isCorrectHovered
                                    ? 'translate(-50%, -100%) scale(1)'
                                    : 'translate(-50%, -50%) scale(0.7)',
                            }}
                        >
                            <span>+10 نقاط</span>
                            <Star size={12} className="fill-emerald-600 dark:fill-emerald-400" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
