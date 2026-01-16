import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../store';
import { studentService, Course, getLocalizedName } from '../../../data/api/studentService';
import { StudentAcademicBrowsePage } from './StudentAcademicBrowsePage';
import { StudentCourseDetailsPage } from './StudentCourseDetailsPage';
import {
    GraduationCap,
    TrendingUp,
    Clock,
    CheckCircle2,
    Loader2,
    AlertCircle,
    RefreshCw,
    BookOpen
} from 'lucide-react';

export function StudentHomePage() {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'academic' | 'skills'>('academic');
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch non-academic/skills courses for the skills tab
    const fetchSkillsCourses = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await studentService.getSkillsCourses({ per_page: 50 });
            setCourses(response.data);
        } catch (err: unknown) {
            console.error('Error fetching skills courses:', err);
            setError('فشل في تحميل دورات المهارات');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'skills') {
            fetchSkillsCourses();
        }
    }, [activeTab, fetchSkillsCourses]);

    // Listen for real-time subscription updates - refetch data when approved/rejected
    useEffect(() => {
        const handleSubscriptionUpdate = (event: Event) => {
            const customEvent = event as CustomEvent;
            const notification = customEvent.detail;

            // Refetch when subscription status changes
            if (notification?.type?.includes('subscription')) {
                console.log('Subscription status changed, refreshing student home...');
                if (activeTab === 'skills') {
                    fetchSkillsCourses();
                }
                // Note: Academic tab uses StudentAcademicBrowsePage which handles its own refresh
            }
        };

        window.addEventListener('student-notification', handleSubscriptionUpdate);

        return () => {
            window.removeEventListener('student-notification', handleSubscriptionUpdate);
        };
    }, [activeTab, fetchSkillsCourses]);

    // Calculate stats from courses
    const stats = {
        activeCourses: courses.filter(c => c.is_active).length,
        // TODO: Backend needs progress tracking for accurate percentage
        overallProgress: 60, // Placeholder until backend adds progress
        upcomingSessions: 2, // Placeholder until backend adds live sessions
    };

    // Filter courses by category
    // TODO: Backend needs course_type field to properly distinguish academic vs skills
    // For now, we show all courses in the academic tab
    const filteredCourses = courses.filter(c => c.is_active);

    const displayName = user?.name?.split(' ')[0] || 'طالب';

    // Loading skeleton for courses
    const CourseCardSkeleton = () => (
        <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm flex animate-pulse">
            <div className="w-32 h-32 flex-shrink-0 bg-slate-200"></div>
            <div className="flex-1 p-4 flex flex-col justify-between">
                <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full"></div>
            </div>
        </div>
    );

    return (
        <div className="p-6">
            {/* Welcome Card */}
            <div className="bg-gradient-to-l from-shibl-crimson via-shibl-crimson to-[#8B0A12] rounded-[28px] p-6 text-white mb-6 relative overflow-hidden">
                <div className="flex items-center gap-6">
                    <div className="flex-1">
                        <h1 className="text-2xl font-extrabold mb-1">مرحباً، {displayName}! 👋</h1>
                        <p className="text-white/70 text-sm mb-6">تابع تقدمك واستكشف فرصك التعليمية.</p>

                        <div className="flex gap-3 flex-wrap">
                            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center gap-2">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                    <GraduationCap size={16} />
                                </div>
                                <div>
                                    {loading ? (
                                        <div className="h-5 w-6 bg-white/30 rounded animate-pulse"></div>
                                    ) : (
                                        <p className="text-lg font-extrabold">{stats.activeCourses}</p>
                                    )}
                                    <p className="text-[10px] text-white/70">دورات نشطة</p>
                                </div>
                            </div>

                            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center gap-2">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                    <TrendingUp size={16} />
                                </div>
                                <div>
                                    <p className="text-lg font-extrabold">{stats.overallProgress}%</p>
                                    <p className="text-[10px] text-white/70">التقدم</p>
                                </div>
                            </div>

                            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center gap-2">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                    <Clock size={16} />
                                </div>
                                <div>
                                    <p className="text-lg font-extrabold">{stats.upcomingSessions}</p>
                                    <p className="text-[10px] text-white/70">حصص قادمة</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decor */}
                <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/5 rounded-full"></div>
                <div className="absolute left-20 -bottom-16 w-24 h-24 bg-white/5 rounded-full"></div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-0 mb-6 bg-slate-100 p-1 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab('academic')}
                    className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'academic'
                        ? 'bg-shibl-crimson text-white shadow-lg'
                        : 'text-slate-500 hover:text-charcoal'
                        }`}
                >
                    الأكاديمي
                </button>
                <button
                    onClick={() => setActiveTab('skills')}
                    className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'skills'
                        ? 'bg-shibl-crimson text-white shadow-lg'
                        : 'text-slate-500 hover:text-charcoal'
                        }`}
                    title="قريباً - يتطلب تحديث من الخادم"
                >
                    المهارات
                </button>
            </div>

            {/* Course Details View */}
            {selectedCourseId ? (
                <StudentCourseDetailsPage
                    courseId={selectedCourseId}
                    onBack={() => setSelectedCourseId(null)}
                    onEnroll={(id) => {
                        // TODO: Implement enrollment flow
                        console.log('Enrolling in course:', id);
                    }}
                />
            ) : (
                <>
                    {/* Academic Tab - Step-by-step browsing */}
                    {activeTab === 'academic' && (
                        <StudentAcademicBrowsePage
                            onCourseSelect={(courseId) => setSelectedCourseId(courseId)}
                        />
                    )}

                    {/* Skills Tab - Direct course listing */}
                    {activeTab === 'skills' && (
                        <>
                            {/* Error State */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center mb-6">
                                    <AlertCircle className="mx-auto mb-2 text-red-500" size={32} />
                                    <p className="text-red-600 font-medium mb-3">{error}</p>
                                    <button
                                        onClick={fetchSkillsCourses}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                                    >
                                        <RefreshCw size={16} />
                                        إعادة المحاولة
                                    </button>
                                </div>
                            )}

                            {/* Loading State */}
                            {loading && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <CourseCardSkeleton key={i} />
                                    ))}
                                </div>
                            )}

                            {/* Empty State */}
                            {!loading && !error && filteredCourses.length === 0 && (
                                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <BookOpen size={32} className="text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-charcoal mb-2">لا توجد دورات مهارات حالياً</h3>
                                    <p className="text-slate-500 text-sm">سيتم عرض دورات المهارات مثل تحفيظ القرآن والفقه هنا.</p>
                                </div>
                            )}

                            {/* Skills Courses Grid */}
                            {!loading && !error && filteredCourses.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredCourses.map(course => {
                                        const courseName = getLocalizedName(course.name, 'دورة بدون اسم');
                                        const teacherName = course.teacher?.name || 'مدرس غير محدد';
                                        const progress = Math.floor(Math.random() * 60) + 20;

                                        return (
                                            <div
                                                key={course.id}
                                                className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex cursor-pointer group"
                                            >
                                                <div className="w-32 h-32 flex-shrink-0 overflow-hidden bg-gradient-to-br from-emerald-500/10 to-teal-500/5 flex items-center justify-center">
                                                    <GraduationCap size={40} className="text-emerald-500/40" />
                                                </div>

                                                <div className="flex-1 p-4 flex flex-col justify-between">
                                                    <div>
                                                        <h3 className="font-bold text-charcoal mb-1 text-sm line-clamp-1">{courseName}</h3>
                                                        <p className="text-slate-400 text-xs">{teacherName}</p>
                                                        {course.code && (
                                                            <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] rounded font-mono">
                                                                {course.code}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2 mt-2">
                                                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-emerald-500 rounded-full transition-all"
                                                                style={{ width: `${progress}%` }}
                                                            ></div>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-xs">
                                                            {progress >= 50 && (
                                                                <CheckCircle2 size={14} className="text-emerald-500" />
                                                            )}
                                                            <span className="text-slate-500 font-medium">{progress}% مكتمل</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
}
