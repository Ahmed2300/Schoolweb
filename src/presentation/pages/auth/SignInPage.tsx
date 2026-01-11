import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks';
import { useAuthStore } from '../../store';
import { AuthNavbar } from '../../components';
import { ROUTES } from '../../../shared/constants';
import { authService } from '../../../data/api';

// Lucide Icons
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    GraduationCap,
    Users,
    BadgeCheck,
    CheckCircle,
    TrendingUp,
    ArrowLeft
} from 'lucide-react';

type UserType = 'student' | 'parent';

export function SignInPage() {
    const { isRTL } = useLanguage();
    const navigate = useNavigate();
    const { setUser } = useAuthStore();

    const [userType, setUserType] = useState<UserType>('student');
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
            const loginFn = userType === 'student'
                ? authService.studentLogin
                : authService.parentLogin;

            const response = await loginFn({
                email: formData.email,
                password: formData.password,
            });

            if (response.success) {
                const userData = response.data?.student || response.data?.parent;

                if (userData) {
                    // Check if email is verified
                    const isEmailVerified = userData.email_verified_at && userData.email_verified_at !== '';

                    if (!isEmailVerified) {
                        navigate(ROUTES.VERIFY_EMAIL, {
                            state: { email: formData.email, userType }
                        });
                        return;
                    }

                    // Add role based on userType for session management
                    const userWithRole = {
                        ...userData,
                        role: userType as 'student' | 'parent',
                    };

                    setUser(userWithRole as any);

                    // Navigate based on user role
                    if (userType === 'student') {
                        navigate(ROUTES.DASHBOARD);
                    } else {
                        navigate(ROUTES.PARENT_DASHBOARD);
                    }
                }
            }
        } catch (err: any) {
            // Handle specific error cases
            if (err.message?.includes('verify your email')) {
                setError('يرجى التحقق من بريدك الإلكتروني أولاً');
                // Optionally navigate to verification page
                setTimeout(() => {
                    navigate(ROUTES.VERIFY_EMAIL, {
                        state: { email: formData.email, userType }
                    });
                }, 2000);
            } else if (err.message?.includes('Invalid credentials')) {
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
        <div className="min-h-screen bg-soft-cloud" dir={isRTL ? 'rtl' : 'ltr'}>
            <AuthNavbar />

            <div className="pt-[72px] min-h-screen grid lg:grid-cols-2">
                {/* Form Section - Order 2 on desktop makes it appear on RIGHT in RTL */}
                <div className="flex items-center justify-center p-8 lg:order-2">
                    <div className="w-full max-w-[420px]">
                        {/* Logo */}
                        <div className="flex items-center gap-2 mb-10 justify-center lg:justify-start">
                            <img src="/images/subol-red.png" alt="سُبُل" className="w-8 h-8 lg:w-9 lg:h-9" />
                            <span className="text-2xl lg:text-3xl font-extrabold text-shibl-crimson">سُبُل</span>
                        </div>

                        {/* Header */}
                        <div className="mb-8 text-center lg:text-right">
                            <h1 className="text-4xl font-extrabold text-charcoal mb-3">تسجيل الدخول</h1>
                            <p className="text-slate-grey">أهلاً بك! يرجى إدخال بياناتك للمتابعة.</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center">
                                {error}
                            </div>
                        )}
                        {/* Tabs */}
                        <div className="flex bg-slate-100/50 p-1.5 rounded-2xl mb-8">
                            <button
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 ${userType === 'student'
                                    ? 'bg-white text-shibl-crimson shadow-md shadow-shibl-crimson/10'
                                    : 'text-slate-grey hover:text-charcoal hover:bg-slate-50'
                                    }`}
                                onClick={() => setUserType('student')}
                            >
                                <GraduationCap size={20} />
                                <span>طالب</span>
                            </button>
                            <button
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 ${userType === 'parent'
                                    ? 'bg-white text-shibl-crimson shadow-md shadow-shibl-crimson/10'
                                    : 'text-slate-grey hover:text-charcoal hover:bg-slate-50'
                                    }`}
                                onClick={() => setUserType('parent')}
                            >
                                <Users size={20} />
                                <span>ولي أمر</span>
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                            {/* Email */}
                            <div className="form-control w-full">
                                <label className="label pb-1">
                                    <span className="label-text font-bold text-slate-700">البريد الإلكتروني</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        placeholder="name@example.com"
                                        className={`input-pro pr-12 ${fieldErrors.email ? 'input-pro-error' : ''}`}
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        dir="rtl"
                                    />
                                    <Mail size={20} className={`absolute right-4 top-1/2 -translate-y-1/2 ${fieldErrors.email ? 'text-red-400' : 'text-slate-400'}`} />
                                </div>
                                {fieldErrors.email && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <span>⚠</span> {fieldErrors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="form-control w-full">
                                <label className="label pb-1 flex justify-between">
                                    <span className="label-text font-bold text-slate-700">كلمة المرور</span>
                                    <Link to={ROUTES.FORGOT_PASSWORD} className="text-sm font-bold text-shibl-crimson hover:underline">نسيت كلمة المرور؟</Link>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        className={`input-pro pr-12 pl-12 ${fieldErrors.password ? 'input-pro-error' : ''}`}
                                        value={formData.password}
                                        onChange={(e) => handleChange('password', e.target.value)}
                                        dir="rtl"
                                    />
                                    <Lock size={20} className={`absolute right-4 top-1/2 -translate-y-1/2 ${fieldErrors.password ? 'text-red-400' : 'text-slate-400'}`} />
                                    <button
                                        type="button"
                                        className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-shibl-crimson"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {fieldErrors.password && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <span>⚠</span> {fieldErrors.password}
                                    </p>
                                )}
                            </div>

                            {/* Remember Me */}
                            <div className="form-control">
                                <label className="label cursor-pointer justify-start gap-3">
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-primary checkbox-sm"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <span className="label-text text-slate-600">تذكرني لاحقاً</span>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="btn-primary-pro w-full gap-3"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="loading loading-spinner"></span>
                                ) : (
                                    <>
                                        <span>تسجيل الدخول</span>
                                        <ArrowLeft size={20} style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-slate-grey">
                            ليس لديك حساب؟{' '}
                            <Link to={ROUTES.REGISTER} className="text-shibl-crimson font-bold hover:underline">أنشئ حساباً الآن</Link>
                        </p>
                    </div>
                </div>

                {/* Visual Section - Order 1 on desktop makes it appear on LEFT in RTL */}
                <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-red-50 via-rose-50 to-orange-50 p-12 relative overflow-hidden lg:order-1">
                    {/* Floating Card - Top Left (corner, in empty space) */}
                    <div className="absolute top-8 left-8 floating-card-success p-4 flex items-center gap-3 animate-float z-10">
                        <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
                            <CheckCircle size={24} className="text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-bold text-sm">تم تسجيل الحضور</span>
                            <span className="text-white/80 text-xs">حصة الرياضيات اليوم</span>
                        </div>
                    </div>

                    <div className="relative w-full max-w-lg flex flex-col items-center gap-8">
                        {/* Main Image - Changes based on user type */}
                        <div className="relative w-full max-w-[380px]">
                            <img
                                src={userType === 'student' ? '/images/signin-student.png' : '/images/signin-parent.png'}
                                alt={userType === 'student' ? 'طالب' : 'ولي أمر'}
                                className="w-full h-auto rounded-3xl drop-shadow-2xl transition-all duration-500"
                            />
                        </div>

                        {/* Caption - Changes based on user type */}
                        <div className="text-center mt-4">
                            <h2 className="text-2xl font-extrabold text-charcoal mb-2">
                                {userType === 'student' ? 'مرحباً بك مجدداً' : 'مرحباً ولي الأمر'}
                            </h2>
                            <p className="text-slate-grey max-w-sm">
                                {userType === 'student'
                                    ? 'تابع رحلتك التعليمية واستمتع بأفضل تجربة تعلم تفاعلية.'
                                    : 'تابع تقدم أبنائك واحصل على تقارير مفصلة عن أدائهم.'}
                            </p>
                        </div>
                    </div>

                    {/* Floating Card - Bottom Right (corner, in empty space) */}
                    <div className="absolute bottom-8 right-8 floating-card p-5 flex items-center gap-4 animate-float animation-delay-3000 z-10">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <TrendingUp size={28} className="text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-extrabold text-lg">أداء متميز</span>
                            <span className="text-white/80 text-sm">تحسن بنسبة 25% هذا الشهر</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
