import { useMemo } from 'react';
import {
    BookOpen,
    Users,
    ClipboardList,
    Star,
    TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardStats {
    totalCourses: number;
    activeCourses: number;
    totalStudents: number;
    totalLectures: number;
}

interface TeacherStatsOverviewProps {
    stats: DashboardStats | null;
    isLoading: boolean;
}

export function TeacherStatsOverview({ stats, isLoading }: TeacherStatsOverviewProps) {
    const statsCards = useMemo(() => [
        {
            title: 'إجمالي الدورات',
            value: stats?.totalCourses ?? 0,
            change: stats?.activeCourses ? `${stats.activeCourses} نشطة` : undefined,
            changeType: 'positive' as const,
            icon: BookOpen,
            color: 'shibl-crimson',
            delay: 0.1
        },
        {
            title: 'الطلاب المسجلين',
            value: stats?.totalStudents ?? 0,
            changeType: 'neutral' as const,
            icon: Users,
            color: 'emerald',
            delay: 0.2
        },
        {
            title: 'المحاضرات',
            value: stats?.totalLectures ?? 0,
            changeType: 'neutral' as const,
            icon: ClipboardList,
            color: 'amber',
            delay: 0.3
        },
    ], [stats]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-5 border border-slate-100 dark:border-white/5 shadow-sm h-32 animate-pulse">
                        <div className="flex justify-between items-start">
                            <div className="h-4 w-20 bg-slate-100 dark:bg-white/5 rounded mb-3"></div>
                            <div className="h-10 w-10 bg-slate-100 dark:bg-white/5 rounded-xl"></div>
                        </div>
                        <div className="h-8 w-12 bg-slate-100 dark:bg-white/5 rounded mt-2"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {statsCards.map((stat, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: stat.delay }}
                    className="relative group bg-white dark:bg-[#1E1E1E] rounded-2xl p-5 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                    {/* Background decoration */}
                    <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color === 'shibl-crimson' ? 'shibl-crimson/5' : stat.color + '-50'} rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 opacity-50`} />

                    <div className="relative z-10 flex justify-between items-start mb-4">
                        <div>
                            <p className="text-slate-500 dark:text-gray-400 text-xs font-medium mb-1">{stat.title}</p>
                            <h3 className="text-3xl font-bold text-charcoal dark:text-white tracking-tight">{stat.value}</h3>
                        </div>
                        <div className={`w-10 h-10 rounded-xl ${stat.color === 'shibl-crimson' ? 'bg-shibl-crimson/10 dark:bg-shibl-crimson/20 text-shibl-crimson group-hover:bg-shibl-crimson/20' : `bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400 group-hover:bg-${stat.color}-100 dark:group-hover:bg-${stat.color}-900/40`} flex items-center justify-center transition-colors`}>
                            <stat.icon size={20} />
                        </div>
                    </div>

                    {/* Footer / Trend */}
                    <div className="relative z-10 flex items-center gap-2">
                        {stat.change ? (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${stat.changeType === 'positive' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-300'
                                }`}>
                                {stat.changeType === 'positive' && <TrendingUp size={10} />}
                                {stat.change}
                            </span>
                        ) : (
                            <span className="text-xs text-slate-grey dark:text-gray-500">لا يوجد تغيير</span>
                        )}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
