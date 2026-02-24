import { memo, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks';
import { useAuthStore } from '../../store';
import { teacherAuthService } from '../../../data/api/teacherAuthService';
import { commonService } from '../../../data/api/commonService';
import { ROUTES } from '../../../shared/constants';
import Swal from 'sweetalert2';

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
                relative flex items-center px-4 py-3 mx-2 rounded-xl
                transition-all duration-200 group
                ${isActive
                    ? 'bg-shibl-crimson text-white shadow-md shadow-shibl-crimson/20'
                    : 'text-[#636E72] dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-[#2D3436] dark:hover:text-white'
                }
                ${isCollapsed ? 'pl-[21px]' : 'px-4'}
            `}
        >
            <item.icon
                size={22}
                strokeWidth={1.5}
                className={`shrink-0 transition-colors duration-200`}
            />

            <div className={`overflow-hidden whitespace-nowrap z-50 transition-all duration-500 ease-in-out ${isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[200px] opacity-100 ml-3'}`}>
                <span className="font-medium text-sm block">
                    {item.label}
                </span>
            </div>
        </NavLink>
    );
});

export function TeacherSidebar({ isCollapsed, onToggle, isMobileOpen, onMobileClose }: TeacherSidebarProps) {
    const { isRTL } = useLanguage();
    const navigate = useNavigate();
    const { user, logout: storeLogout } = useAuthStore();
    const [platformName, setPlatformName] = useState('شِبْل');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await commonService.getSettings();
                const settingsMap: any = {};
                if (data && Array.isArray(data)) {
                    data.forEach((s: any) => { settingsMap[s.key] = s.value; });
                }
                if (settingsMap.platform_name) {
                    setPlatformName(settingsMap.platform_name);
                }
            } catch (error) {
                console.error("Failed to fetch settings sidebar", error);
            }
        };
        fetchSettings();
    }, []);

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'تسجيل الخروج',
            text: 'هل أنت متأكد أنك تريد تسجيل الخروج؟',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#AF0C15',
            cancelButtonColor: '#636E72',
            confirmButtonText: 'نعم، تسجيل الخروج',
            cancelButtonText: 'إلغاء',
            reverseButtons: true,
        });

        if (!result.isConfirmed) return;

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
        <div className="flex flex-col h-full bg-white dark:bg-[#1E1E1E] border-r border-l border-slate-200 dark:border-white/10 transition-colors duration-300">
            {/* Header / Logo Area */}
            <div className={`
                h-20 flex items-center px-6 border-b border-slate-100 dark:border-white/5 relative
                transition-all duration-300
            `}>
                <div className={`flex flex-col overflow-hidden transition-all duration-500 ease-in-out ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'}`}>
                    <span className="text-xl font-bold text-[#2D3436] dark:text-white whitespace-nowrap">{platformName}</span>
                    <span className="text-xs text-[#636E72] dark:text-gray-400 whitespace-nowrap">بوابة المعلم</span>
                </div>

                {/* Desktop Toggle */}
                <button
                    onClick={onToggle}
                    className={`hidden lg:flex p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 dark:text-gray-500 transition-colors ${isCollapsed ? 'absolute left-1/2 -translate-x-1/2' : 'ml-auto'}`}
                >
                    {isRTL
                        ? (isCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />)
                        : (isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />)
                    }
                </button>

                {/* Mobile Close Button */}
                <button
                    onClick={onMobileClose}
                    className="lg:hidden p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-gray-400"
                >
                    <ChevronRight size={20} className={isRTL ? 'rotate-180' : ''} />
                </button>

                <div className={`
                    absolute left-1/2 -translate-x-1/2 w-10 h-10 bg-shibl-crimson rounded-xl flex items-center justify-center shadow-lg shadow-shibl-crimson/20
                    transition-all duration-300 pointer-events-none
                    ${isCollapsed ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
                `}>
                    <GraduationCap className="text-white" size={24} />
                </div>
            </div>

            {/* Teacher Profile - Compact */}
            <div className={`
                border-b border-slate-200 dark:border-white/5 bg-[#F8F9FA] dark:bg-white/5 transition-all duration-300 overflow-hidden
                ${isCollapsed ? 'max-h-0 opacity-0 py-0' : 'max-h-24 opacity-100 py-4'}
            `}>
                <div className="px-4 flex items-center gap-3">
                    <img
                        src={user?.image_path || teacherPlaceholder}
                        alt={user?.name || 'Teacher'}
                        className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 dark:border-white/10 flex-shrink-0"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = teacherPlaceholder;
                        }}
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-[#1F1F1F] dark:text-white font-medium text-sm truncate">
                            {user?.name || 'المعلم'}
                        </p>
                        <p className="text-[#636E72] dark:text-gray-400 text-xs truncate">
                            {user?.email || 'teacher@subol.edu'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 overflow-y-auto bg-white dark:bg-[#1E1E1E] transition-colors duration-300">
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
            <div className="p-4 border-t border-slate-100 dark:border-white/5">
                <button
                    onClick={handleLogout}
                    className={`
                            w-full flex items-center px-4 py-3 rounded-xl
                            text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-200 group
                            ${isCollapsed ? 'pl-[21px]' : 'px-4'}
                        `}
                >
                    <LogOut
                        size={22}
                        strokeWidth={1.5}
                        className="shrink-0 transition-transform group-hover:-translate-x-1"
                    />
                    <div className={`overflow-hidden whitespace-nowrap transition-all duration-500 ease-in-out ${isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[200px] opacity-100 ml-3'}`}>
                        <span className="font-medium text-sm">تسجيل الخروج</span>
                    </div>
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
                    fixed inset-y-0 z-[100] bg-white dark:bg-[#1E1E1E] shadow-xl lg:shadow-none transition-all duration-300 ease-in-out
                    ${isRTL ? 'right-0 border-l dark:border-white/10' : 'left-0 border-r dark:border-white/10'}
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
