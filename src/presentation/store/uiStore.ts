import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';
type Language = 'ar' | 'en';
type Direction = 'ltr' | 'rtl';

interface UIState {
    theme: Theme;
    language: Language;
    direction: Direction;
    sidebarOpen: boolean;
    sidebarCollapsed: boolean;

    // Actions
    setTheme: (theme: Theme) => void;
    setLanguage: (language: Language) => void;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    toggleSidebarCollapse: () => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set, get) => ({
            theme: 'system',
            language: 'ar',
            direction: 'rtl',
            sidebarOpen: true,
            sidebarCollapsed: false,

            setTheme: (theme) => {
                set({ theme });
                applyTheme(theme);
            },

            setLanguage: (language) => {
                const direction = language === 'ar' ? 'rtl' : 'ltr';
                set({ language, direction });
                document.documentElement.dir = direction;
                document.documentElement.lang = language;
            },

            toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),

            setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

            toggleSidebarCollapse: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
        }),
        {
            name: 'ui-storage',
            onRehydrateStorage: () => (state) => {
                if (state) {
                    applyTheme(state.theme);
                    document.documentElement.dir = state.direction;
                    document.documentElement.lang = state.language;
                }
            },
        }
    )
);

// Helper to apply theme
function applyTheme(theme: Theme) {
    const root = document.documentElement;

    if (theme === 'system') {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', systemDark);
    } else {
        root.classList.toggle('dark', theme === 'dark');
    }
}
