/**
 * TeacherWeeklySchedulePage
 * 
 * Main page for teachers to view and book their weekly recurring schedule.
 * Allows selecting grade/semester, viewing available slots by day,
 * and booking/canceling time slots.
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { studentService, getLocalizedName, type Semester } from '../../../data/api/studentService';
import {
    Calendar,
    CalendarDays,
    Loader2,
    Clock,
    CheckCircle,
    Lock,
    PlusCircle,
    CalendarPlus,
    XCircle,
    HourglassIcon,
    BookOpen,
    GraduationCap,
    RefreshCw,
    AlertCircle,

    Check,
    Circle,
    User,
    X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
    useAssignedGrades,
    useWeekConfig,
    useAvailableRecurringSlots,
    useMyRecurringSchedule,
    useSubmitRecurringSlot,
    useCancelRecurringSlot,
    type WeekDayConfig,
    type RecurringSlot,
    type AvailableSlot,
} from '../../../hooks/useRecurringSchedule';

// ==================== CONSTANTS ====================

// Arabic day names mapping
const dayNamesAr: Record<string, string> = {
    saturday: 'السبت',
    sunday: 'الأحد',
    monday: 'الاثنين',
    tuesday: 'الثلاثاء',
    wednesday: 'الأربعاء',
    thursday: 'الخميس',
    friday: 'الجمعة',
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Format time string (HH:MM:SS or HH:MM) to Arabic-friendly 12-hour format.
 * Example: "14:30:00" → "02:30 م"
 */
function formatTime(time: string): string {
    if (!time) return '';

    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'م' : 'ص';
    const displayHours = hours % 12 || 12;

    return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// ==================== STAT CARD COMPONENT ====================

interface StatCardProps {
    label: string;
    value: number;
    icon: React.ReactNode;
    color: 'amber' | 'emerald' | 'red' | 'blue';
}

function StatCard({ label, value, icon, color }: StatCardProps) {
    const colorClasses = {
        amber: 'from-amber-500 to-amber-600',
        emerald: 'from-emerald-500 to-emerald-600',
        red: 'from-red-500 to-red-600',
        blue: 'from-blue-500 to-blue-600',
    };

    return (
        <div
            className={`
                flex items-center gap-4 p-4 rounded-2xl shadow-lg text-white
                bg-gradient-to-br ${colorClasses[color]}
                dark:shadow-none border border-transparent dark:border-white/10
            `}
        >
            <div className="p-3 bg-white/20 dark:bg-black/20 rounded-xl shrink-0">
                {icon}
            </div>
            <div className="flex-1 min-w-0 text-right">
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-sm opacity-90 truncate text-white/90">{label}</p>
            </div>
        </div>
    );
}

// ==================== WEEK DAY TABS COMPONENT ====================

interface WeekDayTabsProps {
    days: WeekDayConfig[];
    selectedDay: string;
    onSelectDay: (day: string) => void;
    isLoading?: boolean;
}

function WeekDayTabs({ days, selectedDay, onSelectDay, isLoading }: WeekDayTabsProps) {
    if (isLoading) {
        return (
            <div className="flex gap-2 overflow-x-auto pb-2">
                {[...Array(7)].map((_, i) => (
                    <div
                        key={i}
                        className="h-16 w-24 shrink-0 animate-pulse rounded-lg bg-gray-200 dark:bg-slate-800"
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="flex gap-2 overflow-x-auto pb-2">
            {days.map((day) => {
                const isSelected = selectedDay === day.day;
                const hasBookings = day.my_bookings_count > 0;

                return (
                    <button
                        key={day.day}
                        onClick={() => !day.is_locked && onSelectDay(day.day)}
                        disabled={day.is_locked}
                        className={`
                            relative flex min-w-[100px] shrink-0 flex-col items-center gap-1 rounded-xl border-2 px-4 py-3 transition-all duration-200
                            ${isSelected
                                ? 'border-shibl-crimson bg-shibl-crimson/10 dark:bg-shibl-crimson/20 shadow-md'
                                : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700'}
                            ${day.is_locked ? 'cursor-not-allowed opacity-50' : ''}
                            ${!day.is_active ? 'opacity-60' : ''}
                        `}
                    >
                        <span className={`text-sm font-semibold ${isSelected ? 'text-shibl-crimson' : 'text-gray-700 dark:text-slate-300'}`}>
                            {dayNamesAr[day.day] || day.day}
                        </span>

                        <div className="flex items-center gap-1">
                            {day.is_locked ? (
                                <Lock className="h-3 w-3 text-gray-400" />
                            ) : hasBookings ? (
                                <>
                                    <Check className="h-3 w-3 text-green-500" />
                                    <span className="text-xs text-green-600">
                                        {day.my_bookings_count}
                                    </span>
                                </>
                            ) : (
                                <Circle className="h-3 w-3 text-gray-300" />
                            )}
                        </div>

                        <span
                            className={`
                                absolute -top-2 right-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium
                                ${day.mode === 'individual'
                                    ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-500'
                                    : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-500'}
                            `}
                        >
                            {day.mode === 'individual' ? 'فردي' : 'متعدد'}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

// ==================== TIME SLOT CARD COMPONENT ====================

interface TimeSlotCardProps {
    slot: AvailableSlot;
    onBook: () => void;
    onCancel: () => void;
    isBooking?: boolean;
    isCancelling?: boolean;
    isExtraBooking?: boolean;
    isBookingDisabled?: boolean;
}

function TimeSlotCard({
    slot,
    onBook,
    onCancel,
    isBooking = false,
    isCancelling = false,
    isExtraBooking = false,
    isBookingDisabled = false,
}: TimeSlotCardProps) {
    const isLoading = isBooking || isCancelling;

    // Base card styles with smooth transition and premium interactions
    const cardBaseStyles = "group relative flex flex-col justify-between rounded-2xl p-4 transition-all duration-300 border h-full dark:bg-slate-800/50";

    // Dynamic styles based on state - REMOVED cursor-not-allowed from parent
    // Cursor styling should be handled by individual action buttons/divs only
    const stateStyles = slot.is_mine
        ? slot.status === 'pending'
            ? "bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30 hover:border-amber-300 dark:hover:border-amber-700/50 hover:shadow-lg hover:shadow-amber-100/50 dark:hover:shadow-none"
            : "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30 hover:border-emerald-300 dark:hover:border-emerald-700/50 hover:shadow-lg hover:shadow-emerald-100/50 dark:hover:shadow-none"
        : slot.is_available
            ? "bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:border-shibl-crimson/30 dark:hover:border-shibl-crimson/30 hover:shadow-xl hover:shadow-shibl-crimson/5 dark:hover:shadow-none hover:-translate-y-0.5"
            // No cursor-not-allowed on card - the action div inside will handle it
            : "bg-gray-50/80 dark:bg-slate-900/50 border-gray-100 dark:border-slate-800 opacity-60";

    return (
        <div className={`${cardBaseStyles} ${stateStyles}`}>
            {/* Header Section */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className={`
                        p-2 rounded-xl 
                        ${slot.is_mine ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                            slot.is_available ? 'bg-shibl-crimson/5 dark:bg-shibl-crimson/10 text-shibl-crimson dark:text-shibl-crimson/90' :
                                'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500'}
                    `}>
                        <Clock className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className={`text-sm font-bold font-cairo ${slot.is_mine ? 'text-emerald-900 dark:text-emerald-100' : 'text-gray-900 dark:text-white'}`}>
                            {formatTime(slot.start)}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-slate-500 font-medium">
                            إلى {formatTime(slot.end)}
                        </span>
                    </div>
                </div>

                {/* Badges */}
                {slot.is_mine && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/30 shadow-sm">
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">حجزك</span>
                    </div>
                )}
            </div>

            {/* Action Section */}
            <div className="mt-auto">
                {slot.is_mine ? (
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="
                            w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-red-100 dark:border-red-900/30
                            text-red-500 dark:text-red-400 font-bold text-sm transition-all duration-200
                            hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800/50 active:scale-[0.98]
                            disabled:opacity-50 disabled:cursor-not-allowed
                        "
                    >
                        {isCancelling ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>جاري الإلغاء...</span>
                            </>
                        ) : (
                            <>
                                <X className="w-4 h-4" />
                                <span>إلغاء الحجز</span>
                            </>
                        )}
                    </button>
                ) : isBookingDisabled ? (
                    <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-gray-400 dark:text-slate-500 font-medium text-sm cursor-not-allowed">
                        <Lock className="w-4 h-4" />
                        <span>لديك حجز مسبق</span>
                    </div>
                ) : slot.is_available ? (
                    <button
                        onClick={onBook}
                        disabled={isLoading}
                        className="
                            w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                            bg-gradient-to-l from-shibl-crimson to-rose-600
                            text-white font-bold text-sm shadow-md shadow-shibl-crimson/20
                            transition-all duration-200
                            hover:shadow-lg hover:shadow-shibl-crimson/30 hover:brightness-110 active:scale-[0.98]
                            disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none
                            cursor-pointer pointer-events-auto relative z-10
                        "
                    >
                        {isBooking ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>جاري الحجز...</span>
                            </>
                        ) : (
                            <>
                                {isExtraBooking ? <PlusCircle className="h-4 w-4" /> : <CalendarPlus className="h-4 w-4" />}
                                <span>{isExtraBooking ? 'طلب إضافة حصة' : 'احجز الموعد'}</span>
                            </>
                        )}
                    </button>
                ) : (
                    <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 font-medium text-sm cursor-not-allowed">
                        <User className="w-4 h-4" />
                        <span>غير متاح</span>
                    </div>
                )}
            </div>
        </div >
    );
}

function TimeSlotCardSkeleton() {
    return (
        <div className="flex flex-col justify-between rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 h-[180px]">
            {/* Header Skeleton */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
                    <div className="flex flex-col gap-1.5">
                        <div className="h-4 w-16 bg-gray-100 dark:bg-slate-800 rounded animate-pulse" />
                        <div className="h-3 w-12 bg-gray-50 dark:bg-slate-800/50 rounded animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Button Skeleton */}
            <div className="mt-auto">
                <div className="h-10 w-full rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
            </div>
        </div>
    );
}

// ==================== SCHEDULE SUMMARY COMPONENT ====================

interface ScheduleSummaryProps {
    slots: RecurringSlot[];
    isLoading: boolean;
    onCancel: (slotId: number) => void;
    cancellingSlotId?: number | null;
}

function ScheduleSummary({ slots, isLoading, onCancel, cancellingSlotId }: ScheduleSummaryProps) {
    const statusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30">
                        <CheckCircle className="h-3 w-3" />
                        معتمد
                    </span>
                );
            case 'pending':
                return (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30">
                        <HourglassIcon className="h-3 w-3" />
                        قيد المراجعة
                    </span>
                );
            case 'rejected':
                return (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/30">
                        <XCircle className="h-3 w-3" />
                        مرفوض
                    </span>
                );
            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
                ))}
            </div>
        );
    }

    if (slots.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-8 text-gray-400 dark:text-slate-500 rounded-xl border-2 border-dashed border-gray-100 dark:border-slate-800">
                <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-full">
                    <Calendar className="h-8 w-8 opacity-50" />
                </div>
                <div className="text-center">
                    <p className="font-medium text-gray-900 dark:text-white">لا توجد مواعيد محجوزة</p>
                    <p className="text-xs mt-1">اختر يومًا وقم بحجز موعد</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {slots.map((slot) => (
                <div
                    key={slot.id}
                    className="group flex items-start justify-between gap-3 rounded-xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 hover:shadow-md hover:border-gray-200 dark:hover:border-slate-700 transition-all duration-200"
                >
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-gray-900 dark:text-white line-clamp-1">
                                {dayNamesAr[slot.day_of_week] || slot.day_of_week}
                            </span>
                            {statusBadge(slot.status)}
                        </div>

                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 font-medium">
                                <Clock className="h-3.5 w-3.5 text-gray-400 dark:text-slate-500" />
                                <span className="dir-ltr">{formatTime(slot.start_time)} - {formatTime(slot.end_time)}</span>
                            </div>
                            {slot.grade && (
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 font-medium">
                                    <GraduationCap className="h-3.5 w-3.5 text-gray-400 dark:text-slate-500" />
                                    <span className="line-clamp-1">{slot.grade.name}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => onCancel(slot.id)}
                        disabled={cancellingSlotId === slot.id}
                        className="p-2 text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="إلغاء الحجز"
                    >
                        {cancellingSlotId === slot.id ? (
                            <Loader2 className="h-5 w-5 animate-spin text-red-500" />
                        ) : (
                            <XCircle className="h-5 w-5" />
                        )}
                    </button>
                </div>
            ))}
        </div>
    );
}

// ==================== MAIN PAGE COMPONENT ====================

export function TeacherWeeklySchedulePage() {
    // State
    const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null);
    const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);
    const [selectedDay, setSelectedDay] = useState<string>('sunday');
    const [processingSlotKey, setProcessingSlotKey] = useState<string | null>(null);
    const [cancellingSlotId, setCancellingSlotId] = useState<number | null>(null);

    // Semester state (fetched from API based on selected grade)
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [isLoadingSemesters, setIsLoadingSemesters] = useState(false);

    // Queries
    const { data: gradesData, isLoading: isLoadingGrades } = useAssignedGrades();
    const { data: weekConfigData, isLoading: isLoadingWeekConfig, refetch: refetchWeekConfig } = useWeekConfig(
        selectedGradeId ?? 0,
        selectedSemesterId ?? 0
    );
    const { data: slotsData, isLoading: isLoadingSlots, refetch: refetchSlots } = useAvailableRecurringSlots(
        selectedGradeId ?? 0,
        selectedSemesterId ?? 0,
        selectedDay
    );
    const { data: myScheduleData, isLoading: isLoadingMySchedule, refetch: refetchMySchedule } = useMyRecurringSchedule(
        selectedSemesterId ?? 0
    );

    // Mutations
    const submitSlotMutation = useSubmitRecurringSlot();
    const cancelSlotMutation = useCancelRecurringSlot();

    // Derived data
    const grades = gradesData?.data ?? [];
    const weekConfig: WeekDayConfig[] = weekConfigData?.data ?? [];
    const availableSlots = slotsData?.data ?? [];
    const mySchedule: RecurringSlot[] = myScheduleData?.data ?? [];

    // Fetch semesters when grade changes
    const fetchSemesters = useCallback(async (gradeId: number) => {
        setIsLoadingSemesters(true);
        try {
            const semesterData = await studentService.getSemestersByGrade(gradeId);
            setSemesters(semesterData);
            // Auto-select first semester if available
            if (semesterData.length > 0 && !selectedSemesterId) {
                setSelectedSemesterId(semesterData[0].id);
            } else if (semesterData.length > 0) {
                // If current selected semester is not in new grade's semesters, select first one
                const isCurrentSemesterValid = semesterData.some(s => s.id === selectedSemesterId);
                if (!isCurrentSemesterValid) {
                    setSelectedSemesterId(semesterData[0].id);
                }
            } else {
                setSelectedSemesterId(null);
            }
        } catch (error) {
            console.error('Error fetching semesters:', error);
            setSemesters([]);
            setSelectedSemesterId(null);
        } finally {
            setIsLoadingSemesters(false);
        }
    }, [selectedSemesterId]);

    // Set initial grade when grades load
    useEffect(() => {
        if (grades.length > 0 && !selectedGradeId) {
            setSelectedGradeId(grades[0].id);
        }
    }, [grades, selectedGradeId]);

    // Fetch semesters when grade changes
    useEffect(() => {
        if (selectedGradeId) {
            fetchSemesters(selectedGradeId);
        }
    }, [selectedGradeId, fetchSemesters]);

    // Stats calculations
    const stats = useMemo(() => {
        const pending = mySchedule.filter((s) => s.status === 'pending').length;
        const approved = mySchedule.filter((s) => s.status === 'approved').length;
        const rejected = mySchedule.filter((s) => s.status === 'rejected').length;
        return { pending, approved, rejected, total: mySchedule.length };
    }, [mySchedule]);

    // Real-time slot decision updates from admin
    useEffect(() => {
        const handleSlotDecision = (event: CustomEvent) => {
            console.log('TeacherWeeklySchedulePage: Received slot-decision-change event', event.detail);
            // Refetch all schedule data when admin approves/rejects a slot
            Promise.all([
                refetchSlots(),
                refetchWeekConfig(),
                refetchMySchedule()
            ]).then(() => {
                console.log('Schedule data refreshed after admin decision');
            });
        };

        window.addEventListener('slot-decision-change', handleSlotDecision as EventListener);
        return () => {
            window.removeEventListener('slot-decision-change', handleSlotDecision as EventListener);
        };
    }, [refetchSlots, refetchWeekConfig, refetchMySchedule]);

    // Handlers
    const handleBookSlot = async (startTime: string, endTime: string) => {
        if (!selectedGradeId) {
            toast.error('الرجاء اختيار صف أولاً');
            return;
        }

        if (!selectedSemesterId) {
            toast.error('الرجاء اختيار الفصل الدراسي أولاً');
            return;
        }

        const slotKey = `${startTime}-${endTime}`;
        setProcessingSlotKey(slotKey);

        try {
            await submitSlotMutation.mutateAsync({
                grade_id: selectedGradeId,
                semester_id: selectedSemesterId,
                day_of_week: selectedDay,
                start_time: startTime,
                end_time: endTime,
            });

            // Refetch data
            await Promise.all([
                refetchSlots(),
                refetchWeekConfig(),
                refetchMySchedule()
            ]);
        } catch (error) {
            console.error(error);
        } finally {
            setProcessingSlotKey(null);
        }
    };

    const handleCancelSlot = async (slotId: number) => {
        setCancellingSlotId(slotId);
        try {
            await cancelSlotMutation.mutateAsync(slotId);

            // Refetch data
            await Promise.all([
                refetchSlots(),
                refetchWeekConfig(),
                refetchMySchedule()
            ]);
        } catch {
            // Error handled by mutation hook
        } finally {
            setCancellingSlotId(null);
        }
    };

    const handleRefresh = () => {
        refetchSlots();
        refetchWeekConfig();
        refetchMySchedule();
    };

    // If no grades assigned
    if (!isLoadingGrades && grades.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <AlertCircle className="h-16 w-16 text-amber-500" />
                <h2 className="text-xl font-semibold text-gray-900">لا توجد صفوف مسندة إليك</h2>
                <p className="text-gray-600 text-center max-w-md">
                    يرجى التواصل مع إدارة المدرسة لإسناد صفوف لك حتى تتمكن من حجز مواعيد الحصص.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4 md:p-6" dir="rtl">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">جدولي الأسبوعي</h1>
                    <p className="text-gray-600 dark:text-slate-400">اختر مواعيد حصصك الأسبوعية المتكررة</p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={isLoadingSlots}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`h-4 w-4 ${isLoadingSlots ? 'animate-spin' : ''}`} />
                    تحديث
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard
                    label="إجمالي الحجوزات"
                    value={stats.total}
                    icon={<CalendarDays className="h-6 w-6" />}
                    color="blue"
                />
                <StatCard
                    label="معتمدة"
                    value={stats.approved}
                    icon={<CheckCircle className="h-6 w-6" />}
                    color="emerald"
                />
                <StatCard
                    label="قيد المراجعة"
                    value={stats.pending}
                    icon={<HourglassIcon className="h-6 w-6" />}
                    color="amber"
                />
                <StatCard
                    label="مرفوضة"
                    value={stats.rejected}
                    icon={<XCircle className="h-6 w-6" />}
                    color="red"
                />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-gray-500 dark:text-slate-400" />
                    <select
                        value={selectedGradeId ?? ''}
                        onChange={(e) => setSelectedGradeId(Number(e.target.value))}
                        disabled={isLoadingGrades}
                        className="w-[180px] px-3 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-shibl-crimson focus:border-shibl-crimson outline-none"
                    >
                        <option value="" disabled>اختر الصف</option>
                        {grades.map((grade) => (
                            <option key={grade.id} value={grade.id}>
                                {grade.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-gray-500 dark:text-slate-400" />
                    <select
                        value={selectedSemesterId ?? ''}
                        onChange={(e) => setSelectedSemesterId(Number(e.target.value))}
                        disabled={isLoadingSemesters || semesters.length === 0}
                        className="w-[180px] px-3 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-shibl-crimson focus:border-shibl-crimson outline-none disabled:bg-gray-50 dark:disabled:bg-slate-800/50 disabled:text-gray-400"
                    >
                        {isLoadingSemesters ? (
                            <option value="" disabled>جاري التحميل...</option>
                        ) : semesters.length === 0 ? (
                            <option value="" disabled>لا توجد فصول دراسية</option>
                        ) : (
                            <>
                                <option value="" disabled>اختر الفصل الدراسي</option>
                                {semesters.map((sem: Semester) => (
                                    <option key={sem.id} value={sem.id}>
                                        {getLocalizedName(sem.name)}
                                    </option>
                                ))}
                            </>
                        )}
                    </select>
                </div>
            </div>

            {/* Day Tabs */}
            <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                <h2 className="mb-4 font-semibold text-gray-900 dark:text-white">أيام الأسبوع</h2>
                <WeekDayTabs
                    days={weekConfig}
                    selectedDay={selectedDay}
                    onSelectDay={setSelectedDay}
                    isLoading={isLoadingWeekConfig}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Available Slots */}
                <div className="lg:col-span-2">
                    <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                        <h2 className="mb-4 font-semibold text-gray-900 dark:text-white">المواعيد المتاحة</h2>

                        {isLoadingSlots ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <TimeSlotCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : availableSlots.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 py-12 text-gray-500 dark:text-slate-400">
                                <Clock className="h-12 w-12 opacity-50 text-gray-400 dark:text-slate-500" />
                                <p>لا توجد مواعيد متاحة لهذا اليوم</p>
                                <p className="text-sm">جرب اختيار يوم آخر</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {availableSlots.map((slot) => (
                                    <TimeSlotCard
                                        key={`${slot.start}-${slot.end}`}
                                        slot={slot}
                                        onBook={() => handleBookSlot(slot.start, slot.end)}
                                        onCancel={() => slot.slot_id && handleCancelSlot(slot.slot_id)}
                                        isBooking={processingSlotKey === `${slot.start}-${slot.end}`}
                                        isCancelling={!!slot.slot_id && cancellingSlotId === slot.slot_id}
                                        isExtraBooking={false}
                                        // REMOVED: isBookingDisabled was incorrectly blocking ALL slots
                                        // when ANY booking existed. The backend's is_available flag
                                        // already correctly determines slot availability.
                                        isBookingDisabled={false}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* My Schedule Summary */}
                <div className="lg:col-span-1">
                    <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sticky top-4">
                        <h2 className="mb-4 font-semibold text-gray-900 dark:text-white">حجوزاتي</h2>
                        <ScheduleSummary
                            slots={mySchedule}
                            isLoading={isLoadingMySchedule}
                            onCancel={handleCancelSlot}
                            cancellingSlotId={cancellingSlotId}
                        />
                    </div>
                </div>
            </div>
        </div >
    );
}

export default TeacherWeeklySchedulePage;
