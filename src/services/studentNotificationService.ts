import apiClient from '@/data/api/ApiClient';
import type { StudentNotificationResponse, StudentUnreadCountResponse } from '@/types/studentNotification';

const ENDPOINTS = {
    notifications: '/api/v1/students/notifications',
    unreadCount: '/api/v1/students/notifications/unread',
    markAsRead: (id: number) => `/api/v1/students/notifications/${id}/read`,
    markAllAsRead: '/api/v1/students/notifications/read-all',
};

/**
 * Student Notification API Service
 */
export const studentNotificationService = {
    /**
     * Get notifications for the authenticated student
     */
    async getNotifications(limit: number = 20): Promise<StudentNotificationResponse> {
        const response = await apiClient.get<StudentNotificationResponse>(ENDPOINTS.notifications, {
            params: { limit },
        });
        return response.data;
    },

    /**
     * Get unread notification count
     */
    async getUnreadCount(): Promise<number> {
        const response = await apiClient.get<StudentUnreadCountResponse>(ENDPOINTS.unreadCount);
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

export default studentNotificationService;
