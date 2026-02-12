import { motion } from 'framer-motion';

import { useAuthStore } from '../../../store';
import { useLanguage } from '../../../hooks';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export function DashboardHeader() {
    const { user } = useAuthStore();
    const { isRTL } = useLanguage();

    // Get greeting based on time
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'صباح الخير';
        if (hour < 18) return 'مساء الخير';
        return 'مرحباً';
    };

    const currentDate = format(new Date(), 'EEEE، d MMMM yyyy', { locale: ar });

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8" dir={isRTL ? 'rtl' : 'ltr'}>
            <motion.div
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="flex-1"
            >
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-sm mb-1">
                    <span>{currentDate}</span>
                </div>
                <h1 className="text-xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                    {getGreeting()}، <span className="bg-gradient-to-r from-shibl-crimson to-rose-500 bg-clip-text text-transparent block md:inline">{user?.name?.split(' ')[0] || 'المعلم'}</span> 👋
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-base">أتمنى لك يوماً إنتاجياً مليئاً بالإنجازات</p>
            </motion.div>


        </div>
    );
}
