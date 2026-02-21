import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Calendar,
    Search,
    Plus,
    AlertCircle,
    Edit2,
    Trash2,
    X,
    Loader2,
    Check,
    CalendarDays,
    CalendarClock,
    Layers,
    FolderOpen,
    GraduationCap,
} from 'lucide-react';
import { adminService, SemesterData } from '../../../data/api/adminService';

interface GradeOption {
    id: number;
    name: string;
}

interface FormDataType {
    name_ar: string;
    name_en: string;
    start_date: string;
    end_date: string;
    grade_id: number | null;
    country_id: number;
}

// Get today's date in YYYY-MM-DD format for date picker min attribute
const getTodayDate = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0];
};

const extractName = (name: string | { ar?: string; en?: string } | undefined): string => {
    if (!name) return '';
    if (typeof name === 'string') {
        if (name.trim().startsWith('{')) {
            try {
                const parsed = JSON.parse(name);
                return parsed.ar || parsed.en || name;
            } catch (e) {
                return name;
            }
        }
        return name;
    }
    return name.ar || name.en || '';
};

export function AdminSemestersPage(): React.ReactElement {
    const [semesters, setSemesters] = useState<SemesterData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSemester, setEditingSemester] = useState<SemesterData | null>(null);
    const [formData, setFormData] = useState<FormDataType>({
        name_ar: '',
        name_en: '',
        start_date: '',
        end_date: '',
        grade_id: null,
        country_id: 1,
    });
    const [dateError, setDateError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [grades, setGrades] = useState<GradeOption[]>([]);
    const [loadingGrades, setLoadingGrades] = useState(false);

    const fetchSemesters = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminService.getSemesters({
                search: searchQuery || undefined,
                per_page: 15,
                page: currentPage,
            });
            setSemesters(response.data || []);
            setTotalPages(response.meta?.last_page || 1);
        } catch (err) {
            console.error('Error fetching semesters:', err);
            setError('فشل في تحميل الفصول الدراسية');
        } finally {
            setLoading(false);
        }
    }, [searchQuery, currentPage]);

    const fetchGrades = useCallback(async () => {
        setLoadingGrades(true);
        try {
            const response = await adminService.getGrades({ per_page: 100 });
            const gradeData = response.data || [];
            setGrades(gradeData.map(g => ({
                id: g.id,
                name: extractName((g as any).name) || `صف ${g.id}`,
            })));
        } catch (err) {
            console.error('Error fetching grades:', err);
        } finally {
            setLoadingGrades(false);
        }
    }, []);

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchSemesters();
        }, 500);
        return () => clearTimeout(debounce);
    }, [fetchSemesters]);

    // Also fetch grades on page load for table display
    useEffect(() => {
        fetchGrades();
    }, [fetchGrades]);

    const handleOpenModal = useCallback((semester?: SemesterData) => {
        fetchGrades();
        if (semester) {
            setEditingSemester(semester);
            const nameAr = typeof semester.name === 'object' ? semester.name.ar || '' : semester.name || '';
            const nameEn = typeof semester.name === 'object' ? semester.name.en || '' : '';
            setFormData({
                name_ar: nameAr,
                name_en: nameEn,
                start_date: semester.start_date || '',
                end_date: semester.end_date || '',
                grade_id: semester.grade_id || null,
                country_id: semester.country_id || 1,
            });
        } else {
            setEditingSemester(null);
            setFormData({ name_ar: '', name_en: '', start_date: '', end_date: '', grade_id: null, country_id: 1 });
        }
        setFormError(null);
        setIsModalOpen(true);
    }, [fetchGrades]);

    const closeModal = useCallback(() => {
        if (!submitting) {
            setIsModalOpen(false);
            setEditingSemester(null);
            setFormError(null);
        }
    }, [submitting]);

    const handleGradeSelect = useCallback((gradeId: number) => {
        setFormData(prev => ({
            ...prev,
            grade_id: prev.grade_id === gradeId ? null : gradeId,
        }));
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name_ar.trim()) {
            setFormError('الاسم بالعربية مطلوب');
            return;
        }
        if (!formData.grade_id) {
            setFormError('يجب اختيار الصف الدراسي');
            return;
        }
        if (!formData.start_date) {
            setFormError('تاريخ البدء مطلوب');
            return;
        }
        if (!formData.end_date) {
            setFormError('تاريخ الانتهاء مطلوب');
            return;
        }
        if (new Date(formData.end_date) <= new Date(formData.start_date)) {
            setFormError('تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء');
            return;
        }

        setSubmitting(true);
        setFormError(null);

        try {
            const payload = {
                name: { ar: formData.name_ar.trim(), en: formData.name_en.trim() || formData.name_ar.trim() },
                start_date: formData.start_date,
                end_date: formData.end_date,
                grade_id: formData.grade_id,
                country_id: formData.country_id,
            };

            if (editingSemester) {
                await adminService.updateSemester(editingSemester.id, payload);
            } else {
                await adminService.createSemester(payload);
            }

            closeModal();
            fetchSemesters();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'فشل في حفظ الفصل الدراسي';
            setFormError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    }, [formData, editingSemester, closeModal, fetchSemesters]);

    const handleDelete = useCallback(async (id: number) => {
        setDeleteLoading(true);
        try {
            await adminService.deleteSemester(id);
            setDeleteConfirmId(null);
            fetchSemesters();
        } catch (err) {
            console.error('Error deleting semester:', err);
        } finally {
            setDeleteLoading(false);
        }
    }, [fetchSemesters]);

    const getSemesterName = useCallback((semester: SemesterData): string => {
        return extractName(semester.name);
    }, []);

    const filteredSemesters = useMemo(() => semesters, [semesters]);

    // Calculate stats
    const stats = useMemo(() => [
        { icon: <Calendar size={22} className="text-indigo-600" />, label: 'مجموع الفصول', value: semesters.length.toString(), bgColor: 'bg-indigo-50' },
        { icon: <CalendarDays size={22} className="text-emerald-600" />, label: 'الفصل الحالي', value: 'الفصل الأول', bgColor: 'bg-emerald-50' }, // Mock
        { icon: <CalendarClock size={22} className="text-amber-600" />, label: 'أيام متبقية', value: '45', bgColor: 'bg-amber-50' }, // Mock
        { icon: <Layers size={22} className="text-purple-600" />, label: 'الصفوف المرتبطة', value: new Set(semesters.map(s => s.grade_id)).size.toString(), bgColor: 'bg-purple-50' },
    ], [semesters]);

    return (
        <div className="p-6 space-y-6">
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white dark:bg-[#1E1E1E] rounded-[20px] p-6 shadow-sm border border-slate-100 dark:border-white/10 hover:shadow-md transition-all duration-300 group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-2xl ${stat.bgColor} dark:bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                {stat.icon}
                            </div>
                            <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-full">
                                نشط <Check size={12} />
                            </span>
                        </div>
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Header & Controls */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-[24px] p-6 shadow-sm border border-slate-100 dark:border-white/10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 mb-2">
                            إدارة الفصول الدراسية
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">إدارة الفترات الزمنية والتقويم الدراسي</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="بحث..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full md:w-72 h-12 pr-12 pl-4 rounded-[16px] bg-slate-50 dark:bg-[#2A2A2A] border-2 border-slate-100 dark:border-white/10 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#1E1E1E] transition-all duration-300 outline-none text-sm font-medium placeholder:text-slate-400 dark:text-white"
                                dir="rtl"
                            />
                        </div>
                        <button
                            onClick={() => handleOpenModal()}
                            className="h-12 px-8 rounded-[16px] bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                        >
                            <Plus size={20} />
                            <span>إضافة فصل</span>
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                    <button onClick={fetchSemesters} className="mr-auto text-sm font-bold underline hover:no-underline">
                        إعادة المحاولة
                    </button>
                </div>
            )}

            {/* Semesters Table */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-[24px] shadow-sm border border-slate-100 dark:border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50/50 dark:bg-[#2A2A2A] border-b border-slate-100 dark:border-white/10">
                            <tr>
                                <th className="text-right px-6 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">الاسم</th>
                                <th className="text-right px-6 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">الصف الدراسي</th>
                                <th className="text-right px-6 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">تاريخ البدء</th>
                                <th className="text-right px-6 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">تاريخ الانتهاء</th>
                                <th className="text-right px-6 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-white/5 dark:divide-white/5 dark:divide-white/5">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-28"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-28"></div></td>
                                        <td className="px-6 py-4"><div className="h-8 bg-slate-200 rounded w-20"></div></td>
                                    </tr>
                                ))
                            ) : filteredSemesters.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center text-slate-500">
                                        <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Calendar size={40} className="text-slate-300 dark:text-slate-600" />
                                        </div>
                                        <p className="font-medium text-lg text-slate-600 dark:text-slate-300">لا توجد فصول دراسية</p>
                                        <p className="text-sm text-slate-400 mt-1">ابدأ بإضافة فصول دراسية جديدة</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredSemesters.map((semester) => (
                                    <tr key={semester.id} className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-bold">
                                                    <Calendar size={20} />
                                                </div>
                                                <span className="font-bold text-slate-700 dark:text-white text-base">{getSemesterName(semester)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {(() => {
                                                if (semester.grade && typeof semester.grade === 'object') {
                                                    return (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-bold rounded-lg border border-indigo-100 dark:border-indigo-500/20">
                                                            <GraduationCap size={14} />
                                                            {extractName(semester.grade.name as any)}
                                                        </span>
                                                    );
                                                }
                                                if (semester.grade_id) {
                                                    const foundGrade = grades.find(g => g.id === semester.grade_id);
                                                    if (foundGrade) {
                                                        return (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-bold rounded-lg border border-indigo-100 dark:border-indigo-500/20">
                                                                <GraduationCap size={14} />
                                                                {foundGrade.name}
                                                            </span>
                                                        );
                                                    }
                                                    return (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg">
                                                            صف #{semester.grade_id}
                                                        </span>
                                                    );
                                                }
                                                return <span className="text-slate-400 text-sm">—</span>;
                                            })()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-lg w-fit">
                                                <CalendarDays size={14} className="text-emerald-500" />
                                                <span className="font-mono font-medium">{semester.start_date ? new Date(semester.start_date).toLocaleDateString('ar-EG') : '—'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-lg w-fit">
                                                <CalendarClock size={14} className="text-rose-400" />
                                                <span className="font-mono font-medium">{semester.end_date ? new Date(semester.end_date).toLocaleDateString('ar-EG') : '—'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                                                <button
                                                    onClick={() => handleOpenModal(semester)}
                                                    className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm"
                                                    title="تعديل"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                {deleteConfirmId === semester.id ? (
                                                    <div className="flex items-center gap-1 animate-in slide-in-from-right-2">
                                                        <button
                                                            onClick={() => handleDelete(semester.id)}
                                                            disabled={deleteLoading}
                                                            className="w-9 h-9 rounded-xl bg-red-600 text-white hover:bg-red-700 flex items-center justify-center transition-all shadow-md"
                                                        >
                                                            {deleteLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={16} />}
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirmId(null)}
                                                            className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-all"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setDeleteConfirmId(semester.id)}
                                                        className="w-9 h-9 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm"
                                                        title="حذف"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-white/10 bg-slate-50/30 dark:bg-[#2A2A2A]">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">صفحة {currentPage} من {totalPages}</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded-xl bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                السابق
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-bold shadow-md shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                التالي
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm" onClick={closeModal} />
                    <div
                        className="relative bg-white dark:bg-[#1E1E1E] rounded-2xl w-full max-w-lg animate-in zoom-in-95 fade-in duration-200"
                        style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
                    >
                        <div className="px-8 pt-8 pb-2">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center">
                                        <Calendar size={20} className="text-indigo-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-charcoal dark:text-white">
                                            {editingSemester ? 'تعديل الفصل الدراسي' : 'إضافة فصل جديد'}
                                        </h2>
                                        <p className="text-sm text-slate-400 mt-0.5">أدخل بيانات الفصل الدراسي</p>
                                    </div>
                                </div>
                                <button
                                    onClick={closeModal}
                                    disabled={submitting}
                                    className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="px-8 pb-8 pt-4">
                            {formError && (
                                <div className="mb-6 p-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    {formError}
                                </div>
                            )}

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                                        اسم الفصل الدراسي
                                    </label>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">بالعربية *</label>
                                            <input
                                                type="text"
                                                value={formData.name_ar}
                                                onChange={(e) => setFormData(prev => ({ ...prev, name_ar: e.target.value }))}
                                                placeholder="مثال: الفصل الدراسي الأول"
                                                className="w-full h-12 px-4 rounded-xl bg-slate-50/50 dark:bg-[#2A2A2A] border border-slate-200/80 dark:border-white/10 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm placeholder:text-slate-300 transition-all dark:text-white"
                                                dir="rtl"
                                                disabled={submitting}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">بالإنجليزية</label>
                                            <input
                                                type="text"
                                                value={formData.name_en}
                                                onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
                                                placeholder="e.g. First Semester"
                                                className="w-full h-12 px-4 rounded-xl bg-slate-50/50 dark:bg-[#2A2A2A] border border-slate-200/80 dark:border-white/10 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm placeholder:text-slate-300 transition-all dark:text-white"
                                                dir="ltr"
                                                disabled={submitting}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                                            <CalendarDays size={13} className="text-emerald-500" />
                                            تاريخ البدء
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={formData.start_date}
                                                min={getTodayDate()}
                                                onChange={(e) => {
                                                    setFormData(prev => ({ ...prev, start_date: e.target.value }));
                                                    // Clear end_date if it's before the new start_date
                                                    if (formData.end_date && new Date(formData.end_date) <= new Date(e.target.value)) {
                                                        setFormData(prev => ({ ...prev, end_date: '' }));
                                                    }
                                                }}
                                                className="w-full h-12 px-4 rounded-xl bg-slate-50/50 dark:bg-[#2A2A2A] border border-slate-200/80 dark:border-white/10 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm transition-all cursor-pointer dark:text-white dark:[color-scheme:dark]"
                                                disabled={submitting}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                                            <CalendarClock size={13} className="text-rose-400" />
                                            تاريخ الانتهاء
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={formData.end_date}
                                                min={formData.start_date || getTodayDate()}
                                                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                                                className="w-full h-12 px-4 rounded-xl bg-slate-50/50 dark:bg-[#2A2A2A] border border-slate-200/80 dark:border-white/10 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm transition-all cursor-pointer dark:text-white dark:[color-scheme:dark]"
                                                disabled={submitting || !formData.start_date}
                                            />
                                            {!formData.start_date && (
                                                <p className="text-xs text-slate-400 mt-1">اختر تاريخ البدء أولاً</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                                        <Layers size={13} className="text-indigo-500" />
                                        الصف الدراسي *
                                    </label>
                                    {loadingGrades ? (
                                        <div className="flex items-center justify-center h-24">
                                            <Loader2 size={24} className="animate-spin text-indigo-400" />
                                        </div>
                                    ) : grades.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-8">
                                            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center mb-3">
                                                <FolderOpen size={28} className="text-slate-300" />
                                            </div>
                                            <p className="text-sm text-slate-400">لا توجد صفوف دراسية متاحة</p>
                                            <p className="text-xs text-slate-300 mt-1">أضف صفوفاً دراسية أولاً</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {grades.map(grade => {
                                                const isSelected = formData.grade_id === grade.id;
                                                return (
                                                    <button
                                                        key={grade.id}
                                                        type="button"
                                                        onClick={() => handleGradeSelect(grade.id)}
                                                        disabled={submitting}
                                                        className={`
                                                            flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                                                            ${isSelected
                                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                                                : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20'
                                                            }
                                                            disabled:opacity-50
                                                        `}
                                                    >
                                                        <div className={`
                                                            w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all
                                                            ${isSelected ? 'bg-white border-white' : 'border-slate-300'}
                                                        `}>
                                                            {isSelected && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                                                        </div>
                                                        {grade.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {formData.grade_id && (
                                        <p className="mt-3 text-xs text-indigo-500 font-medium">
                                            ✓ تم اختيار الصف: {grades.find(g => g.id === formData.grade_id)?.name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mt-8 pt-6 border-t border-slate-100 dark:border-white/10">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={submitting}
                                    className="px-6 py-3 text-slate-400 hover:text-slate-600 font-medium text-sm transition-colors disabled:opacity-50"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                                    style={{ boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.4)' }}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            <span>جاري الحفظ...</span>
                                        </>
                                    ) : (
                                        <span>{editingSemester ? 'حفظ التغييرات' : 'إضافة الفصل'}</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
