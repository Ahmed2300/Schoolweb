// src/presentation/components/courses/CourseCardSkeleton.tsx
export function CourseCardSkeleton() {
    return (
        <div className="course-card course-card--skeleton">
            <div className="course-card__thumbnail course-card__skeleton-pulse" />
            <div className="course-card__content">
                <div className="course-card__skeleton-line course-card__skeleton-line--title course-card__skeleton-pulse" />
                <div className="course-card__skeleton-line course-card__skeleton-line--teacher course-card__skeleton-pulse" />
                <div className="course-card__skeleton-line course-card__skeleton-line--meta course-card__skeleton-pulse" />
                <div className="course-card__skeleton-line course-card__skeleton-line--price course-card__skeleton-pulse" />
            </div>
        </div>
    );
}
