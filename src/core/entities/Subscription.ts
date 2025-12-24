// Subscription entity
export interface Subscription {
    id: string;
    userId: string;
    type: SubscriptionType;
    targetId: string; // courseId, gradeId, or 'platform'
    status: SubscriptionStatus;
    price: number;
    paymentReceipt?: string;
    startDate: Date;
    endDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export type SubscriptionType = 'course' | 'grade' | 'subject' | 'platform';
export type SubscriptionStatus = 'pending' | 'active' | 'expired' | 'cancelled' | 'rejected';

export interface SubscriptionRequest {
    type: SubscriptionType;
    targetId: string;
    receiptImage: File;
}
