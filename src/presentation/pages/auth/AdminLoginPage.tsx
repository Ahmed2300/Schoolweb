import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks';
import { useAuthStore } from '../../store';
import { ROUTES } from '../../../shared/constants';
import { adminService } from '../../../data/api/adminService';

// Lucide Icons
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    Shield,
    ArrowLeft,
    AlertCircle
} from 'lucide-react';

export function AdminLoginPage() {
    const { isRTL } = useLanguage();
    const navigate = useNavigate();
    const { setUser } = useAuthStore();

    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Custom validation
        const errors: { email?: string; password?: string } = {};

        if (!formData.email) {
            errors.email = 'البريد الإلكتروني مطلوب';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'يرجى إدخال بريد إلكتروني صحيح';
        }

        if (!formData.password) {
            errors.password = 'كلمة المرور مطلوبة';
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await adminService.login({
                email: formData.email,
                password: formData.password,
            });

            if (response.token && response.data) {
                // Set admin user with role
                const adminUser = {
                    ...response.data,
                    role: 'admin' as const,
                };

                setUser(adminUser as any);
                navigate(ROUTES.ADMIN_DASHBOARD);
            }
        } catch (err: any) {
            if (err.message?.includes('Invalid credentials') || err.response?.status === 401) {
                setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
            } else {
                setError(err.message || 'حدث خطأ. يرجى المحاولة مرة أخرى');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
        setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
            dir={isRTL ? 'rtl' : 'ltr'}
            style={{
                background: 'linear-gradient(135deg, #0F0F0F 0%, #1F1F1F 50%, #141414 100%)',
            }}
        >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Crimson glow orb - top right */}
                <div
                    className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
                    style={{ background: 'radial-gradient(circle, #AF0C15 0%, transparent 70%)' }}
                />
                {/* Crimson glow orb - bottom left */}
                <div
                    className="absolute -bottom-48 -left-48 w-[500px] h-[500px] rounded-full opacity-15 blur-3xl"
                    style={{
                        background: 'radial-gradient(circle, #AF0C15 0%, transparent 70%)',
                        animation: 'pulse 4s ease-in-out infinite alternate'
                    }}
                />
                {/* Subtle grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                         linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: '50px 50px'
                    }}
                />
            </div>

            {/* Login Card */}
            <div
                className="relative w-full max-w-[440px] p-8 md:p-10 rounded-3xl border border-white/10 backdrop-blur-xl"
                style={{
                    background: 'linear-gradient(145deg, rgba(31,31,31,0.9) 0%, rgba(20,20,20,0.95) 100%)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 100px rgba(175, 12, 21, 0.1), inset 0 1px 0 rgba(255,255,255,0.05)'
                }}
            >
                {/* Header */}
                <div className="text-center mb-8">
                    {/* Shield Icon */}
                    <div
                        className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                        style={{
                            background: 'linear-gradient(135deg, #AF0C15 0%, #8B0A11 100%)',
                            boxShadow: '0 10px 40px rgba(175, 12, 21, 0.4)'
                        }}
                    >
                        <Shield size={40} className="text-white" />
                    </div>

                    <h1 className="text-3xl font-extrabold text-white mb-2">
                        لوحة التحكم
                    </h1>
                    <p className="text-slate-400 text-sm">
                        تسجيل دخول المسؤولين فقط
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div
                        className="mb-6 p-4 rounded-2xl flex items-center gap-3 animate-scaleIn"
                        style={{
                            background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.15) 0%, rgba(153, 27, 27, 0.1) 100%)',
                            border: '1px solid rgba(220, 38, 38, 0.3)'
                        }}
                    >
                        <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
                        <span className="text-red-300 text-sm">{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                    {/* Email Field */}
                    <div className="form-control w-full">
                        <label className="label pb-2">
                            <span className="label-text font-bold text-slate-300 text-sm">البريد الإلكتروني</span>
                        </label>
                        <div className="relative group">
                            <input
                                type="email"
                                placeholder="admin@subol.edu"
                                className={`
                                    w-full h-14 px-12 rounded-2xl text-white placeholder:text-slate-500
                                    bg-white/5 border transition-all duration-300 outline-none
                                    ${fieldErrors.email
                                        ? 'border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                                        : 'border-white/10 focus:border-[#AF0C15] focus:ring-4 focus:ring-[#AF0C15]/20 hover:border-white/20'
                                    }
                                `}
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                dir="ltr"
                            />
                            <Mail
                                size={20}
                                className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 transition-colors duration-300
                                    ${fieldErrors.email ? 'text-red-400' : 'text-slate-500 group-focus-within:text-[#AF0C15]'}
                                `}
                            />
                        </div>
                        {fieldErrors.email && (
                            <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                                <AlertCircle size={12} />
                                {fieldErrors.email}
                            </p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div className="form-control w-full">
                        <label className="label pb-2">
                            <span className="label-text font-bold text-slate-300 text-sm">كلمة المرور</span>
                        </label>
                        <div className="relative group">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••••"
                                className={`
                                    w-full h-14 px-12 rounded-2xl text-white placeholder:text-slate-500
                                    bg-white/5 border transition-all duration-300 outline-none
                                    ${fieldErrors.password
                                        ? 'border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                                        : 'border-white/10 focus:border-[#AF0C15] focus:ring-4 focus:ring-[#AF0C15]/20 hover:border-white/20'
                                    }
                                `}
                                value={formData.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                dir="ltr"
                            />
                            <Lock
                                size={20}
                                className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 transition-colors duration-300
                                    ${fieldErrors.password ? 'text-red-400' : 'text-slate-500 group-focus-within:text-[#AF0C15]'}
                                `}
                            />
                            <button
                                type="button"
                                className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white transition-colors`}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {fieldErrors.password && (
                            <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                                <AlertCircle size={12} />
                                {fieldErrors.password}
                            </p>
                        )}
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <div className="w-5 h-5 rounded-md border border-white/20 bg-white/5 peer-checked:bg-[#AF0C15] peer-checked:border-[#AF0C15] transition-all duration-200 flex items-center justify-center">
                                    {rememberMe && (
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                                تذكرني
                            </span>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="
                            relative w-full h-14 mt-2 rounded-full font-bold text-white
                            overflow-hidden transition-all duration-300
                            disabled:opacity-60 disabled:cursor-not-allowed
                            hover:shadow-2xl hover:-translate-y-0.5
                            active:translate-y-0 active:shadow-lg
                        "
                        style={{
                            background: 'linear-gradient(135deg, #AF0C15 0%, #8B0A11 100%)',
                            boxShadow: '0 10px 40px rgba(175, 12, 21, 0.35)'
                        }}
                    >
                        {/* Hover shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />

                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>جاري تسجيل الدخول...</span>
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <span>تسجيل الدخول</span>
                                <ArrowLeft size={20} style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />
                            </span>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <p className="text-slate-500 text-xs">
                        © 2024 سُبُل - جميع الحقوق محفوظة
                    </p>
                </div>
            </div>
        </div>
    );
}
