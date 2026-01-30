
import React, { useState, useEffect } from 'react';
import { QuizData, adminService } from '../../../../data/api/adminService';
import {
    X, Check, Loader2, Clock, HelpCircle, GraduationCap, AlertCircle,
    Calendar, FileQuestion, ChevronLeft, ChevronRight,
    User, BookOpen, Target, Maximize2, Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

interface QuizReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    quiz: QuizData;
    onSuccess: () => void;
}

// Status translations
const statusLabels: Record<string, string> = {
    draft: 'مسودة',
    pending: 'قيد الانتظار',
    approved: 'تمت الموافقة',
    rejected: 'مرفوض',
};

const statusStyles: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700 border-slate-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
};

// Theme Colors from theme.txt
// Shibl Crimson: #AF0C15
// Deep Charcoal: #1F1F1F
// Soft Cloud: #F8F9FA
// Slate Grey: #636E72
// Success Green: #27AE60

export const QuizReviewModal: React.FC<QuizReviewModalProps> = ({ isOpen, onClose, quiz, onSuccess }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);
    const [fullQuiz, setFullQuiz] = useState<QuizData | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [expandedImage, setExpandedImage] = useState<string | null>(null);

    // Fetch full quiz details on mount
    useEffect(() => {
        const fetchDetails = async () => {
            if (!quiz.id) return;
            setIsLoadingDetails(true);
            try {
                const data = await adminService.getQuiz(quiz.id);
                // @ts-ignore
                setFullQuiz(data.data || data);
            } catch (error) {
                console.error('Failed to fetch quiz details:', error);
                toast.error('فشل في تحميل تفاصيل الأسئلة');
            } finally {
                setIsLoadingDetails(false);
            }
        };

        if (isOpen) {
            fetchDetails();
            setCurrentQuestionIndex(0);
            setShowRejectInput(false);
            setRejectReason('');
        }
    }, [quiz.id, isOpen]);

    if (!isOpen) return null;

    const handleApprove = async () => {
        setIsProcessing(true);
        try {
            await adminService.approveQuiz(quiz.id);
            toast.success('تمت الموافقة على الاختبار بنجاح');
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('فشل في الموافقة على الاختبار');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            toast.error('يرجى كتابة سبب الرفض');
            return;
        }

        setIsProcessing(true);
        try {
            await adminService.rejectQuiz(quiz.id, rejectReason);
            toast.success('تم رفض الاختبار');
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('فشل في رفض الاختبار');
        } finally {
            setIsProcessing(false);
        }
    };

    const getTranslatedName = (name: any) => {
        if (typeof name === 'string') return name;
        return name?.ar || name?.en || 'بدون اسم';
    };

    const questions = fullQuiz?.questions || [];
    const currentQuestion = questions[currentQuestionIndex];
    const totalQuestions = questions.length;

    const goToNextQuestion = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const goToPrevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" dir="rtl">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

                <div className="relative bg-white rounded-2xl w-full max-w-[95vw] xl:max-w-[1300px] h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 overflow-hidden">

                    {/* Header - Using Shibl Crimson gradient */}
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-l from-[#F8F9FA] to-white">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg"
                                style={{ background: 'linear-gradient(135deg, #AF0C15 0%, #8a0a11 100%)', boxShadow: '0 8px 20px -4px rgba(175, 12, 21, 0.3)' }}
                            >
                                <FileQuestion size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold" style={{ color: '#1F1F1F' }}>{getTranslatedName(quiz.name)}</h2>
                                <div className="flex items-center gap-3 text-sm mt-0.5" style={{ color: '#636E72' }}>
                                    <span className="flex items-center gap-1">
                                        <User size={14} />
                                        {quiz.teacher?.name || 'مدرس غير معروف'}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                    <span className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        {new Date(quiz.created_at).toLocaleDateString('ar-EG')}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${statusStyles[quiz.status] || statusStyles.draft}`}>
                                {quiz.status === 'pending' && <AlertCircle size={14} />}
                                {quiz.status === 'approved' && <Check size={14} />}
                                {quiz.status === 'rejected' && <X size={14} />}
                                {statusLabels[quiz.status] || quiz.status}
                            </span>
                            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>
                    </div>

                    {/* Main Content - Split View */}
                    <div className="flex-1 flex overflow-hidden">

                        {/* Left Panel - Info & Actions */}
                        <div className="w-[380px] xl:w-[420px] flex-shrink-0 border-l border-slate-100 bg-[#F8F9FA] flex flex-col">

                            {/* Stats Grid */}
                            <div className="p-5 border-b border-slate-100">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                        <div className="flex items-center gap-2 text-xs mb-1" style={{ color: '#636E72' }}>
                                            <Clock size={14} /> المدة
                                        </div>
                                        <div className="font-bold text-xl" style={{ color: '#1F1F1F' }}>{quiz.duration_minutes} <span className="text-sm font-normal" style={{ color: '#636E72' }}>دقيقة</span></div>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                        <div className="flex items-center gap-2 text-xs mb-1" style={{ color: '#636E72' }}>
                                            <HelpCircle size={14} /> الأسئلة
                                        </div>
                                        <div className="font-bold text-xl" style={{ color: '#1F1F1F' }}>{totalQuestions} <span className="text-sm font-normal" style={{ color: '#636E72' }}>سؤال</span></div>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                        <div className="flex items-center gap-2 text-xs mb-1" style={{ color: '#636E72' }}>
                                            <Target size={14} /> النجاح
                                        </div>
                                        <div className="font-bold text-xl" style={{ color: '#1F1F1F' }}>{quiz.passing_percentage}<span className="text-sm font-normal" style={{ color: '#636E72' }}>%</span></div>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                        <div className="flex items-center gap-2 text-xs mb-1" style={{ color: '#636E72' }}>
                                            <GraduationCap size={14} /> النوع
                                        </div>
                                        <div className="font-bold text-sm" style={{ color: '#1F1F1F' }}>
                                            {quiz.quiz_type === 'mcq' ? 'اختيار من متعدد' : 'مقالي'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Course Info */}
                            <div className="p-5 border-b border-slate-100">
                                <h4 className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: '#636E72' }}>
                                    <BookOpen size={14} /> تفاصيل الدورة
                                </h4>
                                <div className="bg-white p-4 rounded-xl border border-slate-100">
                                    <p className="font-semibold" style={{ color: '#1F1F1F' }}>{quiz.course ? getTranslatedName(quiz.course.name) : 'غير محدد'}</p>
                                    {quiz.description && (
                                        <p className="text-sm mt-2 line-clamp-3" style={{ color: '#636E72' }}>
                                            {getTranslatedName(quiz.description)}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Question Navigator */}
                            {totalQuestions > 0 && (
                                <div className="p-5 border-b border-slate-100 flex-shrink-0">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#636E72' }}>
                                        التنقل بين الأسئلة
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {questions.map((_: any, idx: number) => (
                                            <button
                                                key={idx}
                                                onClick={() => setCurrentQuestionIndex(idx)}
                                                className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${idx === currentQuestionIndex
                                                        ? 'text-white'
                                                        : 'bg-white border border-slate-200 text-slate-600 hover:border-[#AF0C15]/30 hover:text-[#AF0C15]'
                                                    }`}
                                                style={idx === currentQuestionIndex ? {
                                                    background: '#AF0C15',
                                                    boxShadow: '0 4px 12px -2px rgba(175, 12, 21, 0.3)'
                                                } : {}}
                                            >
                                                {idx + 1}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Admin Feedback (if rejected) */}
                            {quiz.status === 'rejected' && quiz.admin_feedback && (
                                <div className="p-5 border-b border-slate-100">
                                    <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                        <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2 text-sm">
                                            <AlertCircle size={14} /> سبب الرفض السابق
                                        </h4>
                                        <p className="text-red-700 text-sm">{quiz.admin_feedback}</p>
                                    </div>
                                </div>
                            )}

                            {/* Spacer */}
                            <div className="flex-1" />

                            {/* Actions */}
                            <div className="p-5 border-t border-slate-100 bg-white">
                                {quiz.status === 'pending' ? (
                                    <>
                                        {showRejectInput ? (
                                            <div className="space-y-3">
                                                <label className="block text-sm font-medium" style={{ color: '#1F1F1F' }}>سبب الرفض</label>
                                                <textarea
                                                    value={rejectReason}
                                                    onChange={(e) => setRejectReason(e.target.value)}
                                                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none h-24 resize-none text-sm"
                                                    placeholder="اكتب سبب رفض هذا الاختبار..."
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleReject}
                                                        disabled={isProcessing || !rejectReason.trim()}
                                                        className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                                    >
                                                        {isProcessing ? <Loader2 size={16} className="animate-spin" /> : 'تأكيد الرفض'}
                                                    </button>
                                                    <button
                                                        onClick={() => setShowRejectInput(false)}
                                                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium"
                                                        style={{ color: '#636E72' }}
                                                    >
                                                        إلغاء
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-3">
                                                <button
                                                    onClick={handleApprove}
                                                    disabled={isProcessing}
                                                    className="w-full px-6 py-3 text-white rounded-full font-bold transition flex items-center justify-center gap-2"
                                                    style={{
                                                        background: 'linear-gradient(135deg, #27AE60 0%, #1e8449 100%)',
                                                        boxShadow: '0 4px 12px -2px rgba(39, 174, 96, 0.3)'
                                                    }}
                                                >
                                                    {isProcessing ? <Loader2 size={18} className="animate-spin" /> : (
                                                        <>
                                                            <Check size={18} /> الموافقة على الاختبار
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => setShowRejectInput(true)}
                                                    className="w-full px-6 py-3 border-2 rounded-full font-bold transition hover:bg-red-50"
                                                    style={{ borderColor: '#AF0C15', color: '#AF0C15' }}
                                                >
                                                    رفض الاختبار
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <button
                                        onClick={onClose}
                                        className="w-full px-6 py-3 bg-slate-100 rounded-full font-bold hover:bg-slate-200 transition"
                                        style={{ color: '#1F1F1F' }}
                                    >
                                        إغلاق
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Right Panel - Question Preview */}
                        <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'linear-gradient(135deg, #F8F9FA 0%, #f0f2f5 100%)' }}>

                            {/* Preview Header */}
                            <div className="px-6 py-4 border-b border-slate-100 bg-white/80 backdrop-blur-sm flex items-center justify-between">
                                <h3 className="font-bold flex items-center gap-2" style={{ color: '#1F1F1F' }}>
                                    <HelpCircle size={18} style={{ color: '#AF0C15' }} />
                                    معاينة الأسئلة
                                </h3>
                                {totalQuestions > 0 && (
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm" style={{ color: '#636E72' }}>
                                            السؤال <span className="font-bold" style={{ color: '#1F1F1F' }}>{currentQuestionIndex + 1}</span> من <span className="font-bold" style={{ color: '#1F1F1F' }}>{totalQuestions}</span>
                                        </span>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={goToPrevQuestion}
                                                disabled={currentQuestionIndex === 0}
                                                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                            >
                                                <ChevronRight size={18} />
                                            </button>
                                            <button
                                                onClick={goToNextQuestion}
                                                disabled={currentQuestionIndex === totalQuestions - 1}
                                                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                            >
                                                <ChevronLeft size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Question Content */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {isLoadingDetails ? (
                                    <div className="h-full flex flex-col items-center justify-center" style={{ color: '#636E72' }}>
                                        <Loader2 className="animate-spin mb-3" size={32} style={{ color: '#AF0C15' }} />
                                        <span>جاري تحميل الأسئلة...</span>
                                    </div>
                                ) : currentQuestion ? (
                                    <div className="max-w-3xl mx-auto space-y-6">
                                        {/* Question Card */}
                                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                                            {/* Question Header */}
                                            <div className="px-6 py-4 flex items-start gap-4" style={{ background: 'linear-gradient(to left, rgba(175, 12, 21, 0.05), transparent)' }}>
                                                <span
                                                    className="flex items-center justify-center w-10 h-10 rounded-xl text-white text-lg font-bold shrink-0"
                                                    style={{ background: '#AF0C15', boxShadow: '0 4px 12px -2px rgba(175, 12, 21, 0.3)' }}
                                                >
                                                    {currentQuestionIndex + 1}
                                                </span>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-lg leading-relaxed" style={{ color: '#1F1F1F' }}>
                                                        {getTranslatedName(currentQuestion.question_text)}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <span
                                                            className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                                                            style={{ background: 'rgba(175, 12, 21, 0.1)', color: '#AF0C15' }}
                                                        >
                                                            {currentQuestion.points} نقاط
                                                        </span>
                                                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100" style={{ color: '#636E72' }}>
                                                            {currentQuestion.question_type === 'mcq' ? 'اختيار من متعدد' : 'سؤال مقالي'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Question Image */}
                                            {currentQuestion.question_image_url && (
                                                <div className="px-6 pb-4">
                                                    <div
                                                        className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 cursor-pointer group"
                                                        onClick={() => setExpandedImage(currentQuestion.question_image_url)}
                                                    >
                                                        <img
                                                            src={currentQuestion.question_image_url}
                                                            alt="صورة السؤال"
                                                            className="w-full max-h-64 object-contain"
                                                        />
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5" style={{ color: '#1F1F1F' }}>
                                                                <Maximize2 size={14} /> تكبير الصورة
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* MCQ Options */}
                                            {currentQuestion.question_type === 'mcq' && currentQuestion.options && (
                                                <div className="px-6 pb-6 space-y-3">
                                                    {currentQuestion.options.map((option: any, optIndex: number) => (
                                                        <div
                                                            key={optIndex}
                                                            className={`p-4 rounded-xl border-2 transition-all ${option.is_correct
                                                                    ? 'border-[#27AE60] shadow-sm'
                                                                    : 'bg-white border-slate-200 hover:border-slate-300'
                                                                }`}
                                                            style={option.is_correct ? { background: 'rgba(39, 174, 96, 0.08)' } : {}}
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <div
                                                                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                                                                    style={option.is_correct
                                                                        ? { background: '#27AE60', color: 'white' }
                                                                        : { background: '#e2e8f0', color: '#636E72' }
                                                                    }
                                                                >
                                                                    {option.is_correct ? (
                                                                        <Check size={16} />
                                                                    ) : (
                                                                        <span className="text-sm font-bold">{String.fromCharCode(65 + optIndex)}</span>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="font-medium" style={{ color: option.is_correct ? '#1e8449' : '#1F1F1F' }}>
                                                                        {getTranslatedName(option.option_text)}
                                                                    </p>

                                                                    {/* Option Image */}
                                                                    {option.option_image_url && (
                                                                        <div
                                                                            className="mt-3 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 cursor-pointer inline-block"
                                                                            onClick={() => setExpandedImage(option.option_image_url)}
                                                                        >
                                                                            <img
                                                                                src={option.option_image_url}
                                                                                alt={`صورة الخيار ${optIndex + 1}`}
                                                                                className="max-h-32 object-contain"
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {option.is_correct && (
                                                                    <span
                                                                        className="text-xs font-bold px-2 py-1 rounded-full shrink-0"
                                                                        style={{ background: 'rgba(39, 174, 96, 0.15)', color: '#27AE60' }}
                                                                    >
                                                                        الإجابة الصحيحة
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Essay Model Answer */}
                                            {currentQuestion.question_type === 'essay' && (
                                                <div className="px-6 pb-6">
                                                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                                                        <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2 text-sm">
                                                            <FileQuestion size={16} /> الإجابة النموذجية
                                                        </h4>
                                                        <p className="text-amber-900 leading-relaxed">
                                                            {getTranslatedName(currentQuestion.model_answer) || 'لا توجد إجابة نموذجية'}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center">
                                        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                            <HelpCircle size={40} className="text-slate-300" />
                                        </div>
                                        <p className="text-lg font-medium" style={{ color: '#1F1F1F' }}>لا توجد أسئلة في هذا الاختبار</p>
                                        <p className="text-sm mt-1" style={{ color: '#636E72' }}>يبدو أن المدرس لم يضف أي أسئلة بعد</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Lightbox */}
            {expandedImage && (
                <div
                    className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-8 cursor-pointer"
                    onClick={() => setExpandedImage(null)}
                >
                    <button
                        className="absolute top-6 left-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition"
                        onClick={() => setExpandedImage(null)}
                    >
                        <X size={24} />
                    </button>
                    <img
                        src={expandedImage}
                        alt="صورة مكبرة"
                        className="max-w-full max-h-full object-contain rounded-lg"
                    />
                </div>
            )}
        </>
    );
};
