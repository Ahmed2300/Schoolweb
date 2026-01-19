import { useState } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useLanguage } from '../../hooks';
import { useAuthStore } from '../../store';
import { authService } from '../../../data/api/authService';
import { ROUTES } from '../../../shared/constants';
import { LogoutModal } from '../../components/ui';
import { StudentNotificationBell } from '@/components/notifications/StudentNotificationBell';
import { StudentNotificationToast } from '@/components/notifications/StudentNotificationToast';

// Lucide Icons
import {
    Home,
    BookOpen,
    Star,
    Calendar,
    FileQuestion,
    Video,
    User,
    Search,
    LogOut,
    ChevronRight,
    ChevronLeft,
    Package
} from 'lucide-react';

export function StudentLayout() {
    const { isRTL } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout: clearAuthStore } = useAuthStore();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Get user display name
    const displayName = user?.name?.split(' ')[0] || 'طالب';

    const navItems = [
        { id: '', icon: Home, label: 'الرئيسية', path: ROUTES.DASHBOARD },
        { id: '/courses', icon: BookOpen, label: 'الدورات', path: '/dashboard/courses' },
        { id: '/packages', icon: Package, label: 'الباقات', path: '/dashboard/packages' },
        { id: '/schedule', icon: Calendar, label: 'الجدول', path: '/dashboard/schedule' },
        { id: '/quizzes', icon: FileQuestion, label: 'الاختبارات', path: '/dashboard/quizzes' },
        { id: '/live', icon: Video, label: 'جلسات مباشرة', path: '/dashboard/live' },
        { id: '/profile', icon: User, label: 'الملف الشخصي', path: '/dashboard/profile' },
    ];

    // Helper to determine active state
    // We compare pathname. Exact match for root, startsWith for others
    const isActive = (path: string) => {
        if (path === ROUTES.DASHBOARD) {
            return location.pathname === ROUTES.DASHBOARD;
        }
        return location.pathname.startsWith(path);
    };

    // Handle logout with API call
    const handleLogout = async () => {
        try {
            const userType = user?.role === 'parent' ? 'parent' : 'student';
            await authService.logout(userType);
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            clearAuthStore();
            navigate(ROUTES.LOGIN);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex" dir={isRTL ? 'rtl' : 'ltr'}>
            <LogoutModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleLogout}
                userName={displayName}
            />

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 right-0 h-screen bg-white border-l border-slate-200
                    transition-all duration-300 z-50 flex flex-col
                    ${isCollapsed ? 'w-20' : 'w-64'}
                `}
            >
                {/* Logo */}
                <div className="h-20 flex items-center justify-center border-b border-slate-100 px-4">
                    {!isCollapsed ? (
                        <div className="flex items-center gap-2">
                            <img src="/images/subol-red.png" alt="سُبُل" className="w-8 h-8" />
                            <span className="text-2xl font-extrabold text-shibl-crimson">سُبُل</span>
                        </div>
                    ) : (
                        <img src="/images/subol-red.png" alt="سُبُل" className="w-8 h-8" />
                    )}
                </div>

                {/* Collapse Toggle Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute top-6 -left-3 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-shibl-crimson hover:border-shibl-crimson transition-colors shadow-sm"
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>

                {/* Navigation */}
                <nav className="flex-1 py-6 px-3 overflow-y-auto">
                    <ul className="space-y-2">
                        {navItems.map(item => {
                            const IconComponent = item.icon;
                            const active = isActive(item.path);

                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className={`
                                            flex items-center gap-3 px-4 py-3 rounded-[12px]
                                            transition-all duration-200 group
                                            ${active
                                                ? 'bg-shibl-crimson text-white shadow-crimson'
                                                : 'text-slate-500 hover:bg-slate-50 hover:text-shibl-crimson'
                                            }
                                            ${isCollapsed ? 'justify-center' : ''}
                                        `}
                                        title={isCollapsed ? item.label : undefined}
                                    >
                                        <IconComponent
                                            size={20}
                                            className={active ? 'text-white' : 'text-slate-400 group-hover:text-shibl-crimson'}
                                        />
                                        {!isCollapsed && (
                                            <span className="font-semibold text-sm">{item.label}</span>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Logout Button */}
                <div className="p-3 border-t border-slate-100">
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className={`
                            flex items-center gap-3 px-4 py-3 rounded-xl w-full
                            text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200
                            ${isCollapsed ? 'justify-center' : ''}
                        `}
                        title={isCollapsed ? 'تسجيل الخروج' : undefined}
                    >
                        <LogOut size={20} />
                        {!isCollapsed && <span className="font-medium text-sm">تسجيل الخروج</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main
                className={`
                    flex-1 transition-all duration-300
                    ${isCollapsed ? 'mr-20' : 'mr-64'}
                `}
            >
                {/* Header */}
                <header className="h-16 bg-white/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-40">
                    {/* Search Left Aligned (or right depending on direction, but kept consistent) */}
                    <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2 w-full max-w-sm">
                        <Search size={18} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="بحث..."
                            className="bg-transparent border-none outline-none flex-1 text-sm text-charcoal placeholder-slate-400"
                        />
                    </div>

                    {/* Notifications & User Profile */}
                    <div className="flex items-center gap-4">
                        <StudentNotificationBell />

                        {/* User Profile */}
                        <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-shibl-crimson ring-offset-2 flex items-center justify-center bg-gradient-to-br from-shibl-crimson to-shibl-crimson-dark text-white font-bold">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <span>{user?.name?.charAt(0) || 'ط'}</span>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <Outlet />
            </main>

            {/* Student Notification Toast */}
            <StudentNotificationToast />
        </div>
    );
}
