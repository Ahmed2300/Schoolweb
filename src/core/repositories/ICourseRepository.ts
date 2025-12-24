import type { Course, CourseDetails, CourseType } from '../entities';

export interface CourseFilters {
    type?: CourseType;
    gradeId?: string;
    termId?: string;
    category?: string;
    teacherId?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ICourseRepository {
    getCourses(filters?: CourseFilters): Promise<PaginatedResponse<Course>>;
    getCourseById(id: string): Promise<CourseDetails>;
    getEnrolledCourses(userId: string): Promise<Course[]>;
    getFeaturedCourses(): Promise<Course[]>;
    getRecommendedCourses(userId: string): Promise<Course[]>;
    searchCourses(query: string): Promise<Course[]>;

    // Teacher methods
    createCourse(data: Partial<Course>): Promise<Course>;
    updateCourse(id: string, data: Partial<Course>): Promise<Course>;
    deleteCourse(id: string): Promise<void>;
    publishCourse(id: string): Promise<Course>;
    unpublishCourse(id: string): Promise<Course>;
}
