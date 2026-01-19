import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../hooks';
import { CreateQuizModal, QuizPreviewModal } from '../../components/teacher';
import {
    quizService,
    teacherService,
    getQuizName,
    getQuizTypeLabel,
    getQuizStatusStyle,
    getCourseName,
    Quiz,
    QuizType,
    QuizStatus,
    TeacherCourse
} from '../../../data/api';

// Icons
import {
    Plus,
    Search,
    Filter,
    ClipboardList,
    FileQuestion,
    FileEdit,
    Clock,
    CheckCircle,
    AlertCircle,
    RefreshCw,
    MoreVertical,
    Trash2,
    Edit,
    Eye,
    Send,
    BookOpen
} from 'lucide-react';

// ==================== COMPONENTS ====================

// Quiz status badge
function StatusBadge({ status }: { status: QuizStatus }) {
    const style = getQuizStatusStyle(status);
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${style.bgClass} ${style.textClass}`}>
            {style.label}
        </span>
    );
}

// Quiz type badge
function TypeBadge({ type }: { type: QuizType }) {
    const isEssay = type === 'essay';
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${isEssay ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
            }`}>
            {isEssay ? <FileEdit size={12} /> : <FileQuestion size={12} />}
            {getQuizTypeLabel(type)}
        </span>
    );
}

// Quiz card component
interface QuizCardProps {
    quiz: Quiz;
    onView: (id: number) => void;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    onSubmit: (id: number) => void;
}

function QuizCard({ quiz, onView, onEdit, onDelete, onSubmit }: QuizCardProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const status = quiz.status || 'draft';
    const canEdit = status === 'draft' || status === 'rejected';
    const canSubmit = status === 'draft';

    return (
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all group">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                    <h3 className="text-[#1F1F1F] font-semibold text-base truncate mb-1">
                        {getQuizName(quiz.name)}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-[#636E72]">
                        <BookOpen size={14} />
                        <span className="truncate">
                            {quiz.course ? getCourseName(quiz.course.name) : 'بدون دورة'}
                        </span>
                    </div>
                </div>

                {/* Actions Menu */}
                <div className="relative">
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="p-2 rounded-lg hover:bg-slate-100 text-[#636E72] transition-colors"
                    >
                        <MoreVertical size={18} />
                    </button>

                    {menuOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setMenuOpen(false)}
                            />
                            <div className="absolute left-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20 min-w-[160px]">
                                <button
                                    onClick={() => { onView(quiz.id); setMenuOpen(false); }}
                                    className="w-full px-4 py-2 text-right text-sm text-[#1F1F1F] hover:bg-slate-50 flex items-center gap-2"
                                >
                                    <Eye size={16} />
                                    عرض التفاصيل
                                </button>
                                {canEdit && (
                                    <button
                                        onClick={() => { onEdit(quiz.id); setMenuOpen(false); }}
                                        className="w-full px-4 py-2 text-right text-sm text-[#1F1F1F] hover:bg-slate-50 flex items-center gap-2"
                                    >
                                        <Edit size={16} />
                                        تعديل
                                    </button>
                                )}
                                {canSubmit && (
                                    <button
                                        onClick={() => { onSubmit(quiz.id); setMenuOpen(false); }}
                                        className="w-full px-4 py-2 text-right text-sm text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"
                                    >
                                        <Send size={16} />
                                        إرسال للموافقة
                                    </button>
                                )}
                                {canEdit && (
                                    <button
                                        onClick={() => { onDelete(quiz.id); setMenuOpen(false); }}
                                        className="w-full px-4 py-2 text-right text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                        <Trash2 size={16} />
                                        حذف
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
                <TypeBadge type={quiz.quiz_type} />
                <StatusBadge status={status} />
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-[#636E72]">
                <div className="flex items-center gap-1.5">
                    <FileQuestion size={14} />
                    <span>{quiz.questions_count || 0} سؤال</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    <span>{quiz.duration_minutes || 0} دقيقة</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <CheckCircle size={14} />
                    <span>{quiz.passing_percentage || 0}% للنجاح</span>
                </div>
            </div>
        </div>
    );
}

// Quiz card skeleton
function QuizCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl p-5 border border-slate-100 animate-pulse">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="h-5 w-40 bg-slate-200 rounded mb-2" />
                    <div className="h-4 w-24 bg-slate-200 rounded" />
                </div>
                <div className="h-8 w-8 bg-slate-200 rounded" />
            </div>
            <div className="flex gap-2 mb-4">
                <div className="h-6 w-24 bg-slate-200 rounded-full" />
                <div className="h-6 w-20 bg-slate-200 rounded-full" />
            </div>
            <div className="flex gap-4">
                <div className="h-4 w-16 bg-slate-200 rounded" />
                <div className="h-4 w-16 bg-slate-200 rounded" />
                <div className="h-4 w-16 bg-slate-200 rounded" />
            </div>
        </div>
    );
}

// Empty state
function EmptyState({ onCreateNew }: { onCreateNew: () => void }) {
    return (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-6">
                <ClipboardList size={40} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-[#1F1F1F] mb-2">
                لا توجد اختبارات بعد
            </h3>
            <p className="text-[#636E72] mb-6 max-w-md mx-auto">
                ابدأ بإنشاء اختبارك الأول لتقييم طلابك. يمكنك إنشاء اختبارات اختيار من متعدد أو أسئلة مكتوبة.
            </p>
            <button
                onClick={onCreateNew}
                className="h-11 px-6 rounded-xl bg-shibl-crimson hover:bg-red-600 text-white font-medium flex items-center gap-2 mx-auto transition-all hover:-translate-y-0.5 shadow-lg shadow-shibl-crimson/20"
            >
                <Plus size={20} />
                إنشاء اختبار جديد
            </button>
        </div>
    );
}

// ==================== MAIN COMPONENT ====================

export function TeacherQuizzesPage() {
    const { isRTL } = useLanguage();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // State
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [courses, setCourses] = useState<TeacherCourse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewQuiz, setViewQuiz] = useState<Quiz | null>(null);

    // Filters from URL
    const searchQuery = searchParams.get('search') || '';
    const filterType = searchParams.get('type') as QuizType | 'all' || 'all';
    const filterStatus = searchParams.get('status') as QuizStatus | 'all' || 'all';
    const filterCourse = searchParams.get('course') || 'all';

    // Fetch data
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [quizzesResponse, coursesResponse] = await Promise.all([
                quizService.getMyQuizzes(),
                teacherService.getMyCourses({ per_page: 100 })
            ]);
            setQuizzes(quizzesResponse.data || []);
            setCourses(coursesResponse.data || []);
        } catch (err) {
            console.error('Failed to fetch quizzes:', err);
            setError('فشل في تحميل الاختبارات');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Filter quizzes
    const filteredQuizzes = useMemo(() => {
        return quizzes.filter(quiz => {
            // Search filter
            if (searchQuery) {
                const name = getQuizName(quiz.name).toLowerCase();
                if (!name.includes(searchQuery.toLowerCase())) return false;
            }
            // Type filter
            if (filterType !== 'all' && quiz.quiz_type !== filterType) return false;
            // Status filter
            if (filterStatus !== 'all' && quiz.status !== filterStatus) return false;
            // Course filter
            if (filterCourse !== 'all' && quiz.course_id.toString() !== filterCourse) return false;
            return true;
        });
    }, [quizzes, searchQuery, filterType, filterStatus, filterCourse]);

    // Handlers
    const handleSearch = (value: string) => {
        if (value) {
            searchParams.set('search', value);
        } else {
            searchParams.delete('search');
        }
        setSearchParams(searchParams);
    };

    const handleTypeFilter = (type: string) => {
        if (type === 'all') {
            searchParams.delete('type');
        } else {
            searchParams.set('type', type);
        }
        setSearchParams(searchParams);
    };

    const handleStatusFilter = (status: string) => {
        if (status === 'all') {
            searchParams.delete('status');
        } else {
            searchParams.set('status', status);
        }
        setSearchParams(searchParams);
    };

    const handleView = async (id: number) => {
        try {
            setLoading(true);
            const response = await quizService.getQuiz(id);
            if (response.data) {
                setViewQuiz(response.data);
                setViewModalOpen(true);
            }
        } catch (err) {
            console.error('Failed to fetch quiz for view:', err);
            alert('فشل في تحميل تفاصيل الاختبار');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (id: number) => {
        try {
            // Find quiz in local state first for instant feedback (optimistic)
            // But we need full details (questions), so we must fetch
            setLoading(true);
            const response = await quizService.getQuiz(id);
            if (response.data) {
                setEditingQuiz(response.data);
                setCreateModalOpen(true);
            }
        } catch (err) {
            console.error('Failed to fetch quiz for edit:', err);
            alert('فشل في تحميل تفاصيل الاختبار للتعديل');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا الاختبار؟')) return;
        try {
            await quizService.deleteQuiz(id);
            fetchData();
        } catch (err) {
            console.error('Failed to delete quiz:', err);
            alert('فشل في حذف الاختبار');
        }
    };

    const handleSubmit = async (id: number) => {
        if (!confirm('هل تريد إرسال هذا الاختبار للموافقة؟ لن تتمكن من تعديله بعد الإرسال.')) return;
        try {
            await quizService.submitForApproval(id);
            fetchData();
        } catch (err) {
            console.error('Failed to submit quiz:', err);
            alert('فشل في إرسال الاختبار للموافقة');
        }
    };

    const handleCreateNew = () => {
        setCreateModalOpen(true);
    };

    return (
        <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-[#1F1F1F]">
                        إدارة الاختبارات
                    </h1>
                    <p className="text-[#636E72] mt-1">
                        إنشاء وإدارة اختبارات الدورات الخاصة بك
                    </p>
                </div>
                <button
                    onClick={handleCreateNew}
                    className="h-11 px-5 rounded-xl bg-shibl-crimson hover:bg-red-600 text-white font-medium flex items-center gap-2 transition-all hover:-translate-y-0.5 shadow-lg shadow-shibl-crimson/20"
                >
                    <Plus size={20} />
                    إنشاء اختبار جديد
                </button>
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="ابحث عن اختبار..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full h-11 px-4 pr-11 rounded-xl bg-[#F8F9FA] border border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all text-sm text-[#1F1F1F] placeholder:text-[#636E72]"
                        />
                        <Search
                            size={18}
                            className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-[#636E72]`}
                        />
                    </div>

                    {/* Type Filter */}
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-[#636E72]" />
                        <select
                            value={filterType}
                            onChange={(e) => handleTypeFilter(e.target.value)}
                            className="h-11 px-4 rounded-xl bg-[#F8F9FA] border border-slate-200 focus:border-shibl-crimson outline-none transition-all text-sm text-[#1F1F1F]"
                        >
                            <option value="all">كل الأنواع</option>
                            <option value="mcq">اختيار من متعدد</option>
                            <option value="essay">أسئلة مكتوبة</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <select
                        value={filterStatus}
                        onChange={(e) => handleStatusFilter(e.target.value)}
                        className="h-11 px-4 rounded-xl bg-[#F8F9FA] border border-slate-200 focus:border-shibl-crimson outline-none transition-all text-sm text-[#1F1F1F]"
                    >
                        <option value="all">كل الحالات</option>
                        <option value="draft">مسودة</option>
                        <option value="pending">في انتظار الموافقة</option>
                        <option value="approved">معتمد</option>
                        <option value="rejected">مرفوض</option>
                    </select>

                    {/* Course Filter */}
                    {courses.length > 0 && (
                        <select
                            value={filterCourse}
                            onChange={(e) => {
                                if (e.target.value === 'all') {
                                    searchParams.delete('course');
                                } else {
                                    searchParams.set('course', e.target.value);
                                }
                                setSearchParams(searchParams);
                            }}
                            className="h-11 px-4 rounded-xl bg-[#F8F9FA] border border-slate-200 focus:border-shibl-crimson outline-none transition-all text-sm text-[#1F1F1F]"
                        >
                            <option value="all">كل الدورات</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {getCourseName(course.name)}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertCircle size={20} className="text-red-500" />
                        <span className="text-red-700">{error}</span>
                    </div>
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-sm transition-colors"
                    >
                        <RefreshCw size={14} />
                        إعادة المحاولة
                    </button>
                </div>
            )}

            {/* Quizzes Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <QuizCardSkeleton key={i} />
                    ))}
                </div>
            ) : filteredQuizzes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredQuizzes.map(quiz => (
                        <QuizCard
                            key={quiz.id}
                            quiz={quiz}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onSubmit={handleSubmit}
                        />
                    ))}
                </div>
            ) : (
                <EmptyState onCreateNew={handleCreateNew} />
            )}

            {/* Create/Edit Quiz Modal */}
            <CreateQuizModal
                isOpen={createModalOpen}
                onClose={() => {
                    setCreateModalOpen(false);
                    setEditingQuiz(null);
                }}
                onSuccess={fetchData}
                courses={courses}
                quiz={editingQuiz}
            />

            {/* View Quiz Modal */}
            <QuizPreviewModal
                isOpen={viewModalOpen}
                onClose={() => {
                    setViewModalOpen(false);
                    setViewQuiz(null);
                }}
                quiz={viewQuiz}
            />
        </div>
    );
}

export default TeacherQuizzesPage;
