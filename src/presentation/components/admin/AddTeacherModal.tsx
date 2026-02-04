import { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, User, Mail, Phone, Lock, BookOpen, GraduationCap, Eye, EyeOff, ImagePlus, Trash2, Briefcase, Check } from 'lucide-react';
import { adminService } from '../../../data/api/adminService';

interface AddTeacherModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface FormData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    specialization: string;
    phone: string;
    qualification: string;
    status: 'active' | 'inactive' | 'on-leave';
    is_academic: boolean; // true = مدرس (teacher), false = مدرب (instructor)
    grades: number[];
}

const initialFormData: FormData = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    specialization: '',
    phone: '',
    qualification: '',
    status: 'active',
    is_academic: true, // Default to academic teacher
    grades: [],
};

export function AddTeacherModal({ isOpen, onClose, onSuccess }: AddTeacherModalProps) {
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Image upload state
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Grades State
    const [availableGrades, setAvailableGrades] = useState<{ id: number, name: string }[]>([]);
    const [loadingGrades, setLoadingGrades] = useState(false);

    // Fetch grades on mount
    useEffect(() => {
        const fetchGrades = async () => {
            setLoadingGrades(true);
            try {
                const response = await adminService.getGrades({ per_page: 50 });
                // Handle different response structures if needed, assuming data is array
                const gradesData = Array.isArray(response.data) ? response.data : [];
                setAvailableGrades(gradesData.map((g: any) => ({ id: g.id, name: g.name?.ar || g.name })));
            } catch (err) {
                console.error('Failed to fetch grades', err);
            } finally {
                setLoadingGrades(false);
            }
        };
        if (isOpen) {
            fetchGrades();
        }
    }, [isOpen]);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData(initialFormData);
            setError(null);
            setFieldErrors({});
            setImageFile(null);
            setImagePreview(null);
        }
    }, [isOpen]);

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

    if (!isOpen) return null;

    const handleChange = (name: keyof FormData, value: string | number[]) => {
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
            // Validate file type
            if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(file.type)) {
                setFieldErrors(prev => ({ ...prev, image: 'يجب أن تكون الصورة بصيغة JPEG, PNG, JPG, أو GIF' }));
                return;
            }
            // Validate file size (max 2MB)
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

    // Remove selected image
    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.name.trim()) errors.name = 'الاسم مطلوب';
        if (!formData.email.trim()) errors.email = 'البريد الإلكتروني مطلوب';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'البريد الإلكتروني غير صالح';
        }
        if (!formData.password) errors.password = 'كلمة المرور مطلوبة';
        else if (formData.password.length < 8) {
            errors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
        }
        if (formData.password !== formData.password_confirmation) {
            errors.password_confirmation = 'كلمة المرور غير متطابقة';
        }
        if (!formData.specialization.trim()) {
            errors.specialization = 'التخصص مطلوب';
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
            // Use FormData for file upload support
            const submitData = new window.FormData();
            submitData.append('name', formData.name);
            submitData.append('email', formData.email);
            submitData.append('password', formData.password);
            submitData.append('password_confirmation', formData.password_confirmation);
            submitData.append('specialization', formData.specialization);
            if (formData.phone) submitData.append('phone', formData.phone);
            if (formData.qualification) submitData.append('qualification', formData.qualification);
            submitData.append('status', formData.status);
            submitData.append('is_academic', formData.is_academic ? '1' : '0');

            // Append Grades
            formData.grades.forEach(gradeId => {
                submitData.append('grade_ids[]', String(gradeId));
            });

            if (imageFile) submitData.append('image_path', imageFile);

            await adminService.createTeacherWithImage(submitData);
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Error creating teacher:', err);
            if (err.response?.data?.errors) {
                const backendErrors: Record<string, string> = {};
                Object.entries(err.response.data.errors).forEach(([key, messages]) => {
                    backendErrors[key] = Array.isArray(messages) ? messages[0] : String(messages);
                });
                setFieldErrors(backendErrors);
            } else {
                setError(err.response?.data?.message || 'فشل في إضافة المدرس');
            }
        } finally {
            setLoading(false);
        }
    };

    const inputClass = (fieldName: string) =>
        `w-full h-12 rounded-[12px] bg-soft-cloud border transition-all outline-none text-sm ${fieldErrors[fieldName]
            ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
            : 'border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10'
        }`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm"
                onClick={loading ? undefined : onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-[20px] shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-br from-shibl-crimson to-red-700 px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                            <GraduationCap size={24} className="text-white" />
                        </div>
                        <div className="text-white">
                            <h2 className="text-lg font-extrabold">إضافة مدرس جديد</h2>
                            <p className="text-xs text-white/80">أدخل بيانات المدرس</p>
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
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-[12px] text-sm">
                            {error}
                        </div>
                    )}

                    {/* Form Fields */}
                    <div className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-semibold text-charcoal mb-2">
                                الاسم <span className="text-shibl-crimson">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    placeholder="أدخل اسم المدرس"
                                    className={`${inputClass('name')} pr-12 pl-4`}
                                    disabled={loading}
                                    dir="auto"
                                />
                            </div>
                            {fieldErrors.name && <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-charcoal mb-2">
                                البريد الإلكتروني <span className="text-shibl-crimson">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    placeholder="example@email.com"
                                    className={`${inputClass('email')} pr-12 pl-4`}
                                    disabled={loading}
                                    dir="ltr"
                                />
                            </div>
                            {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
                        </div>

                        {/* Specialization */}
                        <div>
                            <label className="block text-sm font-semibold text-charcoal mb-2">
                                التخصص <span className="text-shibl-crimson">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <BookOpen size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={formData.specialization}
                                    onChange={(e) => handleChange('specialization', e.target.value)}
                                    placeholder="مثال: الرياضيات، اللغة العربية"
                                    className={`${inputClass('specialization')} pr-12 pl-4`}
                                    disabled={loading}
                                    dir="auto"
                                />
                            </div>
                            {fieldErrors.specialization && <p className="mt-1 text-xs text-red-500">{fieldErrors.specialization}</p>}
                        </div>

                        {/* Password Row */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Password */}
                            <div>
                                <label className="block text-sm font-semibold text-charcoal mb-2">
                                    كلمة المرور <span className="text-shibl-crimson">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => handleChange('password', e.target.value)}
                                        placeholder="••••••••"
                                        className={`${inputClass('password')} pr-12 pl-10`}
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {fieldErrors.password && <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-semibold text-charcoal mb-2">
                                    تأكيد كلمة المرور <span className="text-shibl-crimson">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={formData.password_confirmation}
                                        onChange={(e) => handleChange('password_confirmation', e.target.value)}
                                        placeholder="••••••••"
                                        className={`${inputClass('password_confirmation')} px-10`}
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {fieldErrors.password_confirmation && <p className="mt-1 text-xs text-red-500">{fieldErrors.password_confirmation}</p>}
                            </div>
                        </div>

                        {/* Phone & Qualification Row */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-semibold text-charcoal mb-2">رقم الهاتف</label>
                                <div className="relative">
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Phone size={18} />
                                    </div>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                        placeholder="+968 xxxx xxxx"
                                        className={`${inputClass('phone')} pr-12 pl-4`}
                                        disabled={loading}
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            {/* Qualification */}
                            <div>
                                <label className="block text-sm font-semibold text-charcoal mb-2">المؤهل العلمي</label>
                                <input
                                    type="text"
                                    value={formData.qualification}
                                    onChange={(e) => handleChange('qualification', e.target.value)}
                                    placeholder="مثال: ماجستير"
                                    className={`${inputClass('qualification')} px-4`}
                                    disabled={loading}
                                    dir="auto"
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-semibold text-charcoal mb-2">الحالة</label>
                            <select
                                value={formData.status}
                                onChange={(e) => handleChange('status', e.target.value as FormData['status'])}
                                className={`${inputClass('status')} px-4 appearance-none cursor-pointer`}
                                disabled={loading}
                            >
                                <option value="active">نشط</option>
                                <option value="inactive">غير نشط</option>
                                <option value="on-leave">في إجازة</option>
                            </select>
                        </div>

                        {/* Teacher Type - Academic vs Instructor */}
                        <div>
                            <label className="block text-sm font-semibold text-charcoal mb-2">
                                نوع المدرس <span className="text-shibl-crimson">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Briefcase size={18} />
                                </div>
                                <select
                                    value={formData.is_academic ? 'teacher' : 'instructor'}
                                    onChange={(e) => setFormData(prev => ({ ...prev, is_academic: e.target.value === 'teacher' }))}
                                    className={`${inputClass('is_academic')} pr-12 pl-4 appearance-none cursor-pointer`}
                                    disabled={loading}
                                >
                                    <option value="teacher">مدرس (أكاديمي)</option>
                                    <option value="instructor">مدرب (مهارات)</option>
                                </select>
                            </div>
                            <p className="mt-1 text-xs text-slate-400">
                                المدرس: يدرّس المواد الأكاديمية | المدرب: يقدم دورات المهارات
                            </p>
                        </div>

                        {/* Grade Selection (Only for Academic Teachers) */}
                        {formData.is_academic && (
                            <div className="bg-slate-50 p-4 rounded-[12px] border border-slate-100">
                                <label className="block text-sm font-semibold text-charcoal mb-3">
                                    الصفوف الدراسية <span className="text-shibl-crimson">*</span>
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
                                                        handleChange('grades', newGrades as any); // Type assertion for array
                                                    }}
                                                    className={`px-3 py-2.5 rounded-[10px] text-xs font-bold transition-all flex items-center justify-between group ${isSelected
                                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 ring-2 ring-indigo-600 ring-offset-1'
                                                            : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
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

                        {/* Profile Image */}
                        <div>
                            <label className="block text-sm font-semibold text-charcoal mb-2">صورة الملف الشخصي</label>
                            <div className="flex items-start gap-4">
                                {/* Image Preview */}
                                <div className="w-20 h-20 rounded-[12px] bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <GraduationCap size={32} className="text-slate-400" />
                                    )}
                                </div>

                                {/* Upload Controls */}
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageChange}
                                        accept="image/jpeg,image/png,image/jpg,image/gif"
                                        className="hidden"
                                        disabled={loading}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={loading}
                                            className="flex-1 h-10 rounded-[10px] bg-slate-100 hover:bg-slate-200 text-charcoal font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <ImagePlus size={16} />
                                            <span>{imageFile ? 'تغيير الصورة' : 'اختيار صورة'}</span>
                                        </button>
                                        {imageFile && (
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                disabled={loading}
                                                className="w-10 h-10 rounded-[10px] bg-red-100 hover:bg-red-200 text-red-600 transition-colors flex items-center justify-center disabled:opacity-50"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2">
                                        JPEG, PNG, JPG أو GIF (الحد الأقصى 2 ميغابايت)
                                    </p>
                                    {imageFile && (
                                        <p className="text-xs text-green-600 mt-1">
                                            ✓ {imageFile.name}
                                        </p>
                                    )}
                                    {fieldErrors.image && (
                                        <p className="text-xs text-red-500 mt-1">{fieldErrors.image}</p>
                                    )}
                                </div>
                            </div>
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
                            className="flex-1 h-12 rounded-pill bg-shibl-crimson hover:bg-shibl-crimson-dark text-white font-bold text-sm shadow-crimson transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    <span>جاري الإضافة...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    <span>إضافة المدرس</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
