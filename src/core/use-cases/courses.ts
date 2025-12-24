import type { ICourseRepository, CourseFilters, PaginatedResponse } from '../repositories';
import type { Course, CourseDetails } from '../entities';

// Use case for getting courses with filters
export class GetCoursesUseCase {
    constructor(private courseRepository: ICourseRepository) { }

    async execute(filters?: CourseFilters): Promise<PaginatedResponse<Course>> {
        return this.courseRepository.getCourses(filters);
    }
}

// Use case for getting course details
export class GetCourseDetailsUseCase {
    constructor(private courseRepository: ICourseRepository) { }

    async execute(courseId: string): Promise<CourseDetails> {
        if (!courseId) throw new Error('Course ID is required');
        return this.courseRepository.getCourseById(courseId);
    }
}

// Use case for getting enrolled courses
export class GetEnrolledCoursesUseCase {
    constructor(private courseRepository: ICourseRepository) { }

    async execute(userId: string): Promise<Course[]> {
        if (!userId) throw new Error('User ID is required');
        return this.courseRepository.getEnrolledCourses(userId);
    }
}

// Use case for searching courses
export class SearchCoursesUseCase {
    constructor(private courseRepository: ICourseRepository) { }

    async execute(query: string): Promise<Course[]> {
        if (!query || query.trim().length < 2) {
            return [];
        }
        return this.courseRepository.searchCourses(query.trim());
    }
}

// Use case for getting featured courses
export class GetFeaturedCoursesUseCase {
    constructor(private courseRepository: ICourseRepository) { }

    async execute(): Promise<Course[]> {
        return this.courseRepository.getFeaturedCourses();
    }
}
