import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks';
import { useAuthStore } from '../../store';
import { ROUTES } from '../../../shared/constants';
import { adminService } from '../../../data/api/adminService';
import { influencerService } from '../../../data/api/influencerService';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
    const [loginRole, setLoginRole] = useState<'admin' | 'influencer'>('admin');

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
            if (loginRole === 'admin') {
                const response = await adminService.login({
                    email: formData.email,
                    password: formData.password,
                });

                if (response.token && response.data) {
                    const adminUser = {
                        ...response.data,
                        role: 'admin' as const,
                    };
                    setUser(adminUser as any);

                    // Pre-warm admin chunks so navigation is instant
                    await Promise.allSettled([
                        import('../../components/admin'),
                        import('../admin/AdminDashboard'),
                    ]);
                    navigate(ROUTES.ADMIN_DASHBOARD);
                }
            } else {
                const response = await influencerService.login({
                    email: formData.email,
                    password: formData.password,
                });

                if (response.token && response.data) {
                    const influencerUser = {
                        ...response.data,
                        role: 'influencer' as const,
                    };
                    setUser(influencerUser as any);
                    navigate(ROUTES.INFLUENCER_DASHBOARD);
                }
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || '';

            if (errorMsg.includes('Invalid credentials') || err.response?.status === 401) {
                setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('حدث خطأ. يرجى المحاولة مرة أخرى');
            }
            // Clear loading only on error — keep spinner visible on success
            // so the user sees feedback while startTransition loads the dashboard.
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
            className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-50 font-sans"
            dir={isRTL ? 'rtl' : 'ltr'}
        >
            {/* Background Decor - Subtle Organic Blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-red-50/50 to-transparent opacity-60" />
                <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-red-100/30 blur-3xl" />
                <div className="absolute top-[40%] -left-[10%] w-[500px] h-[500px] rounded-full bg-slate-200/40 blur-3xl" />
            </div>

            {/* Main Container */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative w-full max-w-[420px] z-10"
            >
                <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] border border-slate-100 p-8 md:p-10 relative overflow-hidden">
                    <div className="absolute -top-12 -left-12 w-24 h-24 bg-shibl-crimson/5 rounded-full blur-xl" />
                    <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-indigo-500/5 rounded-full blur-xl" />

                    <div className="p-8 sm:p-10 relative">
                        {/* Header */}
                        <div className="text-center mb-10">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-6 transform rotate-3 hover:rotate-6 transition-transform">
                                <Shield className="w-8 h-8 text-shibl-crimson" />
                            </div>
                            <h1 className="text-2xl font-black text-slate-800 mb-2 font-cairo">تسجيل الدخول للنظام</h1>
                            <p className="text-slate-500 text-sm">أدخل بيانات الاعتماد الخاصة بك للوصول إلى لوحة التحكم</p>
                        </div>

                        {/* Role Toggle */}
                        <div className="flex bg-slate-100 p-1 rounded-xl mb-8 relative">
                            <button
                                type="button"
                                onClick={() => { setLoginRole('admin'); setError(''); setFieldErrors({}); }}
                                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all z-10 ${loginRole === 'admin' ? 'text-charcoal' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                مشرف النظام
                            </button>
                            <button
                                type="button"
                                onClick={() => { setLoginRole('influencer'); setError(''); setFieldErrors({}); }}
                                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all z-10 ${loginRole === 'influencer' ? 'text-charcoal' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                مسوق / مؤثر
                            </button>
                            {/* Animated Background Pill */}
                            <div
                                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-transform duration-300 ease-in-out"
                                style={{ transform: loginRole === 'admin' ? 'translateX(0)' : 'translateX(-100%)', right: '4px' }}
                            />
                        </div>

                        {/* Warning/Error Banner */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mb-6 overflow-hidden"
                                >
                                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
                                        <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                                        <p className="text-red-600 text-sm leading-relaxed">{error}</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                            {/* Email Input */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 block">
                                    البريد الإلكتروني
                                </label>
                                <div className="relative group">
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        className={`
                                        w-full h-12 px-11 rounded-xl text-slate-900 placeholder:text-slate-400
                                        bg-slate-50 border transition-all duration-200 outline-none
                                        focus:bg-white focus:shadow-[0_0_0_4px_rgba(175,12,21,0.05)]
                                        ${fieldErrors.email
                                                ? 'border-red-300 focus:border-red-500'
                                                : 'border-slate-200 focus:border-[#AF0C15] group-hover:border-slate-300'
                                            }
                                    `}
                                        placeholder="admin@subol.edu"
                                        dir="ltr"
                                    />
                                    <div className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3.5' : 'left-3.5'} pointer-events-none transition-colors duration-200 ${fieldErrors.email ? 'text-red-400' : 'text-slate-400 group-focus-within:text-[#AF0C15]'
                                        }`}>
                                        <Mail size={20} />
                                    </div>
                                </div>
                                {fieldErrors.email && (
                                    <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
                                )}
                            </div>

                            {/* Password Input */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-semibold text-slate-700 block">
                                        كلمة المرور
                                    </label>
                                </div>
                                <div className="relative group">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => handleChange('password', e.target.value)}
                                        className={`
                                        w-full h-12 px-11 rounded-xl text-slate-900 placeholder:text-slate-400
                                        bg-slate-50 border transition-all duration-200 outline-none
                                        focus:bg-white focus:shadow-[0_0_0_4px_rgba(175,12,21,0.05)]
                                        ${fieldErrors.password
                                                ? 'border-red-300 focus:border-red-500'
                                                : 'border-slate-200 focus:border-[#AF0C15] group-hover:border-slate-300'
                                            }
                                    `}
                                        placeholder="••••••••"
                                        dir="ltr"
                                    />
                                    <div className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3.5' : 'left-3.5'} pointer-events-none transition-colors duration-200 ${fieldErrors.password ? 'text-red-400' : 'text-slate-400 group-focus-within:text-[#AF0C15]'
                                        }`}>
                                        <Lock size={20} />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-3.5' : 'right-3.5'} text-slate-400 hover:text-slate-600 transition-colors`}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {fieldErrors.password && (
                                    <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`
                                w-full h-12 rounded-xl font-bold text-white shadow-lg shadow-red-900/10
                                transition-all duration-300 flex items-center justify-center gap-2
                                ${isLoading ? 'opacity-80 cursor-wait' : 'hover:scale-[1.02] hover:shadow-xl hover:shadow-red-900/20 active:scale-[0.98]'}
                            `}
                                style={{
                                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
                                }}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white/90" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>جاري تسجيل الدخول...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>تسجيل الدخول</span>
                                        <ArrowLeft size={20} className={isRTL ? 'rotate-180' : ''} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                            <p className="text-slate-400 text-xs">
                                © 2024 سُبُل - جميع الحقوق محفوظة
                            </p>
                        </div>

                    </div>
                </div>
            </motion.div>
        </div>
    );
}
