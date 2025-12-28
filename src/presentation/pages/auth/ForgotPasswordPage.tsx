import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks';
import { AuthNavbar } from '../../components';
import { ROUTES } from '../../../shared/constants';
import { authService } from '../../../data/api';

// Lucide Icons
import { Mail, ArrowLeft, Send, GraduationCap, Users } from 'lucide-react';

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
                                    <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Mail size={40} className="text-amber-500" />
                                    </div>
                                    <h1 className="text-2xl font-extrabold text-charcoal mb-2">
                                        نسيت كلمة المرور؟
                                    </h1>
                                    <p className="text-slate-grey">
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
                                            ? 'bg-white shadow-sm text-shibl-crimson'
                                            : 'text-slate-grey hover:text-charcoal'
                                            }`}
                                    >
                                        <GraduationCap size={20} />
                                        <span>طالب</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setUserType('parent')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${userType === 'parent'
                                            ? 'bg-white shadow-sm text-shibl-crimson'
                                            : 'text-slate-grey hover:text-charcoal'
                                            }`}
                                    >
                                        <Users size={20} />
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
                                            <Mail size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
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
                                                <Send size={20} />
                                                <span>إرسال رمز التحقق</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </>
                        ) : (
                            /* Success State */
                            <div className="text-center">
                                <div className="w-20 h-20 bg-success-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Send size={40} className="text-success-green" />
                                </div>
                                <h2 className="text-2xl font-extrabold text-charcoal mb-2">
                                    تم الإرسال!
                                </h2>
                                <p className="text-slate-grey mb-6">
                                    تم إرسال رمز إعادة تعيين كلمة المرور إلى
                                    <br />
                                    <span className="text-shibl-crimson font-bold dir-ltr">{email}</span>
                                </p>
                                <button
                                    onClick={handleContinue}
                                    className="btn-primary-pro w-full h-14 text-lg gap-3"
                                >
                                    <span>متابعة</span>
                                    <ArrowLeft size={20} style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />
                                </button>
                            </div>
                        )}

                        {/* Back Link */}
                        <div className="mt-8 text-center">
                            <Link
                                to={ROUTES.LOGIN}
                                className="inline-flex items-center gap-2 text-slate-grey hover:text-shibl-crimson"
                            >
                                <ArrowLeft size={18} style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />
                                <span>العودة لتسجيل الدخول</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
