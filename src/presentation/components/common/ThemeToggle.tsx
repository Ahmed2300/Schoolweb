import { useTheme } from '../../../context/ThemeContext';
import { Sun, Moon, Laptop } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ThemeToggle = ({ className = '' }: { className?: string }) => {
    const { theme, setTheme } = useTheme();

    const cycleTheme = () => {
        if (theme === 'light') setTheme('dark');
        else if (theme === 'dark') setTheme('system');
        else setTheme('light');
    };

    return (
        <button
            onClick={cycleTheme}
            className={`relative flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors ${className}`}
            aria-label={`Current theme is ${theme}. Click to change.`}
        >
            <AnimatePresence mode="wait" initial={false}>
                {theme === 'light' && (
                    <motion.div
                        key="light"
                        initial={{ y: -20, opacity: 0, rotate: -90 }}
                        animate={{ y: 0, opacity: 1, rotate: 0 }}
                        exit={{ y: 20, opacity: 0, rotate: 90 }}
                        transition={{ duration: 0.2 }}
                        className="absolute"
                    >
                        <Sun size={20} />
                    </motion.div>
                )}
                {theme === 'dark' && (
                    <motion.div
                        key="dark"
                        initial={{ y: -20, opacity: 0, rotate: -90 }}
                        animate={{ y: 0, opacity: 1, rotate: 0 }}
                        exit={{ y: 20, opacity: 0, rotate: 90 }}
                        transition={{ duration: 0.2 }}
                        className="absolute"
                    >
                        <Moon size={20} />
                    </motion.div>
                )}
                {theme === 'system' && (
                    <motion.div
                        key="system"
                        initial={{ y: -20, opacity: 0, rotate: -90 }}
                        animate={{ y: 0, opacity: 1, rotate: 0 }}
                        exit={{ y: 20, opacity: 0, rotate: 90 }}
                        transition={{ duration: 0.2 }}
                        className="absolute"
                    >
                        <Laptop size={20} />
                    </motion.div>
                )}
            </AnimatePresence>
        </button>
    );
};
