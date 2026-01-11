// src/presentation/pages/dashboard/StudentCourseDetailPage.tsx
import { useParams, Link } from 'react-router-dom';
import { useCourseDetail, useLanguage } from '../../hooks';
import './StudentCourseDetailPage.css';

export function StudentCourseDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { isRTL } = useLanguage();
    const { course, isLoading, error } = useCourseDetail(id || '');

    if (isLoading) {
        return (
            <div className="course-detail course-detail--loading">
                <div className="course-detail__skeleton course-detail__skeleton--header" />
                <div className="course-detail__skeleton course-detail__skeleton--content" />
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="course-detail course-detail--error">
                <svg viewBox="0 0 24 24" fill="currentColor" width="64" height="64">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                <h2>{isRTL ? 'الدورة غير موجودة' : 'Course not found'}</h2>
                <p>{error || (isRTL ? 'لم نتمكن من العثور على هذه الدورة' : 'We couldn\'t find this course')}</p>
                <Link to="/student/courses" className="course-detail__back-link">
                    {isRTL ? 'العودة للدورات' : 'Back to Courses'}
                </Link>
            </div>
        );
    }

    const hasDiscount = course.discountPrice && course.discountPrice < course.price;
    const displayPrice = hasDiscount ? course.discountPrice : course.price;

    return (
        <div className="course-detail">
            <nav className="course-detail__breadcrumb">
                <Link to="/student/courses">
                    {isRTL ? 'الدورات' : 'Courses'}
                </Link>
                <span>/</span>
                <span>{course.title}</span>
            </nav>

            <div className="course-detail__layout">
                <main className="course-detail__main">
                    <div className="course-detail__hero">
                        {course.thumbnail ? (
                            <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="course-detail__image"
                            />
                        ) : (
                            <div className="course-detail__placeholder">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="80" height="80">
                                    <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
                                </svg>
                            </div>
                        )}
                        <span className={`course-detail__type course-detail__type--${course.type}`}>
                            {course.type === 'academic' ? (isRTL ? 'أكاديمي' : 'Academic') : (isRTL ? 'غير أكاديمي' : 'Non-Academic')}
                        </span>
                    </div>

                    <h1 className="course-detail__title">{course.title}</h1>

                    <div className="course-detail__instructor">
                        <div className="course-detail__instructor-avatar">
                            {course.teacherName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="course-detail__instructor-label">
                                {isRTL ? 'المدرس' : 'Instructor'}
                            </p>
                            <p className="course-detail__instructor-name">{course.teacherName}</p>
                        </div>
                    </div>

                    <div className="course-detail__stats">
                        <div className="course-detail__stat">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z" />
                            </svg>
                            <span>{course.lessonsCount} {isRTL ? 'درس' : 'lessons'}</span>
                        </div>
                        <div className="course-detail__stat">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                            </svg>
                            <span>{formatDuration(course.duration)}</span>
                        </div>
                        <div className="course-detail__stat">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                            </svg>
                            <span>{course.enrolledCount} {isRTL ? 'طالب' : 'students'}</span>
                        </div>
                        {course.rating && (
                            <div className="course-detail__stat course-detail__stat--rating">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                </svg>
                                <span>{course.rating.toFixed(1)}</span>
                            </div>
                        )}
                    </div>

                    <section className="course-detail__section">
                        <h2>{isRTL ? 'وصف الدورة' : 'Course Description'}</h2>
                        <p className="course-detail__description">{course.description}</p>
                    </section>

                    {course.objectives && course.objectives.length > 0 && (
                        <section className="course-detail__section">
                            <h2>{isRTL ? 'ماذا ستتعلم' : 'What you\'ll learn'}</h2>
                            <ul className="course-detail__list">
                                {course.objectives.map((objective, index) => (
                                    <li key={index}>
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                        </svg>
                                        {objective}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {course.requirements && course.requirements.length > 0 && (
                        <section className="course-detail__section">
                            <h2>{isRTL ? 'المتطلبات' : 'Requirements'}</h2>
                            <ul className="course-detail__list course-detail__list--requirements">
                                {course.requirements.map((requirement, index) => (
                                    <li key={index}>{requirement}</li>
                                ))}
                            </ul>
                        </section>
                    )}

                    <section className="course-detail__section">
                        <h2>{isRTL ? 'محتوى الدورة' : 'Course Content'}</h2>
                        <p className="course-detail__lessons-summary">
                            {course.lessonsCount} {isRTL ? 'درس' : 'lessons'} • {formatDuration(course.duration)}
                        </p>
                        <div className="course-detail__lessons">
                            {course.lessons.map((lesson, index) => (
                                <div
                                    key={lesson.id}
                                    className={`course-detail__lesson ${lesson.isFree ? 'course-detail__lesson--free' : ''}`}
                                >
                                    <div className="course-detail__lesson-number">{index + 1}</div>
                                    <div className="course-detail__lesson-info">
                                        <h4>{lesson.title}</h4>
                                        <span className="course-detail__lesson-duration">
                                            {formatDuration(lesson.duration)}
                                        </span>
                                    </div>
                                    {lesson.isFree ? (
                                        <span className="course-detail__lesson-badge">
                                            {isRTL ? 'مجاني' : 'Free'}
                                        </span>
                                    ) : (
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" className="course-detail__lesson-lock">
                                            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                                        </svg>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                </main>

                <aside className="course-detail__sidebar">
                    <div className="course-detail__card">
                        <div className="course-detail__price">
                            {hasDiscount && (
                                <span className="course-detail__original-price">
                                    {course.price} {isRTL ? 'ر.ع' : 'OMR'}
                                </span>
                            )}
                            <span className="course-detail__current-price">
                                {displayPrice === 0
                                    ? (isRTL ? 'مجاني' : 'Free')
                                    : `${displayPrice} ${isRTL ? 'ر.ع' : 'OMR'}`}
                            </span>
                        </div>

                        <button
                            type="button"
                            className="course-detail__enroll-btn"
                        >
                            {isRTL ? 'اشترك الآن' : 'Enroll Now'}
                        </button>

                        <ul className="course-detail__features">
                            <li>
                                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z" />
                                </svg>
                                {course.lessonsCount} {isRTL ? 'درس فيديو' : 'video lessons'}
                            </li>
                            <li>
                                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                                </svg>
                                {formatDuration(course.duration)} {isRTL ? 'مدة المحتوى' : 'total content'}
                            </li>
                            <li>
                                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                    <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                                </svg>
                                {isRTL ? 'وصول مدى الحياة' : 'Lifetime access'}
                            </li>
                            <li>
                                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                    <path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM9.41 15.95L12 13.36l2.59 2.59L16 14.54l-2.59-2.59L16 9.36l-1.41-1.41L12 10.54 9.41 7.95 8 9.36l2.59 2.59L8 14.54z" />
                                </svg>
                                {isRTL ? 'شهادة إتمام' : 'Certificate of completion'}
                            </li>
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
}

function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
