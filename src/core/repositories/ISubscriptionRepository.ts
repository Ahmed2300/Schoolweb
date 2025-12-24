import type { Subscription, SubscriptionRequest, SubscriptionStatus } from '../entities';

export interface ISubscriptionRepository {
    getSubscriptions(userId: string): Promise<Subscription[]>;
    getSubscriptionById(id: string): Promise<Subscription>;
    checkAccess(userId: string, targetType: string, targetId: string): Promise<boolean>;

    // Student methods
    requestSubscription(data: SubscriptionRequest): Promise<Subscription>;
    cancelSubscription(id: string): Promise<void>;

    // Admin methods
    getPendingSubscriptions(): Promise<Subscription[]>;
    approveSubscription(id: string): Promise<Subscription>;
    rejectSubscription(id: string, reason?: string): Promise<Subscription>;
    getAllSubscriptions(filters?: SubscriptionFilters): Promise<Subscription[]>;
}

export interface SubscriptionFilters {
    userId?: string;
    status?: SubscriptionStatus;
    type?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
}
