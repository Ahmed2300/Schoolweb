import { useState } from 'react';

/**
 * BentoQuizCard — "اختبارات ذكية"
 *
 * Displays a real quiz interface screenshot with hover zoom effect.
 */
export const BentoQuizCard = () => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative h-full group"
        >
            <div className="relative z-10 p-5 sm:p-6 md:p-8 h-full flex flex-col">
                <h3 className="text-lg sm:text-xl font-bold text-charcoal dark:text-white mb-2">اختبارات ذكية</h3>
                <p className="text-slate-grey dark:text-slate-300 text-sm mb-4 leading-relaxed">
                    اختبارات MCQ مع تصحيح تلقائي وتقييم فوري
                </p>

                {/* Quiz image */}
                <div className="flex-1 flex items-center justify-center mt-auto">
                    <div className="relative w-full rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-500">
                        <picture>
                            <source srcSet="/images/smart-quiz.webp" type="image/webp" />
                            <img
                                src="/images/smart-quiz.png"
                                alt="اختبارات ذكية - اختبارات MCQ مع تصحيح تلقائي"
                                className="w-full h-full object-cover rounded-2xl transition-transform duration-700 ease-out"
                                style={{
                                    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                                }}
                                loading="lazy"
                                decoding="async"
                            />
                        </picture>
                    </div>
                </div>
            </div>
        </div>
    );
};
