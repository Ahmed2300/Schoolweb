/**
 * TimeSlot type definitions for the slots management system.
 * Used for managing teacher lecture time slots with approval workflow.
 */

/**
 * TimeSlot status enum representing the approval workflow states.
 */
export type TimeSlotStatus = 'available' | 'pending' | 'approved' | 'rejected';

/**
 * Core TimeSlot interface matching backend TimeSlotResource.
 */
export interface TimeSlot {
    id: number;
    start_time: string;
    end_time: string;
    time_range: string | null;
    date: string | null;
    teacher_id: number | null;
    lecture_id: number | null;
    is_available: boolean;
    status: TimeSlotStatus;
    approved_by: number | null;
    approved_at: string | null;
    rejection_reason: string | null;
    request_notes: string | null;
    requested_at: string | null;
    created_at: string;
    updated_at: string;

    // Relationships (when loaded)
    teacher?: {
        id: number;
        name: string;
        email: string;
    };
    lecture?: {
        id: number;
        title: string;
        course?: {
            id: number;
            name: string | { ar?: string; en?: string };
        };
    };
    approver?: {
        id: number;
        name: string;
    };
}

/**
 * Statistics for time slots dashboard.
 */
export interface TimeSlotStats {
    total: number;
    available: number;
    pending: number;
    approved: number;
    rejected: number;
}

/**
 * Request payload for creating a new time slot.
 */
export interface CreateTimeSlotRequest {
    start_time: string;
    end_time: string;
    is_available?: boolean;
}

/**
 * Request payload for bulk creating time slots.
 */
export interface BulkCreateTimeSlotsRequest {
    slots: Array<{
        start_time: string;
        end_time: string;
    }>;
}

/**
 * Request payload for updating a time slot.
 */
export interface UpdateTimeSlotRequest {
    start_time?: string;
    end_time?: string;
    is_available?: boolean;
    status?: TimeSlotStatus;
}

/**
 * Request payload for rejecting a slot request.
 */
export interface RejectSlotRequest {
    reason: string;
}

/**
 * Request payload for teacher slot request.
 */
export interface TeacherSlotRequestPayload {
    lecture_id: number;
    notes?: string;
}

/**
 * Summary of teacher's slot requests.
 */
export interface TeacherRequestsSummary {
    pending: number;
    approved: number;
    rejected: number;
}

/**
 * Response wrapper for teacher's requests.
 */
export interface TeacherRequestsResponse {
    success: boolean;
    data: TimeSlot[];
    summary: TeacherRequestsSummary;
}

/**
 * API response wrapper for single slot.
 */
export interface TimeSlotResponse {
    success: boolean;
    message?: string;
    data: TimeSlot;
}

/**
 * API response wrapper for multiple slots.
 */
export interface TimeSlotsResponse {
    success: boolean;
    data: TimeSlot[];
    count?: number;
}

/**
 * API response wrapper for stats.
 */
export interface TimeSlotStatsResponse {
    success: boolean;
    data: TimeSlotStats;
}

/**
 * Filter options for listing time slots.
 */
export interface TimeSlotFilters {
    status?: TimeSlotStatus;
    date?: string;
    teacher_id?: number;
}
