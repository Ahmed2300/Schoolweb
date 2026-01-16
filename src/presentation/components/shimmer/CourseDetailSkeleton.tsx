// src/presentation/components/shimmer/CourseDetailSkeleton.tsx
// Premium shimmer skeleton for course detail page
import './ShimmerSkeleton.css';
import { BookOpen, Play } from 'lucide-react';

export function CourseDetailSkeleton() {
    return (
        <div className="course-skeleton">
            {/* Decorative Background Elements */}
            <div className="course-skeleton__decorator course-skeleton__decorator--1" />
            <div className="course-skeleton__decorator course-skeleton__decorator--2" />

            {/* Header - Back Button */}
            <div className="course-skeleton__header">
                <div className="course-skeleton__back-btn shimmer" />
            </div>

            {/* Hero Section */}
            <div className="course-skeleton__hero">
                {/* Course Image */}
                <div className="course-skeleton__image-wrapper">
                    <div className="course-skeleton__image shimmer">
                        <div className="course-skeleton__image-icon">
                            <BookOpen strokeWidth={1.5} />
                        </div>
                    </div>
                </div>

                {/* Course Content */}
                <div className="course-skeleton__content">
                    {/* Badge */}
                    <div className="course-skeleton__badge shimmer--gradient" />

                    {/* Title */}
                    <div className="course-skeleton__title shimmer" />
                    <div className="course-skeleton__title--large shimmer" />

                    {/* Description */}
                    <div className="course-skeleton__description">
                        <div className="course-skeleton__line course-skeleton__line--full shimmer" />
                        <div className="course-skeleton__line course-skeleton__line--80 shimmer" />
                        <div className="course-skeleton__line course-skeleton__line--60 shimmer" />
                    </div>

                    {/* CTA Button */}
                    <div className="course-skeleton__cta shimmer--gradient" />

                    {/* Stats */}
                    <div className="course-skeleton__stats">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="course-skeleton__stat">
                                <div className="course-skeleton__stat-icon shimmer" />
                                <div className="course-skeleton__stat-text shimmer" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="course-skeleton__main">
                <div className="course-skeleton__main-inner">
                    {/* Sidebar */}
                    <div className="course-skeleton__sidebar">
                        <div className="course-skeleton__card">
                            {/* Price Section */}
                            <div className="course-skeleton__price-section">
                                <div className="course-skeleton__price-label shimmer" />
                                <div className="course-skeleton__price shimmer" />
                            </div>

                            {/* Enroll Button */}
                            <div className="course-skeleton__enroll-btn shimmer--gradient" />

                            {/* Features */}
                            <div className="course-skeleton__features">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="course-skeleton__feature">
                                        <div className="course-skeleton__feature-icon shimmer--gradient" />
                                        <div className="course-skeleton__feature-text shimmer" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Content Sections */}
                    <div className="course-skeleton__sections">
                        {/* Description Section */}
                        <div className="course-skeleton__section">
                            <div className="course-skeleton__section-header">
                                <div className="course-skeleton__section-icon shimmer" />
                                <div className="course-skeleton__section-title shimmer" />
                            </div>
                            <div className="course-skeleton__section-content">
                                <div className="course-skeleton__paragraph">
                                    <div className="course-skeleton__line course-skeleton__line--full shimmer" />
                                    <div className="course-skeleton__line course-skeleton__line--full shimmer" />
                                    <div className="course-skeleton__line course-skeleton__line--80 shimmer" />
                                    <div className="course-skeleton__line course-skeleton__line--60 shimmer" />
                                </div>
                            </div>
                        </div>

                        {/* Teacher Section */}
                        <div className="course-skeleton__section">
                            <div className="course-skeleton__section-header">
                                <div className="course-skeleton__section-icon shimmer" />
                                <div className="course-skeleton__section-title shimmer" />
                            </div>
                            <div className="course-skeleton__teacher">
                                <div className="course-skeleton__teacher-avatar shimmer" />
                                <div className="course-skeleton__teacher-info">
                                    <div className="course-skeleton__teacher-name shimmer" />
                                    <div className="course-skeleton__teacher-role shimmer" />
                                </div>
                            </div>
                        </div>

                        {/* Lectures Section */}
                        <div className="course-skeleton__section">
                            <div className="course-skeleton__section-header">
                                <div className="course-skeleton__section-icon shimmer" />
                                <div className="course-skeleton__section-title shimmer" />
                            </div>
                            <div className="course-skeleton__lectures">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="course-skeleton__lecture">
                                        <div className="course-skeleton__lecture-icon shimmer--gradient">
                                            <Play size={24} />
                                        </div>
                                        <div className="course-skeleton__lecture-content">
                                            <div className="course-skeleton__lecture-title shimmer" />
                                            <div className="course-skeleton__lecture-duration shimmer" />
                                        </div>
                                        {i === 1 && (
                                            <div className="course-skeleton__lecture-badge shimmer--gradient" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CourseDetailSkeleton;
