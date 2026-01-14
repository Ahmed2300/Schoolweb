import { useState, useEffect } from 'react';
import { X, Save, Loader2, User, Mail, Phone, BookOpen, GraduationCap, Briefcase } from 'lucide-react';
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
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // Fetch detailed teacher data when modal opens
    useEffect(() => {
        const fetchTeacherDetails = async () => {
            if (isOpen && teacher?.id) {
                try {
                    setLoading(true);
                    // Fetch fresh detailed data
                    const fullTeacherData = await adminService.getTeacher(teacher.id);

                    setFormData({
                        name: fullTeacherData.name || '',
                        email: fullTeacherData.email || '',
                        specialization: fullTeacherData.specialization || '',
                        phone: fullTeacherData.phone || '',
                        qualification: fullTeacherData.qualification || '',
                        status: (fullTeacherData.status as FormData['status']) || 'active',
                        is_academic: fullTeacherData.is_academic !== false,
                    });
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
    }, [isOpen, teacher]);

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

    const handleChange = (name: keyof FormData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.name.trim()) errors.name = 'الاسم مطلوب';
        if (!formData.email.trim()) errors.email = 'البريد الإلكتروني مطلوب';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'البريد الإلكتروني غير صالح';
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
            const updateData: UpdateTeacherRequest = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone || undefined,
                specialization: formData.specialization || undefined,
                qualification: formData.qualification || undefined,
                status: formData.status,
                is_academic: formData.is_academic,
            };

            await adminService.updateTeacher(teacher.id, updateData);
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

    const inputClass = (fieldName: string) =>
        `w-full h-12 rounded-[12px] bg-soft-cloud border transition-all outline-none text-sm ${fieldErrors[fieldName]
            ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
            : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
        }`;

    // Check if teacher has a real profile image
    const hasProfileImage = teacher.image_path && !teacher.image_path.includes('default.jpg');

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
                <div className="sticky top-0 bg-gradient-to-br from-blue-600 to-blue-800 px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Teacher Image */}
                        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-2 border-white/30">
                            {hasProfileImage ? (
                                <img
                                    src={teacher.image_path}
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
                        <div className="text-white">
                            <h2 className="text-lg font-extrabold">تعديل بيانات المدرس</h2>
                            <p className="text-xs text-white/80">{teacher.name}</p>
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
                                الاسم <span className="text-red-500">*</span>
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
                                البريد الإلكتروني <span className="text-red-500">*</span>
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
                            <label className="block text-sm font-semibold text-charcoal mb-2">التخصص</label>
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
                                onChange={(e) => handleChange('status', e.target.value)}
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
                            <label className="block text-sm font-semibold text-charcoal mb-2">نوع المدرس</label>
                            <div className="relative">
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Briefcase size={18} />
                                </div>
                                <select
                                    value={formData.is_academic ? 'teacher' : 'instructor'}
                                    onChange={(e) => handleChange('is_academic', e.target.value === 'teacher')}
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
                            className="flex-1 h-12 rounded-pill bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
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
