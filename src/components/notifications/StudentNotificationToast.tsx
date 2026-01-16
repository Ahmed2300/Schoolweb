import React, { useEffect, useState, useRef } from 'react';
import { X, CheckCircle, XCircle, Bell } from 'lucide-react';
import type { StudentNotification } from '@/types/studentNotification';

// Notification sound
const NOTIFICATION_SOUND_URL = '/sounds/notification.mp3';

/**
 * Student Notification Toast Component
 * Displays popup notifications at the top-right of the screen in real-time
 */
export function StudentNotificationToast() {
    const [toasts, setToasts] = useState<StudentNotification[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio element
    useEffect(() => {
        audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
        audioRef.current.volume = 0.5;
        return () => {
            audioRef.current = null;
        };
    }, []);

    // Play notification sound
    const playNotificationSound = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(console.error);
        }
    };

    // Listen for custom notification events from WebSocket
    useEffect(() => {
        const handleNotification = (event: CustomEvent<StudentNotification>) => {
            const notification = event.detail;
            setToasts((prev) => [notification, ...prev].slice(0, 5)); // Keep max 5 toasts
            playNotificationSound();

            // Auto-dismiss after 6 seconds
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== notification.id));
            }, 6000);
        };

        window.addEventListener('student-notification', handleNotification as EventListener);
        return () => {
            window.removeEventListener('student-notification', handleNotification as EventListener);
        };
    }, []);

    const dismissToast = (id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'subscription_approved':
                return <CheckCircle className="text-emerald-500" size={28} />;
            case 'subscription_rejected':
                return <XCircle className="text-red-500" size={28} />;
            default:
                return <Bell className="text-shibl-crimson" size={28} />;
        }
    };

    const getBorderColor = (type: string) => {
        switch (type) {
            case 'subscription_approved':
                return 'border-l-emerald-500';
            case 'subscription_rejected':
                return 'border-l-red-500';
            default:
                return 'border-l-shibl-crimson';
        }
    };

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-[400px]">
            {toasts.map((toast, index) => (
                <div
                    key={toast.id}
                    className={`flex items-start gap-3 p-4 bg-white rounded-xl shadow-2xl border-l-4 ${getBorderColor(toast.type)} animate-slide-in`}
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                    <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(toast.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-bold text-base text-slate-800 mb-1">{toast.title}</div>
                        <div className="text-sm text-slate-600 leading-relaxed">{toast.message}</div>
                        {toast.data?.course_name && (
                            <div className="text-xs text-slate-400 mt-1">
                                الدورة: {toast.data.course_name}
                            </div>
                        )}
                    </div>
                    <button
                        className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        onClick={() => dismissToast(toast.id)}
                    >
                        <X size={16} />
                    </button>
                </div>
            ))}

            <style>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
        [dir="rtl"] .fixed.right-5 {
          right: auto;
          left: 20px;
        }
        [dir="rtl"] @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
        </div>
    );
}

export default StudentNotificationToast;
