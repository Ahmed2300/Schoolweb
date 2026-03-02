import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../../hooks';
import { ROUTES } from '../../../shared/constants';
import { developers } from '../../../shared/constants/developers';
import { getSkillIcon } from '../../../shared/utils/skillIcons';
import { Footer } from '../../components/common/Footer';
import { SEO } from '../../components/seo/SEO';
import { Navbar } from '../../components/landing/Navbar';
import {
    ArrowRight,
    ArrowLeft,
    Github,
    Linkedin,
    Mail,
    Globe,
    Instagram
} from 'lucide-react';

export function DeveloperProfilePage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { isRTL } = useLanguage();

    const developer = developers.find((dev) => dev.slug === slug);

    if (!developer) {
        // Handle 404 - Developer Not Found
        return (
            <div className="min-h-screen bg-soft-cloud dark:bg-slate-950 flex flex-col items-center justify-center transition-colors duration-300">
                <Navbar />
                <div className="text-center mt-20">
                    <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">المطور غير موجود</h1>
                    <p className="text-slate-500 mb-8">يبدو أنك تبحث عن ملف تعريفي غير متوفر.</p>
                    <button
                        onClick={() => navigate(ROUTES.TECH_SUPPORT)}
                        className="bg-shibl-crimson text-white px-6 py-2 rounded-xl"
                    >
                        العودة للدعم الفني
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-soft-cloud dark:bg-slate-950 overflow-x-hidden transition-colors duration-300" dir={isRTL ? 'rtl' : 'ltr'}>
            <SEO
                title={`${developer.name} - فريق الدعم الفني`}
                description={developer.bio}
            />

            <Navbar />

            {/* Back Button */}
            <div className="fixed top-24 rtl:right-4 ltr:left-4 sm:rtl:right-8 sm:ltr:left-8 z-50">
                <button
                    onClick={() => navigate(ROUTES.TECH_SUPPORT)}
                    className="flex items-center gap-2 p-3 sm:px-4 sm:py-2.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:text-shibl-crimson hover:bg-white dark:hover:bg-slate-800 transition-all group"
                >
                    {isRTL ? <ArrowRight size={20} className="group-hover:-translate-x-1 transition-transform" /> : <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />}
                    <span className="hidden sm:inline font-medium text-sm">عودة للفريق</span>
                </button>
            </div>

            {/* Hero Section */}
            <main className="pt-32 pb-20 px-4 sm:px-6 relative">
                {/* Decorative background elements */}
                <div className={`absolute top-0 inset-x-0 h-96 ${developer.bg} dark:bg-opacity-10 pointer-events-none rounded-b-[4rem] opacity-50`} />
                <div className="absolute top-20 right-10 w-64 h-64 bg-rose-200/30 dark:bg-rose-900/20 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-lighten pointer-events-none animate-blob" />
                <div className="absolute top-40 left-10 w-72 h-72 bg-shibl-crimson/10 dark:bg-shibl-crimson/20 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-lighten pointer-events-none animate-blob animation-delay-2000" />

                <div className="max-w-5xl mx-auto relative z-10 flex flex-col lg:flex-row items-center lg:items-start gap-12 mt-10">

                    {/* Developer Image / Avatar column */}
                    <div className="flex-shrink-0 flex flex-col items-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className={`relative w-48 h-48 sm:w-64 sm:h-64 rounded-full ${developer.bg} dark:bg-slate-800 flex items-center justify-center p-2 shadow-2xl mb-8`}
                        >
                            <div className={`w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center ${developer.color}`}>
                                {developer.image_url ? (
                                    <img src={developer.image_url} alt={developer.name} className="w-full h-full object-cover" />
                                ) : (
                                    developer.icon
                                )}
                            </div>
                        </motion.div>

                        {/* Social Links under Avatar */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="flex items-center flex-wrap justify-center gap-3 bg-white/70 dark:bg-slate-800/70 p-3 rounded-2xl backdrop-blur-md shadow-sm border border-slate-100 dark:border-slate-700/50"
                        >
                            {(developer as any).github !== null && (
                                <a href={(developer as any).github || '#'} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-500 hover:bg-slate-800 hover:text-white dark:hover:text-white transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1">
                                    <Github size={20} />
                                </a>
                            )}
                            {(developer as any).linkedin !== null && (
                                <a href={(developer as any).linkedin || '#'} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-500 hover:bg-[#0077b5] hover:text-white dark:hover:bg-[#0077b5] dark:hover:text-white transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1">
                                    <Linkedin size={20} />
                                </a>
                            )}
                            {(developer as any).instagram && (
                                <a href={(developer as any).instagram} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-500 hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-pink-500 hover:to-purple-500 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1 group">
                                    <Instagram size={20} className="group-hover:text-white transition-colors" />
                                </a>
                            )}
                            {(developer as any).email !== null && (
                                <a href={(developer as any).email ? `mailto:${(developer as any).email}` : '#'} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-500 hover:bg-shibl-crimson hover:text-white transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1">
                                    <Mail size={20} />
                                </a>
                            )}
                            {(developer as any).portfolio && (
                                <a href={(developer as any).portfolio} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-500 hover:bg-shibl-crimson hover:text-white transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1">
                                    <Globe size={20} />
                                </a>
                            )}
                        </motion.div>
                    </div>

                    {/* Developer Info Content */}
                    <div className="flex-1 text-center lg:text-right mt-4 lg:mt-0">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.6 }}
                            className="mb-8"
                        >
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-charcoal dark:text-white mb-4 tracking-tight">
                                {developer.name}
                            </h1>
                            <p className={`text-lg sm:text-xl font-semibold ${developer.color} dark:text-rose-400 inline-block`}>
                                {developer.role}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border border-white/40 dark:border-slate-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none mb-8 lg:min-h-[220px]"
                        >
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 justify-center lg:justify-start">
                                نبذة تعريفية
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed lg:leading-[1.8]">
                                {developer.longBio || developer.bio}
                            </p>
                        </motion.div>

                        {(developer as any).skills && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                            >
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">المهارات والتقنيات</h2>
                                <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                                    {(developer as any).skills.map((skill: string, idx: number) => (
                                        <span
                                            key={idx}
                                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200/50 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-shibl-crimson/30 hover:text-shibl-crimson dark:hover:text-rose-400 cursor-default"
                                        >
                                            {getSkillIcon(skill) && <span className="text-base opacity-80">{getSkillIcon(skill)}</span>}
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default DeveloperProfilePage;
