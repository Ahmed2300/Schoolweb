import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, TrendingUp, DollarSign, Download, Calendar, Star, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { teacherService } from '../../../data/api';
import { useLanguage } from '../../hooks';
import { DashboardHeader } from '../../components/teacher/dashboard/DashboardHeader';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface AnalyticsStats {
    totalStudents: number;
    activeCourses: number;
    completionRate: number;
    revenue: number;
    revenueGrowth: number;
}

export function TeacherAnalyticsPage() {
    const { isRTL } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<AnalyticsStats | null>(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                // Fetch real data
                const coursesRef = await teacherService.getMyCourses({ per_page: 100 });
                const courses = coursesRef.data || [];

                const totalStudents = courses.reduce((sum, c) => sum + (c.students_count || 0), 0);
                const activeCourses = courses.filter(c => c.is_active).length;

                // Mock data for missing endpoints
                setStats({
                    totalStudents,
                    activeCourses,
                    completionRate: 78,
                    revenue: 4500,
                    revenueGrowth: 12.5
                });
            } catch (error) {
                console.error("Analytics fetch error", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const LineChartMock = () => (
        <div className="relative h-64 w-full flex items-end justify-between px-2 gap-2 mt-4">
            {/* Simple CSS Bar Chart Mock as placeholder for a real library */}
            {[40, 65, 45, 80, 55, 90, 75, 85, 60, 95, 80, 100].map((h, i) => (
                <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    className="w-full bg-shibl-crimson/10 rounded-t-lg relative group hover:bg-shibl-crimson/20 transition-colors"
                >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {h} طالب
                    </div>
                </motion.div>
            ))}
            {/* Axis Lines */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-100" />
            <div className="absolute top-0 bottom-0 left-0 w-px bg-slate-100" />
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-soft-cloud -m-6 p-6" dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
                    {/* Header Skeleton */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <div className="h-4 w-32 bg-slate-200 rounded mb-2" />
                            <div className="h-8 w-48 bg-slate-200 rounded" />
                        </div>
                        <div className="h-10 w-32 bg-slate-200 rounded-xl" />
                    </div>

                    {/* Stats Cards Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm h-32">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="space-y-2">
                                        <div className="h-3 w-20 bg-slate-100 rounded" />
                                        <div className="h-8 w-16 bg-slate-100 rounded" />
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-slate-100" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Charts Area Skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Chart */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-96">
                            <div className="flex justify-between mb-8">
                                <div className="h-6 w-32 bg-slate-100 rounded" />
                                <div className="h-8 w-24 bg-slate-100 rounded-lg" />
                            </div>
                            <div className="h-48 w-full bg-slate-50 rounded-xl mt-8" />
                        </div>

                        {/* List Skeleton */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-96">
                            <div className="h-6 w-40 bg-slate-100 rounded mb-6" />
                            <div className="space-y-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="flex gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex-shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-3 w-24 bg-slate-100 rounded" />
                                            <div className="h-2 w-16 bg-slate-50 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-soft-cloud -m-6 p-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="max-w-7xl mx-auto space-y-8">
                <DashboardHeader />

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-800">تحليلات الأداء</h1>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium">
                        <Download size={18} />
                        تصدير التقرير
                    </button>
                </div>

                {/* Top Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard
                        title="إجمالي الطلاب"
                        value={stats?.totalStudents || 0}
                        icon={Users}
                        color="emerald"
                        trend="+12 هذا الشهر"
                        trendUp={true}
                    />
                    <StatsCard
                        title="الدورات النشطة"
                        value={stats?.activeCourses || 0}
                        icon={BookOpen}
                        color="shibl-crimson"
                    />
                    <StatsCard
                        title="الإيرادات (تجريبي)"
                        value={`$${stats?.revenue}`}
                        icon={DollarSign}
                        color="amber"
                        trend={`${stats?.revenueGrowth}%`}
                        trendUp={true}
                    />
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 text-xs font-bold mb-1">معدل الإكمال</p>
                            <h3 className="text-2xl font-bold text-slate-800">{stats?.completionRate}%</h3>
                        </div>
                        <div className="w-16 h-16">
                            <CircularProgressbar
                                value={stats?.completionRate || 0}
                                text={`${stats?.completionRate}%`}
                                styles={buildStyles({
                                    pathColor: '#AF0C15',
                                    textColor: '#1F1F1F',
                                    trailColor: '#F8F9FA'
                                })}
                            />
                        </div>
                    </div>
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Growth Chart */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                <TrendingUp className="text-shibl-crimson" size={20} />
                                نمو الطلاب
                            </h3>
                            <select className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-3 py-1 text-slate-600 outline-none">
                                <option>آخر 12 شهر</option>
                                <option>آخر 6 أشهر</option>
                                <option>آخر 30 يوم</option>
                            </select>
                        </div>
                        <LineChartMock />
                        <div className="flex justify-between text-xs text-slate-400 mt-2 px-2">
                            <span>يناير</span>
                            <span>فبراير</span>
                            <span>مارس</span>
                            <span>أبريل</span>
                            <span>مايو</span>
                            <span>يونيو</span>
                            <span>يوليو</span>
                            <span>أغسطس</span>
                            <span>سبتمبر</span>
                            <span>أكتوبر</span>
                            <span>نوفمبر</span>
                            <span>ديسمبر</span>
                        </div>
                    </div>

                    {/* Course Popularity & recent */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-lg text-slate-800 mb-4">الدورات الأكثر شعبية</h3>
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-slate-800 truncate">الفيزياء الحديثة</h4>
                                            <p className="text-xs text-slate-500">45 طالب</p>
                                        </div>
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
                                            4.8 <Star size={8} fill="currentColor" />
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon: Icon, color, trend, trendUp }: any) {
    const isCrimson = color === 'shibl-crimson';

    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-slate-500 text-xs font-medium mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
                </div>
                <div className={`w-10 h-10 rounded-xl ${isCrimson ? 'bg-shibl-crimson/10 text-shibl-crimson' : `bg-${color}-50 text-${color}-600`} flex items-center justify-center`}>
                    <Icon size={20} />
                </div>
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-xs font-bold ${trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
                    {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {trend}
                </div>
            )}
        </div>
    );
}
