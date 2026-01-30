import { motion } from 'framer-motion';
import { Bell, Search, Settings } from 'lucide-react';
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
            >
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <span>{currentDate}</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
                    {getGreeting()}، <span className="bg-gradient-to-r from-shibl-crimson to-rose-500 bg-clip-text text-transparent">{user?.name?.split(' ')[0] || 'المعلم'}</span> 👋
                </h1>
                <p className="text-slate-500 mt-1">أتمنى لك يوماً إنتاجياً مليئاً بالإنجازات</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex items-center gap-3 self-start md:self-center"
            >
                <div className="relative group">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-shibl-crimson transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="بحث سريع..."
                        className="h-11 pl-4 pr-10 rounded-xl bg-white border border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none w-full md:w-64 transition-all text-sm"
                    />
                </div>

                <button className="h-11 w-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-shibl-crimson hover:border-shibl-crimson/30 hover:bg-red-50 transition-all relative">
                    <Bell size={20} />
                    <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 p-0.5 cursor-pointer">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                        <img
                            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=random`}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
