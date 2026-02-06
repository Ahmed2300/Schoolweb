/**
 * Parent API Service
 * 
 * Service functions for parent dashboard API calls.
 * Includes student search, linking requests, and report functions.
 */

import apiClient from './ApiClient';
import { endpoints } from './endpoints';

// ============================================================
// Types
// ============================================================

export interface ParentProfile {
    id: number;
    name: string;
    email: string;
    phone?: string;
    image_path?: string;
    address?: string;
    relationship?: string;
    email_verified_at?: string;
    created_at?: string;
    updated_at?: string;
}

/** Student info returned from search (minimal) */
export interface StudentSearchResult {
    id: number;
    uid: string;
    name: string;
    grade?: string;
    image_url?: string | null;
    has_parent: boolean;
}

/** Parent-Student Link Request */
export interface ParentStudentRequest {
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
    // Nested relations
    student?: {
        id: number;
        uid: string;
        name: string;
        grade?: string;
        image_path?: string;
    };
}

/** Linked student (from reports) */
export interface LinkedStudent {
    id: number;
    uid: string;
    name: string;
    email: string;
    grade?: string;
    image_path?: string;
    avatar?: string;
    phone?: string;
    date_of_birth?: string;
    // Report data
    attendance?: number;
    gpa?: string;
    ranking?: number;
    overall_average_score?: number;
    // Courses/Subjects data
    subjects?: Array<{
        id: number;
        name: string;
        teacher: string;
        is_academic?: boolean;
        image?: string;
        score?: number;
        grade?: string;
        feedback?: string;
        progress?: number;
        assignments?: { total: number; completed: number };
        subscription_status?: string;
        subscription_status_key?: string;
        is_active?: boolean;
        start_date?: string;
        end_date?: string;
    }>;
    total_subscriptions?: number;
    active_subscriptions?: number;
    quizzes?: Array<{
        quiz_title: string;
        score: number;
        total_possible_score: number;
        passing_percentage: number;
        status: 'passed' | 'failed' | 'completed';
        completed_at: string;
    }>;
}

// ============================================================
// Service
// ============================================================

export const parentService = {
    // ============================================================
    // Profile
    // ============================================================

    /**
     * Get current parent profile
     */
    getProfile: async (): Promise<ParentProfile> => {
        const response = await apiClient.get(endpoints.parentAuth.me);
        return response.data.data || response.data;
    },

    /**
     * Update parent profile
     */
    updateProfile: async (data: Partial<ParentProfile>): Promise<ParentProfile> => {
        const response = await apiClient.put(endpoints.parentAuth.updateProfile, data);
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
        const response = await apiClient.post(endpoints.parentAuth.changePassword, data);
        return response.data;
    },

    // ============================================================
    // Student Linking
    // ============================================================

    /**
     * Search for a student by UID
     * Returns minimal info for confirmation before sending request
     */
    searchStudent: async (uid: string): Promise<StudentSearchResult> => {
        const response = await apiClient.post(endpoints.parent.searchStudent, { uid });
        return response.data.data;
    },

    /**
     * Send a link request to a student
     */
    sendLinkRequest: async (studentId: number, message?: string): Promise<ParentStudentRequest> => {
        const response = await apiClient.post(endpoints.parent.studentRequests.create, {
            student_id: studentId,
            message,
        });
        return response.data.data;
    },

    /**
     * Get all link requests for the current parent
     */
    getLinkRequests: async (): Promise<ParentStudentRequest[]> => {
        const response = await apiClient.get(endpoints.parent.studentRequests.list);
        return response.data.data || [];
    },

    /**
     * Get pending link requests only
     */
    getPendingRequests: async (): Promise<ParentStudentRequest[]> => {
        const requests = await parentService.getLinkRequests();
        return requests.filter(r => r.status === 'pending');
    },

    /**
     * Get a specific link request by ID
     */
    getLinkRequest: async (requestId: number): Promise<ParentStudentRequest> => {
        const response = await apiClient.get(endpoints.parent.studentRequests.show(requestId));
        return response.data.data;
    },

    /**
     * Cancel a pending link request
     */
    cancelRequest: async (requestId: number): Promise<ParentStudentRequest> => {
        const response = await apiClient.put(
            endpoints.parent.studentRequests.updateStatus(requestId),
            { status: 'cancelled' }
        );
        return response.data.data;
    },

    // ============================================================
    // Linked Students & Reports
    // ============================================================

    /**
     * Get all students linked to this parent
     */
    getLinkedStudents: async (): Promise<LinkedStudent[]> => {
        const response = await apiClient.get(endpoints.parent.reports.students);
        return response.data.data || [];
    },

    /**
     * Get detailed report for a specific linked student
     */
    getStudentReport: async (studentId: number): Promise<unknown> => {
        const response = await apiClient.get(endpoints.parent.reports.studentDetail(studentId));
        return response.data.data;
    },

    /**
     * Unlink a student from the parent's account
     */
    unlinkStudent: async (studentId: number): Promise<void> => {
        await apiClient.delete(endpoints.parent.unlinkStudent(studentId));
    },

    // ============================================================
    // Auth
    // ============================================================

    /**
     * Logout current session
     */
    logout: async (): Promise<void> => {
        await apiClient.post(endpoints.parentAuth.logout);
    },

    /**
     * Logout all sessions
     */
    logoutAll: async (): Promise<void> => {
        await apiClient.post(endpoints.parentAuth.logoutAll);
    },
};

export default parentService;
