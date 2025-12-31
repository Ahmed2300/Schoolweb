/**
 * Student API Service
 * 
 * Service functions for student dashboard API calls.
 * All endpoints require student authentication token.
 */

import apiClient from './ApiClient';
import { endpoints } from './endpoints';

// ============================================================
// Types
// ============================================================

export interface StudentProfile {
    id: number;
    name: string;
    email: string;
    phone?: string;
    image_path?: string;
    email_verified_at?: string;
    grade_id?: number;
    country_id?: number;
    city_id?: number;
    created_at?: string;
    updated_at?: string;
}

export interface Grade {
    id: number;
    name: string | { ar?: string; en?: string };
    description?: string | { ar?: string; en?: string };
    order?: number;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Semester {
    id: number;
    name: string | { ar?: string; en?: string };
    start_date?: string;
    end_date?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Course {
    id: number;
    name: string | { ar?: string; en?: string };
    description?: string | { ar?: string; en?: string };
    code: string;
    credits?: number;
    duration_hours?: number;
    price?: number;
    old_price?: number;
    is_promoted?: boolean;
    is_active?: boolean;
    start_date?: string;
    end_date?: string;
    teacher_id?: number;
    teacher?: {
        id: number;
        name: string;
        image_path?: string;
    };
    // TODO: Backend will add these
    // grade_id?: number;
    // semester_id?: number;
    // subject_id?: number;
    // progress_percentage?: number;
    // lessons_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface Lecture {
    id: number;
    title: string | { ar?: string; en?: string };
    description?: string | { ar?: string; en?: string };
    course_id: number;
    order?: number;
    duration_minutes?: number;
    video_url?: string;
    is_free?: boolean;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface DashboardStats {
    totalCourses: number;
    completedCourses: number;
    inProgressCourses: number;
    upcomingLiveSessions: number;
    averageProgress: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Get localized name from multilingual field
 */
export const getLocalizedName = (
    field: string | { ar?: string; en?: string } | undefined,
    fallback: string = 'بدون اسم'
): string => {
    if (!field) return fallback;
    if (typeof field === 'string') return field;
    // Default to Arabic, fallback to English
    return field.ar || field.en || fallback;
};

// ============================================================
// Service
// ============================================================

export const studentService = {
    /**
     * Get current student profile
     */
    getProfile: async (): Promise<StudentProfile> => {
        const response = await apiClient.get(endpoints.studentAuth.me);
        return response.data.data || response.data;
    },

    /**
     * Update student profile
     */
    updateProfile: async (data: Partial<StudentProfile>): Promise<StudentProfile> => {
        const response = await apiClient.put(endpoints.studentAuth.updateProfile, data);
        return response.data.data || response.data;
    },

    /**
     * Change password
     */
    changePassword: async (data: {
        current_password: string;
        password: string;
        password_confirmation: string;
    }): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.post(endpoints.studentAuth.changePassword, data);
        return response.data;
    },

    /**
     * Get all grades
     */
    getGrades: async (): Promise<Grade[]> => {
        const response = await apiClient.get(endpoints.grades.list);
        return response.data.data || response.data || [];
    },

    /**
     * Get grade by ID
     */
    getGradeById: async (id: number): Promise<Grade> => {
        const response = await apiClient.get(endpoints.grades.detail(id));
        return response.data.data || response.data;
    },

    /**
     * Get all semesters
     */
    getSemesters: async (): Promise<Semester[]> => {
        const response = await apiClient.get(endpoints.semesters.list);
        return response.data.data || response.data || [];
    },

    /**
     * Get semester by ID
     */
    getSemesterById: async (id: number): Promise<Semester> => {
        const response = await apiClient.get(endpoints.semesters.detail(id));
        return response.data.data || response.data;
    },

    /**
     * Get all courses (paginated)
     */
    getCourses: async (params?: {
        page?: number;
        per_page?: number;
        search?: string;
        is_active?: boolean;
    }): Promise<PaginatedResponse<Course>> => {
        const response = await apiClient.get(endpoints.courses.list, { params });
        return {
            data: response.data.data || [],
            meta: response.data.meta,
        };
    },

    /**
     * Get course by ID
     */
    getCourseById: async (id: string): Promise<Course> => {
        const response = await apiClient.get(endpoints.courses.detail(id));
        return response.data.data || response.data;
    },

    /**
     * Get all lectures (paginated)
     */
    getLectures: async (params?: {
        page?: number;
        per_page?: number;
        course_id?: number;
    }): Promise<PaginatedResponse<Lecture>> => {
        const response = await apiClient.get(endpoints.lectures.list, { params });
        return {
            data: response.data.data || [],
            meta: response.data.meta,
        };
    },

    /**
     * Get lecture by ID
     */
    getLectureById: async (id: string): Promise<Lecture> => {
        const response = await apiClient.get(endpoints.lectures.detail(id));
        return response.data.data || response.data;
    },

    /**
     * Get dashboard statistics
     * NOTE: This aggregates data from available endpoints since
     * there's no dedicated dashboard stats endpoint yet.
     */
    getDashboardStats: async (): Promise<DashboardStats> => {
        try {
            // Fetch courses to calculate stats
            const coursesResponse = await studentService.getCourses({ per_page: 100 });
            const courses = coursesResponse.data;

            const activeCourses = courses.filter(c => c.is_active);

            return {
                totalCourses: courses.length,
                completedCourses: 0, // TODO: Backend needs enrollment/progress tracking
                inProgressCourses: activeCourses.length,
                upcomingLiveSessions: 0, // TODO: Backend needs live sessions endpoint
                averageProgress: 0, // TODO: Backend needs progress tracking
            };
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            return {
                totalCourses: 0,
                completedCourses: 0,
                inProgressCourses: 0,
                upcomingLiveSessions: 0,
                averageProgress: 0,
            };
        }
    },

    /**
     * Logout current session
     */
    logout: async (): Promise<void> => {
        await apiClient.post(endpoints.studentAuth.logout);
    },

    /**
     * Logout all sessions
     */
    logoutAll: async (): Promise<void> => {
        await apiClient.post(endpoints.studentAuth.logoutAll);
    },
};

export default studentService;
