import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    GraduationCap,
    Search,
    Plus,
    AlertCircle,
    Edit2,
    Trash2,
    X,
    Loader2,
    Check,
    Layers,
} from 'lucide-react';
import { adminService } from '../../../data/api/adminService';

interface GradeData {
    id: number;
    name: string | { ar?: string; en?: string };
    description?: string | { ar?: string; en?: string };
    level?: number;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

const extractName = (name: string | { ar?: string; en?: string } | undefined): string => {
    if (!name) return '';
    if (typeof name === 'string') return name;
    return name.ar || name.en || '';
};

const ShimmerRow = (): React.ReactElement => (
    <tr className="animate-pulse">
        <td className="py-4 px-6">
            <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-16"></div>
        </td>
        <td className="py-4 px-6">
            <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-48"></div>
        </td>
        <td className="py-4 px-6">
            <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-32"></div>
        </td>
        <td className="py-4 px-6">
            <div className="flex gap-2">
                <div className="h-8 w-8 bg-slate-200 dark:bg-white/10 rounded-lg"></div>
                <div className="h-8 w-8 bg-slate-200 dark:bg-white/10 rounded-lg"></div>
            </div>
        </td>
    </tr>
);

export function AdminGradesPage(): React.ReactElement {
    const [grades, setGrades] = useState<GradeData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [meta, setMeta] = useState<PaginationMeta>({
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGrade, setEditingGrade] = useState<GradeData | null>(null);
    const [formData, setFormData] = useState({ name_ar: '', name_en: '', description_ar: '', description_en: '', level: 1 });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const fetchGrades = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await adminService.getGrades({
                page: currentPage,
                per_page: 15,
                search: searchQuery || undefined,
            });
            setGrades(response.data || []);
            setMeta(response.meta || { current_page: 1, last_page: 1, per_page: 15, total: 0 });
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'فشل في تحميل الصفوف الدراسية';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchQuery]);

    useEffect(() => {
        fetchGrades();
    }, [fetchGrades]);

    const handleSearch = useCallback((value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
    }, []);

    const openAddModal = useCallback(() => {
        setEditingGrade(null);
        // Calculate next level based on existing grades count
        const nextLevel = grades.length > 0 ? Math.max(...grades.map(g => g.level || 0)) + 1 : 1;
        setFormData({ name_ar: '', name_en: '', description_ar: '', description_en: '', level: nextLevel });
        setFormError(null);
        setIsModalOpen(true);
    }, [grades]);

    const openEditModal = useCallback((grade: GradeData) => {
        setEditingGrade(grade);
        const nameAr = typeof grade.name === 'object' ? grade.name.ar || '' : grade.name || '';
        const nameEn = typeof grade.name === 'object' ? grade.name.en || '' : '';
        const descAr = typeof grade.description === 'object' ? grade.description?.ar || '' : grade.description || '';
        const descEn = typeof grade.description === 'object' ? grade.description?.en || '' : '';
        const level = grade.level || 1;
        setFormData({ name_ar: nameAr, name_en: nameEn, description_ar: descAr, description_en: descEn, level });
        setFormError(null);
        setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        if (!formLoading) {
            setIsModalOpen(false);
            setEditingGrade(null);
            setFormError(null);
        }
    }, [formLoading]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name_ar.trim()) {
            setFormError('الاسم بالعربية مطلوب');
            return;
        }

        setFormLoading(true);
        setFormError(null);

        try {
            // Backend expects name and description as strings, not objects
            // Also requires level as integer
            const payload = {
                name: formData.name_ar.trim(),
                description: formData.description_ar?.trim() || undefined,
                level: formData.level,
            };

            if (editingGrade) {
                await adminService.updateGrade(editingGrade.id, payload);
            } else {
                await adminService.createGrade(payload);
            }

            closeModal();
            fetchGrades();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'فشل في حفظ الصف الدراسي';
            setFormError(errorMessage);
        } finally {
            setFormLoading(false);
        }
    }, [formData, editingGrade, closeModal, fetchGrades]);

    const handleDelete = useCallback(async (id: number) => {
        setDeleteLoading(true);
        try {
            await adminService.deleteGrade(id);
            setDeleteConfirmId(null);
            fetchGrades();
        } catch (err: unknown) {
            console.error('Delete failed:', err);
        } finally {
            setDeleteLoading(false);
        }
    }, [fetchGrades]);

    const filteredGrades = useMemo(() => {
        if (!searchQuery.trim()) return grades;
        const query = searchQuery.toLowerCase();
        return grades.filter(g => {
            const name = extractName(g.name).toLowerCase();
            return name.includes(query);
        });
    }, [grades, searchQuery]);

    // Calculate stats
    const stats = useMemo(() => [
        { icon: <GraduationCap size={22} className="text-purple-600" />, label: 'مجموع الصفوف', value: grades.length.toString(), bgColor: 'bg-purple-50' },
        { icon: <Layers size={22} className="text-blue-600" />, label: 'متوسط الطلاب', value: '24', bgColor: 'bg-blue-50' }, // Mock data
        { icon: <Check size={22} className="text-emerald-600" />, label: 'صفوف مكتملة', value: grades.filter(g => g.is_active !== false).length.toString(), bgColor: 'bg-emerald-50' },
        { icon: <AlertCircle size={22} className="text-amber-600" />, label: 'تنبيهات', value: '2', bgColor: 'bg-amber-50' }, // Mock data
    ], [grades]);

    return (
        <div className="p-6 space-y-6">
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white dark:bg-[#1E1E1E] rounded-[20px] p-6 shadow-sm border border-slate-100 dark:border-white/10 hover:shadow-md transition-all duration-300 group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-2xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                {stat.icon}
                            </div>
                            <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                +5% <Check size={12} />
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
                        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mb-2">
                            إدارة الصفوف الدراسية
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">إدارة وهيكلة الصفوف الدراسية والمناهج</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="بحث..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full md:w-72 h-12 pr-12 pl-4 rounded-[16px] bg-slate-50 dark:bg-[#2A2A2A] border-2 border-slate-100 dark:border-white/10 focus:border-purple-500 focus:bg-white dark:focus:bg-[#2A2A2A] transition-all duration-300 outline-none text-sm font-medium placeholder:text-slate-400 dark:text-white"
                                dir="rtl"
                            />
                        </div>
                        <button
                            onClick={openAddModal}
                            className="h-12 px-8 rounded-[16px] bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                        >
                            <Plus size={20} />
                            <span>إضافة صف</span>
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                    <button onClick={fetchGrades} className="mr-auto text-sm font-bold underline hover:no-underline">
                        إعادة المحاولة
                    </button>
                </div>
            )}

            {/* Grades Table */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-[24px] shadow-sm border border-slate-100 dark:border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-[#2A2A2A] border-b border-slate-100 dark:border-white/10">
                                <th className="text-right px-6 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">الرقم</th>
                                <th className="text-right px-6 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">اسم الصف</th>
                                <th className="text-right px-6 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">الوصف</th>
                                <th className="text-right px-6 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-white/5 dark:divide-white/5 dark:divide-white/5">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => <ShimmerRow key={i} />)
                            ) : filteredGrades.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-16 text-center text-slate-500 dark:text-slate-400">
                                        <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <GraduationCap size={40} className="text-slate-300 dark:text-slate-600" />
                                        </div>
                                        <p className="font-medium text-lg text-slate-600 dark:text-white">لا توجد صفوف دراسية</p>
                                        <p className="text-sm text-slate-400 mt-1">ابدأ بإضافة صفوف دراسية جديدة</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredGrades.map((grade) => (
                                    <tr key={grade.id} className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 dark:bg-white/10 px-2 py-1 rounded-md">
                                                #{grade.id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 font-bold text-lg">
                                                    {extractName(grade.name).charAt(0)}
                                                </div>
                                                <span className="font-bold text-slate-700 dark:text-white text-base">
                                                    {extractName(grade.name)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 max-w-[300px]">
                                                {extractName(grade.description) || '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                                                <button
                                                    onClick={() => openEditModal(grade)}
                                                    className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm"
                                                    title="تعديل"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                {deleteConfirmId === grade.id ? (
                                                    <div className="flex items-center gap-1 animate-in slide-in-from-right-2">
                                                        <button
                                                            onClick={() => handleDelete(grade.id)}
                                                            disabled={deleteLoading}
                                                            className="w-9 h-9 rounded-xl bg-red-600 text-white hover:bg-red-700 flex items-center justify-center transition-all shadow-md"
                                                        >
                                                            {deleteLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={16} />}
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirmId(null)}
                                                            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/20 flex items-center justify-center transition-all"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setDeleteConfirmId(grade.id)}
                                                        className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm"
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

                {!loading && meta.last_page > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-white/10 bg-slate-50/30 dark:bg-[#2A2A2A]">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            عرض {((meta.current_page - 1) * meta.per_page) + 1} - {Math.min(meta.current_page * meta.per_page, meta.total)} من {meta.total}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded-xl bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                السابق
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(meta.last_page, p + 1))}
                                disabled={currentPage === meta.last_page}
                                className="px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 text-sm font-bold shadow-md shadow-purple-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                التالي
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm" onClick={closeModal} />
                    <div className="relative bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-xl w-full max-w-lg mx-4 animate-in zoom-in-95 fade-in duration-200">
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 px-6 py-5 flex items-center justify-between rounded-t-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                    <GraduationCap size={20} className="text-white" />
                                </div>
                                <div className="text-white">
                                    <h2 className="text-lg font-bold">
                                        {editingGrade ? 'تعديل الصف الدراسي' : 'إضافة صف جديد'}
                                    </h2>
                                </div>
                            </div>
                            <button
                                onClick={closeModal}
                                disabled={formLoading}
                                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors disabled:opacity-50"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {formError && (
                                <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 rounded-xl text-sm flex items-center gap-2">
                                    <AlertCircle size={18} />
                                    {formError}
                                </div>
                            )}

                            {/* Backend doesn't support translations for Grade - only single string values */}
                            <div>
                                <label className="block text-xs font-semibold text-charcoal dark:text-white mb-1.5">
                                    اسم الصف *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name_ar}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name_ar: e.target.value }))}
                                    placeholder="مثال: الدورة الأولى"
                                    className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-[#2A2A2A] border border-slate-200 dark:border-white/10 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none text-sm dark:text-white"
                                    dir="rtl"
                                    disabled={formLoading}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-charcoal dark:text-white mb-1.5">
                                    الوصف
                                </label>
                                <textarea
                                    value={formData.description_ar}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description_ar: e.target.value }))}
                                    placeholder="وصف الصف الدراسي..."
                                    className="w-full h-20 px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#2A2A2A] border border-slate-200 dark:border-white/10 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none text-sm resize-none dark:text-white"
                                    dir="rtl"
                                    disabled={formLoading}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={formLoading}
                                    className="flex-1 h-12 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-charcoal dark:text-slate-300 font-semibold text-sm transition-all disabled:opacity-50"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="flex-1 h-12 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-lg transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                                >
                                    {formLoading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            <span>جاري الحفظ...</span>
                                        </>
                                    ) : (
                                        <span>{editingGrade ? 'حفظ التغييرات' : 'إضافة الصف'}</span>
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
