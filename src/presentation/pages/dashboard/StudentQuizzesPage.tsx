import { useState, useEffect } from 'react';
import { FileQuestion, Clock, CheckCircle2, AlertCircle, Loader2, HourglassIcon, RefreshCw } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { QuizPlayer } from '../../components/student/quiz/QuizPlayer';
import { QuizSkeleton } from '../../components/ui/skeletons/QuizSkeleton';
import { studentQuizService, QuizAttemptSummary } from '../../../data/api/studentQuizService';
import { getLocalizedName } from '../../../data/api/studentService';

export function StudentQuizzesPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [attempts, setAttempts] = useState<QuizAttemptSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            fetchAttempts();
        }
    }, [id]);

    const fetchAttempts = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await studentQuizService.getMyAttempts();
            setAttempts(data);
        } catch (err) {
            console.error('Failed to fetch attempts:', err);
            setError('فشل في تحميل سجل الاختبارات. يرجى المحاولة مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    // If ID is present, show Quiz Player
    if (id) {
        return (
            <div className="fixed inset-0 z-[100] bg-[#FDFDFD] overflow-y-auto">
                <QuizPlayer quizId={id} onExit={() => navigate(-1)} />
            </div>
        );
    }

    const getStatusBadge = (status: QuizAttemptSummary['status']) => {
        switch (status) {
            case 'pending_grading':
                return (
                    <span className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                        <HourglassIcon size={14} />
                        قيد التصحيح
                    </span>
                );
            case 'passed':
                return (
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                        <CheckCircle2 size={14} />
                        ناجح
                    </span>
                );
            case 'failed':
                return (
                    <span className="bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                        <AlertCircle size={14} />
                        راسب
                    </span>
                );
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return dateString;
        }
    };

    const getScorePercentage = (attempt: QuizAttemptSummary) => {
        if (attempt.score === null || attempt.total_possible_score === 0) return 0;
        return Math.round((attempt.score / attempt.total_possible_score) * 100);
    };

    const getScoreColor = (attempt: QuizAttemptSummary) => {
        if (attempt.status === 'pending_grading') return 'text-amber-600';
        if (attempt.status === 'passed') return 'text-emerald-600';
        return 'text-red-600';
    };

    if (loading) {
        return (
            <div className="grid gap-5">
                {Array.from({ length: 3 }).map((_, i) => (
                    <QuizSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 p-6">
                <AlertCircle className="w-16 h-16 text-red-400" />
                <p className="text-red-600 font-medium text-center">{error}</p>
                <button
                    onClick={fetchAttempts}
                    className="flex items-center gap-2 px-6 py-2.5 bg-shibl-crimson text-white rounded-xl font-bold hover:bg-red-800 transition-all shadow-md"
                >
                    <RefreshCw size={16} />
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 md:p-10 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-10">
                <div>
                    <h1 className="text-xl sm:text-3xl font-extrabold text-charcoal flex items-center gap-3 sm:gap-4 mb-1 sm:mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-shibl-crimson to-red-700 rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/10 rotate-3 transition-transform hover:rotate-6">
                            <FileQuestion className="text-white" size={24} />
                        </div>
                        سجل الاختبارات
                    </h1>
                    <p className="text-sm sm:text-base text-slate-500 font-medium mr-0 sm:mr-[4.5rem]">تتبع تقدمك ونتائج اختباراتك السابقة</p>
                </div>
                <button
                    onClick={fetchAttempts}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    <span>تحديث القائمة</span>
                </button>
            </div>

            {attempts.length === 0 ? (
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-16 text-center animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FileQuestion className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-700 mb-2">لا توجد اختبارات مكتملة بعد</h3>
                    <p className="text-slate-400 max-w-xs mx-auto">عندما تكمل الاختبارات، ستظهر نتائجك هنا للمراجعة والتحليل.</p>
                </div>
            ) : (
                <div className="grid gap-5 animate-in slide-in-from-bottom-4 duration-700 stagger-100">
                    {attempts.map((attempt, index) => (
                        <div
                            key={attempt.id}
                            className="bg-white rounded-2xl sm:rounded-[1.5rem] p-4 sm:p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:scale-[1.01] hover:border-slate-200 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                            onClick={() => navigate(`/dashboard/quizzes/${attempt.quiz_id}`)}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Decorative gradient blob */}
                            <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-opacity group-hover:opacity-10 
                                ${attempt.status === 'passed' ? 'bg-emerald-500' : attempt.status === 'failed' ? 'bg-red-500' : 'bg-amber-500'}`}>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 relative z-10">
                                {/* Quiz Info */}
                                <div className="flex items-center gap-3 sm:gap-5 flex-1 min-w-0">
                                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-lg sm:text-xl shrink-0 shadow-inner
                                        ${attempt.status === 'passed' ? 'bg-emerald-50 text-emerald-600' :
                                            attempt.status === 'failed' ? 'bg-red-50 text-red-600' :
                                                'bg-amber-50 text-amber-600'
                                        }`}>
                                        {getScorePercentage(attempt)}<span className="text-xs opacity-60 font-bold">%</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h3 className="font-bold text-slate-800 text-base sm:text-lg group-hover:text-shibl-crimson transition-colors truncate">
                                            {getLocalizedName(attempt.quiz_title)}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <span className="max-w-[200px] truncate block px-2 py-0.5 bg-slate-100 rounded-md">
                                                {attempt.course_name ? getLocalizedName(attempt.course_name) : 'عام'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats & Date */}
                                <div className="flex items-center gap-4 sm:gap-8 md:gap-12 flex-wrap">
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">تاريخ الإتمام</p>
                                        <div className="flex items-center gap-1.5 text-slate-600 font-bold">
                                            <Clock size={14} className="text-slate-400" />
                                            {formatDate(attempt.completed_at)}
                                        </div>
                                    </div>

                                    <div className="text-right pl-4 border-l border-slate-100">
                                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">الدرجة</p>
                                        <p className={`text-xl font-black ${getScoreColor(attempt)}`}>
                                            {attempt.score !== null ? (
                                                <>{attempt.score}<span className="text-sm text-slate-400 font-bold">/{attempt.total_possible_score}</span></>
                                            ) : (
                                                <span className="text-amber-500 text-base font-bold">---</span>
                                            )}
                                        </p>
                                    </div>

                                    <div className="min-w-[100px] flex justify-end">
                                        {getStatusBadge(attempt.status)}
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-5 relative">
                                <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1.5 px-1">
                                    <span>معدل النجاح: {attempt.passing_percentage}%</span>
                                    <span>النتيجة: {getScorePercentage(attempt)}%</span>
                                </div>
                                <div className="bg-slate-100 rounded-full h-2.5 overflow-hidden ring-1 ring-slate-100">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ease-out ${attempt.status === 'passed' ? 'bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.3)]' :
                                            attempt.status === 'failed' ? 'bg-gradient-to-r from-red-400 to-red-600 shadow-[0_0_10px_rgba(239,68,68,0.3)]' :
                                                'bg-gradient-to-r from-amber-400 to-amber-600'
                                            }`}
                                        style={{ width: `${getScorePercentage(attempt)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
