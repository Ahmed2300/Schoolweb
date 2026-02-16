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

                    <div className="hidden lg:block relative z-10 w-72">
                        <TutorialThumbnail
                            videoUrl="https://youtu.be/jn4WSHLKKQc"
                            onClick={() => setShowVideoModal(true)}
                            layoutId="student-tutorial-video"
                            title="كيف تستخدم حسابك وتستفيد من المنصة؟"
                        />
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
