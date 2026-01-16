/**
 * Student Notification Types
 */
export interface StudentNotification {
    id: number;
    type: StudentNotificationType;
    title: string;
    message: string;
    data: StudentNotificationData | null;
    timestamp: string;
    is_read: boolean;
    read_at: string | null;
    created_at: string;
}

export type StudentNotificationType =
    | 'subscription_approved'
    | 'subscription_rejected'
    | 'payment_approved'
    | 'payment_rejected'
    | 'general';

export interface StudentNotificationData {
    subscription_id?: number;
    course_id?: number;
    course_name?: string;
    rejection_reason?: string;
}

export interface StudentNotificationResponse {
    success: boolean;
    data: StudentNotification[];
    unread_count: number;
}

export interface StudentUnreadCountResponse {
    success: boolean;
    unread_count: number;
}

/**
 * WebSocket Event Types for Student
 */
export interface WebSocketStudentNotificationEvent {
    id: number;
    type: StudentNotificationType;
    title: string;
    message: string;
    data: StudentNotificationData | null;
    timestamp: string;
}
