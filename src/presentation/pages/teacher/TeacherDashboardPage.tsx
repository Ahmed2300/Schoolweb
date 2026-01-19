import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { useLanguage } from '../../hooks';
import { ROUTES } from '../../../shared/constants';
import { teacherService, TeacherCourse, getCourseName } from '../../../data/api';

// Icons
import {
    BookOpen,
    Users,
    ClipboardList,
    TrendingUp,
    Calendar,
    Play,
    ArrowUpLeft,
    ArrowUpRight,
    Star,
    Clock,
    AlertCircle,
    RefreshCw,
    CheckCircle2,
    Circle,
    MoreVertical,
    Video
} from 'lucide-react';

// ==================== TYPES ====================

interface DashboardStats {
    totalCourses: number;
    activeCourses: number;
    totalStudents: number;
    totalLectures: number;
}

// ==================== COMPONENTS ====================

// Stat card component with WCAG-compliant text colors
interface StatCardProps {
    title: string;
    value: string | number;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    icon: React.ElementType;
    iconBg: string;
    isLoading?: boolean;
}

function StatCard({ title, value, change, changeType = 'neutral', icon: Icon, iconBg, isLoading }: StatCardProps) {
    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-pulse">
                <div className="flex items-start justify-between">
                    <div className="space-y-3">
                        <div className="h-4 w-24 bg-slate-200 rounded" />
                        <div className="h-8 w-16 bg-slate-200 rounded" />
                        <div className="h-3 w-20 bg-slate-200 rounded" />
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-slate-200" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all group">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[#636E72] text-sm font-medium mb-1">{title}</p>
                    <p className="text-3xl font-bold text-[#1F1F1F]">{value}</p>
                    {change && (
                        <p className={`text-sm mt-2 flex items-center gap-1 ${changeType === 'positive' ? 'text-[#27AE60]' :
                            changeType === 'negative' ? 'text-red-600' : 'text-[#636E72]'
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

// Onboarding Checklist for Zero State
interface OnboardingChecklistProps {
    totalCourses: number;
    totalLectures: number;
    onAction: (action: string) => void;
}

function OnboardingChecklist({ totalCourses, totalLectures, onAction }: OnboardingChecklistProps) {
    const steps = [
        {
            id: 'create-course',
            label: 'إنشاء دورتك الأولى',
            description: 'ابدأ بإضافة دورة جديدة لطلابك',
            completed: totalCourses > 0,
            action: 'course',
        },
        {
            id: 'add-lectures',
            label: 'إضافة محاضرات',
            description: 'أضف محتوى تعليمي لدوراتك',
            completed: totalLectures > 0,
            action: 'lecture',
        },
        {
            id: 'create-quiz',
            label: 'إنشاء اختبار',
            description: 'قيّم مستوى طلابك بالاختبارات',
            completed: false,
            action: 'quiz',
        },
        {
            id: 'invite-students',
            label: 'دعوة الطلاب',
            description: 'شارك رابط الدورة مع طلابك',
            completed: false,
            action: 'invite',
        },
    ];

    const completedCount = steps.filter(s => s.completed).length;
    const progress = (completedCount / steps.length) * 100;

    return (
        <div className="bg-gradient-to-br from-shibl-crimson/5 to-purple-500/5 rounded-2xl p-6 border border-shibl-crimson/10">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-bold text-[#1F1F1F] flex items-center gap-2">
                        🚀 ابدأ رحلتك التعليمية
                    </h2>
                    <p className="text-[#636E72] text-sm mt-1">
                        أكمل الخطوات التالية لتفعيل حسابك
                    </p>
                </div>
                <div className="text-sm font-medium text-shibl-crimson">
                    {completedCount}/{steps.length} مكتمل
                </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-slate-200 rounded-full mb-6 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-shibl-crimson to-red-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Steps */}
            <div className="space-y-3">
                {steps.map((step) => (
                    <button
                        key={step.id}
                        onClick={() => !step.completed && onAction(step.action)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all text-right ${step.completed
                                ? 'bg-[#27AE60]/10 border border-[#27AE60]/20'
                                : 'bg-white border border-slate-200 hover:border-shibl-crimson/30 hover:bg-slate-50'
                            }`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${step.completed ? 'bg-[#27AE60] text-white' : 'bg-slate-100 text-[#636E72]'
                            }`}>
                            {step.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                        </div>
                        <div className="flex-1">
                            <p className={`font-medium text-sm ${step.completed ? 'text-[#27AE60] line-through' : 'text-[#1F1F1F]'}`}>
                                {step.label}
                            </p>
                            <p className="text-[#636E72] text-xs mt-0.5">{step.description}</p>
                        </div>
                        {!step.completed && (
                            <ArrowUpLeft size={16} className="text-slate-400" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}

// Quick action button with RTL-aware arrows
interface QuickActionProps {
    title: string;
    icon: React.ElementType;
    onClick: () => void;
    isRTL: boolean;
}

function QuickAction({ title, icon: Icon, onClick, isRTL }: QuickActionProps) {
    const ArrowIcon = isRTL ? ArrowUpLeft : ArrowUpRight;

    return (
        <button
            onClick={onClick}
            className="flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 hover:border-shibl-crimson/30 transition-all group w-full"
        >
            <div className="w-10 h-10 rounded-lg bg-shibl-crimson/10 group-hover:bg-shibl-crimson/20 flex items-center justify-center transition-colors">
                <Icon size={20} className="text-shibl-crimson" />
            </div>
            <span className="text-[#1F1F1F] font-medium text-sm flex-1 text-right">{title}</span>
            <ArrowIcon size={16} className="text-slate-400 group-hover:text-shibl-crimson transition-colors" />
        </button>
    );
}

// Upcoming class card with action buttons
interface UpcomingClassProps {
    courseName: string;
    time: string;
    studentsCount: number;
    isLive?: boolean;
    onJoin?: () => void;
    onMenu?: () => void;
}

function UpcomingClass({ courseName, time, studentsCount, isLive, onJoin, onMenu }: UpcomingClassProps) {
    return (
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all group">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isLive ? 'bg-red-100' : 'bg-shibl-crimson/10'}`}>
                {isLive ? (
                    <div className="relative">
                        <Play size={20} className="text-red-500" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    </div>
                ) : (
                    <Clock size={20} className="text-shibl-crimson" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[#1F1F1F] font-medium text-sm truncate">{courseName}</p>
                <p className="text-[#636E72] text-xs mt-0.5">{time}</p>
            </div>
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-[#636E72] text-xs">
                    <Users size={14} />
                    <span>{studentsCount}</span>
                </div>

                {/* Action buttons - visible on hover */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isLive && (
                        <button
                            onClick={onJoin}
                            className="px-3 py-1.5 rounded-lg bg-shibl-crimson hover:bg-red-600 text-white text-xs font-medium flex items-center gap-1 transition-colors"
                        >
                            <Video size={12} />
                            انضم الآن
                        </button>
                    )}
                    <button
                        onClick={onMenu}
                        className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-[#636E72] transition-colors"
                    >
                        <MoreVertical size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

// Upcoming class skeleton
function UpcomingClassSkeleton() {
    return (
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 animate-pulse">
            <div className="w-12 h-12 rounded-xl bg-slate-200" />
            <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-slate-200 rounded" />
                <div className="h-3 w-20 bg-slate-200 rounded" />
            </div>
            <div className="h-4 w-8 bg-slate-200 rounded" />
        </div>
    );
}

// ==================== MAIN COMPONENT ====================

export function TeacherDashboardPage() {
    const { user } = useAuthStore();
    const { isRTL } = useLanguage();
    const navigate = useNavigate();

    // State for dashboard data
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [courses, setCourses] = useState<TeacherCourse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch dashboard data
    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch courses to calculate stats
            const response = await teacherService.getMyCourses({ per_page: 100 });
            const fetchedCourses = response.data || [];
            setCourses(fetchedCourses);

            // Calculate stats from courses
            const totalCourses = fetchedCourses.length;
            const activeCourses = fetchedCourses.filter(c => c.is_active).length;
            const totalStudents = fetchedCourses.reduce((sum, c) => sum + (c.students_count || 0), 0);
            const totalLectures = fetchedCourses.reduce((sum, c) => sum + (c.lectures_count || 0), 0);

            setStats({
                totalCourses,
                activeCourses,
                totalStudents,
                totalLectures,
            });
        } catch (err: unknown) {
            console.error('Failed to fetch dashboard data:', err);
            setError('فشل في تحميل بيانات لوحة التحكم');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Check if user is in "zero state" (new user with no data)
    const isZeroState = useMemo(() => {
        return stats && stats.totalCourses === 0 && stats.totalStudents === 0;
    }, [stats]);

    // Build stats cards from real data
    const statsCards = useMemo(() => [
        {
            title: 'إجمالي الدورات',
            value: stats?.totalCourses ?? 0,
            change: stats?.activeCourses ? `${stats.activeCourses} دورة نشطة` : undefined,
            changeType: 'positive' as const,
            icon: BookOpen,
            iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
        },
        {
            title: 'الطلاب المسجلين',
            value: stats?.totalStudents ?? 0,
            changeType: 'neutral' as const,
            icon: Users,
            iconBg: 'bg-gradient-to-br from-emerald-500 to-green-600',
        },
        {
            title: 'إجمالي المحاضرات',
            value: stats?.totalLectures ?? 0,
            changeType: 'neutral' as const,
            icon: ClipboardList,
            iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
        },
        {
            title: 'متوسط التقييم',
            value: '—',
            change: 'قريباً',
            changeType: 'neutral' as const,
            icon: Star,
            iconBg: 'bg-gradient-to-br from-purple-500 to-violet-600',
        },
    ], [stats]);

    // Generate upcoming classes from active courses (mock schedule for now)
    const upcomingClasses = useMemo(() => {
        // Take first 3 active courses and generate mock schedule
        const activeCourses = courses.filter(c => c.is_active).slice(0, 3);

        if (activeCourses.length === 0) {
            return [];
        }

        const times = ['اليوم 2:00 م', 'اليوم 4:00 م', 'غداً 10:00 ص'];

        return activeCourses.map((course, index) => ({
            id: course.id,
            courseName: getCourseName(course.name),
            time: times[index] || 'قريباً',
            studentsCount: course.students_count || 0,
            isLive: index === 0, // First one is live
        }));
    }, [courses]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'صباح الخير';
        if (hour < 18) return 'مساء الخير';
        return 'مساء الخير';
    };

    // Count today's classes (based on active courses for now)
    const todayClassesCount = useMemo(() => {
        return courses.filter(c => c.is_active).length;
    }, [courses]);

    // Handlers
    const handleOnboardingAction = (action: string) => {
        switch (action) {
            case 'course':
                navigate(ROUTES.TEACHER_COURSES);
                break;
            case 'quiz':
                navigate(ROUTES.TEACHER_QUIZZES);
                break;
            case 'lecture':
                navigate(ROUTES.TEACHER_COURSES);
                break;
            default:
                break;
        }
    };

    const handleJoinClass = (classId: number) => {
        console.log('Join class:', classId);
        // TODO: Navigate to live session
    };

    const handleClassMenu = (classId: number) => {
        console.log('Class menu:', classId);
        // TODO: Show context menu with edit/reschedule options
    };

    return (
        <div className="space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-[#1F1F1F]">
                        {getGreeting()}، {user?.name?.split(' ')[0] || 'المعلم'} 👋
                    </h1>
                    <p className="text-[#636E72] mt-1">
                        {loading ? (
                            <span className="inline-block h-4 w-32 bg-slate-200 rounded animate-pulse" />
                        ) : (
                            <>
                                لديك <span className="text-shibl-crimson font-medium">{todayClassesCount} دورات</span> نشطة
                            </>
                        )}
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

            {/* Error State */}
            {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertCircle size={20} className="text-red-500" />
                        <span className="text-red-700">{error}</span>
                    </div>
                    <button
                        onClick={fetchDashboardData}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-sm transition-colors"
                    >
                        <RefreshCw size={14} />
                        إعادة المحاولة
                    </button>
                </div>
            )}

            {/* Zero State: Onboarding Checklist */}
            {!loading && isZeroState && (
                <OnboardingChecklist
                    totalCourses={stats?.totalCourses ?? 0}
                    totalLectures={stats?.totalLectures ?? 0}
                    onAction={handleOnboardingAction}
                />
            )}

            {/* Statistics Grid - Show only when not in zero state or always show during loading */}
            {(loading || !isZeroState) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statsCards.map((stat, index) => (
                        <StatCard key={index} {...stat} isLoading={loading} />
                    ))}
                </div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upcoming Classes */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-[#1F1F1F] flex items-center gap-2">
                            <Calendar size={20} className="text-shibl-crimson" />
                            الحصص القادمة
                        </h2>
                        <button className="text-sm text-shibl-crimson hover:text-red-600 transition-colors">
                            عرض الكل
                        </button>
                    </div>
                    <div className="space-y-3">
                        {loading ? (
                            <>
                                <UpcomingClassSkeleton />
                                <UpcomingClassSkeleton />
                                <UpcomingClassSkeleton />
                            </>
                        ) : upcomingClasses.length > 0 ? (
                            upcomingClasses.map((cls) => (
                                <UpcomingClass
                                    key={cls.id}
                                    {...cls}
                                    onJoin={() => handleJoinClass(cls.id)}
                                    onMenu={() => handleClassMenu(cls.id)}
                                />
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <Clock size={32} className="mx-auto text-slate-400 mb-3" />
                                <p className="text-[#636E72]">لا توجد حصص قادمة</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h2 className="text-lg font-bold text-[#1F1F1F] mb-6">إجراءات سريعة</h2>
                    <div className="space-y-3">
                        <QuickAction
                            title="إضافة دورة جديدة"
                            icon={BookOpen}
                            onClick={() => navigate(ROUTES.TEACHER_COURSES)}
                            isRTL={isRTL}
                        />
                        <QuickAction
                            title="إنشاء اختبار"
                            icon={ClipboardList}
                            onClick={() => navigate(ROUTES.TEACHER_QUIZZES)}
                            isRTL={isRTL}
                        />
                        <QuickAction
                            title="عرض الإحصائيات"
                            icon={TrendingUp}
                            onClick={() => navigate(ROUTES.TEACHER_ANALYTICS)}
                            isRTL={isRTL}
                        />
                        <QuickAction
                            title="جدول الحصص"
                            icon={Calendar}
                            onClick={() => navigate('/teacher/schedule')}
                            isRTL={isRTL}
                        />
                    </div>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h2 className="text-lg font-bold text-[#1F1F1F] mb-6">النشاط الأخير</h2>
                <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">
                        <Clock size={32} className="text-slate-400" />
                    </div>
                    <p className="text-[#636E72]">سيظهر هنا النشاط الأخير من الطلاب والدورات</p>
                </div>
            </div>
        </div>
    );
}

export default TeacherDashboardPage;
