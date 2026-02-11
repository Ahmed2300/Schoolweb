import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../hooks';
import { AuthNavbar } from '../../components';
import { ROUTES } from '../../../shared/constants';
import { authService, teacherAuthService } from '../../../data/api';
import { motion, AnimatePresence } from 'framer-motion';

// Lucide Icons
import { Mail, ArrowLeft, Send, GraduationCap, Users, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';

type UserType = 'student' | 'parent' | 'teacher';

export function ForgotPasswordPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isRTL } = useLanguage();

    const [userType, setUserType] = useState<UserType>(
        location.pathname === ROUTES.TEACHER_FORGOT_PASSWORD ? 'teacher' : 'student'
    );
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
            let forgotFn;

            if (userType === 'student') {
                forgotFn = authService.studentForgotPassword;
            } else if (userType === 'parent') {
                forgotFn = authService.parentForgotPassword;
            } else {
                forgotFn = teacherAuthService.forgotPassword;
            }

            await forgotFn(email);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'حدث خطأ. يرجى المحاولة مرة أخرى');
        } finally {
            setIsLoading(false);
        }
    };

    const handleContinue = () => {
        const route = userType === 'teacher' ? ROUTES.TEACHER_RESET_PASSWORD : ROUTES.RESET_PASSWORD;
        navigate(route, {
            state: { email, userType }
        });
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

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
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
                                            className="w-24 h-24 bg-gradient-to-tr from-amber-50 to-orange-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner ring-1 ring-amber-100"
                                            whileHover={{ scale: 1.05, rotate: 5 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                        >
                                            <Mail size={40} className="text-amber-500 drop-shadow-sm" />
                                        </motion.div>
                                        <h1 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">
                                            نسيت كلمة المرور؟
                                        </h1>
                                        <p className="text-slate-500 text-lg leading-relaxed max-w-xs mx-auto">
                                            لا تقلق! أدخل بريدك الإلكتروني وسنرسل لك رمز استعادة كلمة المرور.
                                        </p>
                                    </div>

                                    {/* Error Message */}
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
                                    </AnimatePresence>

                                    {/* User Type Selection */}
                                    <div className="bg-slate-50/80 p-1.5 rounded-2xl mb-8 border border-slate-100 shadow-inner flex relative">
                                        {(['student', 'parent', 'teacher'] as const).map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setUserType(type)}
                                                className={`flex-1 relative z-10 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 ${userType === type
                                                    ? 'text-shibl-crimson shadow-sm bg-white ring-1 ring-black/5'
                                                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                                                    }`}
                                            >
                                                {type === 'student' && <GraduationCap size={18} />}
                                                {type === 'parent' && <Users size={18} />}
                                                {type === 'teacher' && <BookOpen size={18} />}
                                                <span>
                                                    {type === 'student' ? 'طالب' : type === 'parent' ? 'ولي أمر' : 'معلم'}
                                                </span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Form */}
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="form-control w-full group">
                                            <label className="label pb-2">
                                                <span className="label-text font-bold text-slate-700 group-focus-within:text-shibl-crimson transition-colors">
                                                    البريد الإلكتروني
                                                </span>
                                            </label>
                                            <div className="relative transform transition-all duration-200 group-focus-within:-translate-y-1">
                                                <input
                                                    type="email"
                                                    placeholder="name@example.com"
                                                    className="input input-bordered w-full h-14 pr-12 text-right bg-slate-50 border-slate-200 focus:bg-white focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 rounded-2xl transition-all font-medium placeholder:text-slate-400"
                                                    value={email}
                                                    onChange={(e) => {
                                                        setEmail(e.target.value);
                                                        setError('');
                                                    }}
                                                    dir="ltr"
                                                    disabled={isLoading}
                                                    required
                                                />
                                                <Mail size={22} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-shibl-crimson transition-colors" />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            className="btn-primary-pro w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-shibl-crimson/20 hover:shadow-xl hover:shadow-shibl-crimson/30 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-3 group relative overflow-hidden"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <span className="loading loading-spinner loading-md text-white"></span>
                                            ) : (
                                                <>
                                                    <span className="relative z-10">إرسال رمز التحقق</span>
                                                    <Send size={20} className="relative z-10 group-hover:-translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-shibl-crimson opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                </>
                                            )}
                                        </button>
                                    </form>
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
                                        تم الإرسال بنجاح!
                                    </h2>

                                    <p className="text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">
                                        تم إرسال رمز استعادة كلمة المرور إلى بريدك الإلكتروني
                                        <br />
                                        <span className="text-shibl-crimson font-bold dir-ltr bg-red-50 px-3 py-1 rounded-lg mt-2 inline-block shadow-sm boeder border-red-100">{email}</span>
                                    </p>

                                    <button
                                        onClick={handleContinue}
                                        className="btn-primary-pro w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-shibl-crimson/20 hover:shadow-xl hover:shadow-shibl-crimson/30 hover:-translate-y-1 transition-all duration-300 gap-3 group"
                                    >
                                        <span>متابعة لإدخال الرمز</span>
                                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Back Link */}
                        <motion.div
                            variants={itemVariants}
                            className="mt-8 text-center"
                        >
                            <Link
                                to={ROUTES.LOGIN}
                                className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-shibl-crimson transition-colors py-2 px-4 rounded-xl hover:bg-slate-50"
                            >
                                <ArrowLeft size={18} style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />
                                <span>العودة لتسجيل الدخول</span>
                            </Link>
                        </motion.div>
                    </div>

                    {/* Footer Copyright/Help */}
                    <div className="mt-8 text-center text-slate-400 text-sm font-medium">
                        <p>© {new Date().getFullYear()} منصة شبل التعليمية. جميع الحقوق محفوظة.</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
