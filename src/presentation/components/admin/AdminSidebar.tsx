import { ReactNode } from 'react';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    GraduationCap,
    CreditCard,
    BarChart3,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Menu,
    Shield
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ROUTES } from '../../../shared/constants';
import { useAuthStore } from '../../store';

interface NavItem {
    icon: ReactNode;
    label: string;
    path: string;
}

const navItems: NavItem[] = [
    { icon: <LayoutDashboard size={20} />, label: 'لوحة التحكم', path: ROUTES.ADMIN_DASHBOARD },
    { icon: <Shield size={20} />, label: 'المديرين', path: ROUTES.ADMIN_ADMINS },
    { icon: <Users size={20} />, label: 'المستخدمين', path: ROUTES.ADMIN_USERS },
    { icon: <BookOpen size={20} />, label: 'الكورسات', path: ROUTES.ADMIN_COURSES },
    { icon: <GraduationCap size={20} />, label: 'المدرسين', path: '/admin/teachers' },
    { icon: <CreditCard size={20} />, label: 'الاشتراكات', path: ROUTES.ADMIN_SUBSCRIPTIONS },
    { icon: <BarChart3 size={20} />, label: 'التقارير', path: ROUTES.ADMIN_REPORTS },
    { icon: <Settings size={20} />, label: 'الإعدادات', path: ROUTES.ADMIN_SETTINGS },
];

interface AdminSidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

export function AdminSidebar({ isCollapsed, onToggle }: AdminSidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        navigate(ROUTES.ADMIN_LOGIN);
    };

    return (
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
                onClick={onToggle}
                className="absolute top-6 -left-3 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-shibl-crimson hover:border-shibl-crimson transition-colors shadow-sm"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 overflow-y-auto">
                <ul className="space-y-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-[12px]
                                        transition-all duration-200 group
                                        ${isActive
                                            ? 'bg-shibl-crimson text-white shadow-crimson'
                                            : 'text-slate-grey hover:bg-soft-cloud hover:text-shibl-crimson'
                                        }
                                        ${isCollapsed ? 'justify-center' : ''}
                                    `}
                                    title={isCollapsed ? item.label : undefined}
                                >
                                    <span className={isActive ? 'text-white' : 'text-slate-grey group-hover:text-shibl-crimson'}>
                                        {item.icon}
                                    </span>
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
                    onClick={handleLogout}
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
    );
}
