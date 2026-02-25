import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage, useAuth } from '../../hooks';
import { teacherService, TeacherCourse, getCourseName, getCourseDescription, getLocalizedName } from '../../../data/api';
import { teacherContentApprovalService } from '../../../data/api/teacherContentApprovalService';

// Icons
import {
    Plus,
    Search,
    BookOpen,
    AlertCircle,
    RefreshCw,
    Loader2
} from 'lucide-react';

import TeacherCourseModal from '../../components/teacher/courses/TeacherCourseModal';
import { TeacherEditCourseRequestModal } from '../../components/teacher/courses/modals/TeacherEditCourseRequestModal';
import Swal from 'sweetalert2';

// ==================== TYPES ====================

type CourseStatus = 'all' | 'active' | 'draft' | 'archived';

// ==================== COMPONENTS ====================

import TeacherCourseCard, { CourseCardSkeleton } from '../../components/teacher/courses/TeacherCourseCard';

// Filter tabs
interface FilterTabsProps {
    activeFilter: CourseStatus;
    onFilterChange: (filter: CourseStatus) => void;
    counts: { all: number; active: number; draft: number; archived: number };
}

function FilterTabs({ activeFilter, onFilterChange, counts }: FilterTabsProps) {
    const tabs: { key: CourseStatus; label: string }[] = [
        { key: 'all', label: `الكل (${counts.all})` },
        { key: 'active', label: `نشط (${counts.active})` },
        { key: 'draft', label: `مسودة (${counts.draft})` },
    ];

    return (
        <div className="flex gap-2">
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    onClick={() => onFilterChange(tab.key)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeFilter === tab.key
                        ? 'bg-shibl-crimson text-white'
                        : 'bg-slate-100 dark:bg-[#1E1E1E] text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/5 hover:text-charcoal dark:hover:text-white'
                        }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

// ==================== MAIN COMPONENT ====================

export function TeacherCoursesPage() {
    const { isRTL } = useLanguage();
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    // Check if teacher is academic (cannot create courses)
    // Need to cast user to TeacherData-like shape or check property existence
    const isAcademic = (user as any)?.is_academic === true || (user as any)?.is_academic === 1;

    // Get initial values from URL
    const initialSearch = searchParams.get('search') || '';
    const initialFilter = (searchParams.get('status') as CourseStatus) || 'all';

    // State
    const [courses, setCourses] = useState<TeacherCourse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [activeFilter, setActiveFilter] = useState<CourseStatus>(initialFilter);
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<TeacherCourse | undefined>(undefined);
    // Track pending approval requests per course
    const [pendingRequests, setPendingRequests] = useState<Record<number, boolean>>({});

    // Fetch courses
    const fetchCourses = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await teacherService.getMyCourses({ per_page: 50 });
            const fetchedCourses = response.data || [];
            setCourses(fetchedCourses);

            // Fetch pending counts for each course
            const pendingMap: Record<number, boolean> = {};
            await Promise.all(
                fetchedCourses.map(async (course) => {
                    try {
                        const count = await teacherContentApprovalService.getPendingCount(course.id);
                        pendingMap[course.id] = count > 0;
                    } catch {
                        pendingMap[course.id] = false;
                    }
                })
            );
            setPendingRequests(pendingMap);
        } catch (err: unknown) {
            console.error('Failed to fetch courses:', err);
            setError('فشل في تحميل الدورات');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    // Real-time updates for content approvals
    // Listen for real-time approval updates via the global event dispatched by useTeacherNotifications hook
    // This prevents conflicting Echo subscriptions/unsubscriptions on the same channel
    useEffect(() => {
        const handleApprovalUpdate = (e: CustomEvent) => {

            const approval = e.detail;

            // Allow time for backend to process if needed, then refresh
            fetchCourses();

            // Be smart about optimistic updates if possible
            if (approval && approval.approvable_type.includes('Course')) {
                setCourses((prev) =>
                    prev.map((course) => {
                        if (course.id === approval.approvable_id) {
                            return {
                                ...course,
                                pending_request_count: approval.status === 'pending' ? 1 : 0
                            };
                        }
                        return course;
                    })
                );
            }
        };

        window.addEventListener('teacher-approval-update', handleApprovalUpdate as EventListener);
        return () => window.removeEventListener('teacher-approval-update', handleApprovalUpdate as EventListener);
    }, [fetchCourses]);

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);
        if (activeFilter !== 'all') params.set('status', activeFilter);
        setSearchParams(params, { replace: true });
    }, [searchQuery, activeFilter, setSearchParams]);

    // Filter courses based on search and status
    const filteredCourses = courses.filter(course => {
        // Filter by status
        if (activeFilter === 'active' && !course.is_active) return false;
        if (activeFilter === 'draft' && course.is_active) return false;
        // archived filter would need a backend field

        // Filter by search
        if (searchQuery) {
            const name = getCourseName(course.name).toLowerCase();
            const description = getCourseDescription(course.description).toLowerCase();
            const query = searchQuery.toLowerCase();
            if (!name.includes(query) && !description.includes(query)) return false;
        }

        return true;
    });

    // Calculate counts for filter tabs
    const counts = {
        all: courses.length,
        active: courses.filter(c => c.is_active).length,
        draft: courses.filter(c => !c.is_active).length,
        archived: 0, // No archived status in current model
    };

    // Handlers
    const handleFilterChange = (filter: CourseStatus) => {
        setActiveFilter(filter);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const navigate = useNavigate();

    const handleViewCourse = (id: number) => {
        navigate(`/teacher/courses/${id}`);
    };

    const handleEditCourse = (id: number) => {
        const course = courses.find(c => c.id === id);
        if (course) {
            setSelectedCourse(course);
            setIsModalOpen(true);
        }
    };

    const handleAddCourse = () => {
        setSelectedCourse(undefined);
        setIsModalOpen(true);
    };

    const handleDeleteCourse = async (id: number) => {
        const result = await Swal.fire({
            title: 'هل أنت متأكد؟',
            text: "لن تتمكن من التراجع عن هذا الإجراء!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'نعم، احذفها!',
            cancelButtonText: 'إلغاء'
        });

        if (result.isConfirmed) {
            try {
                await teacherService.deleteCourse(id);
                // Refresh list
                setCourses(current => current.filter(c => c.id !== id));
                Swal.fire(
                    'تم الحذف!',
                    'تم حذف الدورة بنجاح.',
                    'success'
                );
            } catch (error) {
                console.error('Delete failed', error);
                Swal.fire(
                    'خطأ',
                    'حدث خطأ أثناء الحذف',
                    'error'
                );
            }
        }
    };

    const handleModalSuccess = () => {
        fetchCourses();
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-charcoal dark:text-white">دوراتي</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        {loading ? (
                            <span className="inline-block h-4 w-24 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                        ) : (
                            `إجمالي ${courses.length} دورات`
                        )}
                    </p>
                </div>
                {!isAcademic && (
                    <button
                        onClick={handleAddCourse}
                        className="h-11 px-5 rounded-xl bg-shibl-crimson hover:bg-red-600 text-white font-medium flex items-center gap-2 transition-all hover:-translate-y-0.5 shadow-lg shadow-shibl-crimson/20"
                    >
                        <Plus size={18} />
                        <span>إضافة دورة جديدة</span>
                    </button>
                )}
            </div>

            {/* Error State */}
            {error && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertCircle size={20} className="text-red-500 dark:text-red-400" />
                        <span className="text-red-700 dark:text-red-300">{error}</span>
                    </div>
                    <button
                        onClick={fetchCourses}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/40 text-red-700 dark:text-red-300 text-sm transition-colors"
                    >
                        <RefreshCw size={14} />
                        إعادة المحاولة
                    </button>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="ابحث عن دورة..."
                        className="w-full h-11 px-4 pr-12 rounded-xl bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/10 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all text-sm text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500"
                    />
                    <Search
                        size={18}
                        className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`}
                    />
                </div>

                {/* Filter Tabs */}
                {!loading && (
                    <FilterTabs
                        activeFilter={activeFilter}
                        onFilterChange={handleFilterChange}
                        counts={counts}
                    />
                )}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <CourseCardSkeleton key={index} />
                    ))}
                </div>
            )}

            {/* Courses Grid */}
            {!loading && filteredCourses.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredCourses.map((course) => (
                        <TeacherCourseCard
                            key={course.id}
                            course={course}
                            onView={handleViewCourse}
                            onEdit={handleEditCourse}
                            onDelete={handleDeleteCourse}
                            hasPendingRequest={pendingRequests[course.id] || false}
                        />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && filteredCourses.length === 0 && (
                <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-6">
                        <BookOpen size={40} className="text-slate-400 dark:text-gray-500" />
                    </div>
                    {courses.length === 0 ? (
                        <>
                            <h3 className="text-xl font-bold text-charcoal dark:text-white mb-2">لا توجد دورات بعد</h3>
                            <p className="text-slate-500 dark:text-gray-400 mb-6">
                                {isAcademic ? 'لم يتم تعيين أي دورات لك بعد من قبل الإدارة' : 'ابدأ بإنشاء دورتك الأولى'}
                            </p>
                            {!isAcademic && (
                                <button
                                    onClick={handleAddCourse}
                                    className="h-11 px-6 rounded-xl bg-shibl-crimson hover:bg-red-600 text-white font-medium inline-flex items-center gap-2 transition-all"
                                >
                                    <Plus size={18} />
                                    <span>إنشاء دورة</span>
                                </button>
                            )}
                        </>
                    ) : (
                        <>
                            <h3 className="text-xl font-bold text-charcoal dark:text-white mb-2">لا توجد نتائج</h3>
                            <p className="text-slate-500 dark:text-gray-400">جرب تغيير معايير البحث أو الفلتر</p>
                        </>
                    )}
                </div>
            )}

            {/* Loading indicator for refresh */}
            {loading && courses.length > 0 && (
                <div className="fixed bottom-6 right-6 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg">
                    <Loader2 size={18} className="animate-spin text-shibl-crimson" />
                    <span className="text-charcoal dark:text-white text-sm">جاري التحديث...</span>
                </div>
            )}

            {/* Modals */}
            {selectedCourse ? (
                <TeacherEditCourseRequestModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    courseData={selectedCourse}
                    onSuccess={handleModalSuccess}
                />
            ) : (
                <TeacherCourseModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleModalSuccess}
                    initialData={undefined}
                />
            )}
        </div>
    );
}

export default TeacherCoursesPage;
