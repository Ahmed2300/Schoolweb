import apiClient from '@/data/api/ApiClient';
import type { NotificationResponse, UnreadCountResponse } from '@/types/notification';

const ENDPOINTS = {
    notifications: '/api/v1/admin/notifications',
    unreadCount: '/api/v1/admin/notifications/unread',
    markAsRead: (id: number) => `/api/v1/admin/notifications/${id}/read`,
    markAllAsRead: '/api/v1/admin/notifications/read-all',
};

/**
 * Notification API Service
 */
export const notificationService = {
    /**
     * Get notifications for the authenticated admin
     */
    async getNotifications(limit: number = 20): Promise<NotificationResponse> {
        const response = await apiClient.get<NotificationResponse>(ENDPOINTS.notifications, {
            params: { limit },
        });
        return response.data;
    },

    /**
     * Get unread notification count
     */
    async getUnreadCount(): Promise<number> {
        const response = await apiClient.get<UnreadCountResponse>(ENDPOINTS.unreadCount);
        return response.data.unread_count;
    },

    /**
     * Mark a notification as read
     */
    async markAsRead(notificationId: number): Promise<void> {
        await apiClient.post(ENDPOINTS.markAsRead(notificationId));
    },

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(): Promise<number> {
        const response = await apiClient.post<{ success: boolean; marked_count: number }>(
            ENDPOINTS.markAllAsRead
        );
        return response.data.marked_count;
    },
};

export default notificationService;
