import { useState, useEffect, Suspense } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useLanguage } from '../../hooks';
import { useAuthStore } from '../../store';
import { authService } from '../../../data/api/authService';
import { ROUTES } from '../../../shared/constants';
import { LogoutModal } from '../../components/ui';
import { Footer } from '../../components/common/Footer';
import { FloatingSupportButton } from '../../components/common/FloatingSupportButton';

// Lucide Icons
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    ChevronRight,
    ChevronLeft,
    Search,
    Menu,
    X
} from 'lucide-react';

export function ParentLayout() {
    const { isRTL } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout: clearAuthStore } = useAuthStore();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const displayName = user?.name?.split(' ')[0] || 'ولي الأمر';
    const userInitials = user?.name?.charAt(0) || 'P';

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    // Parent Specific Navigation
    const navItems = [
        { id: 'home', icon: LayoutDashboard, label: 'نظرة عامة', path: '/parent' },
        { id: 'children', icon: Users, label: 'أبنائي', path: '/parent/children' },
        { id: 'settings', icon: Settings, label: 'الإعدادات', path: '/parent/settings' },
    ];

    const isActive = (path: string) => {
        if (path === '/parent') {
            return location.pathname === '/parent';
        }
        return location.pathname.startsWith(path);
    };

    const handleLogout = async () => {
        try {
            await authService.logout('parent');
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            clearAuthStore();
            navigate(ROUTES.LOGIN);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col md:flex-row" dir={isRTL ? 'rtl' : 'ltr'}>
            <LogoutModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleLogout}
                userName={displayName}
            />

            {/* Mobile Header (Visible only on small screens) */}
            <header className="md:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-40">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 -mr-2 text-slate-500 hover:text-shibl-crimson hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                    <div className="flex items-center gap-2">
                        <img src="/images/subol-red.png" alt="سُبُل" className="w-8 h-8" />
                        <span className="text-xl font-extrabold text-shibl-crimson">سُبُل</span>
                    </div>
                </div>
                <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-shibl-crimson/20 flex items-center justify-center bg-gradient-to-br from-shibl-crimson to-shibl-crimson-dark text-white font-bold text-sm">
                    {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                        <span>{userInitials}</span>
                    )}
                </div>
            </header>

            {/* Mobile Overlay Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 transition-all duration-300 z-50 flex flex-col h-screen bg-white border-l border-slate-200 shadow-xl lg:shadow-none
                    ${isRTL ? 'right-0 border-l' : 'left-0 border-r'}
                    ${isCollapsed ? 'md:w-20' : 'md:w-64'}
                    w-64 
                    ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : (isRTL ? 'translate-x-full md:translate-x-0 shadow-none' : '-translate-x-full md:translate-x-0 shadow-none')}
                `}
            >
                {/* Logo (Desktop) / Close (Mobile) */}
                <div className={`
                    h-20 flex items-center border-b border-slate-100 transition-all duration-300 relative
                    ${isCollapsed ? 'md:pl-[24px] md:pr-0 px-4' : 'px-4 justify-between'}
                `}>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`
                            md:hidden absolute top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-red-500
                            ${isRTL ? 'left-4' : 'right-4'}
                        `}
                    >
                        <X size={20} />
                    </button>

                    <div className={`flex items-center gap-2 overflow-hidden transition-all duration-500 ease-in-out ${isCollapsed ? 'md:max-w-0 md:opacity-0 max-w-[200px] opacity-100' : 'max-w-[200px] opacity-100'}`}>
                        <img src="/images/subol-red.png" alt="سُبُل" className="w-8 h-8" />
                        <span className="text-xl font-extrabold text-shibl-crimson whitespace-nowrap">سُبُل</span>
                    </div>
                    <div className={`${isCollapsed ? 'md:block opacity-100 hidden' : 'hidden opacity-0'} transition-all duration-500`}>
                        <img src="/images/subol-red.png" alt="سُبُل" className="w-8 h-8" />
                    </div>
                </div>

                {/* Desktop Collapse Toggle */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`
                        hidden md:flex absolute top-6 w-6 h-6 bg-white border border-slate-200 rounded-full items-center justify-center text-slate-400 hover:text-shibl-crimson hover:border-shibl-crimson transition-colors shadow-sm z-50
                        ${isRTL ? '-left-3' : '-right-3'}
                    `}
                >
                    {isRTL
                        ? (isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />)
                        : (isCollapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />)
                    }
                </button>

                {/* Navigation */}
                <nav className="flex-1 py-6 px-3 overflow-y-auto overflow-x-hidden">
                    <ul className="space-y-2">
                        {navItems.map(item => {
                            const IconComponent = item.icon;
                            const active = isActive(item.path);

                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className={`
                                            flex items-center px-4 py-3 rounded-[12px]
                                            transition-all duration-300 group relative overflow-hidden
                                            ${active
                                                ? 'bg-shibl-crimson text-white shadow-crimson'
                                                : 'text-slate-500 hover:bg-slate-50 hover:text-shibl-crimson'
                                            }
                                            ${isCollapsed ? 'md:pl-[30px] md:pr-0' : 'px-4'}
                                        `}
                                        title={isCollapsed ? item.label : undefined}
                                    >
                                        <IconComponent
                                            size={20}
                                            className={`shrink-0 transition-colors ${active ? 'text-white' : 'text-slate-400 group-hover:text-shibl-crimson'}`}
                                        />
                                        <div className={`overflow-hidden whitespace-nowrap transition-all duration-500 ease-in-out ${isCollapsed ? 'md:max-w-0 md:opacity-0 max-w-[200px] opacity-100 ml-3' : 'max-w-[200px] opacity-100 ml-3'}`}>
                                            <span className="font-semibold text-sm block">
                                                {item.label}
                                            </span>
                                        </div>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Logout */}
                <div className="p-3 border-t border-slate-100">
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className={`
                            flex items-center px-4 py-3 rounded-xl w-full
                            text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 overflow-hidden
                            ${isCollapsed ? 'md:pl-[30px] md:pr-0' : 'px-4'}
                        `}
                        title={isCollapsed ? 'تسجيل الخروج' : undefined}
                    >
                        <LogOut size={20} className="shrink-0" />
                        <div className={`overflow-hidden whitespace-nowrap transition-all duration-500 ease-in-out ${isCollapsed ? 'md:max-w-0 md:opacity-0 max-w-[200px] opacity-100 ml-3' : 'max-w-[200px] opacity-100 ml-3'}`}>
                            <span className="font-medium text-sm block">
                                تسجيل الخروج
                            </span>
                        </div>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main
                className={`
                    flex-1 transition-all duration-300 min-h-screen flex flex-col
                    ${isRTL
                        ? (isCollapsed ? 'md:mr-20' : 'md:mr-64')
                        : (isCollapsed ? 'md:ml-20' : 'md:ml-64')
                    }
                `}
            >
                {/* Desktop Header */}
                <header className="hidden md:flex h-16 bg-white/80 backdrop-blur-sm items-center justify-between px-6 sticky top-0 z-40 border-b border-slate-100">
                    <div className="flex-1"></div>

                    <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-shibl-crimson ring-offset-2 flex items-center justify-center bg-gradient-to-br from-shibl-crimson to-shibl-crimson-dark text-white font-bold">
                        {user?.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <span>{userInitials}</span>
                        )}
                    </div>
                </header>

                {/* Page Content */}
                <div className="w-full flex-1">
                    <Suspense fallback={
                        <div className="animate-pulse space-y-6 p-6">
                            <div className="h-8 bg-slate-200 rounded-lg w-1/3" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[1, 2].map(i => (
                                    <div key={i} className="h-40 bg-white border border-slate-100 rounded-2xl shadow-sm" />
                                ))}
                            </div>
                            <div className="h-64 bg-white border border-slate-100 rounded-2xl shadow-sm" />
                        </div>
                    }>
                        <Outlet />
                    </Suspense>
                </div>
                <Footer />
            </main>

            <FloatingSupportButton />
        </div>
    );
}

