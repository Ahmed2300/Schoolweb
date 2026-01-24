
import apiClient from './ApiClient';
import { endpoints } from './endpoints';
import { ContentApprovalRequest, ContentApprovalListResponse } from './teacherContentApprovalService';

export interface AdminContentApprovalListResponse extends ContentApprovalListResponse { }

export const adminContentApprovalService = {
    /**
     * Get list of approval requests
     */
    async getRequests(params?: {
        status?: 'pending' | 'approved' | 'rejected';
        approvable_type?: string;
        per_page?: number;
        page?: number;
    }): Promise<AdminContentApprovalListResponse> {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append('status', params.status);
        if (params?.approvable_type) queryParams.append('approvable_type', params.approvable_type);
        if (params?.per_page) queryParams.append('per_page', String(params.per_page));
        if (params?.page) queryParams.append('page', String(params.page));

        const url = `${endpoints.admin.contentApprovals.list}?${queryParams.toString()}`;
        const response = await apiClient.get<AdminContentApprovalListResponse>(url);
        return response.data;
    },

    /**
     * Get a single request
     */
    async getRequest(id: number): Promise<{ success: boolean; data: ContentApprovalRequest }> {
        const response = await apiClient.get<{ success: boolean; data: ContentApprovalRequest }>(
            endpoints.admin.contentApprovals.show(id)
        );
        return response.data;
    },

    /**
     * Approve a request
     */
    async approveRequest(id: number): Promise<{ success: boolean; message: string }> {
        const response = await apiClient.post<{ success: boolean; message: string }>(
            endpoints.admin.contentApprovals.approve(id),
            {}
        );
        return response.data;
    },

    /**
     * Reject a request
     */
    async rejectRequest(id: number, feedback: string): Promise<{ success: boolean; message: string }> {
        const response = await apiClient.post<{ success: boolean; message: string }>(
            endpoints.admin.contentApprovals.reject(id),
            { feedback }
        );
        return response.data;
    }
};

export default adminContentApprovalService;
