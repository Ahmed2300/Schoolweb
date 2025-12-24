import type { Quiz, Question, QuizAttempt, Answer } from '../entities';

export interface IQuizRepository {
    getQuizzesByCourse(courseId: string): Promise<Quiz[]>;
    getQuizById(id: string): Promise<Quiz>;
    getQuestions(quizId: string): Promise<Question[]>;

    // Student methods
    startAttempt(quizId: string): Promise<QuizAttempt>;
    submitAttempt(attemptId: string, answers: Answer[]): Promise<QuizAttempt>;
    getAttempts(quizId: string, userId: string): Promise<QuizAttempt[]>;
    getAttemptResult(attemptId: string): Promise<QuizAttempt>;

    // Teacher methods
    createQuiz(data: Partial<Quiz>): Promise<Quiz>;
    updateQuiz(id: string, data: Partial<Quiz>): Promise<Quiz>;
    deleteQuiz(id: string): Promise<void>;
    addQuestion(quizId: string, question: Partial<Question>): Promise<Question>;
    updateQuestion(questionId: string, data: Partial<Question>): Promise<Question>;
    deleteQuestion(questionId: string): Promise<void>;
    reorderQuestions(quizId: string, questionIds: string[]): Promise<void>;

    // Grading
    gradeAttempt(attemptId: string, grades: { questionId: string; points: number; feedback?: string }[]): Promise<QuizAttempt>;
    getPendingGrading(teacherId: string): Promise<QuizAttempt[]>;
}
