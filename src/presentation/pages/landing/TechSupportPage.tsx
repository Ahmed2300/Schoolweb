import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks';
import { ROUTES } from '../../../shared/constants';
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
    Server
} from 'lucide-react';

export function TechSupportPage() {
    const { isRTL } = useLanguage();

    const developers = [
        {
            id: 1,
            name: "المطور الأول",
            role: "Senior Full Stack Dev",
            bio: "خبير في بناء الأنظمة المعقدة وتحسين الأداء. يقود الفريق التقني لضمان استقرار المنصة.",
            icon: <Terminal size={32} />,
            color: "text-blue-600",
            bg: "bg-blue-50",
            delay: 0.1
        },
        {
            id: 2,
            name: "المطور الثاني",
            role: "Backend Specialist",
            bio: "متخصص في هندسة الخوادم وقواعد البيانات. يضمن أمان وكفاءة معالجة البيانات.",
            icon: <Server size={32} />,
            color: "text-green-600",
            bg: "bg-green-50",
            delay: 0.2
        },
        {
            id: 3,
            name: "المطور الثالث",
            role: "Frontend Architect",
            bio: "شغوف بتجربة المستخدم وتصميم الواجهات التفاعلية. يحول التصاميم إلى واقع ملموس.",
            icon: <Code size={32} />,
            color: "text-purple-600",
            bg: "bg-purple-50",
            delay: 0.3
        },
        {
            id: 4,
            name: "المطور الرابع",
            role: "Mobile App Lead",
            bio: "مطور تطبيقات محترف. يركز على توفير تجربة سلسة للمستخدمين عبر الهواتف الذكية.",
            icon: <SmartphoneDisplay size={32} />,
            color: "text-orange-600",
            bg: "bg-orange-50",
            delay: 0.4
        },
        {
            id: 5,
            name: "المطور الخامس",
            role: "QA & DevOps Engineer",
            bio: "مسؤول عن جودة النظام وعمليات النشر الآلي. يضمن خلو المنصة من الأخطاء.",
            icon: <Cpu size={32} />,
            color: "text-red-600",
            bg: "bg-red-50",
            delay: 0.5
        }
    ];

    return (
        <div className="min-h-screen bg-soft-cloud overflow-x-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
            <SEO
                title="فريق الدعم القني - منصة سُبُل التعليمية"
                description="تواصل مع فريق الدعم الفني والمطورين القائمين على منصة سُبُل."
            />

            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-12 sm:pt-40 sm:pb-16 px-4 sm:px-6 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-blue-50 to-transparent pointer-events-none" />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block px-4 py-2 rounded-full bg-white border border-blue-100 text-blue-600 font-bold text-sm mb-6 shadow-sm"
                    >
                        🛠️ الجنود المجهولون
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-charcoal mb-6 leading-tight"
                    >
                        فريق الدعم الفني <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">والتطوير</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed"
                    >
                        نخبة من المطورين والتقنيين يعملون على مدار الساعة لضمان استقرار المنصة وتوفير أفضل تجربة تعليمية.
                    </motion.p>
                </div>
            </section>

            {/* Team Grid */}
            <section className="py-12 sm:py-20 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 justify-items-center">
                        {developers.map((dev) => (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: dev.delay }}
                                key={dev.id}
                                className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 w-full max-w-md group"
                            >
                                <div className={`w-16 h-16 rounded-2xl ${dev.bg} ${dev.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    {dev.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-charcoal mb-2">{dev.name}</h3>
                                <p className={`text-sm font-semibold mb-4 ${dev.color}`}>{dev.role}</p>
                                <p className="text-slate-500 leading-relaxed mb-8 min-h-[80px]">
                                    {dev.bio}
                                </p>

                                <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
                                    <button className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-charcoal transition-colors">
                                        <Github size={20} />
                                    </button>
                                    <button className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                        <Linkedin size={20} />
                                    </button>
                                    <button className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors">
                                        <Mail size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 px-4 sm:px-6 bg-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-charcoal mb-6">هل تواجه مشكلة تقنية؟</h2>
                    <p className="text-slate-500 text-lg mb-8">لا تتردد في التواصل معنا، فريقنا جاهز للمساعدة في أي وقت.</p>
                    <button onClick={() => window.location.href = 'mailto:support@subol.com'} className="btn-primary-pro px-8 py-3 text-lg rounded-xl inline-flex items-center gap-2">
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
