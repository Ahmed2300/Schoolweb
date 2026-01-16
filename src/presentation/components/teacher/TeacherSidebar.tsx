import { memo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks';
import { useAuthStore } from '../../store';
import { teacherAuthService } from '../../../data/api/teacherAuthService';
import { ROUTES } from '../../../shared/constants';

// Lucide Icons
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
    Calendar
} from 'lucide-react';

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
    { id: 'students', label: 'الطلاب', icon: Users, path: '/teacher/students' },
    { id: 'schedule', label: 'الجدول', icon: Calendar, path: '/teacher/schedule' },
    { id: 'quizzes', label: 'الاختبارات', icon: ClipboardList, path: ROUTES.TEACHER_QUIZZES },
    { id: 'analytics', label: 'الإحصائيات', icon: BarChart3, path: ROUTES.TEACHER_ANALYTICS },
    { id: 'settings', label: 'الإعدادات', icon: Settings, path: '/teacher/settings' },
];

// Memoized navigation item component for performance
const NavItem = memo(function NavItem({
    item,
    isCollapsed,
    isRTL
}: {
    item: NavItem;
    isCollapsed: boolean;
    isRTL: boolean;
}) {
    return (
        <NavLink
            to={item.path}
            className={({ isActive }) => `
                relative flex items-center gap-3 px-4 py-3 mx-2 rounded-xl
                transition-all duration-200 group
                ${isActive
                    ? 'bg-gradient-to-r from-shibl-crimson to-red-600 text-white shadow-lg shadow-shibl-crimson/30'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
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
                    px-3 py-2 bg-charcoal text-white text-sm rounded-lg
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
    const { user, clearUser } = useAuthStore();

    const handleLogout = async () => {
        try {
            await teacherAuthService.logout();
        } catch {
            // Continue with logout even if API fails
        } finally {
            clearUser();
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
                bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a]
                border-${isRTL ? 'l' : 'r'} border-white/5
                transition-all duration-300 z-50
                flex flex-col
                ${isCollapsed ? 'w-20' : 'w-64'}
            `}
        >
            {/* Logo Section */}
            <div className="h-20 flex items-center justify-between px-4 border-b border-white/5">
                {!isCollapsed && (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-shibl-crimson to-red-600 flex items-center justify-center">
                            <GraduationCap size={22} className="text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-bold text-lg">سُبُل</span>
                            <span className="text-slate-400 text-xs">بوابة المعلم</span>
                        </div>
                    </div>
                )}

                {isCollapsed && (
                    <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-shibl-crimson to-red-600 flex items-center justify-center">
                        <GraduationCap size={22} className="text-white" />
                    </div>
                )}

                {/* Collapse Toggle */}
                <button
                    onClick={onToggle}
                    className={`
                        ${isCollapsed ? 'absolute -left-3' : ''} 
                        w-6 h-6 rounded-full bg-shibl-crimson text-white
                        flex items-center justify-center
                        hover:bg-red-600 transition-colors
                        shadow-lg
                    `}
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <CollapseIcon size={14} />
                </button>
            </div>

            {/* Teacher Profile - Compact */}
            {!isCollapsed && (
                <div className="px-4 py-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold text-sm">
                            {user?.name?.charAt(0) || 'م'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm truncate">
                                {user?.name || 'المعلم'}
                            </p>
                            <p className="text-slate-400 text-xs truncate">
                                {user?.email || 'teacher@subol.edu'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 py-4 overflow-y-auto">
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
            <div className="p-4 border-t border-white/5">
                <button
                    onClick={handleLogout}
                    className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-xl
                        text-red-400 hover:bg-red-500/10 hover:text-red-300
                        transition-all duration-200
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
