import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks';
import { ROUTES } from '../../../shared/constants';
import { developers } from '../../../shared/constants/developers';
import { getSkillIcon } from '../../../shared/utils/skillIcons';
import { Footer } from '../../components/common/Footer';
import { SEO } from '../../components/seo/SEO';
import { Navbar } from '../../components/landing/Navbar';
import {
    Github,
    Linkedin,
    Mail,
    Code,
    Terminal,
    Cpu,
    Database,
    Globe,
    Server,
    Wrench,
    Instagram
} from 'lucide-react';

export function TechSupportPage() {
    const { isRTL } = useLanguage();

    return (
        <div className="min-h-screen bg-soft-cloud dark:bg-slate-950 overflow-x-hidden transition-colors duration-300" dir={isRTL ? 'rtl' : 'ltr'}>
            <SEO
                title="فريق الدعم القني - منصة سُبُل التعليمية"
                description="تواصل مع فريق الدعم الفني والمطورين القائمين على منصة سُبُل."
            />

            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-12 sm:pt-40 sm:pb-16 px-4 sm:px-6 relative overflow-hidden text-center">
                <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-red-50 dark:from-slate-900/50 to-transparent pointer-events-none" />
                <div className="max-w-4xl mx-auto relative z-10">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/30 text-shibl-crimson font-bold text-sm mb-6 shadow-sm"
                    >
                        <Wrench size={16} />
                        الجنود المجهولون
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-charcoal dark:text-white mb-6 leading-tight"
                    >
                        فريق الدعم الفني <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-shibl-crimson to-rose-600">والتطوير</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
                    >
                        نخبة من المطورين والتقنيين يعملون على مدار الساعة لضمان استقرار المنصة وتوفير أفضل تجربة تعليمية.
                    </motion.p>
                </div>

                {/* Decorative background elements */}
                <div className="absolute top-1/4 left-10 w-64 h-64 bg-rose-200/30 dark:bg-rose-900/20 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-lighten pointer-events-none animate-blob" />
                <div className="absolute top-1/3 right-10 w-72 h-72 bg-shibl-crimson/10 dark:bg-shibl-crimson/20 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-lighten pointer-events-none animate-blob animation-delay-2000" />
            </section>

            {/* Meet Our Team Section Header */}
            <section className="pt-8 pb-4 text-center px-4 sm:px-6 relative">
                <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-rose-200/40 dark:bg-rose-900/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-lighten pointer-events-none animate-[pulse_6s_ease-in-out_infinite]" />
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-shibl-crimson/10 dark:bg-shibl-crimson/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-lighten pointer-events-none animate-[pulse_8s_ease-in-out_infinite_2s]" />

                <div className="max-w-3xl mx-auto relative z-10">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl sm:text-4xl font-bold text-charcoal dark:text-white mb-4"
                    >
                        تعرف على فريقنا
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-slate-500 dark:text-slate-400"
                    >
                        العقول المبدعة التي تبني مستقبل التعلم الرقمي بشغف وإتقان.
                    </motion.p>
                </div>
            </section>

            {/* Team Grid (Bento Style & Glassmorphism) */}
            <section className="py-8 sm:py-16 px-4 sm:px-6 relative z-10">
                <div className="max-w-7xl mx-auto">
                    {/* Vertical Stack Layout (All cards horizontal) */}
                    <div className="flex flex-col gap-6 lg:gap-8 auto-rows-fr">
                        {developers.map((dev, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ delay: dev.delay * 0.5, duration: 0.6, ease: "easeOut" }}
                                key={dev.id}
                                onClick={() => window.location.href = `/developer/${dev.slug}`}
                                className={`
                                    ${(dev as any).bgGlass || 'bg-white/80'} dark:bg-slate-900/60 backdrop-blur-xl 
                                    rounded-3xl p-6 sm:p-8 lg:p-10
                                    border border-white/40 dark:border-slate-800/60
                                    transition-all duration-500 
                                    w-full group cursor-pointer 
                                    hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(175,12,21,0.15)] dark:hover:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.05)]
                                    shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none
                                    flex flex-col lg:flex-row items-center justify-between text-center lg:text-right
                                `}
                            >
                                <div className={`flex flex-col items-center justify-center lg:w-1/3 mb-6 lg:mb-0 lg:ml-8`}>
                                    <div className={`relative w-28 h-28 lg:w-32 lg:h-32 rounded-full ${dev.bg} dark:bg-slate-800 flex items-center justify-center p-1.5 group-hover:scale-105 transition-transform duration-500 shadow-md mb-4`}>
                                        <div className={`w-full h-full rounded-full overflow-hidden border-[3px] border-white dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center ${dev.color}`}>
                                            {'image_url' in dev && dev.image_url ? (
                                                <img src={dev.image_url} alt={dev.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            ) : (
                                                dev.icon
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold text-charcoal dark:text-white mb-1 tracking-tight group-hover:text-shibl-crimson transition-colors">{dev.name}</h3>
                                    <p className={`text-sm font-semibold ${dev.color} dark:text-rose-400 px-3 py-1 bg-white/50 dark:bg-slate-800/50 rounded-full inline-block backdrop-blur-sm border border-white/20 dark:border-slate-700/50`}>{dev.role}</p>
                                </div>

                                <div className={`flex-1 flex flex-col justify-between lg:w-2/3 lg:items-start items-center`}>
                                    <p className={`text-slate-600 dark:text-slate-400 leading-relaxed mb-6 lg:text-lg lg:max-w-4xl lg:-mt-4 text-sm line-clamp-4`}>
                                        {dev.bio}
                                    </p>

                                    {(dev as any).skills && (
                                        <div className={`flex flex-wrap gap-2 mb-8 lg:justify-start justify-center content-start`}>
                                            {(dev as any).skills.map((skill: string, idx: number) => (
                                                <span key={idx} className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap transition-all duration-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm hover:!text-shibl-crimson dark:hover:!text-rose-400 hover:border-shibl-crimson/30 cursor-default`}>
                                                    {getSkillIcon(skill) && <span className="opacity-70">{getSkillIcon(skill)}</span>}
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className={`flex items-center gap-3 pt-6 border-t border-slate-100/50 dark:border-slate-800/80 w-full lg:justify-start justify-center`}>
                                        <button className="text-sm font-medium text-slate-500 group-hover:text-shibl-crimson transition-colors flex items-center gap-2">
                                            عرض الملف التعريفي <div className="rtl:-scale-x-100">&rarr;</div>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 px-4 sm:px-6 bg-white dark:bg-slate-950 transition-colors duration-300">
                <div className="max-w-4xl mx-auto text-center border-t border-slate-100 dark:border-slate-800/60 pt-16">
                    <h2 className="text-3xl font-bold text-charcoal dark:text-white mb-6">هل تواجه مشكلة تقنية؟</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg mb-8">لا تتردد في التواصل معنا، فريقنا جاهز للمساعدة في أي وقت.</p>
                    <button onClick={() => window.location.href = 'mailto:support@subol.com'} className="bg-gradient-to-r from-shibl-crimson to-shibl-crimson-dark text-white shadow-[0_8px_24px_0_rgba(175,12,21,0.45)] hover:-translate-y-1 transition-all duration-300 px-8 py-3 text-lg rounded-xl inline-flex items-center gap-2">
                        <Mail size={20} />
                        تواصل مع الدعم
                    </button>
                </div>
            </section>

            <Footer />
        </div>
    );
}

// Icon component helper since SmartphoneDisplay might not be exported directly from lucide-react in all versions, 
// using a standard one if needed, but I'll import a standard one above. 
// Wait, I used SmartphoneDisplay in the code but imported Smartphone earlier in FeaturesPage. 
// Let me check imports. I'll use 'Smartphone' instead of 'SmartphoneDisplay' to be safe, or just import it if available.
// Actually, let's use a generic 'Smartphone' or 'Monitor' icon.
function SmartphoneDisplay({ size, className }: { size?: number, className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <rect width="7" height="13" x="14" y="3" rx="1" />
            <path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1z" />
        </svg>
    )
}

export default TechSupportPage;
