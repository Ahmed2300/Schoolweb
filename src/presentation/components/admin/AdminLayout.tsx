import { useState, useEffect, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { useLanguage } from '../../hooks';
import { Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store';
import { SessionManager } from './SessionManager';
import { NotificationBell, NotificationToast } from '@/components/notifications';
import { initializeEcho } from '../../../services/websocket';
import { getToken } from '../../../data/api/ApiClient';
import { useThemeEffect } from '../../../hooks/useThemeEffect';

export function AdminLayout() {
    const { isRTL } = useLanguage();
    const location = useLocation();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { user } = useAuthStore();

    // Apply dark/light theme to the <html> element
    useThemeEffect();

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
        <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#121212] transition-colors duration-300" dir={isRTL ? 'rtl' : 'ltr'}>
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
                <header className="h-16 lg:h-20 bg-white/90 dark:bg-[#1E1E1E]/90 backdrop-blur border-b border-slate-100 dark:border-white/10 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 transition-colors duration-300">
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
                                <span className="text-sm font-bold text-charcoal dark:text-white">{user?.name || 'Admin User'}</span>
                                <span className="text-[10px] lg:text-xs text-slate-400 dark:text-slate-500">مدير النظام</span>
                            </div>
                        </div>
                    </div>



                    {/* Right side - Notifications */}
                    <NotificationBell />
                </header>

                {/* Page Content */}
                <main className="p-4 lg:p-8">
                    <Suspense key={location.pathname} fallback={
                        <div className="animate-pulse space-y-6">
                            <div className="h-8 bg-slate-200 dark:bg-white/10 rounded-lg w-1/3" />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-32 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl shadow-sm" />
                                ))}
                            </div>
                            <div className="h-64 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl shadow-sm" />
                        </div>
                    }>
                        <Outlet />
                    </Suspense>
                </main>
            </div>
        </div>
    );
}

