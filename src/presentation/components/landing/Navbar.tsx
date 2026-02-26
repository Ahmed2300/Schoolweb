import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../hooks';
import { ROUTES } from '../../../shared/constants';
import { Menu, X, LogIn, UserPlus, Home, Layers, Star, Phone, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '../common/ThemeToggle';

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
                    const settingsMap: Record<string, string> = {};
                    data.forEach((s: { key: string; value: string }) => { settingsMap[s.key] = s.value; });
                    if (settingsMap.logo_path) setLogoPath(settingsMap.logo_path);
                    if (settingsMap.platform_name) setPlatformName(settingsMap.platform_name);
                }
            } catch (error) {
                console.error("Failed to fetch settings navbar", error);
            }
        };
        fetchSettings();
    }, []);

    const toggleMobileMenu = useCallback(() => {
        setIsMobileMenuOpen(prev => !prev);
    }, []);

    const closeMobileMenu = useCallback(() => {
        setIsMobileMenuOpen(false);
    }, []);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMobileMenuOpen]);

    const isHome = location.pathname === ROUTES.HOME || location.pathname === '/';

    const navLinks = [
        { name: 'الرئيسية', href: ROUTES.HOME, icon: Home, active: isHome },
        { name: 'المراحل الدراسية', href: isHome ? '#stages' : '/#stages', icon: Layers },
        { name: 'المميزات', href: ROUTES.FEATURES ?? '/#features', icon: Star, active: location.pathname === ROUTES.FEATURES },
        { name: 'تواصل معنا', href: ROUTES.CONTACT ?? '/#contact', icon: Phone, active: location.pathname === ROUTES.CONTACT },
    ];

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-[1000] bg-white/90 dark:bg-charcoal/90 backdrop-blur-md border-b border-slate-200 dark:border-white/10" dir={isRTL ? 'rtl' : 'ltr'}>
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
                        <span className="text-xl sm:text-2xl font-extrabold text-charcoal dark:text-white hidden sm:block">{platformName}</span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            link.href.startsWith('#') || link.href.startsWith('/#') ? (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="text-slate-600 dark:text-slate-300 hover:text-shibl-crimson dark:hover:text-shibl-crimson font-medium transition-colors text-sm lg:text-base relative group"
                                >
                                    {link.name}
                                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-shibl-crimson scale-x-0 group-hover:scale-x-100 transition-transform origin-right" />
                                </a>
                            ) : (
                                <Link
                                    key={link.name}
                                    to={link.href}
                                    className={`text-sm lg:text-base font-medium transition-colors relative group ${link.active ? 'text-shibl-crimson font-bold' : 'text-slate-600 dark:text-slate-300 hover:text-shibl-crimson dark:hover:text-shibl-crimson'
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
                        <ThemeToggle />
                        <Link
                            to={ROUTES.LOGIN}
                            className="text-slate-700 dark:text-slate-200 hover:text-shibl-crimson dark:hover:text-shibl-crimson font-bold text-sm transition-colors flex items-center gap-2"
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

                    {/* Mobile Buttons — Theme Toggle + Hamburger */}
                    <div className="md:hidden flex items-center gap-2">
                        <ThemeToggle />
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleMobileMenu();
                            }}
                            className="relative z-[1001] p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors"
                            aria-label="فتح القائمة"
                            aria-expanded={isMobileMenuOpen}
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                {isMobileMenuOpen ? (
                                    <motion.div
                                        key="close"
                                        initial={{ rotate: -90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: 90, opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        <X size={26} />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="menu"
                                        initial={{ rotate: 90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: -90, opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        <Menu size={26} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    </div>
                </nav>
            </header>

            {/* ─── Mobile Side Sheet Menu ─── */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={closeMobileMenu}
                            className="fixed inset-0 z-[1100] bg-black/40 backdrop-blur-sm md:hidden"
                        />

                        {/* Side Panel — slides from the right for RTL */}
                        <motion.aside
                            initial={{ x: isRTL ? '-100%' : '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: isRTL ? '-100%' : '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                            className={`fixed top-0 ${isRTL ? 'left-0' : 'right-0'} z-[1200] w-[280px] h-full bg-white dark:bg-charcoal shadow-2xl md:hidden flex flex-col`}
                            dir={isRTL ? 'rtl' : 'ltr'}
                        >
                            {/* Side Panel Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/10">
                                <div className="flex items-center gap-2">
                                    {logoPath ? (
                                        <img src={logoPath} alt={platformName} className="w-9 h-9 object-contain" />
                                    ) : (
                                        <img src="/images/subol-red.png" alt="سُبُل" className="w-9 h-9 object-contain" />
                                    )}
                                    <span className="text-lg font-extrabold text-charcoal dark:text-white">{platformName}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={closeMobileMenu}
                                    className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                                    aria-label="إغلاق القائمة"
                                >
                                    <X size={22} />
                                </button>
                            </div>

                            {/* Navigation Links */}
                            <nav className="flex-1 overflow-y-auto px-3 py-4">
                                <ul className="space-y-1">
                                    {navLinks.map((link) => {
                                        const Icon = link.icon;
                                        const isActive = link.active;
                                        const isAnchor = link.href.startsWith('#') || link.href.startsWith('/#');

                                        const linkClasses = `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200
                                            ${isActive
                                                ? 'bg-red-50 dark:bg-shibl-crimson/10 text-shibl-crimson'
                                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-shibl-crimson dark:hover:text-shibl-crimson'
                                            }`;

                                        return (
                                            <li key={link.name}>
                                                {isAnchor ? (
                                                    <a href={link.href} onClick={closeMobileMenu} className={linkClasses}>
                                                        <Icon size={20} className={isActive ? 'text-shibl-crimson' : 'text-slate-400 dark:text-slate-500'} />
                                                        {link.name}
                                                        {isActive && <span className="ms-auto w-1.5 h-1.5 rounded-full bg-shibl-crimson" />}
                                                    </a>
                                                ) : (
                                                    <Link to={link.href} onClick={closeMobileMenu} className={linkClasses}>
                                                        <Icon size={20} className={isActive ? 'text-shibl-crimson' : 'text-slate-400 dark:text-slate-500'} />
                                                        {link.name}
                                                        {isActive && <span className="ms-auto w-1.5 h-1.5 rounded-full bg-shibl-crimson" />}
                                                    </Link>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>

                                {/* Admin Link */}
                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10">
                                    <Link
                                        to={ROUTES.ADMIN_LOGIN}
                                        onClick={closeMobileMenu}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-shibl-crimson dark:hover:text-shibl-crimson transition-all duration-200"
                                    >
                                        <ShieldCheck size={20} className="text-slate-400 dark:text-slate-500" />
                                        لوحة الإدارة
                                    </Link>
                                </div>
                            </nav>

                            {/* Bottom Auth Buttons */}
                            <div className="p-4 border-t border-slate-100 dark:border-white/10 space-y-3">
                                <Link
                                    to={ROUTES.LOGIN}
                                    onClick={closeMobileMenu}
                                    className="w-full h-12 flex items-center justify-center gap-2 text-slate-700 dark:text-slate-200 font-bold border border-slate-200 dark:border-white/15 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
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
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
