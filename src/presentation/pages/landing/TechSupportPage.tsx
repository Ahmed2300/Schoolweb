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
    Server,
    Wrench
} from 'lucide-react';

export function TechSupportPage() {
    const { isRTL } = useLanguage();

    const developers = [
        {
            id: 1,
            name: "أحمد عزام",
            role: "قائد الفريق ومطور فلاتر وواجهات أمامية",
            bio: "قائد الفريق ومطور فلاتر خبير يقود تطوير مشروع سُبُل. يركز على إنشاء تطبيقات محمولة عالية الجودة وتنسيق جهود الفريق. يمتلك خبرة ممتازة في تطوير الواجهات الأمامية باستخدام React, Next.js, TS, JS, Tailwind.",
            icon: <Terminal size={32} />,
            image_url: "https://iili.io/faFuHqN.png",
            color: "text-shibl-crimson",
            bg: "bg-red-50",
            delay: 0.1,
            email: "ahmed750@std.mans.edu.eg",
            linkedin: "https://www.linkedin.com/in/ahmed-azam-320a98200",
            github: null,
            skills: ["فلاتر", "React", "Next.js", "TypeScript", "Tailwind"]
        },
        {
            id: 2,
            name: "منار النحتي",
            role: "مطور فلاتر وواجهات أمامية",
            bio: "مطور فلاتر ومتدرب في ITI متخصص في تطوير تطبيقات الموبايل متعددة المنصات. بالإضافة إلى خبرة ممتازة في تطوير الواجهات الأمامية باستخدام React, Next.js, TS, JS, Tailwind.",
            icon: <Server size={32} />,
            image_url: "https://iili.io/K0sEXSe.jpg",
            color: "text-rose-600",
            bg: "bg-rose-50",
            delay: 0.2,
            email: "manarelnahty@gmail.com",
            linkedin: "https://www.linkedin.com/in/manar-e-6b21bb230",
            github: null,
            skills: ["فلاتر", "React", "Next.js", "TypeScript", "Tailwind"]
        },
        {
            id: 3,
            name: "محمد بدر",
            role: "مطور فلاتر",
            bio: "مطور فلاتر ومتدرب في تطوير الواجهة الأمامية وتطبيقات الموبايل متعددة المنصات في ITI. شغوف بإنشاء تطبيقات محمولة جميلة وعالية الأداء باستخدام إطار عمل فلاتر.",
            icon: <Code size={32} />,
            image_url: "https://iili.io/KWL2vG1.jpg",
            color: "text-red-700",
            bg: "bg-red-50",
            delay: 0.3,
            email: "mohamedbadr4iti@gmail.com",
            linkedin: "https://www.linkedin.com/in/mhmdbadr4flutter/",
            github: null,
            skills: ["فلاتر", "دارت", "UI/UX"]
        },
        {
            id: 4,
            name: "أحمد فرغلي",
            role: "مهندس واجهات خلفية",
            bio: "مهندس برمجيات متخصص في الواجهات الخلفية باستخدام Django و Laravel. يساهم في بناء أنظمة قوية وقابلة للتطوير لدعم العمليات المعقدة للمنصة بكفاءة عالية.",
            icon: <Server size={32} />,
            image_url: "https://avatars.githubusercontent.com/u/95584009?v=4",
            color: "text-rose-700",
            bg: "bg-rose-50",
            delay: 0.4,
            email: "ahmedgits2001@gmail.com",
            linkedin: "https://www.linkedin.com/in/ahmed-farghly-879b09257",
            github: null,
            skills: ["Laravel", "Django", "Backend", "API"]
        },
        {
            id: 5,
            name: "أحمد عصام",
            role: "مطور واجهات خلفية",
            bio: "مطور واجهات خلفية متخصص في PHP و Laravel. يساهم في بناء هيكلية برمجية متينة وموثوقة، مع التركيز على جودة الأكواد وفعالية الأداء في المشاريع التقنية.",
            icon: <Database size={32} />,
            color: "text-shibl-crimson-dark",
            bg: "bg-red-50",
            delay: 0.5,
            email: "ahmedessam1.8.14@gmail.com",
            linkedin: "https://www.linkedin.com/in/ahmed-essam-465208232",
            github: null,
            skills: ["PHP", "Laravel", "Backend Development"]
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
            <section className="pt-32 pb-12 sm:pt-40 sm:pb-16 px-4 sm:px-6 relative overflow-hidden text-center">
                <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-red-50 to-transparent pointer-events-none" />
                <div className="max-w-4xl mx-auto relative z-10">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-red-100 text-shibl-crimson font-bold text-sm mb-6 shadow-sm"
                    >
                        <Wrench size={16} />
                        الجنود المجهولون
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-charcoal mb-6 leading-tight"
                    >
                        فريق الدعم الفني <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-shibl-crimson to-rose-600">والتطوير</span>
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

            {/* Meet Our Team Section Header */}
            <section className="pt-8 pb-4 text-center px-4 sm:px-6">
                <div className="max-w-3xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl sm:text-4xl font-bold text-charcoal mb-4"
                    >
                        تعرف على فريقنا
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-slate-500"
                    >
                        العقول المبدعة التي تبني مستقبل التعلم الرقمي بشغف وإتقان.
                    </motion.p>
                </div>
            </section>

            {/* Team Grid */}
            <section className="py-8 sm:py-16 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                        {developers.map((dev, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: dev.delay }}
                                key={dev.id}
                                className={`bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 transition-all duration-300 w-full max-w-md group hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] text-center
                                    ${index === 3 || index === 4 ? 'lg:col-span-1 lg:max-w-lg lg:w-[calc(100%+2rem)]' : ''}
                                `}
                            >
                                <div className="flex justify-center mb-6">
                                    <div className={`relative w-24 h-24 rounded-full ${dev.bg} flex items-center justify-center p-1 group-hover:scale-105 transition-transform duration-300 shadow-sm`}>
                                        <div className={`w-full h-full rounded-full overflow-hidden border-2 border-white bg-white flex items-center justify-center ${dev.color}`}>
                                            {'image_url' in dev && dev.image_url ? (
                                                <img src={dev.image_url} alt={dev.name} className="w-full h-full object-cover" />
                                            ) : (
                                                dev.icon
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-2xl font-bold text-charcoal mb-1">{dev.name}</h3>
                                <p className={`text-sm font-semibold mb-4 ${dev.color}`}>{dev.role}</p>
                                <p className="text-slate-500 leading-relaxed mb-6 min-h-[80px]">
                                    {dev.bio}
                                </p>

                                {(dev as any).skills && (
                                    <div className="flex flex-wrap justify-center gap-2 mb-8 min-h-[60px] content-start">
                                        {(dev as any).skills.map((skill: string, idx: number) => (
                                            <span key={idx} className="text-xs px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-slate-600 font-medium whitespace-nowrap">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center justify-center gap-4 pt-6 border-t border-slate-100/80">
                                    {(dev as any).github !== null && (
                                        <a href={(dev as any).github || '#'} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md">
                                            <Github size={18} />
                                        </a>
                                    )}
                                    {(dev as any).linkedin !== null && (
                                        <a href={(dev as any).linkedin || '#'} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-slate-50 text-slate-400 hover:bg-[#0077b5] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md">
                                            <Linkedin size={18} />
                                        </a>
                                    )}
                                    {(dev as any).email !== null && (
                                        <a href={(dev as any).email ? `mailto:${(dev as any).email}` : '#'} className="p-2.5 rounded-full bg-slate-50 text-slate-400 hover:bg-shibl-crimson hover:text-white transition-all duration-300 shadow-sm hover:shadow-md">
                                            <Mail size={18} />
                                        </a>
                                    )}
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
