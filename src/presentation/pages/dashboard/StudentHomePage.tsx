import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../store';
import { studentService, Course } from '../../../data/api/studentService';
import { StudentAcademicBrowsePage } from './StudentAcademicBrowsePage';
import { StudentCourseDetailsPage } from './StudentCourseDetailsPage';
import {
    GraduationCap,
    TrendingUp,
    Clock,
    Rocket,
    PlayCircle
} from 'lucide-react';
import { TutorialThumbnail } from '../../components/common/TutorialThumbnail';
import { VideoModal } from '../../components/common/VideoModal';
import { MissedTasksWidget } from '../../components/student/dashboard/MissedTasksWidget';

export function StudentHomePage() {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'academic' | 'skills'>('academic');
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showVideoModal, setShowVideoModal] = useState(false);

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

    const [dashboardStats, setDashboardStats] = useState({
        activeCourses: 0,
        overallProgress: 0,
        upcomingSessions: 0
    });

    // Fetch dashboard stats
    useEffect(() => {
        const fetchStats = async () => {
            const stats = await studentService.getDashboardStats();
            setDashboardStats({
                activeCourses: stats.inProgressCourses,
                overallProgress: stats.averageProgress || 0,
                upcomingSessions: stats.upcomingLiveSessions
            });
        };
        fetchStats();
    }, []);

    // Use fetched stats
    const stats = {
        activeCourses: dashboardStats.activeCourses,
        overallProgress: dashboardStats.overallProgress,
        upcomingSessions: dashboardStats.upcomingSessions,
    };

    const displayName = user?.name?.split(' ')[0] || 'طالب';

    return (
        <div className="p-4 md:p-6 lg:p-8">
            {/* Welcome Card */}
            <div className="relative overflow-hidden rounded-[24px] md:rounded-[32px] bg-gradient-to-br from-[#A31D24] to-[#7A151B] p-6 md:p-8 text-white shadow-xl shadow-shibl-crimson/20 mb-6 md:mb-8">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M0 40L40 0H20L0 20M40 40V20L20 40" stroke="white" strokeWidth="2" fill="none" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                    </svg>
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div className="flex-1 w-full lg:w-auto">
                        <div className="mb-6 md:mb-8 text-center lg:text-right">
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black mb-2 tracking-tight">
                                مرحباً، {displayName}! 👋
                            </h1>
                            <p className="text-white/80 text-base md:text-lg font-medium max-w-lg leading-relaxed mx-auto lg:mx-0">
                                تابع تقدمك الدراسي واستكشف فرصك التعليمية الجديدة اليوم.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3 md:gap-4">
                            {/* Stats Cards with Glassmorphism */}
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 md:p-4 flex flex-1 items-center gap-3 min-w-[140px] sm:min-w-[160px] transition-transform hover:scale-105 duration-300">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center text-white shadow-inner shrink-0">
                                    <GraduationCap size={20} className="md:w-6 md:h-6" />
                                </div>
                                <div>
                                    {loading ? (
                                        <div className="h-6 md:h-7 w-10 md:w-12 bg-white/30 rounded animate-pulse mb-1"></div>
                                    ) : (
                                        <p className="text-xl md:text-2xl font-black">{stats.activeCourses}</p>
                                    )}
                                    <p className="text-[10px] md:text-xs font-bold text-white/70 whitespace-nowrap">دورات نشطة</p>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 md:p-4 flex flex-1 items-center gap-3 min-w-[140px] sm:min-w-[160px] transition-transform hover:scale-105 duration-300">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center text-white shadow-inner shrink-0">
                                    <TrendingUp size={20} className="md:w-6 md:h-6" />
                                </div>
                                <div>
                                    <div className="flex items-baseline gap-1">
                                        <p className="text-xl md:text-2xl font-black">{stats.overallProgress}</p>
                                        <span className="text-xs md:text-sm font-bold opacity-60">%</span>
                                    </div>
                                    <p className="text-[10px] md:text-xs font-bold text-white/70 whitespace-nowrap">مستوى التقدم</p>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 md:p-4 flex flex-1 items-center gap-3 min-w-[140px] sm:min-w-[160px] transition-transform hover:scale-105 duration-300">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center text-white shadow-inner shrink-0">
                                    <Clock size={20} className="md:w-6 md:h-6" />
                                </div>
                                <div>
                                    <p className="text-xl md:text-2xl font-black">{stats.upcomingSessions}</p>
                                    <p className="text-[10px] md:text-xs font-bold text-white/70 whitespace-nowrap">حصص قادمة</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:block relative w-80 transform hover:scale-105 transition-transform duration-500">
                        <div className="absolute -inset-4 bg-white/20 blur-2xl rounded-full opacity-0 lg:group-hover:opacity-50 transition-opacity duration-500"></div>
                        <TutorialThumbnail
                            videoUrl="https://youtu.be/jn4WSHLKKQc"
                            onClick={() => setShowVideoModal(true)}
                            layoutId="student-tutorial-video"
                            title="كيف تستخدم حسابك وتستفيد من المنصة؟"
                        />
                    </div>
                </div>

                {/* Decor Orbs */}
                <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute top-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            </div>

            {/* Missed Tasks Widget */}
            <div className="mb-8">
                <MissedTasksWidget
                    days={7}
                    maxVisible={3}
                    onLectureClick={(lectureId, courseId) => {
                        setSelectedCourseId(courseId);
                    }}
                    onQuizClick={(quizId, courseId) => {
                        setSelectedCourseId(courseId);
                    }}
                />
            </div>

            {/* Modern Tabs */}
            <div className="flex items-center justify-center mb-6 md:mb-8 px-2 md:px-0">
                <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row w-full sm:w-auto gap-1 sm:gap-0 mt-4 md:mt-2">
                    <button
                        onClick={() => setActiveTab('academic')}
                        className={`flex-1 px-4 md:px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'academic'
                            ? 'bg-shibl-crimson text-white shadow-md shadow-shibl-crimson/20'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        <GraduationCap size={18} />
                        المسار الأكاديمي
                    </button>
                    <button
                        onClick={() => setActiveTab('skills')}
                        className={`flex-1 px-4 md:px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'skills'
                            ? 'bg-shibl-crimson text-white shadow-md shadow-shibl-crimson/20'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                        title="قريباً"
                    >
                        <Rocket size={18} />
                        تنمية المهارات
                    </button>
                </div>
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

                    {/* Skills Tab - Placeholder */}
                    {activeTab === 'skills' && (
                        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 border border-dashed border-slate-200 rounded-3xl text-center">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                                <Rocket size={40} className="text-shibl-crimson/50" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">قريباً</h3>
                            <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                                نحن نعمل على إعداد دورات المهارات لتكون متاحة لكم قريباً.
                                <br />
                                ترقبوا التحديثات الجديدة!
                            </p>
                        </div>
                    )}
                </>
            )}

            <VideoModal
                isOpen={showVideoModal}
                onClose={() => setShowVideoModal(false)}
                videoUrl="https://youtu.be/jn4WSHLKKQc"
                title="شرح استخدام حساب الطالب"
                layoutId="student-tutorial-video"
            />
        </div>
    );
}
