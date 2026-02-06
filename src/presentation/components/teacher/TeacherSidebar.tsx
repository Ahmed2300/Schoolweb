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
    Video,
    CalendarClock,
    CalendarRange
} from 'lucide-react';

// Assets
import teacherPlaceholder from '../../../assets/images/teacher-placeholder.png';

interface TeacherSidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
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

    { id: 'slot-requests', label: 'طلبات المواعيد', icon: CalendarClock, path: '/teacher/slot-requests' },
    { id: 'weekly-schedule', label: 'الجدول الأسبوعي', icon: CalendarRange, path: '/teacher/weekly-schedule' },
    { id: 'quizzes', label: 'الاختبارات', icon: ClipboardList, path: ROUTES.TEACHER_QUIZZES },
    { id: 'recordings', label: 'التسجيلات', icon: Video, path: '/teacher/recordings' },

    { id: 'settings', label: 'الإعدادات', icon: Settings, path: '/teacher/settings' },
];

// Memoized navigation item component for performance - Light theme
const NavItem = memo(function NavItem({
    item,
    isCollapsed,
    isRTL
}: {
    item: NavItem;
    isCollapsed: boolean;
    isRTL: boolean;
}) {
    // Use 'end' prop for dashboard to prevent matching all child routes
    const isDashboard = item.id === 'dashboard';

    return (
        <NavLink
            to={item.path}
            end={isDashboard}
            className={({ isActive }) => `
                relative flex items-center gap-3 px-4 py-3 mx-2 rounded-xl
                transition-all duration-200 group
                ${isActive
                    ? `bg-red-50 text-shibl-crimson font-semibold ${isRTL ? 'border-r-4' : 'border-l-4'} border-shibl-crimson`
                    : 'text-[#636E72] hover:bg-slate-100 hover:text-[#1F1F1F]'
                }
                ${isCollapsed ? 'justify-center' : ''}
            `}
        >
            <item.icon size={20} className="flex-shrink-0" />
            {!isCollapsed && (
                <span className="font-medium text-sm whitespace-nowrap">
                    {item.label}
                </span>
            )}

            {/* Tooltip for collapsed state */}
            {isCollapsed && (
                <div className={`
                    absolute ${isRTL ? 'right-full mr-2' : 'left-full ml-2'} 
                    px-3 py-2 bg-[#1F1F1F] text-white text-sm rounded-lg
                    opacity-0 invisible group-hover:opacity-100 group-hover:visible
                    transition-all duration-200 whitespace-nowrap z-50
                    shadow-lg
                `}>
                    {item.label}
                </div>
            )}
        </NavLink>
    );
});

export function TeacherSidebar({ isCollapsed, onToggle }: TeacherSidebarProps) {
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

    const CollapseIcon = isRTL
        ? (isCollapsed ? ChevronLeft : ChevronRight)
        : (isCollapsed ? ChevronRight : ChevronLeft);

    return (
        <aside
            className={`
                fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-screen
                bg-white border-${isRTL ? 'l' : 'r'} border-slate-200
                transition-all duration-300 z-50
                flex flex-col shadow-sm
                ${isCollapsed ? 'w-20' : 'w-64'}
            `}
        >
            {/* Logo Section */}
            <div className="h-20 flex items-center justify-between px-4 border-b border-slate-200">
                {!isCollapsed && (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-shibl-crimson to-red-600 flex items-center justify-center">
                            <GraduationCap size={22} className="text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[#1F1F1F] font-bold text-lg">سُبُل</span>
                            <span className="text-[#636E72] text-xs">بوابة المعلم</span>
                        </div>
                    </div>
                )}

                {isCollapsed && (
                    <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-shibl-crimson to-red-600 flex items-center justify-center">
                        <GraduationCap size={22} className="text-white" />
                    </div>
                )}
            </div>

            {/* Collapse Toggle - Positioned on sidebar edge */}
            <button
                onClick={onToggle}
                className={`
                    absolute top-24 z-50
                    ${isRTL ? '-left-3' : '-right-3'}
                    w-6 h-6 rounded-full bg-shibl-crimson text-white
                    flex items-center justify-center
                    hover:bg-red-600 transition-colors
                    shadow-lg border-2 border-white
                `}
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
                <CollapseIcon size={14} />
            </button>

            {/* Teacher Profile - Compact */}
            {!isCollapsed && (
                <div className="px-4 py-4 border-b border-slate-200 bg-[#F8F9FA]">
                    <div className="flex items-center gap-3">
                        <img
                            src={user?.image_path || teacherPlaceholder}
                            alt={user?.name || 'Teacher'}
                            className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 flex-shrink-0"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = teacherPlaceholder;
                            }}
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-[#1F1F1F] font-medium text-sm truncate">
                                {user?.name || 'المعلم'}
                            </p>
                            <p className="text-[#636E72] text-xs truncate">
                                {user?.email || 'teacher@subol.edu'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 py-4 overflow-y-auto bg-white">
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
            <div className="p-4 border-t border-slate-200 bg-white">
                <button
                    onClick={handleLogout}
                    className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-xl
                        text-red-600 hover:bg-red-50 hover:text-red-700
                        transition-all duration-200 border border-transparent hover:border-red-200
                        ${isCollapsed ? 'justify-center' : ''}
                    `}
                >
                    <LogOut size={20} />
                    {!isCollapsed && (
                        <span className="font-medium text-sm">تسجيل الخروج</span>
                    )}
                </button>
            </div>
        </aside>
    );
}

export default TeacherSidebar;
