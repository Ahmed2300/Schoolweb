import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks';
import { ROUTES } from '../../../shared/constants';
import { Footer } from '../../components/common/Footer';
import { SEO } from '../../components/seo/SEO';
import {
    CheckCircle,
    Play,
    ArrowLeft,
    Trophy,
    Video,
    Radio,
    FileQuestion,
    LineChart,
    Shield,
    Smartphone,
    Users,
    Globe,
    Zap,
    Award,
    Menu,
    X,
    UserPlus,
    LogIn
} from 'lucide-react';
import { useState } from 'react';

export function FeaturesPage() {
    const navigate = useNavigate();
    const { isRTL } = useLanguage();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const features = [
        {
            title: "التعلم التفاعلي المباشر",
            description: "فصول افتراضية تفاعلية بالصوت والصورة، مع إمكانية طرح الأسئلة والمشاركة المباشرة. يتم تسجيل جميع الحصص تلقائيًا لمرجعتها في أي وقت، ضمن بيئة تعليمية منظمة وآمنة.",
            icon: <Radio size={32} />,
            image: "/images/feature-live-class.png",
            color: "text-shibl-crimson",
            bg: "bg-red-50",
            reverse: false,
            subFeatures: [
                "تفاعل صوتي ومرئي عالي الجودة",
                "تسجيل تلقائي لجميع الحصص",
                "أدوات شرح ذكية ومشاركة الشاشة"
            ]
        },
        {
            title: "لوحة تحكم ذكية وشاملة",
            description: "راقب تقدمك الأكاديمي من مكان واحد. تتبع الحضور والغياب، درجات الاختبارات، والواجبات المدرسية. جدول تفاعلي ينظم يومك الدراسي ويذكرك بمواعيد الحصص والاختبارات القادمة.",
            icon: <LineChart size={32} />,
            image: "/images/feature-dashboard.png",
            color: "text-blue-600",
            bg: "bg-blue-50",
            reverse: true,
            subFeatures: [
                "تقارير أداء دورية ومفصلة",
                "تنبيهات فورية للواجبات والاختبارات",
                "جدول دراسي تفاعلي ومنظم"
            ]
        },
        {
            title: "تعلم في أي وقت ومن أي مكان",
            description: "منصتنا متاحة لك 24/7 عبر الموقع أو التطبيق. ابدأ يومك الدراسي بلمسة زر، وتابع دروسك من الكمبيوتر، الجهاز اللوحي، أو الهاتف الذكي، مع محتوى متجاوب يناسب جميع الشاشات.",
            icon: <Smartphone size={32} />,
            image: "/images/feature-mobile-app.png",
            color: "text-purple-600",
            bg: "bg-purple-50",
            reverse: false,
            subFeatures: [
                "دعم كامل لجميع الأجهزة الذكية",
                "تحميل المحتوى للمشاهدة بدون إنترنت",
                "مزامنة فورية بين جميع أجهزتك"
            ]
        },
        {
            title: "متابعة دقيقة لولي الأمر",
            description: "نمنح أولياء الأمور راحة البال عبر ربط حساب الطالب بحساب ولي الأمر. احصل على تقارير دورية عن أداء ابنك، تابع حضوره، واطلع على نتائجه الدراسية لضمان تفوقه المستمر.",
            icon: <Users size={32} />,
            image: "/images/feature-parent-monitoring.png",
            color: "text-green-600",
            bg: "bg-green-50",
            reverse: true,
            subFeatures: [
                "ربط مباشر بحساب الطالب",
                "تنبيهات لحظية للحضور والغياب",
                "قنوات تواصل مباشرة مع المعلمين"
            ]
        }
    ];

    const additionalFeatures = [
        { icon: <Video size={24} />, title: 'جودة عالية Full HD', desc: 'دروس مسجلة ومباشرة بأعلى معايير الجودة' },
        { icon: <FileQuestion size={24} />, title: 'بنك أسئلة ضخم', desc: 'آلاف الأسئلة والتدريبات المتدرجة الصعوبة' },
        { icon: <Shield size={24} />, title: 'آمن ومحمي', desc: 'بيئة تعليمية آمنة ومحتوى محمي بتقنيات DRM' },
        { icon: <Globe size={24} />, title: 'مناهج معتمدة', desc: 'محتوى دراسي متوافق مع المناهج الرسمية' },
        { icon: <Zap size={24} />, title: 'سيرفرات سريعة', desc: 'تجربة تصفح ومشاهدة سلسة بدون تقطيع' },
        { icon: <Award size={24} />, title: 'شهادات إتمام', desc: 'شهادات موثقة عند إتمام الدورات والمسارات' },
    ];

    return (
        <div className="min-h-screen bg-soft-cloud overflow-x-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
            <SEO
                title="المميزات - منصة سُبُل التعليمية"
                description="اكتشف المزايا الحصرية لمنصة سُبُل: فصول تفاعلية، متابعة دقيقة، وتطبيق جوال متطور لضمان تفوقك الدراسي."
            />

            {/* Navigation (Reuse from LandingPage for consistency) */}
            <header className="fixed top-0 left-0 right-0 z-[1000] bg-white/90 backdrop-blur-md border-b border-slate-200">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
                    <div
                        className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none transition-opacity hover:opacity-80"
                        onClick={() => navigate(ROUTES.HOME)}
                    >
                        <img src="/images/subol-red.png" alt="سُبُل" className="w-6 h-6 sm:w-8 sm:h-8" />
                        <span className="text-base sm:text-xl font-extrabold text-charcoal whitespace-nowrap">سُبُل</span>
                    </div>

                    <ul className="hidden lg:flex items-center gap-6 xl:gap-8 font-bold text-slate-grey">
                        <li><Link to={ROUTES.HOME} className="hover:text-shibl-crimson transition-colors">الرئيسية</Link></li>
                        <li><a href="/#stages" className="hover:text-shibl-crimson transition-colors">المراحل الدراسية</a></li>
                        <li><Link to={ROUTES.FEATURES} className="text-shibl-crimson border-b-2 border-shibl-crimson pb-1">المميزات</Link></li>
                        <li><Link to="/contact" className="hover:text-shibl-crimson transition-colors">تواصل معنا</Link></li>
                    </ul>

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
                            <li><Link to={ROUTES.HOME} onClick={closeMobileMenu} className="block py-3 px-4 rounded-xl hover:bg-slate-100 transition-colors">الرئيسية</Link></li>
                            <li><a href="/#stages" onClick={closeMobileMenu} className="block py-3 px-4 rounded-xl hover:bg-slate-100 transition-colors">المراحل الدراسية</a></li>
                            <li><Link to={ROUTES.FEATURES} onClick={closeMobileMenu} className="block py-3 px-4 rounded-xl hover:bg-red-50 text-shibl-crimson">المميزات</Link></li>
                            <li><Link to="/contact" onClick={closeMobileMenu} className="block py-3 px-4 rounded-xl hover:bg-slate-100 transition-colors">تواصل معنا</Link></li>
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

            {/* Hero Section */}
            <section className="pt-32 pb-16 sm:pt-40 sm:pb-20 px-4 sm:px-6 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-red-50 to-transparent pointer-events-none" />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block px-4 py-2 rounded-full bg-white border border-red-100 text-shibl-crimson font-bold text-sm mb-6 shadow-sm"
                    >
                        ✨ اكتشف إمكانيات سُبُل
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-charcoal mb-6 leading-tight"
                    >
                        كل ما تحتاجه للتفوق <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-shibl-crimson to-rose-600">في مكان واحد</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed"
                    >
                        صممنا منصة سُبُل بأحدث التقنيات التعليمية لتوفير بيئة دراسية متكاملة
                        تجمع بين المتعة والفائدة، وتراعي احتياجات الطالب وولي الأمر.
                    </motion.p>
                </div>
            </section>

            {/* Main Features Section */}
            <section className="py-12 sm:py-20 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto flex flex-col gap-20 sm:gap-32">
                    {features.map((feature, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.7 }}
                            key={idx}
                            className={`flex flex-col ${feature.reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-20`}
                        >
                            {/* Text Content */}
                            <div className="flex-1 text-center lg:text-right">
                                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${feature.bg} ${feature.color} mb-6 shadow-sm`}>
                                    {feature.icon}
                                </div>
                                <h2 className="text-3xl sm:text-4xl font-extrabold text-charcoal mb-6">{feature.title}</h2>
                                <p className="text-lg text-slate-500 leading-relaxed mb-8">{feature.description}</p>
                                <ul className="flex flex-col gap-4 items-center lg:items-start">
                                    {feature.subFeatures.map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                                            <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Image Visual */}
                            <div className="flex-1 w-full max-w-[600px] lg:max-w-none">
                                <div className="relative group">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.bg} to-transparent rounded-[40px] blur-3xl opacity-60 group-hover:opacity-80 transition-opacity duration-500`} />
                                    <div className="relative rounded-[32px] overflow-hidden border-8 border-white/50 shadow-2xl bg-white transform group-hover:-translate-y-2 transition-transform duration-500">
                                        <img
                                            src={feature.image}
                                            alt={feature.title}
                                            className="w-full h-auto object-cover"
                                        />
                                        {/* Overlay gradient for depth */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent pointer-events-none" />
                                    </div>

                                    {/* Decorative elements */}
                                    <div className="absolute -z-10 -bottom-10 -right-10 w-40 h-40 bg-slate-100 rounded-full blur-2xl opacity-50" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Additional Features Grid */}
            <section className="py-16 sm:py-24 bg-white relative">
                <div className="absolute inset-0 bg-slate-50/50 skew-y-3 transform origin-top-left -z-10" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-charcoal mb-4">ومزايا أخرى كثيرة...</h2>
                        <p className="text-slate-500 text-lg">كل أداة صممت بعناية لتخدم رحلتك التعليمية</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {additionalFeatures.map((item, idx) => (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                key={idx}
                                className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-red-100 transition-all duration-300 group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-red-50 text-shibl-crimson flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-charcoal mb-3">{item.title}</h3>
                                <p className="text-slate-500 leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6">
                <div className="max-w-5xl mx-auto rounded-[48px] bg-gradient-to-r from-shibl-crimson to-rose-700 p-12 sm:p-20 text-center relative overflow-hidden shadow-2xl shadow-red-900/20">
                    <div className="relative z-10">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-6">جاهز لتجربة تعليمية مختلفة؟</h2>
                        <p className="text-white/90 text-xl mb-10 max-w-2xl mx-auto">انضم الآن واستمتع بجميع هذه المميزات وأكثر مع منصة سُبُل</p>
                        <Link to={ROUTES.REGISTER} className="btn bg-white text-shibl-crimson hover:bg-red-50 px-10 py-5 rounded-2xl text-xl font-extrabold shadow-lg hover:scale-105 transition-transform inline-flex items-center gap-3">
                            <span>ابدأ رحلتك مجاناً</span>
                            <ArrowLeft size={24} style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />
                        </Link>
                    </div>
                    {/* Abstract shapes */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/10 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2" />
                </div>
            </section>

            <Footer />
        </div>
    );
}

export default FeaturesPage;
