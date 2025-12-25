import { useState } from 'react';
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
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

export function LandingPage() {
    const { isRTL, language, toggleLanguage } = useLanguage();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <div className="min-h-screen bg-slate-50 overflow-x-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Navigation */}
            <header className="fixed top-0 left-0 right-0 z-[1000] bg-white/90 backdrop-blur-md border-b border-slate-200">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <VerifiedIcon sx={{ fontSize: { xs: 24, sm: 32 }, color: '#3B82F6' }} />
                        <span className="text-base sm:text-xl font-extrabold text-slate-900 whitespace-nowrap">منصتي التعليمية</span>
                    </div>

                    {/* Desktop Navigation */}
                    <ul className="hidden lg:flex items-center gap-6 xl:gap-8 font-bold text-slate-600">
                        <li><a href="#home" className="text-blue-600 border-b-2 border-blue-600 pb-1">الرئيسية</a></li>
                        <li><a href="#stages" className="hover:text-blue-600 transition-colors">المراحل الدراسية</a></li>
                        <li><a href="#features" className="hover:text-blue-600 transition-colors">المميزات</a></li>
                        <li><a href="#contact" className="hover:text-blue-600 transition-colors">تواصل معنا</a></li>
                    </ul>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-2 lg:gap-3">
                        <button
                            className="btn-secondary-pro flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 shadow-sm text-sm lg:text-base"
                            onClick={toggleLanguage}
                        >
                            <LanguageIcon sx={{ fontSize: { xs: 16, lg: 18 } }} />
                            <span>{language === 'ar' ? 'EN' : 'عربي'}</span>
                        </button>
                        <Link to={ROUTES.LOGIN} className="btn-secondary-pro flex items-center gap-1.5 lg:gap-2 px-4 lg:px-6 text-sm lg:text-base">
                            <LoginIcon sx={{ fontSize: { xs: 16, lg: 18 } }} />
                            <span className="hidden sm:inline">تسجيل الدخول</span>
                        </Link>
                        <Link to={ROUTES.REGISTER} className="btn-primary-pro flex items-center gap-1.5 lg:gap-2 px-4 lg:px-6 text-sm lg:text-base">
                            <PersonAddIcon sx={{ fontSize: { xs: 16, lg: 18 } }} />
                            <span className="hidden xl:inline">إنشاء حساب جديد</span>
                            <span className="xl:hidden">حساب جديد</span>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden items-center gap-2">
                        <button
                            className="btn-secondary-pro flex items-center gap-1 px-2 py-2 shadow-sm text-xs"
                            onClick={toggleLanguage}
                        >
                            <LanguageIcon sx={{ fontSize: 16 }} />
                            <span>{language === 'ar' ? 'EN' : 'ع'}</span>
                        </button>
                        <button
                            className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                            onClick={toggleMobileMenu}
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? (
                                <CloseIcon sx={{ fontSize: 28, color: '#1e293b' }} />
                            ) : (
                                <MenuIcon sx={{ fontSize: 28, color: '#1e293b' }} />
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
                        <ul className="flex flex-col gap-3 font-bold text-slate-600">
                            <li><a href="#home" onClick={closeMobileMenu} className="block py-3 px-4 rounded-xl hover:bg-blue-50 text-blue-600">الرئيسية</a></li>
                            <li><a href="#stages" onClick={closeMobileMenu} className="block py-3 px-4 rounded-xl hover:bg-slate-100 transition-colors">المراحل الدراسية</a></li>
                            <li><a href="#features" onClick={closeMobileMenu} className="block py-3 px-4 rounded-xl hover:bg-slate-100 transition-colors">المميزات</a></li>
                            <li><a href="#contact" onClick={closeMobileMenu} className="block py-3 px-4 rounded-xl hover:bg-slate-100 transition-colors">تواصل معنا</a></li>
                        </ul>
                        <div className="border-t border-slate-200 pt-4 flex flex-col gap-3">
                            <Link to={ROUTES.LOGIN} onClick={closeMobileMenu} className="btn-secondary-pro w-full flex items-center justify-center gap-2 py-3">
                                <LoginIcon sx={{ fontSize: 18 }} />
                                تسجيل الدخول
                            </Link>
                            <Link to={ROUTES.REGISTER} onClick={closeMobileMenu} className="btn-primary-pro w-full flex items-center justify-center gap-2 py-3">
                                <PersonAddIcon sx={{ fontSize: 18 }} />
                                إنشاء حساب جديد
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[auto] lg:min-h-[90vh]" id="home">
                {/* Text Content */}
                <div className="flex flex-col items-center lg:items-start text-center lg:text-right order-2 lg:order-1">
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm mb-4 sm:mb-6 md:mb-8">
                        <CheckCircleIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                        <span>المنصة التعليمية الأولى في المنطقة</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-slate-900 leading-[1.2] mb-4 sm:mb-6">
                        <span className="block">مستقبلك</span>
                        <span className="text-blue-600 block my-1 sm:my-2">التعليمي</span>
                        <span className="text-indigo-600 block">يبدأ من هنا</span>
                    </h1>

                    <p className="text-sm sm:text-base md:text-lg text-slate-500 max-w-lg leading-relaxed mb-6 sm:mb-8 md:mb-10 px-2 sm:px-0">
                        منصة متكاملة تجمع بين الفصول التفاعلية، المتابعة الدقيقة،
                        والمحتوى المتميز لتضمن لك أفضل تجربة تعليمية.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto mb-8 sm:mb-10 md:mb-12 px-2 sm:px-0">
                        <Link to={ROUTES.REGISTER} className="btn-primary-pro btn-lg h-12 sm:h-14 md:h-16 px-6 sm:px-8 text-base sm:text-lg md:text-xl shadow-xl shadow-blue-200 hover:shadow-blue-300 justify-center">
                            <span>ابدأ رحلتك الآن</span>
                            <ArrowBackIcon sx={{ fontSize: { xs: 18, sm: 20, md: 24 }, transform: isRTL ? 'rotate(180deg)' : 'none' }} />
                        </Link>
                        <button className="btn-secondary-pro btn-lg h-12 sm:h-14 md:h-16 px-4 sm:px-6 md:px-8 text-sm sm:text-base md:text-lg text-slate-600 hover:text-blue-600 justify-center">
                            <span className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                                <PlayArrowIcon sx={{ fontSize: { xs: 18, sm: 20, md: 24 } }} />
                            </span>
                            <span className="whitespace-nowrap">شاهد الفيديو التعريفي</span>
                        </button>
                    </div>

                    <div className="flex flex-col items-center lg:items-start gap-2 sm:gap-3">
                        <p className="text-slate-500 font-medium text-sm sm:text-base">
                            يثق بنا أكثر من <strong className="text-blue-600 font-extrabold">10,000</strong> طالب وطالبة
                        </p>
                        <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                            {['أكاديمية', 'جامعة', 'تعليم'].map(tag => (
                                <span key={tag} className="px-3 sm:px-4 md:px-5 py-1 sm:py-1.5 bg-white border border-slate-200 rounded-full text-xs sm:text-sm font-bold text-slate-600 shadow-sm">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Visual Content */}
                <div className="relative flex justify-center items-center h-[280px] sm:h-[350px] md:h-[400px] lg:h-[500px] order-1 lg:order-2">
                    <div className="relative w-[220px] sm:w-[280px] md:w-[340px] lg:w-[400px] h-[220px] sm:h-[280px] md:h-[340px] lg:h-[400px] bg-gradient-to-br from-blue-100/50 to-indigo-100/50 rounded-full flex items-center justify-center p-4 sm:p-6 md:p-8">
                        {/* Main Image */}
                        <img
                            src="/images/hero-student.png"
                            alt="Student studying"
                            className="w-full h-full object-contain drop-shadow-2xl z-0"
                        />
                    </div>

                    {/* Floating Card - Top Right */}
                    <div className="absolute -top-2 sm:top-0 right-0 sm:right-4 md:right-0 floating-card-success p-2 sm:p-3 md:p-4 flex items-center gap-2 sm:gap-3 animate-float z-10 scale-75 sm:scale-90 md:scale-100 origin-top-right">
                        <div className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                            <CheckCircleIcon sx={{ fontSize: { xs: 18, sm: 22, md: 28 }, color: '#FFFFFF' }} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] sm:text-xs text-white/80 font-bold uppercase tracking-wider">النتيجة</span>
                            <span className="text-white font-extrabold text-sm sm:text-base md:text-lg">A+ ممتاز</span>
                        </div>
                    </div>

                    {/* Floating Card - Bottom Left */}
                    <div className="absolute -bottom-2 sm:bottom-0 left-0 sm:left-4 md:left-0 floating-card-amber p-2 sm:p-3 md:p-5 flex items-center gap-2 sm:gap-3 md:gap-4 animate-float animation-delay-3000 z-10 scale-75 sm:scale-90 md:scale-100 origin-bottom-left">
                        <div className="w-10 sm:w-12 md:w-14 h-10 sm:h-12 md:h-14 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                            <EmojiEventsIcon sx={{ fontSize: { xs: 22, sm: 26, md: 32 }, color: '#FFFFFF' }} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-extrabold text-sm sm:text-base md:text-lg">إنجاز جديد!</span>
                            <span className="text-white/80 text-xs sm:text-sm">تم إكمال دورة الفيزياء</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 bg-white" id="features">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-8 sm:mb-12 md:mb-16 flex flex-col items-center">
                        <span className="px-3 sm:px-4 py-1 sm:py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs sm:text-sm font-extrabold mb-3 sm:mb-4 uppercase tracking-widest">المميزات</span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 sm:mb-3 md:mb-4">لماذا تختار منصتنا؟</h2>
                        <p className="text-slate-500 max-w-2xl text-sm sm:text-base md:text-lg px-4">نقدم لك تجربة تعليمية فريدة ومتكاملة</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                        {[
                            { icon: <VideoLibraryIcon sx={{ fontSize: { xs: 28, sm: 32, md: 36 } }} />, title: 'محتوى فيديو متميز', desc: 'دروس مسجلة بأعلى جودة مع إمكانية المشاهدة في أي وقت', color: 'text-blue-500' },
                            { icon: <LiveTvIcon sx={{ fontSize: { xs: 28, sm: 32, md: 36 } }} />, title: 'حصص مباشرة تفاعلية', desc: 'تواصل مباشر مع المعلمين عبر Zoom وBigBlueButton', color: 'text-indigo-500' },
                            { icon: <QuizIcon sx={{ fontSize: { xs: 28, sm: 32, md: 36 } }} />, title: 'اختبارات ذكية', desc: 'اختبارات MCQ مع تصحيح تلقائي وتقييم فوري', color: 'text-purple-500' },
                            { icon: <InsightsIcon sx={{ fontSize: { xs: 28, sm: 32, md: 36 } }} />, title: 'متابعة دقيقة', desc: 'تقارير مفصلة لأولياء الأمور عن تقدم الأبناء', color: 'text-cyan-500' },
                        ].map((feature, idx) => (
                            <div key={idx} className="bg-slate-50 border border-slate-100 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl group hover:border-blue-500 hover:bg-white transition-all cursor-default">
                                <div className={`${feature.color} mb-4 sm:mb-5 md:mb-6 bg-white w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 mb-2 sm:mb-3">{feature.title}</h3>
                                <p className="text-slate-500 leading-relaxed text-sm sm:text-base">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stages Section */}
            <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6" id="stages">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-8 sm:mb-12 md:mb-16 flex flex-col items-center">
                        <span className="px-3 sm:px-4 py-1 sm:py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs sm:text-sm font-extrabold mb-3 sm:mb-4 uppercase tracking-widest">المراحل الدراسية</span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 sm:mb-3 md:mb-4">محتوى تعليمي شامل</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                        {[
                            { icon: <BackpackIcon sx={{ fontSize: { xs: 36, sm: 42, md: 48 } }} />, title: 'المرحلة الابتدائية', desc: 'تأسيس قوي للمهارات الأساسية', color: 'from-blue-50 to-indigo-50', iconColor: 'text-blue-500' },
                            { icon: <MenuBookIcon sx={{ fontSize: { xs: 36, sm: 42, md: 48 } }} />, title: 'المرحلة الإعدادية', desc: 'تطوير المفاهيم والمهارات', color: 'from-indigo-50 to-purple-50', iconColor: 'text-indigo-500' },
                            { icon: <SchoolIcon sx={{ fontSize: { xs: 36, sm: 42, md: 48 } }} />, title: 'المرحلة الثانوية', desc: 'تحضير شامل للجامعة', color: 'from-purple-50 to-pink-50', iconColor: 'text-purple-500' },
                            { icon: <AccountBalanceIcon sx={{ fontSize: { xs: 36, sm: 42, md: 48 } }} />, title: 'المرحلة الجامعية', desc: 'دورات متخصصة ومتقدمة', color: 'from-amber-50 to-orange-50', iconColor: 'text-amber-500' },
                        ].map((stage, idx) => (
                            <div key={idx} className={`p-5 sm:p-6 md:p-8 rounded-3xl sm:rounded-[32px] md:rounded-[40px] bg-gradient-to-br ${stage.color} border border-white flex flex-col items-center text-center group hover:-translate-y-2 transition-transform shadow-sm`}>
                                <div className={`${stage.iconColor} mb-4 sm:mb-6 md:mb-8 group-hover:scale-110 transition-transform`}>
                                    {stage.icon}
                                </div>
                                <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-slate-900 mb-2 sm:mb-3">{stage.title}</h3>
                                <p className="text-slate-600 font-bold mb-4 sm:mb-5 md:mb-6 opacity-80 text-sm sm:text-base">{stage.desc}</p>
                                <button className="btn btn-sm btn-ghost gap-1.5 sm:gap-2 font-extrabold text-slate-800 text-sm sm:text-base">
                                    تصفح الدورات <ArrowBackIcon sx={{ fontSize: { xs: 14, sm: 16 }, transform: isRTL ? 'rotate(180deg)' : 'none' }} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto rounded-3xl sm:rounded-[40px] md:rounded-[50px] lg:rounded-[60px] bg-gradient-to-r from-blue-600 to-indigo-700 p-6 sm:p-8 md:p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-300">
                    <div className="relative z-10 flex flex-col items-center">
                        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-white mb-3 sm:mb-4 md:mb-6 px-2">ابدأ رحلتك التعليمية اليوم</h2>
                        <p className="text-blue-50 max-w-2xl text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 md:mb-10 lg:mb-12 px-4">انضم لآلاف الطلاب الناجحين واحصل على تجربة تعليمية استثنائية</p>
                        <Link to={ROUTES.REGISTER} className="btn bg-white text-blue-700 hover:bg-blue-50 px-6 sm:px-8 md:px-10 lg:px-12 h-12 sm:h-14 md:h-16 lg:h-20 rounded-xl sm:rounded-2xl text-base sm:text-lg md:text-xl lg:text-2xl font-extrabold gap-2 sm:gap-3 md:gap-4 shadow-2xl hover:scale-105 transition-transform">
                            سجل مجاناً الآن
                            <ArrowBackIcon sx={{ fontSize: { xs: 18, sm: 20, md: 22, lg: 24 }, transform: isRTL ? 'rotate(180deg)' : 'none' }} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 pt-10 sm:pt-14 md:pt-16 lg:pt-20 pb-6 sm:pb-8 md:pb-10 px-4 sm:px-6 text-white" id="contact">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10 md:gap-12 mb-8 sm:mb-12 md:mb-16 border-b border-slate-800 pb-8 sm:pb-12 md:pb-16 items-start text-center sm:text-right">
                        <div className="sm:col-span-2 md:col-span-1">
                            <div className="flex items-center gap-2 sm:gap-3 justify-center sm:justify-start mb-4 sm:mb-6">
                                <VerifiedIcon sx={{ fontSize: { xs: 32, sm: 36, md: 40 }, color: '#3B82F6' }} />
                                <span className="text-xl sm:text-2xl font-extrabold">منصتي التعليمية</span>
                            </div>
                            <p className="text-slate-400 leading-[1.8] max-w-sm mx-auto sm:mx-0 text-sm sm:text-base">
                                نحن نحول التعليم الرقمي إلى تجربة تفاعلية مليئة بالإبداع والتميز.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:gap-4">
                            <h4 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">روابط سريعة</h4>
                            {['الرئيسية', 'المراحل الدراسية', 'المميزات', 'تواصل معنا'].map(link => (
                                <a key={link} href="#" className="text-slate-400 hover:text-blue-400 transition-colors text-sm sm:text-base">{link}</a>
                            ))}
                        </div>

                        <div className="flex flex-col gap-4 sm:gap-6">
                            <h4 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">تواصل معنا</h4>
                            <p className="text-slate-400 text-sm sm:text-base">support@taalim.edu.eg</p>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-slate-500 text-xs sm:text-sm font-bold">© 2024 منصتي التعليمية. جميع الحقوق محفوظة.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
