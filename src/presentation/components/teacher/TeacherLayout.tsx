import { useState, Suspense } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { TeacherSidebar } from './TeacherSidebar';
import { useLanguage } from '../../hooks';
import { useAuthStore } from '../../store';
import { teacherAuthService } from '../../../data/api/teacherAuthService';
import { ROUTES } from '../../../shared/constants';
import { Footer } from '../common/Footer';
import { FloatingSupportButton } from '../common/FloatingSupportButton';

// Icons
import { Search } from 'lucide-react';
import { TeacherNotificationMenu } from './TeacherNotificationMenu';
import { TeacherFirstLoginPopup } from './TeacherFirstLoginPopup'; // Imported Wizard

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



import { useThemeEffect } from '../../../hooks/useThemeEffect';

export function TeacherLayout({
    sessionTimeoutMinutes = 30,
    sessionWarningSeconds = 120,
}: TeacherLayoutProps) {
    const { isRTL } = useLanguage();
    const navigate = useNavigate();
    const { user, logout: storeLogout } = useAuthStore();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // Initialize Theme Effect
    useThemeEffect();

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
            className="min-h-screen bg-[#F8F9FA] dark:bg-[#121212] transition-colors duration-300"
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

            {/* First Login Wizard - Shows only if not seen before */}
            <TeacherFirstLoginPopup />

            {/* Sidebar - Fixed, doesn't re-render on route change */}
            <TeacherSidebar
                isCollapsed={isSidebarCollapsed}
                onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                isMobileOpen={isMobileSidebarOpen}
                onMobileClose={() => setIsMobileSidebarOpen(false)}
            />

            {/* Main Content Area */}
            <div
                className={`
                    transition-all duration-300 flex flex-col min-h-screen
                    ${isRTL
                        ? isSidebarCollapsed ? 'lg:mr-20' : 'lg:mr-64'
                        : isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
                    }
                `}
            >
                {/* Header - Fixed at top */}
                <header className="h-20 bg-white/90 dark:bg-[#1E1E1E]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm transition-colors duration-300">
                    {/* Left side - User profile */}
                    <div className="flex items-center gap-3">
                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMobileSidebarOpen(true)}
                            className="lg:hidden p-2 -ms-2 text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="6" y2="6" /><line x1="3" x2="21" y1="12" y2="12" /><line x1="3" x2="21" y1="18" y2="18" /></svg>
                        </button>

                        <img
                            src={user?.image_path || teacherPlaceholder}
                            alt={user?.name || 'Teacher'}
                            className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 dark:border-white/10"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = teacherPlaceholder;
                            }}
                        />
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-[#1F1F1F] dark:text-white">
                                {user?.name || 'المعلم'}
                            </span>
                            <span className="text-xs text-[#636E72] dark:text-gray-400">معلم</span>
                        </div>
                    </div>



                    {/* Right side - Notifications */}
                    <div className="flex items-center gap-4">
                        <TeacherNotificationMenu />
                    </div>
                </header>

                {/* Page Content - Only this changes on route navigation */}
                <main className="p-8 flex-1">
                    <Suspense fallback={<PageLoadingFallback />}>
                        <Outlet />
                    </Suspense>
                </main>
                <Footer />
            </div>

            <FloatingSupportButton />
        </div>
    );
}

export default TeacherLayout;
