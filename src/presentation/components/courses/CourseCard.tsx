// src/presentation/components/courses/CourseCard.tsx
import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import type { Course } from '../../../core/entities';
import { useLanguage } from '../../hooks';

interface CourseCardProps {
    course: Course;
    className?: string;
}

export const CourseCard = forwardRef<HTMLDivElement, CourseCardProps>(
    function CourseCard({ course, className = '' }, ref) {
        const { isRTL } = useLanguage();

        const hasDiscount = course.discountPrice && course.discountPrice < course.price;
        const displayPrice = hasDiscount ? course.discountPrice : course.price;
        const formattedDuration = formatDuration(course.duration);

        return (
            <div
                ref={ref}
                className={`course-card ${className}`}
            >
                <Link to={`/student/courses/${course.id}`} className="course-card__link">
                    <div className="course-card__thumbnail">
                        {course.thumbnail ? (
                            <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="course-card__image"
                                loading="lazy"
                            />
                        ) : (
                            <div className="course-card__placeholder">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
                                    <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
                                </svg>
                            </div>
                        )}
                        <span className={`course-card__type course-card__type--${course.type}`}>
                            {course.type === 'academic' ? (isRTL ? 'أكاديمي' : 'Academic') : (isRTL ? 'غير أكاديمي' : 'Non-Academic')}
                        </span>
                    </div>

                    <div className="course-card__content">
                        <h3 className="course-card__title">{course.title}</h3>

                        <p className="course-card__teacher">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                            {course.teacherName}
                        </p>

                        <div className="course-card__meta">
                            <span className="course-card__lessons">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                                    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z" />
                                </svg>
                                {course.lessonsCount} {isRTL ? 'درس' : 'lessons'}
                            </span>
                            <span className="course-card__duration">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                                </svg>
                                {formattedDuration}
                            </span>
                        </div>

                        {course.rating && (
                            <div className="course-card__rating">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" className="course-card__star">
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                </svg>
                                <span>{course.rating.toFixed(1)}</span>
                                <span className="course-card__enrolled">({course.enrolledCount} {isRTL ? 'طالب' : 'students'})</span>
                            </div>
                        )}

                        <div className="course-card__footer">
                            <div className="course-card__price">
                                {hasDiscount && (
                                    <span className="course-card__original-price">{course.price} {isRTL ? 'ر.ع' : 'OMR'}</span>
                                )}
                                <span className="course-card__current-price">
                                    {displayPrice === 0 ? (isRTL ? 'مجاني' : 'Free') : `${displayPrice} ${isRTL ? 'ر.ع' : 'OMR'}`}
                                </span>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        );
    }
);

function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
