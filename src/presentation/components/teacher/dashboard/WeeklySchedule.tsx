import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Users, Video, Play, ChevronLeft, ChevronRight, Sparkles, Loader2, Eye, XCircle } from 'lucide-react';
import { teacherService } from '../../../../data/api';
import { teacherLectureService } from '../../../../data/api/teacherLectureService';
import { format, addDays, isSameDay, isToday, isTomorrow, startOfDay, differenceInMinutes } from 'date-fns';
import { ar } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { LiveSessionEmbedModal } from '../../shared/LiveSessionEmbedModal';
import { requestMicPermission } from '../../../../hooks/useMediaPermissions';


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
    meeting_status?: 'scheduled' | 'preparing' | 'ready' | 'ongoing' | 'completed' | null;
    bbb_meeting_id?: string | null;
    recording_url?: string | null;
    has_recording?: boolean;
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
    const [joiningLectureId, setJoiningLectureId] = useState<number | null>(null);
    const [liveSessionEmbedUrl, setLiveSessionEmbedUrl] = useState<string | null>(null);
    const [isLiveSessionModalOpen, setIsLiveSessionModalOpen] = useState(false);

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
                    meeting_status: lecture.meeting_status,
                    bbb_meeting_id: lecture.bbb_meeting_id,
                    recording_url: lecture.recording_url,
                    has_recording: lecture.has_recording || !!lecture.recording_url,
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

    const handleJoin = async (lectureId: number) => {
        if (joiningLectureId) return; // Prevent double-click

        setJoiningLectureId(lectureId);

        // Pre-request mic permission before generating embed token
        const micResult = await requestMicPermission();
        if (!micResult.granted) {
            toast.error(
                micResult.errorMessage || 'يجب السماح بالوصول للميكروفون لبدء الجلسة',
                { duration: 6000 }
            );
        }

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

    const getLocalizedText = (obj: any, fallback: string): string => {
        if (typeof obj === 'string') return obj;
        return obj?.ar || obj?.en || fallback;
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 border border-slate-100 dark:border-white/5 shadow-sm animate-pulse">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-8 bg-slate-200 dark:bg-white/5 rounded-xl" />
                    <div className="h-6 w-40 bg-slate-200 dark:bg-white/5 rounded" />
                </div>
                <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                        <div key={i}>
                            <div className="h-5 w-32 bg-slate-100 dark:bg-white/5 rounded mb-3" />
                            <div className="h-20 bg-slate-50 dark:bg-white/5 rounded-2xl" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 border border-red-100 dark:border-red-900/30 text-center">
                <p className="text-red-500 dark:text-red-400">{error}</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl border border-slate-100 dark:border-white/5 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-gradient-to-l from-slate-50/50 to-white dark:from-[#2A2A2A] dark:to-[#1E1E1E]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-shibl-crimson to-red-600 flex items-center justify-center text-white shadow-lg shadow-red-200/50 dark:shadow-none">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-charcoal dark:text-white">الجدول الأسبوعي</h2>
                            <p className="text-sm text-slate-400 dark:text-gray-400">
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
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-sm font-medium animate-pulse">
                                <span className="w-2 h-2 bg-red-500 rounded-full" />
                                {liveLectures} بث مباشر
                            </div>
                        )}
                        {upcomingToday > 0 && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full text-sm font-medium">
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
                                <div className={`flex items-center gap-3 mb-3 ${isCurrentDay ? 'text-shibl-crimson' : 'text-gray-500'}`}>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${isCurrentDay
                                        ? 'bg-shibl-crimson text-white shadow-md shadow-red-200 dark:shadow-none'
                                        : hasLectures
                                            ? 'bg-slate-100 dark:bg-[#333333] text-slate-600 dark:text-gray-300'
                                            : 'bg-slate-50 dark:bg-[#2A2A2A] text-slate-400 dark:text-gray-500'
                                        }`}>
                                        {format(group.date, 'd')}
                                    </div>
                                    <span className={`text-sm font-semibold ${isCurrentDay ? 'text-shibl-crimson' : hasLectures ? 'text-charcoal dark:text-gray-300' : 'text-slate-400 dark:text-gray-500'}`}>
                                        {group.label}
                                    </span>
                                    {!hasLectures && (
                                        <span className="text-xs text-slate-300 dark:text-gray-600 bg-slate-50 dark:bg-[#2A2A2A] px-2 py-0.5 rounded-full">يوم حر</span>
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
                                                        ? 'bg-gradient-to-l from-red-50 to-white dark:from-red-900/10 dark:to-[#1E1E1E] border-red-200 dark:border-red-900/30 shadow-lg shadow-red-100/50 dark:shadow-none'
                                                        : 'bg-white dark:bg-[#2A2A2A] border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10 hover:shadow-md'
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
                                                            <h4 className="font-bold text-charcoal dark:text-white truncate mb-1">{item.title}</h4>
                                                            <p className="text-sm text-slate-400 dark:text-gray-400 truncate">{item.course_name}</p>

                                                            {/* Meta Row */}
                                                            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-gray-400">
                                                                <span className="flex items-center gap-1.5">
                                                                    <Clock size={12} className="text-slate-400 dark:text-gray-500" />
                                                                    {format(item.start_time, 'hh:mm a', { locale: ar })}
                                                                </span>
                                                                <span className="flex items-center gap-1.5">
                                                                    <Users size={12} className="text-slate-400 dark:text-gray-500" />
                                                                    {item.students_count} طالب
                                                                </span>
                                                                <span className={`px-2 py-0.5 rounded-full font-medium ${item.is_online
                                                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                                                    : 'bg-slate-100 dark:bg-[#333333] text-slate-500 dark:text-gray-400'
                                                                    }`}>
                                                                    {item.is_online ? 'بث مباشر' : 'مسجلة'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Action */}
                                                        <div className="flex-shrink-0">
                                                            {/* Preparing state - system auto-starting */}
                                                            {item.meeting_status === 'preparing' && (
                                                                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-sm font-medium rounded-xl border border-amber-200 dark:border-amber-900/40">
                                                                    <Loader2 size={16} className="animate-spin" />
                                                                    جاري التحضير...
                                                                </div>
                                                            )}
                                                            {/* Live/Ready - show join button */}
                                                            {item.meeting_status !== 'preparing' && isLive && (
                                                                <button
                                                                    onClick={() => handleJoin(item.id)}
                                                                    disabled={joiningLectureId === item.id}
                                                                    className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-l from-shibl-crimson to-red-600 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-red-200/50 dark:hover:shadow-none transition-all duration-300 ${joiningLectureId === item.id ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                                >
                                                                    {joiningLectureId === item.id ? <Loader2 size={16} className="animate-spin" /> : <Video size={16} />}
                                                                    {joiningLectureId === item.id ? 'جاري...' : 'انضم'}
                                                                </button>
                                                            )}
                                                            {item.meeting_status !== 'preparing' && isUpcoming && minutesUntil <= 60 && minutesUntil > 0 && (
                                                                <div className="text-center">
                                                                    <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg font-medium">
                                                                        تبدأ بعد {minutesUntil} دقيقة
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {item.status === 'completed' && item.has_recording && (
                                                                <button
                                                                    onClick={() => {
                                                                        if (item.recording_url) {
                                                                            setLiveSessionEmbedUrl(item.recording_url);
                                                                            setIsLiveSessionModalOpen(true);
                                                                        }
                                                                    }}
                                                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-l from-emerald-500 to-green-600 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-green-200/50 dark:hover:shadow-none transition-all duration-300"
                                                                >
                                                                    <Eye size={16} />
                                                                    شاهد الآن
                                                                </button>
                                                            )}
                                                            {item.status === 'completed' && !item.has_recording && (
                                                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-[#333333] text-slate-500 dark:text-gray-400 text-xs font-medium rounded-lg">
                                                                    <XCircle size={14} />
                                                                    انتهت
                                                                </div>
                                                            )}
                                                            {item.meeting_status !== 'preparing' && !isLive && isUpcoming && minutesUntil > 60 && (
                                                                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-[#2A2A2A] flex items-center justify-center text-slate-300 dark:text-gray-500">
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
                                    <div className="mr-11 py-3 px-4 bg-slate-50/50 dark:bg-white/5 rounded-xl border border-dashed border-slate-100 dark:border-white/10 text-center text-sm text-slate-300 dark:text-gray-500">
                                        لا توجد محاضرات
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
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
