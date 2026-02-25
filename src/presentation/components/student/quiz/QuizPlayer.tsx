import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentQuizService, QuizDetails, QuizSubmission, QuizResult, CompletedQuizAttempt, QuizReviewQuestion, NextSyllabusItem } from '../../../../data/api/studentQuizService';
import { useLanguage } from '../../../hooks';
import { Loader2, Timer, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, HelpCircle, Trophy, BarChart2, ArrowRight, XCircle, Eye, Clock, Award, BookOpen, PlayCircle, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { getLocalizedName } from '../../../../data/api/studentService';

interface QuizPlayerProps {
    quizId: number | string;
    onExit: () => void;
}

// Discriminated union for quiz state
type QuizState =
    | { status: 'loading' }
    | { status: 'error'; message: string; isRedirecting?: boolean }
    | { status: 'ready'; quiz: QuizDetails; attemptId: number }
    | { status: 'completed'; quiz: { id: number; name: { ar?: string; en?: string }; course_id?: number }; attempt: CompletedQuizAttempt; nextItem?: NextSyllabusItem | null }
    | { status: 'submitted'; result: QuizResult };

export function QuizPlayer({ quizId, onExit }: QuizPlayerProps) {
    const { isRTL } = useLanguage();
    const navigate = useNavigate();

    // State machine approach for cleaner logic
    const [quizState, setQuizState] = useState<QuizState>({ status: 'loading' });

    // Quiz-taking state (only used when status === 'ready')
    const [hasStarted, setHasStarted] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number | string>>({});
    const [answerImages, setAnswerImages] = useState<Record<number, File | null>>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    // Review mode state
    const [reviewQuestionIndex, setReviewQuestionIndex] = useState(0);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Refs to track latest state for async/event handlers
    const quizStateRef = useRef(quizState);
    const hasStartedRef = useRef(hasStarted);
    const answersRef = useRef(answers);
    const answerImagesRef = useRef(answerImages);
    const hasAutoSubmittedRef = useRef(false);

    useEffect(() => { quizStateRef.current = quizState; }, [quizState]);
    useEffect(() => { hasStartedRef.current = hasStarted; }, [hasStarted]);
    useEffect(() => { answersRef.current = answers; }, [answers]);
    useEffect(() => { answerImagesRef.current = answerImages; }, [answerImages]);

    useEffect(() => {
        fetchQuiz();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [quizId]);

    // Timer Logic - only when quiz is in progress
    useEffect(() => {
        if (quizState.status === 'ready' && hasStarted && timeLeft > 0) {
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
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [quizState.status, hasStarted, timeLeft]);

    const fetchQuiz = async () => {
        try {
            setQuizState({ status: 'loading' });
            const response = await studentQuizService.getQuiz(quizId);

            // Check if quiz is already completed (or expired)
            if (response.already_completed && response.attempt) {
                setQuizState({
                    status: 'completed',
                    quiz: response.data as { id: number; name: { ar?: string; en?: string }; course_id?: number },
                    attempt: response.attempt,
                    nextItem: response.next_item || null
                });
            } else {
                // New or resumed quiz - ready to start
                const quizData = response.data as QuizDetails;

                // Calculate remaining time from server started_at
                let remaining = quizData.duration_minutes * 60;
                let isResuming = false;
                if (response.started_at) {
                    const startedAt = new Date(response.started_at).getTime();
                    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
                    remaining = Math.max(0, quizData.duration_minutes * 60 - elapsed);
                    isResuming = elapsed > 5; // Consider it a resume if >5s have passed
                }

                setQuizState({
                    status: 'ready',
                    quiz: quizData,
                    attemptId: response.attempt_id || 0
                });
                setTimeLeft(remaining);

                // Auto-start if resuming an existing attempt
                if (isResuming) {
                    setHasStarted(true);
                }

                // If time already expired, auto-submit immediately
                if (remaining <= 0) {
                    setHasStarted(true);
                    // Delay slightly to allow state to settle
                    setTimeout(() => handleAutoSubmit(), 100);
                }
            }
        } catch (err: any) {
            const responseData = err.response?.data;
            if (responseData?.quiz_unavailable) {
                setQuizState({ status: 'error', message: responseData.message || 'الامتحان غير متاح حالياً أو لم يتم نشره بعد.' });
            } else {
                setQuizState({ status: 'error', message: 'فشل في تحميل الاختبار' });
            }
        }
    };

    const handleStart = () => {
        setHasStarted(true);
    };

    const handleAnswerChange = (questionId: number, answer: number | string, imageFile?: File) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
        if (imageFile !== undefined) {
            setAnswerImages(prev => ({ ...prev, [questionId]: imageFile }));
        }
    };

    const handleSubmit = async () => {
        if (quizState.status !== 'ready') return;
        const { quiz } = quizState;

        const payload: QuizSubmission = {
            answers: Object.entries(answers).map(([qId, val]) => {
                const question = quiz.questions?.find(q => q.id === Number(qId));
                if (question?.question_type === 'mcq') {
                    return { question_id: Number(qId), selected_option_id: val as number };
                } else {
                    return {
                        question_id: Number(qId),
                        essay_answer: val as string,
                        answer_image: answerImages[Number(qId)] || undefined
                    };
                }
            })
        };

        setSubmitting(true);
        try {
            const res = await studentQuizService.submitQuiz(quizId, payload);
            if (res.success) {
                if (timerRef.current) clearInterval(timerRef.current);
                hasAutoSubmittedRef.current = true; // Prevent unmount auto-submit
                setQuizState({ status: 'submitted', result: res.data });
            }
        } catch (err: any) {
            console.error(err);
            const errorMessage = err.response?.data?.message || err.message;
            if (errorMessage === 'You have already submitted this quiz.' || err.response?.status === 403) {
                // Show "Already Submitted" Dialogue
                // We'll revert to loading then fetchQuiz to show the result
                if (timerRef.current) clearInterval(timerRef.current);

                // Small delay to let user see the button state or we could show a modal
                // For "cool dialogue", let's use a temporary error state that looks nice
                setQuizState({
                    status: 'error',
                    message: 'عذراً، لقد قمت بتسليم هذا الاختبار مسبقاً! سيتم توجيهك للنتائج...',
                    isRedirecting: true
                });

                setTimeout(() => {
                    fetchQuiz();
                }, 3000); // 3 seconds delay to read message
            } else {
                alert('حدث خطأ أثناء تسليم الاختبار: ' + errorMessage);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleAutoSubmit = () => {
        handleSubmit();
    };

    // Build submission payload from current answers (for fire-and-forget submit)
    const buildPayload = (): QuizSubmission => {
        const currentAnswers = answersRef.current;
        const currentImages = answerImagesRef.current;
        const state = quizStateRef.current;
        const questions = state.status === 'ready' ? state.quiz.questions : [];

        return {
            answers: Object.entries(currentAnswers).map(([qId, val]) => {
                const question = questions?.find(q => q.id === Number(qId));
                if (question?.question_type === 'mcq') {
                    return { question_id: Number(qId), selected_option_id: val as number };
                } else {
                    return {
                        question_id: Number(qId),
                        essay_answer: val as string,
                        answer_image: currentImages[Number(qId)] || undefined
                    };
                }
            })
        };
    };

    // Auto-submit on component unmount (user navigates away within the app)
    useEffect(() => {
        return () => {
            if (
                quizStateRef.current.status === 'ready' &&
                hasStartedRef.current &&
                !hasAutoSubmittedRef.current
            ) {
                hasAutoSubmittedRef.current = true;
                const payload = buildPayload();
                // Fire-and-forget: submit whatever answers exist
                studentQuizService.submitQuiz(quizId, payload).catch(() => { });
            }
        };
    }, [quizId]);

    // Auto-submit on browser close / tab close / refresh
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (
                quizStateRef.current.status === 'ready' &&
                hasStartedRef.current &&
                !hasAutoSubmittedRef.current
            ) {
                hasAutoSubmittedRef.current = true;
                const payload = buildPayload();
                // Use fetch with keepalive for reliable fire-and-forget with auth headers
                const token = localStorage.getItem('auth_token');
                const hostname = window.location.hostname;
                const protocol = window.location.protocol;
                const baseUrl = import.meta.env.VITE_API_URL || `${protocol}//${hostname}:8000`;
                fetch(`${baseUrl}/api/v1/student/quizzes/${quizId}/submit`, {
                    method: 'POST',
                    keepalive: true,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({ answers: payload.answers }),
                }).catch(() => { });
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [quizId]);


    // ================= LOADING STATE =================
    if (quizState.status === 'loading') {
        return (
            <div className="h-full flex items-center justify-center flex-col gap-4">
                <Loader2 className="animate-spin text-shibl-crimson" size={48} />
                <p className="text-slate-500 font-bold animate-pulse">جاري التحميل...</p>
            </div>
        );
    }

    // ================= ERROR STATE =================
    if (quizState.status === 'error') {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 animate-in zoom-in-95 duration-300">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-2xl ${
                    // @ts-ignore - isRedirecting might not exist on all error types in strict TS if not defined, but we'll add it to type
                    quizState.isRedirecting ? 'bg-amber-50 text-amber-500' : 'bg-red-50 text-red-500'
                    }`}>
                    {/* @ts-ignore */}
                    {quizState.isRedirecting ? <CheckCircle2 size={48} /> : <AlertCircle size={48} />}
                </div>

                <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-3">
                    {/* @ts-ignore */}
                    {quizState.isRedirecting ? 'تم التسليم مسبقاً!' : 'عذراً'}
                </h2>

                <p className="text-slate-500 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                    {quizState.message}
                </p>

                {/* @ts-ignore */}
                {!quizState.isRedirecting && (
                    <button
                        onClick={onExit}
                        className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0"
                    >
                        العودة للصفحة الرئيسية
                    </button>
                )}
            </div>
        );
    }

    // ================= ALREADY COMPLETED - REVIEW MODE =================
    if (quizState.status === 'completed') {
        const { quiz, attempt, nextItem } = quizState;
        const isPassed = attempt.status === 'passed';
        const isPendingGrading = attempt.status === 'pending_grading';
        const percentage = attempt.score !== null ? Math.round((attempt.score / attempt.total_possible_score) * 100) : null;
        const results = attempt.results || [];
        const currentReviewQuestion = results[reviewQuestionIndex];

        // Navigate to next item in syllabus
        const handleContinue = () => {
            if (nextItem) {
                if (nextItem.type === 'lecture') {
                    navigate(`/dashboard/courses/${quiz.course_id}/lecture/${nextItem.id}`);
                } else if (nextItem.type === 'quiz') {
                    navigate(`/dashboard/quizzes/${nextItem.id}`);
                }
            } else {
                // Fallback: go back to course page
                if (quiz.course_id) {
                    navigate(`/dashboard/courses/${quiz.course_id}`);
                } else {
                    onExit();
                }
            }
        };

        return (
            <div className="max-w-5xl mx-auto px-3 py-4 sm:p-4 md:p-8 pb-32 animate-in fade-in slide-in-from-bottom-6 duration-700">
                {/* Header Card with Result Summary */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden mb-8 transform transition-all hover:scale-[1.01] duration-500">
                    <div className={`h-28 sm:h-40 relative overflow-hidden ${isPendingGrading
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                        : isPassed
                            ? 'bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600'
                            : 'bg-gradient-to-br from-red-500 via-red-600 to-rose-700'
                        }`}>
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
                        <div className="absolute inset-0 bg-white/5 opacity-30 patterned-bg"></div>

                        {/* Status Icon Bubble */}
                        <div className="absolute -bottom-10 sm:-bottom-14 left-1/2 -translate-x-1/2 w-20 h-20 sm:w-28 sm:h-28 bg-white rounded-full p-1.5 sm:p-2 shadow-xl shadow-slate-900/5 flex items-center justify-center z-10 ring-4 sm:ring-8 ring-white/20 backdrop-blur-sm">
                            <div className="w-full h-full bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                                {isPendingGrading ? (
                                    <Clock className="text-amber-500 drop-shadow-md w-8 h-8 sm:w-12 sm:h-12" />
                                ) : isPassed ? (
                                    <Trophy className="text-emerald-500 drop-shadow-md w-8 h-8 sm:w-12 sm:h-12" />
                                ) : (
                                    <AlertCircle className="text-red-500 drop-shadow-md w-8 h-8 sm:w-12 sm:h-12" />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-14 sm:pt-20 pb-6 sm:pb-10 px-4 sm:px-8 text-center relative z-0">
                        <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-slate-800 mb-2 tracking-tight">
                            {getLocalizedName(quiz.name)}
                        </h2>
                        <div className="flex items-center justify-center gap-2 mb-8 bg-slate-50 w-fit mx-auto px-4 py-1.5 rounded-full border border-slate-100">
                            <Eye size={16} className="text-slate-400" />
                            <span className="text-sm text-slate-500 font-bold uppercase tracking-wider">مراجعة الإجابات</span>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-8 max-w-2xl mx-auto">
                            <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                                <p className="text-[10px] sm:text-xs text-slate-400 font-bold mb-1 sm:mb-2 uppercase tracking-wider group-hover:text-shibl-crimson transition-colors">الدرجة</p>
                                <div className="flex items-baseline justify-center gap-1">
                                    <p className={`text-xl sm:text-3xl font-black ${isPendingGrading ? 'text-amber-600' : isPassed ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {attempt.score !== null ? attempt.score : '---'}
                                    </p>
                                    <span className="text-sm font-bold text-slate-300">/{attempt.total_possible_score}</span>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                                <p className="text-[10px] sm:text-xs text-slate-400 font-bold mb-1 sm:mb-2 uppercase tracking-wider group-hover:text-shibl-crimson transition-colors">النسبة</p>
                                <p className={`text-xl sm:text-3xl font-black ${isPendingGrading ? 'text-amber-600' : isPassed ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {percentage !== null ? `${percentage}%` : '---'}
                                </p>
                            </div>
                            <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                                <p className="text-[10px] sm:text-xs text-slate-400 font-bold mb-1 sm:mb-2 uppercase tracking-wider group-hover:text-shibl-crimson transition-colors">الحالة</p>
                                <p className={`text-base sm:text-2xl font-black ${isPendingGrading ? 'text-amber-600' : isPassed ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {isPendingGrading ? 'قيد التصحيح' : isPassed ? 'ناجح' : 'راسب'}
                                </p>
                            </div>
                        </div>

                        {isPendingGrading && (
                            <div className="mt-8 mx-auto max-w-lg p-4 bg-amber-50/50 border border-amber-100 rounded-2xl text-sm font-medium text-amber-800 flex items-center justify-center gap-2">
                                <Clock className="animate-pulse" size={18} />
                                النتيجة النهائية ستظهر بعد تصحيح الأسئلة المقالية
                            </div>
                        )}
                    </div>
                </div>

                {/* Question Navigation Pills */}
                <div className="bg-white rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 shadow-xl shadow-slate-200/40 border border-slate-100 mb-6 sm:mb-8 backdrop-blur-xl bg-white/80">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                <BookOpen size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">خريطة الأسئلة</h3>
                                <p className="text-xs text-slate-400 font-bold">اضغط للتنقل بين الأسئلة</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> صحيحة</span>
                            <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg"><div className="w-2 h-2 rounded-full bg-red-500"></div> خاطئة</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2.5">
                        {results.map((q, idx) => (
                            <button
                                key={q.question_id}
                                onClick={() => setReviewQuestionIndex(idx)}
                                className={`
                                    w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm transition-all duration-300 flex items-center justify-center
                                    hover:scale-110 active:scale-95 shadow-sm
                                    ${idx === reviewQuestionIndex
                                        ? 'ring-4 ring-slate-100 z-10 scale-110 shadow-md'
                                        : 'opacity-90 hover:opacity-100'
                                    }
                                    ${q.is_correct === null
                                        ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                        : q.is_correct
                                            ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-200'
                                            : 'bg-gradient-to-br from-red-400 to-red-600 text-white shadow-red-200'
                                    }
                                `}
                                aria-label={`السؤال ${idx + 1}`}
                            >
                                {q.is_correct === null ? idx + 1 : q.is_correct ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Question Review Card */}
                {currentReviewQuestion && (
                    <QuestionReviewCard
                        question={currentReviewQuestion}
                        questionNumber={reviewQuestionIndex + 1}
                        totalQuestions={results.length}
                    />
                )}


                {/* Navigation Footer */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-3 sm:p-4 md:px-10 z-[60]">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <button
                            disabled={reviewQuestionIndex === 0}
                            onClick={() => setReviewQuestionIndex(prev => prev - 1)}
                            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base text-slate-500 disabled:opacity-50 hover:bg-slate-50 transition-colors"
                        >
                            <ChevronRight className={isRTL ? '' : 'rotate-180'} />
                            السابق
                        </button>

                        {reviewQuestionIndex === results.length - 1 ? (
                            <button
                                onClick={handleContinue}
                                className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-bold text-sm sm:text-base transition-all shadow-lg shadow-emerald-500/20"
                            >
                                {nextItem ? (
                                    <>
                                        <PlayCircle size={18} />
                                        {nextItem.type === 'lecture' ? 'الدرس التالي' : 'الاختبار التالي'}
                                    </>
                                ) : (
                                    <>
                                        العودة للدورة
                                        <ArrowRight className={isRTL ? 'rotate-180' : ''} />
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={() => setReviewQuestionIndex(prev => prev + 1)}
                                className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-8 py-2.5 sm:py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm sm:text-base transition-all shadow-lg shadow-slate-900/20"
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

    // ================= RESULT VIEW (after submission) =================
    if (quizState.status === 'submitted') {
        const { result } = quizState;
        const isPassed = result.status === 'passed';
        const isPendingGrading = result.status === 'pending_grading';
        const percentage = result.score !== null ? Math.round((result.score / result.total_possible_score) * 100) : null;

        return (
            <div className="max-w-3xl mx-auto px-3 py-4 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white rounded-2xl sm:rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden relative">
                    <div className={`h-24 sm:h-32 ${isPendingGrading ? 'bg-amber-500' : isPassed ? 'bg-emerald-500' : 'bg-red-500'} relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-white/10 opacity-50 patterned-bg"></div>
                        <div className="absolute -bottom-10 sm:-bottom-12 left-1/2 -translate-x-1/2 w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full p-1.5 sm:p-2 shadow-lg flex items-center justify-center">
                            {isPendingGrading ? (
                                <Clock size={48} className="text-amber-500" />
                            ) : isPassed ? (
                                <Trophy size={48} className="text-emerald-500" />
                            ) : (
                                <AlertCircle size={48} className="text-red-500" />
                            )}
                        </div>
                    </div>

                    <div className="pt-14 sm:pt-16 pb-6 sm:pb-10 px-4 sm:px-8 text-center">
                        <h2 className="text-xl sm:text-3xl font-black text-slate-800 mb-2">
                            {isPendingGrading
                                ? 'تم تسليم الاختبار بنجاح'
                                : isPassed
                                    ? 'أحسنت! اجتزت الاختبار'
                                    : 'للأسف، لم تجتز الاختبار'
                            }
                        </h2>
                        <p className="text-slate-500 font-medium mb-8">
                            {isPendingGrading
                                ? 'النتيجة النهائية ستظهر بعد تصحيح الأسئلة المقالية من قبل المعلم.'
                                : isPassed
                                    ? 'إنجاز رائع، استمر في التقدم!'
                                    : 'لا تقلق، يمكنك مراجعة الدروس.'
                            }
                        </p>

                        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-6 sm:mb-10">
                            <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 min-w-[90px] sm:min-w-[120px] border border-slate-100">
                                <p className="text-xs text-slate-400 font-bold mb-1">الدرجة النهائية</p>
                                <p className={`text-xl sm:text-2xl font-black ${isPendingGrading ? 'text-amber-600' : isPassed ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {result.score !== null ? result.score : '---'} <span className="text-sm text-slate-400">/ {result.total_possible_score}</span>
                                </p>
                            </div>
                            <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 min-w-[90px] sm:min-w-[120px] border border-slate-100">
                                <p className="text-xs text-slate-400 font-bold mb-1">النسبة المئوية</p>
                                <p className={`text-xl sm:text-2xl font-black ${isPendingGrading ? 'text-amber-600' : isPassed ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {percentage !== null ? `${percentage}%` : '---'}
                                </p>
                            </div>
                            <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 min-w-[90px] sm:min-w-[120px] border border-slate-100">
                                <p className="text-xs text-slate-400 font-bold mb-1">الحالة</p>
                                <p className={`text-xl font-black ${isPendingGrading ? 'text-amber-600' : isPassed ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {isPendingGrading ? 'قيد التصحيح' : isPassed ? 'ناجح' : 'راسب'}
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

    // ================= READY STATE - Quiz Taking Flow =================
    const { quiz } = quizState;

    // START SCREEN
    if (!hasStarted) {
        return (
            <div className="max-w-4xl mx-auto p-4 md:p-8 h-full flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500">
                {/* Main Card */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden w-full relative">
                    {/* Background Pattern */}
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-shibl-crimson/5 via-transparent to-shibl-crimson/5"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-shibl-crimson/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                    <div className="relative p-8 md:p-12 text-center">
                        {/* Icon */}
                        <div className="w-20 h-20 bg-gradient-to-br from-shibl-crimson to-red-600 text-white rounded-3xl rotate-3 shadow-xl shadow-red-500/20 flex items-center justify-center mx-auto mb-8 transform hover:rotate-6 transition-transform duration-500">
                            <BookOpen size={40} className="drop-shadow-md" />
                        </div>

                        {/* Title & Description */}
                        <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-800 mb-3 sm:mb-4 tracking-tight leading-tight">
                            {getLocalizedName(quiz.name)}
                        </h1>
                        {quiz.description && (
                            <p className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
                                {getLocalizedName(quiz.description)}
                            </p>
                        )}

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-10 max-w-3xl mx-auto">
                            <div className="bg-slate-50 p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-100 flex flex-col items-center justify-center hover:bg-slate-100 transition-colors group">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-shibl-crimson mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                                    <Clock size={20} />
                                </div>
                                <p className="text-[10px] sm:text-sm text-slate-400 font-bold uppercase tracking-wider mb-1">المدة الزمنية</p>
                                <p className="text-base sm:text-xl font-black text-slate-700">{quiz.duration_minutes} دقيقة</p>
                            </div>

                            <div className="bg-slate-50 p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-100 flex flex-col items-center justify-center hover:bg-slate-100 transition-colors group">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-600 mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                                    <HelpCircle size={20} />
                                </div>
                                <p className="text-[10px] sm:text-sm text-slate-400 font-bold uppercase tracking-wider mb-1">عدد الأسئلة</p>
                                <p className="text-base sm:text-xl font-black text-slate-700">{quiz.questions?.length || 0} سؤال</p>
                            </div>

                            <div className="bg-slate-50 p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-100 flex flex-col items-center justify-center hover:bg-slate-100 transition-colors group">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-emerald-600 mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                                    <Award size={20} />
                                </div>
                                <p className="text-[10px] sm:text-sm text-slate-400 font-bold uppercase tracking-wider mb-1">درجة النجاح</p>
                                <p className="text-base sm:text-xl font-black text-slate-700">{quiz.passing_percentage}%</p>
                            </div>
                        </div>

                        {/* Instructions / Warning */}
                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 text-amber-800 text-sm font-medium mb-10 max-w-2xl mx-auto flex items-start gap-3 text-start">
                            <AlertCircle className="shrink-0 mt-0.5" size={18} />
                            <div>
                                <p className="font-bold mb-1">تنبيه هام:</p>
                                <p className="opacity-90 leading-relaxed">
                                    عند البدء، سيبدأ المؤقت فوراً. تأكد من استقرار اتصال الإنترنت لديك. لا يمكنك إيقاف المؤقت بعد البدء.
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                            <button
                                onClick={onExit}
                                className="px-8 py-4 bg-white border-2 border-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-95"
                            >
                                إلغاء وخروج
                            </button>
                            <button
                                onClick={handleStart}
                                className="px-10 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 group active:scale-95 flex-1"
                            >
                                ابدأ الاختبار الآن
                                <ArrowRight className={`group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                <p className="mt-6 text-slate-400 text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 size={14} />
                    نتمنى لك التوفيق والنجاح
                </p>
            </div>
        );

    }

    // ACTIVE QUIZ VIEW
    const currentQuestion = quiz.questions?.[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === (quiz.questions?.length || 0) - 1;

    // Timer formatting
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const isTimeLow = timeLeft < 60; // Less than 1 min

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 pb-24 relative min-h-full flex flex-col">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-4 sm:mb-8 sticky top-0 bg-[#FDFDFD] z-10 py-3 sm:py-4 border-b border-slate-100">
                <div className="flex items-center gap-2 sm:gap-4">
                    <button onClick={onExit} className="text-slate-400 hover:text-slate-600" aria-label="إغلاق">
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

                <div className={`flex items-center gap-1.5 sm:gap-2 font-mono font-bold text-sm sm:text-lg px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl ${isTimeLow ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-600'}`}>
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
                        {/* Question Image */}
                        {currentQuestion.question_image_url && (
                            <div className="mt-4">
                                <img
                                    src={currentQuestion.question_image_url}
                                    alt="صورة السؤال"
                                    className="max-w-full max-h-80 rounded-xl border border-slate-200 object-contain"
                                />
                            </div>
                        )}
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
                                            onChange={() => handleAnswerChange(currentQuestion.id, option.id)}
                                            className="peer sr-only"
                                        />
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${answers[currentQuestion.id] === option.id ? 'border-shibl-crimson' : 'border-slate-300'}`}>
                                            {answers[currentQuestion.id] === option.id && <div className="w-3 h-3 bg-shibl-crimson rounded-full" />}
                                        </div>
                                    </div>
                                    <div className="flex-1 flex flex-col gap-2">
                                        <span className={`font-medium ${answers[currentQuestion.id] === option.id ? 'text-shibl-crimson' : 'text-slate-600'}`}>
                                            {getLocalizedName(option.option_text)}
                                        </span>
                                        {/* Option Image */}
                                        {option.option_image_url && (
                                            <img
                                                src={option.option_image_url}
                                                alt="صورة الخيار"
                                                className="max-w-[200px] max-h-32 rounded-lg border border-slate-200 object-contain"
                                            />
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}

                    {currentQuestion.question_type === 'essay' && (
                        <div className="space-y-4">
                            <textarea
                                value={answers[currentQuestion.id] || ''}
                                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                className="w-full h-48 p-4 rounded-xl border-2 border-slate-200 focus:border-shibl-crimson focus:ring-0 resize-none transition-colors"
                                placeholder="اكتب إجابتك هنا..."
                            ></textarea>

                            <div className="flex items-start gap-4">
                                <div className="flex-1">
                                    <label
                                        htmlFor={`file-upload-${currentQuestion.id}`}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors w-fit text-sm font-medium text-slate-600"
                                    >
                                        <Upload size={18} />
                                        <span>إرفاق صورة (اختياري)</span>
                                        <input
                                            id={`file-upload-${currentQuestion.id}`}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    // Validate file size (e.g., 2MB)
                                                    if (file.size > 2 * 1024 * 1024) {
                                                        alert('حجم الصورة يجب أن لا يتجاوز 2 ميجابايت');
                                                        return;
                                                    }
                                                    handleAnswerChange(currentQuestion.id, answers[currentQuestion.id] || '', file);
                                                }
                                            }}
                                        />
                                    </label>
                                    <p className="text-xs text-slate-400 mt-2">
                                        يسمح برفع صور (PNG, JPG) بحجم أقصى 2 ميجابايت.
                                    </p>
                                </div>

                                {/* Image Preview */}
                                {answerImages[currentQuestion.id] && (
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                                            <img
                                                src={URL.createObjectURL(answerImages[currentQuestion.id]!)}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleAnswerChange(currentQuestion.id, answers[currentQuestion.id] || '', null!)}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                            title="حذف الصورة"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Navigation Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-3 sm:p-4 md:px-10 z-[60]">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button
                        disabled={currentQuestionIndex === 0}
                        onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base text-slate-500 disabled:opacity-50 hover:bg-slate-50 transition-colors"
                    >
                        <ChevronRight className={isRTL ? '' : 'rotate-180'} />
                        السابق
                    </button>

                    {isLastQuestion ? (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-8 py-2.5 sm:py-3 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl font-bold text-sm sm:text-base transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-70"
                        >
                            {submitting ? 'جاري التسليم...' : 'تسليم الاختبار'}
                            <CheckCircle2 size={20} />
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                            className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-8 py-2.5 sm:py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm sm:text-base transition-all shadow-lg shadow-slate-900/20"
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

// ================= Question Review Card Component =================
interface QuestionReviewCardProps {
    question: QuizReviewQuestion;
    questionNumber: number;
    totalQuestions: number;
}

function QuestionReviewCard({ question, questionNumber, totalQuestions }: QuestionReviewCardProps) {
    const isCorrect = question.is_correct;
    const isPending = question.is_correct === null;

    return (
        <div className="bg-white rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 md:p-10 shadow-sm border border-slate-100">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 sm:mb-6">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-400">
                        السؤال {questionNumber} من {totalQuestions}
                    </span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold">
                        {question.points} درجات
                    </span>
                </div>

                {/* Status Badge */}
                <div className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm
                    ${isPending
                        ? 'bg-amber-50 text-amber-600'
                        : isCorrect
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-red-50 text-red-600'
                    }
                `}>
                    {isPending ? (
                        <>
                            <Clock size={16} />
                            <span>قيد التصحيح</span>
                        </>
                    ) : isCorrect ? (
                        <>
                            <CheckCircle2 size={16} />
                            <span>صحيحة ({question.earned_points} درجات)</span>
                        </>
                    ) : (
                        <>
                            <XCircle size={16} />
                            <span>خاطئة ({question.earned_points || 0} درجات)</span>
                        </>
                    )}
                </div>
            </div>

            {/* Question Text */}
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-relaxed mb-6">
                {getLocalizedName(question.question_text)}
            </h2>

            {/* Question Image */}
            {question.question_image_url && (
                <div className="mb-6">
                    <img
                        src={question.question_image_url}
                        alt="صورة السؤال"
                        className="max-w-full max-h-80 rounded-xl border border-slate-200 object-contain"
                    />
                </div>
            )}

            {/* MCQ Options Review */}
            {question.question_type === 'mcq' && question.options && (
                <div className="space-y-3">
                    {question.options.map((option) => {
                        const isUserAnswer = question.user_answer === option.id;
                        const isCorrectOption = question.correct_option_id === option.id;

                        let optionStyle = 'border-slate-100 bg-white';
                        let iconComponent = null;

                        if (isCorrectOption) {
                            optionStyle = 'border-emerald-500 bg-emerald-50';
                            iconComponent = <CheckCircle2 className="text-emerald-500" size={20} />;
                        } else if (isUserAnswer && !isCorrect) {
                            optionStyle = 'border-red-500 bg-red-50';
                            iconComponent = <XCircle className="text-red-500" size={20} />;
                        }

                        return (
                            <div
                                key={option.id}
                                className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-5 rounded-xl border-2 relative ${optionStyle}`}
                            >
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isUserAnswer ? 'border-slate-900 bg-slate-900' : 'border-slate-300'}`}>
                                    {isUserAnswer && <div className="w-3 h-3 bg-white rounded-full" />}
                                </div>
                                <div className="flex-1 flex flex-col gap-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`font-medium ${isCorrectOption ? 'text-emerald-700 font-bold' : isUserAnswer && !isCorrect ? 'text-red-700' : 'text-slate-600'}`}>
                                            {getLocalizedName(option.option_text)}
                                        </span>
                                        {/* Badges for Answers */}
                                        {isUserAnswer && (
                                            <span className="text-[10px] font-black tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded-md self-start">
                                                إجابتك
                                            </span>
                                        )}
                                        {isCorrectOption && (
                                            <span className="text-[10px] font-black tracking-wider bg-emerald-500 text-white px-2 py-0.5 rounded-md self-start">
                                                الإجابة الصحيحة
                                            </span>
                                        )}
                                    </div>

                                    {option.option_image_url && (
                                        <img
                                            src={option.option_image_url}
                                            alt="صورة الخيار"
                                            className="max-w-[200px] max-h-32 rounded-lg border border-slate-200 object-contain mt-2"
                                        />
                                    )}
                                </div>
                                <div className="shrink-0 pl-2">
                                    {iconComponent}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Essay Answer Review */}
            {question.question_type === 'essay' && (
                <div className="space-y-4">
                    {/* Student's Answer */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-xs font-bold text-slate-400 mb-2">إجابتك:</p>
                        <p className="text-slate-700 whitespace-pre-wrap">
                            {question.user_answer || 'لم يتم الإجابة'}
                        </p>
                        {question.user_answer_image_url && (
                            <img
                                src={question.user_answer_image_url}
                                alt="صورة الإجابة"
                                className="mt-3 max-w-full max-h-48 rounded-lg border border-slate-200 object-contain"
                            />
                        )}
                    </div>

                    {/* Model Answer (if graded) */}
                    {!isPending && question.model_answer && (
                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                            <p className="text-xs font-bold text-emerald-600 mb-2">الإجابة النموذجية:</p>
                            <p className="text-emerald-800 whitespace-pre-wrap">
                                {typeof question.model_answer === 'string'
                                    ? question.model_answer
                                    : getLocalizedName(question.model_answer)
                                }
                            </p>
                            {question.model_answer_image_url && (
                                <div className="mt-3">
                                    <img
                                        src={question.model_answer_image_url}
                                        alt="صورة الإجابة النموذجية"
                                        className="max-w-full max-h-48 rounded-lg border border-emerald-200 object-contain bg-white"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Clock icon utility component
function ClockIcon({ size, className }: { size: number, className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
    )
}
