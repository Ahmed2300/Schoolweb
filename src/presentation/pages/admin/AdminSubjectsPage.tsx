import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    BookOpen,
    Search,
    Plus,
    AlertCircle,
    Edit2,
    Trash2,
    X,
    Loader2,
    Code,
    Check,
    Layers,
    Calendar,
    ChevronDown,
    FolderOpen,
} from 'lucide-react';
import { adminService, SubjectData } from '../../../data/api/adminService';

interface GradeOption {
    id: number;
    name: string;
}

interface SemesterOption {
    id: number;
    name: string;
    grade_id?: number;
}

interface FormDataType {
    name: string;
    code: string;
    description: string;
    grade_id: number | null;
    study_term_id: number | null;
}

const extractName = (name: string | { ar?: string; en?: string } | undefined): string => {
    if (!name) return '';
    if (typeof name === 'string') return name;
    return name.ar || name.en || '';
};

// Auto-generate unique subject code from name
const generateSubjectCode = (name: string): string => {
    if (!name.trim()) return '';

    // Transliteration map for Arabic characters to English
    const arabicToEnglish: Record<string, string> = {
        'ا': 'A', 'أ': 'A', 'إ': 'A', 'آ': 'A', 'ب': 'B', 'ت': 'T', 'ث': 'TH',
        'ج': 'J', 'ح': 'H', 'خ': 'KH', 'د': 'D', 'ذ': 'DH', 'ر': 'R', 'ز': 'Z',
        'س': 'S', 'ش': 'SH', 'ص': 'S', 'ض': 'D', 'ط': 'T', 'ظ': 'Z', 'ع': 'A',
        'غ': 'GH', 'ف': 'F', 'ق': 'Q', 'ك': 'K', 'ل': 'L', 'م': 'M', 'ن': 'N',
        'ه': 'H', 'و': 'W', 'ي': 'Y', 'ى': 'A', 'ة': 'H', 'ء': '',
    };

    // Convert first word to code-friendly format
    const firstWord = name.trim().split(/\s+/)[0];
    let code = '';

    for (const char of firstWord) {
        if (arabicToEnglish[char]) {
            code += arabicToEnglish[char];
        } else if (/[a-zA-Z]/.test(char)) {
            code += char.toUpperCase();
        }
    }

    // Limit to 4 characters + 3 random digits for uniqueness
    const prefix = code.slice(0, 4).toUpperCase() || 'SUBJ';
    const randomSuffix = Math.floor(100 + Math.random() * 900); // 3-digit random

    return `${prefix}${randomSuffix}`;
};

export function AdminSubjectsPage(): React.ReactElement {
    const [subjects, setSubjects] = useState<SubjectData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<SubjectData | null>(null);
    const [formData, setFormData] = useState<FormDataType>({
        name: '',
        code: '',
        description: '',
        grade_id: null,
        study_term_id: null,
    });
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [grades, setGrades] = useState<GradeOption[]>([]);
    const [semesters, setSemesters] = useState<SemesterOption[]>([]);
    const [loadingDropdowns, setLoadingDropdowns] = useState(false);
    const [nameAvailability, setNameAvailability] = useState<'idle' | 'checking' | 'available' | 'taken' | 'warning'>('idle');
    const [nameAvailabilityMessage, setNameAvailabilityMessage] = useState('');

    const fetchSubjects = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminService.getSubjects({
                search: searchQuery || undefined,
                per_page: 15,
                page: currentPage,
            });
            setSubjects(response.data || []);
            setTotalPages(response.meta?.last_page || 1);
        } catch (err) {
            console.error('Error fetching subjects:', err);
            setError('فشل في تحميل المواد الدراسية');
        } finally {
            setLoading(false);
        }
    }, [searchQuery, currentPage]);

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
                setSemesters(semestersRes.value.data.map((s: any) => ({
                    id: s.id,
                    name: extractName(s.name),
                    grade_id: s.grade_id
                })));
            }
        } catch (err) {
            console.error('Error fetching dropdown data:', err);
        } finally {
            setLoadingDropdowns(false);
        }
    }, []);

    // Fetch initial data and debounce search
    useEffect(() => {
        fetchDropdownData(); // Fetch grades/semesters for table lookup
        const debounce = setTimeout(() => {
            fetchSubjects();
        }, 500);
        return () => clearTimeout(debounce);
    }, [fetchSubjects, fetchDropdownData, searchQuery]); // Added searchQuery to dependencies

    const filteredSemesters = useMemo(() => {
        if (!formData.grade_id) return [];
        return semesters.filter(s => s.grade_id === formData.grade_id);
    }, [semesters, formData.grade_id]);

    const handleOpenModal = useCallback((subject?: SubjectData) => {
        fetchDropdownData();
        if (subject) {
            setEditingSubject(subject);

            // Derive grade_id if not directly present (backend doesn't always send it)
            let gradeId = subject.grade_id;
            const studyTermId = subject.study_term_id || null;

            if (!gradeId && studyTermId) {
                // Try finding it in the loaded semesters list
                const linkedSemester = semesters.find(s => s.id === studyTermId);
                if (linkedSemester) {
                    gradeId = linkedSemester.grade_id;
                }
            }

            setFormData({
                name: extractName(subject.name),
                code: subject.code,
                description: subject.description || '',
                grade_id: gradeId || null,
                study_term_id: studyTermId,
            });
        } else {
            setEditingSubject(null);
            setFormData({ name: '', code: '', description: '', grade_id: null, study_term_id: null });
        }
        setFormError(null);
        setIsModalOpen(true);
    }, [fetchDropdownData, semesters]);

    const closeModal = useCallback(() => {
        if (!submitting) {
            setIsModalOpen(false);
            setEditingSubject(null);
            setFormError(null);
        }
    }, [submitting]);

    const handleGradeChange = useCallback((gradeId: number | null) => {
        setFormData(prev => ({
            ...prev,
            grade_id: gradeId,
            study_term_id: null, // Reset semester when grade changes
        }));
    }, []);

    const handleSemesterSelect = useCallback((semesterId: number | null) => {
        setFormData(prev => ({
            ...prev,
            study_term_id: semesterId,
        }));
    }, []);

    // Real-time name duplicate check
    useEffect(() => {
        const name = formData.name.trim();
        if (!name) {
            setNameAvailability('idle');
            setNameAvailabilityMessage('');
            return;
        }

        setNameAvailability('checking');
        const timer = setTimeout(async () => {
            try {
                const response = await adminService.getSubjects({ search: name, per_page: 50 });
                // Check strictly for name match since search is fuzzy
                const duplicates = response.data.filter(s =>
                    extractName(s.name).trim() === name &&
                    (!editingSubject || s.id !== editingSubject.id)
                );

                if (duplicates.length > 0) {
                    // Check if duplicate exists in the currently selected semester
                    const inSameSemester = formData.study_term_id && duplicates.some(s => s.study_term_id === formData.study_term_id);

                    if (inSameSemester) {
                        setNameAvailability('taken');
                        setNameAvailabilityMessage('عذراً، هذا الاسم مستخدم بالفعل في هذا الفصل الدراسي');
                    } else {
                        setNameAvailability('warning');
                        setNameAvailabilityMessage(`ملاحظة: هذا الاسم مستخدم في ${duplicates.length} صفوف دراسية أخرى`);
                    }
                } else {
                    setNameAvailability('available');
                    setNameAvailabilityMessage('');
                }
            } catch (error) {
                console.error('Check failed', error);
                setNameAvailability('idle');
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [formData.name, formData.study_term_id, editingSubject]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim()) {
            setFormError('اسم المادة مطلوب');
            return;
        }
        if (!formData.code.trim()) {
            setFormError('كود المادة مطلوب');
            return;
        }
        if (!formData.grade_id) {
            setFormError('يجب اختيار الصف الدراسي');
            return;
        }
        if (!formData.study_term_id) {
            setFormError('يجب اختيار الفصل الدراسي');
            return;
        }

        setSubmitting(true);
        setFormError(null);

        try {
            // Check for duplicates (Frontend validation via API search)
            // We search for subjects with the same name to see if one exists in the same semester
            const duplicateCheckResponse = await adminService.getSubjects({
                search: formData.name.trim(),
                per_page: 50 // Fetch enough to be reasonably sure
            });

            const isDuplicate = duplicateCheckResponse.data.some(subject =>
                // Name matches exactly
                extractName(subject.name).trim() === formData.name.trim() &&
                // Semester matches
                subject.study_term_id === formData.study_term_id &&
                // Not the one we are currently editing
                (!editingSubject || subject.id !== editingSubject.id)
            );

            if (isDuplicate) {
                setFormError('عذراً، توجد مادة بنفس الاسم في هذا الفصل الدراسي');
                setSubmitting(false);
                return;
            }

            // Backend expects: name, code, description, study_term_id
            const payload = {
                name: formData.name.trim(),
                code: formData.code.trim(),
                description: formData.description.trim() || undefined,
                study_term_id: formData.study_term_id,
            };

            console.log('[DEBUG] Submitting payload:', payload);
            console.log('[DEBUG] Editing subject ID:', editingSubject?.id);

            if (editingSubject) {
                const result = await adminService.updateSubject(editingSubject.id, payload);
                console.log('[DEBUG] Update response:', result);
            } else {
                const result = await adminService.createSubject(payload);
                console.log('[DEBUG] Create response:', result);
            }

            closeModal();
            await fetchSubjects();
            console.log('[DEBUG] Subjects refetched');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'فشل في حفظ المادة الدراسية';
            setFormError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    }, [formData, editingSubject, closeModal, fetchSubjects]);

    const handleDelete = useCallback(async (id: number) => {
        setDeleteLoading(true);
        try {
            await adminService.deleteSubject(id);
            setDeleteConfirmId(null);
            fetchSubjects();
        } catch (err) {
            console.error('Error deleting subject:', err);
        } finally {
            setDeleteLoading(false);
        }
    }, [fetchSubjects]);

    const filteredSubjects = useMemo(() => subjects, [subjects]);

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                        <BookOpen className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-charcoal">إدارة المواد الدراسية</h1>
                        <p className="text-sm text-slate-500">إضافة وتعديل وحذف المواد الدراسية</p>
                    </div>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="h-11 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2"
                >
                    <Plus size={18} />
                    <span>إضافة مادة جديدة</span>
                </button>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <div className="relative max-w-md">
                    <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="البحث في المواد الدراسية..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-11 pr-12 pl-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none text-sm"
                        dir="rtl"
                    />
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                    <button onClick={fetchSubjects} className="mr-auto text-sm underline hover:no-underline">
                        إعادة المحاولة
                    </button>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="py-4 px-6 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">الاسم</th>
                            <th className="py-4 px-6 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">الكود</th>
                            <th className="py-4 px-6 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">الصف</th>
                            <th className="py-4 px-6 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">الفصل الدراسي</th>
                            <th className="py-4 px-6 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">الوصف</th>
                            <th className="py-4 px-6 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="py-4 px-6"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                                    <td className="py-4 px-6"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                                    <td className="py-4 px-6"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                                    <td className="py-4 px-6"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                                    <td className="py-4 px-6"><div className="h-4 bg-slate-200 rounded w-40"></div></td>
                                    <td className="py-4 px-6"><div className="h-8 bg-slate-200 rounded w-20"></div></td>
                                </tr>
                            ))
                        ) : filteredSubjects.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-16 text-center text-slate-500">
                                    <BookOpen size={48} className="mx-auto mb-3 text-slate-300" />
                                    <p>لا توجد مواد دراسية</p>
                                </td>
                            </tr>
                        ) : (
                            filteredSubjects.map((subject) => (
                                <tr key={subject.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-4 px-6">
                                        <span className="font-semibold text-charcoal">{subject.name}</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-mono">
                                            <Code size={12} />
                                            {subject.code}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        {(() => {
                                            // Try to get grade name from subject, or look it up via semester
                                            let gradeName = extractName(subject.grade?.name);
                                            if (!gradeName && subject.study_term_id) {
                                                const semester = semesters.find(s => s.id === subject.study_term_id);
                                                if (semester?.grade_id) {
                                                    const grade = grades.find(g => g.id === semester.grade_id);
                                                    gradeName = grade?.name || ''; // grades are already localized in state
                                                }
                                            }

                                            return gradeName ? (
                                                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                                                    {gradeName}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-sm">—</span>
                                            );
                                        })()}
                                    </td>
                                    <td className="py-4 px-6">
                                        {(() => {
                                            // Try to get semester name from subject relationship or lookup
                                            let semesterName = extractName(subject.studyTerm?.name);
                                            if (!semesterName && subject.study_term_id) {
                                                const semester = semesters.find(s => s.id === subject.study_term_id);
                                                semesterName = semester?.name || ''; // semesters are now localized in state
                                            }

                                            return semesterName ? (
                                                <span className="text-sm text-slate-600">{semesterName}</span>
                                            ) : (
                                                <span className="text-slate-400 text-sm">—</span>
                                            );
                                        })()}
                                    </td>
                                    <td className="py-4 px-6 text-sm text-slate-500 max-w-xs truncate">
                                        {subject.description || '—'}
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleOpenModal(subject)}
                                                className="w-8 h-8 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-600 flex items-center justify-center transition-colors"
                                                title="تعديل"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            {deleteConfirmId === subject.id ? (
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleDelete(subject.id)}
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
                                                    onClick={() => setDeleteConfirmId(subject.id)}
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

                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                        <p className="text-sm text-slate-500">صفحة {currentPage} من {totalPages}</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                السابق
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className="relative bg-white rounded-2xl w-full max-w-lg animate-in zoom-in-95 fade-in duration-200 max-h-[90vh] overflow-y-auto"
                        style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
                    >
                        <div className="px-8 pt-8 pb-2">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                                        <BookOpen size={20} className="text-orange-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-charcoal">
                                            {editingSubject ? 'تعديل المادة الدراسية' : 'إضافة مادة جديدة'}
                                        </h2>
                                        <p className="text-sm text-slate-400 mt-0.5">أدخل بيانات المادة الدراسية</p>
                                    </div>
                                </div>
                                <button
                                    onClick={closeModal}
                                    disabled={submitting}
                                    className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="px-8 pb-8 pt-4">
                            {formError && (
                                <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    {formError}
                                </div>
                            )}

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1.5">اسم المادة *</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => {
                                                const newName = e.target.value;
                                                // Auto-generate code if adding new subject or code was auto-generated
                                                const newCode = generateSubjectCode(newName);
                                                setFormData(prev => ({
                                                    ...prev,
                                                    name: newName,
                                                    // Only auto-update code if potential code isn't empty and user hasn't manually set a very specific different code (heuristic)
                                                    code: !editingSubject ? newCode : prev.code
                                                }));
                                            }}
                                            placeholder="مثال: الرياضيات"
                                            className="w-full h-12 px-4 rounded-xl bg-slate-50/50 border border-slate-200/80 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 outline-none text-sm placeholder:text-slate-300 transition-all"
                                            dir="rtl"
                                            disabled={submitting}
                                        />
                                        {nameAvailability === 'checking' && (
                                            <p className="mt-1.5 text-xs text-slate-400 flex items-center gap-1">
                                                <Loader2 size={12} className="animate-spin" />
                                                جاري التحقق من توفر الاسم...
                                            </p>
                                        )}
                                        {nameAvailability === 'taken' && (
                                            <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 animate-in slide-in-from-top-1">
                                                <AlertCircle size={12} />
                                                {nameAvailabilityMessage}
                                            </p>
                                        )}
                                        {nameAvailability === 'warning' && (
                                            <p className="mt-1.5 text-xs text-amber-500 flex items-center gap-1 animate-in slide-in-from-top-1">
                                                <AlertCircle size={12} />
                                                {nameAvailabilityMessage}
                                            </p>
                                        )}
                                        {nameAvailability === 'available' && formData.name && (
                                            <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1 animate-in slide-in-from-top-1">
                                                <Check size={12} />
                                                الاسم متاح
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                                            <Code size={12} className="text-slate-400" />
                                            كود المادة *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.code}
                                            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                                            placeholder="مثال: MATH101"
                                            className="w-full h-12 px-4 rounded-xl bg-slate-50/50 border border-slate-200/80 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 outline-none text-sm font-mono placeholder:text-slate-300 transition-all"
                                            dir="ltr"
                                            disabled={submitting}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1.5">الوصف</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="وصف المادة الدراسية (اختياري)"
                                        rows={2}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50/50 border border-slate-200/80 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 outline-none text-sm placeholder:text-slate-300 transition-all resize-none"
                                        dir="rtl"
                                        disabled={submitting}
                                    />
                                </div>

                                <div className="pt-2 border-t border-slate-100">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">ربط المادة بالتسلسل التعليمي</p>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                                                <Layers size={13} className="text-indigo-500" />
                                                اختر الصف الدراسي
                                            </label>
                                            {loadingDropdowns ? (
                                                <div className="h-12 rounded-xl bg-slate-50 flex items-center justify-center">
                                                    <Loader2 size={18} className="animate-spin text-slate-400" />
                                                </div>
                                            ) : grades.length === 0 ? (
                                                <div className="h-12 rounded-xl bg-slate-50/50 border border-slate-200/80 flex items-center justify-center text-sm text-slate-400">
                                                    لا توجد صفوف متاحة
                                                </div>
                                            ) : (
                                                <div className="relative">
                                                    <select
                                                        value={formData.grade_id || ''}
                                                        onChange={(e) => handleGradeChange(e.target.value ? parseInt(e.target.value) : null)}
                                                        className="w-full h-12 px-4 rounded-xl bg-slate-50/50 border border-slate-200/80 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 outline-none text-sm transition-all appearance-none cursor-pointer"
                                                        dir="rtl"
                                                        disabled={submitting}
                                                    >
                                                        <option value="">— اختر الصف —</option>
                                                        {grades.map(grade => (
                                                            <option key={grade.id} value={grade.id}>{grade.name}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                                </div>
                                            )}
                                        </div>

                                        {formData.grade_id && (
                                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-2">
                                                    <Calendar size={13} className="text-indigo-500" />
                                                    الفصل الدراسي المرتبط
                                                </label>
                                                {filteredSemesters.length === 0 ? (
                                                    <div className="flex flex-col items-center justify-center py-6">
                                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                                                            <FolderOpen size={20} className="text-slate-300" />
                                                        </div>
                                                        <p className="text-xs text-slate-400">لا توجد فصول مرتبطة بهذا الصف</p>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {filteredSemesters.map(semester => {
                                                            const isSelected = formData.study_term_id === semester.id;
                                                            return (
                                                                <button
                                                                    key={semester.id}
                                                                    type="button"
                                                                    onClick={() => handleSemesterSelect(semester.id)}
                                                                    disabled={submitting}
                                                                    className={`
                                                                        flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border
                                                                        ${isSelected
                                                                            ? 'bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-500/30'
                                                                            : 'bg-white text-slate-600 border-slate-200 hover:border-orange-200 hover:bg-orange-50'
                                                                        }
                                                                        disabled:opacity-50
                                                                    `}
                                                                >
                                                                    <div className={`
                                                                        w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0
                                                                        ${isSelected ? 'bg-white border-white' : 'border-slate-300'}
                                                                    `}>
                                                                        {isSelected && <div className="w-2 h-2 rounded-full bg-orange-600" />}
                                                                    </div>
                                                                    <span className="truncate">{semester.name}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                                {formData.study_term_id && (
                                                    <p className="mt-3 text-xs text-orange-500 font-medium">
                                                        ✓ تم اختيار الفصل الدراسي
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mt-8 pt-6 border-t border-slate-100">
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
                                    className="flex-1 h-12 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                                    style={{ boxShadow: '0 4px 14px 0 rgba(234, 88, 12, 0.4)' }}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            <span>جاري الحفظ...</span>
                                        </>
                                    ) : (
                                        <span>{editingSubject ? 'حفظ التغييرات' : 'إضافة المادة'}</span>
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
