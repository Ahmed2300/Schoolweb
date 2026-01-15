import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { useLanguage } from '../../hooks';
import { Search } from 'lucide-react';
import { useAuthStore } from '../../store';
import { SessionManager } from './SessionManager';
import { NotificationBell, NotificationToast } from '@/components/notifications';

export function AdminLayout() {
    const { isRTL } = useLanguage();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const { user } = useAuthStore();

    return (
        <div className="min-h-screen bg-soft-cloud" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Real-time Notification Toast - Shows popup on new notification */}
            <NotificationToast />

            {/* Session Management - Tracks inactivity and shows warning before logout */}
            <SessionManager
                enabled={true}
                timeoutMinutes={30}    // Session expires after 30 min of inactivity
                warningSeconds={120}   // Show warning 2 minutes before expiration
            />

            {/* Sidebar - Fixed, doesn't re-render on route change */}
            <AdminSidebar
                isCollapsed={isSidebarCollapsed}
                onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            {/* Main Content */}
            <div
                className={`transition-all duration-300 ${isSidebarCollapsed ? 'mr-20' : 'mr-64'}`}
            >
                {/* Header - Fixed, doesn't re-render on route change */}
                <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-40">
                    {/* Left side - User profile */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-shibl-crimson to-red-700 flex items-center justify-center text-white font-bold">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-charcoal">{user?.name || 'Admin User'}</span>
                            <span className="text-xs text-slate-400">مدير</span>
                        </div>
                    </div>

                    {/* Center - Search */}
                    <div className="flex-1 max-w-xl mx-8">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="ابحث هنا..."
                                className="w-full h-11 pl-4 pr-12 rounded-[12px] bg-slate-50 border border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all text-sm"
                            />
                            <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>

                    {/* Right side - Real-time Notifications Bell */}
                    <NotificationBell />
                </header>

                {/* Page Content - Only this changes on route navigation */}
                <main className="p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

