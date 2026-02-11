/**
 * EssayGradingModal - Full-screen modal for grading essay answers
 * Features: Question navigator, side-by-side view (question + student answer),
 * model answer reference, grading form with points slider and feedback
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
    X,
    ChevronRight,
    ChevronLeft,
    Check,
    XCircle,
    MessageSquare,
    Award,
    Image as ImageIcon,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Clock,
    User,
    FileText,
    Save,
    ArrowRight,
    ArrowLeft,
    Eye,
} from 'lucide-react';
import {
    quizService,
    type QuizAttemptForGrading,
    type AttemptAnswerForGrading,
    type GradeAnswerPayload,
    getQuizName,
} from '../../../../data/api/quizService';
import toast from 'react-hot-toast';

// ==================== TYPES ====================

interface EssayGradingModalProps {
    isOpen: boolean;
    onClose: () => void;
    attempt: QuizAttemptForGrading;
    onGradingComplete: () => void;
}

interface GradingFormData {
    isCorrect: boolean | null;
    earnedPoints: number;
    feedback: string;
}

// ==================== IMAGE PREVIEW MODAL ====================

function ImagePreviewModal({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
    return (
        <div
            className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-4 left-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
                <X size={24} />
            </button>
            <img
                src={src}
                alt={alt}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
}

// ==================== QUESTION NAVIGATOR ====================

function QuestionNavigator({
    answers,
    currentIndex,
    onSelect,
}: {
    answers: AttemptAnswerForGrading[];
    currentIndex: number;
    onSelect: (index: number) => void;
}) {
    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {answers.map((answer, index) => {
                const isEssay = answer.question_type === 'essay';
                const isGraded = answer.is_correct !== null;
                const isCurrent = index === currentIndex;

                return (
                    <button
                        key={answer.id}
                        onClick={() => onSelect(index)}
                        className={`flex-shrink-0 w-9 h-9 rounded-lg text-xs font-bold transition-all relative ${isCurrent
                            ? 'bg-shibl-crimson text-white shadow-lg shadow-shibl-crimson/30 scale-110'
                            : isGraded
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                : isEssay
                                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                        title={`سؤال ${index + 1} — ${isEssay ? (isGraded ? 'مصحح' : 'بانتظار') : 'اختيارات'}`}
                    >
                        {index + 1}
                        {/* Status dot */}
                        {isEssay && !isCurrent && (
                            <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${isGraded ? 'bg-emerald-500' : 'bg-red-500'
                                }`} />
                        )}
                    </button>
                );
            })}
        </div>
    );
}

// ==================== MAIN COMPONENT ====================

export function EssayGradingModal({
    isOpen,
    onClose,
    attempt,
    onGradingComplete,
}: EssayGradingModalProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [grading, setGrading] = useState<Map<number, GradingFormData>>(new Map());
    const [saving, setSaving] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // All answers (for navigator), essay answers only (for grading)
    const allAnswers = attempt.answers;
    const essayAnswers = useMemo(
        () => allAnswers.filter(a => a.question_type === 'essay'),
        [allAnswers]
    );

    // Initialize grading state from existing data
    useEffect(() => {
        const initialGrading = new Map<number, GradingFormData>();
        essayAnswers.forEach(answer => {
            initialGrading.set(answer.id, {
                isCorrect: answer.is_correct,
                earnedPoints: answer.earned_points ?? 0,
                feedback: answer.teacher_feedback ?? '',
            });
        });
        setGrading(initialGrading);
        // Start at first ungraded essay, or first essay if all graded
        const firstUngraded = essayAnswers.findIndex(a => a.is_correct === null);
        setCurrentIndex(firstUngraded >= 0 ? firstUngraded : 0);
    }, [attempt.id]);

    const currentAnswer = essayAnswers[currentIndex];
    const currentGrading = currentAnswer ? grading.get(currentAnswer.id) : null;

    // Update grading for current answer
    const updateCurrentGrading = useCallback((updates: Partial<GradingFormData>) => {
        if (!currentAnswer) return;
        setGrading(prev => {
            const next = new Map(prev);
            const existing = next.get(currentAnswer.id) || {
                isCorrect: null,
                earnedPoints: 0,
                feedback: '',
            };
            next.set(currentAnswer.id, { ...existing, ...updates });
            return next;
        });
    }, [currentAnswer]);

    // Save a single answer grade
    const handleSaveGrade = useCallback(async () => {
        if (!currentAnswer || !currentGrading) return;
        if (currentGrading.isCorrect === null) {
            toast.error('يرجى تحديد ما إذا كانت الإجابة صحيحة أم خاطئة');
            return;
        }

        try {
            setSaving(true);
            const payload: GradeAnswerPayload = {
                is_correct: currentGrading.isCorrect,
                earned_points: currentGrading.earnedPoints,
                teacher_feedback: currentGrading.feedback || undefined,
            };

            await quizService.gradeEssayAnswer(attempt.id, currentAnswer.id, payload);
            toast.success(`تم حفظ تصحيح السؤال ${currentIndex + 1}`);

            // Auto-advance to next ungraded
            const nextUngraded = essayAnswers.findIndex(
                (a, i) => i > currentIndex && (grading.get(a.id)?.isCorrect === null || a.is_correct === null)
            );
            if (nextUngraded >= 0) {
                setCurrentIndex(nextUngraded);
            } else {
                // Check if all graded now
                const allGraded = essayAnswers.every(a => {
                    const g = grading.get(a.id);
                    return (g && g.isCorrect !== null) || a.is_correct !== null;
                });
                if (allGraded) {
                    toast.success('تم تصحيح جميع الأسئلة المقالية! 🎉');
                    onGradingComplete();
                    onClose();
                }
            }
        } catch (error) {
            console.error('Grade answer error:', error);
            toast.error('فشل في حفظ التصحيح');
        } finally {
            setSaving(false);
        }
    }, [currentAnswer, currentGrading, attempt.id, currentIndex, essayAnswers, grading, onGradingComplete]);

    // Quick grade (full points = correct, 0 points = incorrect)
    const handleQuickGrade = useCallback((correct: boolean) => {
        if (!currentAnswer) return;
        updateCurrentGrading({
            isCorrect: correct,
            earnedPoints: correct ? currentAnswer.points : 0,
        });
    }, [currentAnswer, updateCurrentGrading]);

    // Navigate between essays
    const goToPrev = () => setCurrentIndex(Math.max(0, currentIndex - 1));
    const goToNext = () => setCurrentIndex(Math.min(essayAnswers.length - 1, currentIndex + 1));

    if (!isOpen || essayAnswers.length === 0) return null;

    // Progress
    const gradedCount = essayAnswers.filter(a => {
        const g = grading.get(a.id);
        return g?.isCorrect !== null;
    }).length;
    const progressPercent = Math.round((gradedCount / essayAnswers.length) * 100);

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                    <User size={16} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">{attempt.student.name}</h3>
                                    <p className="text-xs text-white/60">
                                        {getQuizName(attempt.quiz.name)}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            <span className="text-xs text-white/60 font-medium whitespace-nowrap">
                                {gradedCount}/{essayAnswers.length} مصحح
                            </span>
                        </div>

                        {/* Question Navigator */}
                        <div className="mt-3">
                            <QuestionNavigator
                                answers={allAnswers}
                                currentIndex={allAnswers.indexOf(currentAnswer)}
                                onSelect={(idx) => {
                                    // Only navigate to essay questions
                                    const answer = allAnswers[idx];
                                    if (answer.question_type === 'essay') {
                                        const essayIdx = essayAnswers.indexOf(answer);
                                        if (essayIdx >= 0) setCurrentIndex(essayIdx);
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Content */}
                    {currentAnswer && (
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left: Question & Student Answer */}
                                <div className="space-y-4">
                                    {/* Question */}
                                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                                            <FileText size={16} className="text-shibl-crimson" />
                                            السؤال {currentIndex + 1}
                                            <span className="mr-auto text-xs font-normal text-slate-500">
                                                ({currentAnswer.points} نقطة)
                                            </span>
                                        </div>
                                        <p className="text-slate-900 text-sm leading-relaxed">
                                            {currentAnswer.question_text?.ar || currentAnswer.question_text?.en || 'نص السؤال'}
                                        </p>
                                        {currentAnswer.question_image_url && (
                                            <button
                                                onClick={() => setPreviewImage(currentAnswer.question_image_url!)}
                                                className="mt-3 relative group"
                                            >
                                                <img
                                                    src={currentAnswer.question_image_url}
                                                    alt="صورة السؤال"
                                                    className="rounded-lg max-h-48 object-cover border border-slate-200"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors flex items-center justify-center">
                                                    <Eye size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            </button>
                                        )}
                                    </div>

                                    {/* Student Answer */}
                                    <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-blue-700 mb-3">
                                            <MessageSquare size={16} />
                                            إجابة الطالب
                                        </div>
                                        {currentAnswer.user_answer ? (
                                            <p className="text-slate-900 text-sm leading-relaxed whitespace-pre-wrap">
                                                {String(currentAnswer.user_answer)}
                                            </p>
                                        ) : (
                                            <p className="text-slate-400 italic text-sm">لم يتم تقديم إجابة نصية</p>
                                        )}
                                        {currentAnswer.user_answer_image_url && (
                                            <button
                                                onClick={() => setPreviewImage(currentAnswer.user_answer_image_url!)}
                                                className="mt-3 relative group"
                                            >
                                                <img
                                                    src={currentAnswer.user_answer_image_url}
                                                    alt="صورة إجابة الطالب"
                                                    className="rounded-lg max-h-48 object-cover border border-blue-200"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors flex items-center justify-center">
                                                    <Eye size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            </button>
                                        )}
                                    </div>

                                    {/* Model Answer (Reference) */}
                                    {(currentAnswer.model_answer?.ar || currentAnswer.model_answer?.en || currentAnswer.model_answer_image_url) && (
                                        <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-200">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 mb-3">
                                                <CheckCircle2 size={16} />
                                                الإجابة النموذجية (مرجع)
                                            </div>
                                            {(currentAnswer.model_answer?.ar || currentAnswer.model_answer?.en) && (
                                                <p className="text-slate-900 text-sm leading-relaxed whitespace-pre-wrap">
                                                    {currentAnswer.model_answer?.ar || currentAnswer.model_answer?.en}
                                                </p>
                                            )}
                                            {currentAnswer.model_answer_image_url && (
                                                <button
                                                    onClick={() => setPreviewImage(currentAnswer.model_answer_image_url!)}
                                                    className="mt-3 relative group"
                                                >
                                                    <img
                                                        src={currentAnswer.model_answer_image_url}
                                                        alt="صورة الإجابة النموذجية"
                                                        className="rounded-lg max-h-48 object-cover border border-emerald-200"
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors flex items-center justify-center">
                                                        <Eye size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Right: Grading Form */}
                                <div className="space-y-4">
                                    <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-4">
                                        <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <Award size={16} className="text-shibl-crimson" />
                                            التقييم والدرجة
                                        </h4>

                                        {/* Quick Grade Buttons */}
                                        <div className="flex gap-3 mb-5">
                                            <button
                                                onClick={() => handleQuickGrade(true)}
                                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${currentGrading?.isCorrect === true
                                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
                                                    }`}
                                            >
                                                <Check size={18} />
                                                صحيح
                                            </button>
                                            <button
                                                onClick={() => handleQuickGrade(false)}
                                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${currentGrading?.isCorrect === false
                                                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                                                    : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                                    }`}
                                            >
                                                <XCircle size={18} />
                                                خطأ
                                            </button>
                                        </div>

                                        {/* Points Slider */}
                                        <div className="mb-5">
                                            <label className="flex items-center justify-between text-sm mb-2">
                                                <span className="font-medium text-slate-700">الدرجة المكتسبة</span>
                                                <span className="font-bold text-shibl-crimson text-lg">
                                                    {currentGrading?.earnedPoints ?? 0} / {currentAnswer?.points ?? 0}
                                                </span>
                                            </label>
                                            <input
                                                type="range"
                                                min={0}
                                                max={currentAnswer?.points ?? 0}
                                                step={0.5}
                                                value={currentGrading?.earnedPoints ?? 0}
                                                onChange={(e) => {
                                                    const pts = parseFloat(e.target.value);
                                                    updateCurrentGrading({
                                                        earnedPoints: pts,
                                                        isCorrect: pts > 0,
                                                    });
                                                }}
                                                className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-shibl-crimson"
                                            />
                                            {/* Quick point buttons */}
                                            <div className="flex gap-2 mt-2">
                                                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                                                    const pts = Math.round((currentAnswer?.points ?? 0) * ratio * 2) / 2;
                                                    return (
                                                        <button
                                                            key={ratio}
                                                            onClick={() => updateCurrentGrading({
                                                                earnedPoints: pts,
                                                                isCorrect: pts > 0,
                                                            })}
                                                            className={`flex-1 py-1 text-xs font-medium rounded-md transition-all ${currentGrading?.earnedPoints === pts
                                                                ? 'bg-shibl-crimson text-white'
                                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                                }`}
                                                        >
                                                            {pts}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Teacher Feedback */}
                                        <div className="mb-5">
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                <MessageSquare size={14} className="inline ml-1" />
                                                ملاحظات المعلم (اختياري)
                                            </label>
                                            <textarea
                                                value={currentGrading?.feedback ?? ''}
                                                onChange={(e) => updateCurrentGrading({ feedback: e.target.value })}
                                                placeholder="اكتب ملاحظاتك هنا..."
                                                rows={3}
                                                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-shibl-crimson/20 focus:border-shibl-crimson transition-colors resize-none"
                                            />
                                        </div>

                                        {/* Save Button */}
                                        <button
                                            onClick={handleSaveGrade}
                                            disabled={saving || currentGrading?.isCorrect === null}
                                            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${saving || currentGrading?.isCorrect === null
                                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                : 'bg-shibl-crimson text-white hover:bg-shibl-red-600 shadow-lg shadow-shibl-crimson/20 active:scale-[0.98]'
                                                }`}
                                        >
                                            {saving ? (
                                                <>
                                                    <Loader2 size={16} className="animate-spin" />
                                                    جاري الحفظ...
                                                </>
                                            ) : (
                                                <>
                                                    <Save size={16} />
                                                    حفظ التقييم
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer Navigation */}
                    <div className="border-t border-slate-200 px-6 py-3 bg-slate-50 flex items-center justify-between">
                        <button
                            onClick={goToPrev}
                            disabled={currentIndex === 0}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ArrowRight size={16} />
                            السابق
                        </button>

                        <span className="text-xs text-slate-500">
                            سؤال {currentIndex + 1} من {essayAnswers.length}
                        </span>

                        <button
                            onClick={goToNext}
                            disabled={currentIndex === essayAnswers.length - 1}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            التالي
                            <ArrowLeft size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Image Preview */}
            {previewImage && (
                <ImagePreviewModal
                    src={previewImage}
                    alt="معاينة الصورة"
                    onClose={() => setPreviewImage(null)}
                />
            )}
        </>
    );
}

export default EssayGradingModal;
