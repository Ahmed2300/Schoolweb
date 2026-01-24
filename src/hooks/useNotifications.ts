import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/presentation/store';
import { getToken } from '@/data/api/ApiClient';
import { initializeEcho, subscribeToAdminChannel, unsubscribeFromAdminChannel, disconnectEcho } from '@/services/websocket';
import notificationService from '@/services/notificationService';
import type { AdminNotification, WebSocketNotificationEvent } from '@/types/notification';

// Notification sound
const NOTIFICATION_SOUND_URL = '/sounds/notification.mp3';

interface UseNotificationsReturn {
    notifications: AdminNotification[];
    unreadCount: number;
    isConnected: boolean;
    isLoading: boolean;
    error: string | null;
    markAsRead: (id: number | string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    refetch: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
    const { user, isAuthenticated } = useAuthStore();
    const [notifications, setNotifications] = useState<AdminNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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
    const playNotificationSound = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(console.error);
        }
    }, []);

    // Fetch notifications from API
    const fetchNotifications = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await notificationService.getNotifications(50);
            setNotifications(response.data);
            setUnreadCount(response.unread_count);
            setError(null);
        } catch (err) {
            setError('فشل في جلب الإشعارات');
            console.error('Failed to fetch notifications:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Handle incoming WebSocket notification
    const handleNotification = useCallback((event: WebSocketNotificationEvent) => {
        const newNotification: AdminNotification = {
            id: event.id,
            type: event.type,
            title: event.title,
            message: event.message,
            data: event.data,
            timestamp: event.timestamp,
            is_read: false,
            read_at: null,
            created_at: event.timestamp,
        };

        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);
        playNotificationSound();

        // Dispatch custom event so other components can react (e.g., refetch data, toast)
        window.dispatchEvent(
            new CustomEvent('admin-notification', { detail: newNotification })
        );
    }, [playNotificationSound]);

    // Initialize WebSocket connection and subscribe to channel
    useEffect(() => {
        const token = getToken();
        if (!user?.id || !isAuthenticated || !token) {
            setIsConnected(false);
            return;
        }

        try {
            const echo = initializeEcho(token);
            // If WebSocket is disabled, echo will be null - skip subscription silently
            if (!echo) {
                setIsConnected(false);
                return;
            }

            // Cast to any to bypass strict number check if user.id is string|number
            subscribeToAdminChannel(user.id as any, handleNotification as (event: unknown) => void);
            setIsConnected(true);
            console.log('WebSocket connected for admin:', user.id);
        } catch (err) {
            console.error('Failed to connect to WebSocket:', err);
            setIsConnected(false);
        }

        return () => {
            if (user?.id) {
                unsubscribeFromAdminChannel(user.id as any);
            }
            disconnectEcho();
            setIsConnected(false);
        };
    }, [user?.id, isAuthenticated, handleNotification]);

    // Fetch initial notifications
    useEffect(() => {
        if (user?.id && isAuthenticated) {
            fetchNotifications();
        }
    }, [user?.id, isAuthenticated, fetchNotifications]);

    // Mark single notification as read
    const markAsRead = useCallback(async (id: number | string) => {
        const numericId = Number(id);
        try {
            await notificationService.markAsRead(numericId);
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === numericId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
                )
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    }, []);

    // Mark all notifications as read
    const markAllAsRead = useCallback(async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
            );
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all notifications as read:', err);
        }
    }, []);

    return {
        notifications,
        unreadCount,
        isConnected,
        isLoading,
        error,
        markAsRead,
        markAllAsRead,
        refetch: fetchNotifications,
    };
}

export default useNotifications;
