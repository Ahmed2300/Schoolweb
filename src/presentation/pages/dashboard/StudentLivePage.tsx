import { Video, Calendar, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { studentService } from '../../../data/api/studentService';
import { getLocalizedName } from '../../../data/api/studentService';
import { format, isSameDay, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Session {
    id: number;
    title: string;
    teacher: string;
    date: string;
    time: string;
    status: 'live' | 'upcoming';
    is_online: boolean;
}

export function StudentLivePage() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                const data = await studentService.getSchedules();

                const mappedSessions: Session[] = data.map(schedule => {
                    const lectureTitle = getLocalizedName(schedule.lecture?.title);
                    const teacherName = schedule.lecture?.teacher?.name || 'Unknown Teacher';
                    const scheduledDate = parseISO(schedule.scheduled_at);
                    const now = new Date();

                    // Simple logic for "live": if within last hour and next hour? 
                    // Or just use is_online checks. For now, let's assume if it's today and close to time.
                    // Actually, let's check if it's current time range if we had duration.
                    // For now, let's look at the mock logic: "live" if it's happening now.

                    // Lets calculate status based on time
                    const diffInMinutes = (now.getTime() - scheduledDate.getTime()) / 60000;
                    // If it started within last 90 mins (lecture duration approx) and hasn't ended presumably
                    const isLive = diffInMinutes >= 0 && diffInMinutes < 90;

                    return {
                        id: schedule.id,
                        title: lectureTitle,
                        teacher: teacherName,
                        date: isSameDay(scheduledDate, now) ? 'اليوم' : format(scheduledDate, 'yyyy-MM-dd', { locale: ar }),
                        time: format(scheduledDate, 'hh:mm a', { locale: ar }),
                        status: isLive ? 'live' : 'upcoming',
                        is_online: schedule.lecture?.is_online || false
                    };
                });

                // Sort: Live first, then by date ascending
                mappedSessions.sort((a, b) => {
                    if (a.status === 'live' && b.status !== 'live') return -1;
                    if (a.status !== 'live' && b.status === 'live') return 1;
                    return 0;
                });

                setSessions(mappedSessions);
            } catch (err) {
                console.error("Failed to fetch schedules", err);
                setError("فشل تحميل الجلسات");
            } finally {
                setLoading(false);
            }
        };

        fetchSchedules();
    }, []);

    if (loading) {
        return <div className="p-6 text-center">جاري التحميل...</div>;
    }

    if (error) {
        return <div className="p-6 text-center text-red-500">{error}</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-extrabold text-charcoal mb-6 flex items-center gap-2">
                <Video className="text-shibl-crimson" />
                الجلسات المباشرة
            </h1>

            {sessions.length === 0 ? (
                <div className="text-center text-gray-500 py-10">لا توجد جلسات مجدولة حالياً</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sessions.map(session => (
                        <div key={session.id} className="bg-white rounded-[24px] overflow-hidden border border-slate-100 shadow-sm flex flex-col">
                            <div className="h-32 bg-slate-900 relative flex items-center justify-center">
                                <div className={`absolute inset-0 opacity-50 ${session.status === 'live' ? 'bg-red-900' : 'bg-slate-800'}`}></div>
                                <Video className="text-white relative z-10" size={32} />
                                {session.status === 'live' && (
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

                                <button className={`w-full py-3 rounded-xl font-bold text-sm mt-auto transition-colors ${session.status === 'live'
                                    ? 'bg-shibl-crimson text-white hover:bg-red-800'
                                    : 'bg-slate-100 text-slate-500 cursor-not-allowed'
                                    }`}>
                                    {session.status === 'live' ? 'انضم الآن' : 'تذكيري'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
