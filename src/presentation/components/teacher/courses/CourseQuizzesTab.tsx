/**
 * CourseQuizzesTab - Displays quizzes for a specific course
 * Integrates with TeacherCourseDetailsPage as a tab content
 * Features: Quiz listing, status badges, smart linking selector
 */

import { useState, useEffect, useCallback } from 'react';
import {
    Plus,
    FileQuestion,
    Clock,
    Users,
    Edit,
    Trash2,
    Eye,
    Send,
    MoreVertical,
    Loader2,
    CheckCircle,
    XCircle,
    AlertCircle,
    BookOpen,
    Layers,
    Video
} from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { quizService, Quiz, QuizStatus, getQuizName, getQuizStatusStyle } from '../../../../data/api/quizService';
import { useLanguage } from '../../../hooks';
import { CreateQuizModal } from '../../teacher';
import { Unit } from '../../../../types/unit';

// ==================== TYPES ====================

interface CourseQuizzesTabProps {
    courseId: number;
    courseName: string;
    units: Unit[];
    teacherId: number;
}

// ==================== STATUS BADGE COMPONENT ====================

function QuizStatusBadge({ status }: { status: QuizStatus }) {
    const style = getQuizStatusStyle(status);

    const icons: Record<QuizStatus, React.ReactNode> = {
        draft: <Edit className="w-3 h-3" />,
        pending: <Clock className="w-3 h-3" />,
        approved: <CheckCircle className="w-3 h-3" />,
        rejected: <XCircle className="w-3 h-3" />,
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${style.bgClass} ${style.textClass}`}>
            {icons[status]}
            {style.label}
        </span>
    );
}

// ==================== SCOPE BADGE COMPONENT ====================

function QuizScopeBadge({ quiz }: { quiz: Quiz }) {
    // Determine the scope level
    if (quiz.lecture_id && quiz.lecture) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded">
                <Video className="w-3 h-3" />
                محاضرة: {quiz.lecture.title?.ar || quiz.lecture.title?.en || 'غير محدد'}
            </span>
        );
    }

    if (quiz.unit_id && quiz.unit) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded">
                <Layers className="w-3 h-3" />
                وحدة: {quiz.unit.name?.ar || quiz.unit.name?.en || 'غير محدد'}
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded">
            <BookOpen className="w-3 h-3" />
            على مستوى الكورس
        </span>
    );
}

// ==================== QUIZ CARD COMPONENT ====================

interface QuizCardProps {
    quiz: Quiz;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onSubmit: () => void;
}

function QuizCard({ quiz, onView, onEdit, onDelete, onSubmit }: QuizCardProps) {
    const [showMenu, setShowMenu] = useState(false);

    const quizName = getQuizName(quiz.name);
    const canEdit = quiz.status === 'draft' || quiz.status === 'rejected';
    const canSubmit = quiz.status === 'draft';

    return (
        <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-slate-200 dark:border-white/10 p-4 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 dark:text-white truncate">{quizName}</h4>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        <QuizStatusBadge status={quiz.status || 'draft'} />
                        <QuizScopeBadge quiz={quiz} />
                    </div>
                </div>

                {/* Actions Menu */}
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <MoreVertical className="w-4 h-4 text-slate-500 dark:text-gray-400" />
                    </button>

                    {showMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowMenu(false)}
                            />
                            <div className="absolute left-0 top-full mt-1 w-40 bg-white dark:bg-[#1E1E1E] rounded-lg shadow-lg border border-slate-200 dark:border-white/10 py-1 z-20">
                                <button
                                    onClick={() => { onView(); setShowMenu(false); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5"
                                >
                                    <Eye className="w-4 h-4" />
                                    عرض
                                </button>
                                {canEdit && (
                                    <button
                                        onClick={() => { onEdit(); setShowMenu(false); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5"
                                    >
                                        <Edit className="w-4 h-4" />
                                        تعديل
                                    </button>
                                )}
                                {canSubmit && (
                                    <button
                                        onClick={() => { onSubmit(); setShowMenu(false); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10"
                                    >
                                        <Send className="w-4 h-4" />
                                        إرسال للموافقة
                                    </button>
                                )}
                                <button
                                    onClick={() => { onDelete(); setShowMenu(false); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    حذف
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                    <FileQuestion className="w-4 h-4" />
                    {quiz.questions_count || 0} سؤال
                </span>
                <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {quiz.duration_minutes || 0} دقيقة
                </span>
                <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {quiz.passing_percentage}% للنجاح
                </span>
            </div>
        </div>
    );
}

// ==================== QUIZ CARD SKELETON ====================

function QuizCardSkeleton() {
    return (
        <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-slate-200 dark:border-white/5 p-4 animate-pulse">
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                    <div className="h-5 bg-slate-200 dark:bg-white/10 rounded w-3/4 mb-2" />
                    <div className="flex gap-2">
                        <div className="h-5 bg-slate-200 dark:bg-white/10 rounded w-20" />
                        <div className="h-5 bg-slate-200 dark:bg-white/10 rounded w-24" />
                    </div>
                </div>
                <div className="w-8 h-8 bg-slate-200 dark:bg-white/10 rounded-lg" />
            </div>
            <div className="flex gap-4">
                <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-16" />
                <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-16" />
                <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-20" />
            </div>
        </div>
    );
}

// ==================== EMPTY STATE ====================

function EmptyState({ onCreateNew }: { onCreateNew: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 bg-slate-50 dark:bg-white/5 rounded-xl border border-dashed border-slate-300 dark:border-white/10">
            <FileQuestion className="w-12 h-12 text-slate-300 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-slate-700 dark:text-gray-300 mb-2">لا توجد اختبارات</h3>
            <p className="text-slate-500 dark:text-gray-400 mb-4 text-center max-w-sm">
                لم يتم إنشاء أي اختبارات لهذا الكورس بعد. ابدأ بإنشاء اختبارك الأول.
            </p>
            <button
                onClick={onCreateNew}
                className="flex items-center gap-2 px-4 py-2 bg-shibl-crimson text-white rounded-lg hover:bg-shibl-crimson/90 transition-colors shadow-md"
            >
                <Plus className="w-4 h-4" />
                إنشاء اختبار جديد
            </button>
        </div>
    );
}

// ==================== MAIN COMPONENT ====================

export function CourseQuizzesTab({ courseId, courseName, units, teacherId }: CourseQuizzesTabProps) {
    const { isRTL } = useLanguage();

    // State
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

    // Create a mock TeacherCourse for the modal (pre-selects current course)
    const coursesForModal = [{
        id: courseId,
        name: { ar: courseName, en: courseName },
        description: { ar: '', en: '' },
        price: 0,
        is_active: true,
        created_at: '',
        updated_at: '',
    }];

    // Fetch quizzes for this course
    const fetchQuizzes = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await quizService.getQuizzes({ course_id: courseId });
            setQuizzes(response.data || []);
        } catch (err: any) {
            console.error('Failed to fetch quizzes:', err);
            setError(err?.response?.data?.message || 'فشل في تحميل الاختبارات');
        } finally {
            setIsLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchQuizzes();
    }, [fetchQuizzes]);

    // Listen for real-time quiz status changes (WebSocket notifications)
    useEffect(() => {
        const handleQuizStatusChange = (event: Event) => {
            const customEvent = event as CustomEvent;
            console.log('CourseQuizzesTab: Quiz status changed via WebSocket:', customEvent.detail);
            // Refresh the quiz list to reflect the new status
            fetchQuizzes();
        };

        console.log('CourseQuizzesTab: Adding quiz-status-change event listener');
        window.addEventListener('quiz-status-change', handleQuizStatusChange);
        return () => {
            console.log('CourseQuizzesTab: Removing quiz-status-change event listener');
            window.removeEventListener('quiz-status-change', handleQuizStatusChange);
        };
    }, [fetchQuizzes]);

    // Handlers
    const handleView = (quiz: Quiz) => {
        // TODO: Open preview modal
        toast.success(`عرض: ${getQuizName(quiz.name)}`);
    };

    const handleEdit = async (quiz: Quiz) => {
        // Fetch full quiz with questions for editing
        try {
            const response = await quizService.getQuiz(quiz.id);
            setSelectedQuiz(response.data);
            setShowCreateModal(true);
        } catch (err) {
            toast.error('فشل في تحميل بيانات الاختبار');
        }
    };

    const handleDelete = async (quiz: Quiz) => {
        const result = await Swal.fire({
            title: 'حذف الاختبار؟',
            text: `هل أنت متأكد من حذف "${getQuizName(quiz.name)}"؟`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'نعم، احذف',
            cancelButtonText: 'إلغاء',
        });

        if (result.isConfirmed) {
            try {
                await quizService.deleteQuiz(quiz.id);
                toast.success('تم حذف الاختبار بنجاح');
                fetchQuizzes();
            } catch (err) {
                toast.error('فشل في حذف الاختبار');
            }
        }
    };

    const handleSubmitForApproval = async (quiz: Quiz) => {
        const result = await Swal.fire({
            title: 'إرسال للموافقة؟',
            text: 'سيتم إرسال هذا الاختبار للمسؤول للمراجعة والموافقة.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'نعم، أرسل',
            cancelButtonText: 'إلغاء',
        });

        if (result.isConfirmed) {
            try {
                await quizService.submitForApproval(quiz.id);
                toast.success('تم إرسال الاختبار للموافقة');
                fetchQuizzes();
            } catch (err) {
                toast.error('فشل في إرسال الاختبار');
            }
        }
    };

    const handleCreateNew = () => {
        setSelectedQuiz(null);
        setShowCreateModal(true);
    };

    const handleModalSuccess = (optimisticQuiz?: any) => {
        // Optimistic UI: instantly show the new/updated quiz card
        if (optimisticQuiz && optimisticQuiz.id) {
            setQuizzes(prev => {
                const exists = prev.some(q => q.id === optimisticQuiz.id);
                if (exists) {
                    // Update existing quiz in place
                    return prev.map(q => q.id === optimisticQuiz.id
                        ? { ...q, ...optimisticQuiz }
                        : q
                    );
                }
                // Prepend new quiz to top of list
                const newQuiz: Quiz = {
                    ...optimisticQuiz,
                    course: { id: courseId, name: { ar: courseName, en: courseName } },
                };
                return [newQuiz, ...prev];
            });
        }
        setShowCreateModal(false);
        setSelectedQuiz(null);

        // Silent background refetch for full data consistency
        quizService.getQuizzes({ course_id: courseId }).then(res => {
            setQuizzes(res.data || []);
        }).catch(() => { /* silent */ });
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex justify-end">
                    <div className="h-10 w-40 bg-slate-200 dark:bg-[#1E1E1E] rounded-lg animate-pulse" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <QuizCardSkeleton />
                    <QuizCardSkeleton />
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-16 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-900/30">
                <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                <button
                    onClick={fetchQuizzes}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header with Add Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleCreateNew}
                    className="flex items-center gap-2 px-4 py-2 bg-shibl-crimson text-white rounded-lg hover:bg-shibl-crimson/90 transition-colors shadow-md"
                >
                    <Plus className="w-4 h-4" />
                    إنشاء اختبار
                </button>
            </div>

            {/* Content */}
            {quizzes.length === 0 ? (
                <EmptyState onCreateNew={handleCreateNew} />
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {quizzes.map((quiz) => (
                        <QuizCard
                            key={quiz.id}
                            quiz={quiz}
                            onView={() => handleView(quiz)}
                            onEdit={() => handleEdit(quiz)}
                            onDelete={() => handleDelete(quiz)}
                            onSubmit={() => handleSubmitForApproval(quiz)}
                        />
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <CreateQuizModal
                    isOpen={showCreateModal}
                    onClose={() => {
                        setShowCreateModal(false);
                        setSelectedQuiz(null);
                    }}
                    onSuccess={handleModalSuccess}
                    courses={coursesForModal as any}
                    quiz={selectedQuiz}
                    lockedCourseId={courseId}
                />
            )}
        </div>
    );
}

export default CourseQuizzesTab;

