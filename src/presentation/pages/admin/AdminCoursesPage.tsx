import { useState, useEffect, useCallback } from 'react';
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
    AlertCircle
} from 'lucide-react';
import { adminService, CourseData } from '../../../data/api/adminService';
import { AddCourseModal } from '../../components/admin/AddCourseModal';
import { EditCourseModal } from '../../components/admin/EditCourseModal';
import { DeleteConfirmModal } from '../../components/admin/DeleteConfirmModal';

// ============================================================
// Types - Designed for future backend enhancements
// ============================================================

type CourseType = 'academic' | 'non_academic';
type CourseStatus = 'active' | 'draft' | 'archived';
type MainTab = 'academic' | 'skills';

// Current backend course structure
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
    // TODO: Backend will add these fields
    // course_type?: CourseType;
    // grade_id?: number;
    // semester_id?: number;
    // subject_id?: number;
    // category_id?: number;
    // grade?: { id: number; name: string };
    // semester?: { id: number; name: string };
    // subject?: { id: number; name: string };
    // category?: { id: number; name: string };
    // teacher?: { id: number; name: string };
    // students_count?: number;
    // lessons_count?: number;
}

interface CourseStats {
    totalCourses: number;
    activeCourses: number;
    draftCourses: number;
}

// ============================================================
// Configuration
// ============================================================

const statusConfig: Record<string, { label: string; bgColor: string; textColor: string }> = {
    active: { label: 'نشط', bgColor: 'bg-green-100', textColor: 'text-green-700' },
    draft: { label: 'مسودة', bgColor: 'bg-amber-100', textColor: 'text-amber-700' },
    archived: { label: 'مؤرشف', bgColor: 'bg-slate-100', textColor: 'text-slate-500' },
};

// Helper to get localized course name
const getCourseName = (course: Course): string => {
    if (typeof course.name === 'string') return course.name;
    return course.name?.ar || course.name?.en || 'بدون اسم';
};

// Helper to determine course status from is_active
const getCourseStatus = (course: Course): string => {
    return course.is_active ? 'active' : 'draft';
};

// ============================================================
// Component
// ============================================================

export function AdminCoursesPage() {
    const [activeTab, setActiveTab] = useState<MainTab>('academic');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGrade, setSelectedGrade] = useState('الكل');
    const [selectedTerm, setSelectedTerm] = useState('الكل');

    // Data states
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<CourseStats>({
        totalCourses: 0,
        activeCourses: 0,
        draftCourses: 0,
    });

    // Modal state
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState<CourseData | null>(null);
    const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);

    // Fetch courses
    const fetchCourses = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await adminService.getCourses({
                search: searchQuery || undefined,
                per_page: 20,
            });

            const coursesData = response.data || [];
            setCourses(coursesData);

            // Calculate stats
            const activeCourses = coursesData.filter((c: Course) => c.is_active).length;
            setStats({
                totalCourses: response.meta?.total || coursesData.length,
                activeCourses,
                draftCourses: coursesData.length - activeCourses,
            });
        } catch (err: any) {
            console.error('Error fetching courses:', err);
            setError(err.response?.data?.message || 'فشل في تحميل الكورسات');
        } finally {
            setLoading(false);
        }
    }, [searchQuery]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

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
                <h1 className="text-2xl font-extrabold text-charcoal">إدارة الكورسات</h1>

                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 lg:w-72">
                        <input
                            type="text"
                            placeholder="بحث في الكورسات..."
                            className="w-full h-11 pl-4 pr-11 rounded-[12px] bg-white border border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
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
                    onClick={() => setActiveTab('academic')}
                    className={`flex items-center gap-3 px-6 py-3.5 rounded-[16px] font-bold text-sm transition-all duration-300 ${activeTab === 'academic'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                        : 'bg-white text-slate-600 hover:bg-blue-50 border border-slate-200'
                        }`}
                >
                    <GraduationCap size={20} />
                    <span>الشق الأكاديمي</span>
                </button>
                <button
                    onClick={() => setActiveTab('skills')}
                    className={`flex items-center gap-3 px-6 py-3.5 rounded-[16px] font-bold text-sm transition-all duration-300 ${activeTab === 'skills'
                        ? 'bg-green-600 text-white shadow-lg shadow-green-600/25'
                        : 'bg-white text-slate-600 hover:bg-green-50 border border-slate-200'
                        }`}
                >
                    <Lightbulb size={20} />
                    <span>الشق غير الأكاديمي</span>
                </button>
            </div>

            {/* Stats Mini Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {statsDisplay.map((stat, index) => (
                    <div key={index} className="bg-white rounded-[16px] p-4 shadow-card flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-[12px] flex items-center justify-center ${stat.bgColor}`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-xs text-slate-grey font-medium">{stat.label}</p>
                            <span className="text-xl font-extrabold text-charcoal">{stat.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters - Disabled until backend adds grade/semester support */}
            <div className="flex gap-3 mb-6">
                <div className="relative">
                    <select
                        value={selectedGrade}
                        onChange={(e) => setSelectedGrade(e.target.value)}
                        disabled // TODO: Enable when backend adds grade_id
                        className="h-11 pl-10 pr-4 rounded-[12px] bg-white border border-slate-200 text-sm font-medium text-charcoal appearance-none cursor-not-allowed opacity-50 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none"
                        title="قريباً - في انتظار تحديث الـ Backend"
                    >
                        <option value="الكل">كل الصفوف</option>
                    </select>
                    <ChevronDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                <div className="relative">
                    <select
                        value={selectedTerm}
                        onChange={(e) => setSelectedTerm(e.target.value)}
                        disabled // TODO: Enable when backend adds semester_id
                        className="h-11 pl-10 pr-4 rounded-[12px] bg-white border border-slate-200 text-sm font-medium text-charcoal appearance-none cursor-not-allowed opacity-50 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none"
                        title="قريباً - في انتظار تحديث الـ Backend"
                    >
                        <option value="الكل">كل الترمات</option>
                    </select>
                    <ChevronDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                <span className="text-xs text-slate-400 self-center">(الفلترة قريباً)</span>
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

            {/* Loading State */}
            {loading && (
                <div className="bg-white rounded-[16px] shadow-card p-12 flex flex-col items-center justify-center gap-4">
                    <Loader2 size={40} className="text-shibl-crimson animate-spin" />
                    <p className="text-slate-grey">جاري تحميل الكورسات...</p>
                </div>
            )}

            {/* Courses Table */}
            {!loading && !error && (
                <div className="bg-white rounded-[16px] shadow-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الكورس</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الكود</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الساعات</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">السعر</th>
                                    {/* TODO: Add these columns when backend provides the data */}
                                    {/* <th>الصف</th> */}
                                    {/* <th>الترم</th> */}
                                    {/* <th>المادة</th> */}
                                    {/* <th>المدرس</th> */}
                                    {/* <th>الطلاب</th> */}
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الحالة</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {courses.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
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
                                            <tr key={course.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-[12px] bg-blue-100 flex items-center justify-center">
                                                            <BookOpen size={18} className="text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <span className="font-semibold text-charcoal block">{getCourseName(course)}</span>
                                                            <span className="text-xs text-slate-400">{course.credits} ساعات معتمدة</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-grey font-mono">{course.code}</td>
                                                <td className="px-6 py-4 text-sm text-charcoal">{course.duration_hours || '-'}</td>
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
                                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${statusConfig[status]?.bgColor || 'bg-slate-100'} ${statusConfig[status]?.textColor || 'text-slate-600'}`}>
                                                        {statusConfig[status]?.label || status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button className="w-8 h-8 rounded-[8px] bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors">
                                                            <Eye size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingCourse(course as unknown as CourseData)}
                                                            className="w-8 h-8 rounded-[8px] bg-blue-100 hover:bg-blue-200 flex items-center justify-center text-blue-600 transition-colors"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeletingCourse(course)}
                                                            className="w-8 h-8 rounded-[8px] bg-red-100 hover:bg-red-200 flex items-center justify-center text-red-600 transition-colors"
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
            )}

            {/* Future Backend Fields Notice */}
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-[12px] text-sm text-amber-700">
                <strong>ملاحظة للمطورين:</strong> الصفحة جاهزة لاستقبال الحقول الإضافية من الـ Backend:
                <code className="mx-1 px-2 py-0.5 bg-amber-100 rounded text-xs">grade_id</code>
                <code className="mx-1 px-2 py-0.5 bg-amber-100 rounded text-xs">semester_id</code>
                <code className="mx-1 px-2 py-0.5 bg-amber-100 rounded text-xs">subject_id</code>
                <code className="mx-1 px-2 py-0.5 bg-amber-100 rounded text-xs">category_id</code>
                <code className="mx-1 px-2 py-0.5 bg-amber-100 rounded text-xs">course_type</code>
            </div>

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
        </>
    );
}
