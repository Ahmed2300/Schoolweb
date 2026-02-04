import { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, User, Mail, Phone, BookOpen, Briefcase, Camera, AlertCircle, Check } from 'lucide-react';
import { adminService, UserData, UpdateTeacherRequest } from '../../../data/api/adminService';
import teacherPlaceholder from '../../../assets/images/teacher-placeholder.png';

interface EditTeacherModalProps {
    isOpen: boolean;
    teacher: UserData | null;
    onClose: () => void;
    onSuccess: () => void;
}

interface FormData {
    name: string;
    email: string;
    specialization: string;
    phone: string;
    qualification: string;
    status: 'active' | 'inactive' | 'on-leave';
    is_academic: boolean;
    grades: number[];
}

export function EditTeacherModal({ isOpen, teacher, onClose, onSuccess }: EditTeacherModalProps) {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        specialization: '',
        phone: '',
        qualification: '',
        status: 'active',
        is_academic: true,
        grades: [],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // Image upload state
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [currentImagePath, setCurrentImagePath] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [availableGrades, setAvailableGrades] = useState<{ id: number, name: string }[]>([]);
    const [loadingGrades, setLoadingGrades] = useState(false);

    // Fetch grades on mount
    useEffect(() => {
        const fetchGrades = async () => {
            setLoadingGrades(true);
            try {
                const response = await adminService.getGrades({ per_page: 50 });
                const gradesData = Array.isArray(response.data) ? response.data : [];
                setAvailableGrades(gradesData.map((g: any) => ({ id: g.id, name: g.name?.ar || g.name })));
            } catch (err) {
                console.error('Failed to fetch grades', err);
            } finally {
                setLoadingGrades(false);
            }
        };
        fetchGrades();
    }, []);

    // Fetch detailed teacher data when modal opens
    useEffect(() => {
        const fetchTeacherDetails = async () => {
            if (isOpen && teacher?.id) {
                try {
                    setLoading(true);
                    const fullTeacherData = await adminService.getTeacher(teacher.id);

                    setFormData({
                        name: fullTeacherData.name || '',
                        email: fullTeacherData.email || '',
                        specialization: fullTeacherData.specialization || '',
                        phone: fullTeacherData.phone || '',
                        qualification: fullTeacherData.qualification || '',
                        status: (fullTeacherData.status as FormData['status']) || 'active',
                        is_academic: fullTeacherData.is_academic !== false,
                        grades: [],
                    });

                    // Map enrolled grades to IDs
                    if (fullTeacherData.grades && fullTeacherData.grades.length > 0 && availableGrades.length > 0) {
                        try {
                            const teacherGradeIds = availableGrades
                                .filter(g => fullTeacherData.grades?.includes(g.name))
                                .map(g => g.id);

                            setFormData(prev => ({ ...prev, grades: teacherGradeIds }));
                        } catch (e) {
                            console.error("Error mapping grades", e);
                        }
                    }

                    setCurrentImagePath(fullTeacherData.image_path || null);
                    setImageFile(null);
                    setImagePreview(null);
                    setError(null);
                    setFieldErrors({});
                } catch (err) {
                    console.error('Error fetching teacher details:', err);
                    setError('فشل في تحميل بيانات المدرس');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchTeacherDetails();
    }, [isOpen, teacher, availableGrades]);

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

    if (!isOpen || !teacher) return null;

    const handleChange = (name: keyof FormData, value: string | boolean | number[]) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // Handle image selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(file.type)) {
                setFieldErrors(prev => ({ ...prev, image: 'يجب أن تكون الصورة بصيغة JPEG, PNG, JPG, أو GIF' }));
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

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.name.trim()) errors.name = 'الاسم مطلوب';
        if (!formData.email.trim()) errors.email = 'البريد الإلكتروني مطلوب';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'صيغة البريد الإلكتروني غير صالحة';
        }
        if (formData.is_academic && formData.grades.length === 0) {
            errors.grades = 'يجب اختيار صف واحد على الأقل للمدرس الأكاديمي';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setError(null);

        try {
            if (imageFile) {
                const submitData = new window.FormData();
                submitData.append('name', formData.name);
                submitData.append('email', formData.email);
                if (formData.phone) submitData.append('phone', formData.phone);
                if (formData.specialization) submitData.append('specialization', formData.specialization);
                if (formData.qualification) submitData.append('qualification', formData.qualification);
                submitData.append('status', formData.status);
                submitData.append('is_academic', formData.is_academic ? '1' : '0');
                formData.grades.forEach(gradeId => {
                    submitData.append('grade_ids[]', String(gradeId));
                });
                submitData.append('image_path', imageFile);

                await adminService.updateTeacherWithImage(teacher.id, submitData);
            } else {
                const updateData: UpdateTeacherRequest = {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone || undefined,
                    specialization: formData.specialization || undefined,
                    qualification: formData.qualification || undefined,
                    status: formData.status,
                    is_academic: formData.is_academic,
                    grade_ids: formData.grades,
                };

                await adminService.updateTeacher(teacher.id, updateData);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Error updating teacher:', err);
            if (err.response?.data?.errors) {
                const backendErrors: Record<string, string> = {};
                Object.entries(err.response.data.errors).forEach(([key, messages]) => {
                    backendErrors[key] = Array.isArray(messages) ? messages[0] : String(messages);
                });
                setFieldErrors(backendErrors);
            } else {
                setError(err.response?.data?.message || 'فشل في تحديث بيانات المدرس');
            }
        } finally {
            setLoading(false);
        }
    };

    // Display image logic
    const displayImage = imagePreview || (currentImagePath && !currentImagePath.includes('default.jpg') ? currentImagePath : null);

    // Input styling with error state
    const getInputClass = (fieldName: string) => {
        const hasError = fieldErrors[fieldName];
        return `w-full h-12 rounded-xl bg-slate-50 border-2 transition-all duration-200 outline-none text-sm
            ${hasError
                ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                : 'border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:bg-white'
            }`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={loading ? undefined : onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                {/* Header - Simplified & Modernized */}
                <div className="relative bg-blue-600 px-6 py-5">
                    {/* Close Button - Larger touch target */}
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all duration-200 disabled:opacity-50"
                        aria-label="إغلاق"
                    >
                        <X size={22} />
                    </button>

                    {/* Profile Section - Centered & Clean */}
                    <div className="flex flex-col items-center pt-2">
                        {/* Avatar with Edit Overlay */}
                        <div className="relative group mb-3">
                            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/30 shadow-lg">
                                {displayImage ? (
                                    <img
                                        src={displayImage}
                                        alt={teacher.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <img
                                        src={teacherPlaceholder}
                                        alt={teacher.name}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>
                            {/* Camera overlay button */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={loading}
                                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 cursor-pointer"
                            >
                                <Camera size={24} className="text-white" />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/jpeg,image/png,image/jpg,image/gif"
                                className="hidden"
                                disabled={loading}
                            />
                        </div>
                        <h2 className="text-xl font-bold text-white">{formData.name || teacher.name}</h2>
                        <p className="text-sm text-blue-100 mt-0.5">{formData.email || teacher.email}</p>
                        {fieldErrors.image && (
                            <p className="text-xs text-red-200 mt-2 bg-red-500/20 px-3 py-1 rounded-full">{fieldErrors.image}</p>
                        )}
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 max-h-[60vh] overflow-y-auto">
                    {/* Error Banner */}
                    {error && (
                        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                            <AlertCircle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Form Fields with improved spacing */}
                    <div className="space-y-5">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                الاسم <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    placeholder="أدخل اسم المدرس"
                                    className={`${getInputClass('name')} pr-11 pl-4`}
                                    disabled={loading}
                                    dir="auto"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <User size={18} />
                                </div>
                            </div>
                            {fieldErrors.name && (
                                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle size={12} />
                                    {fieldErrors.name}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                البريد الإلكتروني <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    placeholder="example@email.com"
                                    className={`${getInputClass('email')} pr-11 pl-4`}
                                    disabled={loading}
                                    dir="ltr"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Mail size={18} />
                                </div>
                            </div>
                            {fieldErrors.email && (
                                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle size={12} />
                                    {fieldErrors.email}
                                </p>
                            )}
                        </div>

                        {/* Specialization */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">التخصص</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={formData.specialization}
                                    onChange={(e) => handleChange('specialization', e.target.value)}
                                    placeholder="مثال: الرياضيات، اللغة العربية"
                                    className={`${getInputClass('specialization')} pr-11 pl-4`}
                                    disabled={loading}
                                    dir="auto"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <BookOpen size={18} />
                                </div>
                            </div>
                        </div>

                        {/* Phone & Qualification - Responsive Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">رقم الهاتف</label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                        placeholder="+968 xxxx xxxx"
                                        className={`${getInputClass('phone')} pr-11 pl-4`}
                                        disabled={loading}
                                        dir="ltr"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Phone size={18} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">المؤهل العلمي</label>
                                <input
                                    type="text"
                                    value={formData.qualification}
                                    onChange={(e) => handleChange('qualification', e.target.value)}
                                    placeholder="مثال: ماجستير"
                                    className={`${getInputClass('qualification')} px-4`}
                                    disabled={loading}
                                    dir="auto"
                                />
                            </div>
                        </div>

                        {/* Status & Teacher Type - Better Visual Separation */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">الحالة</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => handleChange('status', e.target.value)}
                                    className={`${getInputClass('status')} px-4 appearance-none cursor-pointer`}
                                    disabled={loading}
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'left 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                                >
                                    <option value="active">نشط</option>
                                    <option value="inactive">غير نشط</option>
                                    <option value="on-leave">في إجازة</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">نوع المدرس</label>
                                <div className="relative">
                                    <select
                                        value={formData.is_academic ? 'teacher' : 'instructor'}
                                        onChange={(e) => handleChange('is_academic', e.target.value === 'teacher')}
                                        className={`${getInputClass('is_academic')} pr-11 pl-8 appearance-none cursor-pointer`}
                                        disabled={loading}
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'left 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                                    >
                                        <option value="teacher">مدرس (أكاديمي)</option>
                                        <option value="instructor">مدرب (مهارات)</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Briefcase size={18} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Helper text for teacher type */}
                        <p className="text-xs text-slate-500 -mt-2 px-1">
                            المدرس: يدرّس المواد الأكاديمية | المدرب: يقدم دورات المهارات
                        </p>

                        {/* Grade Selection (Only for Academic Teachers) */}
                        {formData.is_academic && (
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <label className="block text-sm font-medium text-slate-700 mb-3">
                                    الصفوف الدراسية <span className="text-red-500">*</span>
                                </label>
                                {loadingGrades ? (
                                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                                        <Loader2 size={16} className="animate-spin" /> جاري تحميل الصفوف...
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {availableGrades.map(grade => {
                                            const isSelected = formData.grades.includes(grade.id);
                                            return (
                                                <button
                                                    key={grade.id}
                                                    type="button"
                                                    onClick={() => {
                                                        const newGrades = isSelected
                                                            ? formData.grades.filter(id => id !== grade.id)
                                                            : [...formData.grades, grade.id];
                                                        handleChange('grades', newGrades);
                                                    }}
                                                    className={`px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between group ${isSelected
                                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 ring-2 ring-blue-600 ring-offset-1'
                                                        : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600'
                                                        }`}
                                                >
                                                    <span>{grade.name}</span>
                                                    {isSelected && <Check size={14} className="ml-1" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                                {fieldErrors.grades && <p className="mt-2 text-xs text-red-500">{fieldErrors.grades}</p>}
                                <p className="mt-2 text-[10px] text-slate-400">
                                    يمكنك اختيار أكثر من صف دراسي واحد
                                </p>
                            </div>
                        )}
                    </div>
                </form>

                {/* Actions - Fixed Footer with more breathing room */}
                <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 h-12 rounded-xl bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all duration-200 disabled:opacity-50"
                    >
                        إلغاء
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
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
            </div>
        </div>
    );
}
