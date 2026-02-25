import { Video, Calendar, User, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../../../data/api/studentService';
import { getLocalizedName } from '../../../data/api/studentService';
import { format, isSameDay, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';

/** Default session duration when backend doesn't provide one */
const DEFAULT_DURATION_MINUTES = 90;

interface Session {
    id: number;
    lectureId: number;
    title: string;
    teacher: string;
    date: string;
    time: string;
    status: 'live' | 'upcoming';
    isOnline: boolean;
}

export function StudentLivePage() {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [joiningId, setJoiningId] = useState<number | null>(null);
    const [joinError, setJoinError] = useState<string | null>(null);

    const fetchSchedules = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await studentService.getSchedules();

            const now = new Date();
            const mappedSessions: Session[] = data.map(schedule => {
                const lectureTitle = getLocalizedName(schedule.lecture?.title);
                const teacherName = schedule.lecture?.teacher?.name || 'غير محدد';
                const scheduledDate = parseISO(schedule.scheduled_at);

                const durationMinutes = schedule.lecture?.duration_minutes ?? DEFAULT_DURATION_MINUTES;
                const diffInMinutes = (now.getTime() - scheduledDate.getTime()) / 60000;
                const isLive = diffInMinutes >= 0 && diffInMinutes < durationMinutes;

                return {
                    id: schedule.id,
                    lectureId: schedule.lecture_id,
                    title: lectureTitle,
                    teacher: teacherName,
                    date: isSameDay(scheduledDate, now)
                        ? 'اليوم'
                        : format(scheduledDate, 'yyyy-MM-dd', { locale: ar }),
                    time: format(scheduledDate, 'hh:mm a', { locale: ar }),
                    status: isLive ? 'live' as const : 'upcoming' as const,
                    isOnline: schedule.lecture?.id != null,
                };
            });

            // Live sessions first
            mappedSessions.sort((a, b) => {
                if (a.status === 'live' && b.status !== 'live') return -1;
                if (a.status !== 'live' && b.status === 'live') return 1;
                return 0;
            });

            setSessions(mappedSessions);
        } catch {
            setError('فشل تحميل الجلسات. يرجى المحاولة مرة أخرى.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSchedules();
    }, [fetchSchedules]);

    /** Join a live BBB session */
    const handleJoinSession = async (session: Session) => {
        if (session.status !== 'live' || joiningId !== null) return;

        try {
            setJoiningId(session.lectureId);
            setJoinError(null);

            const res = await studentService.joinSession(session.lectureId);

            if (res.success) {
                navigate(`/classroom/${session.lectureId}`);
            } else {
                setJoinError(res.message || 'فشل في الانضمام للجلسة. حاول مرة أخرى.');
            }
        } catch {
            setJoinError('حدث خطأ أثناء الاتصال بالجلسة. تحقق من اتصالك بالإنترنت.');
        } finally {
            setJoiningId(null);
        }
    };

    // ---------- Loading skeleton ----------
    if (loading) {
        return (
            <div className="p-6">
                <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-[24px] overflow-hidden border border-slate-100 shadow-sm">
                            <div className="h-32 bg-slate-200 animate-pulse" />
                            <div className="p-5 space-y-3">
                                <div className="h-5 w-3/4 bg-slate-200 rounded animate-pulse" />
                                <div className="h-4 w-1/2 bg-slate-100 rounded animate-pulse" />
                                <div className="h-4 w-2/3 bg-slate-100 rounded animate-pulse" />
                                <div className="h-10 w-full bg-slate-200 rounded-xl animate-pulse mt-4" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ---------- Error state ----------
    if (error) {
        return (
            <div className="p-6 flex flex-col items-center justify-center py-20 text-center">
                <AlertCircle className="text-red-400 mb-3" size={40} />
                <p className="text-red-500 font-semibold mb-4">{error}</p>
                <button
                    onClick={fetchSchedules}
                    className="flex items-center gap-2 px-5 py-2.5 bg-shibl-crimson text-white rounded-xl font-bold text-sm hover:bg-red-800 transition-colors"
                    aria-label="إعادة المحاولة"
                >
                    <RefreshCw size={16} />
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-extrabold text-charcoal mb-6 flex items-center gap-2">
                <Video className="text-shibl-crimson" />
                الجلسات المباشرة
            </h1>

            {/* Join error toast */}
            {joinError && (
                <div
                    className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
                    role="alert"
                >
                    <AlertCircle size={18} className="shrink-0" />
                    <span className="flex-1">{joinError}</span>
                    <button
                        onClick={() => setJoinError(null)}
                        className="text-red-400 hover:text-red-600 ms-auto font-bold"
                        aria-label="إغلاق"
                    >
                        ✕
                    </button>
                </div>
            )}

            {sessions.length === 0 ? (
                <div className="text-center text-gray-500 py-10">لا توجد جلسات مجدولة حالياً</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sessions.map(session => {
                        const isJoining = joiningId === session.lectureId;
                        const isLive = session.status === 'live';

                        return (
                            <div key={session.id} className="bg-white rounded-[24px] overflow-hidden border border-slate-100 shadow-sm flex flex-col">
                                <div className="h-32 bg-slate-900 relative flex items-center justify-center">
                                    <div className={`absolute inset-0 opacity-50 ${isLive ? 'bg-red-900' : 'bg-slate-800'}`} />
                                    <Video className="text-white relative z-10" size={32} />
                                    {isLive && (
                                        <span className="absolute top-4 right-4 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded animate-pulse">
                                            مباشر الآن
                                        </span>
                                    )}
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="font-bold text-lg text-charcoal mb-2">{session.title}</h3>

                                    <div className="space-y-2 mb-6">
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <User size={16} />
                                            <span>{session.teacher}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <Calendar size={16} />
                                            <span>{session.date} • {session.time}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => isLive && handleJoinSession(session)}
                                        disabled={!isLive || isJoining}
                                        aria-label={isLive ? `انضم لجلسة ${session.title}` : `جلسة ${session.title} لم تبدأ بعد`}
                                        className={`w-full py-3 rounded-xl font-bold text-sm mt-auto transition-colors flex items-center justify-center gap-2 ${isLive
                                                ? 'bg-shibl-crimson text-white hover:bg-red-800 active:scale-[0.98]'
                                                : 'bg-slate-100 text-slate-500 cursor-not-allowed'
                                            } ${isJoining ? 'opacity-80 cursor-wait' : ''}`}
                                    >
                                        {isJoining ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                جاري الانضمام...
                                            </>
                                        ) : isLive ? (
                                            'انضم الآن'
                                        ) : (
                                            'لم تبدأ بعد'
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
