import { apiClient, endpoints } from '../api';
import type { ISubscriptionRepository, SubscriptionFilters } from '../../core/repositories';
import type { Subscription, SubscriptionRequest } from '../../core/entities';

export class SubscriptionRepository implements ISubscriptionRepository {
    async getSubscriptions(userId: string): Promise<Subscription[]> {
        const response = await apiClient.get(endpoints.subscriptions.list, {
            params: { userId }
        });
        return response.data.subscriptions;
    }

    async getSubscriptionById(id: string): Promise<Subscription> {
        const response = await apiClient.get(endpoints.subscriptions.detail(id));
        return response.data;
    }

    async checkAccess(userId: string, targetType: string, targetId: string): Promise<boolean> {
        const response = await apiClient.post(endpoints.subscriptions.checkAccess, {
            userId,
            targetType,
            targetId
        });
        return response.data.hasAccess;
    }

    async requestSubscription(data: SubscriptionRequest): Promise<Subscription> {
        const formData = new FormData();
        formData.append('type', data.type);
        formData.append('targetId', data.targetId);
        formData.append('receipt', data.receiptImage);

        const response = await apiClient.post(endpoints.subscriptions.request, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }

    async cancelSubscription(id: string): Promise<void> {
        await apiClient.post(endpoints.subscriptions.cancel(id));
    }

    async getPendingSubscriptions(): Promise<Subscription[]> {
        const response = await apiClient.get(endpoints.subscriptions.pending);
        return response.data.subscriptions;
    }

    async approveSubscription(id: string): Promise<Subscription> {
        const response = await apiClient.post(endpoints.subscriptions.approve(id));
        return response.data;
    }

    async rejectSubscription(id: string, reason?: string): Promise<Subscription> {
        const response = await apiClient.post(endpoints.subscriptions.reject(id), { reason });
        return response.data;
    }

    async getAllSubscriptions(filters?: SubscriptionFilters): Promise<Subscription[]> {
        const response = await apiClient.get(endpoints.subscriptions.list, {
            params: filters
        });
        return response.data.subscriptions;
    }
}
