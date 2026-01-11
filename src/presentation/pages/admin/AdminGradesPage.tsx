import { useState, useEffect, useCallback, useMemo } from 'react';
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

const ShimmerRow = (): JSX.Element => (
    <tr className="animate-pulse">
        <td className="py-4 px-6">
            <div className="h-4 bg-slate-200 rounded w-16"></div>
        </td>
        <td className="py-4 px-6">
            <div className="h-4 bg-slate-200 rounded w-48"></div>
        </td>
        <td className="py-4 px-6">
            <div className="h-4 bg-slate-200 rounded w-32"></div>
        </td>
        <td className="py-4 px-6">
            <div className="flex gap-2">
                <div className="h-8 w-8 bg-slate-200 rounded-lg"></div>
                <div className="h-8 w-8 bg-slate-200 rounded-lg"></div>
            </div>
        </td>
    </tr>
);

export function AdminGradesPage(): JSX.Element {
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
            const response = await adminService.getGradesList({
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

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <GraduationCap className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-charcoal">إدارة الصفوف الدراسية</h1>
                        <p className="text-sm text-slate-500">إضافة وتعديل وحذف الصفوف الدراسية</p>
                    </div>
                </div>
                <button
                    onClick={openAddModal}
                    className="h-11 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2"
                >
                    <Plus size={18} />
                    <span>إضافة صف جديد</span>
                </button>
            </div>

            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="البحث في الصفوف الدراسية..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full h-11 pr-12 pl-4 rounded-xl bg-white border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none text-sm"
                        dir="rtl"
                    />
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                    <button onClick={fetchGrades} className="mr-auto text-sm underline hover:no-underline">
                        إعادة المحاولة
                    </button>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="py-4 px-6 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                الرقم
                            </th>
                            <th className="py-4 px-6 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                اسم الصف
                            </th>
                            <th className="py-4 px-6 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                الوصف
                            </th>
                            <th className="py-4 px-6 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                الإجراءات
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => <ShimmerRow key={i} />)
                        ) : filteredGrades.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-12 text-center text-slate-500">
                                    <GraduationCap size={48} className="mx-auto mb-3 text-slate-300" />
                                    <p>لا توجد صفوف دراسية</p>
                                </td>
                            </tr>
                        ) : (
                            filteredGrades.map((grade) => (
                                <tr key={grade.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-4 px-6 text-sm text-slate-600">
                                        #{grade.id}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="font-semibold text-charcoal">
                                            {extractName(grade.name)}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-slate-500">
                                        {extractName(grade.description) || '—'}
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openEditModal(grade)}
                                                className="w-8 h-8 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-600 flex items-center justify-center transition-colors"
                                                title="تعديل"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            {deleteConfirmId === grade.id ? (
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleDelete(grade.id)}
                                                        disabled={deleteLoading}
                                                        className="w-8 h-8 rounded-lg bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors disabled:opacity-50"
                                                    >
                                                        {deleteLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={16} />}
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirmId(null)}
                                                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setDeleteConfirmId(grade.id)}
                                                    className="w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-colors"
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

                {!loading && meta.last_page > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                        <p className="text-sm text-slate-500">
                            عرض {((meta.current_page - 1) * meta.per_page) + 1} - {Math.min(meta.current_page * meta.per_page, meta.total)} من {meta.total}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                السابق
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(meta.last_page, p + 1))}
                                disabled={currentPage === meta.last_page}
                                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 animate-in zoom-in-95 fade-in duration-200">
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
                                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
                                    <AlertCircle size={18} />
                                    {formError}
                                </div>
                            )}

                            {/* Backend doesn't support translations for Grade - only single string values */}
                            <div>
                                <label className="block text-xs font-semibold text-charcoal mb-1.5">
                                    اسم الصف *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name_ar}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name_ar: e.target.value }))}
                                    placeholder="مثال: الدورة الأولى"
                                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none text-sm"
                                    dir="rtl"
                                    disabled={formLoading}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-charcoal mb-1.5">
                                    الوصف
                                </label>
                                <textarea
                                    value={formData.description_ar}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description_ar: e.target.value }))}
                                    placeholder="وصف الصف الدراسي..."
                                    className="w-full h-20 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none text-sm resize-none"
                                    dir="rtl"
                                    disabled={formLoading}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={formLoading}
                                    className="flex-1 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-charcoal font-semibold text-sm transition-all disabled:opacity-50"
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
