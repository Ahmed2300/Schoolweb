import { useState, useEffect, useRef, useMemo } from 'react';
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
    AlertCircle,
    Gift,
    CheckCircle
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
    grade_id?: number;
    grade_ids?: number[];
    start_date?: string;
    end_date?: string;
}

interface SubjectOption {
    id: number;
    name: string;
    study_term_id?: number;
    semester_ids?: number[];
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
    is_academic: boolean;
    is_free: boolean;
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
    const [loadingData, setLoadingData] = useState(false);
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
                adminService.getGrades({ per_page: 100 }),
                adminService.getSemesters({ per_page: 100 }),
                adminService.getSubjects({ per_page: 100 }),
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
                    name: extractName(s.name),
                    grade_id: s.grade_id || (s as any).grade?.id,
                    grade_ids: s.grade_ids || (s as any).grades?.map((g: any) => g.id),
                    start_date: s.start_date,
                    end_date: s.end_date
                })));
            }
            if (subjectsRes.status === 'fulfilled') {
                const subjectData = subjectsRes.value.data || [];
                setSubjects(subjectData.map(s => ({
                    id: s.id,
                    name: extractName((s as any).name) || s.code,
                    study_term_id: s.study_term_id,
                    semester_ids: s.semester_ids || (s as any).semesters?.map((sem: any) => sem.id)
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
            // Fetch full course details to ensure we have all fields
            const fetchFullCourseDetails = async () => {
                setLoadingData(true);
                try {
                    const fullCourse = await adminService.getCourse(course.id);

                    // Determine if course is free (current price is 0 or null, regardless of old_price)
                    const isFree = !fullCourse.price || fullCourse.price === 0;

                    // Get start/end dates - if course has semester but no dates, we'll populate from semester later
                    let startDate = fullCourse.start_date?.split('T')[0] || '';
                    let endDate = fullCourse.end_date?.split('T')[0] || '';

                    // For academic courses with semester but no dates, fetch semester dates
                    const semesterId = fullCourse.semester_id || fullCourse.semester?.id;
                    if (fullCourse.is_academic && semesterId && (!startDate || !endDate)) {
                        // Wait for semesters to load and then populate dates
                        try {
                            const semestersRes = await adminService.getSemesters({ per_page: 100 });
                            const semester = semestersRes.data.find((s: any) => s.id === semesterId);
                            if (semester) {
                                startDate = semester.start_date?.split('T')[0] || startDate;
                                endDate = semester.end_date?.split('T')[0] || endDate;
                            }
                        } catch (semErr) {
                            console.warn('Could not fetch semester dates:', semErr);
                        }
                    }

                    // DEBUG: Log raw API response for name and description
                    console.log('Raw API fullCourse.name:', fullCourse.name);
                    console.log('Raw API fullCourse.description:', fullCourse.description);

                    const newFormData = {
                        name_ar: getBilingualValue(fullCourse.name, 'ar'),
                        name_en: getBilingualValue(fullCourse.name, 'en'),
                        description_ar: getBilingualValue(fullCourse.description, 'ar'),
                        description_en: getBilingualValue(fullCourse.description, 'en'),
                        code: fullCourse.code || '',
                        credits: fullCourse.credits || 3,
                        duration_hours: fullCourse.duration_hours || 0,
                        price: fullCourse.price || 0,
                        old_price: fullCourse.old_price || 0,
                        is_promoted: fullCourse.is_promoted || false,
                        is_active: fullCourse.is_active ?? true,
                        is_academic: (fullCourse as any).is_academic ?? true,
                        is_free: isFree,
                        start_date: startDate,
                        end_date: endDate,
                        grade_id: fullCourse.grade_id || fullCourse.grade?.id || null,
                        semester_id: semesterId || null,
                        subject_id: fullCourse.subject_id || fullCourse.subject?.id || null,
                        teacher_id: fullCourse.teacher_id || fullCourse.teacher?.id || null,
                    };
                    console.log('Setting form data:', newFormData);
                    console.log('Dropdown IDs:', {
                        grade_id: newFormData.grade_id,
                        semester_id: newFormData.semester_id,
                        subject_id: newFormData.subject_id,
                        teacher_id: newFormData.teacher_id
                    });
                    setFormData(newFormData);
                    setError(null);
                    setFieldErrors({});
                    setImageFile(null);
                    setImagePreview(fullCourse.image_path || null);
                } catch (err) {
                    console.error('Error fetching course details:', err);
                    // Fallback to using the passed course data
                    const isFree = !course.price && !course.old_price;
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
                        is_academic: (course as any).is_academic ?? true,
                        is_free: isFree,
                        start_date: course.start_date?.split('T')[0] || '',
                        end_date: course.end_date?.split('T')[0] || '',
                        grade_id: course.grade_id || course.grade?.id || null,
                        semester_id: course.semester_id || course.semester?.id || null,
                        subject_id: course.subject_id || course.subject?.id || null,
                        teacher_id: course.teacher_id || course.teacher?.id || null,
                    });
                    setImagePreview(course.image_path || null);
                } finally {
                    setLoadingData(false);
                }
            };

            fetchFullCourseDetails();
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

    // Filtered options based on selection
    const filteredSemesters = useMemo(() => {
        if (!formData?.grade_id) return [];
        const gradeId = formData.grade_id;
        return semesters.filter(s =>
            s.grade_id === gradeId ||
            (s.grade_ids && s.grade_ids.includes(gradeId))
        );
    }, [semesters, formData?.grade_id]);

    const filteredSubjects = useMemo(() => {
        if (!formData?.semester_id) return [];
        const semesterId = formData.semester_id;
        return subjects.filter(s =>
            s.study_term_id === semesterId ||
            (s.semester_ids && s.semester_ids.includes(semesterId))
        );
    }, [subjects, formData?.semester_id]);


    // Early return if modal is not open or no course provided
    if (!isOpen || !course) return null;

    // Loading skeleton component
    const LoadingSkeleton = () => (
        <div className="p-8 animate-pulse space-y-6">
            {/* Name Section Skeleton */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-6 border border-slate-200/60">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-red-50"></div>
                    <div className="h-5 bg-slate-200 rounded w-24"></div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                    <div className="h-12 bg-slate-200/80 rounded-xl"></div>
                    <div className="h-12 bg-slate-200/80 rounded-xl"></div>
                </div>
            </div>

            {/* Code & Credits Skeleton */}
            <div className="grid grid-cols-3 gap-5">
                <div className="h-12 bg-slate-100 rounded-xl"></div>
                <div className="h-12 bg-slate-100 rounded-xl"></div>
                <div className="h-12 bg-slate-100 rounded-xl"></div>
            </div>

            {/* Pricing Skeleton */}
            <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-2xl p-6 border border-green-200/60">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-green-100"></div>
                    <div className="h-5 bg-green-200 rounded w-20"></div>
                </div>
                <div className="h-14 bg-white/80 rounded-xl mb-5"></div>
                <div className="grid grid-cols-2 gap-5">
                    <div className="h-12 bg-white/60 rounded-xl"></div>
                    <div className="h-12 bg-white/60 rounded-xl"></div>
                </div>
            </div>

            {/* Course Type Skeleton */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-6 border border-slate-200/60">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-red-50"></div>
                    <div className="h-5 bg-slate-200 rounded w-24"></div>
                </div>
                <div className="flex gap-4">
                    <div className="h-20 bg-slate-200/60 rounded-xl flex-1"></div>
                    <div className="h-20 bg-slate-200/60 rounded-xl flex-1"></div>
                </div>
            </div>

            {/* Academic Classification Skeleton */}
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50/50 to-sky-50 rounded-2xl p-6 border border-blue-200/60">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-blue-100"></div>
                    <div className="h-5 bg-blue-200 rounded w-32"></div>
                </div>
                <div className="grid grid-cols-2 gap-5 mb-5">
                    <div className="h-12 bg-white/60 rounded-xl"></div>
                    <div className="h-12 bg-white/60 rounded-xl"></div>
                </div>
                <div className="h-12 bg-white/60 rounded-xl"></div>
            </div>

            {/* Teacher & Dates Skeleton */}
            <div className="space-y-5">
                <div className="h-12 bg-slate-100 rounded-xl"></div>
                <div className="grid grid-cols-2 gap-5">
                    <div className="h-12 bg-slate-100 rounded-xl"></div>
                    <div className="h-12 bg-slate-100 rounded-xl"></div>
                </div>
            </div>

            {/* Description Skeleton */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-6 border border-slate-200/60">
                <div className="h-5 bg-slate-200 rounded w-28 mb-4"></div>
                <div className="grid grid-cols-2 gap-5">
                    <div className="h-24 bg-white/60 rounded-xl"></div>
                    <div className="h-24 bg-white/60 rounded-xl"></div>
                </div>
            </div>

            {/* Image Skeleton */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-6 border border-slate-200/60">
                <div className="h-5 bg-slate-200 rounded w-24 mb-4"></div>
                <div className="flex items-start gap-5">
                    <div className="w-32 h-24 bg-white rounded-xl border-2 border-dashed border-slate-300"></div>
                    <div className="flex-1 space-y-3">
                        <div className="h-11 bg-slate-200/80 rounded-xl w-40"></div>
                        <div className="h-4 bg-slate-200/60 rounded w-48"></div>
                    </div>
                </div>
            </div>

            {/* Status Toggles Skeleton */}
            <div className="flex gap-8 p-4 bg-slate-50/50 rounded-xl border border-slate-200/50">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-7 bg-slate-200 rounded-full"></div>
                    <div className="h-4 bg-slate-200 rounded w-12"></div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-7 bg-slate-200 rounded-full"></div>
                    <div className="h-4 bg-slate-200 rounded w-20"></div>
                </div>
            </div>
        </div>
    );

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
        if (!formData) return false;

        const errors: Record<string, string> = {};

        if (!formData.name_ar.trim()) errors.name_ar = 'الاسم بالعربية مطلوب';
        if (!formData.name_en.trim()) errors.name_en = 'الاسم بالإنجليزية مطلوب';
        if (!formData.code.trim()) errors.code = 'كود الكورس مطلوب';
        if (formData.credits < 1 || formData.credits > 12) errors.credits = 'الساعات المعتمدة يجب أن تكون بين 1 و 12';

        // Only require price if not free and prices aren't already zero
        const effectivelyFree = formData.is_free || (formData.price === 0 && formData.old_price === 0);
        if (!effectivelyFree && formData.old_price <= 0) {
            errors.old_price = 'السعر الأصلي مطلوب';
        }

        // Academic fields only required if is_academic is true
        if (formData.is_academic) {
            if (!formData.grade_id) errors.grade_id = 'المرحلة الدراسية مطلوبة';
            if (!formData.semester_id) errors.semester_id = 'الفصل الدراسي مطلوب';
            if (!formData.subject_id) errors.subject_id = 'المادة مطلوبة';
        }

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
            // Ensure formData is not null
            if (!formData) {
                setError('بيانات النموذج غير متوفرة');
                return;
            }

            // Use FormData for file upload
            const submitData = new window.FormData();
            submitData.append('name[ar]', formData.name_ar);
            submitData.append('name[en]', formData.name_en);
            if (formData.description_ar) submitData.append('description[ar]', formData.description_ar);
            if (formData.description_en) submitData.append('description[en]', formData.description_en);
            submitData.append('code', formData.code);
            submitData.append('credits', String(formData.credits));
            if (formData.duration_hours) submitData.append('duration_hours', String(formData.duration_hours));
            // CRITICAL: Always send price. If is_free is true, send 0, otherwise send the actual price
            const actualPrice = formData.is_free ? 0 : (formData.price || 0);
            submitData.append('price', String(actualPrice));
            // Only send old_price if course is NOT free
            submitData.append('old_price', String(formData.is_free ? 0 : (formData.old_price || 0)));
            submitData.append('is_promoted', formData.is_promoted ? '1' : '0');
            submitData.append('is_active', formData.is_active ? '1' : '0');
            submitData.append('is_academic', formData.is_academic ? '1' : '0');
            if (formData.start_date) submitData.append('start_date', formData.start_date);
            if (formData.end_date) submitData.append('end_date', formData.end_date);
            // Only include academic fields if is_academic is true
            if (formData.is_academic) {
                if (formData.grade_id) submitData.append('grade_id', String(formData.grade_id));
                if (formData.semester_id) submitData.append('semester_id', String(formData.semester_id));
                if (formData.subject_id) submitData.append('subject_id', String(formData.subject_id));
            }
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
        `w-full h-12 rounded-xl bg-slate-50/80 border-2 transition-all duration-200 outline-none text-sm font-medium ${fieldErrors[fieldName]
            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100 bg-red-50/50'
            : 'border-slate-200/80 focus:border-[#AF0C15] focus:ring-4 focus:ring-[#AF0C15]/10 focus:bg-white hover:border-slate-300'
        }`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm"
                onClick={loading ? undefined : onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden animate-in zoom-in-95 fade-in duration-300" style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)' }}>
                {/* Header */}
                <div className="sticky top-0 bg-[#AF0C15] px-8 py-6 flex items-center justify-between" style={{ boxShadow: '0 4px 20px -4px rgba(175, 12, 21, 0.4)' }}>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-lg">
                            <BookOpen size={28} className="text-white" />
                        </div>
                        <div className="text-white">
                            <h2 className="text-xl font-extrabold tracking-tight">تعديل الكورس</h2>
                            <p className="text-sm text-white/80 font-medium">{getBilingualValue(course.name, 'ar') || course.code}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-200 hover:scale-105 disabled:opacity-50 border border-white/20"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form or Loading Skeleton */}
                {loadingData || !formData ? (
                    <LoadingSkeleton />
                ) : (
                    <form onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
                        {/* Error Banner */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm flex items-center gap-3 shadow-sm">
                                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                                    <AlertCircle size={20} className="text-red-600" />
                                </div>
                                <span className="font-medium">{error}</span>
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* Bilingual Name Section */}
                            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-6 border border-slate-200/60 shadow-sm">
                                <h3 className="text-base font-bold text-charcoal mb-4 flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                                        <BookOpen size={18} className="text-[#AF0C15]" />
                                    </div>
                                    اسم الكورس
                                </h3>
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">بالعربية *</label>
                                        <input
                                            type="text"
                                            value={formData.name_ar}
                                            onChange={(e) => handleChange('name_ar', e.target.value)}
                                            placeholder="اسم الكورس بالعربية"
                                            className={`${inputClass('name_ar')} px-4`}
                                            disabled={loading}
                                            dir="rtl"
                                        />
                                        {fieldErrors.name_ar && <p className="mt-2 text-xs text-red-500 font-medium">{fieldErrors.name_ar}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">بالإنجليزية *</label>
                                        <input
                                            type="text"
                                            value={formData.name_en}
                                            onChange={(e) => handleChange('name_en', e.target.value)}
                                            placeholder="Course name in English"
                                            className={`${inputClass('name_en')} px-4`}
                                            disabled={loading}
                                            dir="ltr"
                                        />
                                        {fieldErrors.name_en && <p className="mt-2 text-xs text-red-500 font-medium">{fieldErrors.name_en}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Code and Credits */}
                            <div className="grid grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                        <Code size={15} className="text-slate-500" />
                                        كود الكورس *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                                        placeholder="MATH101"
                                        className={`${inputClass('code')} px-4 font-mono`}
                                        disabled={loading}
                                        dir="ltr"
                                    />
                                    {fieldErrors.code && <p className="mt-2 text-xs text-red-500 font-medium">{fieldErrors.code}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">الساعات المعتمدة *</label>
                                    <input
                                        type="number"
                                        value={formData.credits}
                                        onChange={(e) => handleChange('credits', parseInt(e.target.value) || 1)}
                                        min={1}
                                        max={12}
                                        className={`${inputClass('credits')} px-4`}
                                        disabled={loading}
                                    />
                                    {fieldErrors.credits && <p className="mt-2 text-xs text-red-500 font-medium">{fieldErrors.credits}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                        <Clock size={15} className="text-slate-500" />
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
                            {/* Pricing Section with Free Toggle */}
                            <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-2xl p-6 border border-green-200/60 shadow-sm">
                                <h3 className="text-base font-bold text-charcoal mb-5 flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
                                        <DollarSign size={18} className="text-green-600" />
                                    </div>
                                    التسعير
                                </h3>

                                {/* Free Course Toggle */}
                                <div className="flex items-center justify-between p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-green-200/50 mb-5 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center shadow-sm">
                                            <Gift size={22} className="text-green-600" />
                                        </div>
                                        <div>
                                            <span className="font-bold text-charcoal text-base">كورس مجاني</span>
                                            <p className="text-sm text-slate-500">لن يتم تحصيل أي رسوم</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newIsFree = !formData.is_free;
                                            if (newIsFree) {
                                                setFormData(prev => prev ? { ...prev, is_free: true, price: 0, old_price: 0 } : null);
                                            } else {
                                                handleChange('is_free', false);
                                            }
                                        }}
                                        disabled={loading}
                                        className={`relative w-16 h-8 rounded-full transition-all duration-300 shadow-inner ${formData.is_free ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-slate-300'
                                            }`}
                                    >
                                        <span
                                            className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-all duration-300 ${formData.is_free ? 'right-1' : 'right-8'
                                                }`}
                                        />
                                    </button>
                                </div>

                                {formData.is_free ? (
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 text-green-700 shadow-sm">
                                        <CheckCircle size={20} />
                                        <span className="font-bold text-base">هذا الكورس مجاني بالكامل 🎉</span>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                                <DollarSign size={15} className="text-slate-500" />
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
                                            {fieldErrors.old_price && <p className="mt-2 text-xs text-red-500 font-medium">{fieldErrors.old_price}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
                                                <DollarSign size={15} className="text-green-600" />
                                                السعر بعد الخصم (ر.ع)
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.price || ''}
                                                onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                                                min={0}
                                                step="0.01"
                                                placeholder="40.00"
                                                className={`${inputClass('price')} px-4 border-green-200 focus:border-green-500`}
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Course Type Toggle - Academic vs Skills */}
                            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-6 border border-slate-200/60 shadow-sm">
                                <h3 className="text-base font-bold text-[#1F1F1F] mb-5 flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                                        <GraduationCap size={18} className="text-[#AF0C15]" />
                                    </div>
                                    نوع الكورس
                                </h3>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => handleChange('is_academic', true)}
                                        disabled={loading}
                                        className={`flex-1 h-20 rounded-xl border-2 transition-all duration-300 flex items-center justify-center gap-4 hover:scale-[1.02] ${formData.is_academic
                                            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 shadow-lg shadow-blue-500/20'
                                            : 'border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:bg-blue-50/50'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${formData.is_academic ? 'bg-blue-100' : 'bg-slate-100'}`}>
                                            <GraduationCap size={24} />
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold text-base block">أكاديمي</span>
                                            <span className="text-xs opacity-70">مرتبط بصف وترم</span>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleChange('is_academic', false)}
                                        disabled={loading}
                                        className={`flex-1 h-20 rounded-xl border-2 transition-all duration-300 flex items-center justify-center gap-4 hover:scale-[1.02] ${!formData.is_academic
                                            ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-fuchsia-50 text-purple-700 shadow-lg shadow-purple-500/20'
                                            : 'border-slate-200 bg-white text-slate-500 hover:border-purple-300 hover:bg-purple-50/50'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${!formData.is_academic ? 'bg-purple-100' : 'bg-slate-100'}`}>
                                            <BookOpen size={24} />
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold text-base block">مهارات</span>
                                            <span className="text-xs opacity-70">قرآن، فقه، لغات</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Academic Fields - Only show if is_academic is true */}
                            {formData.is_academic && (
                                <div className="bg-gradient-to-br from-blue-50 via-indigo-50/50 to-sky-50 rounded-2xl p-6 border border-blue-200/60 shadow-sm space-y-5 animate-in slide-in-from-top-2 duration-300">
                                    <h3 className="text-base font-bold text-blue-800 flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                                            <GraduationCap size={18} className="text-blue-600" />
                                        </div>
                                        التصنيف الأكاديمي
                                    </h3>

                                    <div className="grid grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                                <GraduationCap size={15} className="text-blue-500" />
                                                المرحلة الدراسية *
                                            </label>
                                            <select
                                                value={formData.grade_id || ''}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value) || null;
                                                    setFormData(prev => prev ? { ...prev, grade_id: val, semester_id: null, subject_id: null } : null);
                                                }}
                                                className={`${inputClass('grade_id')} px-4 appearance-none cursor-pointer`}
                                                disabled={loading || loadingDropdowns}
                                            >
                                                <option value="">اختر المرحلة</option>
                                                {grades.map(grade => (
                                                    <option key={grade.id} value={grade.id}>{grade.name}</option>
                                                ))}
                                            </select>
                                            {fieldErrors.grade_id && <p className="mt-2 text-xs text-red-500 font-medium">{fieldErrors.grade_id}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">الفصل الدراسي *</label>
                                            <select
                                                value={formData.semester_id || ''}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value) || null;
                                                    if (val) {
                                                        const selectedSemester = semesters.find(s => s.id === val);
                                                        const startDate = selectedSemester?.start_date?.split('T')[0] || '';
                                                        const endDate = selectedSemester?.end_date?.split('T')[0] || '';
                                                        setFormData(prev => prev ? {
                                                            ...prev,
                                                            semester_id: val,
                                                            subject_id: null,
                                                            start_date: startDate || prev.start_date,
                                                            end_date: endDate || prev.end_date
                                                        } : null);
                                                    } else {
                                                        setFormData(prev => prev ? { ...prev, semester_id: val, subject_id: null } : null);
                                                    }
                                                }}
                                                className={`${inputClass('semester_id')} px-4 appearance-none cursor-pointer`}
                                                disabled={loading || loadingDropdowns || !formData.grade_id}
                                            >
                                                <option value="">اختر الفصل</option>
                                                {filteredSemesters.map(semester => (
                                                    <option key={semester.id} value={semester.id}>{semester.name}</option>
                                                ))}
                                            </select>
                                            {fieldErrors.semester_id && <p className="mt-2 text-xs text-red-500 font-medium">{fieldErrors.semester_id}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">المادة *</label>
                                        <select
                                            value={formData.subject_id || ''}
                                            onChange={(e) => handleChange('subject_id', parseInt(e.target.value) || null)}
                                            className={`${inputClass('subject_id')} px-4 appearance-none cursor-pointer`}
                                            disabled={loading || loadingDropdowns || !formData.semester_id}
                                        >
                                            <option value="">اختر المادة</option>
                                            {filteredSubjects.map(subject => (
                                                <option key={subject.id} value={subject.id}>{subject.name}</option>
                                            ))}
                                        </select>
                                        {fieldErrors.subject_id && <p className="mt-2 text-xs text-red-500 font-medium">{fieldErrors.subject_id}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Teacher - Always shown */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                    <User size={15} className="text-slate-500" />
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
                                {fieldErrors.teacher_id && <p className="mt-2 text-xs text-red-500 font-medium">{fieldErrors.teacher_id}</p>}
                            </div>

                            {/* Date Range */}
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                        <Calendar size={15} className="text-slate-500" />
                                        تاريخ البداية
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) => handleChange('start_date', e.target.value)}
                                        className={`${inputClass('start_date')} px-4`}
                                        disabled={loading || formData.is_academic}
                                        readOnly={formData.is_academic}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                        <Calendar size={15} className="text-slate-500" />
                                        تاريخ الانتهاء
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.end_date}
                                        onChange={(e) => handleChange('end_date', e.target.value)}
                                        className={`${inputClass('end_date')} px-4`}
                                        disabled={loading || formData.is_academic}
                                        readOnly={formData.is_academic}
                                    />
                                </div>
                            </div>

                            {/* Description Section */}
                            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-6 border border-slate-200/60 shadow-sm">
                                <h3 className="text-base font-bold text-charcoal mb-4">الوصف (اختياري)</h3>
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">بالعربية</label>
                                        <textarea
                                            value={formData.description_ar}
                                            onChange={(e) => handleChange('description_ar', e.target.value)}
                                            placeholder="وصف الكورس بالعربية"
                                            className="w-full h-24 rounded-xl bg-white border-2 border-slate-200/80 focus:border-[#AF0C15] focus:ring-4 focus:ring-[#AF0C15]/10 outline-none text-sm p-4 resize-none transition-all duration-200 hover:border-slate-300"
                                            disabled={loading}
                                            dir="rtl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">بالإنجليزية</label>
                                        <textarea
                                            value={formData.description_en}
                                            onChange={(e) => handleChange('description_en', e.target.value)}
                                            placeholder="Course description in English"
                                            className="w-full h-24 rounded-xl bg-white border-2 border-slate-200/80 focus:border-[#AF0C15] focus:ring-4 focus:ring-[#AF0C15]/10 outline-none text-sm p-4 resize-none transition-all duration-200 hover:border-slate-300"
                                            disabled={loading}
                                            dir="ltr"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Course Image */}
                            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-6 border border-slate-200/60 shadow-sm">
                                <label className="block text-base font-bold text-charcoal mb-4">صورة الكورس</label>
                                <div className="flex items-start gap-5">
                                    <div className="w-32 h-24 rounded-xl bg-white border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shadow-inner">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <BookOpen size={28} className="text-slate-400" />
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
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={loading}
                                                className="h-11 px-5 rounded-xl bg-white border-2 border-slate-200 hover:border-[#AF0C15] hover:bg-red-50 text-charcoal font-semibold text-sm transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                                            >
                                                <ImagePlus size={18} />
                                                <span>{imageFile || imagePreview ? 'تغيير' : 'اختيار صورة'}</span>
                                            </button>
                                            {(imageFile || imagePreview) && (
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveImage}
                                                    disabled={loading}
                                                    className="w-11 h-11 rounded-xl bg-red-50 border-2 border-red-200 hover:bg-red-100 hover:border-red-300 text-red-600 transition-all duration-200 flex items-center justify-center disabled:opacity-50"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-500 mt-2">JPEG, PNG, SVG (الحد الأقصى 2MB)</p>
                                        {fieldErrors.image && <p className="text-xs text-red-500 font-medium mt-1">{fieldErrors.image}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Status Toggles */}
                            <div className="flex gap-8 p-4 bg-slate-50/50 rounded-xl border border-slate-200/50">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-12 h-7 rounded-full transition-all duration-300 relative ${formData.is_active ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-slate-300'}`}>
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => handleChange('is_active', e.target.checked)}
                                            className="sr-only"
                                            disabled={loading}
                                        />
                                        <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${formData.is_active ? 'right-0.5' : 'right-5'}`} />
                                    </div>
                                    <span className="text-sm font-semibold text-[#1F1F1F] group-hover:text-[#27AE60] transition-colors">نشط</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-12 h-7 rounded-full transition-all duration-300 relative ${formData.is_promoted ? 'bg-[#AF0C15]' : 'bg-slate-300'}`}>
                                        <input
                                            type="checkbox"
                                            checked={formData.is_promoted}
                                            onChange={(e) => handleChange('is_promoted', e.target.checked)}
                                            className="sr-only"
                                            disabled={loading}
                                        />
                                        <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${formData.is_promoted ? 'right-0.5' : 'right-5'}`} />
                                    </div>
                                    <span className="text-sm font-semibold text-[#1F1F1F] group-hover:text-[#AF0C15] transition-colors">مميز (Promoted)</span>
                                </label>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 mt-8 pt-6 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="flex-1 h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 text-charcoal font-bold text-base transition-all duration-200 disabled:opacity-50"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 h-14 rounded-full bg-[#AF0C15] hover:bg-[#8E0A11] text-white font-bold text-base shadow-lg shadow-[#AF0C15]/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#AF0C15]/40 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-lg flex items-center justify-center gap-3"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        <span>جاري الحفظ...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save size={20} />
                                        <span>حفظ التغييرات</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
