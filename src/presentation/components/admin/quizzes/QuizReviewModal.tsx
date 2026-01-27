
import React, { useState } from 'react';
import { QuizData, adminService } from '../../../../data/api/adminService';
import { X, Check, Loader2, Clock, HelpCircle, GraduationCap, AlertCircle, Calendar } from 'lucide-react';
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

export const QuizReviewModal: React.FC<QuizReviewModalProps> = ({ isOpen, onClose, quiz, onSuccess }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);

    const [fullQuiz, setFullQuiz] = useState<QuizData | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    // Fetch full quiz details on mount
    React.useEffect(() => {
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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <span className="bg-indigo-100 text-indigo-700 p-1.5 rounded-lg text-xs">اختبار</span>
                            {getTranslatedName(quiz.name)}
                        </h2>
                        <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                            بواسطة {quiz.teacher?.name || 'مدرس غير معروف'}
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            {new Date(quiz.created_at).toLocaleDateString('ar-EG')}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                                <Clock size={14} /> المدة
                            </div>
                            <div className="font-bold text-lg text-slate-800">{quiz.duration_minutes} دقيقة</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                                <HelpCircle size={14} /> الأسئلة
                            </div>
                            <div className="font-bold text-lg text-slate-800">{quiz.questions_count || quiz.questions?.length || 0}</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                                <GraduationCap size={14} /> النجاح
                            </div>
                            <div className="font-bold text-lg text-slate-800">{quiz.passing_percentage}%</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                                <AlertCircle size={14} /> الحالة
                            </div>
                            <div className={`font-bold text-lg ${quiz.status === 'pending' ? 'text-amber-600' :
                                quiz.status === 'approved' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {statusLabels[quiz.status] || quiz.status}
                            </div>
                        </div>
                    </div>

                    {/* Course Info */}
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm mb-6">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Calendar size={18} className="text-indigo-600" /> تفاصيل الدورة
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <span className="block text-xs text-slate-400 mb-1">الدورة</span>
                                <span className="font-medium text-slate-900">{quiz.course ? getTranslatedName(quiz.course.name) : 'غير محدد'}</span>
                            </div>
                            <div>
                                <span className="block text-xs text-slate-400 mb-1">الوصف</span>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    {quiz.description ? getTranslatedName(quiz.description) : 'لا يوجد وصف'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Admin Feedback (if rejected) */}
                    {quiz.status === 'rejected' && quiz.admin_feedback && (
                        <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-6">
                            <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                                <AlertCircle size={16} /> سبب الرفض السابق
                            </h4>
                            <p className="text-red-700 text-sm">{quiz.admin_feedback}</p>
                        </div>
                    )}

                    {/* Questions Preview */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <HelpCircle size={18} className="text-indigo-600" /> معاينة الأسئلة
                        </h3>

                        {isLoadingDetails ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="animate-spin text-indigo-600" />
                            </div>
                        ) : fullQuiz?.questions && fullQuiz.questions.length > 0 ? (
                            fullQuiz.questions.map((question: any, index: number) => (
                                <div key={index} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="flex justify-between items-start gap-4 mb-3">
                                        <div className="flex gap-3">
                                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold shrink-0">
                                                {index + 1}
                                            </span>
                                            <div>
                                                <p className="font-medium text-slate-900 mb-1">
                                                    {getTranslatedName(question.question_text)}
                                                </p>
                                                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                                    {question.points} نقاط
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Options for MCQ */}
                                    {question.question_type === 'mcq' && question.options && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 pr-9">
                                            {question.options.map((option: any, optIndex: number) => (
                                                <div
                                                    key={optIndex}
                                                    className={`p-3 rounded-lg border text-sm flex items-center gap-2 ${option.is_correct
                                                        ? 'bg-green-50 border-green-200 text-green-700'
                                                        : 'bg-white border-slate-100 text-slate-600'
                                                        }`}
                                                >
                                                    {option.is_correct && <Check size={16} className="text-green-600 shrink-0" />}
                                                    <span>{getTranslatedName(option.option_text)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Model Answer for Essay */}
                                    {question.question_type === 'essay' && (
                                        <div className="mt-3 pr-9">
                                            <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                                                <span className="text-xs font-bold text-amber-700 block mb-1">الإجابة النموذجية:</span>
                                                <p className="text-sm text-amber-800">
                                                    {getTranslatedName(question.model_answer) || 'لا توجد إجابة نموذجية'}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="bg-slate-50 p-8 rounded-xl border border-slate-200 border-dashed text-center text-slate-500">
                                لا توجد أسئلة في هذا الاختبار
                            </div>
                        )}
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 bg-white rounded-b-2xl">
                    {quiz.status === 'pending' ? (
                        <>
                            {showRejectInput ? (
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-slate-700">سبب الرفض</label>
                                    <textarea
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none h-24 resize-none text-sm"
                                        placeholder="اكتب سبب رفض هذا الاختبار..."
                                    />
                                    <div className="flex gap-3 justify-start">
                                        <button
                                            onClick={handleReject}
                                            disabled={isProcessing || !rejectReason.trim()}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : 'تأكيد الرفض'}
                                        </button>
                                        <button
                                            onClick={() => setShowRejectInput(false)}
                                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium"
                                        >
                                            إلغاء
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-3 justify-start">
                                    <button
                                        onClick={handleApprove}
                                        disabled={isProcessing}
                                        className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition flex items-center gap-2 shadow-lg shadow-green-600/20"
                                    >
                                        {isProcessing ? <Loader2 size={18} className="animate-spin" /> : (
                                            <>
                                                <Check size={18} /> الموافقة على الاختبار
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setShowRejectInput(true)}
                                        className="px-6 py-2.5 border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition"
                                    >
                                        رفض
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                            <span className="text-sm text-slate-500">
                                حالة الاختبار: {statusLabels[quiz.status]}
                            </span>
                            <button onClick={onClose} className="text-slate-900 font-medium text-sm hover:underline">
                                إغلاق
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
