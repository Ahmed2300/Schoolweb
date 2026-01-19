/**
 * Teacher Service
 * 
 * Handles teacher-specific operations including course management.
 * This service is for authenticated teacher operations (not auth flows).
 * For authentication, use teacherAuthService.ts
 */

import apiClient from './ApiClient';
import { endpoints } from './endpoints';

// ==================== TYPES ====================

export interface TeacherCourse {
    id: number;
    name: string | { ar?: string; en?: string };
    description?: string | { ar?: string; en?: string };
    image_path?: string | null;
    price?: number;
    discount_price?: number;
    is_active: boolean;
    is_academic: boolean;
    teacher_id: number;
    subject_id?: number;
    grade_id?: number;
    semester_id?: number;
    students_count?: number;
    lectures_count?: number;
    status?: 'active' | 'draft' | 'archived';
    created_at?: string;
    updated_at?: string;
    // Related data
    subject?: {
        id: number;
        name: string | { ar?: string; en?: string };
    };
    grade?: {
        id: number;
        name: string;
    };
    semester?: {
        id: number;
        name: string;
    };
}

export interface TeacherCoursesResponse {
    data: TeacherCourse[];
    links?: {
        first?: string;
        last?: string;
        prev?: string | null;
        next?: string | null;
    };
    meta?: {
        current_page: number;
        from: number;
        last_page: number;
        per_page: number;
        to: number;
        total: number;
    };
}

export interface CreateCourseRequest {
    name: string | { ar: string; en?: string };
    description?: string | { ar?: string; en?: string };
    price?: number;
    discount_price?: number;
    subject_id?: number;
    grade_id?: number;
    semester_id?: number;
    image?: File;
}

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {
    is_active?: boolean;
}

export interface CourseFilters {
    status?: 'active' | 'draft' | 'archived';
    search?: string;
    per_page?: number;
    page?: number;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Extract localized name from course name field
 */
export const getCourseName = (name: string | { ar?: string; en?: string }): string => {
    if (typeof name === 'string') return name;
    return name.ar || name.en || '';
};

/**
 * Extract localized description from course description field
 */
export const getCourseDescription = (description?: string | { ar?: string; en?: string }): string => {
    if (!description) return '';
    if (typeof description === 'string') return description;
    return description.ar || description.en || '';
};

// ==================== SERVICE ====================

export const teacherService = {
    /**
     * Get list of courses owned by the authenticated teacher
     */
    getMyCourses: async (filters?: CourseFilters): Promise<TeacherCoursesResponse> => {
        const params = new URLSearchParams();

        if (filters?.status) params.append('status', filters.status);
        if (filters?.search) params.append('search', filters.search);
        if (filters?.per_page) params.append('per_page', filters.per_page.toString());
        if (filters?.page) params.append('page', filters.page.toString());

        const queryString = params.toString();
        const url = queryString
            ? `${endpoints.teacher.myCourses.list}?${queryString}`
            : endpoints.teacher.myCourses.list;

        const response = await apiClient.get(url);
        return response.data;
    },

    /**
     * Get a single course by ID (must belong to authenticated teacher)
     */
    getCourse: async (id: number): Promise<TeacherCourse> => {
        const response = await apiClient.get(endpoints.teacher.myCourses.show(id));
        return response.data.data ?? response.data;
    },

    /**
     * Create a new course for the authenticated teacher
     * Note: Backend auto-sets teacher_id and is_active=false
     */
    createCourse: async (data: CreateCourseRequest): Promise<TeacherCourse> => {
        const formData = new FormData();

        // Handle name (can be string or object)
        if (typeof data.name === 'string') {
            formData.append('name', data.name);
        } else {
            if (data.name.ar) formData.append('name[ar]', data.name.ar);
            if (data.name.en) formData.append('name[en]', data.name.en);
        }

        // Handle description
        if (data.description) {
            if (typeof data.description === 'string') {
                formData.append('description', data.description);
            } else {
                if (data.description.ar) formData.append('description[ar]', data.description.ar);
                if (data.description.en) formData.append('description[en]', data.description.en);
            }
        }

        // Append other fields
        if (data.price !== undefined) formData.append('price', data.price.toString());
        if (data.discount_price !== undefined) formData.append('discount_price', data.discount_price.toString());
        if (data.subject_id) formData.append('subject_id', data.subject_id.toString());
        if (data.grade_id) formData.append('grade_id', data.grade_id.toString());
        if (data.semester_id) formData.append('semester_id', data.semester_id.toString());
        if (data.image) formData.append('image', data.image);

        const response = await apiClient.post(endpoints.teacher.myCourses.create, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        return response.data.data ?? response.data;
    },

    /**
     * Update an existing course (must belong to authenticated teacher)
     */
    updateCourse: async (id: number, data: UpdateCourseRequest): Promise<TeacherCourse> => {
        const formData = new FormData();

        // Handle name
        if (data.name) {
            if (typeof data.name === 'string') {
                formData.append('name', data.name);
            } else {
                if (data.name.ar) formData.append('name[ar]', data.name.ar);
                if (data.name.en) formData.append('name[en]', data.name.en);
            }
        }

        // Handle description
        if (data.description) {
            if (typeof data.description === 'string') {
                formData.append('description', data.description);
            } else {
                if (data.description.ar) formData.append('description[ar]', data.description.ar);
                if (data.description.en) formData.append('description[en]', data.description.en);
            }
        }

        // Append other fields
        if (data.price !== undefined) formData.append('price', data.price.toString());
        if (data.discount_price !== undefined) formData.append('discount_price', data.discount_price.toString());
        if (data.subject_id) formData.append('subject_id', data.subject_id.toString());
        if (data.grade_id) formData.append('grade_id', data.grade_id.toString());
        if (data.semester_id) formData.append('semester_id', data.semester_id.toString());
        if (data.is_active !== undefined) formData.append('is_active', data.is_active ? '1' : '0');
        if (data.image) formData.append('image', data.image);

        // Laravel needs _method for PUT with FormData
        formData.append('_method', 'PUT');

        const response = await apiClient.post(endpoints.teacher.myCourses.update(id), formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        return response.data.data ?? response.data;
    },

    /**
     * Delete a course (must belong to authenticated teacher)
     */
    deleteCourse: async (id: number): Promise<void> => {
        await apiClient.delete(endpoints.teacher.myCourses.delete(id));
    },

    /**
     * Get dashboard statistics for the authenticated teacher
     * Currently aggregates from courses data since no dedicated endpoint exists
     */
    getDashboardStats: async (): Promise<{
        totalCourses: number;
        activeCourses: number;
        totalStudents: number;
        totalLectures: number;
    }> => {
        // Fetch all courses to calculate stats
        const response = await teacherService.getMyCourses({ per_page: 100 });
        const courses = response.data || [];

        const totalCourses = courses.length;
        const activeCourses = courses.filter(c => c.is_active).length;
        const totalStudents = courses.reduce((sum, c) => sum + (c.students_count || 0), 0);
        const totalLectures = courses.reduce((sum, c) => sum + (c.lectures_count || 0), 0);

        return {
            totalCourses,
            activeCourses,
            totalStudents,
            totalLectures,
        };
    },
};

export default teacherService;
