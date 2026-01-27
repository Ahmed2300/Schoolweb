import { useState, useEffect, useRef } from 'react';
import { studentQuizService, QuizDetails, QuizSubmission, QuizResult } from '../../../../data/api/studentQuizService';
import { useLanguage } from '../../../hooks';
import { Loader2, Timer, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, HelpCircle, Trophy, BarChart2, ArrowRight, XCircle } from 'lucide-react';
import { getLocalizedName } from '../../../../data/api/studentService';

interface QuizPlayerProps {
    quizId: number | string;
    onExit: () => void;
}

export function QuizPlayer({ quizId, onExit }: QuizPlayerProps) {
    const { isRTL } = useLanguage();
    const [quiz, setQuiz] = useState<QuizDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Quiz State
    const [hasStarted, setHasStarted] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, any>>({}); // questionId -> answer
    const [timeLeft, setTimeLeft] = useState(0); // in seconds
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<QuizResult | null>(null);

    const timerRef = useRef<any>(null);

    useEffect(() => {
        fetchQuiz();
    }, [quizId]);

    // Timer Logic
    useEffect(() => {
        if (hasStarted && timeLeft > 0 && !result) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        handleAutoSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [hasStarted, timeLeft, result]);

    const fetchQuiz = async () => {
        try {
            setLoading(true);
            const data = await studentQuizService.getQuiz(quizId);
            setQuiz(data);
            setTimeLeft(data.duration_minutes * 60);
        } catch (err) {
            setError('فشل في تحميل الاختبار');
        } finally {
            setLoading(false);
        }
    };

    const handleStart = () => {
        setHasStarted(true);
    };

    const handleAnswerDate = (questionId: number, answer: any) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleSubmit = async () => {
        if (!quiz) return;

        // Prepare payload
        const payload: QuizSubmission = {
            answers: Object.entries(answers).map(([qId, val]) => {
                const question = quiz.questions?.find(q => q.id === Number(qId));
                if (question?.question_type === 'mcq') {
                    return { question_id: Number(qId), selected_option_id: val };
                } else {
                    return { question_id: Number(qId), essay_answer: val };
                }
            })
        };

        setSubmitting(true);
        try {
            const res = await studentQuizService.submitQuiz(quizId, payload);
            if (res.success) {
                setResult(res.data);
                clearInterval(timerRef.current);
            }
        } catch (err) {
            alert('حدث خطأ أثناء تسليم الاختبار');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAutoSubmit = () => {
        handleSubmit();
    };

    if (loading) return (
        <div className="h-full flex items-center justify-center">
            <Loader2 className="animate-spin text-shibl-crimson" size={40} />
        </div>
    );

    if (error || !quiz) return (
        <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <AlertCircle size={48} className="text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">عذراً</h2>
            <p className="text-slate-500 mb-6">{error || 'لم يتم العثور على الاختبار'}</p>
            <button onClick={onExit} className="text-shibl-crimson font-bold hover:underline">العودة</button>
        </div>
    );

    // ================= RESULT VIEW =================
    if (result) {
        const isPassed = result.status === 'passed';
        const percentage = Math.round((result.score / result.total_possible_score) * 100);

        return (
            <div className="max-w-3xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden relative">
                    <div className={`h-32 ${isPassed ? 'bg-emerald-500' : 'bg-red-500'} relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-white/10 opacity-50 patterned-bg"></div>
                        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-white rounded-full p-2 shadow-lg flex items-center justify-center">
                            {isPassed ? <Trophy size={48} className="text-emerald-500" /> : <AlertCircle size={48} className="text-red-500" />}
                        </div>
                    </div>

                    <div className="pt-16 pb-10 px-8 text-center">
                        <h2 className="text-3xl font-black text-slate-800 mb-2">{isPassed ? 'أحسنت! اجتزت الاختبار' : 'للأسف، لم تجتز الاختبار'}</h2>
                        <p className="text-slate-500 font-medium mb-8">
                            {isPassed ? 'إنجاز رائع، استمر في التقدم!' : 'لا تقلق، يمكنك مراجعة الدروس والمحاولة مرة أخرى.'}
                        </p>

                        <div className="flex flex-wrap justify-center gap-4 mb-10">
                            <div className="bg-slate-50 rounded-2xl p-4 min-w-[120px] border border-slate-100">
                                <p className="text-xs text-slate-400 font-bold mb-1">الدرجة النهائية</p>
                                <p className={`text-2xl font-black ${isPassed ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {result.score} <span className="text-sm text-slate-400">/ {result.total_possible_score}</span>
                                </p>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-4 min-w-[120px] border border-slate-100">
                                <p className="text-xs text-slate-400 font-bold mb-1">النسبة المئوية</p>
                                <p className={`text-2xl font-black ${isPassed ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {percentage}%
                                </p>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-4 min-w-[120px] border border-slate-100">
                                <p className="text-xs text-slate-400 font-bold mb-1">الحالة</p>
                                <p className={`text-xl font-black ${isPassed ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {isPassed ? 'ناجح' : 'راسب'}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onExit}
                            className="w-full sm:w-auto px-10 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
                        >
                            العودة للدروس
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ================= START SCREEN =================
    if (!hasStarted) {
        return (
            <div className="max-w-2xl mx-auto p-6 h-full flex items-center">
                <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8 w-full">
                    <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                        <HelpCircle size={32} />
                    </div>

                    <h1 className="text-2xl font-black text-slate-800 mb-2">{getLocalizedName(quiz.title)}</h1>
                    {quiz.description && (
                        <p className="text-slate-500 mb-8 leading-relaxed">{getLocalizedName(quiz.description)}</p>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                            <ClockIcon className="text-slate-400" size={20} />
                            <div>
                                <p className="text-xs text-slate-400 font-bold">المدة الزمنية</p>
                                <p className="font-bold text-slate-700">{quiz.duration_minutes} دقيقة</p>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                            <BarChart2 className="text-slate-400" size={20} />
                            <div>
                                <p className="text-xs text-slate-400 font-bold">عدد الأسئلة</p>
                                <p className="font-bold text-slate-700">{quiz.questions?.length || 0} سؤال</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={onExit}
                            className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                        >
                            إلغاء
                        </button>
                        <button
                            onClick={handleStart}
                            className="flex-[2] py-4 bg-shibl-crimson text-white rounded-xl font-bold hover:bg-red-800 transition-colors shadow-lg shadow-red-900/10 flex items-center justify-center gap-2"
                        >
                            ابدأ الاختبار الآن
                            <ArrowRight className={isRTL ? 'rotate-180' : ''} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ================= ACTIVE QUIZ VIEW =================
    const currentQuestion = quiz.questions?.[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === (quiz.questions?.length || 0) - 1;

    // Timer formatting
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const isTimeLow = timeLeft < 60; // Less than 1 min

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 pb-24 relative min-h-full flex flex-col">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-8 sticky top-0 bg-[#FDFDFD] z-10 py-4 border-b border-slate-100">
                <div className="flex items-center gap-4">
                    <button onClick={onExit} className="text-slate-400 hover:text-slate-600">
                        <XCircle size={24} />
                    </button>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400">السؤال {currentQuestionIndex + 1} من {quiz.questions?.length}</span>
                        <div className="w-32 h-2 bg-slate-100 rounded-full mt-1 overflow-hidden">
                            <div
                                className="h-full bg-shibl-crimson transition-all duration-300"
                                style={{ width: `${((currentQuestionIndex + 1) / (quiz.questions?.length || 1)) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className={`flex items-center gap-2 font-mono font-bold text-lg px-4 py-2 rounded-xl ${isTimeLow ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-600'}`}>
                    <Timer size={20} />
                    <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
                </div>
            </div>

            {/* Question Area */}
            {currentQuestion && (
                <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-slate-100 flex-1">
                    <div className="mb-8">
                        <span className="inline-block px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold mb-3">
                            {currentQuestion.points} درجات
                        </span>
                        <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-relaxed">
                            {getLocalizedName(currentQuestion.question_text)}
                        </h2>
                    </div>

                    {currentQuestion.question_type === 'mcq' && (
                        <div className="space-y-3">
                            {currentQuestion.options?.map((option) => (
                                <label
                                    key={option.id}
                                    className={`
                                        flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all
                                        ${answers[currentQuestion.id] === option.id
                                            ? 'border-shibl-crimson bg-red-50/30'
                                            : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'}
                                    `}
                                >
                                    <div className="relative flex items-center">
                                        <input
                                            type="radio"
                                            name={`question_${currentQuestion.id}`}
                                            value={option.id}
                                            checked={answers[currentQuestion.id] === option.id}
                                            onChange={() => handleAnswerDate(currentQuestion.id, option.id)}
                                            className="peer sr-only"
                                        />
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${answers[currentQuestion.id] === option.id ? 'border-shibl-crimson' : 'border-slate-300'}`}>
                                            {answers[currentQuestion.id] === option.id && <div className="w-3 h-3 bg-shibl-crimson rounded-full" />}
                                        </div>
                                    </div>
                                    <span className={`flex-1 font-medium ${answers[currentQuestion.id] === option.id ? 'text-shibl-crimson' : 'text-slate-600'}`}>
                                        {getLocalizedName(option.option_text)}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}

                    {currentQuestion.question_type === 'essay' && (
                        <textarea
                            value={answers[currentQuestion.id] || ''}
                            onChange={(e) => handleAnswerDate(currentQuestion.id, e.target.value)}
                            className="w-full h-48 p-4 rounded-xl border-2 border-slate-200 focus:border-shibl-crimson focus:ring-0 resize-none"
                            placeholder="اكتب إجابتك هنا..."
                        ></textarea>
                    )}
                </div>
            )}

            {/* Navigation Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 md:px-10 z-20">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button
                        disabled={currentQuestionIndex === 0}
                        onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-500 disabled:opacity-50 hover:bg-slate-50 transition-colors"
                    >
                        <ChevronRight className={isRTL ? '' : 'rotate-180'} />
                        السابق
                    </button>

                    {isLastQuestion ? (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex items-center gap-2 px-8 py-3 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-70"
                        >
                            {submitting ? 'جاري التسليم...' : 'تسليم الاختبار'}
                            <CheckCircle2 size={20} />
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                            className="flex items-center gap-2 px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-lg shadow-slate-900/20"
                        >
                            التالي
                            <ChevronLeft className={isRTL ? '' : 'rotate-180'} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// Renamed to avoid conflicts, though lucide-react exports Timer
function ClockIcon({ size, className }: { size: number, className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
    )
}
