import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { useLanguage } from '../../hooks';
import { Search, Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store';
import { SessionManager } from './SessionManager';
import { NotificationBell, NotificationToast } from '@/components/notifications';
import { initializeEcho, disconnectEcho } from '../../../services/websocket';
import { getToken } from '../../../data/api/ApiClient';
import { useEffect } from 'react';

export function AdminLayout() {
    const { isRTL } = useLanguage();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { user } = useAuthStore();

    // Ensure WebSocket is initialized (safe to call repeatedly as it's a singleton)
    // We call it here so it's ready before children components mount
    const token = getToken();
    if (token) {
        initializeEcho(token);
    }

    // Cleanup on unmount
    // Cleanup on unmount - REMOVED to prevent Strict Mode from killing the shared connection
    // We rely on explicit logout or window close to disconnect

    return (
        <div className="min-h-screen bg-soft-cloud" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Real-time Notification Toast */}
            <NotificationToast />

            {/* Session Management */}
            <SessionManager
                enabled={true}
                timeoutMinutes={30}
                warningSeconds={120}
            />

            {/* Mobile Overlay Backdrop */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <AdminSidebar
                isCollapsed={isSidebarCollapsed}
                onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className={`
                    transform transition-transform duration-300
                    ${isMobileOpen ? 'translate-x-0' : 'translate-x-full'}
                    lg:!translate-x-0
                `}
            />

            {/* Main Content */}
            <div
                className={`transition-all duration-300 mr-0 ${isSidebarCollapsed ? 'lg:mr-20' : 'lg:mr-64'}`}
            >
                {/* Header */}
                <header className="h-16 lg:h-20 bg-white border-b border-slate-100 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 transition-all">
                    {/* Left side - User & Mobile Toggle */}
                    <div className="flex items-center gap-3 lg:gap-4">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileOpen(!isMobileOpen)}
                            className="lg:hidden p-2 -mr-2 text-slate-500 hover:bg-slate-50 rounded-lg"
                        >
                            {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-shibl-crimson to-red-700 flex items-center justify-center text-white font-bold text-sm lg:text-base shadow-sm">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                            <div className="hidden sm:flex flex-col">
                                <span className="text-sm font-bold text-charcoal">{user?.name || 'Admin User'}</span>
                                <span className="text-[10px] lg:text-xs text-slate-400">مدير النظام</span>
                            </div>
                        </div>
                    </div>

                    {/* Center - Search (Hidden on small mobile) */}
                    <div className="hidden md:block flex-1 max-w-xl mx-4 lg:mx-8">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="ابحث هنا..."
                                className="w-full h-10 lg:h-11 pl-4 pr-12 rounded-[12px] bg-slate-50 border border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all text-sm"
                            />
                            <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>
                    {/* Mobile Search Icon */}
                    <button className="md:hidden p-2 text-slate-500">
                        <Search size={20} />
                    </button>

                    {/* Right side - Notifications */}
                    <NotificationBell />
                </header>

                {/* Page Content */}
                <main className="p-4 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

