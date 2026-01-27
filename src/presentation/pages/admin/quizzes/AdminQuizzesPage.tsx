
import React, { useState, useEffect } from 'react';
import { adminService, QuizData } from '../../../../data/api/adminService';
import { Search, Filter, Loader2, MoreVertical, Eye, CheckCircle, XCircle, AlertCircle, BookOpen, GraduationCap } from 'lucide-react';
import { QuizReviewModal } from '../../../components/admin/quizzes/QuizReviewModal';
import toast from 'react-hot-toast';

export const AdminQuizzesPage: React.FC = () => {
    const [quizzes, setQuizzes] = useState<QuizData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState<'draft' | 'pending' | 'approved' | 'rejected'>('pending');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedQuiz, setSelectedQuiz] = useState<QuizData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchQuizzes = async () => {
        setIsLoading(true);
        try {
            const response = await adminService.getQuizzes({
                status: selectedStatus,
                page,
                per_page: 15
            });
            // @ts-ignore - Assuming API response structure
            console.log('Quiz Response:', response);
            if (response.data && response.data.data) {
                setQuizzes(response.data.data);
                setTotalPages(response.data.last_page || 1);
            } else if (Array.isArray(response.data)) {
                setQuizzes(response.data);
                setTotalPages(1);
            } else {
                setQuizzes([]);
            }
        } catch (error) {
            console.error(error);
            toast.error('فشل في تحميل الاختبارات');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchQuizzes();
    }, [selectedStatus, page]);

    const handleReviewClick = (quiz: QuizData) => {
        setSelectedQuiz(quiz);
        setIsModalOpen(true);
    };

    const getTranslatedName = (name: any) => {
        if (typeof name === 'string') return name;
        return name?.ar || name?.en || 'بدون اسم';
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">إدارة الاختبارات</h1>
                    <p className="text-slate-500 mt-1">مراجعة واعتماد اختبارات المدرسين</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center">
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    {[
                        { id: 'pending', label: 'قيد الانتظار' },
                        { id: 'approved', label: 'تمت الموافقة' },
                        { id: 'rejected', label: 'مرفوض' },
                        { id: 'draft', label: 'مسودة' }
                    ].map((status) => (
                        <button
                            key={status.id}
                            onClick={() => {
                                setSelectedStatus(status.id as any);
                                setPage(1);
                            }}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${selectedStatus === status.id
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {status.label}
                        </button>
                    ))}
                </div>

                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="بحث عن اختبار..."
                        className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {isLoading ? (
                    <div className="p-12 flex justify-center items-center text-slate-400">
                        <Loader2 className="animate-spin mb-2" />
                        <span className="mr-2">جاري التحميل...</span>
                    </div>
                ) : quizzes.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                                <tr>
                                    <th className="px-6 py-4">الاختبار</th>
                                    <th className="px-6 py-4">الدورة / المدرس</th>
                                    <th className="px-6 py-4">التفاصيل</th>
                                    <th className="px-6 py-4">تاريخ الإنشاء</th>
                                    <th className="px-6 py-4">الحالة</th>
                                    <th className="px-6 py-4 text-left">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {quizzes.map((quiz) => (
                                    <tr key={quiz.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                    <BookOpen size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900">{getTranslatedName(quiz.name)}</div>
                                                    <div className="text-xs text-slate-500 mt-0.5">#{quiz.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                                                    <GraduationCap size={14} className="text-slate-400" />
                                                    {quiz.course ? getTranslatedName(quiz.course.name) : 'غير محدد'}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {quiz.teacher?.name || 'مدرس غير معروف'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-600">
                                                <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-xs">
                                                    {quiz.questions_count || quiz.questions?.length || 0} سؤال
                                                </span>
                                                <span className="mx-2 text-slate-300">|</span>
                                                <span className="text-xs">{quiz.duration_minutes} دقيقة</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-600">
                                                {new Date(quiz.created_at).toLocaleDateString('ar-EG')}
                                            </div>
                                            <div className="text-xs text-slate-400 mt-0.5">
                                                {new Date(quiz.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${quiz.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                                quiz.status === 'approved' ? 'bg-green-50 text-green-700 border border-green-100' :
                                                    quiz.status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-100' :
                                                        'bg-slate-100 text-slate-600'
                                                }`}>
                                                {quiz.status === 'pending' && <AlertCircle size={12} />}
                                                {quiz.status === 'approved' && <CheckCircle size={12} />}
                                                {quiz.status === 'rejected' && <XCircle size={12} />}
                                                {statusLabels[quiz.status] || quiz.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleReviewClick(quiz)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1.5 text-sm font-medium"
                                                >
                                                    <Eye size={16} />
                                                    عرض
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-16 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen size={32} className="text-slate-300" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">لا توجد اختبارات</h3>
                        <p className="text-slate-500 mt-1">لم يتم العثور على اختبارات في هذه القائمة.</p>
                    </div>
                )}

                {/* Pagination (Simple Implementation) */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-slate-200 flex justify-center gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            السابق
                        </button>
                        <span className="px-3 py-1 text-slate-600">
                            صفحة {page} من {totalPages}
                        </span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            التالي
                        </button>
                    </div>
                )}
            </div>

            {selectedQuiz && (
                <QuizReviewModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    quiz={selectedQuiz}
                    onSuccess={fetchQuizzes}
                />
            )}
        </div>
    );
};

// Status translations
const statusLabels: Record<string, string> = {
    draft: 'مسودة',
    pending: 'قيد الانتظار',
    approved: 'تمت الموافقة',
    rejected: 'مرفوض',
};
