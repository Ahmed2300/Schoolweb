// src/presentation/hooks/useCourses.ts
import { useState, useCallback, useMemo, useEffect } from 'react';
import { CourseRepository } from '../../data/repositories';
import type { Course, CourseDetails } from '../../core/entities';
import type { CourseFilters, PaginatedResponse } from '../../core/repositories';

interface PaginationState {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface UseCoursesState {
    courses: Course[];
    isLoading: boolean;
    error: string | null;
    pagination: PaginationState;
}

interface UseCoursesReturn extends UseCoursesState {
    filters: CourseFilters;
    setFilters: (filters: Partial<CourseFilters>) => void;
    resetFilters: () => void;
    nextPage: () => void;
    prevPage: () => void;
    goToPage: (page: number) => void;
    refetch: () => Promise<void>;
}

const DEFAULT_FILTERS: CourseFilters = {
    page: 1,
    limit: 12,
};

const DEFAULT_PAGINATION: PaginationState = {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
};

export function useCourses(initialFilters?: Partial<CourseFilters>): UseCoursesReturn {
    const [state, setState] = useState<UseCoursesState>({
        courses: [],
        isLoading: false,
        error: null,
        pagination: DEFAULT_PAGINATION,
    });

    const [filters, setFiltersState] = useState<CourseFilters>({
        ...DEFAULT_FILTERS,
        ...initialFilters,
    });

    const courseRepository = useMemo(() => new CourseRepository(), []);

    const fetchCourses = useCallback(async (currentFilters: CourseFilters) => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response: PaginatedResponse<Course> = await courseRepository.getCourses(currentFilters);

            setState({
                courses: response.data,
                isLoading: false,
                error: null,
                pagination: {
                    page: response.page,
                    limit: response.limit,
                    total: response.total,
                    totalPages: response.totalPages,
                },
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch courses';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: message,
            }));
        }
    }, [courseRepository]);

    useEffect(() => {
        fetchCourses(filters);
    }, [filters, fetchCourses]);

    // Listen for real-time subscription updates - refetch courses when approved/rejected
    useEffect(() => {
        const handleSubscriptionUpdate = (event: Event) => {
            const customEvent = event as CustomEvent;
            const notification = customEvent.detail;

            // Refetch courses when subscription status changes (approval/rejection)
            if (notification?.type?.includes('subscription')) {
                console.log('Subscription status changed, refreshing courses...');
                fetchCourses(filters);
            }
        };

        window.addEventListener('student-notification', handleSubscriptionUpdate);

        return () => {
            window.removeEventListener('student-notification', handleSubscriptionUpdate);
        };
    }, [filters, fetchCourses]);

    const setFilters = useCallback((newFilters: Partial<CourseFilters>) => {
        setFiltersState(prev => ({
            ...prev,
            ...newFilters,
            page: newFilters.page ?? 1,
        }));
    }, []);

    const resetFilters = useCallback(() => {
        setFiltersState(DEFAULT_FILTERS);
    }, []);

    const nextPage = useCallback(() => {
        if (state.pagination.page < state.pagination.totalPages) {
            setFiltersState(prev => ({ ...prev, page: (prev.page ?? 1) + 1 }));
        }
    }, [state.pagination.page, state.pagination.totalPages]);

    const prevPage = useCallback(() => {
        if (state.pagination.page > 1) {
            setFiltersState(prev => ({ ...prev, page: (prev.page ?? 1) - 1 }));
        }
    }, [state.pagination.page]);

    const goToPage = useCallback((page: number) => {
        if (page >= 1 && page <= state.pagination.totalPages) {
            setFiltersState(prev => ({ ...prev, page }));
        }
    }, [state.pagination.totalPages]);

    const refetch = useCallback(async () => {
        await fetchCourses(filters);
    }, [fetchCourses, filters]);

    return {
        ...state,
        filters,
        setFilters,
        resetFilters,
        nextPage,
        prevPage,
        goToPage,
        refetch,
    };
}

interface UseCourseDetailReturn {
    course: CourseDetails | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useCourseDetail(courseId: string): UseCourseDetailReturn {
    const [course, setCourse] = useState<CourseDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const courseRepository = useMemo(() => new CourseRepository(), []);

    const fetchCourse = useCallback(async () => {
        if (!courseId) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await courseRepository.getCourseById(courseId);
            setCourse(response);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch course';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [courseId, courseRepository]);

    useEffect(() => {
        fetchCourse();
    }, [fetchCourse]);

    return {
        course,
        isLoading,
        error,
        refetch: fetchCourse,
    };
}
