import { DashboardHeader } from '../../components/teacher/dashboard/DashboardHeader';
import { TeacherStatsOverview } from '../../components/teacher/dashboard/TeacherStatsOverview';
import { WeeklySchedule } from '../../components/teacher/dashboard/WeeklySchedule';
import { QuickActionsGrid } from '../../components/teacher/dashboard/QuickActionsGrid';
import { ComponentErrorBoundary } from '../../components/common/ComponentErrorBoundary';
import { useTeacherDashboardStats } from '../../hooks/useTeacherDashboardStats';
import { useLanguage } from '../../hooks';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export function TeacherDashboardPage() {
    const { isRTL } = useLanguage();

    // Use TanStack Query with stale-while-revalidate
    const { data: stats, isLoading, error, refetch, isFetching } = useTeacherDashboardStats();

    return (
        <div className="min-h-screen bg-soft-cloud -mx-4 -my-6 p-4 md:-m-6 md:p-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="max-w-7xl mx-auto space-y-8">
                {/* 1. Header Section */}
                <DashboardHeader />

                {/* 2. Stats Overview - Shows cached data while refetching (stale-while-revalidate) */}
                <TeacherStatsOverview stats={stats ?? null} isLoading={isLoading && !stats} />

                {/* Background refresh indicator */}
                {isFetching && stats && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <RefreshCw size={14} className="animate-spin" />
                        <span>جاري تحديث البيانات...</span>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between mb-6"
                    >
                        <div className="flex items-center gap-3">
                            <AlertCircle size={20} className="text-red-500" />
                            <span className="text-red-700">فشل في تحميل بيانات لوحة التحكم</span>
                        </div>
                        <button
                            onClick={() => refetch()}
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
                        <ComponentErrorBoundary
                            fallbackTitle="خطأ في الجدول الأسبوعي"
                            fallbackMessage="حدث خطأ أثناء تحميل الجدول. يرجى المحاولة مرة أخرى."
                        >
                            <WeeklySchedule />
                        </ComponentErrorBoundary>
                    </motion.div>

                    {/* Right Column (Quick Actions & Widgets) */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <ComponentErrorBoundary
                                fallbackTitle="خطأ في الإجراءات السريعة"
                                fallbackMessage="حدث خطأ أثناء تحميل الإجراءات السريعة."
                            >
                                <QuickActionsGrid />
                            </ComponentErrorBoundary>
                        </motion.div>

                        {/* Could add another widget here, e.g., Storage Usage or Recent Notifications */}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TeacherDashboardPage;

