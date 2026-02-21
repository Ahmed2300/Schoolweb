import { ClipboardCheck, Lock, CheckCircle2, Clock, XCircle, Play, Trophy, ShieldCheck } from 'lucide-react';
import { Quiz } from '../../../../data/api/studentCourseService';
import { useLanguage } from '../../../hooks';
import { getLocalizedName } from '../../../../data/api/studentService';
import { useNavigate } from 'react-router-dom';

interface QuizItemProps {
    quiz: Quiz;
    isSubscribed?: boolean;
    isUnitQuiz?: boolean;
}

export function QuizItem({ quiz, isSubscribed = false, isUnitQuiz = false }: QuizItemProps) {
    const { isRTL } = useLanguage();
    const navigate = useNavigate();

    // Compute completion status from attempts
    const bestAttempt = quiz.attempts?.[0];
    const isCompleted = !!bestAttempt;
    const score = bestAttempt?.score ?? 0;
    const passingPercentage = quiz.passing_percentage ?? 60;
    const isPendingGrading = bestAttempt?.status === 'pending_grading';
    const isPassed = isCompleted && !isPendingGrading && (bestAttempt?.status === 'passed' || score >= passingPercentage);

    const isLocked = !isSubscribed || quiz.is_locked;

    const handleClick = () => {
        if (isLocked) return;
        navigate(`/dashboard/quizzes/${quiz.id}`);
    };

    // Determine status styling
    const getStatusStyle = () => {
        if (!isCompleted) {
            return {
                borderColor: 'border-slate-100 hover:border-purple-200',
                iconBg: 'bg-purple-50',
                iconColor: 'text-purple-600',
            };
        }
        if (isPendingGrading) {
            return {
                borderColor: 'border-amber-100 hover:border-amber-300',
                iconBg: 'bg-amber-50',
                iconColor: 'text-amber-600',
            };
        }
        if (isPassed) {
            return {
                borderColor: 'border-emerald-100 hover:border-emerald-300',
                iconBg: 'bg-emerald-50',
                iconColor: 'text-emerald-600',
            };
        }
        return {
            borderColor: 'border-rose-100 hover:border-rose-300',
            iconBg: 'bg-rose-50',
            iconColor: 'text-rose-600',
        };
    };

    const statusStyle = getStatusStyle();

    // === UNIT QUIZ (Stage Exam) — visually distinct ===
    if (isUnitQuiz) {
        return (
            <div
                onClick={handleClick}
                className={`
                    relative group overflow-hidden
                    rounded-2xl border-2 transition-all duration-300 cursor-pointer
                    ${isLocked
                        ? 'border-slate-200 opacity-70 grayscale-[0.5]'
                        : isCompleted
                            ? (isPassed
                                ? 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-white hover:shadow-lg hover:shadow-emerald-100'
                                : 'border-rose-200 bg-gradient-to-r from-rose-50 to-white hover:shadow-lg')
                            : 'border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50/50 to-white hover:shadow-lg hover:shadow-amber-100 hover:-translate-y-0.5'
                    }
                `}
            >
                {/* Top Banner */}
                <div className={`
                    flex items-center gap-2 px-5 py-2 text-xs font-black tracking-wide
                    ${isLocked
                        ? 'bg-slate-100 text-slate-400'
                        : isCompleted
                            ? (isPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700')
                            : 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800'
                    }
                `}>
                    <ShieldCheck size={14} />
                    <span>اختبار المرحلة — مطلوب للانتقال إلى الوحدة التالية</span>
                </div>

                {/* Main Content */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
                    {/* Icon */}
                    <div className={`
                        w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm
                        ${!isLocked ? 'group-hover:scale-110' : ''} transition-transform
                        ${isLocked
                            ? 'bg-slate-100 text-slate-400'
                            : isCompleted
                                ? (isPassed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600')
                                : 'bg-amber-100 text-amber-600'
                        }
                    `}>
                        {isCompleted
                            ? (isPassed ? <Trophy size={26} className="stroke-[2] w-5 h-5 lg:w-6 lg:h-6" /> : <XCircle size={26} className="stroke-[2] w-5 h-5 lg:w-6 lg:h-6" />)
                            : <Trophy size={26} className="stroke-[2] w-5 h-5 lg:w-6 lg:h-6" />
                        }
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                        <h4 className={`text-base lg:text-lg font-black truncate transition-colors
                            ${isLocked ? 'text-slate-500' : isCompleted
                                ? (isPassed ? 'text-emerald-800' : 'text-rose-800')
                                : 'text-slate-900'
                            }`}>
                            {getLocalizedName(quiz.title, 'Quiz')}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 lg:gap-3 text-xs font-medium mt-1">
                            {quiz.duration_minutes > 0 && (
                                <div className="flex items-center gap-1.5 bg-white/80 text-slate-500 px-2 py-0.5 rounded-md">
                                    <Clock size={12} />
                                    <span>{quiz.duration_minutes} دقيقة</span>
                                </div>
                            )}
                            {quiz.questions_count && (
                                <span className="text-slate-400">{quiz.questions_count} أسئلة</span>
                            )}
                            {isCompleted && !isPendingGrading && (
                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold ${isPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                    {isPassed ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                    <span>{bestAttempt?.percentage !== undefined ? `${bestAttempt.percentage}%` : `${Math.round(score)}%`}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action */}
                    <div className="shrink-0 mt-2 sm:mt-0">
                        {isLocked ? (
                            <div className="flex items-center justify-center gap-2 text-slate-400 bg-slate-50 px-3 py-2 rounded-xl">
                                <Lock size={18} />
                                {!isSubscribed && <span className="text-xs font-bold sm:hidden">للمشتركين</span>}
                            </div>
                        ) : isCompleted ? (
                            <div className={`px-4 py-2 rounded-xl text-xs lg:text-sm font-bold flex items-center justify-center gap-2 w-full sm:w-auto
                                ${isPendingGrading ? 'bg-amber-100 text-amber-700' : (isPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700')}
                            `}>
                                {isPendingGrading ? <Clock size={16} /> : (isPassed ? <CheckCircle2 size={16} /> : <XCircle size={16} />)}
                                {isPendingGrading ? 'قيد التصحيح' : (isPassed ? 'ناجح' : 'أعِد المحاولة')}
                            </div>
                        ) : (
                            <button className="px-5 py-2.5 rounded-xl text-xs lg:text-sm font-black flex items-center justify-center gap-2 bg-amber-500 text-white hover:bg-amber-600 transition-all shadow-md shadow-amber-200 w-full sm:w-auto">
                                <Play size={14} />
                                ابدأ الاختبار
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // === REGULAR QUIZ (lecture-level) — original design ===
    return (
        <div
            onClick={handleClick}
            className={`
                relative group
                flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 lg:p-5
                bg-white border ${statusStyle.borderColor} rounded-2xl
                hover:shadow-md ${!isLocked ? 'hover:-translate-y-0.5' : ''}
                transition-all duration-300 cursor-pointer
                ${isLocked ? 'opacity-70 grayscale-[0.5]' : ''}
            `}
        >
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto mb-2 sm:mb-0">
                {/* Icon Container */}
                <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl ${statusStyle.iconBg} ${statusStyle.iconColor} flex items-center justify-center shrink-0 ${!isLocked ? 'group-hover:scale-110' : ''} transition-transform shadow-sm`}>
                    {isCompleted ? (
                        isPendingGrading ? <Clock size={20} className="stroke-[2.5] lg:w-[22px] lg:h-[22px]" /> :
                            (isPassed ? <CheckCircle2 size={20} className="stroke-[2.5] lg:w-[22px] lg:h-[22px]" /> : <XCircle size={20} className="stroke-[2.5] lg:w-[22px] lg:h-[22px]" />)
                    ) : (
                        <ClipboardCheck size={20} className="stroke-[2.5] lg:w-[22px] lg:h-[22px]" />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className={`text-sm lg:text-base font-bold truncate transition-colors ${!isLocked && isCompleted
                            ? (isPendingGrading ? 'text-amber-800 group-hover:text-amber-600' : (isPassed ? 'text-emerald-800 group-hover:text-emerald-600' : 'text-rose-800 group-hover:text-rose-600'))
                            : 'text-slate-800'
                            }`}>
                            {getLocalizedName(quiz.title, 'Quiz')}
                        </h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:gap-3 text-xs font-medium">
                        {quiz.duration_minutes > 0 && (
                            <div className="flex items-center gap-1.5 bg-slate-50 text-slate-500 px-2 py-0.5 rounded-md">
                                <Clock size={12} />
                                <span>{quiz.duration_minutes} دقيقة</span>
                            </div>
                        )}
                        {quiz.questions_count && (
                            <span className="text-slate-400">{quiz.questions_count} أسئلة</span>
                        )}

                        {/* Completion Status (Hidden if pending grading, shown if passed/failed) */}
                        {isCompleted && !isPendingGrading && (
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold ${isPassed
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-rose-100 text-rose-700'
                                }`}>
                                {isPassed ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                <span>{bestAttempt?.percentage !== undefined ? `${bestAttempt.percentage}%` : `${Math.round(score)}%`}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Action / State */}
            <div className="shrink-0 flex items-center sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                {isLocked ? (
                    <div className="flex items-center justify-center gap-2 text-slate-400 bg-slate-50 px-3 py-2 rounded-xl w-full sm:w-auto">
                        <Lock size={18} />
                        {!isSubscribed && <span className="text-xs font-bold">للمشتركين</span>}
                    </div>
                ) : isCompleted ? (
                    <div className={`
                        px-4 py-2 rounded-xl text-xs lg:text-sm font-bold flex items-center justify-center gap-2 w-full sm:w-auto
                        ${isPendingGrading
                            ? 'bg-amber-100 text-amber-700'
                            : (isPassed
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-rose-100 text-rose-700')
                        }
                    `}>
                        {isPendingGrading ? <Clock size={16} /> : (isPassed ? <CheckCircle2 size={16} /> : <XCircle size={16} />)}
                        {isPendingGrading ? 'قيد التصحيح' : (isPassed ? 'ناجح' : 'راسب')}
                    </div>
                ) : (
                    <button className={`
                        px-4 py-2 rounded-xl text-xs lg:text-sm font-bold flex items-center justify-center gap-2 w-full sm:w-auto
                        bg-purple-50 text-purple-600
                        group-hover:bg-purple-600 group-hover:text-white
                        transition-all shadow-sm
                    `}>
                        <Play size={14} />
                        ابدأ
                    </button>
                )}
            </div>
        </div>
    );
}
