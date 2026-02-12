import { useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';

export const useThemeEffect = () => {
    const { isDarkMode } = useThemeStore();

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
            root.setAttribute('data-theme', 'shibl-dark');
        } else {
            root.classList.remove('dark');
            root.setAttribute('data-theme', 'shibl');
        }
    }, [isDarkMode]);
};
