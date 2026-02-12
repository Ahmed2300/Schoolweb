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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                    <div>
                        <h2 className="text-xl font-bold text-[#1F1F1F] dark:text-white mb-1">{quizName}</h2>
                        <div className="flex items-center gap-2 text-sm text-[#636E72] dark:text-slate-400">
                            <BookOpen size={14} />
                            <span>{courseName}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 mx-1" />
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${quiz.quiz_type === 'mcq' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'}`}>
                                {quiz.quiz_type === 'mcq' ? 'اختيار من متعدد' : 'أسئلة مكتوبة'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-[#636E72] dark:text-slate-400 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-[#636E72] dark:text-slate-400">
                        <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                            <Clock size={16} />
                        </div>
                        <div>
                            <p className="text-xs text-[#9CA3AF] dark:text-slate-500">المدة</p>
                            <p className="text-sm font-semibold text-[#1F1F1F] dark:text-white">{quiz.duration_minutes || 'غير محدود'} دقيقة</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-[#636E72] dark:text-slate-400">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <CheckCircle size={16} />
                        </div>
                        <div>
                            <p className="text-xs text-[#9CA3AF] dark:text-slate-500">نسبة النجاح</p>
                            <p className="text-sm font-semibold text-[#1F1F1F] dark:text-white">{quiz.passing_percentage}%</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 dark:bg-slate-900/50">
                    <h3 className="font-semibold text-[#1F1F1F] dark:text-white mb-4 flex items-center gap-2">
                        الأسئلة ({quiz.questions?.length || 0})
                    </h3>

                    {(!quiz.questions || quiz.questions.length === 0) ? (
                        <div className="text-center py-12 text-[#636E72] dark:text-slate-400">
                            لا توجد أسئلة في هذا الاختبار
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {quiz.questions.map((question, index) => {
                                const qText = typeof question.question_text === 'string'
                                    ? JSON.parse(question.question_text).ar
                                    : (question.question_text as any).ar;

                                return (
                                    <div key={question.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                                        <div className="flex items-start gap-3 mb-4">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-shibl-crimson text-white flex items-center justify-center text-sm font-medium mt-0.5">
                                                {index + 1}
                                            </span>
                                            <div className="flex-1">
                                                <p className="text-[#1F1F1F] dark:text-slate-200 font-medium text-base mb-1">{qText}</p>
                                                <span className="text-xs bg-slate-100 dark:bg-slate-700 text-[#636E72] dark:text-slate-300 px-2 py-0.5 rounded">
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
                                                                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900/30'
                                                                : 'bg-white dark:bg-slate-700/50 border-slate-100 dark:border-slate-700'
                                                                }`}
                                                        >
                                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${option.is_correct
                                                                ? 'border-emerald-500 bg-emerald-500 text-white'
                                                                : 'border-slate-300 dark:border-slate-500'
                                                                }`}>
                                                                {option.is_correct && <CheckCircle size={12} />}
                                                            </div>
                                                            <span className={`text-sm ${option.is_correct ? 'text-emerald-900 dark:text-emerald-400 font-medium' : 'text-[#4B5563] dark:text-slate-300'}`}>
                                                                {oText}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {question.question_type === 'essay' && question.model_answer && (
                                            <div className="mt-3 pr-9">
                                                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-100 dark:border-purple-900/30">
                                                    <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-1 flex items-center gap-1">
                                                        <CheckCircle size={12} />
                                                        الإجابة النموذجية
                                                    </p>
                                                    <p className="text-sm text-[#1F1F1F] dark:text-slate-200">
                                                        {typeof question.model_answer === 'string'
                                                            ? JSON.parse(question.model_answer).ar
                                                            : (question.model_answer as any).ar}
                                                    </p>
                                                    {(question as any).model_answer_image_url && (
                                                        <div className="mt-3">
                                                            <img
                                                                src={(question as any).model_answer_image_url}
                                                                alt="صورة الإجابة النموذجية"
                                                                className="max-w-full max-h-48 rounded-lg border border-purple-200 dark:border-purple-800 object-contain bg-white"
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
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#1F1F1F] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm font-medium"
                    >
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );
}
