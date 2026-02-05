/**
 * Slot Request Types
 * 
 * Types for the teacher slot request feature.
 */

// ==================== CONSTANTS ====================

export const SLOT_REQUEST_TYPES = {
    WEEKLY: 'weekly',
    ONE_TIME: 'one_time',
} as const;

export const SLOT_REQUEST_STATUSES = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
} as const;

export const DAYS_OF_WEEK = [
    { value: 0, labelAr: 'الأحد', labelEn: 'Sunday' },
    { value: 1, labelAr: 'الاثنين', labelEn: 'Monday' },
    { value: 2, labelAr: 'الثلاثاء', labelEn: 'Tuesday' },
    { value: 3, labelAr: 'الأربعاء', labelEn: 'Wednesday' },
    { value: 4, labelAr: 'الخميس', labelEn: 'Thursday' },
    { value: 5, labelAr: 'الجمعة', labelEn: 'Friday' },
    { value: 6, labelAr: 'السبت', labelEn: 'Saturday' },
] as const;

// ==================== TYPES ====================

export type SlotRequestType = typeof SLOT_REQUEST_TYPES[keyof typeof SLOT_REQUEST_TYPES];
export type SlotRequestStatus = typeof SLOT_REQUEST_STATUSES[keyof typeof SLOT_REQUEST_STATUSES];
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// ==================== INTERFACES ====================

export interface SlotRequestTeacher {
    id: number;
    name: string;
    email: string;
    image_path?: string | null;
}

export interface SlotRequestGrade {
    id: number;
    name: string;
}

export interface SlotRequestReviewer {
    id: number;
    name: string;
}

/**
 * Main SlotRequest interface matching API response
 */
export interface SlotRequest {
    id: number;
    type: SlotRequestType;
    type_label: string;
    status: SlotRequestStatus;
    status_label: string;

    // Time info
    day_of_week: DayOfWeek | null;
    day_name: string | null;
    specific_date: string | null;
    start_time: string;
    end_time: string;
    time_range: string;

    // Notes
    notes: string | null;
    rejection_reason: string | null;

    // Relationships
    teacher?: SlotRequestTeacher;
    grade?: SlotRequestGrade;
    reviewer?: SlotRequestReviewer | null;

    // Timestamps
    reviewed_at: string | null;
    created_at: string;
    updated_at: string;

    // Computed flags
    is_pending: boolean;
    is_approved: boolean;
    is_rejected: boolean;
    can_cancel: boolean;
}

/**
 * Request payload for creating a slot request
 */
export interface CreateSlotRequestPayload {
    grade_id: number;
    type: SlotRequestType;
    day_of_week?: DayOfWeek;
    specific_date?: string;
    start_time: string;
    end_time: string;
    notes?: string;
}

/**
 * Stats response for slot requests
 */
export interface SlotRequestStats {
    pending: number;
    approved: number;
    rejected: number;
}

/**
 * API response wrapper for slot requests
 */
export interface SlotRequestsResponse {
    success: boolean;
    data: SlotRequest[];
    meta?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export interface SlotRequestResponse {
    success: boolean;
    data: SlotRequest;
    message?: string;
}

export interface SlotRequestStatsResponse {
    success: boolean;
    data: SlotRequestStats;
}

/**
 * Form state for the slot request dialog
 */
export interface SlotRequestFormState {
    grade_id: number | null;
    type: SlotRequestType;
    day_of_week: DayOfWeek | null;
    specific_date: string;
    start_time: string;
    end_time: string;
    notes: string;
}
