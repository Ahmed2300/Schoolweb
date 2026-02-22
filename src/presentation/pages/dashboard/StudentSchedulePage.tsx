/**
 * Student Schedule Page
 *
 * Premium visual timeline for managing study schedules.
 * Features: Week navigation, day timeline, schedule cards, and add modal.
 *
 * Following Senior Full Stack Design principles:
 * - Mobile-first responsive layout
 * - Semantic HTML structure
 * - Optimistic UI with loading states
 * - Keyboard accessible
 */

import { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, CalendarDays } from 'lucide-react';
import { useSchedules } from '@/hooks/useSchedule';
import { format, parseISO, startOfDay, isSameDay, addMinutes } from 'date-fns';
import { WeekStrip, DayTimeline, UpcomingSchedules } from '@/presentation/components/student/schedule';

// ============================================================
// Types
// ============================================================

interface ScheduleItem {
    id: number;
    student_id: number;
    lecture_id: number;
    scheduled_at: string;
    is_completed: boolean;
    lecture?: {
        id: number;
        title: string | { ar?: string; en?: string };
        description?: string | { ar?: string; en?: string };
        duration_minutes?: number;
        course?: {
            id: number;
            name: string | { ar?: string; en?: string };
            grade?: {
                id: number;
                name: string | { ar?: string; en?: string };
            };
            semester?: {
                id: number;
                name: string | { ar?: string; en?: string };
            };
        };
    };
    created_at: string;
    updated_at: string;
}

// ============================================================
// Skeleton Component
// ============================================================

function ScheduleSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Week strip skeleton */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4">
                <div className="flex justify-between mb-4">
                    <div className="h-6 w-32 bg-slate-200 rounded" />
                    <div className="flex gap-2">
                        <div className="w-9 h-9 bg-slate-100 rounded-lg" />
                        <div className="w-9 h-9 bg-slate-100 rounded-lg" />
                    </div>
                </div>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <div key={i} className="flex-1 h-16 bg-slate-100 rounded-xl" />
                    ))}
                </div>
            </div>

            {/* Timeline skeleton */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <div className="h-6 w-40 bg-slate-200 rounded mb-4" />
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex gap-4">
                            <div className="w-14 h-5 bg-slate-100 rounded" />
                            <div className="flex-1 h-16 bg-slate-50 rounded-xl" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ============================================================
// Empty State Component
// ============================================================

function EmptyState() {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-shibl-crimson/10 to-shibl-crimson/5 flex items-center justify-center mb-6">
                    <CalendarDays className="w-10 h-10 text-shibl-crimson" />
                </div>
                <h3 className="text-xl font-bold text-charcoal mb-2">لا توجد محاضرات لهذا اليوم</h3>
                <p className="text-slate-500 max-w-sm">
                    اشترك في الدورات لتظهر محاضراتك هنا تلقائياً.
                </p>
            </div>
        </div>
    );
}

// ============================================================
// Main Page Component
// ============================================================

export function StudentSchedulePage() {
    const { data: schedules, isLoading, isError, refetch } = useSchedules();

    // UI State
    const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));

    // Filter out schedules with missing lectures (e.g., deleted by teacher)
    const validSchedules = useMemo(() => {
        return schedules?.filter(s => s.lecture) || [];
    }, [schedules]);

    // Filter schedules for selected date (including midnight crossovers)
    const daySchedules = useMemo(() => {
        return validSchedules.filter((s) => {
            const scheduledDate = parseISO(s.scheduled_at);
            const duration = s.lecture?.duration_minutes || 60;
            const endTime = addMinutes(scheduledDate, duration);

            return isSameDay(scheduledDate, selectedDate) || isSameDay(endTime, selectedDate);
        });
    }, [validSchedules, selectedDate]);

    // Calculate schedule counts per day for the week strip
    const scheduleCounts = useMemo(() => {
        if (!validSchedules) return {};
        const counts: Record<string, number> = {};
        validSchedules.forEach((s) => {
            const dateKey = format(parseISO(s.scheduled_at), 'yyyy-MM-dd');
            counts[dateKey] = (counts[dateKey] || 0) + 1;
        });
        return counts;
    }, [schedules]);



    return (
        <main className="p-4 sm:p-6 max-w-4xl mx-auto overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-shibl-crimson/10 flex items-center justify-center flex-shrink-0">
                        <CalendarIcon className="w-6 h-6 text-shibl-crimson" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-charcoal">الجدول الدراسي</h1>
                        <p className="text-sm text-slate-500">نظّم وقتك وتابع تقدمك في الدورات</p>
                    </div>
                </div>
            </header>

            {/* Content */}
            {isLoading ? (
                <ScheduleSkeleton />
            ) : isError ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
                    <p className="text-red-500 mb-4">حدث خطأ في تحميل الجدول</p>
                    <button
                        onClick={() => refetch()}
                        className="text-shibl-crimson font-semibold hover:underline"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            ) : (
                <>
                    {/* Upcoming Schedules Section */}
                    {schedules && schedules.length > 0 && (
                        <UpcomingSchedules schedules={schedules} />
                    )}

                    {/* Week Calendar Strip */}
                    <WeekStrip
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                        scheduleCounts={scheduleCounts}
                    />

                    {/* Day Timeline or Empty State */}
                    {daySchedules.length > 0 ? (
                        <DayTimeline
                            selectedDate={selectedDate}
                            schedules={daySchedules}
                        // Callbacks for complete/delete have been removed as this list is auto-populated
                        />
                    ) : (
                        <EmptyState />
                    )}
                </>
            )}
        </main>
    );
}
