import { useState, useEffect } from 'react';
import { X, Save, Loader2, User, Mail, Phone, MapPin, GraduationCap, Users } from 'lucide-react';
import { UserData, UserRole, adminService } from '../../../data/api/adminService';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    user: UserData | null;
}

interface FormField {
    name: string;
    label: string;
    type: 'text' | 'email' | 'tel' | 'select' | 'password';
    placeholder?: string;
    icon?: React.ReactNode;
    options?: { value: string; label: string }[];
    required?: boolean;
}

// Field configurations per role
const getFieldsForRole = (role: UserRole): FormField[] => {
    const commonFields: FormField[] = [
        { name: 'name', label: 'الاسم', type: 'text', placeholder: 'أدخل الاسم الكامل', icon: <User size={18} />, required: true },
        { name: 'email', label: 'البريد الإلكتروني', type: 'email', placeholder: 'example@email.com', icon: <Mail size={18} />, required: true },
        { name: 'phone', label: 'رقم الهاتف', type: 'tel', placeholder: '+20 1xx xxxx xxx', icon: <Phone size={18} /> },
    ];

    const statusField: FormField = {
        name: 'status',
        label: 'الحالة',
        type: 'select',
        options: [
            { value: 'active', label: 'نشط' },
            { value: 'inactive', label: 'غير نشط' },
        ],
    };

    switch (role) {
        case 'student':
            return [
                ...commonFields,
                { name: 'parent_phone', label: 'هاتف ولي الأمر', type: 'tel', placeholder: '+20 1xx xxxx xxx', icon: <Users size={18} /> },
                { name: 'grade', label: 'الصف الدراسي', type: 'text', placeholder: 'مثال: الصف الثالث الإعدادي', icon: <GraduationCap size={18} /> },
                {
                    name: 'how_do_you_know_us',
                    label: 'كيف عرفت عنا؟',
                    type: 'select',
                    options: [
                        { value: '', label: 'اختر...' },
                        { value: 'instagram', label: 'Instagram' },
                        { value: 'twitter', label: 'Twitter' },
                        { value: 'snapchat', label: 'Snapchat' },
                        { value: 'facebook', label: 'Facebook' },
                        { value: 'whatsapp', label: 'WhatsApp' },
                        { value: 'phone_call', label: 'مكالمة هاتفية' },
                        { value: 'friend', label: 'صديق' },
                        { value: 'other', label: 'أخرى' },
                    ],
                },
                statusField,
            ];

        case 'parent':
            return [
                ...commonFields,
                { name: 'address', label: 'العنوان', type: 'text', placeholder: 'أدخل العنوان', icon: <MapPin size={18} /> },
                {
                    name: 'relationship',
                    label: 'صلة القرابة',
                    type: 'select',
                    options: [
                        { value: '', label: 'اختر...' },
                        { value: 'father', label: 'أب' },
                        { value: 'mother', label: 'أم' },
                        { value: 'guardian', label: 'وصي' },
                        { value: 'other', label: 'أخرى' },
                    ],
                },
                { name: 'occupation', label: 'المهنة', type: 'text', placeholder: 'أدخل المهنة' },
                statusField,
            ];

        case 'teacher':
            return [...commonFields];

        default:
            return commonFields;
    }
};

const roleLabels: Record<UserRole, string> = {
    student: 'طالب',
    parent: 'ولي أمر',
    teacher: 'مدرس',
};

export function EditUserModal({ isOpen, onClose, onSuccess, user }: EditUserModalProps) {
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // Initialize form data when user changes
    useEffect(() => {
        if (user) {
            // Initialize all fields from the user object
            setFormData({
                // Common fields
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                status: user.status || 'active',
                // Student fields
                parent_phone: user.parent_phone || '',
                grade: user.grade || '',
                how_do_you_know_us: user.how_do_you_know_us || '',
                // Parent fields
                address: user.address || '',
                relationship: user.relationship || '',
                occupation: user.occupation || '',
            });
            setError(null);
            setFieldErrors({});
        }
    }, [user]);

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

    if (!isOpen || !user) return null;

    const fields = getFieldsForRole(user.role);

    const handleChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear field error when user types
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

        fields.forEach(field => {
            if (field.required && !formData[field.name]?.trim()) {
                errors[field.name] = `${field.label} مطلوب`;
            }
            if (field.type === 'email' && formData[field.name]) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(formData[field.name])) {
                    errors[field.name] = 'البريد الإلكتروني غير صالح';
                }
            }
        });

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setError(null);

        try {
            // Build update data - only include non-empty fields
            const updateData: Record<string, any> = {};
            fields.forEach(field => {
                const value = formData[field.name];
                if (value !== undefined && value !== '') {
                    updateData[field.name] = value;
                }
            });

            await adminService.updateUser(user.role, user.id, updateData);
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Error updating user:', err);
            // Handle validation errors from backend
            if (err.response?.data?.errors) {
                const backendErrors: Record<string, string> = {};
                Object.entries(err.response.data.errors).forEach(([key, messages]) => {
                    backendErrors[key] = Array.isArray(messages) ? messages[0] : String(messages);
                });
                setFieldErrors(backendErrors);
            } else {
                setError(err.response?.data?.message || 'فشل في تحديث بيانات المستخدم');
            }
        } finally {
            setLoading(false);
        }
    };

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
                <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-shibl-crimson to-red-700 flex items-center justify-center text-white font-bold">
                            {user.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-lg font-extrabold text-charcoal">تعديل بيانات المستخدم</h2>
                            <p className="text-xs text-slate-grey">{roleLabels[user.role]} • {user.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-charcoal transition-colors disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {/* Error Banner */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-[12px] text-sm">
                            {error}
                        </div>
                    )}

                    {/* Form Fields */}
                    <div className="space-y-4">
                        {fields.map(field => (
                            <div key={field.name}>
                                <label className="block text-sm font-semibold text-charcoal mb-2">
                                    {field.label}
                                    {field.required && <span className="text-shibl-crimson mr-1">*</span>}
                                </label>

                                {field.type === 'select' ? (
                                    <select
                                        value={formData[field.name] || ''}
                                        onChange={(e) => handleChange(field.name, e.target.value)}
                                        className={`w-full h-12 px-4 rounded-[12px] bg-soft-cloud border transition-all outline-none text-sm appearance-none cursor-pointer ${fieldErrors[field.name]
                                            ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                                            : 'border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10'
                                            }`}
                                        disabled={loading}
                                    >
                                        {field.options?.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="relative">
                                        {field.icon && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                                {field.icon}
                                            </div>
                                        )}
                                        <input
                                            type={field.type}
                                            value={formData[field.name] || ''}
                                            onChange={(e) => handleChange(field.name, e.target.value)}
                                            placeholder={field.placeholder}
                                            className={`w-full h-12 rounded-[12px] bg-soft-cloud border transition-all outline-none text-sm ${field.icon ? 'pr-12 pl-4' : 'px-4'
                                                } ${fieldErrors[field.name]
                                                    ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                                                    : 'border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10'
                                                }`}
                                            disabled={loading}
                                            dir="auto"
                                        />
                                    </div>
                                )}

                                {/* Field Error */}
                                {fieldErrors[field.name] && (
                                    <p className="mt-1 text-xs text-red-500">{fieldErrors[field.name]}</p>
                                )}
                            </div>
                        ))}
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
                                    <span>جاري الحفظ...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    <span>حفظ التعديلات</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
