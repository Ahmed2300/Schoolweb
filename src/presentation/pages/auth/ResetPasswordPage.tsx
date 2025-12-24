import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../hooks';
import { AuthNavbar } from '../../components';
import { ROUTES } from '../../../shared/constants';
import { authService } from '../../../data/api';

// Material Icons
import LockResetIcon from '@mui/icons-material/LockReset';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

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
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" dir={isRTL ? 'rtl' : 'ltr'}>
            <AuthNavbar />

            <div className="pt-[72px] min-h-screen flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Card */}
                    <div className="bg-white rounded-3xl shadow-xl p-8">
                        {!success ? (
                            <>
                                {/* Header */}
                                <div className="text-center mb-8">
                                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <LockResetIcon sx={{ fontSize: 40, color: '#3B82F6' }} />
                                    </div>
                                    <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
                                        إعادة تعيين كلمة المرور
                                    </h1>
                                    <p className="text-slate-500">
                                        أدخل رمز التحقق وكلمة المرور الجديدة
                                    </p>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center">
                                        {error}
                                    </div>
                                )}

                                {/* Form */}
                                <form onSubmit={handleSubmit}>
                                    {/* OTP Input */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-bold text-slate-700 mb-2 text-center">
                                            رمز التحقق
                                        </label>
                                        <div className="flex justify-center gap-3 dir-ltr">
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
                                                    className="w-11 h-12 text-center text-xl font-bold border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                                />
                                            ))}
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
                                            <LockIcon sx={{ fontSize: 20 }} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showPassword ? <VisibilityOffIcon sx={{ fontSize: 20 }} /> : <VisibilityIcon sx={{ fontSize: 20 }} />}
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
                                            <LockIcon sx={{ fontSize: 20 }} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showConfirmPassword ? <VisibilityOffIcon sx={{ fontSize: 20 }} /> : <VisibilityIcon sx={{ fontSize: 20 }} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        className="btn w-full h-14 rounded-xl text-lg font-bold gap-3 border-none"
                                        style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <span className="loading loading-spinner"></span>
                                        ) : (
                                            <>
                                                <LockResetIcon sx={{ fontSize: 20 }} />
                                                <span>إعادة تعيين كلمة المرور</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </>
                        ) : (
                            /* Success State */
                            <div className="text-center">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircleIcon sx={{ fontSize: 40, color: '#22C55E' }} />
                                </div>
                                <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
                                    تم بنجاح!
                                </h2>
                                <p className="text-slate-500 mb-6">
                                    تم إعادة تعيين كلمة المرور بنجاح.
                                    <br />
                                    يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.
                                </p>
                                <Link
                                    to={ROUTES.LOGIN}
                                    className="btn w-full h-14 rounded-xl text-lg font-bold gap-3 border-none"
                                    style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
                                >
                                    <span>تسجيل الدخول</span>
                                    <ArrowBackIcon sx={{ fontSize: 20, transform: isRTL ? 'rotate(180deg)' : 'none' }} />
                                </Link>
                            </div>
                        )}

                        {/* Back Link */}
                        {!success && (
                            <div className="mt-8 text-center">
                                <Link
                                    to={ROUTES.FORGOT_PASSWORD}
                                    className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600"
                                >
                                    <ArrowBackIcon sx={{ fontSize: 18, transform: isRTL ? 'rotate(180deg)' : 'none' }} />
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
