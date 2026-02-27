import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../../hooks';
import { ROUTES } from '../../../shared/constants';
import { useAuthStore } from '../../store';
import {
    LayoutDashboard,
    LogOut,
    ChevronRight,
    Wallet,
    Settings
} from 'lucide-react';
import { Shield } from 'lucide-react';

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
    className?: string;
}

export function InfluencerSidebar({ isCollapsed, onToggle, className = '' }: SidebarProps) {
    const { isRTL } = useLanguage();
    const location = useLocation();
    const { logout } = useAuthStore();

    const menuItems = [
        { icon: <LayoutDashboard size={22} />, label: 'لوحة القيادة', path: ROUTES.INFLUENCER_DASHBOARD },
        { icon: <Settings size={22} />, label: 'الإعدادات', path: '/influencer/settings' },
    ];

    const handleLogout = () => {
        logout();
        window.location.href = ROUTES.ADMIN_LOGIN;
    };

    return (
        <aside
            className={`
                fixed top-0 bottom-0 z-50 bg-white dark:bg-[#1E1E1E] shadow-xl dark:shadow-black/50 transition-all duration-300
                flex flex-col border-l border-slate-100 dark:border-white/10
                ${isRTL ? 'right-0' : 'left-0'}
                ${isCollapsed ? 'w-20' : 'w-64'}
                ${className}
            `}
        >
            <div className="h-16 lg:h-20 flex items-center justify-between px-4 lg:px-6 relative border-b border-slate-100 dark:border-white/10 shrink-0">
                {!isCollapsed && (
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-500/20">
                            <Shield className="text-indigo-600 dark:text-indigo-400 shrink-0" size={20} />
                        </div>
                        <h1 className="font-cairo font-black text-xl text-slate-800 dark:text-white shrink-0">
                            مسوق
                        </h1>
                    </div>
                )}

                {isCollapsed && (
                    <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-500/20 mx-auto">
                        <Shield className="text-indigo-600 dark:text-indigo-400" size={20} />
                    </div>
                )}

                <button
                    onClick={onToggle}
                    className={`absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/10 rounded-full flex items-center justify-center hover:bg-slate-50 dark:hover:bg-white/5 transition-all hidden lg:flex shadow-sm z-10 ${isCollapsed ? 'rotate-180' : ''}`}
                >
                    <ChevronRight size={14} className="text-slate-400 dark:text-slate-500" />
                </button>
            </div>

            <nav className="flex-1 py-6 px-3 lg:px-4 overflow-y-auto space-y-1 custom-scrollbar">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== ROUTES.INFLUENCER_DASHBOARD);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`
                                flex items-center gap-3 lg:gap-4 px-3 py-3 rounded-xl transition-all duration-200 relative group
                                ${isActive
                                    ? 'bg-indigo-50 text-indigo-700 font-bold dark:bg-indigo-500/10 dark:text-indigo-400'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white'
                                }
                            `}
                            title={isCollapsed ? item.label : undefined}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTabInfluencer"
                                    className="absolute -right-3 top-2 bottom-2 w-1.5 bg-indigo-600 dark:bg-indigo-500 rounded-l-full"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                />
                            )}
                            <div className="shrink-0 transition-transform group-hover:scale-110">
                                {item.icon}
                            </div>
                            {!isCollapsed && <span className="truncate">{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-100 dark:border-white/10 shrink-0">
                <button
                    onClick={handleLogout}
                    className={`
                        w-full flex items-center gap-3 px-4 flex-row-reverse py-3 rounded-xl text-red-600 dark:text-red-400 font-semibold transition-all group
                        ${isCollapsed ? 'justify-center' : 'hover:bg-red-50 dark:hover:bg-red-500/10'}
                    `}
                    title={isCollapsed ? 'تسجيل الخروج' : undefined}
                >
                    <LogOut size={22} className={`shrink-0 ${isCollapsed ? '' : 'group-hover:-translate-x-1'} transition-transform`} />
                    {!isCollapsed && <span>تسجيل الخروج</span>}
                </button>
            </div>
        </aside>
    );
}
