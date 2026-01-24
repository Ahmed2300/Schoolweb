import { useState, Suspense } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { TeacherSidebar } from './TeacherSidebar';
import { useLanguage } from '../../hooks';
import { useAuthStore } from '../../store';
import { teacherAuthService } from '../../../data/api/teacherAuthService';
import { ROUTES } from '../../../shared/constants';

// Icons
import { Search } from 'lucide-react';
import { TeacherNotificationMenu } from './TeacherNotificationMenu';

// Assets
import teacherPlaceholder from '../../../assets/images/teacher-placeholder.png';

// Session management hook - adapted for teacher context
import { useSessionManager, SessionTimeoutModal } from '../admin/SessionManager';

// Loading skeleton for Suspense - Light theme
function PageLoadingFallback() {
    return (
        <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded-lg w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 bg-white border border-slate-100 rounded-2xl shadow-sm" />
                ))}
            </div>
            <div className="h-64 bg-white border border-slate-100 rounded-2xl shadow-sm" />
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
    const { user, logout: storeLogout } = useAuthStore();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Session management - security feature
    const handleSessionExpired = () => {
        storeLogout();
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
            storeLogout();
            navigate(ROUTES.TEACHER_LOGIN);
        }
    };

    return (
        <div
            className="min-h-screen bg-[#F8F9FA]"
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
                {/* Header - Fixed at top - Light theme */}
                <header className="h-20 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm">
                    {/* Left side - User profile */}
                    <div className="flex items-center gap-3">
                        <img
                            src={user?.image_path || teacherPlaceholder}
                            alt={user?.name || 'Teacher'}
                            className="w-10 h-10 rounded-full object-cover border-2 border-slate-200"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = teacherPlaceholder;
                            }}
                        />
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-[#1F1F1F]">
                                {user?.name || 'المعلم'}
                            </span>
                            <span className="text-xs text-[#636E72]">معلم</span>
                        </div>
                    </div>

                    {/* Center - Search */}
                    <div className="flex-1 max-w-xl mx-8">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="ابحث عن الدورات، الطلاب..."
                                className="w-full h-11 px-4 pr-12 rounded-xl bg-[#F8F9FA] border border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all text-sm text-[#1F1F1F] placeholder:text-[#636E72]"
                            />
                            <Search
                                size={18}
                                className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-[#636E72]`}
                            />
                        </div>
                    </div>

                    {/* Right side - Notifications */}
                    <div className="flex items-center gap-4">
                        <TeacherNotificationMenu />
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
