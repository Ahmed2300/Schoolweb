import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks';
import { AuthNavbar } from '../../components';
import { ROUTES } from '../../../shared/constants';
import { authService } from '../../../data/api';

// Material Icons
import EmailIcon from '@mui/icons-material/Email';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import SchoolIcon from '@mui/icons-material/School';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';

type UserType = 'student' | 'parent';

export function ForgotPasswordPage() {
    const navigate = useNavigate();
    const { isRTL } = useLanguage();

    const [userType, setUserType] = useState<UserType>('student');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            setError('يرجى إدخال البريد الإلكتروني');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const forgotFn = userType === 'student'
                ? authService.studentForgotPassword
                : authService.parentForgotPassword;

            await forgotFn(email);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'حدث خطأ. يرجى المحاولة مرة أخرى');
        } finally {
            setIsLoading(false);
        }
    };

    const handleContinue = () => {
        navigate(ROUTES.RESET_PASSWORD, {
            state: { email, userType }
        });
    };

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
                                    <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <EmailIcon sx={{ fontSize: 40, color: '#F59E0B' }} />
                                    </div>
                                    <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
                                        نسيت كلمة المرور؟
                                    </h1>
                                    <p className="text-slate-500">
                                        لا تقلق! أدخل بريدك الإلكتروني وسنرسل لك رمز إعادة تعيين كلمة المرور
                                    </p>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center">
                                        {error}
                                    </div>
                                )}

                                {/* User Type Toggle */}
                                <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
                                    <button
                                        type="button"
                                        onClick={() => setUserType('student')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${userType === 'student'
                                                ? 'bg-white shadow-sm text-blue-600'
                                                : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        <SchoolIcon sx={{ fontSize: 20 }} />
                                        <span>طالب</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setUserType('parent')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${userType === 'parent'
                                                ? 'bg-white shadow-sm text-blue-600'
                                                : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        <SupervisorAccountIcon sx={{ fontSize: 20 }} />
                                        <span>ولي أمر</span>
                                    </button>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit}>
                                    <div className="form-control w-full mb-6">
                                        <label className="label pb-1">
                                            <span className="label-text font-bold text-slate-700">البريد الإلكتروني</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                placeholder="name@example.com"
                                                className="input input-bordered w-full pr-12 text-right"
                                                value={email}
                                                onChange={(e) => {
                                                    setEmail(e.target.value);
                                                    setError('');
                                                }}
                                                dir="ltr"
                                                required
                                            />
                                            <EmailIcon sx={{ fontSize: 20 }} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
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
                                                <SendIcon sx={{ fontSize: 20 }} />
                                                <span>إرسال رمز التحقق</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </>
                        ) : (
                            /* Success State */
                            <div className="text-center">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <SendIcon sx={{ fontSize: 40, color: '#22C55E' }} />
                                </div>
                                <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
                                    تم الإرسال!
                                </h2>
                                <p className="text-slate-500 mb-6">
                                    تم إرسال رمز إعادة تعيين كلمة المرور إلى
                                    <br />
                                    <span className="text-blue-600 font-bold dir-ltr">{email}</span>
                                </p>
                                <button
                                    onClick={handleContinue}
                                    className="btn w-full h-14 rounded-xl text-lg font-bold gap-3 border-none"
                                    style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
                                >
                                    <span>متابعة</span>
                                    <ArrowBackIcon sx={{ fontSize: 20, transform: isRTL ? 'rotate(180deg)' : 'none' }} />
                                </button>
                            </div>
                        )}

                        {/* Back Link */}
                        <div className="mt-8 text-center">
                            <Link
                                to={ROUTES.LOGIN}
                                className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600"
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
