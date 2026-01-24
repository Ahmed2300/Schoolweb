/**
 * React Query hooks for Teacher Content (Courses, Lectures).
 */

import { useQuery } from '@tanstack/react-query';
import teacherService from '../../data/api/teacherService';

export const teacherContentKeys = {
    myCourses: ['teacherMyCourses'] as const,
    courseLectures: (courseId: number) => ['teacherCourseLectures', courseId] as const,
};

/**
 * Hook to fetch teacher's courses (for selection/management).
 */
export function useTeacherCourses() {
    return useQuery({
        queryKey: teacherContentKeys.myCourses,
        queryFn: () => teacherService.getMyCourses({ per_page: 100 }), // Get all for dropdown
        select: (response) => response.data,
    });
}

/**
 * Hook to fetch lectures for a specific course.
 */
export function useCourseLectures(courseId: number | null) {
    return useQuery({
        queryKey: teacherContentKeys.courseLectures(courseId!),
        queryFn: () => teacherService.getCourseLectures(courseId!),
        enabled: !!courseId,
    });
}
