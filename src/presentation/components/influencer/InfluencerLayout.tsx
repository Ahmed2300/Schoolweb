import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { InfluencerSidebar } from './InfluencerSidebar';
import { useLanguage } from '../../hooks';
import { Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store';
import { SessionManager } from '../admin/SessionManager';
import { useThemeEffect } from '../../../hooks/useThemeEffect';

export function InfluencerLayout() {
    const { isRTL } = useLanguage();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { user } = useAuthStore();

    useThemeEffect();

    return (
        <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#121212] transition-colors duration-300" dir={isRTL ? 'rtl' : 'ltr'}>

            <SessionManager
                enabled={true}
                timeoutMinutes={30}
                warningSeconds={120}
            />

            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <InfluencerSidebar
                isCollapsed={isSidebarCollapsed}
                onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className={`
                    transform transition-transform duration-300
                    ${isMobileOpen ? 'translate-x-0' : 'translate-x-full'}
                    lg:!translate-x-0
                `}
            />

            <div
                className={`transition-all duration-300 mr-0 ${isSidebarCollapsed ? 'lg:mr-20' : 'lg:mr-64'}`}
            >
                <header className="h-16 lg:h-20 bg-white/90 dark:bg-[#1E1E1E]/90 backdrop-blur border-b border-slate-100 dark:border-white/10 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 transition-colors duration-300">
                    <div className="flex items-center gap-3 lg:gap-4">
                        <button
                            onClick={() => setIsMobileOpen(!isMobileOpen)}
                            className="lg:hidden p-2 -mr-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg"
                        >
                            {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-sm lg:text-base shadow-sm">
                                {user?.name?.charAt(0) || 'I'}
                            </div>
                            <div className="hidden sm:flex flex-col">
                                <span className="text-sm font-bold text-charcoal dark:text-white">{user?.name || 'Influencer'}</span>
                                <span className="text-[10px] lg:text-xs text-slate-400 dark:text-slate-500">مسوق / مؤثر</span>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-4 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
