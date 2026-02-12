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
    quizzes?: UnitQuiz[];
    quizzes_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface UnitQuiz {
    id: number;
    name: string | { ar?: string; en?: string };
    description?: string | { ar?: string; en?: string };
    unit_id: number | null;
    lecture_id?: number | null;
    course_id: number;
    status: 'draft' | 'pending' | 'approved' | 'rejected';
    questions_count?: number;
    order?: number;
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
    is_test?: boolean;
    start_time?: string;
    end_time?: string;
    video_url?: string;
    // Recording fields
    has_recording?: boolean;
    recording_url?: string | null;
    meeting_status?: 'scheduled' | 'ready' | 'ongoing' | 'completed' | null;
    view_count?: number;
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
