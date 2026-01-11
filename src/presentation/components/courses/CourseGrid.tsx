// src/presentation/components/courses/CourseGrid.tsx
import type { Course } from '../../../core/entities';
import { CourseCard } from './CourseCard';
import { CourseCardSkeleton } from './CourseCardSkeleton';
import { useLanguage } from '../../hooks';

interface CourseGridProps {
    courses: Course[];
    isLoading: boolean;
    error: string | null;
    emptyMessage?: string;
    skeletonCount?: number;
}

export function CourseGrid({
    courses,
    isLoading,
    error,
    emptyMessage,
    skeletonCount = 6,
}: CourseGridProps) {
    const { isRTL } = useLanguage();

    if (error) {
        return (
            <div className="course-grid__error">
                <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                <h3>{isRTL ? 'حدث خطأ' : 'Something went wrong'}</h3>
                <p>{error}</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="course-grid">
                {Array.from({ length: skeletonCount }).map((_, index) => (
                    <CourseCardSkeleton key={`skeleton-${index}`} />
                ))}
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <div className="course-grid__empty">
                <svg viewBox="0 0 24 24" fill="currentColor" width="64" height="64">
                    <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
                </svg>
                <h3>{isRTL ? 'لا توجد دورات' : 'No courses found'}</h3>
                <p>{emptyMessage || (isRTL ? 'جرب تعديل عوامل التصفية' : 'Try adjusting your filters')}</p>
            </div>
        );
    }

    return (
        <div className="course-grid">
            {courses.map(course => (
                <CourseCard key={course.id} course={course} />
            ))}
        </div>
    );
}
