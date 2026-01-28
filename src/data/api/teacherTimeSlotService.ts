/**
 * Teacher Time Slot Service
 * 
 * API service for teachers to view and book available time slots
 * for live online lectures.
 */

import apiClient from './ApiClient';

export interface TimeSlot {
    id: number;
    start_time: string;
    end_time: string;
    status: 'available' | 'pending' | 'approved' | 'rejected';
    is_available: boolean;
    teacher_id: number | null;
    lecture_id: number | null;
    time_range: string | null;
    date: string | null;
}

export interface TimeSlotResponse {
    success: boolean;
    data: TimeSlot[];
}

export interface SlotRequestResponse {
    success: boolean;
    message: string;
    data?: TimeSlot;
}

export interface MyRequestsSummary {
    pending: number;
    approved: number;
    rejected: number;
}

export interface MyRequestsResponse {
    success: boolean;
    data: TimeSlot[];
    summary: MyRequestsSummary;
}

export const teacherTimeSlotService = {
    /**
     * Get all available time slots for booking
     */
    getAvailable: async (): Promise<TimeSlot[]> => {
        const response = await apiClient.get<TimeSlotResponse>('/api/v1/teacher/timeslots');
        return response.data.data || [];
    },

    /**
     * Request a specific slot for a lecture
     * Creates a pending request that admin must approve
     */
    requestSlot: async (
        slotId: number,
        lectureId: number,
        notes?: string
    ): Promise<SlotRequestResponse> => {
        const response = await apiClient.post<SlotRequestResponse>(
            `/api/v1/teacher/timeslots/${slotId}/request`,
            { lecture_id: lectureId, notes }
        );
        return response.data;
    },

    /**
     * Get all slot requests made by the current teacher
     */
    getMyRequests: async (): Promise<MyRequestsResponse> => {
        const response = await apiClient.get<MyRequestsResponse>('/api/v1/teacher/timeslots/my-requests');
        return response.data;
    },

    /**
     * Cancel a pending slot request
     */
    cancelRequest: async (slotId: number): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.post<{ success: boolean; message: string }>(
            `/api/v1/teacher/timeslots/${slotId}/cancel`
        );
        return response.data;
    },

    /**
     * Get details of a specific slot request
     */
    getSlotDetails: async (slotId: number): Promise<TimeSlot | null> => {
        const response = await apiClient.get<{ success: boolean; data: TimeSlot }>(
            `/api/v1/teacher/timeslots/${slotId}`
        );
        return response.data.data || null;
    },
};
