/**
 * DayTimeline Component
 *
 * A vertical timeline showing schedule cards for a selected day.
 * Displays time slots from 12 AM to 11 PM with scheduled lectures.
 *
 * Mobile-first responsive design:
 * - On mobile: simple stacked card list (no timeline dots/connectors to prevent overflow)
 * - On desktop: full decorative timeline with dots and vertical line
 */

import { useMemo } from 'react';
import { Clock, PlayCircle, CheckCircle, Trash2, Loader2, Calendar, Radio, Lock, AlertCircle } from 'lucide-react';
import { format, parseISO, getHours, isBefore, addMinutes, differenceInMinutes } from 'date-fns';
import { ar } from 'date-fns/locale';
import { getLocalizedName } from '@/data/api/studentService';

// ============================================================
// Types
// ============================================================

import { Schedule } from '@/types/schedule';

interface DayTimelineProps {
    selectedDate: Date;
    schedules: Schedule[];
    onComplete: (id: number) => void;
    onDelete: (id: number) => void;
    completingId: number | null;
    deletingId: number | null;
}

// Time slots from 12 AM to 11 PM (all 24 hours)
const TIME_SLOTS = [
    { hour: 0, label: '١٢:٠٠ ص' },
    { hour: 1, label: '١:٠٠ ص' },
    { hour: 2, label: '٢:٠٠ ص' },
    { hour: 3, label: '٣:٠٠ ص' },
    { hour: 4, label: '٤:٠٠ ص' },
    { hour: 5, label: '٥:٠٠ ص' },
    { hour: 6, label: '٦:٠٠ ص' },
    { hour: 7, label: '٧:٠٠ ص' },
    { hour: 8, label: '٨:٠٠ ص' },
    { hour: 9, label: '٩:٠٠ ص' },
    { hour: 10, label: '١٠:٠٠ ص' },
    { hour: 11, label: '١١:٠٠ ص' },
    { hour: 12, label: '١٢:٠٠ م' },
    { hour: 13, label: '١:٠٠ م' },
    { hour: 14, label: '٢:٠٠ م' },
    { hour: 15, label: '٣:٠٠ م' },
    { hour: 16, label: '٤:٠٠ م' },
    { hour: 17, label: '٥:٠٠ م' },
    { hour: 18, label: '٦:٠٠ م' },
    { hour: 19, label: '٧:٠٠ م' },
    { hour: 20, label: '٨:٠٠ م' },
    { hour: 21, label: '٩:٠٠ م' },
    { hour: 22, label: '١٠:٠٠ م' },
    { hour: 23, label: '١١:٠٠ م' },
];

// ============================================================
// Schedule Card Sub-component
// ============================================================

interface TimelineCardProps {
    schedule: Schedule;
    onComplete: (id: number) => void;
    onDelete: (id: number) => void;
    isCompleting: boolean;
    isDeleting: boolean;
}

function TimelineCard({ schedule, onComplete, onDelete, isCompleting, isDeleting }: TimelineCardProps) {
    const lectureTitle = schedule.lecture
        ? getLocalizedName(schedule.lecture.title, 'محاضرة')
        : 'محاضرة';
    const courseName = schedule.lecture?.course
        ? getLocalizedName(schedule.lecture.course.name, '')
        : '';
    const duration = schedule.lecture?.duration_minutes
        ? `${schedule.lecture.duration_minutes} دقيقة`
        : '';
    const scheduledTime = format(parseISO(schedule.scheduled_at), 'h:mm a', { locale: ar });

    const isExpired = schedule.is_accessible === false;

    // Calculate Missed Status
    const now = new Date();
    const startTime = parseISO(schedule.scheduled_at);
    const durationMins = schedule.lecture?.duration_minutes || 60;
    const endTime = addMinutes(startTime, durationMins);
    const isMissed = !schedule.is_completed && !isExpired && now > endTime;

    // Calculate session types
    const lectureStartTime = schedule.lecture?.start_time ? parseISO(schedule.lecture.start_time) : null;
    const isLiveSession = !!(schedule.lecture?.is_online && lectureStartTime && Math.abs(differenceInMinutes(startTime, lectureStartTime)) < 15);
    const isReviewSession = !!(schedule.lecture?.is_online && !isLiveSession);

    // Actions Logic
    const isLiveStarted = isLiveSession && now >= startTime;
    const disableActions = isCompleting || isDeleting || (isLiveSession && !isLiveStarted);

    // Border color based on status
    const borderColor = isExpired
        ? 'border-slate-200'
        : isMissed
            ? 'border-red-200'
            : schedule.is_completed
                ? 'border-green-200'
                : 'border-shibl-crimson/20 hover:border-shibl-crimson/40';

    const bgColor = isExpired
        ? 'bg-slate-50 opacity-60'
        : isMissed
            ? 'bg-red-50/50'
            : schedule.is_completed
                ? 'bg-green-50/50'
                : 'bg-white hover:shadow-md';

    // Accent color for the left/right strip
    const accentColor = isExpired
        ? 'bg-slate-400'
        : isMissed
            ? 'bg-red-500'
            : schedule.is_completed
                ? 'bg-green-500'
                : 'bg-shibl-crimson';

    return (
        <div
            className={`
                group relative rounded-xl border-2 p-3 sm:p-4 transition-all duration-200 overflow-hidden
                ${borderColor} ${bgColor}
            `}
        >
            {/* Accent strip on the right side (RTL start) — contained within the card */}
            <div className={`absolute top-0 right-0 w-1 h-full ${accentColor}`} />

            <div className="flex items-start gap-2 sm:gap-3">
                {/* Icon */}
                <div
                    className={`
                        w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0
                        ${isExpired
                            ? 'bg-slate-200 text-slate-500'
                            : isMissed
                                ? 'bg-red-100 text-red-500'
                                : schedule.is_completed
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-shibl-crimson/10 text-shibl-crimson'
                        }
                    `}
                >
                    {isExpired ? <Lock size={18} /> : isMissed ? <AlertCircle size={18} /> : schedule.is_completed ? <CheckCircle size={18} /> : <PlayCircle size={18} />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Title + badges */}
                    <h4 className={`font-bold text-sm sm:text-base truncate mb-0.5 ${isMissed ? 'text-red-700' : schedule.is_completed ? 'text-green-700' : 'text-charcoal'}`}>
                        {lectureTitle}
                    </h4>

                    {/* Status badges row */}
                    <div className="flex flex-wrap items-center gap-1 mb-1">
                        {isExpired && (
                            <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
                                <Lock size={9} />
                                الاشتراك منتهي
                            </span>
                        )}
                        {!isExpired && isMissed && (
                            <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
                                <AlertCircle size={9} />
                                فائتة
                            </span>
                        )}
                        {!isExpired && schedule.is_completed && (
                            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                مكتمل
                            </span>
                        )}
                        {!isExpired && isLiveSession && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded inline-flex items-center gap-0.5 animate-pulse">
                                <Radio size={9} />
                                مباشر
                            </span>
                        )}
                        {!isExpired && isReviewSession && (
                            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
                                <PlayCircle size={9} />
                                مسجل
                            </span>
                        )}
                    </div>

                    {/* Course name */}
                    <p className="text-xs sm:text-sm text-slate-500 truncate mb-1">{courseName}</p>

                    {/* Time + Duration */}
                    <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-slate-400">
                        <span className="inline-flex items-center gap-1">
                            <Clock size={11} />
                            {scheduledTime}
                        </span>
                        {duration && (
                            <span className="inline-flex items-center gap-1">
                                <Calendar size={11} />
                                {duration}
                            </span>
                        )}
                    </div>
                </div>

                {/* Actions — visible on hover (desktop), always-visible on mobile for touch */}
                {!isExpired && (
                    <div className={`flex items-center gap-0.5 flex-shrink-0 ${disableActions ? 'opacity-50' : 'sm:opacity-0 sm:group-hover:opacity-100'} transition-opacity`}>
                        {!schedule.is_completed && (
                            <button
                                onClick={() => onComplete(schedule.id)}
                                disabled={disableActions}
                                className="p-1 sm:p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
                                title="تم المشاهدة"
                                aria-label="تم المشاهدة"
                            >
                                {isCompleting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                            </button>
                        )}
                        <button
                            onClick={() => onDelete(schedule.id)}
                            disabled={disableActions}
                            className="p-1 sm:p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                            title="حذف"
                            aria-label="حذف"
                        >
                            {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================================
// Main Component
// ============================================================

export function DayTimeline({
    selectedDate,
    schedules,
    onComplete,
    onDelete,
    completingId,
    deletingId,
}: DayTimelineProps) {
    // Group schedules by hour
    const schedulesByHour = useMemo(() => {
        const grouped: Record<number, Schedule[]> = {};
        schedules.forEach((s) => {
            const hour = getHours(parseISO(s.scheduled_at));
            if (!grouped[hour]) grouped[hour] = [];
            grouped[hour].push(s);
        });
        // Sort each group by time
        Object.values(grouped).forEach((group) => {
            group.sort((a, b) => parseISO(a.scheduled_at).getTime() - parseISO(b.scheduled_at).getTime());
        });
        return grouped;
    }, [schedules]);

    const now = new Date();
    const currentHour = getHours(now);

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Day header */}
            <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100 bg-gradient-to-l from-slate-50 to-white">
                <h3 className="text-base sm:text-lg font-bold text-charcoal">
                    {format(selectedDate, 'EEEE، d MMMM', { locale: ar })}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                    {schedules.length > 0 ? `${schedules.length} محاضرات مجدولة` : 'لا توجد محاضرات'}
                </p>
            </div>

            {/* Timeline */}
            <div className="p-3 sm:p-5">
                <div className="space-y-3 sm:space-y-4">
                    {TIME_SLOTS.map((slot) => {
                        const slotSchedules = schedulesByHour[slot.hour] || [];
                        const isPast = isBefore(new Date().setHours(slot.hour, 59), now);
                        const isCurrent = currentHour === slot.hour;

                        return (
                            <div key={slot.hour} className="flex gap-2 sm:gap-4">
                                {/* Time label */}
                                <div
                                    className={`
                                        w-[52px] sm:w-14 text-[11px] sm:text-sm font-medium text-left flex-shrink-0 pt-2
                                        ${isCurrent ? 'text-shibl-crimson font-bold' : isPast ? 'text-slate-300' : 'text-slate-400'}
                                    `}
                                >
                                    {slot.label}
                                </div>

                                {/* Schedules or empty slot */}
                                <div className="flex-1 min-w-0 min-h-[44px]">
                                    {slotSchedules.length > 0 ? (
                                        <div className="space-y-2 sm:space-y-3">
                                            {slotSchedules.map((schedule) => (
                                                <TimelineCard
                                                    key={schedule.id}
                                                    schedule={schedule}
                                                    onComplete={onComplete}
                                                    onDelete={onDelete}
                                                    isCompleting={completingId === schedule.id}
                                                    isDeleting={deletingId === schedule.id}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div
                                            className={`
                                                h-11 border-2 border-dashed rounded-lg
                                                ${isPast
                                                    ? 'border-slate-100 opacity-50'
                                                    : 'border-slate-200 hover:border-shibl-crimson/30 hover:bg-shibl-crimson/5 transition-colors cursor-pointer'
                                                }
                                            `}
                                        />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default DayTimeline;
