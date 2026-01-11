// src/presentation/pages/dashboard/StudentCoursesPage.tsx
import { useCourses } from '../../hooks';
import { CourseFilters, CourseGrid, Pagination } from '../../components/courses';
import { useLanguage } from '../../hooks';
import './StudentCoursesPage.css';

export function StudentCoursesPage() {
    const { isRTL } = useLanguage();
    const {
        courses,
        isLoading,
        error,
        filters,
        pagination,
        setFilters,
        resetFilters,
        nextPage,
        prevPage,
        goToPage,
    } = useCourses();

    return (
        <div className="student-courses-page">
            <header className="student-courses-page__header">
                <h1 className="student-courses-page__title">
                    {isRTL ? 'استكشف الدورات' : 'Explore Courses'}
                </h1>
                <p className="student-courses-page__subtitle">
                    {isRTL
                        ? 'اكتشف الدورات المتاحة وابدأ رحلتك التعليمية'
                        : 'Discover available courses and start your learning journey'}
                </p>
            </header>

            <CourseFilters
                filters={filters}
                onFilterChange={setFilters}
                onReset={resetFilters}
                isLoading={isLoading}
            />

            <div className="student-courses-page__results">
                {!isLoading && !error && courses.length > 0 && (
                    <p className="student-courses-page__count">
                        {isRTL
                            ? `${pagination.total} دورة متاحة`
                            : `${pagination.total} courses available`}
                    </p>
                )}
            </div>

            <CourseGrid
                courses={courses}
                isLoading={isLoading}
                error={error}
            />

            <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={goToPage}
                onNext={nextPage}
                onPrev={prevPage}
                isLoading={isLoading}
            />
        </div>
    );
}
