/**
 * Teacher Service
 * 
 * Handles teacher-specific operations including course management.
 * This service is for authenticated teacher operations (not auth flows).
 * For authentication, use teacherAuthService.ts
 */

import apiClient from './ApiClient';
import { endpoints } from './endpoints';
import type { TimeSlot } from '../../types/timeSlot';
import type { CreateUnitRequest, UpdateUnitRequest, Unit } from '../../types/unit';

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
    rating?: number;
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

export interface TeacherCourseStudent {
    id: number;
    name: string;
    email: string;
    phone: string;
    avatar: string | null;
    subscribed_at: string;
    subscription_id: number;
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
export const getCourseName = (name: string | { ar?: string; en?: string } | null | undefined): string => {
    if (!name && typeof name !== 'string') return '';
    if (typeof name === 'string') return name;
    return name?.ar || name?.en || '';
};

/**
 * Extract localized description from course description field
 */
export const getCourseDescription = (description?: string | { ar?: string; en?: string }): string => {
    if (!description && typeof description !== 'string') return '';
    if (typeof description === 'string') return description;
    return description?.ar || description?.en || '';
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
     * Get lectures for a specific course
     */
    getCourseLectures: async (courseId: number): Promise<any[]> => {
        const response = await apiClient.get(endpoints.lectures.list, {
            params: { course_id: courseId }
        });
        return response.data.data;
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

    /**
     * Get enrolled students for a specific course
     */
    getCourseStudents: async (courseId: number): Promise<{ success: boolean; data: TeacherCourseStudent[]; count: number }> => {
        const response = await apiClient.get(endpoints.teacher.myCourses.students(courseId));
        return response.data;
    },

    // ==================== UNIT MANAGEMENT ====================

    getUnits: async (courseId: number): Promise<{ success: boolean; data: Unit[] }> => {
        const response = await apiClient.get(endpoints.teacher.myCourses.units.list(courseId));
        return response.data;
    },

    createUnit: async (courseId: number, data: CreateUnitRequest): Promise<Unit> => {
        const response = await apiClient.post(endpoints.teacher.myCourses.units.create(courseId), data);
        return response.data.data;
    },

    updateUnit: async (courseId: number, unitId: number, data: UpdateUnitRequest): Promise<Unit> => {
        const response = await apiClient.put(endpoints.teacher.myCourses.units.update(courseId, unitId), data);
        return response.data.data;
    },

    deleteUnit: async (courseId: number, unitId: number): Promise<void> => {
        await apiClient.delete(endpoints.teacher.myCourses.units.delete(courseId, unitId));
    },

    reorderUnits: async (courseId: number, order: number[]): Promise<void> => {
        await apiClient.post(endpoints.teacher.myCourses.units.reorder(courseId), { order });
    },

    reorderLectures: async (courseId: number, unitId: number, order: number[]): Promise<void> => {
        await apiClient.post(endpoints.teacher.myCourses.units.reorderLectures(courseId, unitId), { order });
    },

    reorderContent: async (courseId: number, unitId: number, items: { id: number; type: 'lecture' | 'quiz' }[]): Promise<void> => {
        await apiClient.post(endpoints.teacher.myCourses.units.reorderContent(courseId, unitId), { items });
    },

    // ==================== TIME SLOTS ====================

    /**
     * Get available time slots for booking
     */
    getAvailableSlots: async (date?: string): Promise<TimeSlot[]> => {
        const params = new URLSearchParams();
        if (date) params.append('date', date);

        const response = await apiClient.get(`${endpoints.teacher.timeSlots.available}?${params.toString()}`);
        return response.data.data;
    },

    /**
     * Get available revision slots (from revision semesters)
     */
    getRevisionSlots: async (): Promise<TimeSlot[]> => {
        const params = new URLSearchParams();
        params.append('type', 'revision');

        const response = await apiClient.get(`${endpoints.teacher.timeSlots.available}?${params.toString()}`);
        return response.data.data;
    },

    /**
     * Get teacher's slot requests (history)
     */
    getMyRequests: async (): Promise<TimeSlot[]> => {
        const response = await apiClient.get(endpoints.teacher.timeSlots.myRequests);
        return response.data.data;
    },

    /**
     * Request a specific time slot
     */
    requestSlot: async (id: number, lectureId: number, notes?: string): Promise<TimeSlot> => {
        const response = await apiClient.post(endpoints.teacher.timeSlots.request(id), {
            lecture_id: lectureId,
            notes,
        });
        return response.data.data;
    },

    /**
     * Cancel a pending slot request
     */
    cancelRequest: async (id: number): Promise<void> => {
        await apiClient.post(endpoints.teacher.timeSlots.cancel(id));
    },

    /**
     * Cancel all pending slot requests
     */
    cancelAllRequests: async (): Promise<{ count: number }> => {
        const response = await apiClient.post(endpoints.teacher.timeSlots.cancelAll);
        return response.data;
    },

    /**
     * Get details of a specific slot request
     */
    getSlotRequest: async (id: number): Promise<TimeSlot> => {
        const response = await apiClient.get(endpoints.teacher.timeSlots.show(id));
        return response.data.data;
    },

    // ==================== RECURRING SCHEDULE (Slots 2.0) ====================

    /**
     * Get grades assigned to the authenticated teacher
     */
    getAssignedGrades: async (): Promise<{ success: boolean; data: { id: number; name: string }[] }> => {
        const response = await apiClient.get(endpoints.teacher.recurringSchedule.assignedGrades);
        return response.data;
    },

    /**
     * Get weekly configuration for a grade/semester (day tabs status)
     */
    getWeekConfig: async (gradeId: number, semesterId: number): Promise<{
        success: boolean;
        data: {
            day: string;
            is_active: boolean;
            mode: 'individual' | 'multiple';
            my_bookings_count: number;
            is_locked: boolean;
        }[];
    }> => {
        const response = await apiClient.get(endpoints.teacher.recurringSchedule.weekConfig, {
            params: { grade_id: gradeId, semester_id: semesterId }
        });
        return response.data;
    },

    /**
     * Get available recurring slots for a specific day
     */
    getAvailableRecurringSlots: async (gradeId: number, semesterId: number, day: string): Promise<{
        success: boolean;
        data: {
            start: string;
            end: string;
            is_available: boolean;
            is_mine: boolean;
            slot_id?: number;
        }[];
    }> => {
        const response = await apiClient.get(endpoints.teacher.recurringSchedule.availableSlots, {
            params: { grade_id: gradeId, semester_id: semesterId, day }
        });
        return response.data;
    },

    /**
     * Submit a recurring slot booking
     */
    submitRecurringSlot: async (data: {
        grade_id: number;
        semester_id: number;
        day_of_week: string;
        start_time: string;
        end_time: string;
        lecture_id?: number;
    }): Promise<{ success: boolean; message: string; data: unknown }> => {
        const response = await apiClient.post(endpoints.teacher.recurringSchedule.submitSlot, data);
        return response.data;
    },

    /**
     * Get Teacher Slots Requests (New System)
     */
    getSlotRequests: async (): Promise<import('../../types/slotRequest').SlotRequestsResponse> => {
        const response = await apiClient.get(endpoints.teacher.slotRequests.list);
        return response.data;
    },

    /**
     * Get approved one-time slot requests
     */
    getApprovedOneTimeSlots: async (): Promise<import('../../types/slotRequest').SlotRequestsResponse> => {
        const response = await apiClient.get(endpoints.teacher.slotRequests.list, {
            params: {
                type: 'one_time',
                status: 'approved'
            }
        });
        return response.data;
    },

    /**
     * Get teacher's recurring schedule
     */
    getMyRecurringSchedule: async (semesterId?: number): Promise<{
        success: boolean;
        data: {
            id: number;
            grade_id: number;
            semester_id: number;
            day_of_week: string;
            start_time: string;
            end_time: string;
            status: 'pending' | 'approved' | 'rejected';
            grade?: { id: number; name: string };
            semester?: { id: number; name: string };
            lecture?: { id: number; title: string };
        }[];
    }> => {
        const params = semesterId ? { semester_id: semesterId } : {};
        const response = await apiClient.get(endpoints.teacher.recurringSchedule.mySchedule, { params });
        return response.data;
    },

    /**
     * Cancel a recurring slot
     */
    cancelRecurringSlot: async (slotId: number): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.post(endpoints.teacher.recurringSchedule.cancelSlot, { slot_id: slotId });
        return response.data;
    },

    /**
     * Get upcoming schedule for dashboard
     */
    getUpcomingSchedule: async (): Promise<any[]> => {
        // Fetch approved time slots or lectures
        // For now, we'll fetch confirmed time slots
        const response = await apiClient.get(endpoints.teacher.timeSlots.myRequests);
        const slots: TimeSlot[] = response.data.data || [];

        // Filter for future slots and approved ones
        const now = new Date();
        const upcoming = slots.filter(slot => {
            if (!slot.date || !slot.start_time) return false;
            const slotDate = new Date(`${slot.date}T${slot.start_time}`);
            return slotDate > now && slot.status === 'approved';
        });

        // Sort by date
        return upcoming.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.start_time}`).getTime();
            const dateB = new Date(`${b.date}T${b.start_time}`).getTime();
            return dateA - dateB;
        }).slice(0, 5); // Return top 5
    },
};

export default teacherService;
