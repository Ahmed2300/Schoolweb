import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store';
import {
    Users,
    CreditCard,
    TrendingUp,
    ChevronLeft,
    AlertCircle,
    Calendar,
    BookOpen
} from 'lucide-react';

export function ParentHomePage() {
    const { user } = useAuthStore();
    const displayName = user?.name?.split(' ')[0] || 'ولي الأمر';

    // Mock Data for Children
    const children = [
        {
            id: 1,
            name: 'أحمد',
            grade: 'الصف العاشر',
            avatar: '/images/signin-student.png', // Placeholder
            overallProgress: 85,
            nextClass: 'الرياضيات - 4:00 م',
            alerts: 0,
            courses: 6
        },
        {
            id: 2,
            name: 'سارة',
            grade: 'الصف الخامس',
            avatar: '/images/signup-student.png', // Placeholder
            overallProgress: 92,
            nextClass: 'العلوم - 3:00 م',
            alerts: 2,
            courses: 4
        }
    ];

    // Mock Financial Stats
    const stats = {
        totalDue: 25.000,
        nextPaymentDate: '1 يناير 2025',
        totalActiveCourses: 10
    };

    return (
        <div className="p-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-l from-shibl-crimson via-shibl-crimson to-[#8B0A12] rounded-[28px] p-8 text-white mb-8 relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold mb-2">مرحباً، {displayName}! 👋</h1>
                    <p className="text-white/80 max-w-xl text-lg">
                        تابع تقدم أبنائك الأكاديمي وراقب مستواهم التعليمي أولاً بأول من لوحة تحكم واحدة.
                    </p>
                </div>
                {/* Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-10 -mb-10 blur-xl"></div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Financial Stat */}
                <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-sm font-bold mb-1">الدفعة القادمة</p>
                        <h3 className="text-3xl font-extrabold text-charcoal">{stats.totalDue} <span className="text-sm text-slate-400 font-medium">ر.ع</span></h3>
                        <p className="text-xs text-red-500 font-bold mt-2 flex items-center gap-1">
                            <Calendar size={12} />
                            تاريخ الاستحقاق: {stats.nextPaymentDate}
                        </p>
                    </div>
                    <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                        <CreditCard size={28} />
                    </div>
                </div>

                {/* Total Kids Stat */}
                <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-sm font-bold mb-1">عدد الأبناء</p>
                        <h3 className="text-3xl font-extrabold text-charcoal">{children.length}</h3>
                        <p className="text-xs text-green-500 font-bold mt-2">جميعهم نشطون</p>
                    </div>
                    <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                        <Users size={28} />
                    </div>
                </div>

                {/* Total Courses */}
                <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-sm font-bold mb-1">الدورات النشطة</p>
                        <h3 className="text-3xl font-extrabold text-charcoal">{stats.totalActiveCourses}</h3>
                        <p className="text-xs text-slate-400 mt-2">عبر جميع الأبناء</p>
                    </div>
                    <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center">
                        <BookOpen size={28} />
                    </div>
                </div>
            </div>

            {/* My Children Content */}
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-extrabold text-charcoal flex items-center gap-2">
                    <Users className="text-shibl-crimson" />
                    أبنائي
                </h2>
                <Link to="/parent/children" className="text-sm font-bold text-shibl-crimson hover:underline flex items-center gap-1">
                    عرض الكل
                    <ChevronLeft size={16} />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {children.map(child => (
                    <div key={child.id} className="bg-white rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-100">
                                        <img src={child.avatar} alt={child.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-charcoal">{child.name}</h3>
                                        <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full">{child.grade}</span>
                                    </div>
                                </div>
                                {child.alerts > 0 && (
                                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
                                        <AlertCircle size={12} />
                                        {child.alerts} تنبيهات
                                    </span>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-500 font-bold">التقدم العام للفصل</span>
                                        <span className="text-shibl-crimson font-bold">{child.overallProgress}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-shibl-crimson to-red-400 rounded-full"
                                            style={{ width: `${child.overallProgress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold">الحصة القادمة</p>
                                        <p className="text-sm font-bold text-charcoal">{child.nextClass}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between group-hover:bg-slate-100 transition-colors">
                            <span className="text-xs font-bold text-slate-500">{child.courses} دورات مسجلة</span>
                            <button className="text-sm font-bold text-shibl-crimson flex items-center gap-1">
                                التفاصيل
                                <ChevronLeft size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
