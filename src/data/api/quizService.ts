/**
 * Quiz Service - API functions for teacher quiz management
 * Handles CRUD operations for quizzes with admin approval workflow
 */

import apiClient from './ApiClient';
import { endpoints } from './endpoints';

// ==================== TYPES ====================

export type QuizType = 'mcq' | 'essay';
export type QuizStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface QuizOption {
    id?: number;
    option_text: { en?: string; ar?: string };
    is_correct: boolean;
    option_image?: File | null;
    option_image_url?: string | null;
}

export interface QuizQuestion {
    id?: number;
    question_text: { en?: string; ar?: string };
    question_type: 'mcq' | 'essay';
    points: number;
    model_answer?: { en?: string; ar?: string };
    options?: QuizOption[];
    question_image?: File | null;
    question_image_url?: string | null;
}

export interface Quiz {
    id: number;
    name: { en?: string; ar?: string };
    description?: { en?: string; ar?: string };
    quiz_type: QuizType;
    course_id: number;
    unit_id?: number | null;
    lecture_id?: number | null;
    teacher_id: number;
    duration_minutes: number;
    passing_percentage: number;
    is_active: boolean;
    status?: QuizStatus;
    questions_count?: number;
    created_at?: string;
    updated_at?: string;
    admin_feedback?: string;
    // Relations
    course?: {
        id: number;
        name: { en?: string; ar?: string };
    };
    unit?: {
        id: number;
        name: { en?: string; ar?: string };
    } | null;
    lecture?: {
        id: number;
        title: { en?: string; ar?: string };
    } | null;
    questions?: QuizQuestion[];
}

export interface CreateQuizData {
    name: { en?: string; ar?: string };
    description?: { en?: string; ar?: string };
    quiz_type: QuizType;
    course_id: number;
    unit_id?: number | null;
    lecture_id?: number | null;
    duration_minutes?: number;
    passing_percentage?: number;
    submit_for_approval?: boolean; // Added flag
    questions: Array<{
        question_text: { en?: string; ar?: string };
        question_type: 'mcq' | 'essay';
        points?: number;
        model_answer?: { en?: string; ar?: string };
        model_answer_image?: File | null;
        question_image?: File | null;
        options?: Array<{
            option_text: { en?: string; ar?: string };
            is_correct: boolean;
            option_image?: File | null;
        }>;
    }>;
}

export interface UpdateQuizData extends Partial<CreateQuizData> {
    is_active?: boolean;
}

export interface QuizzesListParams {
    course_id?: number;
    quiz_type?: QuizType;
    status?: QuizStatus;
}

export interface QuizzesResponse {
    success: boolean;
    data: Quiz[];
}

export interface QuizResponse {
    success: boolean;
    data: Quiz;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Get quiz name in current locale or fallback
 */
export function getQuizName(name: { en?: string; ar?: string } | string): string {
    if (typeof name === 'string') return name;
    return name?.ar || name?.en || 'اختبار بدون عنوان';
}

/**
 * Get quiz type label in Arabic
 */
export function getQuizTypeLabel(type: QuizType): string {
    return type === 'mcq' ? 'اختيار من متعدد' : 'أسئلة مكتوبة';
}

/**
 * Get status badge styling
 */
export function getQuizStatusStyle(status: QuizStatus): {
    label: string;
    bgClass: string;
    textClass: string;
} {
    switch (status) {
        case 'draft':
            return { label: 'مسودة', bgClass: 'bg-slate-100', textClass: 'text-slate-600' };
        case 'pending':
            return { label: 'في انتظار الموافقة', bgClass: 'bg-amber-100', textClass: 'text-amber-700' };
        case 'approved':
            return { label: 'معتمد', bgClass: 'bg-emerald-100', textClass: 'text-emerald-700' };
        case 'rejected':
            return { label: 'مرفوض', bgClass: 'bg-red-100', textClass: 'text-red-700' };
        default:
            return { label: 'غير معروف', bgClass: 'bg-slate-100', textClass: 'text-slate-600' };
    }
}

/**
 * Check if quiz data contains any images (question or option images)
 */
export function hasQuizImages(data: CreateQuizData): boolean {
    return data.questions.some(q =>
        q.question_image ||
        q.model_answer_image ||
        q.options?.some(o => o.option_image)
    );
}

/**
 * Build FormData for quiz creation/update with image support
 * Laravel expects nested array syntax: questions[0][question_text][ar]
 */
export function buildQuizFormData(data: CreateQuizData): FormData {
    const formData = new FormData();

    // Basic quiz fields
    formData.append('name[ar]', data.name.ar || '');
    formData.append('name[en]', data.name.en || '');
    formData.append('quiz_type', data.quiz_type);
    formData.append('course_id', String(data.course_id));

    if (data.description?.ar) formData.append('description[ar]', data.description.ar);
    if (data.description?.en) formData.append('description[en]', data.description.en);
    if (data.unit_id) formData.append('unit_id', String(data.unit_id));
    if (data.lecture_id) formData.append('lecture_id', String(data.lecture_id));
    if (data.duration_minutes) formData.append('duration_minutes', String(data.duration_minutes));
    if (data.passing_percentage) formData.append('passing_percentage', String(data.passing_percentage));
    if (data.submit_for_approval) formData.append('submit_for_approval', '1');

    // Questions array
    data.questions.forEach((question, qIdx) => {
        const qPrefix = `questions[${qIdx}]`;

        formData.append(`${qPrefix}[question_text][ar]`, question.question_text.ar || '');
        if (question.question_text.en) {
            formData.append(`${qPrefix}[question_text][en]`, question.question_text.en);
        }
        formData.append(`${qPrefix}[question_type]`, question.question_type);
        formData.append(`${qPrefix}[points]`, String(question.points || 1));

        if (question.model_answer?.ar) {
            formData.append(`${qPrefix}[model_answer][ar]`, question.model_answer.ar);
        }
        if (question.model_answer?.en) {
            formData.append(`${qPrefix}[model_answer][en]`, question.model_answer.en);
        }

        // Question image
        if (question.question_image) {
            formData.append(`${qPrefix}[question_image]`, question.question_image);
        }

        // Model answer image (essay questions)
        if (question.model_answer_image) {
            formData.append(`${qPrefix}[model_answer_image]`, question.model_answer_image);
        }

        // Options for MCQ
        if (question.options) {
            question.options.forEach((option, oIdx) => {
                const oPrefix = `${qPrefix}[options][${oIdx}]`;

                formData.append(`${oPrefix}[option_text][ar]`, option.option_text.ar || '');
                if (option.option_text.en) {
                    formData.append(`${oPrefix}[option_text][en]`, option.option_text.en);
                }
                formData.append(`${oPrefix}[is_correct]`, option.is_correct ? '1' : '0');

                // Option image
                if (option.option_image) {
                    formData.append(`${oPrefix}[option_image]`, option.option_image);
                }
            });
        }
    });

    return formData;
}

// ==================== API SERVICE ====================

export const quizService = {
    /**
     * Get all quizzes for the authenticated teacher
     * Optionally filter by course_id or quiz_type
     */
    async getQuizzes(params?: QuizzesListParams): Promise<QuizzesResponse> {
        const response = await apiClient.get<QuizzesResponse>(
            endpoints.teacher.quizzes.list,
            { params }
        );
        return response.data;
    },

    /**
     * Get a single quiz with questions and options
     */
    async getQuiz(id: number): Promise<QuizResponse> {
        const response = await apiClient.get<QuizResponse>(
            endpoints.teacher.quizzes.show(id)
        );
        return response.data;
    },

    /**
     * Create a new quiz with questions
     * Quiz starts in 'draft' status
     * Uses FormData for multipart upload when images are present
     */
    async createQuiz(data: CreateQuizData): Promise<QuizResponse> {
        // Check if any images are present
        if (hasQuizImages(data)) {
            const formData = buildQuizFormData(data);
            const response = await apiClient.post<QuizResponse>(
                endpoints.teacher.quizzes.create,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        }

        // No images - use standard JSON
        const response = await apiClient.post<QuizResponse>(
            endpoints.teacher.quizzes.create,
            data
        );
        return response.data;
    },

    /**
     * Update an existing quiz
     */
    async updateQuiz(id: number, data: UpdateQuizData): Promise<QuizResponse> {
        // Check if any images are present
        const hasImages = data.questions && hasQuizImages(data as CreateQuizData);

        if (hasImages) {
            const formData = buildQuizFormData(data as CreateQuizData);
            formData.append('_method', 'PUT');

            const response = await apiClient.post<QuizResponse>(
                endpoints.teacher.quizzes.update(id),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        }

        const response = await apiClient.put<QuizResponse>(
            endpoints.teacher.quizzes.update(id),
            data
        );
        return response.data;
    },

    /**
     * Delete a quiz
     */
    async deleteQuiz(id: number): Promise<{ success: boolean; message: string }> {
        const response = await apiClient.delete<{ success: boolean; message: string }>(
            endpoints.teacher.quizzes.delete(id)
        );
        return response.data;
    },

    /**
     * Submit quiz for admin approval
     * Changes status from 'draft' to 'pending'
     */
    async submitForApproval(id: number): Promise<QuizResponse> {
        // This could be a separate endpoint or use update
        const response = await apiClient.put<QuizResponse>(
            endpoints.teacher.quizzes.update(id),
            { status: 'pending' }
        );
        return response.data;
    },

    /**
     * Toggle quiz is_active status
     */
    async toggleActive(id: number): Promise<{ success: boolean; data: Quiz; message: string }> {
        const response = await apiClient.patch<{ success: boolean; data: Quiz; message: string }>(
            `/api/v1/teacher/quizzes/${id}/toggle-active`
        );
        return response.data;
    },
};

export default quizService;
