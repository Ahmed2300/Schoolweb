/**
 * Schedule Lecture Modal Component - Premium Edition
 *
 * A beautifully designed modal for students to schedule lectures.
 * Features: Visual course cards with images, hierarchical selection, premium animations.
 *
 * Following Senior Full Stack Design Principles:
 * - Visual hierarchy with whitespace and typography
 * - Micro-interactions for feedback
 * - Mobile-first responsive design
 * - Semantic HTML & accessibility
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    X,
    Calendar,
    Clock,
    BookOpen,
    Video,
    Loader2,
    AlertCircle,
    CheckCircle,
    ChevronDown,
    ChevronRight,
    Sparkles,
    GraduationCap,
    ArrowRight,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { studentService, Course, Lecture, getLocalizedName } from '@/data/api/studentService';
import { useCreateSchedule, useSchedules } from '@/hooks/useSchedule';
import { format, addDays, setHours, setMinutes, parseISO, getHours, isSameDay } from 'date-fns';
import { ar } from 'date-fns/locale';

// ============================================================
// Types
// ============================================================

interface ScheduleLectureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

type Step = 'course' | 'lecture' | 'datetime' | 'submitting' | 'success' | 'error';

// ============================================================
// Constants
// ============================================================

const COURSE_PLACEHOLDER = '/images/course-placeholder.png';

const TIME_SLOTS = [
    { label: '١٢:٠٠ ص', value: '00:00' },
    { label: '١:٠٠ ص', value: '01:00' },
    { label: '٢:٠٠ ص', value: '02:00' },
    { label: '٣:٠٠ ص', value: '03:00' },
    { label: '٤:٠٠ ص', value: '04:00' },
    { label: '٥:٠٠ ص', value: '05:00' },
    { label: '٦:٠٠ ص', value: '06:00' },
    { label: '٧:٠٠ ص', value: '07:00' },
    { label: '٨:٠٠ ص', value: '08:00' },
    { label: '٩:٠٠ ص', value: '09:00' },
    { label: '١٠:٠٠ ص', value: '10:00' },
    { label: '١١:٠٠ ص', value: '11:00' },
    { label: '١٢:٠٠ م', value: '12:00' },
    { label: '١:٠٠ م', value: '13:00' },
    { label: '٢:٠٠ م', value: '14:00' },
    { label: '٣:٠٠ م', value: '15:00' },
    { label: '٤:٠٠ م', value: '16:00' },
    { label: '٥:٠٠ م', value: '17:00' },
    { label: '٦:٠٠ م', value: '18:00' },
    { label: '٧:٠٠ م', value: '19:00' },
    { label: '٨:٠٠ م', value: '20:00' },
    { label: '٩:٠٠ م', value: '21:00' },
    { label: '١٠:٠٠ م', value: '22:00' },
    { label: '١١:٠٠ م', value: '23:00' },
];

// Generate next 14 days
const generateDateOptions = () => {
    const dates = [];
    for (let i = 0; i < 14; i++) {
        const date = addDays(new Date(), i);
        dates.push({
            value: format(date, 'yyyy-MM-dd'),
            label: i === 0 ? 'اليوم' : i === 1 ? 'غداً' : format(date, 'EEEE d MMMM', { locale: ar }),
            shortLabel: format(date, 'EEE', { locale: ar }),
            dayNum: format(date, 'd'),
            date,
            isToday: i === 0,
            isTomorrow: i === 1,
        });
    }
    return dates;
};

// ============================================================
// Course Card Component
// ============================================================

interface CourseCardProps {
    course: Course;
    isSelected: boolean;
    onClick: () => void;
}

function CourseCard({ course, isSelected, onClick }: CourseCardProps) {
    const courseName = getLocalizedName(course.name, 'مادة');
    // Check all possible image fields from the API
    const courseImage = course.image_path || course.image || course.thumbnail || COURSE_PLACEHOLDER;

    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                group relative w-full overflow-hidden rounded-2xl border-2 transition-all duration-300
                ${isSelected
                    ? 'border-shibl-crimson ring-4 ring-shibl-crimson/20 scale-[1.02]'
                    : 'border-slate-200 hover:border-shibl-crimson/40 hover:shadow-lg hover:scale-[1.01]'
                }
            `}
        >
            {/* Course Image */}
            <div className="relative h-28 overflow-hidden">
                <img
                    src={courseImage}
                    alt={courseName}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = COURSE_PLACEHOLDER;
                    }}
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Selected Indicator */}
                {isSelected && (
                    <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-shibl-crimson flex items-center justify-center shadow-lg animate-in zoom-in duration-200">
                        <CheckCircle size={16} className="text-white" />
                    </div>
                )}
            </div>

            {/* Course Info */}
            <div className="p-4 bg-white">
                <h4 className={`font-bold text-base mb-1 truncate text-right ${isSelected ? 'text-shibl-crimson' : 'text-charcoal'}`}>
                    {courseName}
                </h4>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <GraduationCap size={14} />
                    <span>مادة دراسية</span>
                </div>
            </div>

            {/* Hover Arrow */}
            <div className={`
                absolute left-3 bottom-14 w-8 h-8 rounded-full bg-shibl-crimson/10 flex items-center justify-center
                transition-all duration-300
                ${isSelected ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}
            `}>
                <ChevronRight size={16} className="text-shibl-crimson" />
            </div>
        </button>
    );
}

// ============================================================
// Lecture Card Component
// ============================================================

interface LectureCardProps {
    lecture: Lecture;
    isSelected: boolean;
    onClick: () => void;
}

function LectureCard({ lecture, isSelected, onClick }: LectureCardProps) {
    const lectureTitle = getLocalizedName(lecture.title, 'محاضرة');
    const duration = lecture.duration_minutes ? `${lecture.duration_minutes} دقيقة` : '';

    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                group w-full p-4 rounded-xl border-2 transition-all duration-300 text-right
                ${isSelected
                    ? 'border-shibl-crimson bg-shibl-crimson/5 ring-2 ring-shibl-crimson/20'
                    : 'border-slate-200 hover:border-shibl-crimson/40 hover:bg-slate-50'
                }
            `}
        >
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
                    ${isSelected ? 'bg-shibl-crimson text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-shibl-crimson/10 group-hover:text-shibl-crimson'}
                `}>
                    <Video size={22} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h4 className={`font-bold text-base mb-1 truncate ${isSelected ? 'text-shibl-crimson' : 'text-charcoal'}`}>
                        {lectureTitle}
                    </h4>
                    {duration && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock size={12} />
                            <span>{duration}</span>
                        </div>
                    )}
                </div>

                {/* Selection Indicator */}
                <div className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                    ${isSelected
                        ? 'border-shibl-crimson bg-shibl-crimson'
                        : 'border-slate-300 group-hover:border-shibl-crimson/50'
                    }
                `}>
                    {isSelected && <CheckCircle size={14} className="text-white" />}
                </div>
            </div>
        </button>
    );
}

// ============================================================
// Date Card Component
// ============================================================

interface DateCardProps {
    date: ReturnType<typeof generateDateOptions>[0];
    isSelected: boolean;
    onClick: () => void;
}

function DateCard({ date, isSelected, onClick }: DateCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 min-w-[72px]
                ${isSelected
                    ? 'border-shibl-crimson bg-shibl-crimson text-white shadow-lg shadow-shibl-crimson/30'
                    : 'border-slate-200 bg-white hover:border-shibl-crimson/40 hover:bg-shibl-crimson/5'
                }
            `}
        >
            <span className={`text-xs font-medium mb-1 ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                {date.isToday ? 'اليوم' : date.isTomorrow ? 'غداً' : date.shortLabel}
            </span>
            <span className={`text-xl font-bold ${isSelected ? 'text-white' : 'text-charcoal'}`}>
                {date.dayNum}
            </span>
        </button>
    );
}

// ============================================================
// Time Slot Grid Component
// ============================================================

interface TimeSlotGridProps {
    selectedTime: string;
    onSelect: (time: string) => void;
    selectedDate: string;
    busyHours: number[];
}

function TimeSlotGrid({ selectedTime, onSelect, selectedDate, busyHours }: TimeSlotGridProps) {
    const isToday = selectedDate === format(new Date(), 'yyyy-MM-dd');
    const currentHour = new Date().getHours();

    const availableSlots = TIME_SLOTS.filter((slot) => {
        if (isToday) {
            const [hours] = slot.value.split(':').map(Number);
            return hours > currentHour;
        }
        return true;
    }).map((slot) => {
        const [hours] = slot.value.split(':').map(Number);
        return { ...slot, isBusy: busyHours.includes(hours) };
    });

    if (availableSlots.length === 0) {
        return (
            <div className="text-center py-8 text-slate-500">
                <Clock size={32} className="mx-auto mb-3 text-slate-300" />
                <p>لا توجد أوقات متاحة اليوم</p>
                <p className="text-sm">يرجى اختيار يوم آخر</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {availableSlots.map((slot) => (
                <button
                    key={slot.value}
                    type="button"
                    onClick={() => onSelect(slot.value)}
                    title={slot.isBusy ? 'يوجد موعد مسجل في هذا الوقت' : undefined}
                    className={`
                        relative py-2.5 px-1 rounded-lg text-sm font-medium transition-all duration-200
                        ${selectedTime === slot.value
                            ? 'bg-shibl-crimson text-white shadow-md shadow-shibl-crimson/30'
                            : slot.isBusy
                                ? 'bg-amber-100 text-amber-700 border-2 border-amber-300 hover:bg-amber-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-shibl-crimson/10 hover:text-shibl-crimson'
                        }
                    `}
                >
                    {slot.label}
                    {slot.isBusy && !selectedTime.includes(slot.value) && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-white" />
                    )}
                </button>
            ))}
        </div>
    );
}

// ============================================================
// Progress Steps Component
// ============================================================

interface ProgressStepsProps {
    currentStep: Step;
}

function ProgressSteps({ currentStep }: ProgressStepsProps) {
    const steps = [
        { id: 'course', label: 'اختر المادة', icon: BookOpen },
        { id: 'lecture', label: 'اختر المحاضرة', icon: Video },
        { id: 'datetime', label: 'حدد الموعد', icon: Calendar },
    ];

    const getStepStatus = (stepId: string) => {
        const order = ['course', 'lecture', 'datetime'];
        const currentIndex = order.indexOf(currentStep);
        const stepIndex = order.indexOf(stepId);

        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'current';
        return 'upcoming';
    };

    return (
        <div className="flex items-center justify-between px-2">
            {steps.map((step, index) => {
                const status = getStepStatus(step.id);
                const Icon = step.icon;

                return (
                    <React.Fragment key={step.id}>
                        <div className="flex flex-col items-center gap-2">
                            <div className={`
                                w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                                ${status === 'completed' ? 'bg-emerald-500 text-white' : ''}
                                ${status === 'current' ? 'bg-shibl-crimson text-white shadow-lg shadow-shibl-crimson/30' : ''}
                                ${status === 'upcoming' ? 'bg-slate-100 text-slate-400' : ''}
                            `}>
                                {status === 'completed' ? <CheckCircle size={20} /> : <Icon size={20} />}
                            </div>
                            <span className={`text-xs font-medium ${status === 'current' ? 'text-shibl-crimson' : 'text-slate-500'}`}>
                                {step.label}
                            </span>
                        </div>

                        {index < steps.length - 1 && (
                            <div className={`
                                flex-1 h-0.5 mx-2 rounded-full transition-colors
                                ${status === 'completed' ? 'bg-emerald-500' : 'bg-slate-200'}
                            `} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

// ============================================================
// Main Component
// ============================================================

export function ScheduleLectureModal({
    isOpen,
    onClose,
    onSuccess,
}: ScheduleLectureModalProps) {
    // Form state
    const [step, setStep] = useState<Step>('course');
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Mutations
    const createSchedule = useCreateSchedule();

    // Fetch courses with active subscriptions
    const { data: subscriptions, isLoading: isLoadingCourses } = useQuery({
        queryKey: ['student-subscriptions'],
        queryFn: studentService.getMySubscriptions,
        enabled: isOpen,
    });

    // Extract subscribed courses
    const subscribedCourses = subscriptions
        ?.filter((s) => s.status === 1) // Active subscriptions only
        .map((s) => s.course)
        .filter((c): c is Course => !!c) ?? [];

    // Fetch lectures for selected course
    const { data: lecturesResponse, isLoading: isLoadingLectures } = useQuery({
        queryKey: ['lectures', selectedCourse?.id],
        queryFn: () => studentService.getLectures({ course_id: selectedCourse!.id, per_page: 100 }),
        enabled: !!selectedCourse,
    });

    const lectures = lecturesResponse?.data ?? [];

    // Fetch existing schedules for conflict detection
    const { data: existingSchedules } = useSchedules();

    // Compute busy hours for the selected date
    const busyHours = React.useMemo(() => {
        if (!selectedDate || !existingSchedules) return [];

        const selectedDateObj = new Date(selectedDate);
        return existingSchedules
            .filter((s) => isSameDay(parseISO(s.scheduled_at), selectedDateObj))
            .map((s) => getHours(parseISO(s.scheduled_at)));
    }, [selectedDate, existingSchedules]);

    // Date options
    const dateOptions = generateDateOptions();

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setStep('course');
            setSelectedCourse(null);
            setSelectedLecture(null);
            setSelectedDate('');
            setSelectedTime('');
            setError(null);
        }
    }, [isOpen]);

    // Reset lecture when course changes
    useEffect(() => {
        setSelectedLecture(null);
    }, [selectedCourse]);

    // Reset time when date changes to today and time is past
    useEffect(() => {
        if (selectedDate === format(new Date(), 'yyyy-MM-dd') && selectedTime) {
            const [hours] = selectedTime.split(':').map(Number);
            if (hours <= new Date().getHours()) {
                setSelectedTime('');
            }
        }
    }, [selectedDate, selectedTime]);

    // Handlers
    const handleCourseSelect = useCallback((course: Course) => {
        setSelectedCourse(course);
        setError(null);
        setStep('lecture');
    }, []);

    const handleLectureSelect = useCallback((lecture: Lecture) => {
        setSelectedLecture(lecture);
        setError(null);
        setStep('datetime');
    }, []);

    const handleSubmit = async () => {
        if (!selectedDate || !selectedTime || !selectedLecture) {
            setError('يرجى اختيار التاريخ والوقت');
            return;
        }

        // Build datetime preserving local timezone
        // Instead of toISOString() (which converts to UTC), we create a timezone-aware string
        const [hours, minutes] = selectedTime.split(':').map(Number);
        const scheduledDate = setMinutes(setHours(new Date(selectedDate), hours), minutes);

        // Format as ISO with timezone offset (e.g., "2024-10-20T10:00:00+03:00")
        const tzOffset = -scheduledDate.getTimezoneOffset();
        const tzHours = Math.floor(Math.abs(tzOffset) / 60).toString().padStart(2, '0');
        const tzMinutes = (Math.abs(tzOffset) % 60).toString().padStart(2, '0');
        const tzSign = tzOffset >= 0 ? '+' : '-';

        const year = scheduledDate.getFullYear();
        const month = (scheduledDate.getMonth() + 1).toString().padStart(2, '0');
        const day = scheduledDate.getDate().toString().padStart(2, '0');
        const hour = scheduledDate.getHours().toString().padStart(2, '0');
        const minute = scheduledDate.getMinutes().toString().padStart(2, '0');
        const second = '00';

        const scheduledAt = `${year}-${month}-${day}T${hour}:${minute}:${second}${tzSign}${tzHours}:${tzMinutes}`;

        setStep('submitting');
        setError(null);

        try {
            await createSchedule.mutateAsync({
                lecture_id: selectedLecture.id,
                scheduled_at: scheduledAt,
            });
            setStep('success');
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                'حدث خطأ أثناء جدولة المحاضرة';
            setError(message);
            setStep('datetime');
        }
    };

    const handleClose = () => {
        if (step === 'success' && onSuccess) {
            onSuccess();
            return;
        }
        onClose();
    };

    const handleBack = () => {
        if (step === 'lecture') setStep('course');
        else if (step === 'datetime') setStep('lecture');
    };

    // Don't render if not open
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="schedule-modal-title"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={handleClose}
                aria-hidden="true"
            />

            {/* Modal - Larger and more spacious */}
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 fade-in duration-300 flex flex-col">
                {/* Header */}
                <header className="relative bg-gradient-to-l from-shibl-crimson via-[#A31621] to-[#8B0A12] px-6 py-6 flex-shrink-0">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10" aria-hidden="true">
                        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/20 -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/2" />
                    </div>

                    <button
                        onClick={handleClose}
                        className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors backdrop-blur-sm z-10"
                        aria-label="إغلاق"
                    >
                        <X size={20} className="text-white" />
                    </button>

                    <div className="flex items-center gap-4 relative">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                            <Calendar size={30} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 id="schedule-modal-title" className="text-2xl font-bold text-white mb-1">
                                إضافة للجدول
                            </h2>
                            <p className="text-white/80 text-sm">اختر محاضرة وحدد الوقت المناسب لدراستك</p>
                        </div>
                    </div>
                </header>

                {/* Progress Steps */}
                {['course', 'lecture', 'datetime'].includes(step) && (
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
                        <ProgressSteps currentStep={step} />
                    </div>
                )}

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Step 1: Select Course */}
                    {step === 'course' && (
                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-charcoal">اختر المادة الدراسية</h3>
                                <span className="text-sm text-slate-500">{subscribedCourses.length} مادة متاحة</span>
                            </div>

                            {isLoadingCourses ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="animate-pulse">
                                            <div className="h-28 bg-slate-200 rounded-t-2xl" />
                                            <div className="p-4 bg-slate-100 rounded-b-2xl">
                                                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                                                <div className="h-3 bg-slate-200 rounded w-1/2" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : subscribedCourses.length === 0 ? (
                                <div className="text-center py-12">
                                    <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                                    <p className="text-slate-500">لا توجد مواد مشترك بها حالياً</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {subscribedCourses.map((course) => (
                                        <CourseCard
                                            key={course.id}
                                            course={course}
                                            isSelected={selectedCourse?.id === course.id}
                                            onClick={() => handleCourseSelect(course)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Select Lecture */}
                    {step === 'lecture' && (
                        <div className="space-y-5">
                            {/* Back & Selected Course */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleBack}
                                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                                >
                                    <ArrowRight size={20} />
                                </button>
                                <div className="flex items-center gap-3 flex-1 bg-slate-50 rounded-xl p-3">
                                    <img
                                        src={selectedCourse?.image_path || selectedCourse?.image || selectedCourse?.thumbnail || COURSE_PLACEHOLDER}
                                        alt=""
                                        className="w-12 h-12 rounded-lg object-cover"
                                    />
                                    <div>
                                        <p className="text-xs text-slate-500">المادة المختارة</p>
                                        <p className="font-bold text-charcoal">
                                            {selectedCourse && getLocalizedName(selectedCourse.name)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-charcoal">اختر المحاضرة</h3>

                            {isLoadingLectures ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="animate-pulse p-4 border rounded-xl flex gap-3">
                                            <div className="w-12 h-12 bg-slate-200 rounded-xl" />
                                            <div className="flex-1">
                                                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                                                <div className="h-3 bg-slate-200 rounded w-1/4" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : lectures.length === 0 ? (
                                <div className="text-center py-12">
                                    <Video size={48} className="mx-auto text-slate-300 mb-4" />
                                    <p className="text-slate-500">لا توجد محاضرات متاحة لهذه المادة</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                                    {lectures.map((lecture) => (
                                        <LectureCard
                                            key={lecture.id}
                                            lecture={lecture}
                                            isSelected={selectedLecture?.id === lecture.id}
                                            onClick={() => handleLectureSelect(lecture)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Select Date & Time */}
                    {step === 'datetime' && (
                        <div className="space-y-6">
                            {/* Back & Selected Items */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleBack}
                                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                                >
                                    <ArrowRight size={20} />
                                </button>
                                <div className="flex-1 bg-gradient-to-l from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                                    <p className="text-sm text-blue-800 font-bold mb-1">
                                        {selectedLecture && getLocalizedName(selectedLecture.title)}
                                    </p>
                                    <p className="text-xs text-blue-600">
                                        {selectedCourse && getLocalizedName(selectedCourse.name)}
                                    </p>
                                </div>
                            </div>

                            {/* Date Selection */}
                            <div className="space-y-3">
                                <h3 className="text-lg font-bold text-charcoal flex items-center gap-2">
                                    <Calendar size={20} className="text-shibl-crimson" />
                                    اختر التاريخ
                                </h3>
                                <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
                                    {dateOptions.slice(0, 7).map((date) => (
                                        <DateCard
                                            key={date.value}
                                            date={date}
                                            isSelected={selectedDate === date.value}
                                            onClick={() => {
                                                setSelectedDate(date.value);
                                                setError(null);
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Time Selection */}
                            {selectedDate && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <h3 className="text-lg font-bold text-charcoal flex items-center gap-2">
                                        <Clock size={20} className="text-shibl-crimson" />
                                        اختر الوقت
                                    </h3>
                                    <TimeSlotGrid
                                        selectedTime={selectedTime}
                                        onSelect={(time) => {
                                            setSelectedTime(time);
                                            setError(null);
                                        }}
                                        selectedDate={selectedDate}
                                        busyHours={busyHours}
                                    />
                                </div>
                            )}

                            {/* Error */}
                            {error && (
                                <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
                                    <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Submitting State */}
                    {step === 'submitting' && (
                        <div className="py-12 text-center">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-shibl-crimson/10 to-shibl-crimson/5 flex items-center justify-center mx-auto mb-6">
                                <Loader2 size={44} className="animate-spin text-shibl-crimson" />
                            </div>
                            <h3 className="text-xl font-bold text-charcoal mb-2">جاري الإضافة...</h3>
                            <p className="text-slate-500 text-sm">يرجى الانتظار قليلاً</p>
                        </div>
                    )}

                    {/* Success State */}
                    {step === 'success' && (
                        <div className="py-8 text-center">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-100">
                                <CheckCircle size={48} className="text-emerald-500" />
                            </div>
                            <div className="flex items-center justify-center gap-2 mb-3">
                                <Sparkles size={20} className="text-amber-500" />
                                <h3 className="text-2xl font-bold text-charcoal">تمت الإضافة بنجاح!</h3>
                                <Sparkles size={20} className="text-amber-500" />
                            </div>
                            <p className="text-slate-500 mb-6 text-sm leading-relaxed max-w-sm mx-auto">
                                تم إضافة المحاضرة إلى جدولك الدراسي. سنذكرك بموعدها!
                            </p>

                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 mb-6 max-w-sm mx-auto">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <Calendar size={20} className="text-blue-600" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-blue-800">
                                            {selectedLecture && getLocalizedName(selectedLecture.title)}
                                        </p>
                                        <p className="text-xs text-blue-600">
                                            {selectedDate && format(new Date(selectedDate), 'EEEE، d MMMM', { locale: ar })}
                                            {' • '}
                                            {selectedTime && TIME_SLOTS.find(t => t.value === selectedTime)?.label}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleClose}
                                className="w-full max-w-sm h-14 rounded-xl bg-slate-100 hover:bg-slate-200 text-charcoal font-bold transition-colors"
                            >
                                حسناً، فهمت
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer - Only show for datetime step */}
                {step === 'datetime' && (
                    <footer className="px-6 py-4 border-t border-slate-100 bg-white flex-shrink-0">
                        <button
                            onClick={handleSubmit}
                            disabled={!selectedDate || !selectedTime}
                            className="w-full h-14 rounded-2xl bg-gradient-to-l from-emerald-500 to-emerald-600 text-white font-bold text-base shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
                        >
                            <Calendar size={20} />
                            إضافة للجدول
                        </button>
                    </footer>
                )}
            </div>
        </div>
    );
}

export default ScheduleLectureModal;
