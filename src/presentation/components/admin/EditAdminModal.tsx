import { useState, useEffect } from 'react';
import { X, Loader2, User, Mail, Shield, Eye, EyeOff, ChevronDown, Users, Settings, AlertCircle } from 'lucide-react';
import { adminService, RoleData } from '../../../data/api/adminService';

interface EditAdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    admin: {
        id: number;
        name: string;
        email: string;
        roles?: RoleData[];
    } | null;
}

interface FormData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role_id: number | null;
}

export function EditAdminModal({ isOpen, onClose, onSuccess, admin }: EditAdminModalProps) {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role_id: null,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);

    // Dynamic roles from API
    const [roles, setRoles] = useState<RoleData[]>([]);
    const [rolesLoading, setRolesLoading] = useState(false);
    const [rolesError, setRolesError] = useState<string | null>(null);

    // Fetch roles from API
    useEffect(() => {
        if (isOpen && roles.length === 0) {
            const fetchRoles = async () => {
                setRolesLoading(true);
                setRolesError(null);
                try {
                    const response = await adminService.getRoles();
                    setRoles(response.data || []);
                } catch (err: any) {
                    console.error('Error fetching roles:', err);
                    setRolesError('فشل في تحميل الأدوار');
                } finally {
                    setRolesLoading(false);
                }
            };
            fetchRoles();
        }
    }, [isOpen, roles.length]);

    // Initialize form when admin changes
    useEffect(() => {
        if (isOpen && admin) {
            setFormData({
                name: admin.name || '',
                email: admin.email || '',
                password: '',
                password_confirmation: '',
                role_id: admin.roles?.[0]?.id || null,
            });
            setError(null);
            setFieldErrors({});
        }
    }, [isOpen, admin]);

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

    if (!isOpen || !admin) return null;

    const handleChange = (name: keyof FormData, value: string | number | null) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleRoleSelect = (roleId: number | null) => {
        setFormData(prev => ({ ...prev, role_id: roleId }));
        setShowRoleDropdown(false);
    };

    const selectedRole = roles.find(r => r.id === formData.role_id);

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.name.trim()) errors.name = 'الاسم مطلوب';
        if (!formData.email.trim()) errors.email = 'البريد الإلكتروني مطلوب';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'البريد الإلكتروني غير صالح';
        }

        // Password is optional for updates, but if provided must match
        if (formData.password && formData.password.length < 8) {
            errors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
        }
        if (formData.password && formData.password !== formData.password_confirmation) {
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
            const updateData: any = {
                name: formData.name,
                email: formData.email,
            };

            // Only include password if provided
            if (formData.password) {
                updateData.password = formData.password;
                updateData.password_confirmation = formData.password_confirmation;
            }

            // Include role_id if set
            if (formData.role_id) {
                updateData.role_id = formData.role_id;
            }

            await adminService.updateAdmin(admin.id, updateData);
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Error updating admin:', err);
            if (err.response?.data?.errors) {
                const backendErrors: Record<string, string> = {};
                Object.entries(err.response.data.errors).forEach(([key, messages]) => {
                    backendErrors[key] = Array.isArray(messages) ? messages[0] : String(messages);
                });
                setFieldErrors(backendErrors);
            } else {
                setError(err.response?.data?.message || 'فشل في تحديث المدير');
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
                <div className="sticky top-0 bg-gradient-to-br from-blue-600 to-blue-800 px-6 py-5 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold">
                            {admin.name.charAt(0)}
                        </div>
                        <div className="text-white">
                            <h2 className="text-lg font-extrabold">تعديل المدير</h2>
                            <p className="text-xs text-white/80">{admin.email}</p>
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
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-[12px] text-sm flex items-center gap-2">
                            <AlertCircle size={18} />
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
                                    placeholder="admin@example.com"
                                    className={`${inputClass('email')} pr-12 pl-4`}
                                    disabled={loading}
                                    dir="ltr"
                                />
                            </div>
                            {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
                        </div>

                        {/* Role Selection */}
                        <div className="role-dropdown-container">
                            <label className="block text-sm font-semibold text-charcoal mb-2">
                                الدور <span className="text-slate-400">(اختياري)</span>
                            </label>

                            {rolesLoading && (
                                <div className="w-full h-12 rounded-[12px] bg-soft-cloud border border-slate-200 flex items-center justify-center gap-2 text-slate-400">
                                    <Loader2 size={18} className="animate-spin" />
                                    <span className="text-sm">جاري تحميل الأدوار...</span>
                                </div>
                            )}

                            {rolesError && !rolesLoading && (
                                <div className="w-full p-3 rounded-[12px] bg-red-50 border border-red-200 flex items-center gap-2 text-red-600">
                                    <AlertCircle size={18} />
                                    <span className="text-sm">{rolesError}</span>
                                </div>
                            )}

                            {!rolesLoading && !rolesError && (
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                                        className="w-full h-12 rounded-[12px] bg-soft-cloud border border-slate-200 hover:border-slate-300 transition-all outline-none text-sm px-4 flex items-center justify-between"
                                        disabled={loading || roles.length === 0}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                                                <Shield size={18} />
                                            </div>
                                            <div className="text-right">
                                                <span className="font-semibold text-charcoal">
                                                    {selectedRole ? selectedRole.name : 'اختر الدور'}
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronDown size={18} className={`text-slate-400 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
                                    </button>

                                    {showRoleDropdown && roles.length > 0 && (
                                        <div className="absolute top-full mt-2 w-full bg-white rounded-[12px] shadow-xl border border-slate-200 z-20 overflow-hidden max-h-60 overflow-y-auto">
                                            <button
                                                type="button"
                                                onClick={() => handleRoleSelect(null)}
                                                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors ${!formData.role_id ? 'bg-slate-50' : ''}`}
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-slate-300 flex items-center justify-center text-white">
                                                    <Users size={18} />
                                                </div>
                                                <div className="flex-1 text-right">
                                                    <span className="font-semibold text-charcoal block">بدون دور محدد</span>
                                                </div>
                                            </button>

                                            {roles.map((role) => (
                                                <button
                                                    key={role.id}
                                                    type="button"
                                                    onClick={() => handleRoleSelect(role.id)}
                                                    className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors ${formData.role_id === role.id ? 'bg-slate-50' : ''}`}
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                                                        <Shield size={18} />
                                                    </div>
                                                    <div className="flex-1 text-right">
                                                        <span className="font-semibold text-charcoal block">{role.name}</span>
                                                    </div>
                                                    {formData.role_id === role.id && (
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
                            )}
                        </div>

                        {/* Divider */}
                        <div className="border-t border-slate-200 pt-4">
                            <p className="text-sm text-slate-500 mb-4">تغيير كلمة المرور (اختياري)</p>
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-semibold text-charcoal mb-2">
                                كلمة المرور الجديدة
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => handleChange('password', e.target.value)}
                                    placeholder="اتركه فارغاً للإبقاء على كلمة المرور الحالية"
                                    className={`${inputClass('password')} px-4`}
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
                        {formData.password && (
                            <div>
                                <label className="block text-sm font-semibold text-charcoal mb-2">
                                    تأكيد كلمة المرور
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={formData.password_confirmation}
                                        onChange={(e) => handleChange('password_confirmation', e.target.value)}
                                        placeholder="أعد كتابة كلمة المرور"
                                        className={`${inputClass('password_confirmation')} px-4`}
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
                        )}
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
                                    <Settings size={18} />
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
