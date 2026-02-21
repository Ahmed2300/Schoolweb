import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { format, parseISO, isAfter, isToday, isTomorrow, addMinutes } from 'date-fns';
import { ar } from 'date-fns/locale';
import { PlayCircle, Clock, Calendar as CalendarIcon, ArrowLeft, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getLocalizedName } from '@/data/api/studentService';
import { Schedule } from '@/types/schedule';

interface UpcomingSchedulesProps {
    schedules: Schedule[];
}

export function UpcomingSchedules({ schedules }: UpcomingSchedulesProps) {
    const navigate = useNavigate();
    const upcomingList = useMemo(() => {
        const now = new Date();
        // Filter out completed schedules, past schedules, and those with missing lecture data (deleted)
        return schedules
            .filter((s) => !s.is_completed && s.lecture && isAfter(parseISO(s.scheduled_at), now))
            .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
            .slice(0, 3);
    }, [schedules]);

    if (upcomingList.length === 0) return null;

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-charcoal flex items-center gap-2">
                    <Clock className="w-5 h-5 text-shibl-crimson" />
                    المواعيد القادمة
                </h2>
                {upcomingList.length > 3 && (
                    <button className="text-sm text-shibl-crimson font-medium hover:underline">
                        عرض الكل
                    </button>
                )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingList.map((schedule) => {
                    const date = parseISO(schedule.scheduled_at);
                    const isLectureToday = isToday(date);
                    const isLectureTomorrow = isTomorrow(date);
                    const isLive = (() => {
                        if (!schedule.lecture?.is_online) return false;
                        const now = new Date();
                        const startTime = parseISO(schedule.scheduled_at);
                        const duration = schedule.lecture.duration_minutes || 60; // Default 60 mins if not set
                        const endTime = addMinutes(startTime, duration);
                        return now >= startTime && now <= endTime;
                    })();

                    const dateLabel = isLectureToday
                        ? 'اليوم'
                        : isLectureTomorrow
                            ? 'غداً'
                            : format(date, 'EEEE d MMMM', { locale: ar });

                    const lectureTitle = schedule.lecture
                        ? getLocalizedName(schedule.lecture.title, 'محاضرة')
                        : 'محاضرة';

                    const courseName = schedule.lecture?.course
                        ? getLocalizedName(schedule.lecture.course.name, 'مادة')
                        : 'مادة';

                    const duration = schedule.lecture?.duration_minutes
                        ? `${schedule.lecture.duration_minutes} دقيقة`
                        : '';

                    return (
                        <div
                            key={schedule.id}
                            className={`
                                rounded-xl border p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group
                                ${isLive ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100'}
                            `}
                        >
                            <div className={`absolute top-0 left-0 w-1 h-full ${isLive ? 'bg-red-500' : 'bg-shibl-crimson/50'}`} />

                            <div className="flex flex-wrap items-start justify-between mb-2 gap-2">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 text-xs font-semibold text-charcoal border border-slate-100 max-w-full">
                                    <CalendarIcon size={12} className="text-slate-400 shrink-0" />
                                    <span className="truncate">{dateLabel} • {format(date, 'h:mm a', { locale: ar })}</span>
                                </span>

                                {isLive ? (
                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold animate-pulse shrink-0">
                                        <Radio size={10} />
                                        بث مباشر
                                    </span>
                                ) : isLectureToday && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold animate-pulse shrink-0">
                                        قريباً
                                    </span>
                                )}
                            </div>

                            <h3 className="font-bold text-charcoal mb-1 line-clamp-1 group-hover:text-shibl-crimson transition-colors" title={lectureTitle}>
                                {lectureTitle}
                            </h3>

                            <div className="flex items-center justify-between mt-3">
                                <div className="text-xs text-slate-500">
                                    {courseName} {duration && `• ${duration}`}
                                </div>

                                {isLive && (isLectureToday || isLectureTomorrow) ? (
                                    <button
                                        onClick={() => {
                                            if (schedule.lecture?.course?.id && schedule.lecture?.id) {
                                                navigate(`/dashboard/courses/${schedule.lecture.course.id}/lecture/${schedule.lecture.id}`);
                                            }
                                        }}
                                        className="px-3 py-1.5 rounded-lg bg-shibl-crimson text-white text-xs font-semibold shadow-sm hover:bg-shibl-crimson/90 transition-colors flex items-center gap-1.5"
                                    >
                                        <Radio size={12} />
                                        انضم الآن
                                    </button>
                                ) : (
                                    <button className="w-8 h-8 rounded-full bg-shibl-crimson/5 flex items-center justify-center text-shibl-crimson opacity-0 group-hover:opacity-100 transition-opacity">
                                        <PlayCircle size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
