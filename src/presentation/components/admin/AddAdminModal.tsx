import { useState, useEffect } from 'react';
import { X, Loader2, User, Mail, Lock, Shield, Eye, EyeOff, ChevronDown, Users, Settings, Calculator, Code, FileEdit } from 'lucide-react';
import { adminService, CreateAdminRequest } from '../../../data/api/adminService';

interface AddAdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

// Admin role types that can be selected
// TODO: Backend will handle role assignment - currently only sends to backend for future integration
type AdminRole = 'super-admin' | 'admin' | 'moderators' | 'accountant' | 'staff' | 'developers';

interface AdminRoleOption {
    value: AdminRole;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
}

const adminRoles: AdminRoleOption[] = [
    {
        value: 'admin',
        label: 'مدير',
        description: 'صلاحيات إدارية كاملة',
        icon: <Shield size={18} />,
        color: 'bg-blue-500',
    },
    {
        value: 'moderators',
        label: 'مشرف',
        description: 'مراجعة المحتوى والتعليقات',
        icon: <FileEdit size={18} />,
        color: 'bg-purple-500',
    },
    {
        value: 'accountant',
        label: 'محاسب',
        description: 'إدارة المالية والاشتراكات',
        icon: <Calculator size={18} />,
        color: 'bg-green-500',
    },
    {
        value: 'staff',
        label: 'موظف',
        description: 'صلاحيات محدودة للموظفين',
        icon: <Users size={18} />,
        color: 'bg-amber-500',
    },
    {
        value: 'developers',
        label: 'مطور',
        description: 'الوصول التقني والتطوير',
        icon: <Code size={18} />,
        color: 'bg-slate-700',
    },
];

interface FormData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: AdminRole;
}

const initialFormData: FormData = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'admin',
};

export function AddAdminModal({ isOpen, onClose, onSuccess }: AddAdminModalProps) {
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData(initialFormData);
            setError(null);
            setFieldErrors({});
            setShowRoleDropdown(false);
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

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.role-dropdown-container')) {
                setShowRoleDropdown(false);
            }
        };
        if (showRoleDropdown) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showRoleDropdown]);

    if (!isOpen) return null;

    const handleChange = (name: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleRoleSelect = (role: AdminRole) => {
        setFormData(prev => ({ ...prev, role }));
        setShowRoleDropdown(false);
    };

    const selectedRole = adminRoles.find(r => r.value === formData.role) || adminRoles[0];

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

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setError(null);

        try {
            const requestData: CreateAdminRequest = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                password_confirmation: formData.password_confirmation,
                // TODO: Backend will add role field support
                // role: formData.role,
            };

            await adminService.createAdmin(requestData);
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Error creating admin:', err);
            if (err.response?.data?.errors) {
                const backendErrors: Record<string, string> = {};
                Object.entries(err.response.data.errors).forEach(([key, messages]) => {
                    backendErrors[key] = Array.isArray(messages) ? messages[0] : String(messages);
                });
                setFieldErrors(backendErrors);
            } else {
                setError(err.response?.data?.message || 'فشل في إضافة المدير');
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
            <div className="relative bg-white rounded-[20px] shadow-xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 fade-in duration-200 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-br from-charcoal to-slate-800 px-6 py-5 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                            <Shield size={24} className="text-white" />
                        </div>
                        <div className="text-white">
                            <h2 className="text-lg font-extrabold">إضافة مدير جديد</h2>
                            <p className="text-xs text-white/80">اختر نوع المدير وصلاحياته</p>
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
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Error Banner */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-[12px] text-sm">
                            {error}
                        </div>
                    )}

                    {/* Form Fields */}
                    <div className="space-y-4">
                        {/* Admin Role Selection */}
                        <div className="role-dropdown-container">
                            <label className="block text-sm font-semibold text-charcoal mb-2">
                                نوع المدير <span className="text-shibl-crimson">*</span>
                            </label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                                    className="w-full h-12 rounded-[12px] bg-soft-cloud border border-slate-200 hover:border-slate-300 transition-all outline-none text-sm px-4 flex items-center justify-between"
                                    disabled={loading}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg ${selectedRole.color} flex items-center justify-center text-white`}>
                                            {selectedRole.icon}
                                        </div>
                                        <div className="text-right">
                                            <span className="font-semibold text-charcoal">{selectedRole.label}</span>
                                            <p className="text-xs text-slate-400">{selectedRole.description}</p>
                                        </div>
                                    </div>
                                    <ChevronDown size={18} className={`text-slate-400 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown */}
                                {showRoleDropdown && (
                                    <div className="absolute top-full mt-2 w-full bg-white rounded-[12px] shadow-xl border border-slate-200 z-20 overflow-hidden">
                                        {adminRoles.map((role) => (
                                            <button
                                                key={role.value}
                                                type="button"
                                                onClick={() => handleRoleSelect(role.value)}
                                                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors ${formData.role === role.value ? 'bg-slate-50' : ''}`}
                                            >
                                                <div className={`w-8 h-8 rounded-lg ${role.color} flex items-center justify-center text-white`}>
                                                    {role.icon}
                                                </div>
                                                <div className="flex-1 text-right">
                                                    <span className="font-semibold text-charcoal block">{role.label}</span>
                                                    <p className="text-xs text-slate-400">{role.description}</p>
                                                </div>
                                                {formData.role === role.value && (
                                                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Role notice */}
                            <div className="mt-2 p-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs flex items-start gap-2">
                                <Settings size={14} className="flex-shrink-0 mt-0.5" />
                                <span>الصلاحيات ستُحدد تلقائياً حسب نوع المدير المختار. (قريباً)</span>
                            </div>
                        </div>

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
                                    placeholder="أدخل اسم المدير"
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
                                    placeholder="admin@example.com"
                                    className={`${inputClass('email')} pr-12 pl-4`}
                                    disabled={loading}
                                    dir="ltr"
                                />
                            </div>
                            {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
                        </div>

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
                                    placeholder="8 أحرف على الأقل"
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
                                    placeholder="أعد كتابة كلمة المرور"
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
                            className="flex-1 h-12 rounded-pill bg-charcoal hover:bg-slate-800 text-white font-bold text-sm shadow-lg transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    <span>جاري الإضافة...</span>
                                </>
                            ) : (
                                <>
                                    <Shield size={18} />
                                    <span>إضافة المدير</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
