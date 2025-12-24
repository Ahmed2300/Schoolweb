import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '../store';

export function useLanguage() {
    const { i18n, t } = useTranslation();
    const { language, direction, setLanguage } = useUIStore();

    useEffect(() => {
        if (i18n.language !== language) {
            i18n.changeLanguage(language);
        }
    }, [language, i18n]);

    const toggleLanguage = () => {
        const newLang = language === 'ar' ? 'en' : 'ar';
        setLanguage(newLang);
        i18n.changeLanguage(newLang);
    };

    const changeLanguage = (lang: 'ar' | 'en') => {
        setLanguage(lang);
        i18n.changeLanguage(lang);
    };

    return {
        language,
        direction,
        isRTL: direction === 'rtl',
        t,
        toggleLanguage,
        changeLanguage,
    };
}
