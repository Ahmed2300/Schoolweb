import apiClient from './ApiClient';
import { getLocalizedName } from './studentService';

export interface QuizOption {
    id: number;
    option_text: string | { ar?: string; en?: string };
}

export interface QuizQuestion {
    id: number;
    question_text: string | { ar?: string; en?: string };
    question_type: 'mcq' | 'essay' | 'true_false';
    points: number;
    options?: QuizOption[];
    order: number;
}

export interface MultiLangString {
    ar?: string;
    en?: string;
}

export interface QuizDetails {
    id: number;
    title: string | MultiLangString;
    description?: string | MultiLangString;
    duration_minutes: number;
    passing_percentage: number;
    questions_count: number;
    questions?: QuizQuestion[];
    is_active: boolean;
}

export interface QuizSubmission {
    answers: {
        question_id: number;
        selected_option_id?: number;
        essay_answer?: string;
    }[];
}

export interface QuizResult {
    attempt_id: number;
    score: number;
    total_possible_score: number;
    status: 'passed' | 'failed';
    results: {
        question_id: number;
        earned_points: number;
        is_correct?: boolean;
        correct_option_id?: number;
        user_answer?: any;
    }[];
}

export const studentQuizService = {
    /**
     * Get Quiz Details (with questions for student)
     */
    getQuiz: async (quizId: number | string): Promise<QuizDetails> => {
        const response = await apiClient.get(`/api/v1/student/quizzes/${quizId}`);
        return response.data.data || response.data;
    },

    /**
     * Submit Quiz Attempt
     */
    submitQuiz: async (quizId: number | string, submission: QuizSubmission): Promise<{ success: boolean; data: QuizResult }> => {
        const response = await apiClient.post(`/api/v1/student/quizzes/${quizId}/submit`, submission);
        return response.data;
    }
};
