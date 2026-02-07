/**
 * Slot Request API Service
 * 
 * Dedicated service for teacher slot requests (Add More Slots feature).
 * Separates the new slot request feature from legacy TimeSlot management.
 */

import apiClient from './ApiClient';
import type {
    SlotRequest,
    SlotRequestsResponse,
    SlotRequestResponse,
    SlotRequestStatsResponse,
    CreateSlotRequestPayload,
} from '../../types/slotRequest';

// ==================== ENDPOINTS ====================

const SLOT_REQUEST_ENDPOINTS = {
    list: '/api/v1/schedule/requests',
    create: '/api/v1/schedule/requests',
    stats: '/api/v1/schedule/requests/stats',
    availableSlots: '/api/v1/schedule/requests/available-slots',
    show: (id: number) => `/api/v1/schedule/requests/${id}`,
    cancel: (id: number) => `/api/v1/schedule/requests/${id}`,
} as const;

// ==================== TYPES ====================

export type AvailableSlot = {
    start: string;
    end: string;
    slot_time: string;
    is_available: boolean;
    reserved_by: string | null;
};

// ==================== SERVICE ====================

export const slotRequestService = {
    /**
     * Get all slot requests for the authenticated teacher.
     * @param status - Optional status filter ('pending', 'approved', 'rejected')
     */
    getMyRequests: async (status?: string): Promise<SlotRequest[]> => {
        const params = new URLSearchParams();
        if (status) params.append('status', status);

        const queryString = params.toString();
        const url = queryString
            ? `${SLOT_REQUEST_ENDPOINTS.list}?${queryString}`
            : SLOT_REQUEST_ENDPOINTS.list;

        const response = await apiClient.get(url);
        const result = response.data as SlotRequestsResponse;
        return result.data;
    },

    /**
     * Get available (unreserved) slots for a specific grade and date.
     * @param gradeId - The grade ID
     * @param date - The date in YYYY-MM-DD format
     */
    getAvailableSlots: async (gradeId: number, date: string): Promise<AvailableSlot[]> => {
        const params = new URLSearchParams({
            grade_id: gradeId.toString(),
            date,
        });
        const url = `${SLOT_REQUEST_ENDPOINTS.availableSlots}?${params.toString()}`;
        const response = await apiClient.get(url);
        return response.data?.data?.slots ?? [];
    },

    /**
     * Get approved slot requests that can be used for lecture creation.
     * These are slots that have been approved but not yet assigned to a lecture.
     */
    getApprovedForLecture: async (): Promise<SlotRequest[]> => {
        const url = `${SLOT_REQUEST_ENDPOINTS.list}?status=approved&available=true`;
        const response = await apiClient.get(url);
        const result = response.data as SlotRequestsResponse;
        return result.data;
    },

    /**
     * Create a new slot request.
     */
    createRequest: async (payload: CreateSlotRequestPayload): Promise<SlotRequestResponse> => {
        const response = await apiClient.post(SLOT_REQUEST_ENDPOINTS.create, payload);
        return response.data;
    },

    /**
     * Get slot request statistics for the teacher.
     */
    getStats: async (): Promise<SlotRequestStatsResponse> => {
        const response = await apiClient.get(SLOT_REQUEST_ENDPOINTS.stats);
        return response.data;
    },

    /**
     * Get details of a specific slot request.
     */
    getRequest: async (id: number): Promise<SlotRequest> => {
        const response = await apiClient.get(SLOT_REQUEST_ENDPOINTS.show(id));
        const result = response.data as SlotRequestResponse;
        return result.data;
    },

    /**
     * Cancel a pending slot request.
     */
    cancelRequest: async (id: number): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.delete(SLOT_REQUEST_ENDPOINTS.cancel(id));
        return response.data;
    },
};

export default slotRequestService;
