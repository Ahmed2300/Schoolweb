import { memo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks';
import { useAuthStore } from '../../store';
import { teacherAuthService } from '../../../data/api/teacherAuthService';
import { ROUTES } from '../../../shared/constants';

import {
    LayoutDashboard,
    BookOpen,
    ClipboardList,
    BarChart3,
    Settings,
    LogOut,
    ChevronRight,
    ChevronLeft,
    GraduationCap,
    Users,
    Calendar,
    CalendarClock,
    CalendarRange,
    FileText
} from 'lucide-react';

// Assets
import teacherPlaceholder from '../../../assets/images/teacher-placeholder.png';

interface TeacherSidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
    isMobileOpen: boolean;
    onMobileClose: () => void;
}

// Navigation item type for type safety
interface NavItem {
    id: string;
    label: string;
    icon: React.ElementType;
    path: string;
}

// Navigation items - memoized to prevent re-creation
const navItems: NavItem[] = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, path: ROUTES.TEACHER_DASHBOARD },
    { id: 'courses', label: 'الدورات', icon: BookOpen, path: ROUTES.TEACHER_COURSES },
    { id: 'requests', label: 'طلبات المواعيد', icon: CalendarClock, path: '/teacher/slot-requests' },
    { id: 'schedule', label: 'الجدول الأسبوعي', icon: CalendarRange, path: '/teacher/weekly-schedule' },
    { id: 'quizzes', label: 'الاختبارات', icon: FileText, path: ROUTES.TEACHER_QUIZZES },

    { id: 'settings', label: 'الإعدادات', icon: Settings, path: '/teacher/settings' },
];

// Memoized navigation item component for performance - Light theme
const NavItem = memo(function NavItem({
    item,
    isCollapsed,
    isRTL,
    onClick
}: {
    item: NavItem;
    isCollapsed: boolean;
    isRTL: boolean;
    onClick?: () => void;
}) {
    // Use 'end' prop for dashboard to prevent matching all child routes
    const isDashboard = item.id === 'dashboard';

    return (
        <NavLink
            to={item.path}
            end={isDashboard}
            onClick={onClick}
            className={({ isActive }) => `
                relative flex items-center gap-3 px-4 py-3 mx-2 rounded-xl
                transition-all duration-200 group
                ${isActive
                    ? 'bg-shibl-crimson text-white shadow-md shadow-shibl-crimson/20'
                    : 'text-[#636E72] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#2D3436] dark:hover:text-slate-200'
                }
            `}
        >
            <item.icon
                size={22}
                strokeWidth={1.5}
                className={`shrink-0 transition-colors duration-200`}
            />

            {!isCollapsed && (
                <div className={`
                    font-medium text-sm
                    transition-all duration-200 whitespace-nowrap z-50
                `}>
                    {item.label}
                </div>
            )}
        </NavLink>
    );
});

export function TeacherSidebar({ isCollapsed, onToggle, isMobileOpen, onMobileClose }: TeacherSidebarProps) {
    const { isRTL } = useLanguage();
    const navigate = useNavigate();
    const { user, logout: storeLogout } = useAuthStore();

    const handleLogout = async () => {
        try {
            await teacherAuthService.logout();
        } catch {
            // Continue with logout even if API fails
        } finally {
            storeLogout();
            navigate(ROUTES.TEACHER_LOGIN);
        }
    };

    const sidebarContent = (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-l border-slate-200 dark:border-slate-800 transition-colors duration-300">
            {/* Header / Logo Area */}
            <div className={`
                h-20 flex items-center px-6 border-b border-slate-100 dark:border-slate-800
                ${isCollapsed ? 'justify-center' : 'justify-between'}
            `}>
                {!isCollapsed && (
                    <div className="flex flex-col">
                        <span className="text-xl font-bold text-[#2D3436] dark:text-slate-100">شِبْل</span>
                        <span className="text-xs text-[#636E72] dark:text-slate-400">بوابة المعلم</span>
                    </div>
                )}

                {/* Desktop Toggle */}
                <button
                    onClick={onToggle}
                    className="hidden lg:flex p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 transition-colors"
                >
                    {isRTL
                        ? (isCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />)
                        : (isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />)
                    }
                </button>

                {/* Mobile Close Button */}
                <button
                    onClick={onMobileClose}
                    className="lg:hidden p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                >
                    <ChevronRight size={20} className={isRTL ? 'rotate-180' : ''} />
                </button>

                <div className={`
                    w-10 h-10 bg-shibl-crimson rounded-xl flex items-center justify-center shadow-lg shadow-shibl-crimson/20
                    ${isCollapsed ? 'block' : 'hidden'}
                `}>
                    <GraduationCap className="text-white" size={24} />
                </div>
            </div>

            {/* Teacher Profile - Compact */}
            {!isCollapsed && (
                <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-800 bg-[#F8F9FA] dark:bg-slate-950/50 transition-colors duration-300">
                    <div className="flex items-center gap-3">
                        <img
                            src={user?.image_path || teacherPlaceholder}
                            alt={user?.name || 'Teacher'}
                            className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700 flex-shrink-0"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = teacherPlaceholder;
                            }}
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-[#1F1F1F] dark:text-slate-200 font-medium text-sm truncate">
                                {user?.name || 'المعلم'}
                            </p>
                            <p className="text-[#636E72] dark:text-slate-400 text-xs truncate">
                                {user?.email || 'teacher@subol.edu'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 py-4 overflow-y-auto bg-white dark:bg-slate-900 transition-colors duration-300">
                <div className="space-y-1">
                    {navItems.map((item) => (
                        <NavItem
                            key={item.id}
                            item={item}
                            isCollapsed={isCollapsed}
                            isRTL={isRTL}
                        />
                    ))}
                </div>
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                <button
                    onClick={handleLogout}
                    className={`
                            w-full flex items-center gap-3 px-4 py-3 rounded-xl
                            text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-200 group
                            ${isCollapsed ? 'justify-center' : ''}
                        `}
                >
                    <LogOut
                        size={22}
                        strokeWidth={1.5}
                        className="shrink-0 transition-transform group-hover:-translate-x-1"
                    />
                    {!isCollapsed && (
                        <span className="font-medium text-sm">تسجيل الخروج</span>
                    )}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Overlay Backdrop */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99] lg:hidden"
                    onClick={onMobileClose}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`
                    fixed inset-y-0 z-[100] bg-white dark:bg-slate-900 shadow-xl lg:shadow-none transition-all duration-300 ease-in-out
                    ${isRTL ? 'right-0 border-l dark:border-slate-800' : 'left-0 border-r dark:border-slate-800'}
                    ${isMobileOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')}
                    lg:translate-x-0 lg:fixed lg:h-screen lg:shrink-0
                    ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
                    w-64
                `}
            >
                {sidebarContent}
            </aside>
        </>
    );
}

export default TeacherSidebar;
