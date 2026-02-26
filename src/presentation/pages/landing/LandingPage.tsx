import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks';
import { ROUTES } from '../../../shared/constants';
import { Footer } from '../../components/common/Footer';
import { SEO } from '../../components/seo/SEO';
import { Navbar } from '../../components/landing/Navbar';

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
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ParallaxHero } from '../../components/landing/ParallaxHero';
import { TextReveal } from '../../components/landing/TextReveal';
import { MagneticButton } from '../../components/landing/MagneticButton';
import { FloatingBadge } from '../../components/landing/FloatingBadge';
import { BentoFeatureGrid } from '../../components/landing/BentoFeatureGrid';
import { ExpandableCourseCard } from '../../components/landing/ExpandableCourseCard';
import { RevealCTA } from '../../components/landing/RevealCTA';

export function LandingPage() {
    const navigate = useNavigate();
    const { isRTL } = useLanguage();

    return (
        <div className="min-h-screen bg-soft-cloud dark:bg-charcoal dark:text-slate-200 overflow-x-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
            <SEO
                title="سُبُل - علم يوصل للمستقبل"
                description="منصة تعليمية متكاملة تجمع بين الفصول التفاعلية والمتابعة الدقيقة لضمان أفضل تجربة تعليمية. انضم لآلاف الطلاب الناجحين الآن."
            />
            {/* Navigation */}
            <Navbar />

            {/* Hero Banner Section — Multi-layered Parallax */}
            <section className="pt-16 sm:pt-20">
                <ParallaxHero />
            </section>

            {/* Unified Hero Section */}
            <section className="relative min-h-[60vh] sm:min-h-[70vh] lg:min-h-[90vh] flex items-center py-8 sm:py-12 lg:py-0 overflow-hidden" id="home">
                {/* Dynamic Background Elements */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] right-[-5%] w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] lg:w-[500px] lg:h-[500px] bg-red-50 rounded-full blur-3xl opacity-60" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] lg:w-[600px] lg:h-[600px] bg-indigo-50 rounded-full blur-3xl opacity-50" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-8 items-center relative z-10">

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

                        <TextReveal
                            delay={0.1}
                            duration={0.8}
                            stagger={0.1}
                            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-charcoal dark:text-white leading-[1.15] mb-6 tracking-tight"
                            as="h1"
                        >
                            <span className="block mb-2">مستقبلك</span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-shibl-crimson to-rose-600 block my-2 pb-2">التعليمي</span>
                            <span className="text-charcoal dark:text-white block">يبدأ من هنا</span>
                        </TextReveal>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-base sm:text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed mb-8 sm:mb-10"
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
                            <MagneticButton strength={0.25} boundaryRadius={80} className="btn-primary-pro btn-lg h-14 sm:h-16 px-8 text-lg sm:text-xl shadow-crimson-lg hover:shadow-crimson hover:-translate-y-1 transition-all duration-300 justify-center group cursor-pointer">
                                <Link to={ROUTES.REGISTER} className="flex items-center gap-2">
                                    <span>ابدأ رحلتك الآن</span>
                                    <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />
                                </Link>
                            </MagneticButton>
                            <MagneticButton strength={0.2} boundaryRadius={60} className="h-14 sm:h-16 px-6 sm:px-8 rounded-full text-lg sm:text-xl text-slate-grey dark:text-slate-300 hover:text-charcoal dark:hover:text-white hover:-translate-y-1 transition-all duration-300 inline-flex items-center justify-center gap-3 bg-white dark:bg-white/5 shadow-sm border border-slate-200 dark:border-white/10 group cursor-pointer">
                                <span className="w-10 h-10 rounded-full bg-red-50 text-shibl-crimson flex items-center justify-center flex-shrink-0 group-hover:bg-shibl-crimson group-hover:text-white transition-colors">
                                    <Play size={22} className="fill-current" />
                                </span>
                                <span className="font-bold">شاهد الفيديو</span>
                            </MagneticButton>
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
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
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

                        <div className="relative w-full max-w-[280px] sm:max-w-[400px] lg:max-w-[500px] mx-auto aspect-square">
                            <div className="absolute inset-4 bg-gradient-to-br from-red-50 to-white rounded-[2.5rem] rotate-3 shadow-2xl border border-white" />
                            <div className="absolute inset-4 bg-white rounded-[2.5rem] -rotate-3 shadow-xl overflow-hidden border border-slate-100">
                                <img
                                    src="/images/hero-teacher.webp"
                                    alt="Professional Omani teacher explaining lesson"
                                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                                    fetchPriority="high"
                                    decoding="async"
                                />
                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                            </div>

                            {/* Floating Card - Top Right (Success) — mouse-reactive */}
                            <FloatingBadge
                                floatRange={10}
                                floatDuration={2.8}
                                mouseReactivity={0.04}
                                floatDelay={0.5}
                                className="absolute top-6 sm:top-12 right-0 sm:-right-8 p-2.5 sm:p-4 bg-white/90 dark:bg-charcoal/90 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-xl rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3 scale-[0.8] sm:scale-100 origin-top-right"
                            >
                                <div className="w-9 h-9 sm:w-12 sm:h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                                    <CheckCircle size={20} className="sm:hidden" />
                                    <CheckCircle size={24} className="hidden sm:block" />
                                </div>
                                <div>
                                    <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">النتيجة النهائية</p>
                                    <p className="text-sm sm:text-lg font-extrabold text-slate-800 dark:text-white">98% ممتاز</p>
                                </div>
                            </FloatingBadge>

                            {/* Floating Card - Bottom Left (Courses) — mouse-reactive */}
                            <FloatingBadge
                                floatRange={14}
                                floatDuration={3.4}
                                mouseReactivity={0.06}
                                floatDelay={0.3}
                                className="absolute bottom-8 sm:bottom-16 left-0 sm:-left-8 p-2.5 sm:p-4 bg-white/90 dark:bg-charcoal/90 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-xl rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3 scale-[0.8] sm:scale-100 origin-bottom-left"
                            >
                                <div className="w-9 h-9 sm:w-12 sm:h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-500">
                                    <Trophy size={20} className="sm:hidden" />
                                    <Trophy size={24} className="hidden sm:block" />
                                </div>
                                <div>
                                    <p className="text-sm sm:text-lg font-extrabold text-slate-800 dark:text-white">+50 دورة</p>
                                    <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold">متوفرة الآن</p>
                                </div>
                            </FloatingBadge>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section — Bento Grid */}
            <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 bg-soft-cloud dark:bg-charcoal/50" id="features">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-8 sm:mb-12 md:mb-16 flex flex-col items-center">
                        <span className="px-3 sm:px-4 py-1 sm:py-1.5 bg-shibl-crimson/10 text-shibl-crimson rounded-full text-xs sm:text-sm font-extrabold mb-3 sm:mb-4 uppercase tracking-widest">المميزات</span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-charcoal dark:text-white mb-2 sm:mb-3 md:mb-4">لماذا تختار منصتنا؟</h2>
                        <p className="text-slate-grey dark:text-slate-400 max-w-2xl text-sm sm:text-base md:text-lg px-4">نقدم لك تجربة تعليمية فريدة ومتكاملة</p>
                    </div>

                    <BentoFeatureGrid />
                </div>
            </section>

            {/* Stages Section — Expandable Course Cards */}
            <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6" id="stages">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-8 sm:mb-12 md:mb-16 flex flex-col items-center">
                        <span className="px-3 sm:px-4 py-1 sm:py-1.5 bg-shibl-crimson/10 text-shibl-crimson rounded-full text-xs sm:text-sm font-extrabold mb-3 sm:mb-4 uppercase tracking-widest">المراحل الدراسية</span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-charcoal dark:text-white mb-2 sm:mb-3 md:mb-4">محتوى تعليمي شامل</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                        {[
                            { icon: <Backpack size={48} />, title: 'الدورة الأولى', desc: 'تأسيس قوي للمهارات الأساسية', color: 'from-red-50 to-rose-50', iconColor: 'text-shibl-crimson' },
                            { icon: <BookOpen size={48} />, title: 'الدورة الثانية', desc: 'تطوير المفاهيم والمهارات', color: 'from-rose-50 to-red-50', iconColor: 'text-shibl-crimson' },
                            { icon: <GraduationCap size={48} />, title: 'الدورة الثالثة', desc: 'تحضير شامل للجامعة', color: 'from-red-50 to-rose-100', iconColor: 'text-shibl-crimson-dark' },
                            { icon: <Building2 size={48} />, title: 'المرحلة الجامعية', desc: 'دورات متخصصة ومتقدمة', color: 'from-rose-100 to-red-50', iconColor: 'text-shibl-crimson-dark' },
                        ].map((stage, idx) => (
                            <ExpandableCourseCard
                                key={idx}
                                layoutId={`course-card-${idx}`}
                                icon={stage.icon}
                                title={stage.title}
                                description={stage.desc}
                                gradientClasses={stage.color}
                                iconColor={stage.iconColor}
                                delay={idx * 0.1}
                                isRTL={isRTL}
                                onCtaClick={() => navigate(ROUTES.HOME)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section — Cursor Reveal Effect */}
            <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6">
                <RevealCTA className="max-w-6xl mx-auto rounded-3xl sm:rounded-[40px] md:rounded-[50px] lg:rounded-[60px] shadow-2xl shadow-shibl-crimson/30">
                    <div className="bg-gradient-to-r from-shibl-crimson to-shibl-crimson-dark p-6 sm:p-8 md:p-12 lg:p-20 text-center rounded-3xl sm:rounded-[40px] md:rounded-[50px] lg:rounded-[60px]">
                        <div className="relative z-10 flex flex-col items-center">
                            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-white mb-3 sm:mb-4 md:mb-6 px-2">ابدأ رحلتك التعليمية اليوم</h2>
                            <p className="text-white/80 max-w-2xl text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 md:mb-10 lg:mb-12 px-4">انضم لآلاف الطلاب الناجحين واحصل على تجربة تعليمية استثنائية</p>
                            <Link to={ROUTES.REGISTER} className="btn bg-white text-shibl-crimson hover:bg-red-50 px-6 sm:px-8 md:px-10 lg:px-12 h-12 sm:h-14 md:h-16 lg:h-20 rounded-xl sm:rounded-2xl text-base sm:text-lg md:text-xl lg:text-2xl font-extrabold gap-2 sm:gap-3 md:gap-4 shadow-2xl hover:scale-105 transition-transform">
                                سجل مجاناً الآن
                                <ArrowLeft size={24} style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />
                            </Link>
                        </div>
                    </div>
                </RevealCTA>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
}
