
import { useEffect, useCallback, useState } from 'react';
import { useAuth } from '../presentation/hooks/useAuth';
import { getToken } from '../data/api/ApiClient';
import {
    initializeTeacherEcho,
    subscribeToTeacherChannel,
    unsubscribeFromTeacherChannel
} from '../services/websocket';
import { notificationService, NotificationItem } from '../data/api/NotificationService';
import toast from 'react-hot-toast';

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
            setUnreadCount(count);
            setNotifications(list);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    }, [isAuthenticated]);

    // Handle incoming WebSocket notification
    const handleNotification = useCallback((event: any) => {
        console.log('Teacher Notification Received:', event);

        // Refresh counts
        // setUnreadCount(prev => prev + 1); // Optimistic update or fetch? 
        // Better to fetch to ensure consistency or append if we know the structure
        fetchNotifications();

        const approval = event.approval;
        if (approval) {
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

            subscribeToTeacherChannel(Number(user.id), handleNotification);
            console.log('WebSocket connected for teacher:', user.id);
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
