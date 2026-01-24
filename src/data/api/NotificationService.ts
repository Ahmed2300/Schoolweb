
import apiClient from './ApiClient';
import { endpoints } from './endpoints';

export interface NotificationItem {
    id: string;
    type: string;
    notifiable_id: number;
    notifiable_type: string;
    data: {
        approval?: {
            status: string;
            approvable_type: string;
            [key: string]: any;
        };
        message?: string;
        [key: string]: any;
    };
    read_at: string | null;
    created_at: string;
    updated_at: string;
}

export const notificationService = {
    /**
     * Get all notifications for the current user
     */
    getNotifications: async () => {
        const response = await apiClient.get<NotificationItem[]>(endpoints.notifications.list);
        return response.data;
    },

    /**
     * Get unread notifications count
     */
    getUnreadCount: async () => {
        const response = await apiClient.get<number>(endpoints.notifications.unreadCount);
        return response.data;
    },

    /**
     * Mark a specific notification as read
     */
    markAsRead: async (id: string) => {
        await apiClient.post(endpoints.notifications.markAsRead, { id });
    },

    /**
     * Mark all notifications as read
     */
    markAllAsRead: async () => {
        await apiClient.post(endpoints.notifications.markAllAsRead);
    },

    /**
     * Delete a notification
     */
    delete: async (id: string) => {
        await apiClient.delete(endpoints.notifications.delete(id));
    }
};
