import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../hooks';
import { AuthNavbar } from '../../components';
import { ROUTES } from '../../../shared/constants';
import { authService } from '../../../data/api';

// Lucide Icons
import { KeyRound, Lock, Eye, EyeOff, ArrowLeft, CheckCircle, RefreshCw } from 'lucide-react';

type UserType = 'student' | 'parent';

export function ResetPasswordPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isRTL } = useLanguage();

    // Get email and userType from navigation state
    const email = location.state?.email || '';
    const userType: UserType = location.state?.userType || 'student';

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
            const forgotFn = userType === 'student'
                ? authService.studentForgotPassword
                : authService.parentForgotPassword;

            // Re-call forgot password to generate new token
            await forgotFn(email);

            setResendSuccess('تم إعادة إرسال الرمز بنجاح');
            setCountdown(60);
            setTimeout(() => setResendSuccess(''), 3000);
        } catch (err: any) {
            setError(err.message || 'فشل إعادة إرسال الرمز');
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
            const resetFn = userType === 'student'
                ? authService.studentResetPassword
                : authService.parentResetPassword;

            await resetFn({
                email,
                otp: otpString,
                password,
                password_confirmation: confirmPassword,
            });

            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'رمز التحقق غير صحيح أو منتهي الصلاحية');
        } finally {
            setIsLoading(false);
        }
    };

    // Redirect if no email provided
    useEffect(() => {
        if (!email) {
            navigate(ROUTES.FORGOT_PASSWORD);
        }
    }, [email, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-soft-cloud to-red-50" dir={isRTL ? 'rtl' : 'ltr'}>
            <AuthNavbar />

            <div className="pt-[72px] min-h-screen flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Card */}
                    <div className="bg-white rounded-3xl shadow-card p-8">
                        {!success ? (
                            <>
                                {/* Header */}
                                <div className="text-center mb-8">
                                    <div className="w-20 h-20 bg-shibl-crimson/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <KeyRound size={40} className="text-shibl-crimson" />
                                    </div>
                                    <h1 className="text-2xl font-extrabold text-charcoal mb-2">
                                        إعادة تعيين كلمة المرور
                                    </h1>
                                    <p className="text-slate-grey">
                                        أدخل رمز التحقق وكلمة المرور الجديدة
                                    </p>
                                    <p className="text-sm text-slate-400 mt-2 dir-ltr">{email}</p>
                                </div>

                                {/* Messages */}
                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center text-sm">
                                        {error}
                                    </div>
                                )}
                                {resendSuccess && (
                                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 text-center text-sm">
                                        {resendSuccess}
                                    </div>
                                )}

                                {/* Form */}
                                <form onSubmit={handleSubmit}>
                                    {/* OTP Input */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-bold text-slate-700 mb-2 text-center">
                                            رمز التحقق
                                        </label>
                                        <div className="flex justify-center gap-3 dir-ltr mb-4">
                                            {otp.map((digit, index) => (
                                                <input
                                                    key={index}
                                                    ref={(el) => { inputRefs.current[index] = el; }}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={1}
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                                    onPaste={handlePaste}
                                                    className="w-11 h-12 text-center text-xl font-bold border-2 border-slate-200 rounded-xl focus:border-shibl-crimson focus:ring-2 focus:ring-shibl-crimson/20 outline-none transition-all"
                                                />
                                            ))}
                                        </div>

                                        {/* Resend Link */}
                                        <div className="text-center">
                                            <button
                                                type="button"
                                                onClick={handleResendOtp}
                                                disabled={countdown > 0 || isResending}
                                                className={`text-sm font-bold inline-flex items-center gap-1 transition-colors ${countdown > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-shibl-crimson hover:underline'
                                                    }`}
                                            >
                                                {isResending ? (
                                                    <span className="loading loading-spinner loading-xs"></span>
                                                ) : (
                                                    <RefreshCw size={14} />
                                                )}
                                                {countdown > 0
                                                    ? `إعادة الإرسال بعد ${countdown} ثانية`
                                                    : 'إعادة إرسال الرمز'
                                                }
                                            </button>
                                        </div>
                                    </div>

                                    {/* New Password */}
                                    <div className="form-control w-full mb-4">
                                        <label className="label pb-1">
                                            <span className="label-text font-bold text-slate-700">كلمة المرور الجديدة</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                className="input input-bordered w-full pr-12 pl-12 text-right"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                minLength={8}
                                                required
                                            />
                                            <Lock size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="form-control w-full mb-6">
                                        <label className="label pb-1">
                                            <span className="label-text font-bold text-slate-700">تأكيد كلمة المرور</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                className="input input-bordered w-full pr-12 pl-12 text-right"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                minLength={8}
                                                required
                                            />
                                            <Lock size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        className="btn-primary-pro w-full h-14 text-lg gap-3"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <span className="loading loading-spinner"></span>
                                        ) : (
                                            <>
                                                <KeyRound size={20} />
                                                <span>إعادة تعيين كلمة المرور</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </>
                        ) : (
                            /* Success State */
                            <div className="text-center">
                                <div className="w-20 h-20 bg-success-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle size={40} className="text-success-green" />
                                </div>
                                <h2 className="text-2xl font-extrabold text-charcoal mb-2">
                                    تم بنجاح!
                                </h2>
                                <p className="text-slate-grey mb-6">
                                    تم إعادة تعيين كلمة المرور بنجاح.
                                    <br />
                                    يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.
                                </p>
                                <Link
                                    to={ROUTES.LOGIN}
                                    className="btn-primary-pro w-full h-14 text-lg gap-3"
                                >
                                    <span>تسجيل الدخول</span>
                                    <ArrowLeft size={20} style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />
                                </Link>
                            </div>
                        )}

                        {/* Back Link */}
                        {!success && (
                            <div className="mt-8 text-center">
                                <Link
                                    to={ROUTES.FORGOT_PASSWORD}
                                    className="inline-flex items-center gap-2 text-slate-grey hover:text-shibl-crimson"
                                >
                                    <ArrowLeft size={18} style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />
                                    <span>العودة</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
