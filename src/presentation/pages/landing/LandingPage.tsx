import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks';
import { ROUTES } from '../../../shared/constants';
import { Footer } from '../../components/common/Footer';
import { SEO } from '../../components/seo/SEO';

// Lucide Icons
import {
    CheckCircle,
    Play,
    ArrowLeft,
    Trophy,
    Video,
    Radio,
    FileQuestion,
    LineChart,
    Backpack,
    BookOpen,
    GraduationCap,
    Building2,
    BadgeCheck,
    UserPlus,
    LogIn,
    Menu,
    X,
} from 'lucide-react';
import { motion } from 'framer-motion';

export function LandingPage() {
    const navigate = useNavigate();
    const { isRTL } = useLanguage();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <div className="min-h-screen bg-soft-cloud overflow-x-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
            <SEO
                title="سُبُل - علم يوصل للمستقبل"
                description="منصة تعليمية متكاملة تجمع بين الفصول التفاعلية والمتابعة الدقيقة لضمان أفضل تجربة تعليمية. انضم لآلاف الطلاب الناجحين الآن."
            />
            {/* Navigation */}
            <header className="fixed top-0 left-0 right-0 z-[1000] bg-white/90 backdrop-blur-md border-b border-slate-200">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
                    {/* Logo */}
                    <div
                        className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none transition-opacity hover:opacity-80"
                        onDoubleClick={() => navigate(ROUTES.ADMIN_LOGIN)}
                        title="Double tap for admin access"
                    >
                        <img src="/images/subol-red.png" alt="سُبُل" className="w-6 h-6 sm:w-8 sm:h-8" />
                        <span className="text-base sm:text-xl font-extrabold text-charcoal whitespace-nowrap">سُبُل</span>
                    </div>

                    {/* Desktop Navigation */}
                    <ul className="hidden lg:flex items-center gap-6 xl:gap-8 font-bold text-slate-grey">
                        <li><a href="#home" className="text-shibl-crimson border-b-2 border-shibl-crimson pb-1">الرئيسية</a></li>
                        <li><a href="#stages" className="hover:text-shibl-crimson transition-colors">المراحل الدراسية</a></li>
                        <li><a href="#features" className="hover:text-shibl-crimson transition-colors">المميزات</a></li>
                        <li><a href="#contact" className="hover:text-shibl-crimson transition-colors">تواصل معنا</a></li>
                    </ul>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-2 lg:gap-3">

                        <Link to={ROUTES.LOGIN} className="btn-secondary-pro flex items-center gap-1.5 lg:gap-2 px-4 lg:px-6 text-sm lg:text-base">
                            <LogIn size={18} />
                            <span className="hidden sm:inline">تسجيل الدخول</span>
                        </Link>
                        <Link to={ROUTES.REGISTER} className="btn-primary-pro flex items-center gap-1.5 lg:gap-2 px-4 lg:px-6 text-sm lg:text-base">
                            <UserPlus size={18} />
                            <span className="hidden xl:inline">إنشاء حساب جديد</span>
                            <span className="xl:hidden">حساب جديد</span>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden items-center gap-2">

                        <button
                            className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                            onClick={toggleMobileMenu}
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? (
                                <X size={28} className="text-slate-800" />
                            ) : (
                                <Menu size={28} className="text-slate-800" />
                            )}
                        </button>
                    </div>
                </nav>

                {/* Mobile Menu Overlay */}
                <div
                    className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                        }`}
                    style={{ top: '64px' }}
                    onClick={closeMobileMenu}
                />

                {/* Mobile Menu Panel */}
                <div
                    className={`fixed top-16 left-0 right-0 bg-white border-b border-slate-200 shadow-xl transition-all duration-300 md:hidden ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
                        }`}
                >
                    <div className="px-4 py-6 flex flex-col gap-4">
                        <ul className="flex flex-col gap-3 font-bold text-slate-grey">
                            <li><a href="#home" onClick={closeMobileMenu} className="block py-3 px-4 rounded-xl hover:bg-red-50 text-shibl-crimson">الرئيسية</a></li>
                            <li><a href="#stages" onClick={closeMobileMenu} className="block py-3 px-4 rounded-xl hover:bg-slate-100 transition-colors">المراحل الدراسية</a></li>
                            <li><a href="#features" onClick={closeMobileMenu} className="block py-3 px-4 rounded-xl hover:bg-slate-100 transition-colors">المميزات</a></li>
                            <li><a href="#contact" onClick={closeMobileMenu} className="block py-3 px-4 rounded-xl hover:bg-slate-100 transition-colors">تواصل معنا</a></li>
                        </ul>
                        <div className="border-t border-slate-200 pt-4 flex flex-col gap-3">
                            <Link to={ROUTES.LOGIN} onClick={closeMobileMenu} className="btn-secondary-pro w-full flex items-center justify-center gap-2 py-3">
                                <LogIn size={18} />
                                تسجيل الدخول
                            </Link>
                            <Link to={ROUTES.REGISTER} onClick={closeMobileMenu} className="btn-primary-pro w-full flex items-center justify-center gap-2 py-3">
                                <UserPlus size={18} />
                                إنشاء حساب جديد
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Banner Section */}
            <section className="pt-16 sm:pt-20">
                <div className="relative w-full overflow-hidden">
                    <img
                        src="/images/subol-hero.png"
                        alt="سُبُل - علم يوصل للمستقبل"
                        className="w-full h-auto object-cover min-h-[200px] sm:min-h-[300px] md:min-h-[400px] lg:min-h-[500px]"
                    />
                </div>
            </section>

            {/* Unified Hero Section */}
            <section className="relative min-h-[90vh] flex items-center py-12 lg:py-0 overflow-hidden" id="home">
                {/* Dynamic Background Elements */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-red-50 rounded-full blur-3xl opacity-60" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-50 rounded-full blur-3xl opacity-50" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full grid lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-10">

                    {/* Text Content */}
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-right order-2 lg:order-1">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-red-100 text-shibl-crimson px-4 py-2 rounded-full font-bold text-sm mb-6 sm:mb-8 shadow-sm"
                        >
                            <span className="w-2 h-2 rounded-full bg-shibl-crimson animate-pulse" />
                            <span>المنصة التعليمية الأولى في المنطقة</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-charcoal leading-[1.15] mb-6 tracking-tight"
                        >
                            <span className="block mb-2">مستقبلك</span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-shibl-crimson to-rose-600 block my-2 pb-2">التعليمي</span>
                            <span className="text-charcoal block">يبدأ من هنا</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-base sm:text-lg md:text-xl text-slate-500 max-w-lg leading-relaxed mb-8 sm:mb-10"
                        >
                            منصة متكاملة تجمع بين الفصول التفاعلية والمتابعة الدقيقة،
                            والمحتوى المتميز لتضمن لك أفضل تجربة تعليمية.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0"
                        >
                            <Link to={ROUTES.REGISTER} className="btn-primary-pro btn-lg h-14 sm:h-16 px-8 text-lg sm:text-xl shadow-crimson-lg hover:shadow-crimson hover:-translate-y-1 transition-all duration-300 justify-center group">
                                <span>ابدأ رحلتك الآن</span>
                                <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />
                            </Link>
                            <button className="h-14 sm:h-16 px-6 sm:px-8 rounded-full text-lg sm:text-xl text-slate-grey hover:text-charcoal hover:-translate-y-1 transition-all duration-300 inline-flex items-center justify-center gap-3 bg-white shadow-sm border border-slate-200 group">
                                <span className="w-10 h-10 rounded-full bg-red-50 text-shibl-crimson flex items-center justify-center flex-shrink-0 group-hover:bg-shibl-crimson group-hover:text-white transition-colors">
                                    <Play size={22} className="fill-current" />
                                </span>
                                <span className="font-bold">شاهد الفيديو</span>
                            </button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="mt-12 flex flex-col items-center lg:items-start gap-4"
                        >
                            <div className="flex -space-x-3 space-x-reverse">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 relative z-0">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="User" className="w-full h-full rounded-full" />
                                    </div>
                                ))}
                                <div className="w-10 h-10 rounded-full border-2 border-white bg-shibl-crimson text-white flex items-center justify-center text-xs font-bold relative z-10">
                                    +10k
                                </div>
                            </div>
                            <p className="text-slate-500 text-sm font-medium">
                                انضم لأكثر من <strong className="text-shibl-crimson">10,000</strong> طالب وطالبة يثقون بنا
                            </p>
                        </motion.div>
                    </div>

                    {/* Visual Content (Unified) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7 }}
                        className="relative flex justify-center items-center order-1 lg:order-2"
                    >
                        {/* Abstract background shapes behind image */}
                        <div className="absolute inset-0 bg-gradient-to-br from-red-100/50 to-transparent rounded-full blur-2xl transform scale-90" />

                        <div className="relative w-full max-w-[500px] aspect-square">
                            <div className="absolute inset-4 bg-gradient-to-br from-red-50 to-white rounded-[2.5rem] rotate-3 shadow-2xl border border-white" />
                            <div className="absolute inset-4 bg-white rounded-[2.5rem] -rotate-3 shadow-xl overflow-hidden border border-slate-100">
                                <img
                                    src="/images/hero-student.png"
                                    alt="Student studying with tablet"
                                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                                />
                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                            </div>

                            {/* Floating Card - Top Right (Success) */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="absolute top-12 -right-4 sm:-right-8 p-4 bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl flex items-center gap-3 animate-float"
                            >
                                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                                    <CheckCircle size={24} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">النتيجة النهائية</p>
                                    <p className="text-lg font-extrabold text-slate-800">98% ممتاز</p>
                                </div>
                            </motion.div>

                            {/* Floating Card - Bottom Left (Courses) */}
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.7 }}
                                className="absolute bottom-16 -left-4 sm:-left-8 p-4 bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl flex items-center gap-3 animate-float animation-delay-2000"
                            >
                                <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-500">
                                    <Trophy size={24} />
                                </div>
                                <div>
                                    <p className="text-lg font-extrabold text-slate-800">+50 دورة</p>
                                    <p className="text-xs text-slate-500 font-bold">متوفرة الآن</p>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 bg-white" id="features">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-8 sm:mb-12 md:mb-16 flex flex-col items-center">
                        <span className="px-3 sm:px-4 py-1 sm:py-1.5 bg-shibl-crimson/10 text-shibl-crimson rounded-full text-xs sm:text-sm font-extrabold mb-3 sm:mb-4 uppercase tracking-widest">المميزات</span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-charcoal mb-2 sm:mb-3 md:mb-4">لماذا تختار منصتنا؟</h2>
                        <p className="text-slate-grey max-w-2xl text-sm sm:text-base md:text-lg px-4">نقدم لك تجربة تعليمية فريدة ومتكاملة</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                        {[
                            { icon: <Video size={36} />, title: 'محتوى فيديو متميز', desc: 'دروس مسجلة بأعلى جودة مع إمكانية المشاهدة في أي وقت', color: 'text-shibl-crimson' },
                            { icon: <Radio size={36} />, title: 'حصص مباشرة تفاعلية', desc: 'تواصل مباشر مع المعلمين عبر Zoom وBigBlueButton', color: 'text-shibl-crimson' },
                            { icon: <FileQuestion size={36} />, title: 'اختبارات ذكية', desc: 'اختبارات MCQ مع تصحيح تلقائي وتقييم فوري', color: 'text-shibl-crimson-dark' },
                            { icon: <LineChart size={36} />, title: 'متابعة دقيقة', desc: 'تقارير مفصلة لأولياء الأمور عن تقدم الأبناء', color: 'text-shibl-crimson-dark' },
                        ].map((feature, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                key={idx}
                                className="bg-soft-cloud border border-slate-100 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl group hover:border-shibl-crimson hover:bg-white hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-default"
                            >
                                <div className={`${feature.color} mb-4 sm:mb-5 md:mb-6 bg-white w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-base sm:text-lg md:text-xl font-bold text-charcoal mb-2 sm:mb-3">{feature.title}</h3>
                                <p className="text-slate-grey leading-relaxed text-sm sm:text-base">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stages Section */}
            <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6" id="stages">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-8 sm:mb-12 md:mb-16 flex flex-col items-center">
                        <span className="px-3 sm:px-4 py-1 sm:py-1.5 bg-shibl-crimson/10 text-shibl-crimson rounded-full text-xs sm:text-sm font-extrabold mb-3 sm:mb-4 uppercase tracking-widest">المراحل الدراسية</span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-charcoal mb-2 sm:mb-3 md:mb-4">محتوى تعليمي شامل</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                        {[
                            { icon: <Backpack size={48} />, title: 'الدورة الأولى', desc: 'تأسيس قوي للمهارات الأساسية', color: 'from-red-50 to-rose-50', iconColor: 'text-shibl-crimson' },
                            { icon: <BookOpen size={48} />, title: 'الدورة الثانية', desc: 'تطوير المفاهيم والمهارات', color: 'from-rose-50 to-red-50', iconColor: 'text-shibl-crimson' },
                            { icon: <GraduationCap size={48} />, title: 'الدورة الثالثة', desc: 'تحضير شامل للجامعة', color: 'from-red-50 to-rose-100', iconColor: 'text-shibl-crimson-dark' },
                            { icon: <Building2 size={48} />, title: 'المرحلة الجامعية', desc: 'دورات متخصصة ومتقدمة', color: 'from-rose-100 to-red-50', iconColor: 'text-shibl-crimson-dark' },
                        ].map((stage, idx) => (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                key={idx}
                                className={`p-5 sm:p-6 md:p-8 rounded-3xl sm:rounded-[32px] md:rounded-[40px] bg-gradient-to-br ${stage.color} border border-white flex flex-col items-center text-center group hover:-translate-y-2 hover:shadow-xl transition-all duration-300 shadow-sm`}
                            >
                                <div className={`${stage.iconColor} mb-4 sm:mb-6 md:mb-8 group-hover:scale-110 transition-transform duration-300`}>
                                    {stage.icon}
                                </div>
                                <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-charcoal mb-2 sm:mb-3">{stage.title}</h3>
                                <p className="text-slate-grey font-bold mb-4 sm:mb-5 md:mb-6 opacity-80 text-sm sm:text-base">{stage.desc}</p>
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-extrabold text-charcoal text-sm sm:text-base cursor-pointer hover:bg-white/80 hover:shadow-sm transition-all" style={{ lineHeight: 1 }}>
                                    <span style={{ display: 'flex', alignItems: 'center' }}>تصفح الدورات</span>
                                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto rounded-3xl sm:rounded-[40px] md:rounded-[50px] lg:rounded-[60px] bg-gradient-to-r from-shibl-crimson to-shibl-crimson-dark p-6 sm:p-8 md:p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl shadow-shibl-crimson/30">
                    <div className="relative z-10 flex flex-col items-center">
                        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-white mb-3 sm:mb-4 md:mb-6 px-2">ابدأ رحلتك التعليمية اليوم</h2>
                        <p className="text-white/80 max-w-2xl text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 md:mb-10 lg:mb-12 px-4">انضم لآلاف الطلاب الناجحين واحصل على تجربة تعليمية استثنائية</p>
                        <Link to={ROUTES.REGISTER} className="btn bg-white text-shibl-crimson hover:bg-red-50 px-6 sm:px-8 md:px-10 lg:px-12 h-12 sm:h-14 md:h-16 lg:h-20 rounded-xl sm:rounded-2xl text-base sm:text-lg md:text-xl lg:text-2xl font-extrabold gap-2 sm:gap-3 md:gap-4 shadow-2xl hover:scale-105 transition-transform">
                            سجل مجاناً الآن
                            <ArrowLeft size={24} style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
}
