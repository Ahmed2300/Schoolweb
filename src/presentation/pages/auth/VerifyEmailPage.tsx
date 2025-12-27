import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../hooks';
import { useAuthStore } from '../../store';
import { AuthNavbar } from '../../components';
import { ROUTES } from '../../../shared/constants';
import { authService } from '../../../data/api';

// Material Icons
import VerifiedIcon from '@mui/icons-material/Verified';
import EmailIcon from '@mui/icons-material/Email';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';

type UserType = 'student' | 'parent';

export function VerifyEmailPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isRTL } = useLanguage();
    const { setUser } = useAuthStore();

    // Get email and userType from navigation state
    const email = location.state?.email || '';
    const userType: UserType = location.state?.userType || 'student';

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [countdown, setCountdown] = useState(60);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Countdown timer for resend
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    // Handle OTP input
    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) {
            value = value.slice(-1);
        }
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Handle backspace
    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // Handle paste
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

    // Submit OTP
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpString = otp.join('');

        if (otpString.length !== 6) {
            setError('يرجى إدخال رمز التحقق كاملاً');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const verifyFn = userType === 'student'
                ? authService.studentVerifyEmail
                : authService.parentVerifyEmail;

            const response = await verifyFn({ email, otp: otpString });

            if (response.success) {
                const userData = response.data?.student || response.data?.parent;
                if (userData) {
                    setUser(userData as any);
                }
                setSuccess('تم التحقق من البريد الإلكتروني بنجاح!');
                setTimeout(() => {
                    navigate(ROUTES.DASHBOARD);
                }, 1500);
            }
        } catch (err: any) {
            setError(err.message || 'رمز التحقق غير صحيح أو منتهي الصلاحية');
        } finally {
            setIsLoading(false);
        }
    };

    // Resend OTP
    const handleResendOtp = async () => {
        if (countdown > 0) return;

        setIsResending(true);
        setError('');

        try {
            const resendFn = userType === 'student'
                ? authService.studentResendOtp
                : authService.parentResendOtp;

            await resendFn(email);
            setSuccess('تم إرسال رمز تحقق جديد');
            setCountdown(60);
            setOtp(['', '', '', '', '', '']);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.message || 'فشل في إرسال الرمز');
        } finally {
            setIsResending(false);
        }
    };

    // Redirect if no email provided
    useEffect(() => {
        if (!email) {
            navigate(ROUTES.REGISTER);
        }
    }, [email, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-soft-cloud to-red-50" dir={isRTL ? 'rtl' : 'ltr'}>
            <AuthNavbar />

            <div className="pt-[72px] min-h-screen flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Card */}
                    <div className="glass-panel p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-shibl-crimson/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <EmailIcon sx={{ fontSize: 40, color: '#AF0C15' }} />
                            </div>
                            <h1 className="text-2xl font-extrabold text-charcoal mb-2">
                                تحقق من بريدك الإلكتروني
                            </h1>
                            <p className="text-slate-grey">
                                أرسلنا رمز تحقق مكون من 6 أرقام إلى
                            </p>
                            <p className="text-shibl-crimson font-bold mt-1 dir-ltr">{email}</p>
                        </div>

                        {/* Error/Success Messages */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 text-center">
                                {success}
                            </div>
                        )}

                        {/* OTP Form */}
                        <form onSubmit={handleSubmit}>
                            <div className="flex justify-center gap-3 mb-8 dir-ltr">
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
                                        className="w-12 h-14 text-center text-2xl font-bold border-2 border-slate-200 rounded-xl focus:border-shibl-crimson focus:ring-2 focus:ring-shibl-crimson/20 outline-none transition-all"
                                    />
                                ))}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="btn-primary-pro w-full gap-3"
                                disabled={isLoading || otp.join('').length !== 6}
                            >
                                {isLoading ? (
                                    <span className="loading loading-spinner"></span>
                                ) : (
                                    <>
                                        <VerifiedIcon sx={{ fontSize: 20 }} />
                                        <span>تحقق الآن</span>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Resend OTP */}
                        <div className="mt-6 text-center">
                            <p className="text-slate-grey mb-2">لم تستلم الرمز؟</p>
                            <button
                                onClick={handleResendOtp}
                                disabled={countdown > 0 || isResending}
                                className={`inline-flex items-center gap-2 font-bold ${countdown > 0 ? 'text-slate-400' : 'text-shibl-crimson hover:underline'
                                    }`}
                            >
                                {isResending ? (
                                    <span className="loading loading-spinner loading-sm"></span>
                                ) : (
                                    <RefreshIcon sx={{ fontSize: 18 }} />
                                )}
                                {countdown > 0 ? (
                                    <span>إعادة الإرسال بعد {countdown} ثانية</span>
                                ) : (
                                    <span>إعادة إرسال الرمز</span>
                                )}
                            </button>
                        </div>

                        {/* Back Link */}
                        <div className="mt-8 text-center">
                            <Link
                                to={ROUTES.LOGIN}
                                className="inline-flex items-center gap-2 text-slate-grey hover:text-shibl-crimson"
                            >
                                <ArrowBackIcon sx={{ fontSize: 18, transform: isRTL ? 'rotate(180deg)' : 'none' }} />
                                <span>العودة لتسجيل الدخول</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
