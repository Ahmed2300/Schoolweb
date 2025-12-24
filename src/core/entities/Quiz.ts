// Quiz entity with MCQ and manual types
export interface Quiz {
    id: string;
    lessonId?: string;
    courseId: string;
    title: string;
    description?: string;
    type: QuizType;
    duration: number; // in minutes
    totalPoints: number;
    passingScore: number;
    questionsCount: number;
    attemptsAllowed: number;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type QuizType = 'mcq' | 'manual';

export interface Question {
    id: string;
    quizId: string;
    text: string;
    type: QuestionType;
    points: number;
    order: number;
    options?: QuestionOption[];
    correctAnswer?: string;
}

export type QuestionType = 'single-choice' | 'multiple-choice' | 'text' | 'essay';

export interface QuestionOption {
    id: string;
    text: string;
    isCorrect: boolean;
}

export interface QuizAttempt {
    id: string;
    quizId: string;
    studentId: string;
    answers: Answer[];
    score?: number;
    status: 'in-progress' | 'submitted' | 'graded';
    startedAt: Date;
    submittedAt?: Date;
    gradedAt?: Date;
}

export interface Answer {
    questionId: string;
    selectedOptionIds?: string[];
    textAnswer?: string;
    points?: number;
    feedback?: string;
}
