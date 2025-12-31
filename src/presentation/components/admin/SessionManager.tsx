import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Clock, RefreshCw, LogOut, AlertTriangle } from 'lucide-react';

interface SessionTimeoutModalProps {
    isOpen: boolean;
    onExtendSession: () => void;
    onLogout: () => void;
    timeRemaining: number; // seconds
    type: 'warning' | 'expired';
}

export function SessionTimeoutModal({
    isOpen,
    onExtendSession,
    onLogout,
    timeRemaining,
    type
}: SessionTimeoutModalProps) {
    // Prevent body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const isExpired = type === 'expired';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-md" />

            {/* Modal */}
            <div className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 fade-in duration-300">
                {/* Header */}
                <div className={`px-6 py-8 text-center ${isExpired ? 'bg-gradient-to-br from-red-500 to-red-700' : 'bg-gradient-to-br from-amber-500 to-orange-600'} text-white`}>
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isExpired ? 'bg-white/20' : 'bg-white/20'}`}>
                        {isExpired ? (
                            <AlertTriangle size={40} className="text-white" />
                        ) : (
                            <Clock size={40} className="text-white" />
                        )}
                    </div>
                    <h2 className="text-2xl font-extrabold mb-2">
                        {isExpired ? 'انتهت الجلسة' : 'تنبيه انتهاء الجلسة'}
                    </h2>
                    <p className="text-white/90 text-sm">
                        {isExpired
                            ? 'لقد انتهت صلاحية جلستك. يرجى تسجيل الدخول مرة أخرى للمتابعة.'
                            : 'سيتم إنهاء جلستك تلقائياً بسبب عدم النشاط.'
                        }
                    </p>
                </div>

                {/* Timer (only for warning) */}
                {!isExpired && (
                    <div className="text-center py-6 border-b border-slate-100">
                        <div className="text-5xl font-bold text-charcoal font-mono">
                            {formatTime(timeRemaining)}
                        </div>
                        <p className="text-slate-grey text-sm mt-2">
                            الوقت المتبقي قبل انتهاء الجلسة
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="p-6 space-y-3">
                    {!isExpired && (
                        <button
                            onClick={onExtendSession}
                            className="w-full h-14 rounded-pill bg-shibl-crimson hover:bg-shibl-crimson-dark text-white font-bold text-base shadow-crimson transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-3"
                        >
                            <RefreshCw size={20} />
                            <span>تمديد الجلسة</span>
                        </button>
                    )}
                    <button
                        onClick={onLogout}
                        className={`w-full h-14 rounded-pill font-semibold text-base transition-all flex items-center justify-center gap-3 ${isExpired
                            ? 'bg-shibl-crimson hover:bg-shibl-crimson-dark text-white shadow-crimson hover:-translate-y-0.5 duration-300'
                            : 'bg-slate-100 hover:bg-slate-200 text-charcoal'
                            }`}
                    >
                        <LogOut size={20} />
                        <span>{isExpired ? 'تسجيل الدخول مرة أخرى' : 'تسجيل الخروج الآن'}</span>
                    </button>
                </div>

                {/* Info */}
                {!isExpired && (
                    <div className="px-6 pb-6 text-center">
                        <p className="text-xs text-slate-grey">
                            يعتمد وقت الجلسة على نشاطك في التطبيق. حافظ على نشاطك لتجنب انتهاء الجلسة.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Session Manager Hook
interface UseSessionManagerOptions {
    warningTimeSeconds?: number; // Show warning X seconds before timeout
    timeoutSeconds?: number; // Total session timeout
    onSessionExpired?: () => void;
    enabled?: boolean;
}

export function useSessionManager({
    warningTimeSeconds = 60, // 1 minute warning
    timeoutSeconds = 1800, // 30 minutes default
    onSessionExpired,
    enabled = true,
}: UseSessionManagerOptions = {}) {
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<'warning' | 'expired'>('warning');
    const [timeRemaining, setTimeRemaining] = useState(warningTimeSeconds);

    const lastActivityRef = useRef(Date.now());
    const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Reset activity timestamp
    const resetActivity = useCallback(() => {
        lastActivityRef.current = Date.now();
        // If modal is showing warning, close it
        if (showModal && modalType === 'warning') {
            setShowModal(false);
            clearCountdown();
        }
    }, [showModal, modalType]);

    // Clear all timers
    const clearTimers = useCallback(() => {
        if (warningTimerRef.current) {
            clearTimeout(warningTimerRef.current);
            warningTimerRef.current = null;
        }
        clearCountdown();
    }, []);

    const clearCountdown = () => {
        if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
        }
    };

    // Start countdown when warning shows
    const startCountdown = useCallback(() => {
        setTimeRemaining(warningTimeSeconds);
        clearCountdown();

        countdownTimerRef.current = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    // Session expired
                    clearCountdown();
                    setModalType('expired');
                    onSessionExpired?.();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [warningTimeSeconds, onSessionExpired]);

    // Check for inactivity
    const checkActivity = useCallback(() => {
        if (!enabled) return;

        const now = Date.now();
        const inactiveTime = (now - lastActivityRef.current) / 1000;

        if (inactiveTime >= timeoutSeconds - warningTimeSeconds) {
            // Show warning
            setModalType('warning');
            setShowModal(true);
            startCountdown();
        }
    }, [enabled, timeoutSeconds, warningTimeSeconds, startCountdown]);

    // Setup activity listeners
    useEffect(() => {
        if (!enabled) return;

        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

        const handleActivity = () => {
            if (!showModal) {
                resetActivity();
            }
        };

        events.forEach(event => {
            document.addEventListener(event, handleActivity, { passive: true });
        });

        // Check activity every minute
        const intervalId = setInterval(checkActivity, 60000);

        return () => {
            events.forEach(event => {
                document.removeEventListener(event, handleActivity);
            });
            clearInterval(intervalId);
            clearTimers();
        };
    }, [enabled, resetActivity, checkActivity, clearTimers, showModal]);

    // Extend session
    const extendSession = useCallback(() => {
        resetActivity();
        setShowModal(false);
        clearTimers();
    }, [resetActivity, clearTimers]);

    // Force logout
    const logout = useCallback(() => {
        clearTimers();
        setShowModal(false);
        // Clear tokens and redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('admin_data');
        window.location.href = '/admin/login';
    }, [clearTimers]);

    // Show expired modal (can be called externally on 401)
    const showExpiredModal = useCallback(() => {
        setModalType('expired');
        setShowModal(true);
    }, []);

    return {
        showModal,
        modalType,
        timeRemaining,
        extendSession,
        logout,
        showExpiredModal,
        resetActivity,
    };
}

// Export a simple component that wraps both
interface SessionManagerProps {
    enabled?: boolean;
    timeoutMinutes?: number;
    warningSeconds?: number;
}

export function SessionManager({
    enabled = true,
    timeoutMinutes = 30,
    warningSeconds = 60
}: SessionManagerProps) {
    const {
        showModal,
        modalType,
        timeRemaining,
        extendSession,
        logout,
    } = useSessionManager({
        enabled,
        timeoutSeconds: timeoutMinutes * 60,
        warningTimeSeconds: warningSeconds,
    });

    return (
        <SessionTimeoutModal
            isOpen={showModal}
            type={modalType}
            timeRemaining={timeRemaining}
            onExtendSession={extendSession}
            onLogout={logout}
        />
    );
}
