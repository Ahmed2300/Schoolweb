
import { useEffect, useCallback, useState, useRef } from 'react';
import { useAuth } from '../presentation/hooks/useAuth';
import { getToken } from '../data/api/ApiClient';
import {
    initializeTeacherEcho,
    subscribeToTeacherChannel,
    unsubscribeFromTeacherChannel
} from '../services/websocket';
import { notificationService, NotificationItem } from '../data/api/NotificationService';
import toast from 'react-hot-toast';
import notificationSound from '../assets/sounds/notifications.mp3';

// Utility function to play notification sound
const playNotificationSound = () => {
    try {
        const audio = new Audio(notificationSound);
        audio.volume = 0.5; // 50% volume
        audio.play().catch(err => {
            console.warn('Could not play notification sound:', err);
        });
    } catch (err) {
        console.warn('Error creating audio for notification:', err);
    }
};

export function useTeacherNotifications() {
    const { user, isAuthenticated } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch initial data
    const fetchNotifications = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const [count, list] = await Promise.all([
                notificationService.getUnreadCount(),
                notificationService.getNotifications()
            ]);
            setUnreadCount(typeof count === 'number' ? count : (count as any)?.count ?? 0);

            // Handle potentially wrapped response
            const notificationsArray = Array.isArray(list) ? list : (list as any)?.data ?? [];
            setNotifications(Array.isArray(notificationsArray) ? notificationsArray : []);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    }, [isAuthenticated]);

    // Handle incoming WebSocket notification
    const handleNotification = useCallback((event: any) => {
        // Refresh notification counts
        fetchNotifications();

        // Handle quiz approval/rejection notifications
        const notificationType = event.type;

        if (notificationType === 'quiz_approved' || notificationType === 'quiz_rejected') {
            const isApproved = notificationType === 'quiz_approved';

            // Play notification sound
            playNotificationSound();

            // Show toast notification
            if (isApproved) {
                toast.success(event.title || 'تمت الموافقة على الاختبار', {
                    duration: 5000,
                    icon: '✅'
                });
            } else {
                toast.error(event.title || 'تم رفض الاختبار', {
                    duration: 5000,
                    icon: '❌'
                });
            }

            // Dispatch event for quiz list refresh
            window.dispatchEvent(new CustomEvent('quiz-status-change', {
                detail: {
                    quizId: event.data?.quiz_id,
                    status: isApproved ? 'approved' : 'rejected',
                    feedback: event.data?.admin_feedback
                }
            }));
            return;
        }

        // Handle slot decision events (approve/reject from admin)
        if (event.status === 'approved' || event.status === 'rejected') {
            const isSlotApproved = event.status === 'approved';

            // Play notification sound
            playNotificationSound();

            // Show toast notification
            if (isSlotApproved) {
                toast.success('تمت الموافقة على موعدك من قبل الإدارة ✅', {
                    duration: 5000,
                    icon: '📅'
                });
            } else {
                toast.error(`تم رفض موعدك: ${event.rejection_reason || 'بدون سبب محدد'}`, {
                    duration: 7000,
                    icon: '❌'
                });
            }

            // Dispatch event for schedule page to refresh
            window.dispatchEvent(new CustomEvent('slot-decision-change', {
                detail: {
                    slotId: event.slot_id,
                    status: event.status,
                    rejectionReason: event.rejection_reason,
                    dayOfWeek: event.day_of_week,
                    startTime: event.start_time,
                    endTime: event.end_time
                }
            }));
            return;
        }

        // Handle content approval notifications (existing flow)
        const approval = event.approval;
        if (approval) {
            // Play notification sound
            playNotificationSound();

            const status = approval.status;
            if (status === 'approved') {
                toast.success('تمت الموافقة على طلب التعديل الخاص بك', { duration: 5000, icon: '✅' });
            } else if (status === 'rejected') {
                toast.error('تم رفض طلب التعديل الخاص بك', { duration: 5000, icon: '❌' });
            }
            window.dispatchEvent(new CustomEvent('teacher-approval-update', { detail: approval }));
        }
    }, [fetchNotifications]);


    // Initial fetch
    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
        }
    }, [isAuthenticated, fetchNotifications]);

    // Initialize WebSocket
    useEffect(() => {
        const token = getToken();
        if (!user?.id || !isAuthenticated || !token) return;

        try {
            const echo = initializeTeacherEcho(token);
            if (!echo) return;


        } catch (err) {
            console.error('Failed to connect to Teacher WebSocket:', err);
        }

        return () => {
            if (user?.id) unsubscribeFromTeacherChannel(Number(user.id));
        };
    }, [user?.id, isAuthenticated, handleNotification]);

    const markAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setUnreadCount(prev => Math.max(0, prev - 1));
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
        } catch (error) {
            console.error(error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
        } catch (error) {
            console.error(error);
        }
    };

    return {
        unreadCount,
        notifications,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead
    };
}
