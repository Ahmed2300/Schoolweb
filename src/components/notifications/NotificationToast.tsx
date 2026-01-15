import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { AdminNotification } from '@/types/notification';

/**
 * Notification Toast Component
 * Displays popup notifications at the top-right of the screen in real-time
 */
export function NotificationToast() {
    const [toasts, setToasts] = useState<AdminNotification[]>([]);

    // Listen for custom notification events from WebSocket hook
    useEffect(() => {
        const handleNotification = (event: CustomEvent<AdminNotification>) => {
            const notification = event.detail;
            setToasts((prev) => [notification, ...prev].slice(0, 5)); // Keep max 5 toasts

            // Auto-dismiss after 5 seconds
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== notification.id));
            }, 5000);
        };

        window.addEventListener('admin-notification', handleNotification as EventListener);
        return () => {
            window.removeEventListener('admin-notification', handleNotification as EventListener);
        };
    }, []);

    const dismissToast = (id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'new_subscription':
                return '🔔';
            case 'subscription_approved':
                return '✅';
            case 'subscription_rejected':
                return '❌';
            case 'new_payment':
                return '💰';
            default:
                return '📢';
        }
    };

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-[400px]">
            {toasts.map((toast, index) => (
                <div
                    key={toast.id}
                    className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-2xl border-l-4 border-indigo-500 animate-slide-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                    <span className="text-3xl">{getNotificationIcon(toast.type)}</span>
                    <div className="flex-1 min-w-0">
                        <div className="font-semibold text-base text-slate-800 mb-1">{toast.title}</div>
                        <div className="text-sm text-slate-600 leading-relaxed">{toast.message}</div>
                        {toast.data?.student_name && (
                            <div className="text-xs text-slate-400 mt-1">
                                الطالب: {toast.data.student_name}
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

export default NotificationToast;
