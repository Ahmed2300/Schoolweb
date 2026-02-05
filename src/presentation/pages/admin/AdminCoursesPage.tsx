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
} from 'lucide-react';
import { adminService, CourseData } from '../../../data/api/adminService';
import { AddCourseModal } from '../../components/admin/AddCourseModal';
import { EditCourseModal } from '../../components/admin/EditCourseModal';
import { DeleteConfirmModal } from '../../components/admin/DeleteConfirmModal';

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
            });

            const coursesData = response.data || [];
            setCourses(coursesData);

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
    }, [searchQuery, selectedGradeId, selectedSemesterId, activeTab]);

    useEffect(() => {
        fetchDropdownData();
    }, [fetchDropdownData]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const handleGradeChange = (gradeId: number | null) => {
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

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative">
                    <select
                        value={selectedGradeId ?? ''}
                        onChange={(e) => handleGradeChange(e.target.value ? parseInt(e.target.value) : null)}
                        disabled={loadingDropdowns}
                        className="h-11 pl-10 pr-4 rounded-[12px] bg-white border border-slate-200 text-sm font-medium text-charcoal appearance-none cursor-pointer focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all disabled:opacity-50"
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
                        onChange={(e) => setSelectedSemesterId(e.target.value ? parseInt(e.target.value) : null)}
                        disabled={loadingDropdowns || !selectedGradeId}
                        className={`h-11 pl-10 pr-4 rounded-[12px] bg-white border border-slate-200 text-sm font-medium text-charcoal appearance-none cursor-pointer focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all ${!selectedGradeId ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                        onClick={() => { setSelectedGradeId(null); setSelectedSemesterId(null); }}
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
                <div className="bg-white rounded-[16px] shadow-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الكورس</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الكود</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الساعات</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">السعر</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الحالة</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
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
                <div className="bg-white rounded-[16px] shadow-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase w-20">الصورة</th>
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
        </>
    );
}
