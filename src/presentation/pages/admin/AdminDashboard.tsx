import { StatCard } from '../../components/admin';
import {
    Users,
    BookOpen,
    DollarSign,
    UserPlus,
    Plus,
    FileText,
    Clock
} from 'lucide-react';

// Mock data - will be replaced with API calls
const stats = [
    {
        icon: <Users size={28} className="text-blue-600" />,
        iconBgColor: 'bg-blue-100',
        label: 'إجمالي الطلاب',
        value: '12,450',
        trend: { value: '+4%', isPositive: true }
    },
    {
        icon: <BookOpen size={28} className="text-purple-600" />,
        iconBgColor: 'bg-purple-100',
        label: 'الكورسات النشطة',
        value: '34',
        trend: { value: '+2', isPositive: true }
    },
    {
        icon: <DollarSign size={28} className="text-green-600" />,
        iconBgColor: 'bg-green-100',
        label: 'الإيرادات',
        value: '$10,000',
        trend: { value: '+8%', isPositive: true }
    },
    {
        icon: <UserPlus size={28} className="text-amber-600" />,
        iconBgColor: 'bg-amber-100',
        label: 'الاشتراكات الجديدة',
        value: '540',
        trend: { value: '+12%', isPositive: true }
    },
];

const recentActivities = [
    {
        id: 1,
        user: 'أحمد علي',
        action: 'سجل مستخدم جديد',
        time: 'منذ 5 دقائق',
        avatar: 'أ'
    },
    {
        id: 2,
        user: 'فاطمة حسن',
        action: 'إتمام كورس: تصميم واجهة المستخدم',
        time: 'منذ 30 دقيقة',
        avatar: 'ف'
    },
    {
        id: 3,
        user: 'محمد سعيد',
        action: 'تحديث محتوى كورس: تطوير الويب',
        time: 'منذ ساعة واحدة',
        avatar: 'م'
    },
];

const quickActions = [
    { icon: <Plus size={20} />, label: 'إضافة كورس', color: 'bg-shibl-crimson hover:bg-shibl-crimson-dark shadow-crimson', textColor: 'text-white' },
    { icon: <UserPlus size={20} />, label: 'إضافة مستخدم', color: 'bg-success-green hover:bg-green-700 shadow-lg shadow-green-500/25', textColor: 'text-white' },
    { icon: <FileText size={20} />, label: 'عرض التقارير', color: 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/25', textColor: 'text-white' },
];

export function AdminDashboard() {
    // Get current date in Arabic
    const today = new Date().toLocaleDateString('ar-EG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <>
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-charcoal mb-1">مرحباً، أدمن 👋</h1>
                <p className="text-slate-500">{today}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            {/* Bottom Section - Activity + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100">
                    <h2 className="text-lg font-bold text-charcoal mb-4 flex items-center gap-2">
                        <span>إجراءات سريعة</span>
                    </h2>
                    <div className="flex flex-col gap-3">
                        {quickActions.map((action, index) => (
                            <button
                                key={index}
                                className={`flex items-center justify-center gap-2 py-3.5 px-6 rounded-pill font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 ${action.color} ${action.textColor}`}
                            >
                                {action.icon}
                                <span>{action.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-card border border-slate-100">
                    <h2 className="text-lg font-bold text-charcoal mb-4 flex items-center gap-2">
                        <Clock size={20} className="text-shibl-crimson" />
                        <span>النشاط الأخير</span>
                    </h2>
                    <div className="flex flex-col gap-4">
                        {recentActivities.map((activity) => (
                            <div
                                key={activity.id}
                                className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-shibl-crimson to-red-700 flex items-center justify-center text-white font-bold text-sm">
                                    {activity.avatar}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-charcoal">
                                        <span className="font-bold">{activity.user}:</span> {activity.action}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

