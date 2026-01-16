import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { useLanguage } from '../../hooks';
import { ROUTES } from '../../../shared/constants';

// Icons
import {
    BookOpen,
    Users,
    ClipboardList,
    TrendingUp,
    Calendar,
    Play,
    ArrowUpRight,
    Star,
    Clock
} from 'lucide-react';

// Stat card component
interface StatCardProps {
    title: string;
    value: string | number;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    icon: React.ElementType;
    iconBg: string;
}

function StatCard({ title, value, change, changeType = 'neutral', icon: Icon, iconBg }: StatCardProps) {
    return (
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all group">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
                    <p className="text-3xl font-bold text-white">{value}</p>
                    {change && (
                        <p className={`text-sm mt-2 flex items-center gap-1 ${changeType === 'positive' ? 'text-emerald-400' :
                                changeType === 'negative' ? 'text-red-400' : 'text-slate-400'
                            }`}>
                            {changeType === 'positive' && <TrendingUp size={14} />}
                            {change}
                        </p>
                    )}
                </div>
                <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon size={24} className="text-white" />
                </div>
            </div>
        </div>
    );
}

// Quick action button
interface QuickActionProps {
    title: string;
    icon: React.ElementType;
    onClick: () => void;
}

function QuickAction({ title, icon: Icon, onClick }: QuickActionProps) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-shibl-crimson/30 transition-all group"
        >
            <div className="w-10 h-10 rounded-lg bg-shibl-crimson/10 group-hover:bg-shibl-crimson/20 flex items-center justify-center transition-colors">
                <Icon size={20} className="text-shibl-crimson" />
            </div>
            <span className="text-white font-medium text-sm">{title}</span>
            <ArrowUpRight size={16} className="text-slate-400 group-hover:text-white transition-colors mr-auto" />
        </button>
    );
}

// Upcoming class card
interface UpcomingClassProps {
    courseName: string;
    time: string;
    studentsCount: number;
    isLive?: boolean;
}

function UpcomingClass({ courseName, time, studentsCount, isLive }: UpcomingClassProps) {
    return (
        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isLive ? 'bg-red-500/20' : 'bg-shibl-crimson/10'}`}>
                {isLive ? (
                    <div className="relative">
                        <Play size={20} className="text-red-400" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    </div>
                ) : (
                    <Clock size={20} className="text-shibl-crimson" />
                )}
            </div>
            <div className="flex-1">
                <p className="text-white font-medium text-sm">{courseName}</p>
                <p className="text-slate-400 text-xs mt-0.5">{time}</p>
            </div>
            <div className="flex items-center gap-1 text-slate-400 text-xs">
                <Users size={14} />
                <span>{studentsCount}</span>
            </div>
        </div>
    );
}

export function TeacherDashboardPage() {
    const { user } = useAuthStore();
    const { isRTL } = useLanguage();
    const navigate = useNavigate();

    // Memoized stats for performance
    const stats = useMemo(() => [
        {
            title: 'إجمالي الدورات',
            value: 8,
            change: '+2 هذا الشهر',
            changeType: 'positive' as const,
            icon: BookOpen,
            iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
        },
        {
            title: 'الطلاب المسجلين',
            value: 156,
            change: '+23 طالب جديد',
            changeType: 'positive' as const,
            icon: Users,
            iconBg: 'bg-gradient-to-br from-emerald-500 to-green-600',
        },
        {
            title: 'الاختبارات النشطة',
            value: 4,
            changeType: 'neutral' as const,
            icon: ClipboardList,
            iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
        },
        {
            title: 'متوسط التقييم',
            value: '4.8',
            change: 'من 5',
            changeType: 'neutral' as const,
            icon: Star,
            iconBg: 'bg-gradient-to-br from-purple-500 to-violet-600',
        },
    ], []);

    // Mock upcoming classes
    const upcomingClasses = useMemo(() => [
        { courseName: 'الرياضيات - الصف الثالث', time: 'اليوم 2:00 م', studentsCount: 28, isLive: true },
        { courseName: 'الفيزياء - الصف الثاني', time: 'اليوم 4:00 م', studentsCount: 22, isLive: false },
        { courseName: 'الكيمياء - الصف الأول', time: 'غداً 10:00 ص', studentsCount: 35, isLive: false },
    ], []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'صباح الخير';
        if (hour < 18) return 'مساء الخير';
        return 'مساء الخير';
    };

    return (
        <div className="space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">
                        {getGreeting()}، {user?.name?.split(' ')[0] || 'المعلم'} 👋
                    </h1>
                    <p className="text-slate-400 mt-1">
                        لديك <span className="text-shibl-crimson font-medium">3 حصص</span> اليوم
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate(ROUTES.TEACHER_COURSES)}
                        className="h-11 px-5 rounded-xl bg-shibl-crimson hover:bg-red-600 text-white font-medium flex items-center gap-2 transition-all hover:-translate-y-0.5 shadow-lg shadow-shibl-crimson/20"
                    >
                        <BookOpen size={18} />
                        <span>دوراتي</span>
                    </button>
                </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upcoming Classes */}
                <div className="lg:col-span-2 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl p-6 border border-white/5">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Calendar size={20} className="text-shibl-crimson" />
                            الحصص القادمة
                        </h2>
                        <button className="text-sm text-shibl-crimson hover:text-red-400 transition-colors">
                            عرض الكل
                        </button>
                    </div>
                    <div className="space-y-3">
                        {upcomingClasses.map((cls, index) => (
                            <UpcomingClass key={index} {...cls} />
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl p-6 border border-white/5">
                    <h2 className="text-lg font-bold text-white mb-6">إجراءات سريعة</h2>
                    <div className="space-y-3">
                        <QuickAction
                            title="إضافة دورة جديدة"
                            icon={BookOpen}
                            onClick={() => navigate(ROUTES.TEACHER_COURSES)}
                        />
                        <QuickAction
                            title="إنشاء اختبار"
                            icon={ClipboardList}
                            onClick={() => navigate(ROUTES.TEACHER_QUIZZES)}
                        />
                        <QuickAction
                            title="عرض الإحصائيات"
                            icon={TrendingUp}
                            onClick={() => navigate(ROUTES.TEACHER_ANALYTICS)}
                        />
                        <QuickAction
                            title="جدول الحصص"
                            icon={Calendar}
                            onClick={() => navigate('/teacher/schedule')}
                        />
                    </div>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl p-6 border border-white/5">
                <h2 className="text-lg font-bold text-white mb-6">النشاط الأخير</h2>
                <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <Clock size={32} className="text-slate-500" />
                    </div>
                    <p className="text-slate-400">سيظهر هنا النشاط الأخير من الطلاب والدورات</p>
                </div>
            </div>
        </div>
    );
}

export default TeacherDashboardPage;
