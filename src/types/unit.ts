/**
 * Unit Types
 * 
 * Types for the Units feature - organizing lectures within courses.
 * Hierarchy: Course → Unit → Lecture
 */

export interface Unit {
    id: number;
    course_id: number;
    title: { ar?: string; en?: string };
    description?: { ar?: string; en?: string };
    order: number;
    is_published: boolean;
    lectures?: UnitLecture[];
    lectures_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface UnitLecture {
    id: number;
    unit_id: number | null;
    course_id: number;
    title: { ar?: string; en?: string } | string;
    description?: { ar?: string; en?: string } | string;
    duration_minutes?: number;
    order: number;
    is_published: boolean;
    video_path?: string;
    thumbnail_path?: string;
    teacher_id?: number;
    is_online?: boolean;
    start_time?: string;
    end_time?: string;
    video_url?: string;
}

export interface CreateUnitRequest {
    title: { ar: string; en?: string };
    description?: { ar?: string; en?: string };
    is_published?: boolean;
}

export interface UpdateUnitRequest {
    title?: { ar?: string; en?: string };
    description?: { ar?: string; en?: string };
    order?: number;
    is_published?: boolean;
}

export interface ReorderUnitsRequest {
    order: number[]; // Array of unit IDs in desired order
}

export interface MoveLectureRequest {
    lecture_id: number;
    order?: number;
}

export interface ReorderLecturesRequest {
    order: number[]; // Array of lecture IDs in desired order
}
