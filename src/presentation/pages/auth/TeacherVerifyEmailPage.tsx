import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../hooks';
import { useAuthStore } from '../../store';
import { ROUTES } from '../../../shared/constants';
import { teacherAuthService } from '../../../data/api/teacherAuthService';

// Lucide Icons
import {
    Mail,
    ArrowLeft,
    AlertCircle,
    CheckCircle,
    RotateCcw,
    GraduationCap
} from 'lucide-react';

// OTP expiry time in seconds
const OTP_EXPIRY_TIME = 120; // 2 minutes

export function TeacherVerifyEmailPage() {
    const { isRTL } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const { setUser } = useAuthStore();

    // Get email from navigation state
    const email = location.state?.email || '';

    // OTP input state
    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Countdown timer for resend
    const [countdown, setCountdown] = useState(OTP_EXPIRY_TIME);
    const [canResend, setCanResend] = useState(false);

    // Refs for OTP inputs
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Redirect if no email provided
    useEffect(() => {
        if (!email) {
            navigate(ROUTES.ADMIN_LOGIN);
        }
    }, [email, navigate]);

    // Countdown timer
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [countdown]);

    // Auto-focus first input on mount
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleOtpChange = (index: number, value: string) => {
        // Only allow numbers
        if (value && !/^\d+$/.test(value)) return;

        const newOtp = [...otp];

        // Handle paste event (multiple digits)
        if (value.length > 1) {
            const digits = value.split('').slice(0, 6);
            digits.forEach((digit, i) => {
                if (index + i < 6) {
                    newOtp[index + i] = digit;
                }
            });
            setOtp(newOtp);
            // Focus last filled input or next empty
            const nextIndex = Math.min(index + digits.length, 5);
            inputRefs.current[nextIndex]?.focus();
            return;
        }

        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Clear errors on input
        setError('');
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }

        // Handle left arrow
        if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }

        // Handle right arrow
        if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const otpCode = otp.join('');

        if (otpCode.length !== 6) {
            setError('يرجى إدخال رمز التحقق كاملاً');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await teacherAuthService.verifyEmail({
                email,
                otp: otpCode,
            });

            if (response.success && response.data?.teacher) {
                setSuccess('تم التحقق بنجاح! جاري تحويلك...');

                // Set teacher user
                const teacherUser = {
                    ...response.data.teacher,
                    role: 'teacher' as const,
                };
                setUser(teacherUser as any);

                // Redirect to teacher dashboard after short delay
                setTimeout(() => {
                    navigate(ROUTES.TEACHER_DASHBOARD);
                }, 1500);
            }
        } catch (err: any) {
            if (err.response?.status === 400 || err.response?.status === 401 || err.response?.data?.message?.includes('Invalid')) {
                setError('رمز التحقق غير صحيح أو منتهي الصلاحية');
            } else {
                setError(err.response?.data?.message || 'حدث خطأ. يرجى المحاولة مرة أخرى');
            }
            // Clear OTP on error
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!canResend) return;

        setIsLoading(true);
        setError('');

        try {
            await teacherAuthService.forgotPassword(email);
            setSuccess('تم إرسال رمز تحقق جديد إلى بريدك الإلكتروني');
            setCountdown(OTP_EXPIRY_TIME);
            setCanResend(false);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'فشل إرسال رمز التحقق');
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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
                <div
                    className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
                    style={{ background: 'radial-gradient(circle, #AF0C15 0%, transparent 70%)' }}
                />
                <div
                    className="absolute -bottom-48 -left-48 w-[500px] h-[500px] rounded-full opacity-15 blur-3xl"
                    style={{
                        background: 'radial-gradient(circle, #AF0C15 0%, transparent 70%)',
                        animation: 'pulse 4s ease-in-out infinite alternate'
                    }}
                />
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                         linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: '50px 50px'
                    }}
                />
            </div>

            {/* Verify Card */}
            <div
                className="relative w-full max-w-[440px] p-8 md:p-10 rounded-3xl border border-white/10 backdrop-blur-xl"
                style={{
                    background: 'linear-gradient(145deg, rgba(31,31,31,0.9) 0%, rgba(20,20,20,0.95) 100%)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 100px rgba(175, 12, 21, 0.1), inset 0 1px 0 rgba(255,255,255,0.05)'
                }}
            >
                {/* Back Button */}
                <button
                    type="button"
                    onClick={() => navigate(ROUTES.ADMIN_LOGIN)}
                    className={`absolute top-6 ${isRTL ? 'right-6' : 'left-6'} p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all`}
                >
                    <ArrowLeft size={20} style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div
                        className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                        style={{
                            background: 'linear-gradient(135deg, #AF0C15 0%, #8B0A11 100%)',
                            boxShadow: '0 10px 40px rgba(175, 12, 21, 0.4)'
                        }}
                    >
                        <GraduationCap size={40} className="text-white" />
                    </div>

                    <h1 className="text-3xl font-extrabold text-white mb-2">
                        تأكيد البريد الإلكتروني
                    </h1>
                    <p className="text-slate-400 text-sm">
                        أدخل رمز التحقق المرسل إلى
                    </p>
                    <p className="text-[#AF0C15] font-medium mt-1 flex items-center justify-center gap-2">
                        <Mail size={16} />
                        {email}
                    </p>
                </div>

                {/* Success Message */}
                {success && (
                    <div
                        className="mb-6 p-4 rounded-2xl flex items-center gap-3 animate-scaleIn"
                        style={{
                            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.1) 100%)',
                            border: '1px solid rgba(34, 197, 94, 0.3)'
                        }}
                    >
                        <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
                        <span className="text-green-300 text-sm">{success}</span>
                    </div>
                )}

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

                {/* OTP Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* OTP Input */}
                    <div className="flex justify-center gap-3" dir="ltr">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className={`
                                    w-12 h-14 text-center text-xl font-bold rounded-xl
                                    bg-white/5 border text-white
                                    focus:outline-none focus:ring-4 transition-all duration-300
                                    ${error
                                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                                        : 'border-white/10 focus:border-[#AF0C15] focus:ring-[#AF0C15]/20 hover:border-white/20'
                                    }
                                `}
                                disabled={isLoading}
                            />
                        ))}
                    </div>

                    {/* Countdown Timer */}
                    <div className="text-center">
                        {!canResend ? (
                            <p className="text-slate-400 text-sm">
                                إعادة الإرسال بعد <span className="text-[#AF0C15] font-bold">{formatTime(countdown)}</span>
                            </p>
                        ) : (
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={isLoading}
                                className="text-[#AF0C15] hover:text-[#d40f1a] font-medium text-sm flex items-center justify-center gap-2 mx-auto transition-colors disabled:opacity-50"
                            >
                                <RotateCcw size={16} />
                                إعادة إرسال الرمز
                            </button>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading || otp.join('').length !== 6}
                        className="
                            relative w-full h-14 rounded-full font-bold text-white
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
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />

                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>جاري التحقق...</span>
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <span>تأكيد</span>
                                <CheckCircle size={20} />
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
