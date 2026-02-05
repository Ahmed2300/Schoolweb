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
    Video,
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
            { icon: <Clock size={18} />, label: 'المواعيد', path: '/admin/time-slots' },
            { icon: <CheckCircle size={18} />, label: 'طلبات التعديل', path: '/admin/content-approvals' },
            { icon: <Video size={18} />, label: 'التسجيلات', path: '/admin/recordings' },
            { icon: <Package size={18} />, label: 'الباقات', path: '/admin/packages' },
        ],
    },
    {
        id: 'teacher-requests',
        label: 'طلبات المدرسين',
        icon: <Clock size={18} />,
        items: [
            { icon: <CheckCircle size={18} />, label: 'طلبات المواعيد', path: '/admin/slot-requests' },
        ],
    },
    {
        id: 'finance',
        label: 'المالية',
        icon: <Wallet size={18} />,
        items: [
            { icon: <CreditCard size={18} />, label: 'الاشتراكات', path: ROUTES.ADMIN_SUBSCRIPTIONS },
            { icon: <Package size={18} />, label: 'اشتراكات الباقات', path: '/admin/package-subscriptions' },
            { icon: <Banknote size={18} />, label: 'المدفوعات', path: '/admin/payments' },
        ],
    },
    {
        id: 'system',
        label: 'النظام',
        icon: <Settings size={18} />,
        items: [
            { icon: <BarChart3 size={18} />, label: 'التقارير', path: ROUTES.ADMIN_REPORTS },
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
                fixed top-0 right-0 h-screen bg-white border-l border-slate-200
                transition-all duration-300 z-50 flex flex-col
                ${isCollapsed ? 'w-20' : 'w-72'}
                ${className}
            `}
        >
            <div className="h-16 flex items-center justify-center border-b border-slate-100 px-4 shrink-0">
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
                className="absolute top-5 -left-3 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-shibl-crimson hover:border-shibl-crimson transition-colors shadow-sm"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            <nav className="flex-1 py-4 px-3 overflow-y-auto scrollbar-hide">
                <div className="space-y-1">
                    {navGroups.map((group) => {
                        const isExpanded = expandedGroups.has(group.id);
                        const hasActiveItem = isGroupActive(group);

                        if (isCollapsed) {
                            return (
                                <div key={group.id} className="space-y-1">
                                    {group.items.map((item) => {
                                        const isActive = isItemActive(item.path);
                                        return (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                className={`
                                                    flex items-center justify-center p-3 rounded-xl
                                                    transition-all duration-200
                                                    ${isActive
                                                        ? 'bg-shibl-crimson text-white shadow-lg'
                                                        : 'text-slate-500 hover:bg-slate-100 hover:text-shibl-crimson'
                                                    }
                                                `}
                                                title={item.label}
                                            >
                                                {item.icon}
                                            </Link>
                                        );
                                    })}
                                    {group.id !== 'system' && (
                                        <div className="my-2 border-b border-slate-100" />
                                    )}
                                </div>
                            );
                        }

                        return (
                            <div key={group.id} className="mb-2">
                                <button
                                    onClick={() => toggleGroup(group.id)}
                                    className={`
                                        w-full flex items-center justify-between px-3 py-2.5 rounded-xl
                                        transition-all duration-200 group
                                        ${hasActiveItem
                                            ? 'bg-shibl-crimson/5 text-shibl-crimson'
                                            : 'text-slate-500 hover:bg-slate-50'
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className={hasActiveItem ? 'text-shibl-crimson' : 'text-slate-400 group-hover:text-slate-600'}>
                                            {group.icon}
                                        </span>
                                        <span className="font-semibold text-xs uppercase tracking-wide">
                                            {group.label}
                                        </span>
                                    </div>
                                    <ChevronDown
                                        size={16}
                                        className={`
                                            transition-transform duration-200
                                            ${isExpanded ? 'rotate-180' : ''}
                                            ${hasActiveItem ? 'text-shibl-crimson' : 'text-slate-400'}
                                        `}
                                    />
                                </button>

                                <div
                                    className={`
                                        overflow-hidden transition-all duration-200 ease-out
                                        ${isExpanded ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}
                                    `}
                                >
                                    <div className="pr-2 space-y-0.5">
                                        {group.items.map((item) => {
                                            const isActive = isItemActive(item.path);
                                            return (
                                                <Link
                                                    key={item.path}
                                                    to={item.path}
                                                    className={`
                                                        flex items-center gap-3 px-4 py-2.5 rounded-xl
                                                        transition-all duration-200 group/item
                                                        ${isActive
                                                            ? 'bg-shibl-crimson text-white shadow-md'
                                                            : 'text-slate-600 hover:bg-slate-100 hover:text-shibl-crimson'
                                                        }
                                                    `}
                                                >
                                                    <span className={`
                                                        ${isActive ? 'text-white' : 'text-slate-400 group-hover/item:text-shibl-crimson'}
                                                    `}>
                                                        {item.icon}
                                                    </span>
                                                    <span className="font-medium text-sm">{item.label}</span>
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

            <div className="p-3 border-t border-slate-100 shrink-0">
                <button
                    onClick={handleLogout}
                    className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl w-full
                        text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200
                        ${isCollapsed ? 'justify-center' : ''}
                    `}
                    title={isCollapsed ? 'تسجيل الخروج' : undefined}
                >
                    <LogOut size={18} />
                    {!isCollapsed && <span className="font-medium text-sm">تسجيل الخروج</span>}
                </button>
            </div>
        </aside>
    );
}
