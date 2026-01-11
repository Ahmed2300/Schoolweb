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
    Activity
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
    return `منذ ${diffDays} يوم`;
};

const getActionLabel = (description: string): string => {
    if (description.includes('created')) return 'إنشاء';
    if (description.includes('updated')) return 'تحديث';
    if (description.includes('deleted')) return 'حذف';
    return description;
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
            icon: <Plus size={20} />,
            label: 'إضافة كورس',
            color: 'bg-shibl-crimson hover:bg-shibl-crimson-dark shadow-crimson',
            textColor: 'text-white',
            onClick: () => navigate('/admin/courses')
        },
        {
            icon: <UserPlus size={20} />,
            label: 'إضافة مستخدم',
            color: 'bg-success-green hover:bg-green-700 shadow-lg shadow-green-500/25',
            textColor: 'text-white',
            onClick: () => navigate('/admin/users')
        },
        {
            icon: <CreditCard size={20} />,
            label: 'المدفوعات',
            color: 'bg-purple-500 hover:bg-purple-600 shadow-lg shadow-purple-500/25',
            textColor: 'text-white',
            onClick: () => navigate('/admin/payments')
        },
        {
            icon: <FileText size={20} />,
            label: 'عرض التقارير',
            color: 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/25',
            textColor: 'text-white',
            onClick: () => navigate('/admin/reports')
        },
    ];

    const statsDisplay = [
        {
            icon: <Users size={28} className="text-blue-600" />,
            iconBgColor: 'bg-blue-100',
            label: 'إجمالي الطلاب',
            value: loading ? '...' : stats?.totalStudents.toLocaleString('ar-EG') || '0',
            trend: { value: '', isPositive: true }
        },
        {
            icon: <BookOpen size={28} className="text-purple-600" />,
            iconBgColor: 'bg-purple-100',
            label: 'الكورسات',
            value: loading ? '...' : stats?.totalCourses.toLocaleString('ar-EG') || '0',
            trend: { value: '', isPositive: true }
        },
        {
            icon: <GraduationCap size={28} className="text-green-600" />,
            iconBgColor: 'bg-green-100',
            label: 'المدرسين',
            value: loading ? '...' : stats?.totalTeachers.toLocaleString('ar-EG') || '0',
            trend: { value: '', isPositive: true }
        },
        {
            icon: <UsersRound size={28} className="text-amber-600" />,
            iconBgColor: 'bg-amber-100',
            label: 'أولياء الأمور',
            value: loading ? '...' : stats?.totalParents.toLocaleString('ar-EG') || '0',
            trend: { value: '', isPositive: true }
        },
    ];

    return (
        <>
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-charcoal mb-1">مرحباً، {adminName} 👋</h1>
                <p className="text-slate-500">{today}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {loading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="bg-white rounded-2xl p-6 shadow-card border border-slate-100 animate-pulse">
                            <div className="flex items-center justify-between">
                                <div className="w-14 h-14 rounded-xl bg-slate-200"></div>
                                <div className="text-left">
                                    <div className="h-4 bg-slate-200 rounded w-20 mb-2"></div>
                                    <div className="h-8 bg-slate-200 rounded w-16"></div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    statsDisplay.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100">
                    <h2 className="text-lg font-bold text-charcoal mb-4 flex items-center gap-2">
                        <span>إجراءات سريعة</span>
                    </h2>
                    <div className="flex flex-col gap-3">
                        {quickActions.map((action, index) => (
                            <button
                                key={index}
                                onClick={action.onClick}
                                className={`flex items-center justify-center gap-2 py-3.5 px-6 rounded-pill font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 ${action.color} ${action.textColor}`}
                            >
                                {action.icon}
                                <span>{action.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-card border border-slate-100">
                    <h2 className="text-lg font-bold text-charcoal mb-4 flex items-center gap-2">
                        <Activity size={20} className="text-shibl-crimson" />
                        <span>النشاط الأخير</span>
                    </h2>

                    {activitiesLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 size={24} className="animate-spin text-shibl-crimson" />
                            <span className="mr-2 text-slate-500">جاري التحميل...</span>
                        </div>
                    ) : activitiesError ? (
                        <div className="flex items-center justify-center py-12 text-red-500">
                            <AlertCircle size={20} className="ml-2" />
                            <span>{activitiesError}</span>
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <Clock size={32} className="mb-2" />
                            <span>لا يوجد نشاط حتى الآن</span>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {activities.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-shibl-crimson to-red-700 flex items-center justify-center text-white font-bold text-sm">
                                        {activity.causer?.name?.charAt(0) || 'م'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-charcoal">
                                            <span className="font-bold">{activity.causer?.name || 'مسؤول'}:</span>{' '}
                                            {getActionLabel(activity.description)} {activity.subject_type?.split('\\').pop()}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">{formatTimeAgo(activity.created_at)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

