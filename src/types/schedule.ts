/**
 * Schedule Types
 *
 * TypeScript interfaces for the student scheduling feature.
 */

import type { Lecture, Course } from '../data/api/studentService';

// ============================================================
// Schedule Types
// ============================================================

/**
 * A scheduled lecture entry for a student's personal study plan.
 */
export interface Schedule {
    id: number;
    student_id: number;
    lecture_id: number;
    scheduled_at: string; // ISO 8601 datetime
    is_completed: boolean;
    is_accessible?: boolean; // True if subscription is active (defaults to true if missing)
    lecture?: ScheduleLecture;
    created_at: string;
    updated_at: string;
}

/**
 * Lecture data embedded in schedule response.
 */
export interface ScheduleLecture {
    id: number;
    title: string | { ar?: string; en?: string };
    description?: string | { ar?: string; en?: string };
    duration_minutes?: number;
    video_url?: string;
    is_online?: boolean; // True for live sessions
    start_time?: string;
    end_time?: string;
    course_id?: number;
    course?: {
        id: number;
        name: string | { ar?: string; en?: string };
        grade?: {
            id: number;
            name: string | { ar?: string; en?: string };
        };
        semester?: {
            id: number;
            name: string | { ar?: string; en?: string };
        };
    };
}

// ============================================================
// Request/Response Types
// ============================================================

/**
 * Request payload for creating a new schedule.
 */
export interface CreateScheduleRequest {
    lecture_id: number;
    scheduled_at: string; // ISO 8601 datetime (must be in the future)
}

/**
 * Request payload for updating a schedule.
 */
export interface UpdateScheduleRequest {
    scheduled_at?: string;
}

/**
 * API response wrapper for schedule list.
 */
export interface ScheduleListResponse {
    success: boolean;
    message?: string;
    data: Schedule[];
}

/**
 * API response wrapper for single schedule operations.
 */
export interface ScheduleResponse {
    success: boolean;
    message?: string;
    data: Schedule;
}

// ============================================================
// UI Helper Types
// ============================================================

/**
 * Schedule grouped by date for UI rendering.
 */
export interface ScheduleGroup {
    date: string; // YYYY-MM-DD
    dayLabel: string; // Arabic day name
    dateLabel: string; // Formatted date
    isToday: boolean;
    schedules: Schedule[];
}

/**
 * Status of a scheduled item for UI styling.
 */
export type ScheduleStatus = 'upcoming' | 'in-progress' | 'completed' | 'missed';
