import { Quiz } from '../../../data/api';
import { useLanguage } from '../../hooks';
import { X, Clock, CheckCircle, FileQuestion, FileEdit, BookOpen } from 'lucide-react';

interface QuizPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    quiz: Quiz | null;
}

export function QuizPreviewModal({ isOpen, onClose, quiz }: QuizPreviewModalProps) {
    const { isRTL } = useLanguage();

    if (!isOpen || !quiz) return null;

    const quizName = typeof quiz.name === 'string'
        ? JSON.parse(quiz.name).ar
        : (quiz.name as any).ar || (quiz.name as any).en || '';

    const courseName = quiz.course
        ? (typeof quiz.course.name === 'string' ? JSON.parse(quiz.course.name).ar : (quiz.course.name as any).ar)
        : 'بدون دورة';

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-[#1F1F1F] mb-1">{quizName}</h2>
                        <div className="flex items-center gap-2 text-sm text-[#636E72]">
                            <BookOpen size={14} />
                            <span>{courseName}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 mx-1" />
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${quiz.quiz_type === 'mcq' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                {quiz.quiz_type === 'mcq' ? 'اختيار من متعدد' : 'أسئلة مكتوبة'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-slate-100 text-[#636E72] transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 px-6 py-4 border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-2 text-[#636E72]">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                            <Clock size={16} />
                        </div>
                        <div>
                            <p className="text-xs text-[#9CA3AF]">المدة</p>
                            <p className="text-sm font-semibold text-[#1F1F1F]">{quiz.duration_minutes || 'غير محدود'} دقيقة</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-[#636E72]">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <CheckCircle size={16} />
                        </div>
                        <div>
                            <p className="text-xs text-[#9CA3AF]">نسبة النجاح</p>
                            <p className="text-sm font-semibold text-[#1F1F1F]">{quiz.passing_percentage}%</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                    <h3 className="font-semibold text-[#1F1F1F] mb-4 flex items-center gap-2">
                        الأسئلة ({quiz.questions?.length || 0})
                    </h3>

                    {(!quiz.questions || quiz.questions.length === 0) ? (
                        <div className="text-center py-12 text-[#636E72]">
                            لا توجد أسئلة في هذا الاختبار
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {quiz.questions.map((question, index) => {
                                const qText = typeof question.question_text === 'string'
                                    ? JSON.parse(question.question_text).ar
                                    : (question.question_text as any).ar;

                                return (
                                    <div key={question.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                                        <div className="flex items-start gap-3 mb-4">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-shibl-crimson text-white flex items-center justify-center text-sm font-medium mt-0.5">
                                                {index + 1}
                                            </span>
                                            <div className="flex-1">
                                                <p className="text-[#1F1F1F] font-medium text-base mb-1">{qText}</p>
                                                <span className="text-xs bg-slate-100 text-[#636E72] px-2 py-0.5 rounded">
                                                    {question.points} درجات
                                                </span>
                                            </div>
                                        </div>

                                        {question.question_type === 'mcq' && question.options && (
                                            <div className="space-y-2 pr-9">
                                                {question.options.map((option) => {
                                                    const oText = typeof option.option_text === 'string'
                                                        ? JSON.parse(option.option_text).ar
                                                        : (option.option_text as any).ar;
                                                    return (
                                                        <div
                                                            key={option.id}
                                                            className={`flex items-center gap-3 p-3 rounded-lg border ${option.is_correct
                                                                ? 'bg-emerald-50 border-emerald-200'
                                                                : 'bg-white border-slate-100'
                                                                }`}
                                                        >
                                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${option.is_correct
                                                                ? 'border-emerald-500 bg-emerald-500 text-white'
                                                                : 'border-slate-300'
                                                                }`}>
                                                                {option.is_correct && <CheckCircle size={12} />}
                                                            </div>
                                                            <span className={`text-sm ${option.is_correct ? 'text-emerald-900 font-medium' : 'text-[#4B5563]'}`}>
                                                                {oText}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {question.question_type === 'essay' && question.model_answer && (
                                            <div className="mt-3 pr-9">
                                                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                                                    <p className="text-xs font-semibold text-purple-700 mb-1 flex items-center gap-1">
                                                        <CheckCircle size={12} />
                                                        الإجابة النموذجية
                                                    </p>
                                                    <p className="text-sm text-[#1F1F1F]">
                                                        {typeof question.model_answer === 'string'
                                                            ? JSON.parse(question.model_answer).ar
                                                            : (question.model_answer as any).ar}
                                                    </p>
                                                    {(question as any).model_answer_image_url && (
                                                        <div className="mt-3">
                                                            <img
                                                                src={(question as any).model_answer_image_url}
                                                                alt="صورة الإجابة النموذجية"
                                                                className="max-w-full max-h-48 rounded-lg border border-purple-200 object-contain bg-white"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-xl bg-white border border-slate-200 text-[#1F1F1F] hover:bg-slate-50 transition-colors shadow-sm font-medium"
                    >
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );
}
