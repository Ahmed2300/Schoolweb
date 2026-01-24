import apiClient from './ApiClient';
import { endpoints } from './endpoints';

// Types for Content Approval
export interface ContentApprovalRequest {
    id: number;
    requester_id: number;
    approvable_type: string;
    approvable_id: number;
    status: 'pending' | 'approved' | 'rejected';
    payload: Record<string, any>;
    admin_feedback: string | null;
    processed_at: string | null;
    created_at: string;
    updated_at: string;
    approvable?: {
        id: number;
        name?: string | { en: string; ar: string };
        title?: string;
        [key: string]: any;
    };
    requester?: {
        id: number;
        name: string;
        email: string;
    };
}

export interface ContentApprovalListResponse {
    success: boolean;
    data: ContentApprovalRequest[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export interface ContentApprovalCreatePayload {
    approvable_type: 'course' | 'lecture' | 'unit';
    approvable_id: number;
    payload: Record<string, any>;
}

export interface ContentApprovalCreateResponse {
    success: boolean;
    message: string;
    data: ContentApprovalRequest;
}

export interface PendingCountResponse {
    success: boolean;
    count: number;
}

/**
 * Service for managing content approval requests (teacher-side)
 */
export const teacherContentApprovalService = {
    /**
     * Get list of my approval requests
     */
    async getMyRequests(params?: {
        status?: 'pending' | 'approved' | 'rejected';
        per_page?: number;
        page?: number;
    }): Promise<ContentApprovalListResponse> {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append('status', params.status);
        if (params?.per_page) queryParams.append('per_page', String(params.per_page));
        if (params?.page) queryParams.append('page', String(params.page));

        const url = `${endpoints.teacher.contentApprovals.list}?${queryParams.toString()}`;
        const response = await apiClient.get<ContentApprovalListResponse>(url);
        return response.data;
    },

    /**
     * Submit approval request
     */
    async submitApprovalRequest(payload: ContentApprovalCreatePayload): Promise<ContentApprovalCreateResponse> {
        const response = await apiClient.post<ContentApprovalCreateResponse>(
            endpoints.teacher.contentApprovals.create,
            payload
        );
        return response.data;
    },

    /**
     * Get a single request details
     */
    async getRequest(id: number): Promise<{ success: boolean; data: ContentApprovalRequest }> {
        const response = await apiClient.get<{ success: boolean; data: ContentApprovalRequest }>(
            endpoints.teacher.contentApprovals.show(id)
        );
        return response.data;
    },

    /**
     * Cancel a pending request
     */
    async cancelRequest(id: number): Promise<{ success: boolean; message: string }> {
        const response = await apiClient.delete<{ success: boolean; message: string }>(
            endpoints.teacher.contentApprovals.delete(id)
        );
        return response.data;
    },

    /**
     * Get pending count for a course
     */
    async getPendingCount(courseId: number): Promise<number> {
        const response = await apiClient.get<PendingCountResponse>(
            endpoints.teacher.contentApprovals.pendingCount(courseId)
        );
        return response.data.count;
    },
};

export default teacherContentApprovalService;
