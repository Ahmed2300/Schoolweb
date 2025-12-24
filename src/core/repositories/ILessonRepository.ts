import type { Lesson, LiveSession, Attachment } from '../entities';

export interface ILessonRepository {
    getLessonsByCourse(courseId: string): Promise<Lesson[]>;
    getLessonById(id: string): Promise<Lesson>;
    getVideoUrl(lessonId: string): Promise<string>; // Returns signed URL
    markAsWatched(lessonId: string, userId: string, progress: number): Promise<void>;
    getWatchProgress(lessonId: string, userId: string): Promise<number>;

    // Teacher methods
    createLesson(data: Partial<Lesson>): Promise<Lesson>;
    updateLesson(id: string, data: Partial<Lesson>): Promise<Lesson>;
    deleteLesson(id: string): Promise<void>;
    uploadVideo(lessonId: string, file: File): Promise<string>;
    addAttachment(lessonId: string, file: File): Promise<Attachment>;
    removeAttachment(lessonId: string, attachmentId: string): Promise<void>;
    reorderLessons(courseId: string, lessonIds: string[]): Promise<void>;
}

export interface ILiveSessionRepository {
    getUpcomingSessions(userId: string): Promise<LiveSession[]>;
    getSessionById(id: string): Promise<LiveSession>;
    joinSession(sessionId: string): Promise<{ meetingUrl: string; token: string }>;

    // Teacher/Admin methods
    scheduleSession(data: Partial<LiveSession>): Promise<LiveSession>;
    updateSession(id: string, data: Partial<LiveSession>): Promise<LiveSession>;
    cancelSession(id: string): Promise<void>;
    startSession(id: string): Promise<LiveSession>;
    endSession(id: string): Promise<void>;
}
