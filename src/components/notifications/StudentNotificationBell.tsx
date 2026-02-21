import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useAuthStore } from '@/presentation/store';
import { getToken } from '@/data/api/ApiClient';
import studentNotificationService from '@/services/studentNotificationService';
import { initializeStudentEcho, subscribeToStudentChannel, unsubscribeFromStudentChannel, disconnectStudentEcho } from '@/services/websocket';
import type { StudentNotification, WebSocketStudentNotificationEvent } from '@/types/studentNotification';

/**
 * Student Notification Bell Component
 * Displays a bell icon with unread badge and dropdown list of notifications
 */
export function StudentNotificationBell() {
    const { user, isAuthenticated } = useAuthStore();
    const [notifications, setNotifications] = useState<StudentNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Get student ID - for students, user.id IS the student ID
    const studentId = user?.id ? Number(user.id) : null;

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch notifications from API
    useEffect(() => {
        if (!studentId || !isAuthenticated) return;

        const fetchNotifications = async () => {
            try {
                setIsLoading(true);
                const response = await studentNotificationService.getNotifications(50);
                setNotifications(response.data);
                setUnreadCount(response.unread_count);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch notifications:', err);
                setError('فشل في جلب الإشعارات');
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotifications();
    }, [studentId, isAuthenticated]);

    // Subscribe to WebSocket for real-time notifications
    useEffect(() => {
        const token = getToken();
        if (!studentId || !isAuthenticated || !token) return;

        try {
            initializeStudentEcho(token);
            subscribeToStudentChannel(studentId, (event: unknown) => {
                const wsEvent = event as WebSocketStudentNotificationEvent;
                const newNotification: StudentNotification = {
                    id: wsEvent.id,
                    type: wsEvent.type,
                    title: wsEvent.title,
                    message: wsEvent.message,
                    data: wsEvent.data,
                    timestamp: wsEvent.timestamp,
                    is_read: false,
                    read_at: null,
                    created_at: wsEvent.timestamp,
                };

                setNotifications((prev) => [newNotification, ...prev]);
                setUnreadCount((prev) => prev + 1);

                // Dispatch custom event for toast notification
                window.dispatchEvent(
                    new CustomEvent('student-notification', { detail: newNotification })
                );
            });
            console.log('WebSocket connected for student:', studentId);
        } catch (err) {
            console.error('Failed to connect to WebSocket:', err);
        }

        return () => {
            if (studentId) {
                unsubscribeFromStudentChannel(studentId);
            }
        };
    }, [studentId, isAuthenticated]);

    const markAsRead = async (id: number) => {
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
    };

    const markAllAsRead = async () => {
        try {
            await studentNotificationService.markAllAsRead();
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
            );
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all notifications as read:', err);
        }
    };

    const handleNotificationClick = async (notification: StudentNotification) => {
        if (!notification.is_read) {
            await markAsRead(notification.id);
        }
        // Navigate based on notification content
        if (notification.data?.course_id) {
            window.location.href = `/dashboard/courses/${notification.data.course_id}`;
        } else if (notification.data?.subscription_id) {
            window.location.href = `/dashboard/courses`;
        } else {
            window.location.href = `/dashboard`;
        }
        setIsOpen(false);
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'subscription_approved':
                return '✅';
            case 'subscription_rejected':
                return '❌';
            case 'payment_approved':
                return '💰';
            case 'payment_rejected':
                return '💳';
            default:
                return '📢';
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'subscription_approved':
            case 'payment_approved':
                return 'bg-emerald-50';
            case 'subscription_rejected':
            case 'payment_rejected':
                return 'bg-red-50';
            default:
                return 'bg-amber-50';
        }
    };

    return (
        <div className="notification-bell-container" ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
            <button
                className="relative w-11 h-11 rounded-[12px] bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors"
                onClick={() => setIsOpen(!isOpen)}
                title={`${unreadCount} إشعارات غير مقروءة`}
            >
                <Bell size={20} className="text-slate-600" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="fixed top-[4.5rem] left-4 right-4 sm:absolute sm:top-full sm:mt-2 sm:left-auto sm:right-0 rtl:sm:right-auto rtl:sm:left-0 sm:w-[360px] max-h-[80vh] sm:max-h-[480px] bg-white rounded-xl shadow-2xl z-50 overflow-hidden border border-slate-100 flex flex-col">
                    <div className="flex justify-between items-center p-4 border-b border-slate-100">
                        <h3 className="text-base font-semibold text-slate-800">الإشعارات</h3>
                        {unreadCount > 0 && (
                            <button
                                className="flex items-center gap-1 text-indigo-600 text-sm hover:underline"
                                onClick={markAllAsRead}
                                title="تحديد الكل كمقروء"
                            >
                                <CheckCheck size={16} />
                                تحديد الكل كمقروء
                            </button>
                        )}
                    </div>

                    <div className="max-h-[360px] overflow-y-auto">
                        {error ? (
                            <div className="py-10 text-center text-red-400">{error}</div>
                        ) : isLoading ? (
                            <div className="py-10 text-center text-slate-400">جاري التحميل...</div>
                        ) : notifications.length === 0 ? (
                            <div className="py-10 text-center text-slate-400">لا توجد إشعارات</div>
                        ) : (
                            notifications.slice(0, 10).map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-slate-50 border-b border-slate-50 ${!notification.is_read ? getNotificationColor(notification.type) : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-sm text-slate-800">{notification.title}</div>
                                        <div className="text-sm text-slate-500 line-clamp-2">{notification.message}</div>
                                        <div className="text-xs text-slate-400 mt-1">
                                            {formatDistanceToNow(new Date(notification.created_at), {
                                                addSuffix: true,
                                                locale: ar,
                                            })}
                                        </div>
                                    </div>
                                    {!notification.is_read && (
                                        <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-2" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default StudentNotificationBell;
