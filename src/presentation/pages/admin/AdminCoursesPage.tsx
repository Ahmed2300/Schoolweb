import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Plus,
    BookOpen,
    GraduationCap,
    Lightbulb,
    Users,
    PlayCircle,
    Eye,
    Edit2,
    Trash2,
    ChevronDown,
    Loader2,
    AlertCircle,
    Layers,
    Mail,
    Clock,
    X,
} from 'lucide-react';
import { adminService, CourseData } from '../../../data/api/adminService';
import { AddCourseModal } from '../../components/admin/AddCourseModal';
import { EditCourseModal } from '../../components/admin/EditCourseModal';
import { DeleteConfirmModal } from '../../components/admin/DeleteConfirmModal';
import { Pagination } from '../../components/courses/Pagination';

interface GradeOption {
    id: number;
    name: string;
}

interface SemesterOption {
    id: number;
    name: string;
    grade_id?: number;
}

type MainTab = 'academic' | 'skills';

interface Course {
    id: number;
    name: { ar?: string; en?: string } | string;
    description?: { ar?: string; en?: string } | string;
    code: string;
    credits: number;
    duration_hours?: number;
    price?: number;
    old_price?: number;
    is_promoted?: boolean;
    is_active: boolean;
    start_date?: string;
    end_date?: string;
    teacher_id?: number;
    grade_id?: number;
    semester_id?: number;
    subject_id?: number;
    grade?: { id: number; name: string | { ar?: string; en?: string } };
    semester?: { id: number; name: string | { ar?: string; en?: string } };
    subject?: { id: number; name: string | { ar?: string; en?: string } };
    teacher?: { id: number; name: string };
    image?: string;
    subscriptions_count?: number;
}

interface CourseStats {
    totalCourses: number;
    activeCourses: number;
    draftCourses: number;
}

const statusConfig: Record<string, { label: string; bgColor: string; textColor: string }> = {
    active: { label: 'نشط', bgColor: 'bg-green-100', textColor: 'text-green-700' },
    draft: { label: 'مسودة', bgColor: 'bg-amber-100', textColor: 'text-amber-700' },
    archived: { label: 'مؤرشف', bgColor: 'bg-slate-100', textColor: 'text-slate-500' },
};

const extractName = (name: unknown): string => {
    if (!name) return '';
    if (typeof name === 'string') {
        if (name.trim().startsWith('{')) {
            try {
                const parsed = JSON.parse(name);
                return parsed.ar || parsed.en || name;
            } catch {
                return name;
            }
        }
        return name;
    }
    if (typeof name === 'object' && name !== null) {
        const obj = name as Record<string, string>;
        return obj.ar || obj.en || '';
    }
    return '';
};

const getCourseName = (course: Course): string => {
    return extractName(course.name) || 'بدون اسم';
};

const getCourseStatus = (course: Course): string => {
    return course.is_active ? 'active' : 'draft';
};

export function AdminCoursesPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<MainTab>('academic');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null);
    const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);

    const [grades, setGrades] = useState<GradeOption[]>([]);
    const [semesters, setSemesters] = useState<SemesterOption[]>([]);
    const [loadingDropdowns, setLoadingDropdowns] = useState(false);

    const [courses, setCourses] = useState<Course[]>([]);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<{
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    } | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<CourseStats>({
        totalCourses: 0,
        activeCourses: 0,
        draftCourses: 0,
    });

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState<CourseData | null>(null);
    const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);

    // Subscriber Modal State
    const [subscriberModalCourse, setSubscriberModalCourse] = useState<Course | null>(null);
    const [subscribers, setSubscribers] = useState<Array<{
        id: number;
        status: string;
        start_date: string | null;
        end_date: string | null;
        created_at: string;
        student?: { id: number; name: string; email: string };
    }>>([]);
    const [subscribersLoading, setSubscribersLoading] = useState(false);

    const filteredSemesters = selectedGradeId
        ? semesters.filter(s => s.grade_id === selectedGradeId)
        : semesters;

    const fetchDropdownData = useCallback(async () => {
        setLoadingDropdowns(true);
        try {
            const [gradesRes, semestersRes] = await Promise.allSettled([
                adminService.getGrades({ per_page: 100 }),
                adminService.getSemesters({ per_page: 100 }),
            ]);

            if (gradesRes.status === 'fulfilled') {
                setGrades(gradesRes.value.data.map(g => ({
                    id: g.id,
                    name: extractName((g as any).name) || `صف ${g.id}`,
                })));
            }
            if (semestersRes.status === 'fulfilled') {
                setSemesters(semestersRes.value.data.map(s => ({
                    id: s.id,
                    name: extractName(s.name),
                    grade_id: s.grade_id,
                })));
            }
        } catch (err) {
            console.error('Error fetching dropdown options:', err);
        } finally {
            setLoadingDropdowns(false);
        }
    }, []);

    const fetchCourses = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const isAcademic = activeTab === 'academic';

            const response = await adminService.getCourses({
                search: searchQuery || undefined,
                grade_id: selectedGradeId || undefined,
                semester_id: selectedSemesterId || undefined,
                is_academic: isAcademic,
                per_page: 20,
                page: page,
            });

            const coursesData = response.data || [];
            setCourses(coursesData);
            setMeta(response.meta);

            // Calculate stats based on the current view
            // Note: For a real dashboard, you might want these stats to be global or strictly related to the tab
            const activeCourses = coursesData.filter((c: Course) => c.is_active).length;
            setStats({
                totalCourses: response.meta?.total || coursesData.length,
                activeCourses,
                draftCourses: coursesData.length - activeCourses,
            });
        } catch (err: unknown) {
            console.error('Error fetching courses:', err);
            const error = err as { response?: { data?: { message?: string; error?: string } }; message?: string };
            const errorMessage = error.response?.data?.message
                || error.response?.data?.error
                || error.message
                || 'فشل في تحميل الكورسات';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, selectedGradeId, selectedSemesterId, activeTab, page]);

    useEffect(() => {
        fetchDropdownData();
    }, [fetchDropdownData]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const handleGradeChange = (gradeId: number | null) => {
        setPage(1);
        setSelectedGradeId(gradeId);
        setSelectedSemesterId(null);
    };

    // Stats display
    const statsDisplay = [
        { icon: <GraduationCap size={22} className="text-blue-600" />, label: 'إجمالي الكورسات', value: loading ? '...' : stats.totalCourses.toString(), bgColor: 'bg-blue-50' },
        { icon: <Lightbulb size={22} className="text-green-600" />, label: 'كورسات نشطة', value: loading ? '...' : stats.activeCourses.toString(), bgColor: 'bg-green-50' },
        { icon: <AlertCircle size={22} className="text-amber-600" />, label: 'مسودات', value: loading ? '...' : stats.draftCourses.toString(), bgColor: 'bg-amber-50' },
        { icon: <PlayCircle size={22} className="text-purple-600" />, label: 'إجمالي الدروس', value: '-', bgColor: 'bg-purple-50' }, // TODO: Backend needs lessons_count
    ];

    return (
        <>
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <h1 className="text-2xl font-extrabold text-charcoal dark:text-white">إدارة الكورسات</h1>

                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 lg:w-72">
                        <input
                            type="text"
                            placeholder="بحث في الكورسات..."
                            className="w-full h-11 pl-4 pr-11 rounded-[12px] bg-white dark:bg-[#2A2A2A] dark:text-white dark:placeholder:text-slate-500 border border-slate-200 dark:border-white/10 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all text-sm"
                            value={searchQuery}
                            onChange={(e) => {
                                setPage(1);
                                setSearchQuery(e.target.value);
                            }}
                        />
                        <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>

                    {/* Add Course Button */}
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="h-11 px-6 rounded-pill bg-shibl-crimson hover:bg-shibl-crimson-dark text-white font-bold text-sm shadow-crimson transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2"
                    >
                        <Plus size={18} />
                        <span>إضافة كورس</span>
                    </button>
                </div>
            </div>

            {/* Main Tabs - Academic vs Skills */}
            {/* TODO: Backend will add course_type field to distinguish academic vs non-academic */}
            <div className="flex gap-3 mb-6">
                <button
                    onClick={() => {
                        setPage(1);
                        setActiveTab('academic');
                    }}
                    className={`flex items-center gap-3 px-6 py-3.5 rounded-[16px] font-bold text-sm transition-all duration-300 ${activeTab === 'academic'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                        : 'bg-white dark:bg-[#1E1E1E] text-slate-600 dark:text-slate-300 hover:bg-blue-50 border border-slate-200 dark:border-white/10'
                        }`}
                >
                    <GraduationCap size={20} />
                    <span>الشق الأكاديمي</span>
                </button>
                <button
                    onClick={() => {
                        setPage(1);
                        setActiveTab('skills');
                    }}
                    className={`flex items-center gap-3 px-6 py-3.5 rounded-[16px] font-bold text-sm transition-all duration-300 ${activeTab === 'skills'
                        ? 'bg-green-600 text-white shadow-lg shadow-green-600/25'
                        : 'bg-white dark:bg-[#1E1E1E] text-slate-600 dark:text-slate-300 hover:bg-green-50 border border-slate-200 dark:border-white/10'
                        }`}
                >
                    <Lightbulb size={20} />
                    <span>الشق غير الأكاديمي</span>
                </button>
            </div>

            {/* Stats Mini Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {statsDisplay.map((stat, index) => (
                    <div key={index} className="bg-white dark:bg-[#1E1E1E] rounded-[16px] p-4 shadow-card border border-slate-100 dark:border-white/10 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-[12px] flex items-center justify-center ${stat.bgColor}`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-xs text-slate-grey font-medium">{stat.label}</p>
                            <span className="text-xl font-extrabold text-charcoal dark:text-white">{stat.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative">
                    <select
                        value={selectedGradeId ?? ''}
                        onChange={(e) => handleGradeChange(e.target.value ? parseInt(e.target.value) : null)}
                        disabled={loadingDropdowns}
                        className="h-11 pl-10 pr-4 rounded-[12px] bg-white dark:bg-[#2A2A2A] dark:text-white dark:border-white/10 border border-slate-200 text-sm font-medium text-charcoal appearance-none cursor-pointer focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all disabled:opacity-50"
                    >
                        <option value="">كل الصفوف</option>
                        {grades.map((grade) => (
                            <option key={grade.id} value={grade.id}>{grade.name}</option>
                        ))}
                    </select>
                    <ChevronDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                <div className="relative">
                    <select
                        value={selectedSemesterId ?? ''}
                        onChange={(e) => {
                            setPage(1);
                            setSelectedSemesterId(e.target.value ? parseInt(e.target.value) : null);
                        }}
                        disabled={loadingDropdowns || !selectedGradeId}
                        className={`h-11 pl-10 pr-4 rounded-[12px] bg-white dark:bg-[#2A2A2A] dark:text-white dark:border-white/10 border border-slate-200 text-sm font-medium text-charcoal appearance-none cursor-pointer focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all ${!selectedGradeId ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={!selectedGradeId ? 'اختر الصف أولاً' : undefined}
                    >
                        <option value="">كل الفصول</option>
                        {filteredSemesters.map((semester) => (
                            <option key={semester.id} value={semester.id}>{semester.name}</option>
                        ))}
                    </select>
                    <ChevronDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                {(selectedGradeId || selectedSemesterId) && (
                    <button
                        onClick={() => {
                            setPage(1);
                            setSelectedGradeId(null);
                            setSelectedSemesterId(null);
                        }}
                        className="h-11 px-4 rounded-[12px] bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium transition-colors"
                    >
                        مسح الفلاتر
                    </button>
                )}
                {loadingDropdowns && (
                    <span className="text-xs text-slate-400 self-center flex items-center gap-1">
                        <Loader2 size={14} className="animate-spin" />
                        جاري التحميل...
                    </span>
                )}
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-[16px] mb-6 flex items-center gap-3">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                    <button
                        onClick={fetchCourses}
                        className="mr-auto px-4 py-2 bg-red-100 hover:bg-red-200 rounded-[10px] text-sm font-semibold transition-colors"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            )}

            {/* Loading State - Shimmer Skeleton */}
            {loading && (
                <div className="bg-white dark:bg-[#1E1E1E] rounded-[16px] shadow-card border border-slate-100 dark:border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-[#2A2A2A] border-b border-slate-100 dark:border-white/10">
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الكورس</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الكود</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الساعات</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">السعر</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الحالة</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                                {[...Array(6)].map((_, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" />
                                                <div className="h-4 w-32 rounded-md bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${index * 100}ms` }} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 w-16 rounded-md bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${index * 100 + 50}ms` }} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 w-12 rounded-md bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${index * 100 + 100}ms` }} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 w-20 rounded-md bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${index * 100 + 150}ms` }} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-6 w-14 rounded-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${index * 100 + 200}ms` }} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${index * 100 + 250}ms` }} />
                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${index * 100 + 300}ms` }} />
                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${index * 100 + 350}ms` }} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Courses Table */}
            {!loading && !error && (
                <>
                    <div className="bg-white dark:bg-[#1E1E1E] rounded-[16px] shadow-card border border-slate-100 dark:border-white/10 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-[#2A2A2A] border-b border-slate-100 dark:border-white/10">
                                        <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase w-20">الصورة</th>
                                        <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الكورس</th>
                                        <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الكود</th>
                                        <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الساعات</th>
                                        <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">السعر</th>
                                        <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">المشتركين</th>
                                        <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الحالة</th>
                                        <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                                    {courses.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <BookOpen size={48} className="text-slate-300" />
                                                    <p className="text-slate-grey">لا توجد كورسات</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        courses.map((course) => {
                                            const status = getCourseStatus(course);
                                            return (
                                                <tr key={course.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
                                                            {course.image ? (
                                                                <img
                                                                    src={course.image}
                                                                    alt={getCourseName(course)}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                                    <BookOpen size={20} className="opacity-50" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div>
                                                                <span className="font-semibold text-charcoal dark:text-white block">{getCourseName(course)}</span>
                                                                <span className="text-xs text-slate-400">{course.credits} ساعات معتمدة</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-grey font-mono">{course.code}</td>
                                                    <td className="px-6 py-4 text-sm text-charcoal dark:text-white">{course.duration_hours || '-'}</td>
                                                    <td className="px-6 py-4">
                                                        {course.price ? (
                                                            <div>
                                                                <span className="font-bold text-shibl-crimson">{course.price} ر.ع</span>
                                                                {course.old_price && course.old_price > course.price && (
                                                                    <span className="text-xs text-slate-400 line-through mr-2">{course.old_price}</span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button
                                                            onClick={async () => {
                                                                setSubscriberModalCourse(course);
                                                                setSubscribersLoading(true);
                                                                try {
                                                                    const res = await adminService.getCourseSubscribers(course.id);
                                                                    setSubscribers(res.data || []);
                                                                } catch {
                                                                    setSubscribers([]);
                                                                } finally {
                                                                    setSubscribersLoading(false);
                                                                }
                                                            }}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors cursor-pointer group"
                                                            title="عرض المشتركين"
                                                        >
                                                            <Users size={16} className="text-indigo-500 group-hover:scale-110 transition-transform" />
                                                            <span className={`font-semibold ${(course.subscriptions_count || 0) > 0
                                                                ? 'text-indigo-600 dark:text-indigo-400'
                                                                : 'text-slate-400 dark:text-slate-500'
                                                                }`}>
                                                                {course.subscriptions_count || 0}
                                                            </span>
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${statusConfig[status]?.bgColor || 'bg-slate-100'} ${statusConfig[status]?.textColor || 'text-slate-600'}`}>
                                                            {statusConfig[status]?.label || status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <button className="w-8 h-8 rounded-[8px] bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors" title="عرض">
                                                                <Eye size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => navigate(`/admin/courses/${course.id}/units`)}
                                                                className="w-8 h-8 rounded-[8px] bg-purple-100 hover:bg-purple-200 flex items-center justify-center text-purple-600 transition-colors"
                                                                title="إدارة الوحدات"
                                                            >
                                                                <Layers size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingCourse(course as unknown as CourseData)}
                                                                className="w-8 h-8 rounded-[8px] bg-blue-100 hover:bg-blue-200 flex items-center justify-center text-blue-600 transition-colors"
                                                                title="تعديل"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => setDeletingCourse(course)}
                                                                className="w-8 h-8 rounded-[8px] bg-red-100 hover:bg-red-200 flex items-center justify-center text-red-600 transition-colors"
                                                                title="حذف"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* Pagination */}
                    <div className="mt-6 flex justify-center">
                        <Pagination
                            currentPage={page}
                            totalPages={meta?.last_page || 1}
                            onPageChange={setPage}
                            onNext={() => setPage((p) => Math.min(p + 1, meta?.last_page || 1))}
                            onPrev={() => setPage((p) => Math.max(p - 1, 1))}
                            isLoading={loading}
                        />
                    </div>
                </>
            )}



            {/* Add Course Modal */}
            <AddCourseModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={() => {
                    setShowAddModal(false);
                    fetchCourses();
                }}
            />

            {/* Edit Course Modal */}
            <EditCourseModal
                isOpen={!!editingCourse}
                course={editingCourse}
                onClose={() => setEditingCourse(null)}
                onSuccess={() => {
                    setEditingCourse(null);
                    fetchCourses();
                }}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={!!deletingCourse}
                title="حذف الكورس"
                message="هل أنت متأكد من حذف هذا الكورس؟ سيتم حذف جميع المحاضرات والبيانات المرتبطة به."
                itemName={deletingCourse ? getCourseName(deletingCourse) : undefined}
                onConfirm={async () => {
                    if (deletingCourse) {
                        await adminService.deleteCourse(deletingCourse.id);
                        fetchCourses();
                    }
                }}
                onClose={() => setDeletingCourse(null)}
            />

            {/* Subscriber List Modal */}
            {subscriberModalCourse && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200"
                    onClick={() => { setSubscriberModalCourse(null); setSubscribers([]); }}
                >
                    <div
                        className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[80vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                    <Users size={22} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">المشتركين</h3>
                                    <p className="text-indigo-100 text-sm">{getCourseName(subscriberModalCourse)}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setSubscriberModalCourse(null); setSubscribers([]); }}
                                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X size={20} className="text-white" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="overflow-y-auto flex-1 p-4 overscroll-contain">
                            {subscribersLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-32" />
                                                <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-48" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : subscribers.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                                        <Users size={32} className="text-slate-300 dark:text-slate-600" />
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">لا يوجد مشتركين في هذا الكورس</p>
                                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">سيظهر الطلاب هنا عند اشتراكهم</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between mb-3 px-1">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                            إجمالي المشتركين: <strong className="text-slate-700 dark:text-slate-200">{subscribers.length}</strong>
                                        </span>
                                    </div>
                                    {subscribers.map(sub => (
                                        <div
                                            key={sub.id}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm shrink-0">
                                                {sub.student?.name?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-slate-800 dark:text-white text-sm truncate">
                                                    {sub.student?.name || 'طالب غير معروف'}
                                                </p>
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    <Mail size={12} className="text-slate-400 shrink-0" />
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                        {sub.student?.email || '—'}
                                                    </p>
                                                </div>
                                                {sub.start_date && (
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        <Clock size={12} className="text-slate-400 shrink-0" />
                                                        <p className="text-xs text-slate-400">
                                                            {new Date(sub.start_date).toLocaleDateString('ar-SA')}
                                                            {sub.end_date && ` — ${new Date(sub.end_date).toLocaleDateString('ar-SA')}`}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ${sub.status === 'active'
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                                                : sub.status === 'pending'
                                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                                                    : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400'
                                                }`}>
                                                {sub.status === 'active' ? 'نشط' : sub.status === 'pending' ? 'معلق' : sub.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
