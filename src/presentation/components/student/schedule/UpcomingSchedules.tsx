import { useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import { format, parseISO, isAfter, isToday, isTomorrow, addMinutes, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { ar } from 'date-fns/locale';
import { PlayCircle, Clock, Calendar as CalendarIcon, Radio, Timer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getLocalizedName } from '@/data/api/studentService';
import { Schedule } from '@/types/schedule';

interface UpcomingSchedulesProps {
    schedules: Schedule[];
}

export function UpcomingSchedules({ schedules }: UpcomingSchedulesProps) {
    const navigate = useNavigate();
    // Force re-render every minute for countdowns
    const [currentTime, setCurrentTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const upcomingList = useMemo(() => {
        // Filter to only TODAY's lectures that haven't ended yet (or are ongoing from yesterday)
        return schedules
            .filter((s) => {
                if (!s.lecture || s.is_completed) return false;
                const scheduledDate = parseISO(s.scheduled_at);
                const duration = s.lecture.duration_minutes || 60;
                const endTime = addMinutes(scheduledDate, duration);

                // Ignore if it has already ended
                if (!isAfter(endTime, currentTime)) return false;

                // Show if scheduled today, OR if currently ongoing (Midnight crossover)
                const isScheduledToday = isToday(scheduledDate);
                const isOngoing = currentTime >= scheduledDate && currentTime <= endTime;

                return isScheduledToday || isOngoing;
            })
            .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
    }, [schedules, currentTime]);

    // We want to highlight exactly up to 3 upcoming limits
    const displayList = upcomingList.slice(0, 3);

    if (displayList.length === 0) return null;

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-charcoal flex items-center gap-2">
                    <Clock className="w-5 h-5 text-shibl-crimson" />
                    محاضرات اليوم
                </h2>
                {upcomingList.length > 3 && (
                    <button
                        onClick={() => navigate('/dashboard/schedule')}
                        className="text-sm text-shibl-crimson font-medium hover:underline"
                    >
                        عرض الكل
                    </button>
                )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {displayList.map((schedule) => {
                    const date = parseISO(schedule.scheduled_at);
                    const duration = schedule.lecture?.duration_minutes || 60; // Fallback to 60 mins
                    const endTime = addMinutes(date, duration);

                    // Treat ongoing midnight crossovers as "Today" for UI badges
                    const isOngoing = currentTime >= date && currentTime <= endTime;
                    const isLectureToday = isToday(date) || isOngoing;
                    const isLectureTomorrow = isTomorrow(date) && !isOngoing;

                    const isOnline = !!schedule.lecture?.is_online;
                    const startTime = parseISO(schedule.scheduled_at);

                    const isLive = isOnline && currentTime >= startTime && currentTime <= endTime;

                    const startsInMins = differenceInMinutes(startTime, currentTime);
                    const isStartingSoon = isOnline && startsInMins > 0 && startsInMins <= 120;

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

                    const gradeName = schedule.lecture?.course?.grade
                        ? getLocalizedName(schedule.lecture.course.grade.name, '')
                        : '';

                    const semesterName = schedule.lecture?.course?.semester
                        ? getLocalizedName(schedule.lecture.course.semester.name, '')
                        : '';

                    const detailsLabels = [gradeName, semesterName].filter(Boolean).join(' - ');

                    const durationLabel = `${duration} دقيقة`;

                    // Styling based on urgency
                    const cardStyle = isLive
                        ? 'bg-red-50 border-red-200'
                        : isStartingSoon
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-white border-slate-100';

                    const stripColor = isLive
                        ? 'bg-red-500'
                        : isStartingSoon
                            ? 'bg-amber-500'
                            : 'bg-shibl-crimson/50';

                    return (
                        <div
                            key={schedule.id}
                            onClick={() => {
                                if (schedule.lecture?.course?.id) {
                                    navigate(`/dashboard/courses/${schedule.lecture.course.id}?open_lecture=${schedule.lecture.id}`);
                                }
                            }}
                            className={`
                                rounded-xl border p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group cursor-pointer
                                ${cardStyle}
                            `}
                        >
                            <div className={`absolute top-0 right-0 w-1 h-full ${stripColor}`} />

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
                                ) : isStartingSoon ? (
                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold animate-pulse shrink-0">
                                        <Timer size={10} />
                                        يبدأ خلال {startsInMins} دقيقة
                                    </span>
                                ) : isLectureToday && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold shrink-0">
                                        اليوم
                                    </span>
                                )}
                            </div>

                            <h3 className="font-bold text-charcoal mb-1 line-clamp-1 group-hover:text-shibl-crimson transition-colors" title={lectureTitle}>
                                {lectureTitle}
                            </h3>

                            <div className="flex items-end justify-between mt-3 gap-2">
                                <div className="text-xs text-slate-500 line-clamp-2 leading-relaxed flex-1">
                                    {courseName} {detailsLabels && `- ${detailsLabels}`} {durationLabel && `• ${durationLabel}`}
                                </div>

                                {isLive ? (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (schedule.lecture?.course?.id && schedule.lecture?.id) {
                                                navigate(`/dashboard/courses/${schedule.lecture.course.id}/lecture/${schedule.lecture.id}`);
                                            }
                                        }}
                                        className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold shadow-sm hover:bg-red-600 transition-colors flex items-center gap-1.5 animate-pulse"
                                    >
                                        <Radio size={12} />
                                        انضم الآن
                                    </button>
                                ) : isStartingSoon ? (
                                    <button
                                        disabled
                                        className="px-3 py-1.5 rounded-lg bg-amber-500/50 text-white text-xs font-semibold cursor-not-allowed flex items-center gap-1.5"
                                    >
                                        <Timer size={12} />
                                        قريباً
                                    </button>
                                ) : (
                                    <button className="w-8 h-8 rounded-full bg-shibl-crimson/5 flex items-center justify-center text-shibl-crimson opacity-0 group-hover:opacity-100 transition-opacity" title="عرض التفاصيل">
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
