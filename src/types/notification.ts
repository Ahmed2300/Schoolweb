/**
 * Admin Notification Types
 */
export interface AdminNotification {
    id: number;
    type: NotificationType;
    title: string;
    message: string;
    data: NotificationData | null;
    timestamp: string;
    is_read: boolean;
    read_at: string | null;
    created_at: string;
}

export type NotificationType =
    | 'new_subscription'
    | 'subscription_approved'
    | 'subscription_rejected'
    | 'new_payment';

export interface NotificationData {
    subscription_id?: number;
    student_id?: number;
    student_name?: string;
    course_id?: number;
    course_name?: string;
    amount?: number;
}

export interface NotificationResponse {
    success: boolean;
    data: AdminNotification[];
    unread_count: number;
}

export interface UnreadCountResponse {
    success: boolean;
    unread_count: number;
}

/**
 * WebSocket Event Types
 */
export interface WebSocketNotificationEvent {
    id: number;
    type: NotificationType;
    title: string;
    message: string;
    data: NotificationData | null;
    timestamp: string;
}
