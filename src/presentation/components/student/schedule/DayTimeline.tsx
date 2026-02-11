/**
 * DayTimeline Component
 *
 * A vertical timeline showing schedule cards for a selected day.
 * Displays time slots from 8 AM to 8 PM with scheduled lectures.
 */

import { useMemo } from 'react';
import { Clock, PlayCircle, CheckCircle, Trash2, Loader2, Calendar, Radio, Lock } from 'lucide-react';
import { format, parseISO, getHours, getMinutes, isBefore, addMinutes } from 'date-fns';
import { ar } from 'date-fns/locale';
import { getLocalizedName } from '@/data/api/studentService';

// ============================================================
// Types
// ============================================================

import { Schedule } from '@/types/schedule';
import { AlertCircle } from 'lucide-react';

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

    const isDisabled = isCompleting || isDeleting;
    const isExpired = schedule.is_accessible === false;

    // Calculate Missed Status
    const now = new Date();
    const startTime = parseISO(schedule.scheduled_at);
    const durationMins = schedule.lecture?.duration_minutes || 60;
    const endTime = addMinutes(startTime, durationMins);
    const isMissed = !schedule.is_completed && !isExpired && now > endTime;

    return (
        <div
            className={`
                group relative rounded-xl border-2 p-4 transition-all duration-200 mr-4
                ${isExpired
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : isMissed
                        ? 'bg-red-50/50 border-red-200'
                        : schedule.is_completed
                            ? 'bg-green-50/50 border-green-200'
                            : 'bg-white border-shibl-crimson/20 hover:border-shibl-crimson/40 hover:shadow-md'
                }
            `}
        >
            <div
                className={`
                    absolute right-[-13px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2
                    ${isExpired
                        ? 'bg-slate-400 border-slate-300'
                        : isMissed
                            ? 'bg-red-500 border-red-200'
                            : schedule.is_completed
                                ? 'bg-green-500 border-green-200'
                                : 'bg-shibl-crimson border-shibl-crimson/30'
                    }
                `}
            />

            <div className="flex items-start gap-3">
                <div
                    className={`
                        w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
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
                    {isExpired ? <Lock size={20} /> : isMissed ? <AlertCircle size={20} /> : schedule.is_completed ? <CheckCircle size={20} /> : <PlayCircle size={20} />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-bold truncate ${isMissed ? 'text-red-700' : schedule.is_completed ? 'text-green-700' : 'text-charcoal'}`}>
                            {lectureTitle}
                        </h4>
                        {isExpired && (
                            <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                                <Lock size={10} />
                                الاشتراك منتهي
                            </span>
                        )}
                        {!isExpired && isMissed && (
                            <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                                <AlertCircle size={10} />
                                فائتة
                            </span>
                        )}
                        {!isExpired && schedule.is_completed && (
                            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                مكتمل
                            </span>
                        )}
                        {!isExpired && schedule.lecture?.is_online && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 animate-pulse">
                                <Radio size={10} />
                                مباشر
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-slate-500 truncate mb-1">{courseName}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {scheduledTime}
                        </span>
                        {duration && (
                            <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {duration}
                            </span>
                        )}
                    </div>
                </div>

                {/* Actions - hidden for expired subscriptions */}
                {!isExpired && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!schedule.is_completed && (
                            <button
                                onClick={() => onComplete(schedule.id)}
                                disabled={isDisabled}
                                className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
                                title="تم المشاهدة"
                                aria-label="تم المشاهدة"
                            >
                                {isCompleting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                            </button>
                        )}
                        <button
                            onClick={() => onDelete(schedule.id)}
                            disabled={isDisabled}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                            title="حذف"
                            aria-label="حذف"
                        >
                            {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
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
            <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-l from-slate-50 to-white">
                <h3 className="text-lg font-bold text-charcoal">
                    {format(selectedDate, 'EEEE، d MMMM', { locale: ar })}
                </h3>
                <p className="text-sm text-slate-500">
                    {schedules.length > 0 ? `${schedules.length} محاضرات مجدولة` : 'لا توجد محاضرات'}
                </p>
            </div>

            {/* Timeline */}
            <div className="p-5">
                <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute right-[5px] top-0 bottom-0 w-0.5 bg-slate-100" />

                    {/* Time slots */}
                    <div className="space-y-4">
                        {TIME_SLOTS.map((slot) => {
                            const slotSchedules = schedulesByHour[slot.hour] || [];
                            const isPast = isBefore(new Date().setHours(slot.hour, 59), now);
                            const isCurrent = currentHour === slot.hour;

                            return (
                                <div key={slot.hour} className="flex gap-4">
                                    {/* Time label */}
                                    <div
                                        className={`
                                            w-14 text-sm font-medium text-left flex-shrink-0 pt-1
                                            ${isCurrent ? 'text-shibl-crimson' : isPast ? 'text-slate-300' : 'text-slate-400'}
                                        `}
                                    >
                                        {slot.label}
                                    </div>

                                    {/* Schedules or empty slot */}
                                    <div className="flex-1 min-h-[48px] relative">
                                        {/* Connector to timeline */}
                                        <div
                                            className={`
                                                absolute right-0 top-3 w-2 h-0.5
                                                ${slotSchedules.length > 0
                                                    ? 'bg-shibl-crimson/30'
                                                    : isPast
                                                        ? 'bg-slate-100'
                                                        : 'bg-slate-200'
                                                }
                                            `}
                                        />

                                        {slotSchedules.length > 0 ? (
                                            <div className="space-y-3 mr-3">
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
                                                    h-12 mr-3 border-2 border-dashed rounded-lg
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
        </div>
    );
}

export default DayTimeline;
