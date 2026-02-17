import { useState, useEffect, useMemo } from 'react';
import {
    Video,
    Radio,
    Clock,
    Play,
    CheckCircle2,
    Calendar,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { Lecture } from '../../../../data/api/studentCourseService';
import { BBBEmbedModal } from './BBBEmbedModal';
import { useJoinLiveSession, LiveSessionErrorCode } from '../../../../hooks/useLiveSession';
import { parseLocalDate, formatSessionTime, getCountdownText } from '../../../../utils/dateUtils';

interface LiveSessionContentProps {
    lecture: Lecture;
    onJoin?: () => void;
    onSessionEnd?: () => void;
    onComplete?: () => void;
    isCompleting?: boolean;
    isCompleted?: boolean;
}

type SessionState = 'not_scheduled' | 'pending' | 'upcoming' | 'starting_soon' | 'live' | 'ended' | 'error';

export function LiveSessionContent({ lecture, onJoin, onSessionEnd, onComplete, isCompleting = false, isCompleted = false }: LiveSessionContentProps) {
    const [embedUrl, setEmbedUrl] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [errorState, setErrorState] = useState<{ code: LiveSessionErrorCode | null; message: string | null }>({ code: null, message: null });
    const [countdown, setCountdown] = useState<string>('');

    // Use the new hook with graceful error handling
    const { mutate: joinSession, isPending: isJoining, data: joinData, error: joinError } = useJoinLiveSession();

    // Parse time slot if available (using timezone-aware parsing)
    const timeSlot = lecture.time_slot;
    const startTime = parseLocalDate(timeSlot?.start_time);
    const endTime = parseLocalDate(timeSlot?.end_time);

    // Handle join response - open modal with embed URL
    useEffect(() => {
        if (joinData?.success && joinData.join_url) {
            setEmbedUrl(joinData.join_url);
            setIsModalOpen(true);
            setErrorState({ code: null, message: null });
            onJoin?.();
        }
    }, [joinData, onJoin]);

    // Handle join error - update error state
    useEffect(() => {
        if (joinError) {
            const err = joinError as any;
            const errorCode = err?.response?.data?.error_code as LiveSessionErrorCode | undefined;
            const message = err?.response?.data?.message || 'حدث خطأ أثناء الانضمام للجلسة';
            setErrorState({ code: errorCode ?? null, message });
        }
    }, [joinError]);

    // Determine session state
    const sessionState = useMemo((): SessionState => {
        // Check for specific error states that should change the UI
        if (errorState.code === 'NOT_ENROLLED') return 'error';
        if (errorState.code === 'SESSION_ENDED') return 'ended';
        if (errorState.code === 'MEETING_NOT_RUNNING') return 'upcoming';

        if (!timeSlot) return 'live'; // No schedule = assume available to join

        if (timeSlot.status === 'pending') return 'pending';
        if (timeSlot.status === 'completed') return 'ended';
        if (timeSlot.status === 'rejected') return 'not_scheduled';

        // Check if BBB meeting is running
        if (lecture.bbb_meeting_running) return 'live';

        // Check meeting_status for 'ready' state (meeting prepared but teacher not joined)
        if (lecture.meeting_status === 'ready') return 'starting_soon'; // Show "starting soon" UI

        if (!startTime) return 'not_scheduled';

        const now = new Date();
        const diffMs = startTime.getTime() - now.getTime();
        const fifteenMinutes = 15 * 60 * 1000;

        if (diffMs <= 0) {
            // Past start time - either live or ended
            if (endTime && now > endTime) return 'ended';
            return 'live'; // Assume live if past start and before end
        }

        if (diffMs <= fifteenMinutes) return 'starting_soon';
        return 'upcoming';
    }, [timeSlot, startTime, endTime, lecture.bbb_meeting_running, lecture, errorState]);

    // Countdown timer
    useEffect(() => {
        if (!startTime || sessionState === 'live' || sessionState === 'ended') {
            setCountdown('');
            return;
        }

        const updateCountdown = () => {
            const now = new Date();
            const diff = startTime.getTime() - now.getTime();

            if (diff <= 0) {
                setCountdown('');
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (hours > 24) {
                const days = Math.floor(hours / 24);
                setCountdown(`${days} يوم و ${hours % 24} ساعة`);
            } else if (hours > 0) {
                setCountdown(`${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
            } else {
                setCountdown(`${minutes}:${String(seconds).padStart(2, '0')}`);
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [startTime, sessionState]);

    // Join session handler using the hook
    const handleJoinSession = () => {
        setErrorState({ code: null, message: null }); // Clear previous errors
        joinSession(lecture.id);
    };


    // Format date/time using timezone-aware utility
    const formatDateTime = (date: Date) => formatSessionTime(date, 'ar');

    // Render based on state
    const renderContent = () => {
        switch (sessionState) {
            case 'error':
                return (
                    <div className="text-center">
                        <div className="w-24 h-24 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <AlertCircle size={48} className="text-red-400" />
                        </div>
                        <h3 className="text-2xl font-black text-red-600 mb-2">
                            {errorState.code === 'NOT_ENROLLED' ? 'غير مشترك في الدورة' : 'حدث خطأ'}
                        </h3>
                        <p className="text-slate-500 font-medium mb-6">
                            {errorState.code === 'NOT_ENROLLED'
                                ? 'يجب الاشتراك في الدورة أولاً للانضمام للجلسة المباشرة'
                                : errorState.message || 'يرجى المحاولة مرة أخرى'}
                        </p>
                        {errorState.code === 'NOT_ENROLLED' && (
                            <button
                                onClick={() => window.location.href = '/student/courses'}
                                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all"
                            >
                                استعرض الدورات
                            </button>
                        )}
                        {errorState.code !== 'NOT_ENROLLED' && (
                            <button
                                onClick={handleJoinSession}
                                disabled={isJoining}
                                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all disabled:opacity-50"
                            >
                                {isJoining ? <Loader2 size={20} className="animate-spin mx-auto" /> : 'إعادة المحاولة'}
                            </button>
                        )}
                    </div>
                );

            case 'not_scheduled':
                return (
                    <div className="text-center">
                        <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Calendar size={48} className="text-slate-300" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-700 mb-2">جلسة مباشرة</h3>
                        <p className="text-slate-400 font-medium">لم يتم جدولة هذه الجلسة بعد</p>
                    </div>
                );

            case 'pending':

                return (
                    <div className="text-center">
                        <div className="w-24 h-24 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Clock size={48} className="text-amber-500" />
                        </div>
                        <h3 className="text-2xl font-black text-amber-600 mb-2">قيد الموافقة</h3>
                        <p className="text-slate-500 font-medium">الجلسة في انتظار موافقة الإدارة</p>
                    </div>
                );

            case 'upcoming':
                return (
                    <div className="text-center">
                        <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6 relative">
                            <Radio size={48} className="text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-3">جلسة مباشرة قادمة</h3>

                        {startTime && (
                            <div className="bg-white/80 backdrop-blur rounded-2xl p-4 mb-6 border border-slate-100 max-w-sm mx-auto">
                                <p className="text-sm text-slate-500 font-bold mb-1">موعد البدء</p>
                                <p className="text-lg font-black text-slate-800">{formatDateTime(startTime)}</p>
                            </div>
                        )}

                        {countdown && (
                            <div className="space-y-2">
                                <p className="text-sm text-slate-400 font-medium">تبدأ الجلسة خلال</p>
                                <div className="text-4xl font-black text-blue-600 font-mono tracking-wider">
                                    {countdown}
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'starting_soon':
                return (
                    <div className="text-center">
                        <div className="w-24 h-24 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                            <Radio size={48} className="text-emerald-500" />
                        </div>
                        <h3 className="text-2xl font-black text-emerald-600 mb-3">الجلسة تبدأ قريباً!</h3>

                        {countdown && (
                            <div className="text-5xl font-black text-emerald-600 font-mono tracking-wider mb-6">
                                {countdown}
                            </div>
                        )}

                        <button
                            onClick={handleJoinSession}
                            disabled={isJoining}
                            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-lg transition-all shadow-lg shadow-emerald-200 flex items-center gap-3 mx-auto disabled:opacity-50"
                        >
                            {isJoining ? (
                                <Loader2 size={24} className="animate-spin" />
                            ) : (
                                <Play size={24} />
                            )}
                            انضم للجلسة
                        </button>
                    </div>
                );

            case 'live':
                return (
                    <div className="text-center">
                        <div className="relative w-28 h-28 mx-auto mb-6">
                            {/* Pulsing rings */}
                            <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />
                            <div className="absolute inset-2 bg-red-500/30 rounded-full animate-pulse" />
                            <div className="absolute inset-0 w-28 h-28 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-xl shadow-red-200">
                                <Video size={48} className="text-white" />
                            </div>
                            {/* Live badge */}
                            <span className="absolute -top-2 -right-2 px-3 py-1 bg-red-600 text-white text-xs font-black rounded-full animate-pulse">
                                🔴 مباشر
                            </span>
                        </div>

                        <h3 className="text-3xl font-black text-red-600 mb-2">الجلسة جارية الآن!</h3>
                        <p className="text-slate-500 font-medium mb-8">انضم الآن للمشاركة في الجلسة المباشرة</p>

                        <button
                            onClick={handleJoinSession}
                            disabled={isJoining}
                            className="group px-10 py-5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-2xl font-black text-xl transition-all shadow-xl shadow-red-200 hover:shadow-red-300 flex items-center gap-4 mx-auto disabled:opacity-50 transform hover:scale-105 active:scale-95"
                        >
                            {isJoining ? (
                                <Loader2 size={28} className="animate-spin" />
                            ) : (
                                <Play size={28} className="group-hover:scale-110 transition-transform" />
                            )}
                            انضم للجلسة المباشرة
                        </button>
                    </div>
                );

            case 'ended':
                // Determine if recording is being processed
                const isRecordingProcessing = lecture.meeting_status === 'completed' && !lecture.recording_url;

                return (
                    <div className="text-center">
                        <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={48} className="text-emerald-500" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2">انتهت الجلسة</h3>

                        {lecture.recording_url ? (
                            <>
                                <p className="text-slate-500 font-medium mb-6">يمكنك مشاهدة التسجيل</p>
                                <button
                                    onClick={() => {
                                        if (lecture.recording_url) {
                                            setEmbedUrl(lecture.recording_url);
                                            setIsModalOpen(true);
                                        }
                                    }}
                                    className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg transition-all shadow-lg shadow-blue-200"
                                >
                                    <Video size={24} />
                                    شاهد التسجيل
                                </button>
                            </>
                        ) : isRecordingProcessing ? (
                            <>
                                <div className="flex items-center justify-center gap-2 text-amber-600 mb-4">
                                    <Loader2 size={20} className="animate-spin" />
                                    <p className="font-medium">جاري تجهيز التسجيل...</p>
                                </div>
                                <p className="text-slate-400 text-sm">
                                    سيكون التسجيل متاحًا خلال دقائق، يرجى المحاولة لاحقًا
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="text-slate-400 font-medium mb-6">لا يوجد تسجيل متاح لهذه الجلسة</p>
                                {!isCompleted && onComplete && (
                                    <button
                                        onClick={onComplete}
                                        disabled={isCompleting}
                                        className={`inline-flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-lg transition-all shadow-lg shadow-emerald-200 disabled:opacity-60 disabled:cursor-wait`}
                                    >
                                        {isCompleting ? (
                                            <Loader2 size={22} className="animate-spin" />
                                        ) : (
                                            <CheckCircle2 size={22} />
                                        )}
                                        {isCompleting ? 'جاري التحديد...' : 'تحديد كمكتمل والمتابعة'}
                                    </button>
                                )}
                                {isCompleted && (
                                    <div className="flex items-center gap-2 text-emerald-600 font-bold mt-2">
                                        <CheckCircle2 size={20} />
                                        <span>تم إكمال هذا الدرس</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                );
        }
    };

    return (
        <>
            <div className="aspect-video bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-10 rounded-[2rem]">
                {renderContent()}
            </div>

            <BBBEmbedModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                embedUrl={embedUrl}
                lectureId={lecture.id}
                onSessionEnded={() => {
                    setIsModalOpen(false);
                    setErrorState({ code: 'SESSION_ENDED' as const, message: 'انتهت الجلسة المباشرة' });
                    onSessionEnd?.();
                }}
            />
        </>
    );
}
