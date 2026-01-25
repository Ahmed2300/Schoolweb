/**
 * Admin Time Slot Service
 * 
 * API service for admin to manage and approve time slots
 */

import apiClient from './ApiClient';

export interface AdminTimeSlot {
    id: number;
    start_time: string;
    end_time: string;
    status: 'available' | 'pending' | 'approved' | 'rejected';
    is_available: boolean;
    teacher_id: number | null;
    teacher_name?: string;
    lecture_id: number | null;
    lecture_title?: string;
    course_id?: number | null;
    course_name?: string;
    request_notes?: string | null;
    requested_at?: string | null;
    rejection_reason?: string | null;
    approved_at?: string | null;
    approved_by?: number | null;
}

export interface PendingSlotResponse {
    success: boolean;
    data: AdminTimeSlot[];
    count: number;
}

export interface SlotStatsResponse {
    success: boolean;
    stats: {
        total: number;
        available: number;
        pending: number;
        approved: number;
        rejected: number;
    };
}

export const adminTimeSlotService = {
    /**
     * Get all time slots with optional filters
     */
    getAll: async (params?: { status?: string; date?: string }): Promise<AdminTimeSlot[]> => {
        const response = await apiClient.get<{ success: boolean; data: AdminTimeSlot[] }>(
            '/api/v1/admin/time-slots',
            { params }
        );
        return response.data.data || [];
    },

    /**
     * Get all pending slot requests
     */
    getPending: async (): Promise<AdminTimeSlot[]> => {
        const response = await apiClient.get<PendingSlotResponse>('/api/v1/admin/time-slots/pending');
        return response.data.data || [];
    },

    /**
     * Approve a pending slot request
     */
    approve: async (slotId: number): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.post<{ success: boolean; message: string }>(
            `/api/v1/admin/time-slots/${slotId}/approve`
        );
        return response.data;
    },

    /**
     * Reject a pending slot request
     */
    reject: async (slotId: number, reason: string): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.post<{ success: boolean; message: string }>(
            `/api/v1/admin/time-slots/${slotId}/reject`,
            { reason }
        );
        return response.data;
    },

    /**
     * Get slot statistics
     */
    getStats: async (): Promise<SlotStatsResponse['stats']> => {
        const response = await apiClient.get<SlotStatsResponse>('/api/v1/admin/time-slots/stats');
        return response.data.stats;
    },
};
