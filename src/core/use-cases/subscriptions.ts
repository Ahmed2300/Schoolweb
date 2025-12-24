import type { ISubscriptionRepository, SubscriptionFilters } from '../repositories';
import type { Subscription, SubscriptionRequest } from '../entities';

// Use case for getting user subscriptions
export class GetSubscriptionsUseCase {
    constructor(private subscriptionRepository: ISubscriptionRepository) { }

    async execute(userId: string): Promise<Subscription[]> {
        if (!userId) throw new Error('User ID is required');
        return this.subscriptionRepository.getSubscriptions(userId);
    }
}

// Use case for checking access to content
export class CheckAccessUseCase {
    constructor(private subscriptionRepository: ISubscriptionRepository) { }

    async execute(userId: string, targetType: string, targetId: string): Promise<boolean> {
        if (!userId) return false;
        return this.subscriptionRepository.checkAccess(userId, targetType, targetId);
    }
}

// Use case for requesting a subscription
export class RequestSubscriptionUseCase {
    constructor(private subscriptionRepository: ISubscriptionRepository) { }

    async execute(data: SubscriptionRequest): Promise<Subscription> {
        if (!data.targetId || !data.receiptImage) {
            throw new Error('Target and payment receipt are required');
        }
        return this.subscriptionRepository.requestSubscription(data);
    }
}

// Use case for admin to manage subscriptions
export class ManageSubscriptionUseCase {
    constructor(private subscriptionRepository: ISubscriptionRepository) { }

    async getPending(): Promise<Subscription[]> {
        return this.subscriptionRepository.getPendingSubscriptions();
    }

    async approve(id: string): Promise<Subscription> {
        if (!id) throw new Error('Subscription ID is required');
        return this.subscriptionRepository.approveSubscription(id);
    }

    async reject(id: string, reason?: string): Promise<Subscription> {
        if (!id) throw new Error('Subscription ID is required');
        return this.subscriptionRepository.rejectSubscription(id, reason);
    }

    async getAll(filters?: SubscriptionFilters): Promise<Subscription[]> {
        return this.subscriptionRepository.getAllSubscriptions(filters);
    }
}
