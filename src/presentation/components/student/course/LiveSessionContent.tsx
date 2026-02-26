import { useState, useEffect, useMemo } from 'react';
import {
    Video,
    Radio,
    Clock,
    Play,
    CheckCircle2,
    Calendar,
    Loader2,
    AlertCircle,
    Wifi,
    WifiOff,
} from 'lucide-react';
import { Lecture } from '../../../../data/api/studentCourseService';
import { BBBEmbedModal } from './BBBEmbedModal';
import { useJoinLiveSession, LiveSessionErrorCode } from '../../../../hooks/useLiveSession';
import { parseLocalDate, formatSessionTime, getCountdownText } from '../../../../utils/dateUtils';
import { useNavigate } from 'react-router-dom';

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
    const navigate = useNavigate();

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

        // CRITICAL: If a recording exists or meeting is marked completed,
        // the session has definitively ended — regardless of scheduling times.
        // This prevents "upcoming" status when the teacher already recorded it.
        const hasRecording = lecture.has_recording || !!lecture.recording_url;
        const isMeetingCompleted = lecture.meeting_status === 'completed';
        if (hasRecording || isMeetingCompleted) return 'ended';

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

    // ─── Render based on state ───────────────────────────────────────────
    const renderContent = () => {
        switch (sessionState) {
            case 'error':
                return (
                    <div className="text-center relative z-10">
                        {/* Soft glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-48 sm:h-48 bg-red-200/30 rounded-full blur-3xl pointer-events-none" />

                        <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-5 shadow-sm border border-red-100/60">
                            <AlertCircle className="text-red-500 w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
                        </div>
                        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-800 mb-1.5">
                            {errorState.code === 'NOT_ENROLLED' ? 'غير مشترك في الدورة' : 'حدث خطأ'}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 mb-5 sm:mb-6 px-4 max-w-xs mx-auto leading-relaxed">
                            {errorState.code === 'NOT_ENROLLED'
                                ? 'يجب الاشتراك في الدورة أولاً للانضمام للجلسة المباشرة'
                                : errorState.message || 'يرجى المحاولة مرة أخرى'}
                        </p>
                        {errorState.code === 'NOT_ENROLLED' ? (
                            <button
                                onClick={() => window.location.href = '/student/courses'}
                                className="px-5 py-2.5 sm:px-6 sm:py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-all text-xs sm:text-sm shadow-md shadow-slate-900/10 hover:shadow-lg active:scale-[0.98]"
                            >
                                استعرض الدورات
                            </button>
                        ) : (
                            <button
                                onClick={handleJoinSession}
                                disabled={isJoining}
                                className="px-5 py-2.5 sm:px-6 sm:py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 text-xs sm:text-sm shadow-md shadow-red-600/10 hover:shadow-lg active:scale-[0.98]"
                            >
                                {isJoining ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'إعادة المحاولة'}
                            </button>
                        )}
                    </div>
                );

            case 'not_scheduled':
                return (
                    <div className="text-center relative z-10">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-48 sm:h-48 bg-slate-200/30 rounded-full blur-3xl pointer-events-none" />
                        <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-5 border border-slate-200/60">
                            <Calendar className="text-slate-400 w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
                        </div>
                        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-700 mb-1.5">جلسة مباشرة</h3>
                        <p className="text-xs sm:text-sm text-slate-400">لم يتم جدولة هذه الجلسة بعد</p>
                    </div>
                );

            case 'pending':
                return (
                    <div className="text-center relative z-10">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-48 sm:h-48 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
                        <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-5 border border-amber-200/60">
                            <Clock className="text-amber-500 w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 animate-[spin_6s_linear_infinite]" />
                        </div>
                        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-amber-700 mb-1.5">قيد الموافقة</h3>
                        <p className="text-xs sm:text-sm text-slate-500">الجلسة في انتظار موافقة الإدارة</p>
                    </div>
                );

            case 'upcoming':
                return (
                    <div className="text-center relative z-10">
                        {/* Soft ambient glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 sm:w-56 sm:h-56 bg-blue-200/25 rounded-full blur-3xl pointer-events-none" />

                        {/* Icon */}
                        <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-5 border border-blue-200/50 shadow-sm shadow-blue-100">
                            <Wifi className="text-blue-500 w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
                        </div>

                        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-800 mb-1">جلسة مباشرة قادمة</h3>
                        <p className="text-[11px] sm:text-xs text-slate-400 mb-4 sm:mb-5">سيتم تفعيل الجلسة عند حلول الموعد</p>

                        {/* Date info card */}
                        {startTime && (
                            <div className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-5 border border-slate-200/50 max-w-[260px] sm:max-w-sm mx-auto shadow-sm">
                                <p className="text-[10px] sm:text-xs text-slate-400 font-medium mb-1 tracking-wide">موعد البدء</p>
                                <p className="text-sm sm:text-base font-bold text-slate-800">{formatDateTime(startTime)}</p>
                            </div>
                        )}

                        {/* Countdown */}
                        {countdown && (
                            <div className="space-y-1.5">
                                <p className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-wide">تبدأ الجلسة خلال</p>
                                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 font-mono tracking-widest tabular-nums">
                                    {countdown}
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'starting_soon':
                return (
                    <div className="text-center relative z-10">
                        {/* Glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 sm:w-60 sm:h-60 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none animate-pulse" />

                        <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-5 border border-emerald-200/50 shadow-sm shadow-emerald-100 animate-pulse">
                            <Radio className="text-emerald-500 w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
                        </div>

                        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-emerald-700 mb-1">الجلسة تبدأ قريباً!</h3>
                        <p className="text-[11px] sm:text-xs text-slate-400 mb-3 sm:mb-4">المعلم في مرحلة التجهيز</p>

                        {/* Countdown */}
                        {countdown && (
                            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-600 font-mono tracking-widest mb-4 sm:mb-6 tabular-nums">
                                {countdown}
                            </div>
                        )}

                        <button
                            onClick={handleJoinSession}
                            disabled={isJoining}
                            className="group inline-flex items-center gap-2 sm:gap-2.5 px-5 py-2.5 sm:px-7 sm:py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 disabled:opacity-50 active:scale-[0.98]"
                        >
                            {isJoining ? (
                                <Loader2 className="animate-spin w-4 h-4 sm:w-5 sm:h-5" />
                            ) : (
                                <Play className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                            )}
                            انضم للجلسة
                        </button>
                    </div>
                );

            case 'live':
                return (
                    <div className="text-center relative z-10">
                        {/* Red ambient glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-64 sm:h-64 bg-red-300/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

                        {/* Live indicator */}
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-4 sm:mb-5">
                            {/* Outer pulse ring */}
                            <div className="absolute inset-0 bg-red-500/15 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                            <div className="absolute inset-1 bg-red-500/20 rounded-full animate-pulse" />
                            {/* Main circle */}
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
                                <Video className="text-white w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
                            </div>
                            {/* Badge */}
                            <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 px-2 py-0.5 bg-red-600 text-white text-[9px] sm:text-[10px] font-bold rounded-full shadow-sm flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                مباشر
                            </span>
                        </div>

                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 mb-1">الجلسة جارية الآن</h3>
                        <p className="text-xs sm:text-sm text-slate-400 mb-5 sm:mb-6">انضم الآن للمشاركة في الجلسة المباشرة</p>

                        <button
                            onClick={handleJoinSession}
                            disabled={isJoining}
                            className="group inline-flex items-center gap-2.5 sm:gap-3 px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base lg:text-lg transition-all shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 disabled:opacity-50 active:scale-[0.98]"
                        >
                            {isJoining ? (
                                <Loader2 className="animate-spin w-5 h-5 sm:w-6 sm:h-6" />
                            ) : (
                                <Play className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                            )}
                            انضم للجلسة
                        </button>
                    </div>
                );

            case 'ended':
                // Determine if recording is being processed
                const isRecordingProcessing = lecture.meeting_status === 'completed' && !lecture.recording_url;

                return (
                    <div className="text-center relative z-10">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-48 sm:h-48 bg-slate-200/20 rounded-full blur-3xl pointer-events-none" />

                        <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-5 border border-emerald-200/50">
                            <CheckCircle2 className="text-emerald-500 w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
                        </div>
                        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-800 mb-1.5">انتهت الجلسة</h3>

                        {lecture.recording_url ? (
                            <>
                                <p className="text-xs sm:text-sm text-slate-400 mb-4 sm:mb-5">يمكنك مشاهدة التسجيل</p>
                                <button
                                    onClick={() => {
                                        if (lecture.recording_url) {
                                            setEmbedUrl(lecture.recording_url);
                                            setIsModalOpen(true);
                                        }
                                    }}
                                    className="inline-flex items-center gap-2 sm:gap-2.5 px-5 py-2.5 sm:px-6 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm lg:text-base transition-all shadow-md shadow-blue-600/15 hover:shadow-lg active:scale-[0.98]"
                                >
                                    <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                                    شاهد التسجيل
                                </button>
                            </>
                        ) : isRecordingProcessing ? (
                            <>
                                <div className="flex items-center justify-center gap-2 text-amber-600 mb-3">
                                    <Loader2 size={16} className="animate-spin" />
                                    <p className="text-sm font-medium">جاري تجهيز التسجيل...</p>
                                </div>
                                <p className="text-slate-400 text-xs max-w-[220px] mx-auto">
                                    سيكون التسجيل متاحًا خلال دقائق
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="text-xs sm:text-sm text-slate-400 mb-5">لا يوجد وتسجيل متاح لهذه الجلسة</p>
                                {!isCompleted && onComplete && (
                                    <button
                                        onClick={onComplete}
                                        disabled={isCompleting}
                                        className="inline-flex items-center gap-2 sm:gap-2.5 px-5 py-2.5 sm:px-6 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm lg:text-base transition-all shadow-md shadow-emerald-600/15 disabled:opacity-60 disabled:cursor-wait active:scale-[0.98]"
                                    >
                                        {isCompleting ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            <CheckCircle2 size={18} />
                                        )}
                                        {isCompleting ? 'جاري التحديد...' : 'تحديد كمكتمل والمتابعة'}
                                    </button>
                                )}
                                {isCompleted && (
                                    lecture.quizzes && lecture.quizzes[0] && !lecture.quizzes[0].is_completed ? (
                                        <button
                                            onClick={() => navigate(`/dashboard/quizzes/${lecture.quizzes![0].id}`)}
                                            className="inline-flex items-center gap-2 sm:gap-2.5 px-5 py-2.5 sm:px-6 sm:py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm lg:text-base transition-all shadow-md shadow-purple-600/15 active:scale-[0.98]"
                                        >
                                            <CheckCircle2 size={18} /> ابدأ الاختبار
                                        </button>
                                    ) : (
                                        <div className="inline-flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl font-medium text-sm border border-emerald-100">
                                            <CheckCircle2 size={16} />
                                            <span>تم إكمال هذا الدرس</span>
                                        </div>
                                    )
                                )}
                            </>
                        )}
                    </div>
                );
        }
    };

    // ─── Wrapper gradients per state ──────────────────────────────────────
    const wrapperClass = useMemo(() => {
        const base = 'min-h-[260px] sm:min-h-[300px] lg:min-h-[380px] relative overflow-hidden flex flex-col items-center justify-center p-5 sm:p-8 lg:p-12';

        switch (sessionState) {
            case 'live':
                return `${base} bg-gradient-to-br from-rose-50 via-white to-red-50`;
            case 'starting_soon':
                return `${base} bg-gradient-to-br from-emerald-50 via-white to-teal-50`;
            case 'upcoming':
                return `${base} bg-gradient-to-br from-blue-50 via-white to-indigo-50`;
            case 'ended':
                return `${base} bg-gradient-to-br from-slate-50 via-white to-emerald-50/30`;
            case 'error':
                return `${base} bg-gradient-to-br from-red-50 via-white to-rose-50`;
            case 'pending':
                return `${base} bg-gradient-to-br from-amber-50 via-white to-orange-50/30`;
            default:
                return `${base} bg-gradient-to-br from-slate-50 via-white to-slate-100`;
        }
    }, [sessionState]);

    return (
        <>
            <div className={wrapperClass}>
                {/* Subtle grid pattern overlay */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.03]"
                    style={{
                        backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                    }}
                />
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
