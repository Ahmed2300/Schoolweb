import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/presentation/store';
import { getToken } from '@/data/api/ApiClient';
import { initializeEcho, subscribeToStudentChannel, unsubscribeFromStudentChannel, disconnectEcho } from '@/services/websocket';
import studentNotificationService from '@/services/studentNotificationService';
import type { StudentNotification, WebSocketStudentNotificationEvent } from '@/types/studentNotification';

// Notification sound
const NOTIFICATION_SOUND_URL = '/sounds/notification.mp3';

interface UseStudentNotificationsReturn {
    notifications: StudentNotification[];
    unreadCount: number;
    isConnected: boolean;
    isLoading: boolean;
    error: string | null;
    markAsRead: (id: number) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    refetch: () => Promise<void>;
}

export function useStudentNotifications(): UseStudentNotificationsReturn {
    const { user, isAuthenticated } = useAuthStore();
    const [notifications, setNotifications] = useState<StudentNotification[]>([]);
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
            const response = await studentNotificationService.getNotifications(50);
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
    const handleNotification = useCallback((event: WebSocketStudentNotificationEvent) => {
        const newNotification: StudentNotification = {
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

        // Dispatch custom event for toast notification
        window.dispatchEvent(
            new CustomEvent('student-notification', { detail: newNotification })
        );
    }, [playNotificationSound]);

    // Initialize WebSocket connection and subscribe to channel
    useEffect(() => {
        const token = getToken();
        // For students, user.id IS the student ID (they authenticate as Student model directly)
        const studentId = user?.id ? Number(user.id) : null;

        if (!studentId || !isAuthenticated || !token) {
            setIsConnected(false);
            return;
        }

        try {
            initializeEcho(token);
            subscribeToStudentChannel(studentId, handleNotification as (event: unknown) => void);
            setIsConnected(true);

        } catch (err) {
            console.error('Failed to connect to WebSocket:', err);
            setIsConnected(false);
        }

        return () => {
            if (studentId) {
                unsubscribeFromStudentChannel(studentId);
            }
            disconnectEcho();
            setIsConnected(false);
        };
    }, [user?.id, isAuthenticated, handleNotification]);

    // Fetch initial notifications
    useEffect(() => {
        const studentId = user?.id ? Number(user.id) : null;
        if (studentId && isAuthenticated) {
            fetchNotifications();
        }
    }, [user?.id, isAuthenticated, fetchNotifications]);

    // Mark single notification as read
    const markAsRead = useCallback(async (id: number) => {
        try {
            await studentNotificationService.markAsRead(id);
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
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
            await studentNotificationService.markAllAsRead();
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

export default useStudentNotifications;
