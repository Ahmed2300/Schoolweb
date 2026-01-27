import { ClipboardCheck, Lock, CheckCircle2, Clock, XCircle, RotateCw, Play, Eye } from 'lucide-react';
import { Quiz } from '../../../../data/api/studentCourseService';
import { useLanguage } from '../../../hooks';
import { getLocalizedName } from '../../../../data/api/studentService';
import { useNavigate } from 'react-router-dom';

interface QuizItemProps {
    quiz: Quiz;
}

export function QuizItem({ quiz }: QuizItemProps) {
    const { isRTL } = useLanguage();
    const navigate = useNavigate();

    // Compute completion status from attempts
    const bestAttempt = quiz.attempts?.[0];
    const isCompleted = !!bestAttempt;
    const score = bestAttempt?.score ?? 0;
    const passingPercentage = quiz.passing_percentage ?? 60;
    const isPassed = isCompleted && score >= passingPercentage;

    const handleClick = () => {
        if (quiz.is_locked) return;
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

    return (
        <div
            onClick={handleClick}
            className={`
                relative group
                flex items-center gap-4 p-4 lg:p-5
                bg-white border ${statusStyle.borderColor} rounded-2xl
                hover:shadow-md hover:-translate-y-0.5
                transition-all duration-300 cursor-pointer
                ${quiz.is_locked ? 'opacity-60 pointer-events-none grayscale' : ''}
            `}
        >
            {/* Icon Container */}
            <div className={`w-12 h-12 rounded-xl ${statusStyle.iconBg} ${statusStyle.iconColor} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm`}>
                {isCompleted ? (
                    isPassed ? <CheckCircle2 size={22} className="stroke-[2.5]" /> : <XCircle size={22} className="stroke-[2.5]" />
                ) : (
                    <ClipboardCheck size={22} className="stroke-[2.5]" />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h4 className={`text-base font-bold truncate transition-colors ${isCompleted
                        ? (isPassed ? 'text-emerald-800 group-hover:text-emerald-600' : 'text-rose-800 group-hover:text-rose-600')
                        : 'text-slate-800 group-hover:text-purple-700'
                        }`}>
                        {getLocalizedName(quiz.title, 'Quiz')}
                    </h4>
                </div>

                <div className="flex items-center gap-3 text-xs font-medium">
                    {quiz.duration_minutes > 0 && (
                        <div className="flex items-center gap-1.5 bg-slate-50 text-slate-500 px-2 py-0.5 rounded-md">
                            <Clock size={12} />
                            <span>{quiz.duration_minutes} دقيقة</span>
                        </div>
                    )}
                    {quiz.questions_count && (
                        <span className="text-slate-400">{quiz.questions_count} أسئلة</span>
                    )}

                    {/* Completion Status */}
                    {isCompleted && (
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold ${isPassed
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                            }`}>
                            {isPassed ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                            <span>{Math.round(score)}%</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Action / State */}
            <div className="shrink-0 flex items-center gap-3">
                {quiz.is_locked ? (
                    <Lock size={18} className="text-slate-300" />
                ) : isCompleted ? (
                    <button className={`
                        px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2
                        ${isPassed
                            ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'
                            : 'bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white'
                        }
                        transition-all shadow-sm
                    `}>
                        <RotateCw size={14} />
                        {isPassed ? 'إعادة' : 'حاول مجدداً'}
                    </button>
                ) : (
                    <button className={`
                        px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2
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
