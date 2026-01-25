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
    action?: string; // e.g., 'create_unit', 'create_lecture'
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
    async submitApprovalRequest(data: ContentApprovalCreatePayload): Promise<ContentApprovalCreateResponse> {
        // Check if payload contains an image file
        if (data.payload.image instanceof File || data.payload.image instanceof Blob) {
            const formData = new FormData();
            formData.append('approvable_type', data.approvable_type);
            formData.append('approvable_id', data.approvable_id.toString());
            if (data.action) formData.append('action', data.action);

            // Extract image
            formData.append('image', data.payload.image);

            // Serialize the rest of the payload without the image
            const { image, ...restPayload } = data.payload;
            formData.append('payload', JSON.stringify(restPayload));

            const response = await apiClient.post<ContentApprovalCreateResponse>(
                endpoints.teacher.contentApprovals.create,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            );
            return response.data;
        }

        // Standard JSON request
        const response = await apiClient.post<ContentApprovalCreateResponse>(
            endpoints.teacher.contentApprovals.create,
            data
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
