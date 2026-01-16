/**
 * My Courses Page (Student Subscriptions)
 * 
 * Displays courses the student is enrolled in, grouped by status:
 * - Active subscriptions
 * - Pending approval
 * - Rejected subscriptions
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService, Subscription, SubscriptionStatus, getLocalizedName } from '../../../data/api/studentService';
import { useLanguage } from '../../hooks';
import {
    BookOpen,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Upload,
    User,
    Calendar,
    GraduationCap,
    Play,
    RefreshCw,
    Filter
} from 'lucide-react';
import './StudentCoursesPage.css';

// Status configuration for styling and labels
const STATUS_CONFIG = {
    0: { // INACTIVE
        label: 'غير نشط',
        labelEn: 'Inactive',
        color: 'bg-slate-500',
        textColor: 'text-slate-500',
        bgLight: 'bg-slate-50',
        icon: AlertCircle,
    },
    1: { // ACTIVE
        label: 'نشط',
        labelEn: 'Active',
        color: 'bg-emerald-500',
        textColor: 'text-emerald-500',
        bgLight: 'bg-emerald-50',
        icon: CheckCircle,
    },
    2: { // PENDING
        label: 'قيد المراجعة',
        labelEn: 'Pending',
        color: 'bg-amber-500',
        textColor: 'text-amber-500',
        bgLight: 'bg-amber-50',
        icon: Clock,
    },
    3: { // REJECTED
        label: 'مرفوض',
        labelEn: 'Rejected',
        color: 'bg-red-500',
        textColor: 'text-red-500',
        bgLight: 'bg-red-50',
        icon: XCircle,
    },
} as const;

// Filter tabs
type FilterTab = 'all' | 'active' | 'pending' | 'rejected';

interface SubscriptionCardProps {
    subscription: Subscription;
    onUploadReceipt: (subscription: Subscription) => void;
    onViewCourse: (courseId: number) => void;
    isRTL: boolean;
}

function SubscriptionCard({ subscription, onUploadReceipt, onViewCourse, isRTL }: SubscriptionCardProps) {
    const statusConfig = STATUS_CONFIG[subscription.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG[0];
    const StatusIcon = statusConfig.icon;
    const course = subscription.course;

    if (!course) return null;

    const courseName = getLocalizedName(course.name, 'دورة غير معروفة');
    const teacherName = course.teacher?.name || 'غير محدد';

    // Generate a consistent gradient based on course ID
    const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
        'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        'linear-gradient(135deg, #667eea 0%, #f093fb 100%)',
    ];
    const gradientIndex = course.id % gradients.length;
    const placeholderGradient = gradients[gradientIndex];

    // Get course initial(s)
    const getInitials = (name: string): string => {
        if (!name) return '📚';
        const words = name.split(' ').filter(w => w.length > 0);
        if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };
    const courseInitials = getInitials(courseName);

    // Handle card click - navigate to course details
    const handleCardClick = () => {
        onViewCourse(course.id);
    };

    return (
        <div
            className="my-courses__card group"
            onClick={handleCardClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
        >
            {/* Course Thumbnail */}
            <div className="my-courses__card-thumbnail">
                {course.image_path ? (
                    <img src={course.image_path} alt={courseName} className="my-courses__card-image" />
                ) : (
                    <div
                        className="my-courses__card-placeholder"
                        style={{ background: placeholderGradient }}
                    >
                        <div className="my-courses__placeholder-pattern" />
                        <span className="my-courses__placeholder-initials">{courseInitials}</span>
                    </div>
                )}

                {/* Status Badge */}
                <span className={`my-courses__status-badge ${statusConfig.color}`}>
                    <StatusIcon size={14} />
                    <span>{isRTL ? statusConfig.label : statusConfig.labelEn}</span>
                </span>

                {/* Hover Actions */}
                <div className="my-courses__card-overlay">
                    {subscription.status === 1 && ( // Active - can view course
                        <button
                            onClick={(e) => { e.stopPropagation(); onViewCourse(course.id); }}
                            className="my-courses__action-btn my-courses__action-btn--primary"
                        >
                            <Play size={20} />
                            <span>{isRTL ? 'مشاهدة الدورة' : 'Watch Course'}</span>
                        </button>
                    )}
                    {subscription.status === 2 && !subscription.bill_image_path && ( // Pending without receipt
                        <button
                            onClick={(e) => { e.stopPropagation(); onUploadReceipt(subscription); }}
                            className="my-courses__action-btn my-courses__action-btn--warning"
                        >
                            <Upload size={20} />
                            <span>{isRTL ? 'رفع الإيصال' : 'Upload Receipt'}</span>
                        </button>
                    )}
                </div>

                {/* Academic badge */}
                {course.is_academic && (
                    <span className="my-courses__academic-badge">
                        {isRTL ? 'أكاديمي' : 'Academic'}
                    </span>
                )}
            </div>

            {/* Card Content */}
            <div className="my-courses__card-content">
                <h3 className="my-courses__card-title">{courseName}</h3>

                {/* Teacher Info */}
                <div className="my-courses__card-meta">
                    <User size={14} />
                    <span>{teacherName}</span>
                </div>

                {/* Grade & Semester */}
                {(course.grade || course.semester) && (
                    <div className="my-courses__card-meta">
                        <BookOpen size={14} />
                        <span>
                            {course.grade && getLocalizedName(course.grade.name)}
                            {course.grade && course.semester && ' - '}
                            {course.semester && getLocalizedName(course.semester.name)}
                        </span>
                    </div>
                )}

                {/* Subscription Date */}
                <div className="my-courses__card-meta">
                    <Calendar size={14} />
                    <span>
                        {isRTL ? 'تاريخ الاشتراك: ' : 'Subscribed: '}
                        {subscription.created_at
                            ? new Date(subscription.created_at).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')
                            : '-'
                        }
                    </span>
                </div>

                {/* Rejection Reason */}
                {subscription.status === 3 && subscription.rejection_reason && (
                    <div className="my-courses__rejection-reason">
                        <AlertCircle size={14} />
                        <span>{subscription.rejection_reason}</span>
                    </div>
                )}

                {/* Receipt Status */}
                {subscription.status === 2 && (
                    <div className={`my-courses__receipt-status ${subscription.bill_image_path ? 'uploaded' : 'missing'}`}>
                        {subscription.bill_image_path ? (
                            <>
                                <CheckCircle size={14} />
                                <span>{isRTL ? 'تم رفع الإيصال' : 'Receipt Uploaded'}</span>
                            </>
                        ) : (
                            <>
                                <AlertCircle size={14} />
                                <span>{isRTL ? 'يرجى رفع إيصال الدفع' : 'Please upload payment receipt'}</span>
                            </>
                        )}
                    </div>
                )}

                {/* Price */}
                <div className="my-courses__card-price">
                    {course.price && Number(course.price) > 0 ? (
                        <>
                            <span className="my-courses__price-current">
                                {Number(course.price).toFixed(2)} {isRTL ? 'ر.ع' : 'OMR'}
                            </span>
                            {course.old_price && Number(course.old_price) > Number(course.price) && (
                                <span className="my-courses__price-old">
                                    {Number(course.old_price).toFixed(2)}
                                </span>
                            )}
                        </>
                    ) : (
                        <span className="my-courses__price-free">
                            {isRTL ? 'مجاني' : 'Free'}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export function StudentCoursesPage() {
    const { isRTL } = useLanguage();
    const navigate = useNavigate();

    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Fetch subscriptions
    const fetchSubscriptions = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const subs = await studentService.getMySubscriptions();
            setSubscriptions(subs);
            setFilteredSubscriptions(subs);
        } catch (err: any) {
            console.error('Failed to fetch subscriptions:', err);
            setError(err.message || (isRTL ? 'فشل في تحميل الدورات' : 'Failed to load courses'));
        } finally {
            setIsLoading(false);
        }
    }, [isRTL]);

    useEffect(() => {
        fetchSubscriptions();
    }, [fetchSubscriptions]);

    // Filter subscriptions when filter changes
    useEffect(() => {
        if (activeFilter === 'all') {
            setFilteredSubscriptions(subscriptions);
        } else {
            const statusMap: Record<FilterTab, SubscriptionStatus> = {
                all: 0, // Not used
                active: 1,
                pending: 2,
                rejected: 3,
            };
            setFilteredSubscriptions(subscriptions.filter(s => s.status === statusMap[activeFilter]));
        }
    }, [activeFilter, subscriptions]);

    // Get counts for tabs
    const getCounts = () => {
        return {
            all: subscriptions.length,
            active: subscriptions.filter(s => s.status === 1).length,
            pending: subscriptions.filter(s => s.status === 2).length,
            rejected: subscriptions.filter(s => s.status === 3).length,
        };
    };

    const counts = getCounts();

    // Handle upload receipt
    const handleUploadReceipt = (subscription: Subscription) => {
        setSelectedSubscription(subscription);
        setUploadModalOpen(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadFile(file);
        }
    };

    const handleUploadSubmit = async () => {
        if (!selectedSubscription || !uploadFile) return;

        setIsUploading(true);
        try {
            await studentService.uploadPaymentReceipt(selectedSubscription.id, uploadFile);
            setUploadModalOpen(false);
            setUploadFile(null);
            setSelectedSubscription(null);
            // Refresh subscriptions
            await fetchSubscriptions();
        } catch (err: any) {
            console.error('Upload failed:', err);
            setError(err.message || (isRTL ? 'فشل رفع الإيصال' : 'Failed to upload receipt'));
        } finally {
            setIsUploading(false);
        }
    };

    const handleViewCourse = (courseId: number) => {
        navigate(`/dashboard/courses/${courseId}`);
    };

    return (
        <div className="my-courses" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <header className="my-courses__header">
                <div className="my-courses__header-content">
                    <h1 className="my-courses__title">
                        {isRTL ? 'دوراتي' : 'My Courses'}
                    </h1>
                    <p className="my-courses__subtitle">
                        {isRTL
                            ? 'عرض جميع الدورات المشترك بها وحالة كل اشتراك'
                            : 'View all your subscribed courses and their status'
                        }
                    </p>
                </div>
                <button
                    onClick={fetchSubscriptions}
                    className="my-courses__refresh-btn"
                    disabled={isLoading}
                >
                    <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    <span>{isRTL ? 'تحديث' : 'Refresh'}</span>
                </button>
            </header>

            {/* Filter Tabs */}
            <div className="my-courses__filters">
                <button
                    className={`my-courses__filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('all')}
                >
                    <Filter size={16} />
                    <span>{isRTL ? 'الكل' : 'All'}</span>
                    <span className="my-courses__filter-count">{counts.all}</span>
                </button>
                <button
                    className={`my-courses__filter-tab ${activeFilter === 'active' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('active')}
                >
                    <CheckCircle size={16} />
                    <span>{isRTL ? 'نشط' : 'Active'}</span>
                    <span className="my-courses__filter-count">{counts.active}</span>
                </button>
                <button
                    className={`my-courses__filter-tab ${activeFilter === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('pending')}
                >
                    <Clock size={16} />
                    <span>{isRTL ? 'قيد المراجعة' : 'Pending'}</span>
                    <span className="my-courses__filter-count">{counts.pending}</span>
                </button>
                <button
                    className={`my-courses__filter-tab ${activeFilter === 'rejected' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('rejected')}
                >
                    <XCircle size={16} />
                    <span>{isRTL ? 'مرفوض' : 'Rejected'}</span>
                    <span className="my-courses__filter-count">{counts.rejected}</span>
                </button>
            </div>

            {/* Error State */}
            {error && (
                <div className="my-courses__error">
                    <AlertCircle size={24} />
                    <span>{error}</span>
                    <button onClick={fetchSubscriptions}>
                        {isRTL ? 'إعادة المحاولة' : 'Retry'}
                    </button>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="my-courses__loading">
                    <div className="my-courses__loading-grid">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="my-courses__skeleton-card">
                                <div className="my-courses__skeleton-thumbnail" />
                                <div className="my-courses__skeleton-content">
                                    <div className="my-courses__skeleton-title" />
                                    <div className="my-courses__skeleton-meta" />
                                    <div className="my-courses__skeleton-meta short" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && filteredSubscriptions.length === 0 && (
                <div className="my-courses__empty">
                    <div className="my-courses__empty-icon">
                        <BookOpen size={64} />
                    </div>
                    <h3>
                        {activeFilter === 'all'
                            ? (isRTL ? 'لا توجد دورات مشترك بها' : 'No subscribed courses')
                            : (isRTL ? 'لا توجد دورات في هذه الفئة' : 'No courses in this category')
                        }
                    </h3>
                    <p>
                        {isRTL
                            ? 'ابدأ رحلتك التعليمية باستكشاف الدورات المتاحة'
                            : 'Start your learning journey by exploring available courses'
                        }
                    </p>
                    <button
                        onClick={() => navigate('/dashboard/academic-browse')}
                        className="my-courses__browse-btn"
                    >
                        <GraduationCap size={18} />
                        <span>{isRTL ? 'استكشاف الدورات' : 'Browse Courses'}</span>
                    </button>
                </div>
            )}

            {/* Courses Grid */}
            {!isLoading && !error && filteredSubscriptions.length > 0 && (
                <div className="my-courses__grid">
                    {filteredSubscriptions.map(subscription => (
                        <SubscriptionCard
                            key={subscription.id}
                            subscription={subscription}
                            onUploadReceipt={handleUploadReceipt}
                            onViewCourse={handleViewCourse}
                            isRTL={isRTL}
                        />
                    ))}
                </div>
            )}

            {/* Upload Receipt Modal */}
            {uploadModalOpen && selectedSubscription && (
                <div className="my-courses__modal-overlay" onClick={() => setUploadModalOpen(false)}>
                    <div className="my-courses__modal" onClick={e => e.stopPropagation()}>
                        <h3>{isRTL ? 'رفع إيصال الدفع' : 'Upload Payment Receipt'}</h3>
                        <p>
                            {isRTL
                                ? 'يرجى رفع صورة إيصال الدفع للمراجعة من قبل الإدارة'
                                : 'Please upload a payment receipt image for admin review'
                            }
                        </p>

                        <div className="my-courses__upload-area">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                id="receipt-upload"
                            />
                            <label htmlFor="receipt-upload">
                                <Upload size={32} />
                                <span>
                                    {uploadFile
                                        ? uploadFile.name
                                        : (isRTL ? 'اختر صورة الإيصال' : 'Select receipt image')
                                    }
                                </span>
                            </label>
                        </div>

                        <div className="my-courses__modal-actions">
                            <button
                                onClick={() => setUploadModalOpen(false)}
                                className="my-courses__modal-btn secondary"
                            >
                                {isRTL ? 'إلغاء' : 'Cancel'}
                            </button>
                            <button
                                onClick={handleUploadSubmit}
                                disabled={!uploadFile || isUploading}
                                className="my-courses__modal-btn primary"
                            >
                                {isUploading
                                    ? (isRTL ? 'جاري الرفع...' : 'Uploading...')
                                    : (isRTL ? 'رفع الإيصال' : 'Upload Receipt')
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
