import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, MoreVertical, Video, ArrowRight } from 'lucide-react';
import { teacherService } from '../../../../data/api';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ClassItem {
    id: number;
    title: string;
    time: string;
    duration: string;
    students: number;
    type: 'live' | 'offline';
    level: string;
    status: 'live_now' | 'upcoming' | 'completed' | 'scheduled';
    bbb_meeting_id?: string | null;
    start_raw?: Date;
}

export function DailyScheduleTimeline() {
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [nextSessionIn, setNextSessionIn] = useState<string | null>(null);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                // Now using the real endpoint
                const data = await teacherService.getDashboardSchedule();

                // Map API data to UI model
                const mappedClasses = data.map((lecture: any) => {
                    const startDate = new Date(lecture.start_time); // UTC ISO string
                    const endDate = new Date(lecture.end_time);

                    // Determine type based on is_online flag
                    const type = lecture.is_online ? 'live' : 'offline';

                    return {
                        id: lecture.id,
                        title: getLocalizedText(lecture.title, 'محاضرة'),
                        time: format(startDate, 'hh:mm a', { locale: ar }),
                        duration: `${lecture.duration_minutes || 60} دقيقة`,
                        students: lecture.students_count || 0,
                        type: type as 'live' | 'offline',
                        level: lecture.course?.name?.ar || lecture.course?.name || 'عام',
                        status: lecture.calculated_status, // 'live_now', 'upcoming', 'completed'
                        bbb_meeting_id: lecture.bbb_meeting_id,
                        start_raw: startDate // Keep raw for countdown
                    };
                });
                setClasses(mappedClasses);
            } catch (err) {
                console.error('Failed to fetch schedule', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSchedule();
    }, []);

    // Countdown Timer Logic
    useEffect(() => {
        if (!classes.length) return;

        const updateCountdown = () => {
            const now = new Date();
            // Find the first upcoming session
            const next = classes.find((c: any) => c.start_raw > now && c.status === 'upcoming');

            if (next) {
                const diff = (next as any).start_raw.getTime() - now.getTime();
                const minutes = Math.floor(diff / 60000);

                if (minutes < 60) {
                    setNextSessionIn(`تبدأ بعد ${minutes} دقيقة`);
                } else {
                    const hours = Math.floor(minutes / 60);
                    setNextSessionIn(`تبدأ بعد ${hours} ساعة`);
                }
            } else {
                setNextSessionIn(null);
            }
        };

        const timer = setInterval(updateCountdown, 60000); // Update every minute
        updateCountdown(); // Initial run

        return () => clearInterval(timer);
    }, [classes]);

    const handleJoin = (meetingId?: string) => {
        if (!meetingId) {
            // Fallback or show error
            alert('Meeting ID not available yet.');
            return;
        }
        // Redirect to BBB join route (handled by another service or direct link)
        // For now, assume a route exists
        window.open(`/api/v1/meetings/join/${meetingId}`, '_blank');
    };

    // Helper to handle localized strings
    const getLocalizedText = (obj: any, fallback: string) => {
        if (typeof obj === 'string') return obj;
        return obj?.ar || obj?.en || fallback;
    };


    if (loading) {
        return (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 h-full animate-pulse">
                <div className="h-8 w-48 bg-slate-200 rounded mb-6" />
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-slate-100 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }


    return (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] h-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Calendar className="text-shibl-crimson" size={24} />
                        جدول اليوم
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        {nextSessionIn ? (
                            <span className="text-shibl-crimson font-medium animate-pulse">{nextSessionIn}</span>
                        ) : (
                            `لديك ${classes.length} حصص اليوم`
                        )}
                    </p>
                </div>
                <button className="text-sm font-medium text-shibl-crimson hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                    عرض الجدول
                </button>
            </div>

            <div className="relative space-y-0">
                {/* Vertical Line */}
                <div className="absolute right-[5.5rem] top-4 bottom-4 w-px bg-slate-100 hidden md:block" />

                {classes.length > 0 ? (
                    classes.map((cls, idx) => {
                        const isLive = cls.status === 'live_now';

                        return (
                            <motion.div
                                key={cls.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * idx }}
                                className="relative flex flex-col md:flex-row gap-4 md:gap-8 pb-8 last:pb-0 group"
                            >
                                {/* Time Column */}
                                <div className="flex  md:w-20 flex-col items-center md:items-end pt-1 flex-shrink-0">
                                    <span className={`font-bold ${isLive ? 'text-shibl-crimson' : 'text-slate-700'}`}>{cls.time}</span>
                                    <span className="text-xs text-slate-400">{cls.duration}</span>
                                </div>

                                {/* Interactive Timeline Dot */}
                                <div className="relative z-10 hidden md:flex items-center justify-center w-6 flex-shrink-0">
                                    <div className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${isLive
                                        ? 'bg-shibl-crimson border-red-200 scale-125 shadow-[0_0_0_4px_rgba(220,38,38,0.1)] animate-pulse'
                                        : 'bg-slate-300 border-slate-100 group-hover:bg-slate-400'
                                        }`} />
                                </div>

                                {/* Card Content */}
                                <div className={`flex-1 rounded-2xl p-4 border transition-all duration-300 ${isLive
                                    ? 'bg-gradient-to-br from-red-50/50 to-white border-red-100 shadow-md border-red-200'
                                    : 'bg-white border-slate-100 hover:shadow-md hover:border-slate-200'
                                    }`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${isLive
                                            ? 'bg-red-100 text-red-700 animate-pulse'
                                            : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {isLive ? 'جاري الآن' : (cls.type === 'live' ? 'بث مباشر' : 'مسجلة')}
                                        </span>
                                        <button className="text-slate-400 hover:text-slate-600">
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>

                                    <h3 className="font-bold text-slate-800 mb-1">{cls.title}</h3>
                                    <p className="text-sm text-slate-500 mb-4 flex items-center gap-1">
                                        <MapPin size={12} />
                                        {cls.level}
                                    </p>

                                    <div className="flex items-center justify-between border-t border-slate-50/50 pt-3 mt-auto">
                                        <div className="flex -space-x-2 space-x-reverse overflow-hidden">
                                            {/* Show actual student count, mock avatars for now or empty if 0 */}
                                            {cls.students > 0 && (
                                                <>
                                                    {[...Array(Math.min(3, cls.students))].map((_, i) => (
                                                        <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white" />
                                                    ))}
                                                    {cls.students > 3 && (
                                                        <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-500">
                                                            +{cls.students - 3}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                            {cls.students === 0 && <span className="text-xs text-slate-400">لا يوجد طلاب</span>}

                                        </div>

                                        {isLive && (
                                            <button
                                                onClick={() => handleJoin((cls as any).bbb_meeting_id)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-shibl-crimson text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm shadow-red-200 animate-bounce-subtle"
                                            >
                                                <Video size={12} />
                                                انضم الآن
                                            </button>
                                        )}
                                        {!isLive && cls.type === 'offline' && (
                                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors">
                                                التفاصيل
                                                <ArrowRight size={12} className="rtl:rotate-180" />
                                            </button>
                                        )}
                                        {!isLive && cls.type === 'live' && cls.status === 'upcoming' && (
                                            <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                                لم يبدأ بعد
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                            <Calendar size={32} />
                        </div>
                        <p className="font-medium text-slate-600 mb-1">لا توجد حصص اليوم</p>
                        <p className="text-xs">استمتع بوقتك! يمكنك التحضير لحصص الغد</p>
                    </div>
                )}
            </div>
        </div>
    );
}
