import React, { ReactNode, useState, useCallback } from 'react';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    GraduationCap,
    CreditCard,
    Banknote,
    BarChart3,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Shield,
    Calendar,
    ListTree,
    Layers,
    UserCog,
    School,
    Wallet,
    PlayCircle,
    Package,
    Clock,
    CheckCircle,
    CircleHelp,
    MessageSquare,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../shared/constants';
import { useAuthStore } from '../../store';

interface NavItem {
    icon: ReactNode;
    label: string;
    path: string;
}

interface NavGroup {
    id: string;
    label: string;
    icon: ReactNode;
    items: NavItem[];
}

const navGroups: NavGroup[] = [
    {
        id: 'main',
        label: 'الرئيسية',
        icon: <LayoutDashboard size={18} />,
        items: [
            { icon: <LayoutDashboard size={18} />, label: 'لوحة التحكم', path: ROUTES.ADMIN_DASHBOARD },
        ],
    },
    {
        id: 'users',
        label: 'إدارة المستخدمين',
        icon: <UserCog size={18} />,
        items: [
            { icon: <Shield size={18} />, label: 'المديرين', path: ROUTES.ADMIN_ADMINS },
            { icon: <Users size={18} />, label: 'المستخدمين', path: ROUTES.ADMIN_USERS },
            { icon: <GraduationCap size={18} />, label: 'المدرسين', path: '/admin/teachers' },
        ],
    },
    {
        id: 'education',
        label: 'المحتوى التعليمي',
        icon: <School size={18} />,
        items: [
            { icon: <div className="text-indigo-500"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="12" x2="7" y2="17"></line><line x1="12" y1="12" x2="17" y2="17"></line></svg></div>, label: 'الهيكل التعليمي', path: '/admin/academic-structure' },
            { icon: <Layers size={18} />, label: 'الصفوف الدراسية', path: '/admin/grades' },
            { icon: <Calendar size={18} />, label: 'الفصول الدراسية', path: '/admin/semesters' },
            { icon: <ListTree size={18} />, label: 'المواد الدراسية', path: '/admin/subjects' },
            { icon: <BookOpen size={18} />, label: 'الكورسات', path: ROUTES.ADMIN_COURSES },
            { icon: <PlayCircle size={18} />, label: 'المحاضرات', path: ROUTES.ADMIN_LECTURES },
            { icon: <CircleHelp size={18} />, label: 'الاختبارات', path: '/admin/quizzes' },

            { icon: <CheckCircle size={18} />, label: 'طلبات التعديل', path: '/admin/content-approvals' },
        ],
    },
    {
        id: 'teacher-requests',
        label: 'طلبات المدرسين',
        icon: <Clock size={18} />,
        items: [
            { icon: <CheckCircle size={18} />, label: 'طلبات المواعيد', path: '/admin/slot-requests' },
            { icon: <Calendar size={18} />, label: 'جداول الحصص', path: '/admin/class-schedules' },
        ],
    },
    {
        id: 'finance',
        label: 'المالية',
        icon: <Wallet size={18} />,
        items: [
            { icon: <Package size={18} />, label: 'الباقات', path: ROUTES.ADMIN_PACKAGES },
            { icon: <CreditCard size={18} />, label: 'الاشتراكات', path: ROUTES.ADMIN_SUBSCRIPTIONS },
            { icon: <Package size={18} />, label: 'اشتراكات الباقات', path: '/admin/package-subscriptions' },
        ],
    },
    {
        id: 'system',
        label: 'النظام',
        icon: <Settings size={18} />,
        items: [
            { icon: <MessageSquare size={18} />, label: 'بلاغات الدعم', path: '/admin/client-reports' },
            { icon: <Calendar size={18} />, label: 'إعدادات الجدولة', path: '/admin/schedule-config' },
            { icon: <Settings size={18} />, label: 'الإعدادات', path: ROUTES.ADMIN_SETTINGS },
        ],
    },
];

interface AdminSidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
    className?: string;
}

export function AdminSidebar({ isCollapsed, onToggle, className = '' }: AdminSidebarProps): React.ReactElement {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuthStore();
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
        new Set(navGroups.map(g => g.id))
    );

    const toggleGroup = useCallback((groupId: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(groupId)) {
                next.delete(groupId);
            } else {
                next.add(groupId);
            }
            return next;
        });
    }, []);

    const handleLogout = useCallback(() => {
        logout();
        navigate(ROUTES.ADMIN_LOGIN);
    }, [logout, navigate]);

    const isItemActive = useCallback((path: string) => {
        return location.pathname === path ||
            (path === ROUTES.ADMIN_DASHBOARD && location.pathname === '/admin');
    }, [location.pathname]);

    const isGroupActive = useCallback((group: NavGroup) => {
        return group.items.some(item => isItemActive(item.path));
    }, [isItemActive]);

    return (
        <aside
            className={`
                fixed top-0 right-0 h-screen bg-white dark:bg-[#1E1E1E] border-l border-slate-200 dark:border-white/10
                transition-all duration-300 z-50 flex flex-col
                ${isCollapsed ? 'w-20' : 'w-72'}
                ${className}
            `}
        >
            <div className="h-16 flex items-center justify-center border-b border-slate-100 dark:border-white/10 px-4 shrink-0">
                {!isCollapsed ? (
                    <div className="flex items-center gap-2">
                        <img src="/images/subol-red.png" alt="سُبُل" className="w-8 h-8" />
                        <span className="text-2xl font-extrabold text-shibl-crimson">سُبُل</span>
                    </div>
                ) : (
                    <img src="/images/subol-red.png" alt="سُبُل" className="w-8 h-8" />
                )}
            </div>

            <button
                onClick={onToggle}
                className="absolute top-5 -left-3 w-6 h-6 bg-white dark:bg-[#2A2A2A] border border-slate-200 dark:border-white/10 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-shibl-crimson hover:border-shibl-crimson transition-colors shadow-sm"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            <nav className="flex-1 py-4 px-3 overflow-y-auto scrollbar-sleek overflow-x-hidden overscroll-contain">
                <div className="space-y-2">
                    {navGroups.map((group) => {
                        const isGroupOpen = expandedGroups.has(group.id);
                        const hasActiveItem = isGroupActive(group);

                        // When collapsed, we hide the group header but show items (flattened look)
                        // When expanded, we show group header and respect expansion state
                        const showItems = isCollapsed || isGroupOpen;

                        return (
                            <div key={group.id} className="relative transition-all duration-300 ease-in-out">
                                {/* Group Header - Hidden when collapsed */}
                                <div
                                    className={`
                                        overflow-hidden transition-all duration-300 ease-in-out
                                        ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-12 opacity-100'}
                                    `}
                                >
                                    <button
                                        onClick={() => toggleGroup(group.id)}
                                        className={`
                                            w-full flex items-center justify-between px-3 py-2.5 rounded-xl
                                            transition-all duration-200 group mb-1
                                            ${hasActiveItem
                                                ? 'bg-shibl-crimson/5 text-shibl-crimson'
                                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <span className={`shrink-0 ${hasActiveItem ? 'text-shibl-crimson' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
                                                {group.icon}
                                            </span>
                                            <span className="font-semibold text-xs uppercase tracking-wide whitespace-nowrap opacity-100 transition-opacity duration-300">
                                                {group.label}
                                            </span>
                                        </div>
                                        <ChevronDown
                                            size={16}
                                            className={`
                                                transition-transform duration-200 shrink-0
                                                ${isGroupOpen ? 'rotate-180' : ''}
                                                ${hasActiveItem ? 'text-shibl-crimson' : 'text-slate-400 dark:text-slate-500'}
                                            `}
                                        />
                                    </button>
                                </div>

                                {/* Divider when collapsed for visual separation */}
                                <div
                                    className={`
                                        border-b border-slate-50 mx-2 transition-all duration-300
                                        ${isCollapsed && group.id !== 'main' ? 'my-2 opacity-100' : 'my-0 h-0 opacity-0 border-none'}
                                    `}
                                />

                                {/* Items Container */}
                                <div
                                    className={`
                                        overflow-hidden transition-all duration-300 ease-in-out
                                        ${showItems ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
                                    `}
                                >
                                    <div className={`space-y-1 ${isCollapsed ? '' : 'pr-2'}`}>
                                        {group.items.map((item) => {
                                            const isActive = isItemActive(item.path);
                                            return (
                                                <Link
                                                    key={item.path}
                                                    to={item.path}
                                                    className={`
                                                        flex items-center px-3 py-2.5 rounded-xl
                                                        transition-all duration-300 group/item relative overflow-hidden
                                                        ${isActive
                                                            ? 'bg-shibl-crimson text-white shadow-sm'
                                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-shibl-crimson'
                                                        }
                                                        ${isCollapsed ? 'pl-[19px]' : 'px-3'}
                                                    `}
                                                    title={isCollapsed ? item.label : undefined}
                                                >
                                                    <span className={`
                                                        shrink-0 transition-all duration-300
                                                        ${isActive ? 'text-white' : 'text-slate-400 group-hover/item:text-shibl-crimson dark:group-hover/item:text-shibl-crimson'}
                                                    `}>
                                                        {item.icon}
                                                    </span>

                                                    <div
                                                        className={`
                                                            overflow-hidden whitespace-nowrap transition-all duration-500 ease-in-out
                                                            ${isCollapsed
                                                                ? 'max-w-0 opacity-0 ml-0'
                                                                : 'max-w-[200px] opacity-100 ml-3'
                                                            }
                                                        `}
                                                    >
                                                        <span className="font-medium text-sm block">
                                                            {item.label}
                                                        </span>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </nav>

            <div className="p-3 border-t border-slate-100 dark:border-white/10 shrink-0">
                <button
                    onClick={handleLogout}
                    className={`
                        flex items-center px-4 py-3 rounded-xl w-full
                        text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all duration-200
                        ${isCollapsed ? 'pl-[19px]' : 'px-4'}
                    `}
                    title={isCollapsed ? 'تسجيل الخروج' : undefined}
                >
                    <LogOut size={18} />
                    <div
                        className={`
                            overflow-hidden whitespace-nowrap transition-all duration-500 ease-in-out
                            ${isCollapsed
                                ? 'max-w-0 opacity-0 ml-0'
                                : 'max-w-[200px] opacity-100 ml-3'
                            }
                        `}
                    >
                        <span className="font-medium text-sm block">تسجيل الخروج</span>
                    </div>
                </button>
            </div>
        </aside>
    );
}
