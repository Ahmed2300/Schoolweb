/**
 * TeacherWeeklySchedulePage
 * 
 * Main page for teachers to view and book their weekly recurring schedule.
 * Allows selecting grade/semester, viewing available slots by day,
 * and booking/canceling time slots.
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { studentService, getLocalizedName, type Semester } from '../../../data/api/studentService';
import { useQueryClient } from '@tanstack/react-query';
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
    recurringScheduleKeys,
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
        amber: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-500',
        emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800/30 dark:text-emerald-500',
        red: 'bg-red-50 border-red-200 text-[#AF0C15] dark:bg-red-900/20 dark:border-red-800/30 dark:text-[#E11D48]',
        blue: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800/30 dark:text-blue-500',
    };

    const iconBgClasses = {
        amber: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
        emerald: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
        red: 'bg-[#FEF2F2] dark:bg-red-900/40 text-[#AF0C15] dark:text-[#FF8A92]',
        blue: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
    };

    return (
        <div
            className={`
                flex items-center gap-4 p-5 rounded-2xl shadow-sm border
                transition-all duration-300 hover:shadow-md hover:-translate-y-0.5
                ${colorClasses[color]}
            `}
        >
            <div className={`p-3 rounded-xl shrink-0 ${iconBgClasses[color]}`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0 text-right">
                <p className="text-2xl font-extrabold">{value}</p>
                <p className="text-sm font-medium opacity-80 truncate">{label}</p>
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
                        className="h-16 w-24 shrink-0 animate-pulse rounded-lg bg-gray-200 dark:bg-white/5"
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
                            relative flex min-w-[105px] shrink-0 flex-col items-center gap-1.5 rounded-2xl border-2 px-4 py-3.5 transition-all duration-300
                            ${isSelected
                                ? 'border-[#AF0C15] bg-[#AF0C15]/5 dark:bg-[#AF0C15]/10 shadow-[0_4px_14px_0_rgba(175,12,21,0.15)]'
                                : 'border-gray-200 dark:border-white/5 bg-white dark:bg-[#1E1E1E] hover:border-[#D41420]/30 hover:bg-[#FEF2F2]/50 dark:hover:bg-[#AF0C15]/5'}
                            ${day.is_locked ? 'cursor-not-allowed opacity-50' : ''}
                            ${!day.is_active ? 'opacity-60' : ''}
                        `}
                    >
                        <span className={`text-sm font-bold ${isSelected ? 'text-[#AF0C15]' : 'text-charcoal dark:text-gray-300'}`}>
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
    const cardBaseStyles = "group relative flex flex-col justify-between rounded-2xl p-4 transition-all duration-300 border h-full dark:bg-[#1E1E1E]/50";

    // Dynamic styles based on state - REMOVED cursor-not-allowed from parent
    // Cursor styling should be handled by individual action buttons/divs only
    const stateStyles = slot.is_mine
        ? slot.status === 'pending'
            ? "bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30 hover:shadow-lg hover:shadow-amber-100/50 dark:hover:shadow-none"
            : "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30 hover:shadow-lg hover:shadow-emerald-100/50 dark:hover:shadow-none"
        : slot.is_available
            ? "bg-white dark:bg-[#1E1E1E] border-gray-100 dark:border-white/5 hover:border-[#AF0C15]/30 hover:shadow-[0_8px_24px_0_rgba(175,12,21,0.1)] hover:-translate-y-0.5"
            : "bg-gray-50/80 dark:bg-[#1E1E1E]/30 border-gray-100 dark:border-white/5 opacity-60";

    return (
        <div className={`${cardBaseStyles} ${stateStyles}`}>
            {/* Header Section */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className={`
                        p-2.5 rounded-xl transition-colors
                        ${slot.is_mine ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                            slot.is_available ? 'bg-[#FEF2F2] dark:bg-[#AF0C15]/10 text-[#AF0C15] dark:text-[#E11D48]' :
                                'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500'}
                    `}>
                        <Clock className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className={`text-sm font-bold font-cairo ${slot.is_mine ? 'text-emerald-900 dark:text-emerald-100' : 'text-gray-900 dark:text-white'}`}>
                            {formatTime(slot.start)}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
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
                            w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-200 dark:border-red-900/40
                            text-[#D41420] dark:text-red-400 font-bold text-sm transition-all duration-300
                            hover:bg-[#FEF2F2] dark:hover:bg-red-900/20 hover:border-[#AF0C15] active:scale-[0.98]
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
                    <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-50 dark:bg-[#1E1E1E] border border-gray-100 dark:border-white/5 text-gray-400 dark:text-gray-500 font-medium text-sm cursor-not-allowed">
                        <Lock className="w-4 h-4" />
                        <span>لديك حجز مسبق</span>
                    </div>
                ) : slot.is_available ? (
                    <button
                        onClick={onBook}
                        disabled={isLoading}
                        className="
                            w-full flex items-center justify-center gap-2 py-3 rounded-xl
                            bg-gradient-to-l from-[#AF0C15] to-[#8B0A11]
                            text-white font-bold text-sm shadow-[0_4px_14px_0_rgba(175,12,21,0.39)]
                            transition-all duration-300
                            hover:shadow-[0_8px_24px_0_rgba(175,12,21,0.45)] hover:brightness-110 active:scale-[0.98]
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
                    <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 dark:bg-[#1E1E1E] text-gray-400 dark:text-gray-500 font-medium text-sm cursor-not-allowed">
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
        <div className="flex flex-col justify-between rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#1E1E1E] p-4 h-[180px]">
            {/* Header Skeleton */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/5 animate-pulse" />
                    <div className="flex flex-col gap-1.5">
                        <div className="h-4 w-16 bg-gray-100 dark:bg-white/5 rounded animate-pulse" />
                        <div className="h-3 w-12 bg-gray-50 dark:bg-white/5 rounded animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Button Skeleton */}
            <div className="mt-auto">
                <div className="h-10 w-full rounded-xl bg-gray-100 dark:bg-white/5 animate-pulse" />
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
            <div className="flex flex-col items-center justify-center gap-4 py-8 text-gray-400 dark:text-gray-500 rounded-xl border-2 border-dashed border-gray-100 dark:border-white/10">
                <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-full">
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
                    className="group flex items-start justify-between gap-3 rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#1E1E1E] p-3 hover:shadow-md hover:border-gray-200 dark:hover:border-white/10 transition-all duration-200"
                >
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-gray-900 dark:text-white line-clamp-1">
                                {dayNamesAr[slot.day_of_week] || slot.day_of_week}
                            </span>
                            {statusBadge(slot.status)}
                        </div>

                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
                                <Clock className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                                <span className="dir-ltr">{formatTime(slot.start_time)} - {formatTime(slot.end_time)}</span>
                            </div>
                            {slot.grade && (
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    <GraduationCap className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                                    <span className="line-clamp-1">{slot.grade.name}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => onCancel(slot.id)}
                        disabled={cancellingSlotId === slot.id}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-[#AF0C15] dark:hover:text-[#E11D48] hover:bg-[#FEF2F2] dark:hover:bg-red-900/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="إلغاء الحجز"
                    >
                        {cancellingSlotId === slot.id ? (
                            <Loader2 className="h-5 w-5 animate-spin text-[#AF0C15]" />
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

    // Query client for manual invalidation
    const queryClient = useQueryClient();

    // Queries
    const { data: gradesData, isLoading: isLoadingGrades } = useAssignedGrades();
    const { data: weekConfigData, isLoading: isLoadingWeekConfig, isFetching: isFetchingWeekConfig, refetch: refetchWeekConfig } = useWeekConfig(
        selectedGradeId ?? 0,
        selectedSemesterId ?? 0
    );
    const { data: slotsData, isLoading: isLoadingSlots, isFetching: isFetchingSlots, refetch: refetchSlots } = useAvailableRecurringSlots(
        selectedGradeId ?? 0,
        selectedSemesterId ?? 0,
        selectedDay
    );
    const { data: myScheduleData, isLoading: isLoadingMySchedule, isFetching: isFetchingMySchedule, refetch: refetchMySchedule } = useMyRecurringSchedule(
        selectedSemesterId ?? 0
    );

    const isRefreshing = isFetchingSlots || isFetchingWeekConfig || isFetchingMySchedule;

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

            // Refetch all schedule data when admin approves/rejects a slot
            Promise.all([
                refetchSlots(),
                refetchWeekConfig(),
                refetchMySchedule()
            ]).then(() => {

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

    const handleRefresh = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: recurringScheduleKeys.all });
    }, [queryClient]);

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
        <div className="space-y-6 p-4 md:p-6 font-cairo" dir="rtl">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold bg-gradient-to-l from-[#AF0C15] to-[#E11D48] bg-clip-text text-transparent">
                        جدولي الأسبوعي
                    </h1>
                    <p className="text-slate-grey dark:text-gray-400 mt-1">
                        اختر مواعيد حصصك الأسبوعية المتكررة
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1E1E1E] text-charcoal dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
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
            <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#1E1E1E] p-4 shadow-sm">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="p-2.5 bg-gray-50 dark:bg-white/5 rounded-xl">
                        <GraduationCap className="h-5 w-5 text-charcoal dark:text-gray-400" />
                    </div>
                    <select
                        value={selectedGradeId ?? ''}
                        onChange={(e) => setSelectedGradeId(Number(e.target.value))}
                        disabled={isLoadingGrades}
                        className="flex-1 sm:w-[200px] px-4 py-2.5 border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1E1E1E] text-charcoal dark:text-white rounded-xl focus:ring-2 focus:ring-[#AF0C15]/20 focus:border-[#AF0C15] outline-none transition-all cursor-pointer"
                    >
                        <option value="" disabled>اختر الصف</option>
                        {grades.map((grade) => (
                            <option key={grade.id} value={grade.id}>
                                {grade.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="p-2.5 bg-gray-50 dark:bg-white/5 rounded-xl">
                        <BookOpen className="h-5 w-5 text-charcoal dark:text-gray-400" />
                    </div>
                    <select
                        value={selectedSemesterId ?? ''}
                        onChange={(e) => setSelectedSemesterId(Number(e.target.value))}
                        disabled={isLoadingSemesters || semesters.length === 0}
                        className="flex-1 sm:w-[200px] px-4 py-2.5 border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1E1E1E] text-charcoal dark:text-white rounded-xl focus:ring-2 focus:ring-[#AF0C15]/20 focus:border-[#AF0C15] outline-none disabled:bg-gray-50 dark:disabled:bg-white/5 disabled:text-gray-400 transition-all cursor-pointer"
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
            <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#1E1E1E] p-4 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-charcoal dark:text-white">أيام الأسبوع</h2>
                <WeekDayTabs
                    days={weekConfig}
                    selectedDay={selectedDay}
                    onSelectDay={setSelectedDay}
                    isLoading={isLoadingWeekConfig}
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Available Slots */}
                <div className="lg:col-span-2">
                    <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-[#F8F9FA] dark:bg-[#1E1E1E]/80 p-5 shadow-inner">
                        <h2 className="mb-5 text-lg font-bold text-charcoal dark:text-white">المواعيد المتاحة</h2>

                        {isLoadingSlots ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <TimeSlotCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : availableSlots.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 py-12 text-gray-500 dark:text-gray-400">
                                <Clock className="h-12 w-12 opacity-50 text-gray-400 dark:text-gray-500" />
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
                    <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#1E1E1E] p-5 shadow-sm sticky top-6">
                        <h2 className="mb-5 text-lg font-bold text-charcoal dark:text-white">حجوزاتي</h2>
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
