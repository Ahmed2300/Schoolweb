import { useState, useEffect, useCallback } from 'react';
import { studentService, Grade, Semester, Course, Subscription, SubscriptionStatus, SubscriptionStatusLabels, getLocalizedName } from '../../../data/api/studentService';
import {
    GraduationCap,
    BookOpen,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Home,
    Loader2,
    AlertCircle,
    RefreshCw,
    Clock,
    Users,
    ArrowLeft,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { useLanguage } from '../../hooks';
import SubscriptionModal from '../../components/student/SubscriptionModal';

type BrowseStep =
    | { step: 'grades' }
    | { step: 'semesters'; gradeId: number; gradeName: string }
    | { step: 'courses'; gradeId: number; gradeName: string; semesterId: number; semesterName: string };

interface AcademicBrowseProps {
    onCourseSelect?: (courseId: number) => void;
}

export function StudentAcademicBrowsePage({ onCourseSelect }: AcademicBrowseProps) {
    const { isRTL } = useLanguage();
    const [currentStep, setCurrentStep] = useState<BrowseStep>({ step: 'grades' });
    const [grades, setGrades] = useState<Grade[]>([]);
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Subscription state
    const [subscriptions, setSubscriptions] = useState<Map<number, Subscription>>(new Map());
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

    // Fetch subscriptions
    const fetchSubscriptions = useCallback(async () => {
        try {
            const subs = await studentService.getMySubscriptions();
            const subMap = new Map<number, Subscription>();
            subs.forEach(sub => subMap.set(sub.course_id, sub));
            setSubscriptions(subMap);
        } catch (err) {
            console.error('Failed to fetch subscriptions:', err);
        }
    }, []);

    // Initial subscription fetch
    useEffect(() => {
        fetchSubscriptions();
    }, [fetchSubscriptions]);

    // Get subscription status for a course
    const getSubscriptionStatus = (courseId: number): Subscription | undefined => {
        return subscriptions.get(courseId);
    };

    // State for free enrollment loading
    const [enrollingCourseId, setEnrollingCourseId] = useState<number | null>(null);

    // Handle free course enrollment
    const handleFreeEnrollment = async (e: React.MouseEvent, course: Course) => {
        e.stopPropagation();
        if (enrollingCourseId) return; // Prevent double-click

        setEnrollingCourseId(course.id);
        try {
            await studentService.subscribeToCourse(course.id);
            await fetchSubscriptions();
            // Navigate to course details on success
            onCourseSelect?.(course.id);
        } catch (error) {
            console.error('Free enrollment failed:', error);
        } finally {
            setEnrollingCourseId(null);
        }
    };

    // Handle subscribe button click (for paid courses)
    const handleSubscribeClick = (e: React.MouseEvent, course: Course) => {
        e.stopPropagation(); // Prevent card click
        const sub = getSubscriptionStatus(course.id);
        // If active, don't open modal
        if (sub?.status === 1) return;
        // Open modal for subscribe/re-subscribe
        setSelectedCourse(course);
        setShowSubscriptionModal(true);
    };

    // Handle subscription success
    const handleSubscriptionSuccess = () => {
        fetchSubscriptions();
        setShowSubscriptionModal(false);
        setSelectedCourse(null);
    };

    const gradeColors = [
        'from-blue-500 to-indigo-600',
        'from-emerald-500 to-teal-600',
        'from-violet-500 to-purple-600',
        'from-amber-500 to-orange-600',
        'from-rose-500 to-pink-600',
        'from-cyan-500 to-blue-600',
    ];

    const semesterIcons = [Calendar, BookOpen];

    useEffect(() => {
        if (currentStep.step === 'grades') {
            fetchGrades();
        } else if (currentStep.step === 'semesters') {
            fetchSemesters(currentStep.gradeId);
        } else if (currentStep.step === 'courses') {
            fetchCourses(currentStep.gradeId, currentStep.semesterId);
        }
    }, [currentStep]);

    const fetchGrades = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await studentService.getGrades();
            setGrades(data.filter(g => g.is_active !== false));
        } catch (err) {
            setError('فشل في تحميل المراحل الدراسية');
        } finally {
            setLoading(false);
        }
    };

    const fetchSemesters = async (gradeId: number) => {
        setLoading(true);
        setError(null);
        try {
            const data = await studentService.getSemestersByGrade(gradeId);
            setSemesters(data);
        } catch (err) {
            setError('فشل في تحميل الفصول الدراسية');
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async (gradeId: number, semesterId: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await studentService.getAcademicCourses({
                grade_id: gradeId,
                semester_id: semesterId,
                per_page: 50
            });
            setCourses(response.data);
        } catch (err) {
            setError('فشل في تحميل المواد الدراسية');
        } finally {
            setLoading(false);
        }
    };

    const handleGradeSelect = (grade: Grade) => {
        setCurrentStep({
            step: 'semesters',
            gradeId: grade.id,
            gradeName: getLocalizedName(grade.name, 'المرحلة')
        });
    };

    const handleSemesterSelect = (semester: Semester) => {
        if (currentStep.step !== 'semesters') return;
        setCurrentStep({
            step: 'courses',
            gradeId: currentStep.gradeId,
            gradeName: currentStep.gradeName,
            semesterId: semester.id,
            semesterName: getLocalizedName(semester.name, 'الفصل')
        });
    };

    const handleBack = () => {
        if (currentStep.step === 'semesters') {
            setCurrentStep({ step: 'grades' });
        } else if (currentStep.step === 'courses') {
            setCurrentStep({
                step: 'semesters',
                gradeId: currentStep.gradeId,
                gradeName: currentStep.gradeName
            });
        }
    };

    const getBreadcrumbs = () => {
        const items: { label: string; onClick?: () => void }[] = [
            { label: 'الرئيسية', onClick: () => setCurrentStep({ step: 'grades' }) }
        ];

        if (currentStep.step === 'semesters' || currentStep.step === 'courses') {
            items.push({
                label: currentStep.gradeName,
                onClick: currentStep.step === 'courses'
                    ? () => setCurrentStep({
                        step: 'semesters',
                        gradeId: currentStep.gradeId,
                        gradeName: currentStep.gradeName
                    })
                    : undefined
            });
        }

        if (currentStep.step === 'courses') {
            items.push({ label: currentStep.semesterName });
        }

        return items;
    };

    const LoadingSkeleton = ({ count = 4 }: { count?: number }) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 animate-pulse border border-slate-100">
                    <div className="w-14 h-14 bg-slate-200 rounded-xl mb-4" />
                    <div className="h-5 bg-slate-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-slate-100 rounded w-1/2" />
                </div>
            ))}
        </div>
    );

    const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <AlertCircle className="mx-auto mb-3 text-red-500" size={40} />
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-colors font-medium"
            >
                <RefreshCw size={18} />
                إعادة المحاولة
            </button>
        </div>
    );

    const EmptyState = ({ message }: { message: string }) => (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen size={40} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-charcoal mb-2">{message}</h3>
        </div>
    );

    return (
        <>
            <div className="academic-browse">
                {/* Breadcrumb Navigation */}
                <nav className="mb-6">
                    <div className="flex items-center gap-2 text-sm">
                        {getBreadcrumbs().map((item, index, arr) => (
                            <div key={index} className="flex items-center gap-2">
                                {index > 0 && (
                                    isRTL ? <ChevronLeft size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />
                                )}
                                {item.onClick ? (
                                    <button
                                        onClick={item.onClick}
                                        className="text-shibl-crimson hover:text-shibl-crimson/80 font-medium transition-colors flex items-center gap-1"
                                    >
                                        {index === 0 && <Home size={14} />}
                                        {item.label}
                                    </button>
                                ) : (
                                    <span className="text-slate-600 font-medium">{item.label}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </nav>

                {/* Back Button (when not on grades) */}
                {currentStep.step !== 'grades' && (
                    <button
                        onClick={handleBack}
                        className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors font-medium"
                    >
                        <ArrowLeft size={18} className={isRTL ? 'rotate-180' : ''} />
                        رجوع
                    </button>
                )}

                {/* Step Title */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-charcoal mb-2">
                        {currentStep.step === 'grades' && 'اختر المرحلة الدراسية'}
                        {currentStep.step === 'semesters' && `فصول ${currentStep.gradeName}`}
                        {currentStep.step === 'courses' && `مواد ${currentStep.semesterName}`}
                    </h2>
                    <p className="text-slate-500">
                        {currentStep.step === 'grades' && 'حدد مرحلتك الدراسية للبدء في استعراض المواد'}
                        {currentStep.step === 'semesters' && 'اختر الفصل الدراسي لعرض المواد المتاحة'}
                        {currentStep.step === 'courses' && 'استعرض المواد الدراسية المتاحة واشترك الآن'}
                    </p>
                </div>

                {/* Loading State */}
                {loading && <LoadingSkeleton count={currentStep.step === 'semesters' ? 2 : 6} />}

                {/* Error State */}
                {error && !loading && (
                    <ErrorState onRetry={() => {
                        if (currentStep.step === 'grades') fetchGrades();
                        else if (currentStep.step === 'semesters') fetchSemesters(currentStep.gradeId);
                        else fetchCourses(currentStep.gradeId, currentStep.semesterId);
                    }} />
                )}

                {/* Grades Grid */}
                {!loading && !error && currentStep.step === 'grades' && (
                    grades.length === 0 ? (
                        <EmptyState message="لا توجد مراحل دراسية متاحة حالياً" />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {grades.map((grade, index) => (
                                <button
                                    key={grade.id}
                                    onClick={() => handleGradeSelect(grade)}
                                    className="group bg-white rounded-2xl p-6 border border-slate-100 hover:border-transparent hover:shadow-xl transition-all duration-300 text-right"
                                >
                                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradeColors[index % gradeColors.length]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                        <GraduationCap size={28} className="text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-charcoal mb-1 group-hover:text-shibl-crimson transition-colors">
                                        {getLocalizedName(grade.name, 'المرحلة')}
                                    </h3>
                                    {grade.description && (
                                        <p className="text-sm text-slate-500 line-clamp-2">
                                            {getLocalizedName(grade.description, '')}
                                        </p>
                                    )}
                                    <div className="mt-4 flex items-center gap-1 text-sm text-shibl-crimson font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span>استعراض الفصول</span>
                                        {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )
                )}

                {/* Semesters Grid */}
                {!loading && !error && currentStep.step === 'semesters' && (
                    semesters.length === 0 ? (
                        <EmptyState message="لا توجد فصول دراسية متاحة لهذه المرحلة" />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {semesters.map((semester, index) => {
                                const SemIcon = semesterIcons[index % semesterIcons.length];
                                return (
                                    <button
                                        key={semester.id}
                                        onClick={() => handleSemesterSelect(semester)}
                                        className="group bg-white rounded-2xl p-6 border border-slate-100 hover:border-shibl-crimson/20 hover:shadow-xl transition-all duration-300 text-right"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-shibl-crimson to-shibl-crimson/80 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-lg">
                                                <SemIcon size={32} className="text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-charcoal mb-2 group-hover:text-shibl-crimson transition-colors">
                                                    {getLocalizedName(semester.name, 'الفصل')}
                                                </h3>
                                                {semester.start_date && semester.end_date && (
                                                    <p className="text-sm text-slate-500 flex items-center gap-1.5">
                                                        <Calendar size={14} />
                                                        {new Date(semester.start_date).toLocaleDateString('ar-EG')} - {new Date(semester.end_date).toLocaleDateString('ar-EG')}
                                                    </p>
                                                )}
                                                <div className="mt-3 flex items-center gap-1 text-sm text-shibl-crimson font-medium">
                                                    <span>عرض المواد</span>
                                                    {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )
                )}

                {/* Courses Grid */}
                {!loading && !error && currentStep.step === 'courses' && (
                    courses.length === 0 ? (
                        <EmptyState message="لا توجد مواد دراسية متاحة لهذا الفصل" />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {courses.map(course => {
                                const courseName = getLocalizedName(course.name, 'مادة');
                                const teacherName = course.teacher?.name || 'مدرس غير محدد';

                                return (
                                    <div
                                        key={course.id}
                                        onClick={() => onCourseSelect?.(course.id)}
                                        className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-shibl-crimson/20 hover:shadow-xl transition-all duration-300 cursor-pointer"
                                    >
                                        {/* Course Image/Placeholder */}
                                        <div className="h-36 bg-gradient-to-br from-shibl-crimson/10 to-shibl-crimson/5 flex items-center justify-center relative overflow-hidden">
                                            {course.image_path ? (
                                                <img
                                                    src={course.image_path}
                                                    alt={courseName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <BookOpen size={48} className="text-shibl-crimson/30" />
                                            )}
                                            {course.is_promoted && (
                                                <span className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                                                    مميز
                                                </span>
                                            )}
                                        </div>

                                        <div className="p-5">
                                            <h3 className="text-lg font-bold text-charcoal mb-2 line-clamp-1 group-hover:text-shibl-crimson transition-colors">
                                                {courseName}
                                            </h3>

                                            <div className="flex items-center gap-2 text-slate-500 text-sm mb-3">
                                                <Users size={14} />
                                                <span>{teacherName}</span>
                                            </div>

                                            {course.duration_hours && (
                                                <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                                                    <Clock size={14} />
                                                    <span>{course.duration_hours} ساعة</span>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between">
                                                {course.price !== undefined && course.price > 0 ? (
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-xl font-bold text-shibl-crimson">{course.price}</span>
                                                        <span className="text-sm text-slate-500">ر.ع</span>
                                                        {course.old_price && course.old_price > course.price && (
                                                            <span className="text-sm text-slate-400 line-through">{course.old_price}</span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-emerald-600 font-bold">مجاني</span>
                                                )}

                                                {/* Dynamic Subscribe Button */}
                                                {(() => {
                                                    const sub = getSubscriptionStatus(course.id);
                                                    const isFree = !course.price || course.price === 0;

                                                    if (sub?.status === 1) {
                                                        // Active subscription
                                                        return (
                                                            <span className="px-4 py-2 bg-emerald-100 text-emerald-700 text-sm font-bold rounded-xl flex items-center gap-1.5">
                                                                <CheckCircle size={14} />
                                                                مشترك
                                                            </span>
                                                        );
                                                    } else if (sub?.status === 2) {
                                                        // Pending subscription
                                                        return (
                                                            <span className="px-4 py-2 bg-amber-100 text-amber-700 text-sm font-bold rounded-xl flex items-center gap-1.5">
                                                                <Loader2 size={14} className="animate-spin" />
                                                                قيد المراجعة
                                                            </span>
                                                        );
                                                    } else if (sub?.status === 3) {
                                                        // Rejected subscription
                                                        return (
                                                            <button
                                                                onClick={(e) => handleSubscribeClick(e, course)}
                                                                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 text-sm font-bold rounded-xl transition-colors flex items-center gap-1.5"
                                                            >
                                                                <XCircle size={14} />
                                                                إعادة الطلب
                                                            </button>
                                                        );
                                                    } else if (isFree) {
                                                        // Free course - immediate enrollment
                                                        const isEnrolling = enrollingCourseId === course.id;
                                                        return (
                                                            <button
                                                                onClick={(e) => handleFreeEnrollment(e, course)}
                                                                disabled={isEnrolling}
                                                                className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-1.5 disabled:opacity-70"
                                                            >
                                                                {isEnrolling ? (
                                                                    <>
                                                                        <Loader2 size={14} className="animate-spin" />
                                                                        جاري التسجيل...
                                                                    </>
                                                                ) : (
                                                                    'ابدأ الآن'
                                                                )}
                                                            </button>
                                                        );
                                                    } else {
                                                        // No subscription - show subscribe button
                                                        return (
                                                            <button
                                                                onClick={(e) => handleSubscribeClick(e, course)}
                                                                className="px-4 py-2 bg-shibl-crimson text-white text-sm font-bold rounded-xl hover:bg-shibl-crimson/90 transition-colors"
                                                            >
                                                                اشترك
                                                            </button>
                                                        );
                                                    }
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                )}
            </div>

            {/* Subscription Modal */}
            {
                selectedCourse && (
                    <SubscriptionModal
                        isOpen={showSubscriptionModal}
                        onClose={() => {
                            setShowSubscriptionModal(false);
                            setSelectedCourse(null);
                        }}
                        course={selectedCourse}
                        onSuccess={handleSubscriptionSuccess}
                    />
                )
            }
        </>
    );
}

