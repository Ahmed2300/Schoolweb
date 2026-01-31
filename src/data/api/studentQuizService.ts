import apiClient from './ApiClient';
import { getLocalizedName } from './studentService';

export interface QuizOption {
    id: number;
    option_text: string | { ar?: string; en?: string };
    option_image_url?: string | null;
}

export interface QuizQuestion {
    id: number;
    question_text: string | { ar?: string; en?: string };
    question_type: 'mcq' | 'essay' | 'true_false';
    points: number;
    options?: QuizOption[];
    order: number;
    question_image_url?: string | null;
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

// Individual question review result (after quiz completion)
export interface QuizReviewQuestion {
    question_id: number;
    question_text: MultiLangString;
    question_image_url?: string | null;
    question_type: 'mcq' | 'essay' | 'true_false';
    points: number;
    user_answer: number | string | null; // option_id for MCQ, text for essay
    user_answer_image_url?: string | null;
    earned_points: number | null;
    is_correct: boolean | null;
    // MCQ specific
    options?: QuizOption[];
    correct_option_id?: number | null;
    // Essay specific
    is_graded?: boolean;
    model_answer?: MultiLangString | string;
}

// Completed attempt data returned when already_completed is true
export interface CompletedQuizAttempt {
    id: number;
    score: number | null;
    total_possible_score: number;
    completed_at: string;
    status: 'passed' | 'failed' | 'pending_grading';
    is_fully_graded: boolean;
    results: QuizReviewQuestion[];
}

// Next item in syllabus for sequential navigation
export interface NextSyllabusItem {
    type: 'lecture' | 'quiz';
    id: number;
    name: MultiLangString;
}

// Response when quiz is already completed
export interface CompletedQuizResponse {
    already_completed: true;
    message: string;
    quiz: {
        id: number;
        name: MultiLangString;
        duration_minutes: number;
        course_id?: number;
    };
    attempt: CompletedQuizAttempt;
    next_item?: NextSyllabusItem | null;
}

// Standard quiz result after submission
export interface QuizResult {
    attempt_id: number;
    score: number | null;
    total_possible_score: number;
    status: 'passed' | 'failed' | 'pending_grading';
    is_fully_graded: boolean;
    results: QuizReviewQuestion[];
    passing_percentage?: number;
    message?: string;
}

export interface QuizAttemptSummary {
    id: number;
    quiz_id: number;
    quiz_title: { ar?: string; en?: string };
    course_name: { ar?: string; en?: string } | null;
    score: number | null;
    total_possible_score: number;
    passing_percentage: number;
    status: 'passed' | 'failed' | 'pending_grading';
    started_at: string;
    completed_at: string;
}

export const studentQuizService = {
    /**
     * Get Quiz Details or Completed Quiz Result
     * Returns either QuizDetails (for new quiz) or CompletedQuizResponse (if already completed)
     */
    getQuiz: async (quizId: number | string): Promise<{
        success: boolean;
        already_completed?: boolean;
        message?: string;
        data: QuizDetails | CompletedQuizResponse['quiz'];
        attempt?: CompletedQuizAttempt;
        next_item?: NextSyllabusItem | null;
        attempt_id?: number;
        started_at?: string;
    }> => {
        const response = await apiClient.get(`/api/v1/student/quizzes/${quizId}`);
        const raw = response.data;

        // Backend returns { data: { quiz: {...}, attempt: {...}, next_item: {...} } } when already_completed
        // We need to restructure this to match our expected interface
        if (raw.already_completed && raw.data?.attempt) {
            return {
                success: raw.success,
                already_completed: true,
                message: raw.message,
                data: raw.data.quiz, // Extract quiz from nested data
                attempt: raw.data.attempt, // Extract attempt from nested data
                next_item: raw.data.next_item || null, // Extract next_item
            };
        }

        // For new quizzes, return as-is
        return raw;
    },

    /**
     * Submit Quiz Attempt
     */
    submitQuiz: async (quizId: number | string, submission: QuizSubmission): Promise<{ success: boolean; data: QuizResult }> => {
        const response = await apiClient.post(`/api/v1/student/quizzes/${quizId}/submit`, submission);
        return response.data;
    },

    /**
     * Get quiz result for a specific quiz (if completed)
     */
    getQuizResult: async (quizId: number | string): Promise<{ success: boolean; data: QuizResult }> => {
        const response = await apiClient.get(`/api/v1/student/quizzes/${quizId}/result`);
        return response.data;
    },

    /**
     * Get all quiz attempts for current student
     */
    getMyAttempts: async (): Promise<QuizAttemptSummary[]> => {
        const response = await apiClient.get('/api/v1/student/attempts');
        return response.data.data || [];
    },
};
