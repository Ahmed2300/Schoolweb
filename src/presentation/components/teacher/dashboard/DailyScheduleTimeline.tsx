import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, MoreVertical, Video, ArrowRight, ChevronLeft, ChevronRight, Loader2, Eye, XCircle } from 'lucide-react';
import { teacherService } from '../../../../data/api';
import { teacherLectureService } from '../../../../data/api/teacherLectureService';
import { format, addDays, isSameDay, startOfDay } from 'date-fns';
import { ar } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { LiveSessionEmbedModal } from '../../shared/LiveSessionEmbedModal';

interface ClassItem {
    id: number;
    title: string;
    time: string;
    duration: string;
    students: number;
    type: 'live' | 'offline';
    level: string;
    status: 'live_now' | 'upcoming' | 'completed' | 'scheduled';
    meeting_status?: 'scheduled' | 'preparing' | 'ready' | 'ongoing' | 'completed' | null;
    bbb_meeting_id?: string | null;
    start_raw: Date;
    recording_url?: string | null;
    has_recording?: boolean;
}

export function DailyScheduleTimeline() {
    const [allClasses, setAllClasses] = useState<ClassItem[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [loading, setLoading] = useState(true);
    const [nextSessionIn, setNextSessionIn] = useState<string | null>(null);
    const [joiningLectureId, setJoiningLectureId] = useState<number | null>(null);
    const [liveSessionEmbedUrl, setLiveSessionEmbedUrl] = useState<string | null>(null);
    const [isLiveSessionModalOpen, setIsLiveSessionModalOpen] = useState(false);

    // Generate next 7 days
    const next7Days = useMemo(() => {
        const days = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            days.push(addDays(today, i));
        }
        return days;
    }, []);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                // Determine if we need to fetch specific range or just rely on backend default which is now 7 days
                const data = await teacherService.getDashboardSchedule();

                // Map API data to UI model
                const mappedClasses = data.map((lecture: any) => {
                    const startDate = new Date(lecture.start_time); // UTC ISO string
                    // const endDate = new Date(lecture.end_time);

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
                        meeting_status: lecture.meeting_status,
                        bbb_meeting_id: lecture.bbb_meeting_id,
                        start_raw: startDate, // Keep raw for countdown and filtering
                        recording_url: lecture.recording_url,
                        has_recording: lecture.has_recording || !!lecture.recording_url,
                    };
                });
                setAllClasses(mappedClasses);
            } catch (err) {
                console.error('Failed to fetch schedule', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSchedule();
    }, []);

    // Filter classes for selected date
    const classesForSelectedDate = useMemo(() => {
        return allClasses.filter(cls => isSameDay(cls.start_raw, selectedDate));
    }, [allClasses, selectedDate]);

    // Countdown Timer Logic (Global across all fetched days, or just today? Usually next session overall)
    useEffect(() => {
        if (!allClasses.length) return;

        const updateCountdown = () => {
            const now = new Date();
            // Find the first upcoming session
            const next = allClasses.find((c) => c.start_raw > now && c.status === 'upcoming');

            if (next) {
                const diff = next.start_raw.getTime() - now.getTime();
                const minutes = Math.floor(diff / 60000);

                if (minutes < 60) {
                    setNextSessionIn(`تبدأ بعد ${minutes} دقيقة #${next.title}`);
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
    }, [allClasses]);

    const handleJoin = async (lectureId: number) => {
        if (joiningLectureId) return;

        setJoiningLectureId(lectureId);
        const loadingToast = toast.loading('جاري بدء الجلسة...');

        try {
            const response = await teacherLectureService.generateSecureEmbedToken(lectureId);
            toast.dismiss(loadingToast);

            if (response.success && response.data?.embed_url) {
                setLiveSessionEmbedUrl(response.data.embed_url);
                setIsLiveSessionModalOpen(true);
                toast.success('تم بدء الجلسة بنجاح!');
            } else {
                toast.error(response.message || 'لم يتم استلام رابط الجلسة');
            }
        } catch (error: any) {
            toast.dismiss(loadingToast);
            console.error('Join session error:', error);
            toast.error(error.response?.data?.message || 'فشل الانضمام للجلسة');
        } finally {
            setJoiningLectureId(null);
        }
    };

    const handleCloseLiveSession = () => {
        setIsLiveSessionModalOpen(false);
        setLiveSessionEmbedUrl(null);
    };

    // Helper to handle localized strings
    const getLocalizedText = (obj: any, fallback: string) => {
        if (typeof obj === 'string') return obj;
        return obj?.ar || obj?.en || fallback;
    };


    if (loading) {
        return (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 h-full animate-pulse">
                <div className="flex justify-between mb-6">
                    <div className="h-8 w-48 bg-slate-200 rounded" />
                    <div className="h-8 w-24 bg-slate-200 rounded" />
                </div>
                <div className="flex gap-2 mb-6 overflow-hidden">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-16 w-16 bg-slate-100 rounded-xl flex-shrink-0" />
                    ))}
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-slate-100 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }


    return (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Calendar className="text-shibl-crimson" size={24} />
                        جدول الحصص
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        {nextSessionIn ? (
                            <span className="text-shibl-crimson font-medium animate-pulse">{nextSessionIn}</span>
                        ) : (
                            `لديك ${classesForSelectedDate.length} حصص في هذا اليوم`
                        )}
                    </p>
                </div>
                {/* Could add a 'View Full Calendar' link here if needed */}
            </div>

            {/* Date Tabs */}
            <div className="flex gap-3 overflow-x-auto pb-4 mb-2 no-scrollbar scroll-smooth" dir="rtl">
                {next7Days.map((date, idx) => {
                    const isSelected = isSameDay(date, selectedDate);
                    const isToday = isSameDay(date, new Date());

                    return (
                        <button
                            key={idx}
                            onClick={() => setSelectedDate(date)}
                            className={`flex flex-col items-center justify-center min-w-[4.5rem] py-3 rounded-2xl transition-all duration-300 border ${isSelected
                                ? 'bg-shibl-crimson text-white border-shibl-crimson shadow-md shadow-red-100 scale-105'
                                : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                        >
                            <span className={`text-xs font-medium mb-1 ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                                {isToday ? 'اليوم' : format(date, 'EEEE', { locale: ar })}
                            </span>
                            <span className={`text-xl font-bold ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                                {format(date, 'd')}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="relative space-y-0 flex-1 overflow-y-auto pr-2 -mr-2 max-h-[600px] custom-scrollbar">
                {/* Vertical Line */}
                <div className="absolute right-[5.5rem] top-4 bottom-4 w-px bg-slate-100 hidden md:block" />

                <AnimatePresence mode='wait'>
                    {classesForSelectedDate.length > 0 ? (
                        <div className="space-y-0">
                            {classesForSelectedDate.map((cls, idx) => {
                                const isLive = cls.status === 'live_now';

                                return (
                                    <motion.div
                                        key={cls.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ delay: 0.1 * idx }}
                                        className="relative flex flex-col md:flex-row gap-4 md:gap-8 pb-8 last:pb-0 group"
                                    >
                                        {/* Time Column */}
                                        <div className="flex md:w-20 flex-col items-center md:items-end pt-1 flex-shrink-0">
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

                                                {/* Preparing state - system auto-starting */}
                                                {cls.meeting_status === 'preparing' && (
                                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 text-xs font-medium rounded-lg border border-amber-200">
                                                        <Loader2 size={12} className="animate-spin" />
                                                        جاري التحضير...
                                                    </div>
                                                )}
                                                {/* Live/Ready - show join button */}
                                                {cls.meeting_status !== 'preparing' && isLive && (
                                                    <button
                                                        onClick={() => handleJoin(cls.id)}
                                                        disabled={joiningLectureId === cls.id}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 bg-shibl-crimson text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm shadow-red-200 ${joiningLectureId === cls.id ? 'opacity-70 cursor-not-allowed' : 'animate-bounce-subtle'}`}
                                                    >
                                                        {joiningLectureId === cls.id ? <Loader2 size={12} className="animate-spin" /> : <Video size={12} />}
                                                        {joiningLectureId === cls.id ? 'جاري...' : 'انضم الآن'}
                                                    </button>
                                                )}
                                                {cls.status === 'completed' && cls.has_recording && (
                                                    <button
                                                        onClick={() => cls.recording_url && window.open(cls.recording_url, '_blank')}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-l from-emerald-500 to-green-600 text-white text-xs font-bold rounded-lg hover:shadow-lg hover:shadow-green-200/50 transition-all"
                                                    >
                                                        <Eye size={12} />
                                                        شاهد الآن
                                                    </button>
                                                )}
                                                {cls.status === 'completed' && !cls.has_recording && (
                                                    <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-500 text-xs font-medium rounded">
                                                        <XCircle size={12} />
                                                        انتهت
                                                    </div>
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
                            })}
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex flex-col items-center justify-center py-12 text-center text-slate-400 h-64"
                        >
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                <Calendar size={32} />
                            </div>
                            <p className="font-medium text-slate-600 mb-1">لا توجد حصص في هذا اليوم</p>
                            <p className="text-xs">استمتع بوقتك! يمكنك التحضير لحصص الأيام القادمة</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Live Session Modal */}
            <LiveSessionEmbedModal
                isOpen={isLiveSessionModalOpen}
                onClose={handleCloseLiveSession}
                embedUrl={liveSessionEmbedUrl}
                title="جلستك المباشرة"
            />
        </div>
    );
}
