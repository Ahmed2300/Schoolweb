import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../../components/admin';
import {
    Users,
    BookOpen,
    GraduationCap,
    UserPlus,
    Plus,
    FileText,
    Clock,
    Loader2,
    UsersRound,
    AlertCircle,
    CreditCard,
    Activity,
    CheckCircle2,
    Trash2,
    Edit,
    ArrowRight
} from 'lucide-react';
import { adminService } from '../../../data/api/adminService';
import { useAuthStore } from '../../store';

interface DashboardStats {
    totalStudents: number;
    totalParents: number;
    totalTeachers: number;
    totalCourses: number;
}

interface ActivityLogItem {
    id: number;
    description: string;
    subject_type?: string;
    subject_id?: number;
    subject?: {
        id: number;
        name?: string;
        title?: string;
    };
    causer_type?: string;
    causer_id?: number;
    properties?: Record<string, unknown>;
    created_at: string;
    causer?: {
        id: number;
        name: string;
    };
}

const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `منذ ${diffDays} يوم`;

    return date.toLocaleDateString('ar-EG');
};

const getActivityConfig = (description: string) => {
    const LowerDesc = description.toLowerCase();
    if (LowerDesc.includes('created')) return {
        label: 'إنشاء',
        icon: <CheckCircle2 size={18} />,
        bg: 'bg-emerald-100',
        text: 'text-emerald-700'
    };
    if (LowerDesc.includes('updated')) return {
        label: 'تحديث',
        icon: <Edit size={18} />,
        bg: 'bg-blue-100',
        text: 'text-blue-700'
    };
    if (LowerDesc.includes('deleted')) return {
        label: 'حذف',
        icon: <Trash2 size={18} />,
        bg: 'bg-red-100',
        text: 'text-red-700'
    };
    return {
        label: description,
        icon: <Activity size={18} />,
        bg: 'bg-slate-100',
        text: 'text-slate-600'
    };
};


// --- Helper Components for Dashboard Redesign ---

const DashboardStatCard = ({ icon, label, value, trend, index }: any) => {
    // Alternate subtle gradients for a premium feel
    const gradient = index % 2 === 0
        ? 'bg-gradient-to-br from-white dark:from-[#1E1E1E] to-red-50/30 dark:to-[#1E1E1E]'
        : 'bg-gradient-to-br from-white dark:from-[#1E1E1E] to-rose-50/30 dark:to-[#1E1E1E]';

    return (
        <div className={`${gradient} relative overflow-hidden rounded-[24px] p-6 border border-slate-100/60 dark:border-white/10 shadow-[0_4px_20px_-4px_rgba(31,31,31,0.03)] hover:shadow-[0_8px_30px_-4px_rgba(175,12,21,0.1)] transition-all duration-300 group hover:-translate-y-1`}>
            {/* Decorative background circle */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-shibl-crimson/5 rounded-full blur-2xl group-hover:bg-shibl-crimson/10 transition-all duration-500"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white shadow-sm border border-slate-50 text-shibl-crimson group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                        {icon}
                    </div>
                </div>

                <div className="space-y-1">
                    <h3 className="text-3xl font-extrabold text-charcoal dark:text-white tracking-tight">{value}</h3>
                    <p className="text-slate-500 text-sm font-medium flex items-center justify-between">
                        {label}
                        {trend && (
                            <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${trend.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                {trend.isPositive ? '↑' : '↓'} {trend.value}
                            </span>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
};

const QuickActionCard = ({ icon, label, onClick, index }: any) => {
    return (
        <button
            onClick={onClick}
            className="group relative flex flex-col items-center justify-center gap-3 p-6 rounded-[20px] bg-white dark:bg-[#1E1E1E] border border-slate-100 dark:border-white/10 shadow-[0_2px_8px_-2px_rgba(31,31,31,0.05)] hover:shadow-[0_8px_24px_-6px_rgba(175,12,21,0.15)] hover:border-shibl-crimson/20 transition-all duration-300 hover:-translate-y-1"
        >
            <div className={`p-3 rounded-xl bg-slate-50 text-slate-600 group-hover:bg-shibl-crimson group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-[0_4px_12px_rgba(175,12,21,0.3)]`}>
                {icon}
            </div>
            <span className="font-bold text-sm text-charcoal dark:text-white group-hover:text-shibl-crimson transition-colors duration-300">{label}</span>
        </button>
    );
};

export function AdminDashboard() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [activities, setActivities] = useState<ActivityLogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activitiesLoading, setActivitiesLoading] = useState(true);
    const [activitiesError, setActivitiesError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            const data = await adminService.getDashboardStats();
            setStats(data);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchActivities = useCallback(async () => {
        try {
            setActivitiesLoading(true);
            setActivitiesError(null);
            const response = await adminService.getActivityLogs({ per_page: 5 });
            setActivities(response.data || []);
        } catch (error: unknown) {
            console.error('Error fetching activity logs:', error);
            setActivitiesError('فشل في تحميل سجل النشاط');
        } finally {
            setActivitiesLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
        fetchActivities();
    }, [fetchStats, fetchActivities]);

    const today = new Date().toLocaleDateString('ar-EG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const adminName = user?.name || 'أدمن';

    const quickActions = [
        {
            icon: <Plus size={24} />,
            label: 'إضافة كورس',
            onClick: () => navigate('/admin/courses')
        },
        {
            icon: <UserPlus size={24} />,
            label: 'إضافة مستخدم',
            onClick: () => navigate('/admin/users')
        },
        {
            icon: <CreditCard size={24} />,
            label: 'المدفوعات',
            onClick: () => navigate('/admin/payments')
        },
        {
            icon: <FileText size={24} />,
            label: 'التقارير',
            onClick: () => navigate('/admin/reports')
        },
    ];

    const statsDisplay = [
        {
            icon: <Users size={24} />,
            label: 'إجمالي الطلاب',
            value: loading ? '...' : stats?.totalStudents.toLocaleString('ar-EG') || '0',
            trend: { value: '+12%', isPositive: true }
        },
        {
            icon: <BookOpen size={24} />,
            label: 'الكورسات النشطة',
            value: loading ? '...' : stats?.totalCourses.toLocaleString('ar-EG') || '0',
            trend: { value: '+5%', isPositive: true }
        },
        {
            icon: <GraduationCap size={24} />,
            label: 'المدرسين',
            value: loading ? '...' : stats?.totalTeachers.toLocaleString('ar-EG') || '0',
            trend: { value: '', isPositive: true }
        },
        {
            icon: <UsersRound size={24} />,
            label: 'أولياء الأمور',
            value: loading ? '...' : stats?.totalParents.toLocaleString('ar-EG') || '0',
            trend: { value: '', isPositive: true }
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-charcoal dark:text-white mb-2 tracking-tight">
                        مرحباً، <span className="bg-gradient-to-r from-shibl-crimson to-rose-600 bg-clip-text text-transparent">{adminName}</span> 👋
                    </h1>
                    <p className="text-slate-500 font-medium flex items-center gap-2">
                        <Clock size={16} className="text-shibl-crimson" />
                        {today}
                    </p>
                </div>
                {/* Optional Top Action can go here */}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="bg-white dark:bg-[#1E1E1E] rounded-[24px] p-6 shadow-sm border border-slate-100 dark:border-white/10 animate-pulse h-40"></div>
                    ))
                ) : (
                    statsDisplay.map((stat, index) => (
                        <DashboardStatCard key={index} icon={stat.icon} label={stat.label} value={stat.value} trend={stat.trend} index={index} />
                    ))
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area - Activity Log */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-charcoal dark:text-white flex items-center gap-2">
                            <Activity size={22} className="text-shibl-crimson" />
                            <span>النشاط الأخير</span>
                        </h2>
                        <button className="text-sm font-bold text-shibl-crimson hover:text-shibl-crimson-dark transition-colors flex items-center gap-1 group">
                            عرض الكل
                            <ArrowRight size={16} className="group-hover:-translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="bg-white dark:bg-[#1E1E1E] rounded-[24px] p-2 shadow-[0_2px_12px_-4px_rgba(31,31,31,0.05)] border border-slate-100/60 dark:border-white/10">
                        {activitiesLoading ? (
                            <div className="space-y-2 p-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 animate-pulse h-20"></div>
                                ))}
                            </div>
                        ) : activitiesError ? (
                            <div className="flex items-center justify-center py-12 text-red-500">
                                <AlertCircle size={20} className="ml-2" />
                                <span>{activitiesError}</span>
                            </div>
                        ) : activities.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                    <Clock size={32} />
                                </div>
                                <span className="font-medium">لا يوجد نشاط حتى الآن</span>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {activities.map((activity) => {
                                    const config = getActivityConfig(activity.description);
                                    return (
                                        <div
                                            key={activity.id}
                                            className="group flex items-center gap-4 p-4 rounded-[16px] hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-200 border border-transparent hover:border-slate-100 dark:hover:border-white/10"
                                        >
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${config.bg} ${config.text} group-hover:scale-105 transition-transform duration-300 shadow-sm`}>
                                                {config.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[15px] font-semibold text-charcoal dark:text-white truncate">
                                                    {config.label} <span className="text-slate-500 font-normal">في</span> {activity.subject?.name || activity.subject?.title || activity.subject_type?.split('\\').pop()}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                    <span className="font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">{activity.causer?.name || 'مسؤول'}</span>
                                                    <span>•</span>
                                                    <span>{formatTimeAgo(activity.created_at)}</span>
                                                </p>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="text-slate-400 hover:text-shibl-crimson p-2 rounded-lg hover:bg-white transition-all">
                                                    <ArrowRight size={16} className="rotate-180" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar / Quick Actions */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-charcoal dark:text-white flex items-center gap-2">
                        <span>إجراءات سريعة</span>
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                        {quickActions.map((action, index) => (
                            <QuickActionCard key={index} {...action} index={index} />
                        ))}
                    </div>

                    {/* Promo/Ad Space or Tips */}
                    <div className="bg-gradient-to-br from-shibl-crimson to-shibl-crimson-dark rounded-[24px] p-6 text-white text-center shadow-[0_8px_24px_-6px_rgba(175,12,21,0.4)] relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                        {/* Decorative Circles */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-500/20 rounded-full -ml-8 -mb-8 blur-lg"></div>

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform duration-300">
                                <Activity size={24} className="text-white" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">النظام يعمل بكفاءة</h3>
                            <p className="text-white/80 text-sm mb-4">تم تحديث جميع السجلات بنجاح. لا توجد تنبيهات عاجلة.</p>
                            <button className="bg-white text-shibl-crimson font-bold py-2 px-6 rounded-xl text-sm hover:bg-rose-50 transition-colors shadow-sm w-full">
                                عرض التقارير
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

