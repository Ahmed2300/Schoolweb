import apiClient from "./ApiClient";

export interface TimeSlot {
    id: number;
    start_time: string;
    end_time: string;
    status: 'available' | 'pending' | 'approved' | 'rejected' | 'completed';
}

export interface Lecture {
    id: number;
    title: string;
    description: string | null;
    duration_minutes: number;
    order: number;
    is_published: boolean;
    is_online: boolean;
    is_active?: boolean;
    video_path: string | null;
    item_type: 'lecture';
    quizzes?: Quiz[]; // Nested quizzes inside lecture
    is_locked: boolean;
    is_completed: boolean;
    // Live session fields
    time_slot?: TimeSlot;
    recording_url?: string;
    bbb_meeting_running?: boolean;
    // Session status for progression rules
    session_status?: 'upcoming' | 'live' | 'ended' | 'recorded';
    can_complete?: boolean;
    has_recording?: boolean;
    start_time?: string | null;
    end_time?: string | null;
}

export interface QuizAttempt {
    id: number;
    score: number;
    status: 'pending' | 'completed';
    started_at: string;
    completed_at: string | null;
}

export interface Quiz {
    id: number;
    title: string;
    description: string | null;
    duration_minutes: number;
    order: number;
    is_published: boolean;
    item_type: 'quiz';
    is_locked: boolean;
    is_completed: boolean;
    questions_count?: number;
    passing_percentage?: number;
    attempts?: QuizAttempt[]; // Student's attempts (best first)
    best_score?: number;      // Computed from attempts
}

export type CourseContentItem = Lecture | Quiz;

export interface Unit {
    id: number;
    title: string;
    order: number;
    items: CourseContentItem[];
}

export interface StudentCourseSubscription {
    status: number;
    status_label: string;
    start_date: string;
    end_date: string;
}

export interface StudentCourseProgress {
    course_id: number;
    percentage: number;
    is_completed: boolean;

    total_items: number;
    completed_items: number;

    total_videos: number;
    watched_videos: number;
    video_completion_rate: number;

    total_lives: number;
    attended_lives: number;
    attendance_rate: number;

    total_quizzes: number;
    completed_quizzes: number;
    quiz_completion_rate: number;
    average_quiz_score: number;

    points_earned: number;
    level: string;
    next_milestone: number;
}

export interface StudentCourseDetails {
    id: number;
    name: string;
    description: string;
    is_active: boolean;
    price: string;
    image_path: string | null;
    teacher_name?: string;
    content: Unit[];
    subscription: StudentCourseSubscription;
    progress?: StudentCourseProgress;
}

export const studentCourseService = {
    getStudentCourseDetails: async (courseId: string | number): Promise<StudentCourseDetails> => {
        const response = await apiClient.get(`/api/v1/students/courses/${courseId}/details`);
        return response.data.data;
    },

    getSyllabusStatus: async (courseId: string | number): Promise<SyllabusUnit[]> => {
        const response = await apiClient.get(`/api/v1/students/courses/${courseId}/syllabus-status`);
        return response.data.data;
    },

    markLectureComplete: async (lectureId: string | number, watchTime?: number): Promise<void> => {
        await apiClient.post(`/api/v1/students/lectures/${lectureId}/complete`, {
            watch_time_seconds: watchTime
        });
    },
};

export interface SyllabusItem {
    id: number;
    type: 'lecture' | 'quiz' | 'unit_quiz';
    title: string;
    status: 'locked' | 'open' | 'completed';
    is_locked: boolean;
    is_completed: boolean;
    // Live session status fields
    session_status?: 'upcoming' | 'live' | 'ended' | 'recorded';
    can_complete?: boolean;
    has_recording?: boolean;
    quizzes?: SyllabusItem[];
}

export interface SyllabusUnit {
    id: number;
    title: string;
    order: number;
    items: SyllabusItem[];
    progress_percentage: number;
}
