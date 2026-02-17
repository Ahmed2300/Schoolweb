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
    uid?: string; // Unique identifier (STD-YYYY-XXXXXX)
    name: string;
    email: string;
    phone?: string;
    image_path?: string;
    email_verified_at?: string;
    grade_id?: number;
    grade?: string;
    country_id?: number;
    city_id?: number;
    parent_id?: number;
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
    is_academic?: boolean;
    start_date?: string;
    end_date?: string;
    teacher_id?: number;
    teacher?: {
        id: number;
        name: string;
        image_path?: string;
    };
    grade_id?: number;
    semester_id?: number;
    subject_id?: number;
    grade?: Grade;
    semester?: Semester;
    image_path?: string;
    // Added loose properties to match usage in components till backend is fully typed
    image?: string;
    thumbnail?: string;
    title?: string | { ar?: string; en?: string };
    subject?: {
        id: number;
        name: string | { ar?: string; en?: string };
    };
    lectures?: Lecture[];
    lectures_count?: number;
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
    video_path?: string;
    is_free?: boolean;
    is_active?: boolean;
    meeting_status?: 'scheduled' | 'ready' | 'ongoing' | 'completed';
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

export interface MissedLectureItem {
    id: number;
    title: string;
    course: string;
    course_id: number;
    time: string | null;
    is_live: boolean;
    has_recording: boolean;
}

export interface MissedQuizItem {
    id: number;
    name: string;
    course: string;
    course_id: number;
    lecture_id: number | null;
}

export interface MissedTasksResponse {
    missed_lectures: MissedLectureItem[];
    missed_quizzes: MissedQuizItem[];
    total_missed: number;
    period_days: number;
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

// Subscription status values matching backend enum
export type SubscriptionStatus = 0 | 1 | 2 | 3; // INACTIVE=0, ACTIVE=1, PENDING=2, REJECTED=3

export const SubscriptionStatusLabels: Record<SubscriptionStatus, string> = {
    0: 'غير نشط',
    1: 'نشط',
    2: 'قيد المراجعة',
    3: 'مرفوض',
};

export interface Subscription {
    id: number;
    student_id: number;
    course_id: number;
    course?: Course;
    status: SubscriptionStatus;
    status_label: string;
    bill_image_path?: string;
    rejection_reason?: string;
    start_date?: string;
    end_date?: string;
    is_currently_active: boolean;
    created_at?: string;
    updated_at?: string;
}

/** Parent link request (from student perspective) */
export interface ParentLinkRequest {
    id: number;
    student_id: number;
    parent_id: number;
    requested_by_type: 'parent' | 'student';
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
    message?: string;
    response_message?: string;
    expires_at?: string;
    created_at?: string;
    updated_at?: string;
    parent?: {
        id: number;
        name: string;
        email?: string;
        phone?: string;
        image_path?: string;
    };
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Get localized name from multilingual field
 * Handles both objects and JSON strings
 */
export const getLocalizedName = (
    field: string | { ar?: string; en?: string } | undefined,
    fallback: string = 'بدون اسم'
): string => {
    if (!field) return fallback;

    // If it's a string, check if it's a JSON string and try to parse it
    if (typeof field === 'string') {
        // Check if it looks like a JSON object
        if (field.startsWith('{') && field.includes('"ar"')) {
            try {
                const parsed = JSON.parse(field);
                return parsed.ar || parsed.en || field;
            } catch {
                return field;
            }
        }
        return field;
    }

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
     * Get semesters for a specific grade
     */
    getSemestersByGrade: async (gradeId: number): Promise<Semester[]> => {
        const response = await apiClient.get(endpoints.grades.semestersByGrade(gradeId));
        return response.data.data || response.data || [];
    },

    /**
     * Get academic courses (filtered by grade/semester)
     */
    getAcademicCourses: async (params: {
        grade_id?: number;
        semester_id?: number;
        per_page?: number;
        page?: number;
    }): Promise<PaginatedResponse<Course>> => {
        const response = await apiClient.get(endpoints.courses.list, {
            params: { ...params, is_academic: true }
        });
        return {
            data: response.data.data || [],
            meta: response.data.meta,
        };
    },

    /**
     * Get non-academic/skills courses
     */
    getSkillsCourses: async (params?: {
        per_page?: number;
        page?: number;
    }): Promise<PaginatedResponse<Course>> => {
        const response = await apiClient.get(endpoints.courses.list, {
            params: { ...params, is_academic: false }
        });
        return {
            data: response.data.data || [],
            meta: response.data.meta,
        };
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
        const response = await apiClient.get(endpoints.student.lectures.list, { params });
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
     * Get home dashboard data (aggregated)
     */
    getHomeDashboardData: async (): Promise<{
        user: StudentProfile;
        active_courses_count: number;
        upcoming_sessions_count: number;
        unread_notifications: number;
        subscriptions: Subscription[];
    }> => {
        try {
            const response = await apiClient.get(endpoints.studentAuth.homeDashboard);
            const data = response.data;

            // Map backend response to useful stats
            const subscriptions = data.subscriptions || [];
            const schedules = data.schedules || [];

            return {
                user: data.user,
                active_courses_count: subscriptions.filter((s: any) => s.status === 1 || s.is_currently_active).length,
                upcoming_sessions_count: schedules.length,
                unread_notifications: data.unread_notifications || 0,
                subscriptions: subscriptions
            };
        } catch (error) {
            console.error('Error fetching home dashboard data:', error);
            // Fallback to empty data to prevent crash
            return {
                user: {} as StudentProfile,
                active_courses_count: 0,
                upcoming_sessions_count: 0,
                unread_notifications: 0,
                subscriptions: []
            };
        }
    },

    /**
     * Get dashboard statistics
     * NOTE: This aggregates data from available endpoints since
     * there's no dedicated dashboard stats endpoint yet.
     */
    getDashboardStats: async (): Promise<DashboardStats> => {
        try {
            // Use the new dedicated endpoint for performance and accuracy
            const data = await studentService.getHomeDashboardData();

            return {
                totalCourses: data.subscriptions.length,
                completedCourses: 0, // TODO: Backend needs enrollment/progress tracking
                inProgressCourses: data.active_courses_count,
                upcomingLiveSessions: data.upcoming_sessions_count,
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

    // ============================================================
    // Subscription Methods
    // ============================================================

    /**
     * Subscribe to a course (creates pending subscription)
     */
    subscribeToCourse: async (courseId: number): Promise<Subscription> => {
        const response = await apiClient.post('/api/v1/students/subscriptions', {
            course_id: courseId,
        });
        return response.data.data || response.data;
    },

    /**
     * Upload payment receipt for a subscription
     */
    uploadPaymentReceipt: async (subscriptionId: number, file: File): Promise<Subscription> => {
        const formData = new FormData();
        formData.append('bill_image', file);
        const response = await apiClient.post(
            `/api/v1/students/subscriptions/${subscriptionId}/bill-image`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data.data || response.data;
    },

    /**
     * Get all subscriptions for the current student
     */
    getMySubscriptions: async (): Promise<Subscription[]> => {
        const response = await apiClient.get('/api/v1/students/subscriptions');
        return response.data.data || response.data;
    },

    /**
     * Check if student has a subscription for a specific course
     */
    getSubscriptionByCourse: async (courseId: number): Promise<Subscription | null> => {
        const subscriptions = await studentService.getMySubscriptions();
        return subscriptions.find(s => s.course_id === courseId) || null;
    },

    // ============================================================
    // Parent Link Request Methods
    // ============================================================

    /**
     * Get all parent link requests for the current student
     */
    getParentRequests: async (): Promise<ParentLinkRequest[]> => {
        const response = await apiClient.get(endpoints.student.parentRequests.list);
        return response.data.data || [];
    },

    /**
     * Get pending parent link requests only
     */
    getPendingParentRequests: async (): Promise<ParentLinkRequest[]> => {
        const requests = await studentService.getParentRequests();
        return requests.filter(r => r.status === 'pending');
    },

    /**
     * Accept a parent link request
     */
    acceptParentRequest: async (requestId: number): Promise<ParentLinkRequest> => {
        const response = await apiClient.put(
            endpoints.student.parentRequests.updateStatus(requestId),
            { status: 'accepted' }
        );
        return response.data.data;
    },

    /**
     * Reject a parent link request
     */
    rejectParentRequest: async (requestId: number, reason?: string): Promise<ParentLinkRequest> => {
        const response = await apiClient.put(
            endpoints.student.parentRequests.updateStatus(requestId),
            { status: 'rejected', response_message: reason }
        );
        return response.data.data;
    },

    // ============================================================
    // Schedule Methods
    // ============================================================

    /**
     * Get all scheduled lectures for the current student
     */
    getSchedules: async (): Promise<{
        id: number;
        student_id: number;
        lecture_id: number;
        scheduled_at: string;
        is_completed: boolean;
        lecture?: {
            id: number;
            title: string | { ar?: string; en?: string };
            description?: string | { ar?: string; en?: string };
            duration_minutes?: number;
            course?: {
                id: number;
                name: string | { ar?: string; en?: string };
            };
            teacher?: {
                id: number;
                name: string;
                image_path?: string;
            };
        };
        created_at: string;
        updated_at: string;
    }[]> => {
        const response = await apiClient.get(endpoints.schedules.list);
        return response.data.data || [];
    },

    /**
     * Create a new scheduled lecture
     */
    createSchedule: async (data: {
        lecture_id: number;
        scheduled_at: string;
    }): Promise<{
        id: number;
        student_id: number;
        lecture_id: number;
        scheduled_at: string;
        is_completed: boolean;
        created_at: string;
        updated_at: string;
    }> => {
        const response = await apiClient.post(endpoints.schedules.create, data);
        return response.data.data || response.data;
    },

    /**
     * Update a scheduled lecture
     */
    updateSchedule: async (
        id: number,
        data: { scheduled_at?: string }
    ): Promise<{
        id: number;
        student_id: number;
        lecture_id: number;
        scheduled_at: string;
        is_completed: boolean;
        created_at: string;
        updated_at: string;
    }> => {
        const response = await apiClient.patch(endpoints.schedules.update(id), data);
        return response.data.data || response.data;
    },

    /**
     * Get system public settings
     */
    getSystemSettings: async (): Promise<Record<string, string>> => {
        try {
            const response = await apiClient.get(endpoints.settings.public.list);
            const settingsList = response.data.data || response.data || [];

            // Convert array of settings to object key-value pairs
            // Assuming response is [{key: 'k', value: 'v'}, ...]
            const settingsMap: Record<string, string> = {};

            if (Array.isArray(settingsList)) {
                settingsList.forEach((setting: any) => {
                    if (setting.key && setting.value) {
                        settingsMap[setting.key] = setting.value;
                    }
                });
            } else if (typeof settingsList === 'object') {
                // Handle case where it might already be an object
                return settingsList;
            }

            return settingsMap;
        } catch (error) {
            console.error('Error fetching system settings:', error);
            return {};
        }
    },

    /**
     * Mark a scheduled lecture as completed
     */
    completeSchedule: async (id: number): Promise<{
        id: number;
        is_completed: boolean;
    }> => {
        const response = await apiClient.patch(endpoints.schedules.complete(id));
        return response.data.data || response.data;
    },

    /**
     * Delete a scheduled lecture
     */
    deleteSchedule: async (id: number): Promise<{ success: boolean }> => {
        const response = await apiClient.delete(endpoints.schedules.delete(id));
        return response.data;
    },

    // ============================================================
    // BBB Session Methods
    // ============================================================

    joinSession: async (lectureId: number): Promise<{ success: boolean; join_url: string; message?: string }> => {
        const response = await apiClient.get(`/api/v1/lectures/${lectureId}/bbb/join`);
        return response.data;
    },

    getMeetingStatus: async (lectureId: number): Promise<{ is_live: boolean; status: string }> => {
        const response = await apiClient.get(`/api/v1/lectures/${lectureId}/bbb/status`);
        return response.data;
    },

    // ============================================================
    // Quiz Methods
    // ============================================================

    /**
     * Get all quiz attempts for the authenticated student
     */
    getQuizAttempts: async (): Promise<QuizAttempt[]> => {
        const response = await apiClient.get('/api/v1/student/attempts');
        return response.data.data || [];
    },

    // ============================================================
    // Missed Tasks
    // ============================================================

    /**
     * Get missed lectures and quizzes for the authenticated student.
     * @param days Number of days to look back (1-30, default 7)
     */
    getMissedTasks: async (days: number = 7): Promise<MissedTasksResponse> => {
        try {
            const response = await apiClient.get(endpoints.student.dashboard.missedTasks, {
                params: { days },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching missed tasks:', error);
            return {
                missed_lectures: [],
                missed_quizzes: [],
                total_missed: 0,
                period_days: days,
            };
        }
    },
};

export interface QuizAttempt {
    id: number;
    quiz_id: number;
    quiz_title: string | { ar?: string; en?: string };
    course_name?: string | { ar?: string; en?: string };
    score: number | null; // null if pending grading
    total_possible_score: number;
    passing_percentage: number;
    status: 'passed' | 'failed' | 'pending_grading';
    started_at: string;
    completed_at: string;
}

export default studentService;
