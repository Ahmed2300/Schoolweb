import { useState, useEffect, useCallback } from 'react';
import { teacherService, TeacherCourse } from '../../../data/api';
import { DashboardHeader } from '../../components/teacher/dashboard/DashboardHeader';
import { TeacherStatsOverview } from '../../components/teacher/dashboard/TeacherStatsOverview';
import { DailyScheduleTimeline } from '../../components/teacher/dashboard/DailyScheduleTimeline';
import { QuickActionsGrid } from '../../components/teacher/dashboard/QuickActionsGrid';
import { useLanguage } from '../../hooks';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

// Types
interface DashboardStats {
    totalCourses: number;
    activeCourses: number;
    totalStudents: number;
    totalLectures: number;
}

export function TeacherDashboardPage() {
    const { isRTL } = useLanguage();

    // State
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch dashboard data
    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch courses to calculate stats
            const response = await teacherService.getMyCourses({ per_page: 100 });
            const fetchedCourses: TeacherCourse[] = response.data || [];

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

    return (
        <div className="min-h-screen bg-soft-cloud -m-6 p-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="max-w-7xl mx-auto space-y-8">
                {/* 1. Header Section */}
                <DashboardHeader />

                {/* 2. Stats Overview */}
                <TeacherStatsOverview stats={stats} isLoading={loading} />

                {/* Error State */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between mb-6"
                    >
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
                    </motion.div>
                )}

                {/* 3. Main Grid Layout */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Left Column (Timeline) - Takes 2 cols on huge screens, 1 on others but ordered first */}
                    <motion.div
                        initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="xl:col-span-2 min-h-[500px]"
                    >
                        <DailyScheduleTimeline />
                    </motion.div>

                    {/* Right Column (Quick Actions & Widgets) */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <QuickActionsGrid />
                        </motion.div>

                        {/* Could add another widget here, e.g., Storage Usage or Recent Notifications */}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TeacherDashboardPage;
