/**
 * CourseGradingTab - Displays essay answers requiring grading for a specific course
 * Integrates with TeacherCourseDetailsPage as a "التصحيح" tab
 * Features: Attempt listing, grading status filters, open grading modal
 */

import { useState, useEffect, useCallback } from 'react';
import {
    ClipboardCheck,
    Clock,
    CheckCircle2,
    AlertCircle,
    User,
    FileText,
    ChevronLeft,
    Filter,
    Search,
    Loader2,
    RefreshCw,
    Award,
} from 'lucide-react';
import { Skeleton } from '../../ui/Skeleton';
import {
    quizService,
    type QuizAttemptForGrading,
    type AttemptAnswerForGrading,
    getQuizName,
} from '../../../../data/api/quizService';
import toast from 'react-hot-toast';
import { EssayGradingModal } from './EssayGradingModal';

// ==================== TYPES ====================

interface CourseGradingTabProps {
    courseId: number;
    courseName: string;
}

type GradingFilter = 'all' | 'pending' | 'graded';

// ==================== ATTEMPT CARD SKELETON ====================

function AttemptCardSkeleton() {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-56" />
                    </div>
                </div>
                <Skeleton className="h-7 w-24 rounded-full" />
            </div>
            <div className="flex items-center gap-4 mt-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex justify-end mt-4">
                <Skeleton className="h-9 w-28 rounded-lg" />
            </div>
        </div>
    );
}

// ==================== GRADING STATUS BADGE ====================

function GradingStatusBadge({ attempt }: { attempt: QuizAttemptForGrading }) {
    const essayAnswers = attempt.answers.filter(a => a.question_type === 'essay');
    const gradedCount = essayAnswers.filter(a => a.is_correct !== null).length;
    const totalEssays = essayAnswers.length;

    if (totalEssays === 0) {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                <CheckCircle2 size={14} />
                لا توجد أسئلة مقالية
            </span>
        );
    }

    if (gradedCount === totalEssays) {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                <CheckCircle2 size={14} />
                تم التصحيح ({gradedCount}/{totalEssays})
            </span>
        );
    }

    if (gradedCount > 0) {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                <Clock size={14} />
                جزئي ({gradedCount}/{totalEssays})
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600">
            <AlertCircle size={14} />
            بانتظار التصحيح ({totalEssays})
        </span>
    );
}

// ==================== ATTEMPT CARD ====================

interface AttemptCardProps {
    attempt: QuizAttemptForGrading;
    onOpenGrading: (attempt: QuizAttemptForGrading) => void;
}

function AttemptCard({ attempt, onOpenGrading }: AttemptCardProps) {
    const essayAnswers = attempt.answers.filter(a => a.question_type === 'essay');
    const isFullyGraded = essayAnswers.length > 0 && essayAnswers.every(a => a.is_correct !== null);
    const totalPoints = attempt.answers.reduce((sum, a) => sum + a.points, 0);
    const earnedPoints = attempt.answers.reduce((sum, a) => sum + (a.earned_points ?? 0), 0);

    return (
        <div className={`bg-white rounded-xl border transition-all hover:shadow-md group ${isFullyGraded ? 'border-emerald-200' : 'border-slate-200 hover:border-shibl-crimson/30'
            }`}>
            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-shibl-crimson/10 to-shibl-red-500/10 flex items-center justify-center flex-shrink-0">
                            <User size={20} className="text-shibl-crimson" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-900 truncate text-sm">
                                {attempt.student.name}
                            </h4>
                            <p className="text-xs text-slate-500 truncate text-right" dir="ltr">
                                {attempt.student.email}
                            </p>
                        </div>
                    </div>
                    <GradingStatusBadge attempt={attempt} />
                </div>

                {/* Quiz Info */}
                <div className="bg-slate-50 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-2 text-sm text-slate-700 font-medium mb-1">
                        <FileText size={14} className="text-shibl-crimson" />
                        <span className="flex items-center gap-1.5 font-bold">
                            {getQuizName(attempt.quiz.name)}
                        </span>
                        {attempt.quiz.unit && !Array.isArray(attempt.quiz.unit.name) && (attempt.quiz.unit.name.ar || attempt.quiz.unit.name.en) && (
                            <span className="text-[10px] font-normal px-2 py-0.5 bg-slate-100 rounded-full border border-slate-200">
                                {attempt.quiz.unit.name.ar || attempt.quiz.unit.name.en}
                            </span>
                        )}
                        {attempt.quiz.lecture && (
                            <span className="text-[10px] font-normal px-2 py-0.5 bg-slate-100 rounded-full border border-slate-200">
                                {attempt.quiz.lecture.title.ar || attempt.quiz.lecture.title.en}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(attempt.completed_at).toLocaleDateString('ar-EG', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </span>
                        <span className="flex items-center gap-1">
                            <Award size={12} />
                            {earnedPoints} / {totalPoints} نقطة
                        </span>
                        <span>
                            {essayAnswers.length} سؤال مقالي
                        </span>
                    </div>
                </div>

                {/* Action */}
                {essayAnswers.length > 0 && (
                    <div className="flex justify-end">
                        <button
                            onClick={() => onOpenGrading(attempt)}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isFullyGraded
                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                : 'bg-shibl-crimson text-white hover:bg-shibl-red-600 shadow-md shadow-shibl-crimson/20'
                                }`}
                        >
                            <ClipboardCheck size={16} />
                            {isFullyGraded ? 'مراجعة التصحيح' : 'ابدأ التصحيح'}
                            <ChevronLeft size={14} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ==================== EMPTY STATE ====================

function EmptyGradingState({ filter }: { filter: GradingFilter }) {
    const messages = {
        all: 'لا توجد محاولات اختبار لهذا الكورس بعد',
        pending: 'لا توجد محاولات تنتظر التصحيح — عمل رائع! 🎉',
        graded: 'لم يتم تصحيح أي محاولات بعد',
    };

    return (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-6">
                <ClipboardCheck size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">التصحيح</h3>
            <p className="text-slate-500 max-w-sm mx-auto text-center">
                {messages[filter]}
            </p>
        </div>
    );
}

// ==================== MAIN COMPONENT ====================

export function CourseGradingTab({ courseId, courseName }: CourseGradingTabProps) {
    const [attempts, setAttempts] = useState<QuizAttemptForGrading[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<GradingFilter>('pending');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAttempt, setSelectedAttempt] = useState<QuizAttemptForGrading | null>(null);

    // Fetch all attempts for this course's quizzes
    const fetchAttempts = useCallback(async () => {
        try {
            setLoading(true);
            // Get attempts filtered by course
            const response = await quizService.getAllTeacherAttempts(courseId);
            setAttempts(response.data || []);
        } catch (error) {
            console.error('Failed to fetch grading attempts:', error);
            toast.error('فشل في تحميل المحاولات');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAttempts();
    }, [fetchAttempts]);

    // Filter logic
    const filteredAttempts = attempts.filter(attempt => {
        const essayAnswers = attempt.answers.filter(a => a.question_type === 'essay');

        // Only show attempts that have essay questions
        if (essayAnswers.length === 0) return false;

        // Filter by grading status
        const isFullyGraded = essayAnswers.every(a => a.is_correct !== null);
        const isPartiallyGraded = essayAnswers.some(a => a.is_correct !== null) && !isFullyGraded;

        if (filter === 'pending' && isFullyGraded) return false;
        if (filter === 'graded' && !isFullyGraded) return false;

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const studentName = attempt.student.name.toLowerCase();
            const quizName = getQuizName(attempt.quiz.name).toLowerCase();
            if (!studentName.includes(query) && !quizName.includes(query)) return false;
        }

        return true;
    });

    // Stats
    const allEssayAttempts = attempts.filter(a =>
        a.answers.some(ans => ans.question_type === 'essay')
    );
    const pendingCount = allEssayAttempts.filter(a => {
        const essays = a.answers.filter(ans => ans.question_type === 'essay');
        return essays.some(ans => ans.is_correct === null);
    }).length;
    const gradedCount = allEssayAttempts.filter(a => {
        const essays = a.answers.filter(ans => ans.question_type === 'essay');
        return essays.every(ans => ans.is_correct !== null);
    }).length;

    // Handle grading completion (refresh data)
    const handleGradingComplete = useCallback(() => {
        fetchAttempts();
    }, [fetchAttempts]);

    return (
        <div className="space-y-6">
            {/* Header with Stats */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <ClipboardCheck className="text-shibl-crimson" size={22} />
                        تصحيح الأسئلة المقالية
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        راجع وصحح إجابات الطلاب المقالية لاختبارات هذا الكورس
                    </p>
                </div>
                <button
                    onClick={fetchAttempts}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    تحديث
                </button>
            </div>

            {/* Stats Cards */}
            {!loading && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                            <FileText size={20} className="text-slate-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">إجمالي المحاولات</p>
                            <p className="text-lg font-bold text-slate-900">{allEssayAttempts.length}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-red-100 p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                            <AlertCircle size={20} className="text-red-500" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">بانتظار التصحيح</p>
                            <p className="text-lg font-bold text-red-600">{pendingCount}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-emerald-100 p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <CheckCircle2 size={20} className="text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">تم التصحيح</p>
                            <p className="text-lg font-bold text-emerald-600">{gradedCount}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="بحث بالاسم أو عنوان الاختبار..."
                        className="w-full pr-10 pl-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-shibl-crimson/20 focus:border-shibl-crimson transition-colors"
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                    {([
                        { key: 'pending' as const, label: 'بانتظار', icon: Clock },
                        { key: 'all' as const, label: 'الكل', icon: Filter },
                        { key: 'graded' as const, label: 'مصحح', icon: CheckCircle2 },
                    ]).map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filter === key
                                ? 'bg-white text-shibl-crimson shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <Icon size={14} />
                            {label}
                            {key === 'pending' && pendingCount > 0 && (
                                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">
                                    {pendingCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Attempts List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <AttemptCardSkeleton key={i} />
                    ))}
                </div>
            ) : filteredAttempts.length > 0 ? (
                <div className="space-y-4">
                    {filteredAttempts.map((attempt) => (
                        <AttemptCard
                            key={attempt.id}
                            attempt={attempt}
                            onOpenGrading={setSelectedAttempt}
                        />
                    ))}
                </div>
            ) : (
                <EmptyGradingState filter={filter} />
            )}

            {/* Grading Modal */}
            {selectedAttempt && (
                <EssayGradingModal
                    isOpen={!!selectedAttempt}
                    onClose={() => setSelectedAttempt(null)}
                    attempt={selectedAttempt}
                    onGradingComplete={handleGradingComplete}
                />
            )}
        </div>
    );
}

export default CourseGradingTab;
