import { useState, useEffect } from 'react';
import {
    X,
    User,
    Mail,
    Phone,
    Lock,
    Eye,
    EyeOff,
    Loader2,
    Users,
    MapPin,
    Briefcase,
    Heart,
    AlertCircle
} from 'lucide-react';
import { adminService, CreateParentRequest } from '../../../data/api/adminService';

interface AddParentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function AddParentModal({ isOpen, onClose, onSuccess }: AddParentModalProps) {
    // Form data
    const [formData, setFormData] = useState<CreateParentRequest>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        address: '',
        relationship: '',
        occupation: '',
        status: 'active',
    });

    // UI States
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Relationship options
    const relationshipOptions = [
        { value: 'father', label: 'أب' },
        { value: 'mother', label: 'أم' },
        { value: 'guardian', label: 'ولي أمر' },
        { value: 'brother', label: 'أخ' },
        { value: 'sister', label: 'أخت' },
        { value: 'other', label: 'أخرى' },
    ];

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: '',
                email: '',
                password: '',
                password_confirmation: '',
                phone: '',
                address: '',
                relationship: '',
                occupation: '',
                status: 'active',
            });
            setError(null);
        }
    }, [isOpen]);

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validation
        if (!formData.name || !formData.email || !formData.password) {
            setError('الاسم والبريد الإلكتروني وكلمة المرور مطلوبة');
            setLoading(false);
            return;
        }

        if (formData.password.length < 8) {
            setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
            setLoading(false);
            return;
        }

        if (formData.password !== formData.password_confirmation) {
            setError('كلمة المرور غير متطابقة');
            setLoading(false);
            return;
        }

        try {
            await adminService.createParent(formData);
            onSuccess();
        } catch (err: any) {
            console.error('Error creating parent:', err);
            setError(err.response?.data?.message || 'فشل في إضافة ولي الأمر');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-[20px] shadow-xl w-full max-w-xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-br from-green-600 to-green-700 px-6 py-5 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                            <Users className="text-white" size={24} />
                        </div>
                        <div className="text-white">
                            <h2 className="text-lg font-extrabold">إضافة ولي أمر جديد</h2>
                            <p className="text-xs text-white/80">أدخل بيانات ولي الأمر</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-[12px] text-sm flex items-center gap-2">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Name */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">الاسم *</label>
                            <div className="relative">
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="اسم ولي الأمر الكامل"
                                    className="w-full h-11 pr-12 pl-4 rounded-[10px] border border-slate-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none text-sm"
                                    dir="auto"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">البريد الإلكتروني *</label>
                            <div className="relative">
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="parent@example.com"
                                    className="w-full h-11 pr-12 pl-4 rounded-[10px] border border-slate-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none text-sm"
                                    dir="ltr"
                                    required
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">رقم الهاتف</label>
                            <div className="relative">
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Phone size={18} />
                                </div>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone || ''}
                                    onChange={handleChange}
                                    placeholder="رقم الهاتف"
                                    className="w-full h-11 pr-12 pl-4 rounded-[10px] border border-slate-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none text-sm"
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">كلمة المرور *</label>
                            <div className="relative">
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full h-11 pr-12 pl-12 rounded-[10px] border border-slate-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none text-sm"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">تأكيد كلمة المرور *</label>
                            <div className="relative">
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="password_confirmation"
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full h-11 pr-12 pl-12 rounded-[10px] border border-slate-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none text-sm"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Relationship */}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">صلة القرابة</label>
                            <div className="relative">
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Heart size={18} />
                                </div>
                                <select
                                    name="relationship"
                                    value={formData.relationship || ''}
                                    onChange={handleChange}
                                    className="w-full h-11 pr-12 pl-4 rounded-[10px] border border-slate-200 focus:border-green-500 outline-none text-sm appearance-none bg-white"
                                >
                                    <option value="">اختر صلة القرابة</option>
                                    {relationshipOptions.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Occupation */}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">المهنة</label>
                            <div className="relative">
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Briefcase size={18} />
                                </div>
                                <input
                                    type="text"
                                    name="occupation"
                                    value={formData.occupation || ''}
                                    onChange={handleChange}
                                    placeholder="المهنة"
                                    className="w-full h-11 pr-12 pl-4 rounded-[10px] border border-slate-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none text-sm"
                                    dir="auto"
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">العنوان</label>
                            <div className="relative">
                                <div className="absolute right-4 top-3 text-slate-400">
                                    <MapPin size={18} />
                                </div>
                                <textarea
                                    name="address"
                                    value={formData.address || ''}
                                    onChange={handleChange}
                                    placeholder="العنوان الكامل"
                                    className="w-full h-20 pr-12 pl-4 py-3 rounded-[10px] border border-slate-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none text-sm resize-none"
                                    dir="auto"
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">الحالة</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="active"
                                        checked={formData.status === 'active'}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-green-600"
                                    />
                                    <span className="text-sm text-slate-700">نشط</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="inactive"
                                        checked={formData.status === 'inactive'}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-green-600"
                                    />
                                    <span className="text-sm text-slate-700">غير نشط</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 h-11 rounded-pill bg-slate-100 hover:bg-slate-200 text-charcoal font-semibold text-sm transition-all"
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 h-11 rounded-pill bg-green-600 hover:bg-green-700 text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                جاري الإضافة...
                            </>
                        ) : (
                            <>
                                <Users size={18} />
                                إضافة ولي الأمر
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
