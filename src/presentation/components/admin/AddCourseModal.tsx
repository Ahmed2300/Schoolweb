import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
    X,
    Loader2,
    BookOpen,
    Code,
    DollarSign,
    Clock,
    ImagePlus,
    Trash2,
    User,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Layers,
    Calendar,
    BookMarked,
    CheckCircle2,
    Sparkles,
    Gift,
    Percent,
    Wand2,
    GraduationCap,
} from 'lucide-react';
import { adminService } from '../../../data/api/adminService';

interface AddCourseModalProps {
    isOpen: boolean;
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
    end_date?: string;
}

interface SubjectOption {
    id: number;
    name: string;
    study_term_id?: number;
}

interface TeacherOption {
    id: number;
    name: string;
}

interface FormData {
    grade_id: number | null;
    semester_id: number | null;
    subject_id: number | null;
    name_ar: string;
    name_en: string;
    code: string;
    credits: number;
    duration_hours: number;
    price: number;
    old_price: number;
    teacher_id: number | null;
    description_ar: string;
    description_en: string;
    is_promoted: boolean;
    is_active: boolean;
    is_free: boolean;
    is_academic: boolean;
}

const STEPS = [
    { id: 1, title: 'نوع الكورس', icon: Layers },
    { id: 2, title: 'الصف الدراسي', icon: GraduationCap },
    { id: 3, title: 'الفصل الدراسي', icon: Calendar },
    { id: 4, title: 'المادة الدراسية', icon: BookMarked },
    { id: 5, title: 'تفاصيل الكورس', icon: BookOpen },
    { id: 6, title: 'المراجعة والإنهاء', icon: CheckCircle2 },
];

const initialFormData: FormData = {
    grade_id: null,
    semester_id: null,
    subject_id: null,
    name_ar: '',
    name_en: '',
    code: '',
    credits: 3,
    duration_hours: 0,
    price: 0,
    old_price: 0,
    teacher_id: null,
    description_ar: '',
    description_en: '',
    is_promoted: false,
    is_active: true,
    is_free: false,
    is_academic: true, // Default to Academic
};

const DURATION_PRESETS = [10, 20, 30, 40, 50, 60];

const extractName = (name: any): string => {
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
    return name.ar || name.en || '';
};

export function AddCourseModal({ isOpen, onClose, onSuccess }: AddCourseModalProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [grades, setGrades] = useState<GradeOption[]>([]);
    const [semesters, setSemesters] = useState<SemesterOption[]>([]);
    const [subjects, setSubjects] = useState<SubjectOption[]>([]);
    const [teachers, setTeachers] = useState<TeacherOption[]>([]);
    const [loadingDropdowns, setLoadingDropdowns] = useState(false);

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const filteredSemesters = useMemo(() => {
        if (!formData.grade_id) return [];
        return semesters.filter(s => s.grade_id === formData.grade_id);
    }, [semesters, formData.grade_id]);

    const filteredSubjects = useMemo(() => {
        if (!formData.semester_id) return [];
        // Use loose equality to handle potential string/number mismatches
        return subjects.filter(s => s.study_term_id == formData.semester_id);
    }, [subjects, formData.semester_id]);

    const selectedGrade = useMemo(() => grades.find(g => g.id === formData.grade_id), [grades, formData.grade_id]);
    const selectedSemester = useMemo(() => semesters.find(s => s.id === formData.semester_id), [semesters, formData.semester_id]);
    const selectedSubject = useMemo(() => subjects.find(s => s.id === formData.subject_id), [subjects, formData.subject_id]);
    const selectedTeacher = useMemo(() => teachers.find(t => t.id === formData.teacher_id), [teachers, formData.teacher_id]);

    // Calculate discount percentage (for live % display)
    const discountPercentage = useMemo(() => {
        if (formData.is_free) return 0;
        if (formData.old_price > 0 && formData.price > 0 && formData.price < formData.old_price) {
            return Math.round(((formData.old_price - formData.price) / formData.old_price) * 100);
        }
        return 0;
    }, [formData.old_price, formData.price, formData.is_free]);

    const fetchDropdownOptions = useCallback(async () => {
        setLoadingDropdowns(true);
        try {
            const [gradesRes, semestersRes, subjectsRes, teachersRes] = await Promise.allSettled([
                adminService.getGrades({ per_page: 100 }),
                adminService.getSemesters({ per_page: 100 }),
                // Increase limit to ensure we get all subjects (temporary fix until server-side filtering)
                adminService.getSubjects({ per_page: 500 }),
                adminService.getTeachers({ per_page: 100 }),
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
                    end_date: s.end_date,
                })));
            }
            if (subjectsRes.status === 'fulfilled') {
                setSubjects(subjectsRes.value.data.map(s => ({
                    id: s.id,
                    name: extractName((s as any).name) || s.code,
                    study_term_id: s.study_term_id,
                })));
            }
            if (teachersRes.status === 'fulfilled') {
                setTeachers(teachersRes.value.data.map(t => ({
                    id: t.id,
                    name: t.name || t.email || `معلم ${t.id}`,
                })));
            }
        } catch (err) {
            console.error('Error fetching dropdown options:', err);
        } finally {
            setLoadingDropdowns(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            setFormData(initialFormData);
            setCurrentStep(1);
            setError(null);
            setImageFile(null);
            setImagePreview(null);
            fetchDropdownOptions();
        }
    }, [isOpen, fetchDropdownOptions]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen && !loading) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, loading, onClose]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (name: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGradeSelect = (gradeId: number) => {
        setFormData(prev => ({
            ...prev,
            grade_id: gradeId,
            semester_id: null,
            subject_id: null,
        }));
    };

    const handleSemesterSelect = (semesterId: number) => {
        setFormData(prev => ({ ...prev, semester_id: semesterId }));
    };

    const handleSubjectSelect = (subjectId: number) => {
        setFormData(prev => ({ ...prev, subject_id: subjectId }));
    };

    // Auto-generate code based on selections
    const generateCode = () => {
        const subjectCode = selectedSubject?.name?.substring(0, 4).toUpperCase() || 'CRSE';
        const gradeNum = selectedGrade?.name?.match(/\d+/)?.[0] || '';
        const semNum = selectedSemester?.name?.match(/\d+/)?.[0] || '1';
        const randomNum = Math.floor(Math.random() * 900) + 100;
        const code = `${subjectCode}${gradeNum ? '-G' + gradeNum : ''}-T${semNum}-${randomNum}`;
        handleChange('code', code.replace(/\s/g, ''));
    };

    // Handle free course toggle
    const handleFreeToggle = (isFree: boolean) => {
        setFormData(prev => ({
            ...prev,
            is_free: isFree,
            price: isFree ? 0 : prev.price,
            old_price: isFree ? 0 : prev.old_price,
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/svg+xml'].includes(file.type)) {
                setError('يجب أن تكون الصورة بصيغة JPEG, PNG, JPG, GIF, أو SVG');
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                setError('حجم الصورة يجب أن لا يتجاوز 2 ميغابايت');
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setError(null);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1: return true; // Course Type is always valid (boolean)
            case 2: return formData.grade_id !== null;
            case 3: return formData.semester_id !== null;
            case 4: return formData.subject_id !== null;
            case 5: return formData.name_ar.trim() && formData.code.trim() && (formData.is_free || formData.old_price > 0) && formData.teacher_id !== null;
            case 6: return true;
            default: return false;
        }
    };

    const handleNext = () => {
        if (currentStep < 6 && canProceed()) {
            if (currentStep === 1 && !formData.is_academic) {
                // Skip Grade(2), Semester(3), Subject(4) for Non-Academic
                setCurrentStep(5);
            } else {
                setCurrentStep(prev => prev + 1);
            }
        }
    };

    const handlePrev = () => {
        if (currentStep > 1) {
            if (currentStep === 5 && !formData.is_academic) {
                // Return to Type(1) from Details(5) for Non-Academic
                setCurrentStep(1);
            } else {
                setCurrentStep(prev => prev - 1);
            }
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            const submitData = new window.FormData();
            submitData.append('name[ar]', formData.name_ar);
            submitData.append('name[en]', formData.name_en || formData.name_ar);
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
            if (formData.grade_id) submitData.append('grade_id', String(formData.grade_id));
            if (formData.semester_id) submitData.append('semester_id', String(formData.semester_id));
            if (formData.subject_id) submitData.append('subject_id', String(formData.subject_id));
            submitData.append('teacher_id', String(formData.teacher_id));
            if (selectedSemester?.end_date) {
                submitData.append('end_date', selectedSemester.end_date);
            }
            if (imageFile) submitData.append('image', imageFile);

            await adminService.createCourseWithImage(submitData);
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Error creating course:', err);
            setError(err.response?.data?.message || 'فشل في إضافة الكورس');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm" onClick={loading ? undefined : onClose} />

            <div
                className="relative bg-white rounded-2xl w-full max-w-4xl animate-in zoom-in-95 fade-in duration-200 overflow-hidden"
                style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
            >
                <div className="flex items-center justify-between px-8 pt-6 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                            <BookOpen size={22} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-charcoal">إضافة كورس جديد</h2>
                            <p className="text-sm text-slate-400">الخطوة {currentStep} من {STEPS.length}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="px-8 py-4 bg-slate-50/50 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                        {STEPS.map((step, index) => {
                            const isActive = currentStep === step.id;
                            const isCompleted = currentStep > step.id;
                            const StepIcon = step.icon;
                            return (
                                <div key={step.id} className="flex items-center">
                                    <div className="flex flex-col items-center">
                                        <div className={`
                                            w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                                            ${isCompleted ? 'bg-green-500 text-white' : isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-200 text-slate-400'}
                                        `}>
                                            {isCompleted ? <CheckCircle2 size={20} /> : <StepIcon size={18} />}
                                        </div>
                                        <span className={`mt-2 text-xs font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-slate-400'}`}>
                                            {step.title}
                                        </span>
                                    </div>
                                    {index < STEPS.length - 1 && (
                                        <div className={`w-16 h-0.5 mx-2 mt-[-20px] transition-colors ${currentStep > step.id ? 'bg-green-500' : 'bg-slate-200'}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-8 min-h-[400px] max-h-[50vh] overflow-y-auto">
                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-2">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="text-lg font-bold text-charcoal mb-2">نوع الكورس</h3>
                            <p className="text-sm text-slate-400 mb-6">حدد نوع الكورس للمتابعة في الخطوات المناسبة</p>

                            <div className="flex gap-4">
                                <label className={`
                                    flex-1 cursor-pointer rounded-xl border-2 p-5 transition-all
                                    ${formData.is_academic
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-slate-200 hover:border-blue-200 text-slate-600'}
                                `}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.is_academic ? 'border-blue-500' : 'border-slate-300'}`}>
                                            {formData.is_academic && <div className="w-3 h-3 rounded-full bg-blue-500" />}
                                        </div>
                                        <input
                                            type="radio"
                                            name="course_type_step1"
                                            className="hidden"
                                            checked={formData.is_academic}
                                            onChange={() => handleChange('is_academic', true)}
                                        />
                                        <div>
                                            <div className="font-bold text-lg mb-1">كورس أكاديمي</div>
                                            <div className="text-sm opacity-70">مرتبط بصفوف دراسية، فصول، ومواد منهجية</div>
                                        </div>
                                    </div>
                                </label>

                                <label className={`
                                    flex-1 cursor-pointer rounded-xl border-2 p-5 transition-all
                                    ${!formData.is_academic
                                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                                        : 'border-slate-200 hover:border-purple-200 text-slate-600'}
                                `}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${!formData.is_academic ? 'border-purple-500' : 'border-slate-300'}`}>
                                            {!formData.is_academic && <div className="w-3 h-3 rounded-full bg-purple-500" />}
                                        </div>
                                        <input
                                            type="radio"
                                            name="course_type_step1"
                                            className="hidden"
                                            checked={!formData.is_academic}
                                            onChange={() => handleChange('is_academic', false)}
                                        />
                                        <div>
                                            <div className="font-bold text-lg mb-1">كورس مهارات / غير أكاديمي</div>
                                            <div className="text-sm opacity-70">غير مرتبط بمنهج دراسي محدد (لغات، برمجة، فنون...)</div>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="text-lg font-bold text-charcoal mb-2">اختر الصف الدراسي</h3>
                            <p className="text-sm text-slate-400 mb-6">حدد الصف الذي سينتمي إليه الكورس</p>
                            {loadingDropdowns ? (
                                <div className="flex items-center justify-center py-16">
                                    <Loader2 size={32} className="animate-spin text-blue-500" />
                                </div>
                            ) : grades.length === 0 ? (
                                <div className="text-center py-16 text-slate-400">
                                    <Layers size={48} className="mx-auto mb-3 opacity-50" />
                                    <p>لا توجد صفوف متاحة</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-4">
                                    {grades.map(grade => {
                                        const isSelected = formData.grade_id === grade.id;
                                        return (
                                            <button
                                                key={grade.id}
                                                onClick={() => handleGradeSelect(grade.id)}
                                                className={`
                                                    p-5 rounded-xl border-2 text-right transition-all duration-200 hover:scale-[1.02]
                                                    ${isSelected
                                                        ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/20'
                                                        : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'}
                                                `}
                                            >
                                                <div className={`w-10 h-10 rounded-lg mb-3 flex items-center justify-center ${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                    <Layers size={20} />
                                                </div>
                                                <h4 className={`font-bold ${isSelected ? 'text-blue-700' : 'text-charcoal'}`}>{grade.name}</h4>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="text-lg font-bold text-charcoal mb-2">اختر الفصل الدراسي</h3>
                            <p className="text-sm text-slate-400 mb-6">
                                الفصول المرتبطة بـ <span className="text-blue-600 font-semibold">{selectedGrade?.name}</span>
                                {' • '}
                                <span className="text-amber-600">تاريخ انتهاء الكورس سيكون بناءً على تاريخ انتهاء الفصل</span>
                            </p>
                            {filteredSemesters.length === 0 ? (
                                <div className="text-center py-16 text-slate-400">
                                    <Calendar size={48} className="mx-auto mb-3 opacity-50" />
                                    <p>لا توجد فصول مرتبطة بهذا الصف</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    {filteredSemesters.map(semester => {
                                        const isSelected = formData.semester_id === semester.id;
                                        return (
                                            <button
                                                key={semester.id}
                                                onClick={() => handleSemesterSelect(semester.id)}
                                                className={`
                                                    p-5 rounded-xl border-2 text-right transition-all duration-200 hover:scale-[1.02]
                                                    ${isSelected
                                                        ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/20'
                                                        : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'}
                                                `}
                                            >
                                                <div className={`w-10 h-10 rounded-lg mb-3 flex items-center justify-center ${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                    <Calendar size={20} />
                                                </div>
                                                <h4 className={`font-bold ${isSelected ? 'text-blue-700' : 'text-charcoal'}`}>{semester.name}</h4>
                                                {semester.end_date && (
                                                    <span className="text-xs text-slate-400">
                                                        ينتهي: {new Date(semester.end_date).toLocaleDateString('ar-EG')}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="text-lg font-bold text-charcoal mb-2">اختر المادة الدراسية</h3>
                            <p className="text-sm text-slate-400 mb-6">
                                المواد الدراسية في <span className="text-blue-600 font-semibold">{selectedGrade?.name}</span>
                            </p>
                            {filteredSubjects.length === 0 ? (
                                <div className="text-center py-16 text-slate-400">
                                    <BookMarked size={48} className="mx-auto mb-3 opacity-50" />
                                    <p>لا توجد مواد مرتبطة بهذا الصف</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-4">
                                    {filteredSubjects.map(subject => {
                                        const isSelected = formData.subject_id === subject.id;
                                        return (
                                            <button
                                                key={subject.id}
                                                onClick={() => handleSubjectSelect(subject.id)}
                                                className={`
                                                    p-5 rounded-xl border-2 text-right transition-all duration-200 hover:scale-[1.02]
                                                    ${isSelected
                                                        ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/20'
                                                        : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'}
                                                `}
                                            >
                                                <div className={`w-10 h-10 rounded-lg mb-3 flex items-center justify-center ${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                    <BookMarked size={20} />
                                                </div>
                                                <h4 className={`font-bold ${isSelected ? 'text-blue-700' : 'text-charcoal'}`}>{subject.name}</h4>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {currentStep === 5 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-5">
                            {/* Context Summary Bar - Only show if Academic */}
                            {formData.is_academic && (
                                <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-3 border border-blue-100/50">
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-1.5">
                                            <GraduationCap size={14} className="text-blue-600" />
                                            <span className="text-slate-500">الصف:</span>
                                            <span className="font-semibold text-charcoal">{selectedGrade?.name || '-'}</span>
                                        </div>
                                        <div className="w-px h-4 bg-slate-300" />
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={14} className="text-indigo-600" />
                                            <span className="text-slate-500">الفصل:</span>
                                            <span className="font-semibold text-charcoal">{selectedSemester?.name || '-'}</span>
                                        </div>
                                        <div className="w-px h-4 bg-slate-300" />
                                        <div className="flex items-center gap-1.5">
                                            <BookMarked size={14} className="text-purple-600" />
                                            <span className="text-slate-500">المادة:</span>
                                            <span className="font-semibold text-charcoal">{selectedSubject?.name || '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Section 1: Basic Information */}
                            <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
                                <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 px-4 py-2.5 border-b border-slate-200/50">
                                    <h4 className="text-sm font-bold text-charcoal flex items-center gap-2">
                                        <BookOpen size={14} className="text-blue-600" />
                                        المدرس <span className="text-red-500">*</span>
                                    </h4>
                                </div>
                                <div className="p-4 space-y-4">
                                    {/* Course Type Selection REMOVED */}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1.5">
                                                اسم الكورس بالعربية <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.name_ar}
                                                onChange={(e) => handleChange('name_ar', e.target.value)}
                                                placeholder="مثال: دورة الرياضيات المتقدمة"
                                                className="w-full h-11 px-4 rounded-lg bg-slate-50/80 border border-slate-200/80 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none text-sm transition-all"
                                                dir="rtl"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1.5">اسم الكورس بالإنجليزية</label>
                                            <input
                                                type="text"
                                                value={formData.name_en}
                                                onChange={(e) => handleChange('name_en', e.target.value)}
                                                placeholder="e.g. Advanced Mathematics"
                                                className="w-full h-11 px-4 rounded-lg bg-slate-50/80 border border-slate-200/80 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none text-sm transition-all"
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="col-span-2 md:col-span-1">
                                            <label className="block text-xs font-medium text-slate-600 mb-1.5">
                                                <Code size={11} className="inline ml-1" />
                                                كود الكورس <span className="text-red-500">*</span>
                                            </label>
                                            <div className="flex gap-1.5">
                                                <input
                                                    type="text"
                                                    value={formData.code}
                                                    onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                                                    placeholder="MATH-G9-T1"
                                                    className="flex-1 min-w-0 h-11 px-3 rounded-lg bg-slate-50/80 border border-slate-200/80 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-mono transition-all"
                                                    dir="ltr"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={generateCode}
                                                    className="h-11 w-11 shrink-0 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white transition-all hover:shadow-lg flex items-center justify-center"
                                                    title="توليد كود تلقائي"
                                                >
                                                    <Wand2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1.5">الساعات المعتمدة</label>
                                            <input
                                                type="number"
                                                value={formData.credits}
                                                onChange={(e) => handleChange('credits', parseInt(e.target.value) || 1)}
                                                min={1} max={12}
                                                className="w-full h-11 px-4 rounded-lg bg-slate-50/80 border border-slate-200/80 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none text-sm transition-all"
                                            />
                                        </div>
                                        <div className="col-span-2 md:col-span-2">
                                            <label className="block text-xs font-medium text-slate-600 mb-1.5">
                                                <User size={11} className="inline ml-1" />
                                                المدرس <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={formData.teacher_id || ''}
                                                onChange={(e) => handleChange('teacher_id', parseInt(e.target.value) || null)}
                                                className="w-full h-11 px-4 rounded-lg bg-slate-50/80 border border-slate-200/80 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none text-sm transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="">اختر المدرس</option>
                                                {teachers.map(t => <option key={t.id} value={t.id}>👨‍🏫 {t.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Duration */}
                            <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
                                <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 px-4 py-2.5 border-b border-slate-200/50">
                                    <h4 className="text-sm font-bold text-charcoal flex items-center gap-2">
                                        <Clock size={14} className="text-amber-600" />
                                        مدة الكورس
                                    </h4>
                                </div>
                                <div className="p-4">
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {DURATION_PRESETS.map(hours => (
                                            <button
                                                key={hours}
                                                type="button"
                                                onClick={() => handleChange('duration_hours', hours)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${formData.duration_hours === hours
                                                    ? 'bg-amber-500 text-white shadow-md'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-700'
                                                    }`}
                                            >
                                                {hours} ساعة
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-slate-500">أو أدخل يدوياً:</span>
                                        <input
                                            type="number"
                                            value={formData.duration_hours || ''}
                                            onChange={(e) => handleChange('duration_hours', parseInt(e.target.value) || 0)}
                                            placeholder="عدد الساعات"
                                            className="w-32 h-10 px-3 rounded-lg bg-slate-50/80 border border-slate-200/80 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10 outline-none text-sm transition-all"
                                        />
                                        <span className="text-xs text-slate-500">ساعة</span>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Pricing */}
                            <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
                                <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 px-4 py-2.5 border-b border-slate-200/50">
                                    <h4 className="text-sm font-bold text-charcoal flex items-center gap-2">
                                        <DollarSign size={14} className="text-green-600" />
                                        التسعير
                                    </h4>
                                </div>
                                <div className="p-4 space-y-4">
                                    {/* Free Course Toggle */}
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                                <Gift size={20} className="text-green-600" />
                                            </div>
                                            <div>
                                                <span className="font-semibold text-charcoal text-sm">كورس مجاني</span>
                                                <p className="text-xs text-slate-500">لن يتم تحصيل أي رسوم</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleFreeToggle(!formData.is_free)}
                                            className={`relative w-14 h-7 rounded-full transition-all duration-300 ${formData.is_free ? 'bg-green-500' : 'bg-slate-300'
                                                }`}
                                        >
                                            <span
                                                className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${formData.is_free ? 'right-0.5' : 'right-7'
                                                    }`}
                                            />
                                        </button>
                                    </div>

                                    {formData.is_free && (
                                        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-100 border border-green-300 text-green-700 text-sm font-medium">
                                            <CheckCircle2 size={16} />
                                            هذا الكورس مجاني بالكامل 🎉
                                        </div>
                                    )}

                                    {/* Price Inputs - Only show if not free */}
                                    {!formData.is_free && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                                                    السعر الأصلي (ر.ع) <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.old_price || ''}
                                                    onChange={(e) => handleChange('old_price', parseFloat(e.target.value) || 0)}
                                                    step="0.01" min={0}
                                                    placeholder="50.00"
                                                    className="w-full h-11 px-4 rounded-lg bg-slate-50/80 border border-slate-200/80 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none text-sm transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-green-600 mb-1.5">
                                                    السعر بعد الخصم (ر.ع)
                                                    <span className="text-xs text-slate-400 font-normal mr-2">(اتركه فارغاً إذا لا يوجد خصم)</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.price || ''}
                                                    onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                                                    step="0.01" min={0}
                                                    placeholder="40.00"
                                                    className="w-full h-11 px-4 rounded-lg bg-slate-50/80 border border-green-200 focus:border-green-400 focus:bg-white focus:ring-4 focus:ring-green-500/10 outline-none text-sm transition-all"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Live Discount Display */}
                                    {!formData.is_free && discountPercentage > 0 && (
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
                                            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                                <Percent size={18} className="text-amber-600" />
                                            </div>
                                            <div>
                                                <span className="text-sm font-bold text-amber-700">خصم {discountPercentage}%</span>
                                                <p className="text-xs text-amber-600">
                                                    توفير {(formData.old_price - formData.price).toFixed(2)} ر.ع للطالب
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Price Validation Warning */}
                                    {!formData.is_free && formData.price > 0 && formData.price > formData.old_price && (
                                        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                                            <AlertCircle size={16} />
                                            السعر بعد الخصم يجب أن يكون أقل من السعر الأصلي
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 5 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-charcoal mb-2">مراجعة وإنهاء</h3>
                                <p className="text-sm text-slate-400 mb-6">راجع المعلومات وأضف الوصف والصورة</p>
                            </div>

                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                                <h4 className="font-bold text-charcoal mb-3 flex items-center gap-2">
                                    <Sparkles size={16} className="text-blue-600" />
                                    ملخص الكورس
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><span className="text-slate-500">الصف:</span> <span className="font-medium text-charcoal">{selectedGrade?.name}</span></div>
                                    <div><span className="text-slate-500">الفصل:</span> <span className="font-medium text-charcoal">{selectedSemester?.name}</span></div>
                                    <div><span className="text-slate-500">المادة:</span> <span className="font-medium text-charcoal">{selectedSubject?.name}</span></div>
                                    <div><span className="text-slate-500">المدرس:</span> <span className="font-medium text-charcoal">{selectedTeacher?.name}</span></div>
                                    <div><span className="text-slate-500">اسم الكورس:</span> <span className="font-medium text-charcoal">{formData.name_ar}</span></div>
                                    <div><span className="text-slate-500">الكود:</span> <span className="font-mono font-medium text-charcoal">{formData.code}</span></div>
                                    <div><span className="text-slate-500">السعر:</span> <span className="font-bold text-green-600">{formData.price || formData.old_price} ر.ع</span></div>
                                    {selectedSemester?.end_date && (
                                        <div><span className="text-slate-500">تاريخ الانتهاء:</span> <span className="font-medium text-amber-600">{new Date(selectedSemester.end_date).toLocaleDateString('ar-EG')}</span></div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1.5">وصف الكورس بالعربية</label>
                                    <textarea
                                        value={formData.description_ar}
                                        onChange={(e) => handleChange('description_ar', e.target.value)}
                                        placeholder="وصف الكورس بالعربية (اختياري)"
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50/50 border border-slate-200/80 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm transition-all resize-none"
                                        dir="rtl"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1.5">وصف الكورس بالإنجليزية</label>
                                    <textarea
                                        value={formData.description_en}
                                        onChange={(e) => handleChange('description_en', e.target.value)}
                                        placeholder="Course description in English (optional)"
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50/50 border border-slate-200/80 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm transition-all resize-none"
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            {/* Enhanced Image Upload Section */}
                            <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
                                <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 px-4 py-2.5 border-b border-slate-200/50">
                                    <h4 className="text-sm font-bold text-charcoal flex items-center gap-2">
                                        <ImagePlus size={14} className="text-purple-600" />
                                        صورة الكورس
                                    </h4>
                                </div>
                                <div className="p-4">
                                    <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />

                                    {imagePreview ? (
                                        // Image Preview - Show when image is selected
                                        <div className="space-y-3">
                                            <div className="relative group rounded-xl overflow-hidden border-2 border-purple-200 bg-purple-50">
                                                <img
                                                    src={imagePreview}
                                                    alt="معاينة الصورة"
                                                    className="w-full h-40 object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-charcoal hover:bg-slate-100 transition-colors flex items-center gap-2"
                                                    >
                                                        <ImagePlus size={16} />
                                                        تغيير
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveImage}
                                                        className="px-4 py-2 bg-red-500 rounded-lg text-sm font-medium text-white hover:bg-red-600 transition-colors flex items-center gap-2"
                                                    >
                                                        <Trash2 size={16} />
                                                        حذف
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                                                <CheckCircle2 size={16} />
                                                <span className="font-medium">تم اختيار الصورة:</span>
                                                <span className="text-green-600 truncate">{imageFile?.name}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        // Upload Prompt - Show when no image
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full h-32 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 hover:border-purple-400 hover:bg-purple-50/50 transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-purple-100 flex items-center justify-center transition-colors">
                                                <ImagePlus size={24} className="text-slate-400 group-hover:text-purple-500 transition-colors" />
                                            </div>
                                            <span className="text-sm font-medium text-slate-500 group-hover:text-purple-600 transition-colors">انقر لاختيار صورة</span>
                                            <span className="text-xs text-slate-400">JPEG, PNG, SVG (الحد الأقصى 2MB)</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={formData.is_active} onChange={(e) => handleChange('is_active', e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
                                    <span className="text-sm text-charcoal">نشط</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={formData.is_promoted} onChange={(e) => handleChange('is_promoted', e.target.checked)} className="w-4 h-4 rounded text-amber-500" />
                                    <span className="text-sm text-charcoal">مميز (Promoted)</span>
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <button
                        onClick={handlePrev}
                        disabled={currentStep === 1 || loading}
                        className="flex items-center gap-2 px-5 py-2.5 text-slate-500 hover:text-slate-700 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight size={18} />
                        السابق
                    </button>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="px-6 py-2.5 text-slate-400 hover:text-slate-600 font-medium text-sm transition-colors disabled:opacity-50"
                        >
                            إلغاء
                        </button>

                        {currentStep < 5 ? (
                            <button
                                onClick={handleNext}
                                disabled={!canProceed() || loading}
                                className="flex items-center gap-2 h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                style={{ boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.4)' }}
                            >
                                التالي
                                <ChevronLeft size={18} />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex items-center gap-2 h-11 px-8 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                                style={{ boxShadow: '0 4px 14px 0 rgba(22, 163, 74, 0.4)' }}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        جاري الإضافة...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={18} />
                                        إضافة الكورس
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
