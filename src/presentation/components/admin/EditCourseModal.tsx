import { useState, useEffect, useRef } from 'react';
import {
    X,
    Save,
    Loader2,
    BookOpen,
    Code,
    DollarSign,
    Calendar,
    Clock,
    ImagePlus,
    Trash2,
    GraduationCap,
    User,
    AlertCircle
} from 'lucide-react';
import { adminService, CourseData, UpdateCourseRequest } from '../../../data/api/adminService';

interface EditCourseModalProps {
    isOpen: boolean;
    course: CourseData | null;
    onClose: () => void;
    onSuccess: () => void;
}

interface GradeOption {
    id: number;
    name: string;
}

interface SemesterOption {
    id: number;
    name: string;
}

interface SubjectOption {
    id: number;
    name: string;
}

interface TeacherOption {
    id: number;
    name: string;
}

interface FormData {
    name_ar: string;
    name_en: string;
    description_ar: string;
    description_en: string;
    code: string;
    credits: number;
    duration_hours: number;
    price: number;
    old_price: number;
    is_promoted: boolean;
    is_active: boolean;
    start_date: string;
    end_date: string;
    grade_id: number | null;
    semester_id: number | null;
    subject_id: number | null;
    teacher_id: number | null;
}

// Helper to extract bilingual field
const getBilingualValue = (field: any, lang: 'ar' | 'en'): string => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field[lang] || '';
};

export function EditCourseModal({ isOpen, course, onClose, onSuccess }: EditCourseModalProps) {
    const [formData, setFormData] = useState<FormData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // Dropdown options
    const [grades, setGrades] = useState<GradeOption[]>([]);
    const [semesters, setSemesters] = useState<SemesterOption[]>([]);
    const [subjects, setSubjects] = useState<SubjectOption[]>([]);
    const [teachers, setTeachers] = useState<TeacherOption[]>([]);
    const [loadingDropdowns, setLoadingDropdowns] = useState(false);

    // Image upload
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Helper to extract name from translatable object
    const extractName = (name: any): string => {
        if (!name) return '';
        if (typeof name === 'string') return name;
        return name.ar || name.en || '';
    };

    // Fetch dropdown options
    const fetchDropdownOptions = async () => {
        setLoadingDropdowns(true);
        try {
            const [gradesRes, semestersRes, subjectsRes, teachersRes] = await Promise.allSettled([
                adminService.getGradesList(),
                adminService.getSemesters(),
                adminService.getSubjects(),
                adminService.getTeachers({ per_page: 100 }),
            ]);

            if (gradesRes.status === 'fulfilled') {
                const gradeData = gradesRes.value.data || [];
                setGrades(gradeData.map(g => ({
                    id: g.id,
                    name: extractName((g as any).name) || `صف ${g.id}`
                })));
            }
            if (semestersRes.status === 'fulfilled') {
                const semesterData = semestersRes.value.data || [];
                setSemesters(semesterData.map(s => ({
                    id: s.id,
                    name: extractName(s.name)
                })));
            }
            if (subjectsRes.status === 'fulfilled') {
                const subjectData = subjectsRes.value.data || [];
                setSubjects(subjectData.map(s => ({
                    id: s.id,
                    name: extractName((s as any).name) || s.code
                })));
            }
            if (teachersRes.status === 'fulfilled') {
                const teacherData = teachersRes.value.data || [];
                setTeachers(teacherData.map(t => ({
                    id: t.id,
                    name: t.name || t.email || `معلم ${t.id}`
                })));
            }
        } catch (err) {
            console.error('Error fetching dropdown options:', err);
        } finally {
            setLoadingDropdowns(false);
        }
    };

    // Initialize form when modal opens with course data
    useEffect(() => {
        if (isOpen && course) {
            setFormData({
                name_ar: getBilingualValue(course.name, 'ar'),
                name_en: getBilingualValue(course.name, 'en'),
                description_ar: getBilingualValue(course.description, 'ar'),
                description_en: getBilingualValue(course.description, 'en'),
                code: course.code || '',
                credits: course.credits || 3,
                duration_hours: course.duration_hours || 0,
                price: course.price || 0,
                old_price: course.old_price || 0,
                is_promoted: course.is_promoted || false,
                is_active: course.is_active ?? true,
                start_date: course.start_date || '',
                end_date: course.end_date || '',
                grade_id: course.grade_id || null,
                semester_id: course.semester_id || null,
                subject_id: course.subject_id || null,
                teacher_id: course.teacher_id || null,
            });
            setError(null);
            setFieldErrors({});
            setImageFile(null);
            setImagePreview(course.image_path || null);
            fetchDropdownOptions();
        }
    }, [isOpen, course]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen && !loading) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, loading, onClose]);

    // Prevent body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !formData || !course) return null;

    const handleChange = (name: keyof FormData, value: any) => {
        setFormData(prev => prev ? { ...prev, [name]: value } : null);
        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/svg+xml'].includes(file.type)) {
                setFieldErrors(prev => ({ ...prev, image: 'يجب أن تكون الصورة بصيغة JPEG, PNG, JPG, GIF, أو SVG' }));
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                setFieldErrors(prev => ({ ...prev, image: 'حجم الصورة يجب أن لا يتجاوز 2 ميغابايت' }));
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.image;
                return newErrors;
            });
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.name_ar.trim()) errors.name_ar = 'الاسم بالعربية مطلوب';
        if (!formData.name_en.trim()) errors.name_en = 'الاسم بالإنجليزية مطلوب';
        if (!formData.code.trim()) errors.code = 'كود الكورس مطلوب';
        if (formData.credits < 1 || formData.credits > 12) errors.credits = 'الساعات المعتمدة يجب أن تكون بين 1 و 12';
        if (formData.old_price <= 0) errors.old_price = 'السعر الأصلي مطلوب';
        if (!formData.grade_id) errors.grade_id = 'المرحلة الدراسية مطلوبة';
        if (!formData.semester_id) errors.semester_id = 'الفصل الدراسي مطلوب';
        if (!formData.subject_id) errors.subject_id = 'المادة مطلوبة';
        if (!formData.teacher_id) errors.teacher_id = 'المدرس مطلوب';

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setError(null);

        try {
            // Use FormData for file upload
            const submitData = new window.FormData();
            submitData.append('name[ar]', formData.name_ar);
            submitData.append('name[en]', formData.name_en);
            if (formData.description_ar) submitData.append('description[ar]', formData.description_ar);
            if (formData.description_en) submitData.append('description[en]', formData.description_en);
            submitData.append('code', formData.code);
            submitData.append('credits', String(formData.credits));
            if (formData.duration_hours) submitData.append('duration_hours', String(formData.duration_hours));
            if (formData.price) submitData.append('price', String(formData.price));
            submitData.append('old_price', String(formData.old_price));
            submitData.append('is_promoted', formData.is_promoted ? '1' : '0');
            submitData.append('is_active', formData.is_active ? '1' : '0');
            if (formData.start_date) submitData.append('start_date', formData.start_date);
            if (formData.end_date) submitData.append('end_date', formData.end_date);
            submitData.append('grade_id', String(formData.grade_id));
            submitData.append('semester_id', String(formData.semester_id));
            submitData.append('subject_id', String(formData.subject_id));
            submitData.append('teacher_id', String(formData.teacher_id));
            if (imageFile) submitData.append('image', imageFile);

            await adminService.updateCourseWithImage(course.id, submitData);
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Error updating course:', err);
            if (err.response?.data?.errors) {
                const backendErrors: Record<string, string> = {};
                Object.entries(err.response.data.errors).forEach(([key, messages]) => {
                    backendErrors[key] = Array.isArray(messages) ? messages[0] : String(messages);
                });
                setFieldErrors(backendErrors);
            } else {
                setError(err.response?.data?.message || 'فشل في تحديث الكورس');
            }
        } finally {
            setLoading(false);
        }
    };

    const inputClass = (fieldName: string) =>
        `w-full h-11 rounded-[12px] bg-soft-cloud border transition-all outline-none text-sm ${fieldErrors[fieldName]
            ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
            : 'border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10'
        }`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm"
                onClick={loading ? undefined : onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-[20px] shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-br from-amber-500 to-orange-600 px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                            <BookOpen size={24} className="text-white" />
                        </div>
                        <div className="text-white">
                            <h2 className="text-lg font-extrabold">تعديل الكورس</h2>
                            <p className="text-xs text-white/80">{getBilingualValue(course.name, 'ar') || course.code}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                    {/* Error Banner */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-[12px] text-sm flex items-center gap-2">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Bilingual Name Section */}
                        <div className="bg-slate-50 rounded-[12px] p-4">
                            <h3 className="text-sm font-bold text-charcoal mb-3 flex items-center gap-2">
                                <BookOpen size={16} className="text-amber-600" />
                                اسم الكورس
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">بالعربية *</label>
                                    <input
                                        type="text"
                                        value={formData.name_ar}
                                        onChange={(e) => handleChange('name_ar', e.target.value)}
                                        placeholder="اسم الكورس بالعربية"
                                        className={`${inputClass('name_ar')} px-4`}
                                        disabled={loading}
                                        dir="rtl"
                                    />
                                    {fieldErrors.name_ar && <p className="mt-1 text-xs text-red-500">{fieldErrors.name_ar}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">بالإنجليزية *</label>
                                    <input
                                        type="text"
                                        value={formData.name_en}
                                        onChange={(e) => handleChange('name_en', e.target.value)}
                                        placeholder="Course name in English"
                                        className={`${inputClass('name_en')} px-4`}
                                        disabled={loading}
                                        dir="ltr"
                                    />
                                    {fieldErrors.name_en && <p className="mt-1 text-xs text-red-500">{fieldErrors.name_en}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Code and Credits */}
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-charcoal mb-1.5 flex items-center gap-1">
                                    <Code size={14} />
                                    كود الكورس *
                                </label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                                    placeholder="MATH101"
                                    className={`${inputClass('code')} px-4`}
                                    disabled={loading}
                                    dir="ltr"
                                />
                                {fieldErrors.code && <p className="mt-1 text-xs text-red-500">{fieldErrors.code}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-charcoal mb-1.5">الساعات المعتمدة *</label>
                                <input
                                    type="number"
                                    value={formData.credits}
                                    onChange={(e) => handleChange('credits', parseInt(e.target.value) || 1)}
                                    min={1}
                                    max={12}
                                    className={`${inputClass('credits')} px-4`}
                                    disabled={loading}
                                />
                                {fieldErrors.credits && <p className="mt-1 text-xs text-red-500">{fieldErrors.credits}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-charcoal mb-1.5 flex items-center gap-1">
                                    <Clock size={14} />
                                    مدة الكورس (ساعات)
                                </label>
                                <input
                                    type="number"
                                    value={formData.duration_hours || ''}
                                    onChange={(e) => handleChange('duration_hours', parseInt(e.target.value) || 0)}
                                    min={0}
                                    placeholder="24"
                                    className={`${inputClass('duration_hours')} px-4`}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Price Section */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-charcoal mb-1.5 flex items-center gap-1">
                                    <DollarSign size={14} />
                                    السعر الأصلي (ر.ع) *
                                </label>
                                <input
                                    type="number"
                                    value={formData.old_price || ''}
                                    onChange={(e) => handleChange('old_price', parseFloat(e.target.value) || 0)}
                                    min={0}
                                    step="0.01"
                                    placeholder="50.00"
                                    className={`${inputClass('old_price')} px-4`}
                                    disabled={loading}
                                />
                                {fieldErrors.old_price && <p className="mt-1 text-xs text-red-500">{fieldErrors.old_price}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-charcoal mb-1.5 flex items-center gap-1">
                                    <DollarSign size={14} className="text-green-600" />
                                    السعر بعد الخصم (ر.ع)
                                </label>
                                <input
                                    type="number"
                                    value={formData.price || ''}
                                    onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                                    min={0}
                                    step="0.01"
                                    placeholder="40.00"
                                    className={`${inputClass('price')} px-4`}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Category Dropdowns */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-charcoal mb-1.5 flex items-center gap-1">
                                    <GraduationCap size={14} />
                                    المرحلة الدراسية *
                                </label>
                                <select
                                    value={formData.grade_id || ''}
                                    onChange={(e) => handleChange('grade_id', parseInt(e.target.value) || null)}
                                    className={`${inputClass('grade_id')} px-4 appearance-none cursor-pointer`}
                                    disabled={loading || loadingDropdowns}
                                >
                                    <option value="">اختر المرحلة</option>
                                    {grades.map(grade => (
                                        <option key={grade.id} value={grade.id}>{grade.name}</option>
                                    ))}
                                </select>
                                {fieldErrors.grade_id && <p className="mt-1 text-xs text-red-500">{fieldErrors.grade_id}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-charcoal mb-1.5">الفصل الدراسي *</label>
                                <select
                                    value={formData.semester_id || ''}
                                    onChange={(e) => handleChange('semester_id', parseInt(e.target.value) || null)}
                                    className={`${inputClass('semester_id')} px-4 appearance-none cursor-pointer`}
                                    disabled={loading || loadingDropdowns}
                                >
                                    <option value="">اختر الفصل</option>
                                    {semesters.map(semester => (
                                        <option key={semester.id} value={semester.id}>{semester.name}</option>
                                    ))}
                                </select>
                                {fieldErrors.semester_id && <p className="mt-1 text-xs text-red-500">{fieldErrors.semester_id}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-charcoal mb-1.5">المادة *</label>
                                <select
                                    value={formData.subject_id || ''}
                                    onChange={(e) => handleChange('subject_id', parseInt(e.target.value) || null)}
                                    className={`${inputClass('subject_id')} px-4 appearance-none cursor-pointer`}
                                    disabled={loading || loadingDropdowns}
                                >
                                    <option value="">اختر المادة</option>
                                    {subjects.map(subject => (
                                        <option key={subject.id} value={subject.id}>{subject.name}</option>
                                    ))}
                                </select>
                                {fieldErrors.subject_id && <p className="mt-1 text-xs text-red-500">{fieldErrors.subject_id}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-charcoal mb-1.5 flex items-center gap-1">
                                    <User size={14} />
                                    المدرس *
                                </label>
                                <select
                                    value={formData.teacher_id || ''}
                                    onChange={(e) => handleChange('teacher_id', parseInt(e.target.value) || null)}
                                    className={`${inputClass('teacher_id')} px-4 appearance-none cursor-pointer`}
                                    disabled={loading || loadingDropdowns}
                                >
                                    <option value="">اختر المدرس</option>
                                    {teachers.map(teacher => (
                                        <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                                    ))}
                                </select>
                                {fieldErrors.teacher_id && <p className="mt-1 text-xs text-red-500">{fieldErrors.teacher_id}</p>}
                            </div>
                        </div>

                        {/* Date Range */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-charcoal mb-1.5 flex items-center gap-1">
                                    <Calendar size={14} />
                                    تاريخ البداية
                                </label>
                                <input
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => handleChange('start_date', e.target.value)}
                                    className={`${inputClass('start_date')} px-4`}
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-charcoal mb-1.5 flex items-center gap-1">
                                    <Calendar size={14} />
                                    تاريخ الانتهاء
                                </label>
                                <input
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => handleChange('end_date', e.target.value)}
                                    className={`${inputClass('end_date')} px-4`}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Description Section */}
                        <div className="bg-slate-50 rounded-[12px] p-4">
                            <h3 className="text-sm font-bold text-charcoal mb-3">الوصف (اختياري)</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">بالعربية</label>
                                    <textarea
                                        value={formData.description_ar}
                                        onChange={(e) => handleChange('description_ar', e.target.value)}
                                        placeholder="وصف الكورس بالعربية"
                                        className="w-full h-20 rounded-[12px] bg-white border border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none text-sm p-3 resize-none"
                                        disabled={loading}
                                        dir="rtl"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">بالإنجليزية</label>
                                    <textarea
                                        value={formData.description_en}
                                        onChange={(e) => handleChange('description_en', e.target.value)}
                                        placeholder="Course description in English"
                                        className="w-full h-20 rounded-[12px] bg-white border border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none text-sm p-3 resize-none"
                                        disabled={loading}
                                        dir="ltr"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Course Image */}
                        <div>
                            <label className="block text-xs font-semibold text-charcoal mb-2">صورة الكورس</label>
                            <div className="flex items-start gap-4">
                                <div className="w-24 h-16 rounded-[12px] bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <BookOpen size={24} className="text-slate-400" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageChange}
                                        accept="image/jpeg,image/png,image/jpg,image/gif,image/svg+xml"
                                        className="hidden"
                                        disabled={loading}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={loading}
                                            className="h-9 px-4 rounded-[10px] bg-slate-100 hover:bg-slate-200 text-charcoal font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                                        >
                                            <ImagePlus size={16} />
                                            <span>{imageFile || imagePreview ? 'تغيير' : 'اختيار صورة'}</span>
                                        </button>
                                        {(imageFile || imagePreview) && (
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                disabled={loading}
                                                className="w-9 h-9 rounded-[10px] bg-red-100 hover:bg-red-200 text-red-600 transition-colors flex items-center justify-center disabled:opacity-50"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">JPEG, PNG, SVG (الحد الأقصى 2MB)</p>
                                    {fieldErrors.image && <p className="text-xs text-red-500 mt-1">{fieldErrors.image}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Status Toggles */}
                        <div className="flex gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => handleChange('is_active', e.target.checked)}
                                    className="w-4 h-4 rounded text-amber-600"
                                    disabled={loading}
                                />
                                <span className="text-sm text-charcoal">نشط</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_promoted}
                                    onChange={(e) => handleChange('is_promoted', e.target.checked)}
                                    className="w-4 h-4 rounded text-amber-500"
                                    disabled={loading}
                                />
                                <span className="text-sm text-charcoal">مميز (Promoted)</span>
                            </label>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 h-12 rounded-pill bg-slate-100 hover:bg-slate-200 text-charcoal font-semibold text-sm transition-all disabled:opacity-50"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 h-12 rounded-pill bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-lg transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    <span>جاري الحفظ...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    <span>حفظ التغييرات</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
