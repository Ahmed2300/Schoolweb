import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../hooks';
import { AuthNavbar } from '../../components';
import { ROUTES } from '../../../shared/constants';
import { authService, teacherAuthService } from '../../../data/api';
import { motion, AnimatePresence } from 'framer-motion';

// Lucide Icons
import { KeyRound, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react';

/**
 * Maps known English API error messages to user-friendly Arabic descriptions.
 */
const ERROR_MESSAGE_MAP: Record<string, string> = {
    'Invalid OTP or OTP expired.': 'رمز التحقق غير صحيح أو منتهي الصلاحية. يرجى طلب رمز جديد.',
    'Invalid OTP or OTP expired': 'رمز التحقق غير صحيح أو منتهي الصلاحية. يرجى طلب رمز جديد.',
    'The selected email is invalid.': 'البريد الإلكتروني غير مسجل في النظام.',
    'The selected email is invalid': 'البريد الإلكتروني غير مسجل في النظام.',
    'The email field is required.': 'يرجى إدخال البريد الإلكتروني.',
    'The otp field is required.': 'يرجى إدخال رمز التحقق.',
    'The password field is required.': 'يرجى إدخال كلمة المرور.',
    'The password must be at least 8 characters.': 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.',
    'The password confirmation does not match.': 'كلمتا المرور غير متطابقتين.',
    'The password field confirmation does not match.': 'كلمتا المرور غير متطابقتين.',
    'Too many attempts. Please try again later.': 'محاولات كثيرة. يرجى المحاولة لاحقاً.',
    'Too Many Attempts.': 'محاولات كثيرة جداً. يرجى الانتظار قليلاً والمحاولة مرة أخرى.',
    'Unauthenticated.': 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.',
    'The given data was invalid.': 'البيانات المدخلة غير صحيحة. يرجى المراجعة والمحاولة مرة أخرى.',
};

const getArabicErrorMessage = (err: any): string => {
    const defaultMessage = 'حدث خطأ. يرجى التحقق من صحة البيانات والمحاولة مرة أخرى.';

    // Network / no response
    if (!err.response) {
        return 'تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.';
    }

    const data = err.response?.data;
    const status = err.response?.status;

    // Check for Arabic message from backend first
    if (data?.message_ar) return data.message_ar;

    // Check for validation errors (Laravel-style { errors: { field: ["msg"] } })
    if (data?.errors && typeof data.errors === 'object') {
        const firstField = Object.keys(data.errors)[0];
        const firstError = data.errors[firstField]?.[0];
        if (firstError) {
            const mapped = ERROR_MESSAGE_MAP[firstError];
            if (mapped) return mapped;
        }
    }

    // Check main message
    if (data?.message) {
        const mapped = ERROR_MESSAGE_MAP[data.message];
        if (mapped) return mapped;
    }

    // Fallback by HTTP status code
    if (status === 422) return 'البيانات المدخلة غير صحيحة. يرجى المراجعة والمحاولة مرة أخرى.';
    if (status === 429) return 'محاولات كثيرة جداً. يرجى الانتظار قليلاً والمحاولة مرة أخرى.';
    if (status === 401) return 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.';
    if (status === 500) return 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً.';
    if (status === 400) return 'طلب غير صالح. يرجى التحقق من البيانات والمحاولة مرة أخرى.';

    return defaultMessage;
};

type UserType = 'student' | 'parent' | 'teacher';

export function ResetPasswordPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isRTL } = useLanguage();

    // Get email and userType from navigation state
    const email = location.state?.email || '';
    const userType: UserType = location.state?.userType ||
        (location.pathname === ROUTES.TEACHER_RESET_PASSWORD ? 'teacher' : 'student');

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [resendSuccess, setResendSuccess] = useState('');
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Countdown timer
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    // Handle OTP input
    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) value = value.slice(-1);
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtp = [...otp];
        pastedData.split('').forEach((char, i) => {
            if (i < 6) newOtp[i] = char;
        });
        setOtp(newOtp);
        if (pastedData.length === 6) {
            inputRefs.current[5]?.focus();
        }
    };

    const handleResendOtp = async () => {
        if (countdown > 0) return;

        setIsResending(true);
        setError('');
        setResendSuccess('');

        try {
            let forgotFn;
            if (userType === 'student') {
                forgotFn = authService.studentForgotPassword;
            } else if (userType === 'parent') {
                forgotFn = authService.parentForgotPassword;
            } else {
                forgotFn = teacherAuthService.forgotPassword;
            }

            // Re-call forgot password to generate new token
            await forgotFn(email);

            setResendSuccess('تم إعادة إرسال الرمز بنجاح');
            setCountdown(60);
            setTimeout(() => setResendSuccess(''), 3000);
        } catch (err: any) {
            setError(getArabicErrorMessage(err));
        } finally {
            setIsResending(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpString = otp.join('');

        if (otpString.length !== 6) {
            setError('يرجى إدخال رمز التحقق كاملاً');
            return;
        }

        if (password.length < 8) {
            setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
            return;
        }

        if (password !== confirmPassword) {
            setError('كلمتا المرور غير متطابقتين');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            let resetFn;
            if (userType === 'student') {
                resetFn = authService.studentResetPassword;
            } else if (userType === 'parent') {
                resetFn = authService.parentResetPassword;
            } else {
                resetFn = teacherAuthService.resetPassword;
            }

            await resetFn({
                email,
                otp: otpString,
                password,
                password_confirmation: confirmPassword,
            });

            setSuccess(true);
        } catch (err: any) {
            setError(getArabicErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-shibl-crimson/5 relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>

            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-shibl-crimson/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px]" />
            </div>

            <AuthNavbar />

            <div className="pt-[80px] min-h-screen flex items-center justify-center p-4 sm:p-8 relative z-10">
                <motion.div
                    className="w-full max-w-lg"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Main Card */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/50 p-8 sm:p-12 relative overflow-hidden">

                        {/* Top Gradient Line */}
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-shibl-crimson via-amber-500 to-shibl-crimson" />

                        <AnimatePresence mode="wait">
                            {!success ? (
                                <motion.div
                                    key="form"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {/* Header */}
                                    <div className="text-center mb-10">
                                        <motion.div
                                            className="w-24 h-24 bg-gradient-to-tr from-green-50 to-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner ring-1 ring-green-100"
                                            whileHover={{ scale: 1.05, rotate: -5 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                        >
                                            <ShieldCheck size={40} className="text-green-600 drop-shadow-sm" />
                                        </motion.div>
                                        <h1 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">
                                            تعيين كلمة المرور
                                        </h1>
                                        <p className="text-slate-500 text-lg leading-relaxed">
                                            أدخل الرمز المرسل إلى بريدك الإلكتروني وكلمة المرور الجديدة
                                        </p>
                                    </div>

                                    {/* Notifications */}
                                    <AnimatePresence>
                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10, height: 0 }}
                                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                                exit={{ opacity: 0, y: -10, height: 0 }}
                                                className="mb-6 p-4 bg-red-50/80 border border-red-100 rounded-2xl text-red-600 text-sm font-medium text-center flex items-center justify-center gap-2 backdrop-blur-sm"
                                            >
                                                <AlertCircle size={18} />
                                                {error}
                                            </motion.div>
                                        )}
                                        {resendSuccess && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10, height: 0 }}
                                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                                exit={{ opacity: 0, y: -10, height: 0 }}
                                                className="mb-6 p-4 bg-green-50/80 border border-green-100 rounded-2xl text-green-700 text-sm font-medium text-center flex items-center justify-center gap-2 backdrop-blur-sm"
                                            >
                                                <CheckCircle2 size={18} />
                                                {resendSuccess}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* OTP Input */}
                                    <div className="mb-8" dir="ltr">
                                        <label className="block text-slate-700 font-bold mb-4 text-center text-sm">رمز التحقق (OTP)</label>
                                        <div className="flex justify-between gap-2 sm:gap-4">
                                            {otp.map((digit, index) => (
                                                <input
                                                    key={index}
                                                    ref={(el) => { inputRefs.current[index] = el; }}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={1}
                                                    value={digit}
                                                    onChange={e => handleOtpChange(index, e.target.value)}
                                                    onKeyDown={e => handleKeyDown(index, e)}
                                                    onPaste={handlePaste}
                                                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-2xl bg-slate-50 border-2 border-slate-200 focus:bg-white focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 transition-all caret-shibl-crimson shadow-sm"
                                                    disabled={isLoading}
                                                    required
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Form */}
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* New Password */}
                                        <div className="form-control w-full group">
                                            <label className="label pb-2">
                                                <span className="label-text font-bold text-slate-700 group-focus-within:text-shibl-crimson transition-colors">
                                                    كلمة المرور الجديدة
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="********"
                                                    className="input input-bordered w-full h-14 pr-12 text-right bg-slate-50 border-slate-200 focus:bg-white focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 rounded-2xl transition-all font-bold placeholder:font-normal placeholder:text-slate-400"
                                                    value={password}
                                                    onChange={(e) => {
                                                        setPassword(e.target.value);
                                                        setError('');
                                                    }}
                                                    dir="ltr"
                                                    disabled={isLoading}
                                                    required
                                                />
                                                <Lock size={22} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-shibl-crimson transition-colors" />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                                >
                                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Confirm Password */}
                                        <div className="form-control w-full group">
                                            <label className="label pb-2">
                                                <span className="label-text font-bold text-slate-700 group-focus-within:text-shibl-crimson transition-colors">
                                                    تأكيد كلمة المرور
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    placeholder="********"
                                                    className="input input-bordered w-full h-14 pr-12 text-right bg-slate-50 border-slate-200 focus:bg-white focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 rounded-2xl transition-all font-bold placeholder:font-normal placeholder:text-slate-400"
                                                    value={confirmPassword}
                                                    onChange={(e) => {
                                                        setConfirmPassword(e.target.value);
                                                        setError('');
                                                    }}
                                                    dir="ltr"
                                                    disabled={isLoading}
                                                    required
                                                />
                                                <Lock size={22} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-shibl-crimson transition-colors" />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                                >
                                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            className="btn-primary-pro w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-shibl-crimson/20 hover:shadow-xl hover:shadow-shibl-crimson/30 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-3 group relative overflow-hidden"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <span className="loading loading-spinner loading-md text-white"></span>
                                            ) : (
                                                <>
                                                    <span className="relative z-10">تعيين كلمة المرور</span>
                                                    <KeyRound size={20} className="relative z-10 group-hover:rotate-12 transition-transform" />
                                                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-shibl-crimson opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                </>
                                            )}
                                        </button>
                                    </form>

                                    {/* Resend OTP */}
                                    <div className="mt-8 text-center bg-slate-50/50 p-4 rounded-2xl">
                                        <p className="text-slate-500 mb-2 font-medium">لم يصلك الرمز؟</p>
                                        <button
                                            type="button"
                                            onClick={handleResendOtp}
                                            disabled={countdown > 0 || isResending}
                                            className="inline-flex items-center gap-2 font-bold text-shibl-crimson hover:text-red-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {isResending ? (
                                                <span className="loading loading-spinner loading-xs"></span>
                                            ) : (
                                                <RefreshCw size={16} className={isResending ? 'animate-spin' : ''} />
                                            )}
                                            {countdown > 0
                                                ? `أعد الإرسال خلال ${countdown} ثانية`
                                                : 'أعد إرسال الرمز'
                                            }
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                /* Success State */
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ type: "spring", duration: 0.5 }}
                                    className="text-center py-8"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                                        className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-green-50/50"
                                    >
                                        <CheckCircle2 size={48} className="text-green-500" />
                                    </motion.div>

                                    <h2 className="text-3xl font-black text-slate-800 mb-3">
                                        تم بنجاح!
                                    </h2>

                                    <p className="text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">
                                        تم تحديث كلمة المرور الخاصة بك بنجاح.
                                        يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.
                                    </p>

                                    <button
                                        onClick={() => navigate(ROUTES.LOGIN)}
                                        className="btn-primary-pro w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-shibl-crimson/20 hover:shadow-xl hover:shadow-shibl-crimson/30 hover:-translate-y-1 transition-all duration-300 gap-3 group"
                                    >
                                        <span>تسجيل الدخول</span>
                                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Background Link */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-8 text-center"
                    >
                        {!success && (
                            <Link
                                to={ROUTES.LOGIN}
                                className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-shibl-crimson transition-colors py-2 px-4 rounded-xl hover:bg-slate-50/50"
                            >
                                <ArrowLeft size={18} style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />
                                <span>العودة لتسجيل الدخول</span>
                            </Link>
                        )}

                        {/* Footer Copyright */}
                        <div className="mt-8 text-slate-400 text-sm font-medium">
                            <p>© {new Date().getFullYear()} منصة شبل التعليمية. جميع الحقوق محفوظة.</p>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
