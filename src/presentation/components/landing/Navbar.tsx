import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../hooks';
import { ROUTES } from '../../../shared/constants';
import { Menu, X, LogIn, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

export function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isRTL } = useLanguage();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [logoPath, setLogoPath] = useState<string>('');
    const [platformName, setPlatformName] = useState<string>('سُبُل');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { commonService } = await import('../../../data/api/commonService');
                const data = await commonService.getSettings();
                if (data && Array.isArray(data)) {
                    const settingsMap: any = {};
                    data.forEach((s: any) => { settingsMap[s.key] = s.value; });
                    if (settingsMap.logo_path) setLogoPath(settingsMap.logo_path);
                    if (settingsMap.platform_name) setPlatformName(settingsMap.platform_name);
                }
            } catch (error) {
                console.error("Failed to fetch settings navbar", error);
            }
        };
        fetchSettings();
    }, []);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const isHome = location.pathname === ROUTES.HOME;

    const navLinks = [
        { name: 'الرئيسية', href: ROUTES.HOME },
        { name: 'المراحل الدراسية', href: isHome ? '#stages' : '/#stages' },
        { name: 'المميزات', href: ROUTES.FEATURES, active: location.pathname === ROUTES.FEATURES },
        { name: 'تواصل معنا', href: ROUTES.CONTACT, active: location.pathname === ROUTES.CONTACT },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-[1000] bg-white/90 backdrop-blur-md border-b border-slate-200" dir={isRTL ? 'rtl' : 'ltr'}>
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
                {/* Logo */}
                <div
                    className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none transition-opacity hover:opacity-80"
                    onDoubleClick={() => navigate(ROUTES.ADMIN_LOGIN)}
                    onClick={() => navigate(ROUTES.HOME)}
                >
                    {logoPath ? (
                        <img src={logoPath} alt={platformName} className="w-[85px] h-[85px] sm:w-[50px] sm:h-[50px] object-contain" />
                    ) : (
                        <img src="/images/subol-red.png" alt="سُبُل" className="w-[85px] h-[85px] sm:w-[50px] sm:h-[50px] object-contain" />
                    )}
                    <span className="text-xl sm:text-2xl font-extrabold text-charcoal hidden sm:block">{platformName}</span>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        link.href.startsWith('#') || link.href.startsWith('/#') ? (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-slate-600 hover:text-shibl-crimson font-medium transition-colors text-sm lg:text-base relative group"
                            >
                                {link.name}
                                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-shibl-crimson scale-x-0 group-hover:scale-x-100 transition-transform origin-right" />
                            </a>
                        ) : (
                            <Link
                                key={link.name}
                                to={link.href}
                                className={`text-sm lg:text-base font-medium transition-colors relative group ${link.active ? 'text-shibl-crimson font-bold' : 'text-slate-600 hover:text-shibl-crimson'
                                    }`}
                            >
                                {link.name}
                                {link.active && <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-shibl-crimson scale-x-100 transition-transform origin-right" />}
                                {!link.active && <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-shibl-crimson scale-x-0 group-hover:scale-x-100 transition-transform origin-right" />}
                            </Link>
                        )
                    ))}
                </div>

                {/* Desktop Buttons */}
                <div className="hidden md:flex items-center gap-4">
                    <Link
                        to={ROUTES.LOGIN}
                        className="text-slate-700 hover:text-shibl-crimson font-bold text-sm transition-colors flex items-center gap-2"
                    >
                        <LogIn size={18} />
                        تسجيل الدخول
                    </Link>
                    <Link
                        to={ROUTES.REGISTER}
                        className="bg-shibl-crimson hover:bg-red-700 text-white px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg shadow-shibl-crimson/20 hover:shadow-shibl-crimson/40 flex items-center gap-2"
                    >
                        <UserPlus size={18} />
                        حساب جديد
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={toggleMobileMenu}
                    className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-slate-100 overflow-hidden"
                    >
                        <div className="p-4 space-y-4">
                            {navLinks.map((link) => (
                                link.href.startsWith('#') || link.href.startsWith('/#') ? (
                                    <a
                                        key={link.name}
                                        href={link.href}
                                        onClick={closeMobileMenu}
                                        className="block text-slate-600 hover:text-shibl-crimson font-medium py-2 px-4 rounded-lg hover:bg-slate-50"
                                    >
                                        {link.name}
                                    </a>
                                ) : (
                                    <Link
                                        key={link.name}
                                        to={link.href}
                                        onClick={closeMobileMenu}
                                        className={`block font-medium py-2 px-4 rounded-lg hover:bg-slate-50 ${link.active ? 'text-shibl-crimson bg-red-50' : 'text-slate-600 hover:text-shibl-crimson'
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                )
                            ))}
                            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                                <Link
                                    to={ROUTES.LOGIN}
                                    onClick={closeMobileMenu}
                                    className="w-full h-12 flex items-center justify-center gap-2 text-slate-700 font-bold border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    <LogIn size={20} />
                                    تسجيل الدخول
                                </Link>
                                <Link
                                    to={ROUTES.REGISTER}
                                    onClick={closeMobileMenu}
                                    className="w-full h-12 flex items-center justify-center gap-2 bg-shibl-crimson text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-shibl-crimson/20"
                                >
                                    <UserPlus size={20} />
                                    إنشاء حساب جديد
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
