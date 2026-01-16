import { useState, Suspense } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { TeacherSidebar } from './TeacherSidebar';
import { useLanguage } from '../../hooks';
import { useAuthStore } from '../../store';
import { teacherAuthService } from '../../../data/api/teacherAuthService';
import { ROUTES } from '../../../shared/constants';

// Icons
import { Search, Bell, LogOut } from 'lucide-react';

// Session management hook - adapted for teacher context
import { useSessionManager, SessionTimeoutModal } from '../admin/SessionManager';

// Loading skeleton for Suspense
function PageLoadingFallback() {
    return (
        <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/10 rounded-lg w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 bg-white/5 rounded-2xl" />
                ))}
            </div>
            <div className="h-64 bg-white/5 rounded-2xl" />
        </div>
    );
}

interface TeacherLayoutProps {
    sessionTimeoutMinutes?: number;
    sessionWarningSeconds?: number;
}

export function TeacherLayout({
    sessionTimeoutMinutes = 30,
    sessionWarningSeconds = 120,
}: TeacherLayoutProps) {
    const { isRTL } = useLanguage();
    const navigate = useNavigate();
    const { user, clearUser } = useAuthStore();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Session management - security feature
    const handleSessionExpired = () => {
        clearUser();
        navigate(ROUTES.TEACHER_LOGIN);
    };

    const {
        showModal,
        modalType,
        timeRemaining,
        extendSession,
        logout: sessionLogout,
    } = useSessionManager({
        enabled: true,
        timeoutSeconds: sessionTimeoutMinutes * 60,
        warningTimeSeconds: sessionWarningSeconds,
        onSessionExpired: handleSessionExpired,
    });

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

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#111118] to-[#0a0a0f]"
            dir={isRTL ? 'rtl' : 'ltr'}
        >
            {/* Session Timeout Modal - Security */}
            <SessionTimeoutModal
                isOpen={showModal}
                type={modalType}
                timeRemaining={timeRemaining}
                onExtendSession={extendSession}
                onLogout={() => {
                    sessionLogout();
                    navigate(ROUTES.TEACHER_LOGIN);
                }}
            />

            {/* Sidebar - Fixed, doesn't re-render on route change */}
            <TeacherSidebar
                isCollapsed={isSidebarCollapsed}
                onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            {/* Main Content Area */}
            <div
                className={`
                    transition-all duration-300
                    ${isRTL
                        ? isSidebarCollapsed ? 'mr-20' : 'mr-64'
                        : isSidebarCollapsed ? 'ml-20' : 'ml-64'
                    }
                `}
            >
                {/* Header - Fixed at top */}
                <header className="h-20 bg-[#1a1a2e]/80 backdrop-blur-xl border-b border-white/5 px-8 flex items-center justify-between sticky top-0 z-40">
                    {/* Left side - User profile */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold">
                            {user?.name?.charAt(0) || 'م'}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-white">
                                {user?.name || 'المعلم'}
                            </span>
                            <span className="text-xs text-slate-400">معلم</span>
                        </div>
                    </div>

                    {/* Center - Search */}
                    <div className="flex-1 max-w-xl mx-8">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="ابحث عن الدورات، الطلاب..."
                                className="w-full h-11 px-4 pr-12 rounded-xl bg-white/5 border border-white/10 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all text-sm text-white placeholder:text-slate-500"
                            />
                            <Search
                                size={18}
                                className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`}
                            />
                        </div>
                    </div>

                    {/* Right side - Notifications & Quick Actions */}
                    <div className="flex items-center gap-4">
                        {/* Notifications */}
                        <button
                            className="relative w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all"
                            aria-label="Notifications"
                        >
                            <Bell size={20} />
                            {/* Notification badge */}
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-shibl-crimson text-white text-xs font-bold rounded-full flex items-center justify-center">
                                3
                            </span>
                        </button>

                        {/* Logout button */}
                        <button
                            onClick={handleLogout}
                            className="h-10 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 flex items-center gap-2 transition-all text-sm font-medium"
                            aria-label="Logout"
                        >
                            <LogOut size={18} />
                            <span className="hidden sm:inline">خروج</span>
                        </button>
                    </div>
                </header>

                {/* Page Content - Only this changes on route navigation */}
                <main className="p-8">
                    <Suspense fallback={<PageLoadingFallback />}>
                        <Outlet />
                    </Suspense>
                </main>
            </div>
        </div>
    );
}

export default TeacherLayout;
