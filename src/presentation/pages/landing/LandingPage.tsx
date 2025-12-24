import { Link } from 'react-router-dom';
import { useLanguage } from '../../hooks';
import { ROUTES } from '../../../shared/constants';

// Material Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import QuizIcon from '@mui/icons-material/Quiz';
import InsightsIcon from '@mui/icons-material/Insights';
import BackpackIcon from '@mui/icons-material/Backpack';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SchoolIcon from '@mui/icons-material/School';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import VerifiedIcon from '@mui/icons-material/Verified';
import LanguageIcon from '@mui/icons-material/Language';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LoginIcon from '@mui/icons-material/Login';

export function LandingPage() {
    const { isRTL, language, toggleLanguage } = useLanguage();

    return (
        <div className="min-h-screen bg-slate-50 overflow-x-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Navigation */}
            <header className="fixed top-0 left-0 right-0 z-[1000] bg-white/90 backdrop-blur-md border-b border-slate-200">
                <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <VerifiedIcon sx={{ fontSize: 32, color: '#3B82F6' }} />
                        <span className="text-xl font-extrabold text-slate-900">منصتي التعليمية</span>
                    </div>

                    <ul className="hidden md:flex items-center gap-8 font-bold text-slate-600">
                        <li><a href="#home" className="text-blue-600 border-b-2 border-blue-600 pb-1">الرئيسية</a></li>
                        <li><a href="#stages" className="hover:text-blue-600 transition-colors">المراحل الدراسية</a></li>
                        <li><a href="#features" className="hover:text-blue-600 transition-colors">المميزات</a></li>
                        <li><a href="#contact" className="hover:text-blue-600 transition-colors">تواصل معنا</a></li>
                    </ul>

                    <div className="flex items-center gap-3">
                        <button
                            className="btn-secondary-pro flex items-center gap-2 px-4 shadow-sm"
                            onClick={toggleLanguage}
                        >
                            <LanguageIcon sx={{ fontSize: 18 }} />
                            <span>{language === 'ar' ? 'EN' : 'عربي'}</span>
                        </button>
                        <Link to={ROUTES.LOGIN} className="btn-secondary-pro hidden sm:flex items-center gap-2 px-6">
                            <LoginIcon sx={{ fontSize: 18 }} />
                            تسجيل الدخول
                        </Link>
                        <Link to={ROUTES.REGISTER} className="btn-primary-pro flex items-center gap-2 px-6">
                            <PersonAddIcon sx={{ fontSize: 18 }} />
                            إنشاء حساب جديد
                        </Link>
                    </div>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center min-h-[90vh]" id="home">
                {/* Text Content */}
                <div className="flex flex-col items-center lg:items-start text-center lg:text-right order-1">
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full font-bold text-sm mb-8">
                        <CheckCircleIcon sx={{ fontSize: 20 }} />
                        <span>المنصة التعليمية الأولى في المنطقة</span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.2] mb-6">
                        <span className="block">مستقبلك</span>
                        <span className="text-blue-600 block my-2">التعليمي</span>
                        <span className="text-indigo-600 block">يبدأ من هنا</span>
                    </h1>

                    <p className="text-lg text-slate-500 max-w-lg leading-relaxed mb-10">
                        منصة متكاملة تجمع بين الفصول التفاعلية، المتابعة الدقيقة،
                        والمحتوى المتميز لتضمن لك أفضل تجربة تعليمية.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-12">
                        <Link to={ROUTES.REGISTER} className="btn-primary-pro btn-lg h-16 px-8 text-xl shadow-xl shadow-blue-200 hover:shadow-blue-300">
                            <span>ابدأ رحلتك الآن</span>
                            <ArrowBackIcon sx={{ fontSize: 24, transform: isRTL ? 'rotate(180deg)' : 'none' }} />
                        </Link>
                        <button className="btn-secondary-pro btn-lg h-16 px-8 text-lg text-slate-600 hover:text-blue-600">
                            <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                <PlayArrowIcon sx={{ fontSize: 24 }} />
                            </span>
                            <span>شاهد الفيديو التعريفي</span>
                        </button>
                    </div>

                    <div className="flex flex-col items-center lg:items-start gap-3">
                        <p className="text-slate-500 font-medium">
                            يثق بنا أكثر من <strong className="text-blue-600 font-extrabold">10,000</strong> طالب وطالبة
                        </p>
                        <div className="flex gap-2">
                            {['أكاديمية', 'جامعة', 'تعليم'].map(tag => (
                                <span key={tag} className="px-5 py-1.5 bg-white border border-slate-200 rounded-full text-sm font-bold text-slate-600 shadow-sm">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Visual Content */}
                <div className="relative flex justify-center items-center h-[500px] order-2">
                    <div className="relative w-[400px] h-[400px] bg-gradient-to-br from-blue-100/50 to-indigo-100/50 rounded-full flex items-center justify-center p-8">
                        {/* Main Image */}
                        <img
                            src="/images/hero-student.png"
                            alt="Student studying"
                            className="w-full h-full object-contain drop-shadow-2xl z-0"
                        />
                    </div>

                    {/* Floating Card - Top Right (in empty space) */}
                    <div className="absolute top-0 right-0 floating-card-success p-4 flex items-center gap-3 animate-float z-10">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <CheckCircleIcon sx={{ fontSize: 28, color: '#FFFFFF' }} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-white/80 font-bold uppercase tracking-wider">النتيجة</span>
                            <span className="text-white font-extrabold text-lg">A+ ممتاز</span>
                        </div>
                    </div>

                    {/* Floating Card - Bottom Left (in empty space) */}
                    <div className="absolute bottom-0 left-0 floating-card-amber p-5 flex items-center gap-4 animate-float animation-delay-3000 z-10">
                        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                            <EmojiEventsIcon sx={{ fontSize: 32, color: '#FFFFFF' }} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-extrabold text-lg">إنجاز جديد!</span>
                            <span className="text-white/80 text-sm">تم إكمال دورة الفيزياء</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 px-6 bg-white" id="features">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 flex flex-col items-center">
                        <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-extrabold mb-4 uppercase tracking-widest">المميزات</span>
                        <h2 className="text-4xl font-extrabold text-slate-900 mb-4">لماذا تختار منصتنا؟</h2>
                        <p className="text-slate-500 max-w-2xl text-lg">نقدم لك تجربة تعليمية فريدة ومتكاملة</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: <VideoLibraryIcon sx={{ fontSize: 36 }} />, title: 'محتوى فيديو متميز', desc: 'دروس مسجلة بأعلى جودة مع إمكانية المشاهدة في أي وقت', color: 'text-blue-500' },
                            { icon: <LiveTvIcon sx={{ fontSize: 36 }} />, title: 'حصص مباشرة تفاعلية', desc: 'تواصل مباشر مع المعلمين عبر Zoom وBigBlueButton', color: 'text-indigo-500' },
                            { icon: <QuizIcon sx={{ fontSize: 36 }} />, title: 'اختبارات ذكية', desc: 'اختبارات MCQ مع تصحيح تلقائي وتقييم فوري', color: 'text-purple-500' },
                            { icon: <InsightsIcon sx={{ fontSize: 36 }} />, title: 'متابعة دقيقة', desc: 'تقارير مفصلة لأولياء الأمور عن تقدم الأبناء', color: 'text-cyan-500' },
                        ].map((feature, idx) => (
                            <div key={idx} className="bg-slate-50 border border-slate-100 p-8 rounded-3xl group hover:border-blue-500 hover:bg-white transition-all cursor-default">
                                <div className={`${feature.color} mb-6 bg-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stages Section */}
            <section className="py-24 px-6" id="stages">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 flex flex-col items-center">
                        <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-sm font-extrabold mb-4 uppercase tracking-widest">المراحل الدراسية</span>
                        <h2 className="text-4xl font-extrabold text-slate-900 mb-4">محتوى تعليمي شامل</h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: <BackpackIcon sx={{ fontSize: 48 }} />, title: 'المرحلة الابتدائية', desc: 'تأسيس قوي للمهارات الأساسية', color: 'from-blue-50 to-indigo-50', iconColor: 'text-blue-500' },
                            { icon: <MenuBookIcon sx={{ fontSize: 48 }} />, title: 'المرحلة الإعدادية', desc: 'تطوير المفاهيم والمهارات', color: 'from-indigo-50 to-purple-50', iconColor: 'text-indigo-500' },
                            { icon: <SchoolIcon sx={{ fontSize: 48 }} />, title: 'المرحلة الثانوية', desc: 'تحضير شامل للجامعة', color: 'from-purple-50 to-pink-50', iconColor: 'text-purple-500' },
                            { icon: <AccountBalanceIcon sx={{ fontSize: 48 }} />, title: 'المرحلة الجامعية', desc: 'دورات متخصصة ومتقدمة', color: 'from-amber-50 to-orange-50', iconColor: 'text-amber-500' },
                        ].map((stage, idx) => (
                            <div key={idx} className={`p-8 rounded-[40px] bg-gradient-to-br ${stage.color} border border-white flex flex-col items-center text-center group hover:-translate-y-2 transition-transform shadow-sm`}>
                                <div className={`${stage.iconColor} mb-8 group-hover:scale-110 transition-transform`}>
                                    {stage.icon}
                                </div>
                                <h3 className="text-2xl font-extrabold text-slate-900 mb-3">{stage.title}</h3>
                                <p className="text-slate-600 font-bold mb-6 opacity-80">{stage.desc}</p>
                                <button className="btn btn-sm btn-ghost gap-2 font-extrabold text-slate-800">
                                    تصفح الدورات <ArrowBackIcon sx={{ fontSize: 16, transform: isRTL ? 'rotate(180deg)' : 'none' }} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6">
                <div className="max-w-6xl mx-auto rounded-[60px] bg-gradient-to-r from-blue-600 to-indigo-700 p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-300">
                    <div className="relative z-10 flex flex-col items-center">
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6">ابدأ رحلتك التعليمية اليوم</h2>
                        <p className="text-blue-50 max-w-2xl text-xl mb-12">انضم لآلاف الطلاب الناجحين واحصل على تجربة تعليمية استثنائية</p>
                        <Link to={ROUTES.REGISTER} className="btn bg-white text-blue-700 hover:bg-blue-50 px-12 h-20 rounded-2xl text-2xl font-extrabold gap-4 shadow-2xl hover:scale-105 transition-transform">
                            سجل مجاناً الآن
                            <ArrowBackIcon sx={{ fontSize: 24, transform: isRTL ? 'rotate(180deg)' : 'none' }} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 pt-20 pb-10 px-6 text-white" id="contact">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-12 mb-16 border-b border-slate-800 pb-16 items-start text-center md:text-right">
                        <div>
                            <div className="flex items-center gap-3 justify-center md:justify-start mb-6">
                                <VerifiedIcon sx={{ fontSize: 40, color: '#3B82F6' }} />
                                <span className="text-2xl font-extrabold">منصتي التعليمية</span>
                            </div>
                            <p className="text-slate-400 leading-[1.8] max-w-sm">
                                نحن نحول التعليم الرقمي إلى تجربة تفاعلية مليئة بالإبداع والتميز.
                            </p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <h4 className="text-xl font-bold mb-2">روابط سريعة</h4>
                            {['الرئيسية', 'المراحل الدراسية', 'المميزات', 'تواصل معنا'].map(link => (
                                <a key={link} href="#" className="text-slate-400 hover:text-blue-400 transition-colors">{link}</a>
                            ))}
                        </div>

                        <div className="flex flex-col gap-6">
                            <h4 className="text-xl font-bold mb-2">تواصل معنا</h4>
                            <p className="text-slate-400">support@taalim.edu.eg</p>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-slate-500 text-sm font-bold">© 2024 منصتي التعليمية. جميع الحقوق محفوظة.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
