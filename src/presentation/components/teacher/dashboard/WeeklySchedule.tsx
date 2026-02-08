import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Users, Video, Play, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { teacherService } from '../../../../data/api';
import { format, addDays, isSameDay, isToday, isTomorrow, startOfDay, differenceInMinutes } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ScheduleItem {
    id: number;
    title: string;
    start_time: Date;
    end_time: Date;
    duration_minutes: number;
    students_count: number;
    course_name: string;
    is_online: boolean;
    status: 'live_now' | 'upcoming' | 'completed' | 'scheduled';
    bbb_meeting_id?: string | null;
}

interface DayGroup {
    date: Date;
    label: string;
    items: ScheduleItem[];
}

export function WeeklySchedule() {
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const data = await teacherService.getDashboardSchedule();
                const mapped: ScheduleItem[] = data.map((lecture: any) => ({
                    id: lecture.id,
                    title: getLocalizedText(lecture.title, 'محاضرة'),
                    start_time: new Date(lecture.start_time),
                    end_time: new Date(lecture.end_time),
                    duration_minutes: lecture.duration_minutes || 60,
                    students_count: lecture.students_count || 0,
                    course_name: lecture.course?.name?.ar || lecture.course?.name?.en || 'دورة',
                    is_online: lecture.is_online,
                    status: lecture.calculated_status,
                    bbb_meeting_id: lecture.bbb_meeting_id,
                }));
                setSchedule(mapped);
            } catch (err) {
                console.error('Failed to fetch schedule', err);
                setError('حدث خطأ أثناء تحميل الجدول');
            } finally {
                setLoading(false);
            }
        };
        fetchSchedule();
    }, []);

    // Group schedule by day
    const groupedSchedule = useMemo((): DayGroup[] => {
        const groups: DayGroup[] = [];
        const today = startOfDay(new Date());

        for (let i = 0; i < 7; i++) {
            const date = addDays(today, i);
            const items = schedule.filter(item => isSameDay(item.start_time, date));

            let label = format(date, 'EEEE، d MMMM', { locale: ar });
            if (isToday(date)) label = `اليوم - ${format(date, 'd MMMM', { locale: ar })}`;
            else if (isTomorrow(date)) label = `غداً - ${format(date, 'd MMMM', { locale: ar })}`;

            groups.push({ date, label, items });
        }
        return groups;
    }, [schedule]);

    // Stats
    const totalLectures = schedule.length;
    const liveLectures = schedule.filter(s => s.status === 'live_now').length;
    const upcomingToday = schedule.filter(s => isToday(s.start_time) && s.status === 'upcoming').length;

    const handleJoin = (meetingId?: string | null) => {
        if (!meetingId) {
            alert('رابط الاجتماع غير متوفر بعد');
            return;
        }
        window.open(`/api/v1/meetings/join/${meetingId}`, '_blank');
    };

    const getLocalizedText = (obj: any, fallback: string): string => {
        if (typeof obj === 'string') return obj;
        return obj?.ar || obj?.en || fallback;
    };

    if (loading) {
        return (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-pulse">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-8 bg-slate-200 rounded-xl" />
                    <div className="h-6 w-40 bg-slate-200 rounded" />
                </div>
                <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                        <div key={i}>
                            <div className="h-5 w-32 bg-slate-100 rounded mb-3" />
                            <div className="h-20 bg-slate-50 rounded-2xl" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-3xl p-6 border border-red-100 text-center">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-gradient-to-l from-slate-50/50 to-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-shibl-crimson to-red-600 flex items-center justify-center text-white shadow-lg shadow-red-200/50">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">الجدول الأسبوعي</h2>
                            <p className="text-sm text-slate-400">
                                {totalLectures === 0
                                    ? 'لا توجد محاضرات هذا الأسبوع'
                                    : `${totalLectures} محاضرة خلال الأسبوع`
                                }
                            </p>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="hidden md:flex items-center gap-4">
                        {liveLectures > 0 && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-sm font-medium animate-pulse">
                                <span className="w-2 h-2 bg-red-500 rounded-full" />
                                {liveLectures} بث مباشر
                            </div>
                        )}
                        {upcomingToday > 0 && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-full text-sm font-medium">
                                <Clock size={14} />
                                {upcomingToday} قادمة اليوم
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="p-6 max-h-[600px] overflow-y-auto custom-scrollbar">
                <div className="space-y-8">
                    {groupedSchedule.map((group, groupIdx) => {
                        const hasLectures = group.items.length > 0;
                        const isCurrentDay = isToday(group.date);

                        return (
                            <motion.div
                                key={groupIdx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: groupIdx * 0.05 }}
                            >
                                {/* Day Header */}
                                <div className={`flex items-center gap-3 mb-3 ${isCurrentDay ? 'text-shibl-crimson' : 'text-slate-500'}`}>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${isCurrentDay
                                            ? 'bg-shibl-crimson text-white shadow-md shadow-red-200'
                                            : hasLectures
                                                ? 'bg-slate-100 text-slate-600'
                                                : 'bg-slate-50 text-slate-400'
                                        }`}>
                                        {format(group.date, 'd')}
                                    </div>
                                    <span className={`text-sm font-semibold ${isCurrentDay ? 'text-shibl-crimson' : hasLectures ? 'text-slate-700' : 'text-slate-400'}`}>
                                        {group.label}
                                    </span>
                                    {!hasLectures && (
                                        <span className="text-xs text-slate-300 bg-slate-50 px-2 py-0.5 rounded-full">يوم حر</span>
                                    )}
                                </div>

                                {/* Lectures */}
                                {hasLectures ? (
                                    <div className="space-y-3 mr-11">
                                        {group.items.map((item, itemIdx) => {
                                            const isLive = item.status === 'live_now';
                                            const isUpcoming = item.status === 'upcoming';
                                            const minutesUntil = differenceInMinutes(item.start_time, new Date());

                                            return (
                                                <motion.div
                                                    key={item.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: groupIdx * 0.05 + itemIdx * 0.03 }}
                                                    className={`relative rounded-2xl border p-4 transition-all duration-300 ${isLive
                                                            ? 'bg-gradient-to-l from-red-50 to-white border-red-200 shadow-lg shadow-red-100/50'
                                                            : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-md'
                                                        }`}
                                                >
                                                    {/* Live Indicator */}
                                                    {isLive && (
                                                        <div className="absolute -top-2 -right-2 px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full animate-pulse shadow-lg">
                                                            🔴 مباشر الآن
                                                        </div>
                                                    )}

                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1 min-w-0">
                                                            {/* Title & Course */}
                                                            <h4 className="font-bold text-slate-800 truncate mb-1">{item.title}</h4>
                                                            <p className="text-sm text-slate-400 truncate">{item.course_name}</p>

                                                            {/* Meta Row */}
                                                            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                                                                <span className="flex items-center gap-1.5">
                                                                    <Clock size={12} className="text-slate-400" />
                                                                    {format(item.start_time, 'hh:mm a', { locale: ar })}
                                                                </span>
                                                                <span className="flex items-center gap-1.5">
                                                                    <Users size={12} className="text-slate-400" />
                                                                    {item.students_count} طالب
                                                                </span>
                                                                <span className={`px-2 py-0.5 rounded-full font-medium ${item.is_online
                                                                        ? 'bg-blue-50 text-blue-600'
                                                                        : 'bg-slate-100 text-slate-500'
                                                                    }`}>
                                                                    {item.is_online ? 'بث مباشر' : 'مسجلة'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Action */}
                                                        <div className="flex-shrink-0">
                                                            {isLive && (
                                                                <button
                                                                    onClick={() => handleJoin(item.bbb_meeting_id)}
                                                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-l from-shibl-crimson to-red-600 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-red-200/50 transition-all duration-300"
                                                                >
                                                                    <Video size={16} />
                                                                    انضم
                                                                </button>
                                                            )}
                                                            {isUpcoming && minutesUntil <= 60 && minutesUntil > 0 && (
                                                                <div className="text-center">
                                                                    <div className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg font-medium">
                                                                        تبدأ بعد {minutesUntil} دقيقة
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {!isLive && !isUpcoming && (
                                                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300">
                                                                    <Play size={16} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="mr-11 py-3 px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-100 text-center text-sm text-slate-300">
                                        لا توجد محاضرات
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
