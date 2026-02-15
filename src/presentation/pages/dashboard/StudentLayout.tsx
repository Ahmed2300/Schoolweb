import { useState, useEffect } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useLanguage } from '../../hooks';
import { useAuthStore } from '../../store';
import { authService } from '../../../data/api/authService';
import { studentService } from '../../../data/api';
import { ROUTES } from '../../../shared/constants';
import { LogoutModal } from '../../components/ui';
import { StudentNotificationBell } from '@/components/notifications/StudentNotificationBell';
import { StudentNotificationToast } from '@/components/notifications/StudentNotificationToast';
import { Footer } from '../../components/common/Footer';

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
    Package,
    Users
} from 'lucide-react';

export function StudentLayout() {
    const { isRTL } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout: clearAuthStore } = useAuthStore();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

    // Fetch pending parent requests count
    useEffect(() => {
        const fetchPendingRequests = async () => {
            try {
                const requests = await studentService.getPendingParentRequests();
                setPendingRequestsCount(requests.length);
            } catch (error) {
                console.error('Failed to fetch pending requests:', error);
            }
        };

        if (user) {
            fetchPendingRequests();
        }

        // Listen for real-time notifications to update badge
        const handleNotification = (event: CustomEvent<any>) => {
            if (event.detail?.type === 'parent_link_request') {
                fetchPendingRequests();
            }
        };

        window.addEventListener('student-notification' as any, handleNotification);

        return () => {
            window.removeEventListener('student-notification' as any, handleNotification);
        };
    }, [user]);

    // Get user display name
    const displayName = user?.name?.split(' ')[0] || 'طالب';

    const navItems = [
        { id: '', icon: Home, label: 'الرئيسية', path: ROUTES.DASHBOARD },
        { id: '/courses', icon: BookOpen, label: 'الدورات', path: '/dashboard/courses' },
        { id: '/packages', icon: Package, label: 'الباقات', path: '/dashboard/packages' },
        { id: '/schedule', icon: Calendar, label: 'الجدول', path: '/dashboard/schedule' },
        { id: '/quizzes', icon: FileQuestion, label: 'الاختبارات', path: '/dashboard/quizzes' },
        { id: '/profile', icon: User, label: 'الملف الشخصي', path: '/dashboard/profile' },
        {
            id: '/parent-requests',
            icon: Users,
            label: 'طلبات الربط',
            path: '/dashboard/parent-requests',
            badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined
        },
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
                    fixed top-0 transition-all duration-300 z-50 flex flex-col h-screen bg-white border-l border-slate-200 shadow-xl lg:shadow-none
                    ${isRTL ? 'right-0 border-l' : 'left-0 border-r'}
                    ${isCollapsed ? 'w-20' : 'w-64'}
                `}
            >
                {/* Logo */}
                <div className={`
                    h-20 flex items-center border-b border-slate-100 transition-all duration-300
                    ${isCollapsed ? 'pl-[24px] pr-0' : 'px-4 justify-between'}
                `}>
                    <div className={`flex items-center gap-2 overflow-hidden transition-all duration-500 ease-in-out ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'}`}>
                        <img src="/images/subol-red.png" alt="سُبُل" className="w-8 h-8" />
                        <span className="text-2xl font-extrabold text-shibl-crimson whitespace-nowrap">سُبُل</span>
                    </div>
                    <div className={`${isCollapsed ? 'block opacity-100' : 'hidden opacity-0'} transition-all duration-500`}>
                        <img src="/images/subol-red.png" alt="سُبُل" className="w-8 h-8" />
                    </div>
                </div>

                {/* Collapse Toggle Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`
                        absolute top-6 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-shibl-crimson hover:border-shibl-crimson transition-colors shadow-sm z-50
                        ${isRTL ? '-left-3' : '-right-3'}
                    `}
                >
                    {isRTL
                        ? (isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />)
                        : (isCollapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />)
                    }
                </button>

                {/* Navigation */}
                <nav className="flex-1 py-6 px-3 overflow-y-auto custom-scrollbar overflow-x-hidden">
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
                                            ${isCollapsed ? 'pl-[30px]' : 'px-4'}
                                        `}
                                        title={isCollapsed ? item.label : undefined}
                                    >
                                        <IconComponent
                                            size={20}
                                            className={`shrink-0 transition-colors ${active ? 'text-white' : 'text-slate-400 group-hover:text-shibl-crimson'}`}
                                        />

                                        <div className={`overflow-hidden whitespace-nowrap transition-all duration-500 ease-in-out ${isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[200px] opacity-100 ml-3'}`}>
                                            <span className="font-semibold text-sm block">
                                                {item.label}
                                            </span>
                                        </div>

                                        {/* Badge */}
                                        {(item as any).badge && (
                                            <span
                                                className={`
                                                    bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center transition-all duration-300
                                                    ${isCollapsed ? 'fixed w-2.5 h-2.5 p-0 min-w-0 right-14 top-auto ml-0' : 'ml-auto'}
                                                `}
                                                style={isCollapsed ? { right: 'unset', left: isRTL ? 'unset' : '50%', transform: 'translateX(10px)' } : {}}
                                            >
                                                {isCollapsed ? '' : (item as any).badge}
                                            </span>
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
                            flex items-center px-4 py-3 rounded-xl w-full
                            text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 overflow-hidden
                            ${isCollapsed ? 'pl-[30px]' : 'px-4'}
                        `}
                        title={isCollapsed ? 'تسجيل الخروج' : undefined}
                    >
                        <LogOut size={20} className="shrink-0" />
                        <div className={`overflow-hidden whitespace-nowrap transition-all duration-500 ease-in-out ${isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[200px] opacity-100 ml-3'}`}>
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
                    flex-1 transition-all duration-300 flex flex-col min-h-screen
                    ${isRTL
                        ? (isCollapsed ? 'mr-20' : 'mr-64')
                        : (isCollapsed ? 'ml-20' : 'ml-64')
                    }
                `}
            >
                {/* Header */}
                <header className="h-16 bg-white/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-40">
                    {/* Search Left Aligned (or right depending on direction, but kept consistent) */}
                    <div className="flex-1"></div>

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
                <div className="flex-1">
                    <Outlet />
                </div>
                <Footer />
            </main>

            {/* Student Notification Toast */}
            <StudentNotificationToast />
        </div>
    );
}
