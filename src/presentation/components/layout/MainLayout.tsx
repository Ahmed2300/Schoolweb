import { ReactNode } from 'react';
import { useLanguage } from '../../hooks';
import { useUIStore } from '../../store';
import './MainLayout.css';

interface MainLayoutProps {
    children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
    const { isRTL, t, toggleLanguage, language } = useLanguage();
    const { theme, setTheme, sidebarOpen, toggleSidebar } = useUIStore();

    return (
        <div className={`main-layout ${isRTL ? 'rtl' : 'ltr'}`}>
            {/* Header */}
            <header className="header">
                <div className="header-start">
                    <button className="menu-btn" onClick={toggleSidebar} aria-label="Toggle menu">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 12h18M3 6h18M3 18h18" />
                        </svg>
                    </button>
                    <h1 className="logo">{t('common.appName')}</h1>
                </div>

                <div className="header-end">
                    {/* Language Toggle */}
                    <button className="lang-btn" onClick={toggleLanguage}>
                        {language === 'ar' ? 'EN' : 'عربي'}
                    </button>

                    {/* Theme Toggle */}
                    <button
                        className="theme-btn"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                </div>
            </header>

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <nav className="sidebar-nav">
                    <a href="/" className="nav-link active">
                        <span className="nav-icon">🏠</span>
                        <span className="nav-text">{t('nav.home')}</span>
                    </a>
                    <a href="/courses" className="nav-link">
                        <span className="nav-icon">📚</span>
                        <span className="nav-text">{t('nav.courses')}</span>
                    </a>
                    <a href="/my-courses" className="nav-link">
                        <span className="nav-icon">📖</span>
                        <span className="nav-text">{t('nav.myCourses')}</span>
                    </a>
                    <a href="/schedule" className="nav-link">
                        <span className="nav-icon">📅</span>
                        <span className="nav-text">{t('nav.schedule')}</span>
                    </a>
                    <a href="/quizzes" className="nav-link">
                        <span className="nav-icon">📝</span>
                        <span className="nav-text">{t('nav.quizzes')}</span>
                    </a>
                </nav>

                <div className="sidebar-footer">
                    <a href="/profile" className="nav-link">
                        <span className="nav-icon">👤</span>
                        <span className="nav-text">{t('nav.profile')}</span>
                    </a>
                    <a href="/settings" className="nav-link">
                        <span className="nav-icon">⚙️</span>
                        <span className="nav-text">{t('nav.settings')}</span>
                    </a>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`main-content ${sidebarOpen ? '' : 'expanded'}`}>
                {children}
            </main>
        </div>
    );
}
