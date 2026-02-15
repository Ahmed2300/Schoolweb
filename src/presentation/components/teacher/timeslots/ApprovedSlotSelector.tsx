/**
 * ApprovedSlotSelector Component - Weekly Schedule Selector
 * 
 * A comprehensive scheduling system that allows teachers to:
 * - Navigate between weeks (prev/next)
 * - See exact dates for each slot
 * - Only interact with days that have slots (others inactive)
 * - Select a specific date for their lecture
 * - Slots are filtered by grade AND semester
 */

import { useState, useMemo, useCallback } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Clock,
    Loader2,
    Plus,
    CheckCircle2,
    CalendarDays,
    GraduationCap,
    Calendar,
    Radio,
    Ban,
    AlertCircle
} from 'lucide-react';
import { useMyRecurringSchedule, useApprovedOneTimeSlots } from '../../../hooks/useTeacherTimeSlots';
import type { SlotRequest } from '../../../../types/slotRequest';

// ==================== Types ====================

export interface TeacherRecurringSlot {
    id: number;
    teacher_id: number;
    grade_id: number;
    semester_id: number;
    lecture_id: number | null;
    day_of_week: string;
    start_time: string;
    end_time: string;
    status: 'pending' | 'approved' | 'rejected';
    grade?: { id: number; name: string | { ar?: string; en?: string } };
    semester?: { id: number; name: string | { ar?: string; en?: string } };
    lecture?: { id: number; title: string } | null;
}

// Extended slot with specific date for the selected week
export interface DatedSlot extends TeacherRecurringSlot {
    date: Date;
    dateString: string; // "YYYY-MM-DD"
    isBooked: boolean;
    isException?: boolean;
}

// ==================== Constants ====================

// Arabic day names
const DAY_NAMES_AR: Record<string, string> = {
    saturday: 'السبت',
    sunday: 'الأحد',
    monday: 'الاثنين',
    tuesday: 'الثلاثاء',
    wednesday: 'الأربعاء',
    thursday: 'الخميس',
    friday: 'الجمعة',
};

// Short Arabic day names for calendar
const DAY_NAMES_SHORT_AR: Record<string, string> = {
    saturday: 'س',
    sunday: 'أ',
    monday: 'ن',
    tuesday: 'ث',
    wednesday: 'ر',
    thursday: 'خ',
    friday: 'ج',
};

// Day order (week starts Saturday in Arabic calendar)
const DAY_ORDER: string[] = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

// Day colors
const DAY_COLORS: Record<string, { bg: string; border: string; text: string; active: string }> = {
    saturday: { bg: 'bg-violet-50', border: 'border-violet-300', text: 'text-violet-700', active: 'bg-violet-600' },
    sunday: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', active: 'bg-blue-600' },
    monday: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700', active: 'bg-emerald-600' },
    tuesday: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', active: 'bg-amber-600' },
    wednesday: { bg: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-700', active: 'bg-rose-600' },
    thursday: { bg: 'bg-cyan-50', border: 'border-cyan-300', text: 'text-cyan-700', active: 'bg-cyan-600' },
    friday: { bg: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-600', active: 'bg-slate-500' },
};

// Arabic month names
const MONTH_NAMES_AR = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

// ==================== Helper Functions ====================

const getLocalizedName = (name: string | { ar?: string; en?: string } | undefined): string => {
    if (!name) return '';
    if (typeof name === 'string') return name;
    return name.ar || name.en || '';
};

const formatTimeOnly = (time: string | null | undefined): string => {
    if (!time) return '—';

    try {
        const parts = time.split(':');
        if (parts.length < 2) return time;

        const hours = parseInt(parts[0], 10);
        const minutes = parts[1].padStart(2, '0');

        if (isNaN(hours)) return time;

        const period = hours >= 12 ? 'م' : 'ص';
        const displayHours = hours % 12 || 12;

        return `${displayHours}:${minutes} ${period}`;
    } catch {
        return time;
    }
};

// Get Saturday of the week containing the given date
const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay(); // 0 = Sunday, 6 = Saturday
    const diff = day === 6 ? 0 : day + 1; // Distance from Saturday
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
};

// Get all 7 dates of a week starting from the given Saturday
const getWeekDates = (weekStart: Date): Date[] => {
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        dates.push(d);
    }
    return dates;
};

// Format date as "DD month"
const formatDateShort = (date: Date): string => {
    const day = date.getDate();
    const month = MONTH_NAMES_AR[date.getMonth()];
    return `${day} ${month}`;
};

// Format week range
const formatWeekRange = (weekStart: Date): string => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const startDay = weekStart.getDate();
    const endDay = weekEnd.getDate();
    const startMonth = MONTH_NAMES_AR[weekStart.getMonth()];
    const endMonth = MONTH_NAMES_AR[weekEnd.getMonth()];
    const year = weekEnd.getFullYear();

    if (startMonth === endMonth) {
        return `${startDay} - ${endDay} ${startMonth} ${year}`;
    }
    return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${year}`;
};

// Get day name from Date object
const getDayFromDate = (date: Date): string => {
    const dayIndex = date.getDay();
    // Convert JS day (0=Sun, 6=Sat) to our order (0=Sat, 1=Sun...)
    const mappedIndex = dayIndex === 6 ? 0 : dayIndex + 1;
    return DAY_ORDER[mappedIndex];
};

// Convert date to YYYY-MM-DD string
const toDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// ==================== Component Props ====================

interface ApprovedSlotSelectorProps {
    /** Currently selected slot ID */
    selectedSlotId: number | null;
    /** Currently selected date string (YYYY-MM-DD) */
    selectedDate?: string | null;
    /** Callback when a slot is selected */
    onSelect: (slot: DatedSlot | null) => void;
    /** Filter slots by grade ID */
    gradeId?: number;
    /** Filter slots by semester ID */
    semesterId?: number;
    /** Callback to open add slot request dialog */
    onRequestNewSlot?: () => void;
    /** Array of already booked date strings (lectures that exist) */
    bookedDates?: string[];
    /** Optional: Filter slots for a specific teacher (Admin context) */
    teacherId?: number;
}

// ==================== Main Component ====================

export function ApprovedSlotSelector({
    selectedSlotId,
    selectedDate,
    onSelect,
    gradeId,
    semesterId,
    onRequestNewSlot,
    bookedDates = [],
    teacherId,
}: ApprovedSlotSelectorProps) {
    const recurringQuery = useMyRecurringSchedule(teacherId);
    const oneTimeQuery = useApprovedOneTimeSlots(teacherId);

    const allSlots = recurringQuery.data || [];
    const oneTimeSlots = oneTimeQuery.data || [];

    const isLoading = recurringQuery.isLoading || oneTimeQuery.isLoading;
    const error = recurringQuery.error || oneTimeQuery.error;

    // Week navigation state
    const [weekOffset, setWeekOffset] = useState(0);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);

    // Calculate current week's Saturday
    const currentWeekStart = useMemo(() => {
        const today = new Date();
        const thisWeekStart = getWeekStart(today);
        thisWeekStart.setDate(thisWeekStart.getDate() + (weekOffset * 7));
        return thisWeekStart;
    }, [weekOffset]);

    // Get all 7 dates for current week
    const weekDates = useMemo(() => getWeekDates(currentWeekStart), [currentWeekStart]);

    // Filter slots by grade, semester, and status
    const filteredSlots = useMemo(() => {
        const recurringSlots = (allSlots as TeacherRecurringSlot[]).filter(slot => {
            // Must be approved
            if (slot.status !== 'approved') return false;
            // Must not be linked to a lecture already (recurring slot level)
            if (slot.lecture_id !== null) return false;
            // Must match grade if specified
            if (gradeId && slot.grade_id !== gradeId) return false;
            // Must match semester if specified
            if (semesterId && slot.semester_id !== semesterId) return false;
            return true;
        });

        // Add one-time slots that match criteria
        const exceptionSlots = (oneTimeSlots as unknown as SlotRequest[]).filter(slot => {
            // Must match grade if specified
            if (gradeId && slot.grade?.id !== gradeId) return false;
            // Must match semester if specified
            if (semesterId && slot.semester?.id !== semesterId) return false;
            return true;
        });

        return { recurringSlots, exceptionSlots };
    }, [allSlots, oneTimeSlots, gradeId, semesterId]);

    // Get set of days that have available slots
    const availableDays = useMemo(() => {
        const days = new Set<string>();
        filteredSlots.recurringSlots.forEach(slot => {
            days.add(slot.day_of_week.toLowerCase());
        });

        // Also add days from exception slots if they match the current week
        const weekDateStrings = weekDates.map(d => toDateString(d));

        filteredSlots.exceptionSlots.forEach(slot => {
            // Check if this exception slot falls within the current week
            if (slot.specific_date) {
                const slotDate = slot.specific_date.split(' ')[0].split('T')[0];

                if (weekDateStrings.includes(slotDate)) {
                    // Find the index to correct map to a day name
                    const dateIndex = weekDateStrings.indexOf(slotDate);
                    if (dateIndex !== -1) {
                        days.add(DAY_ORDER[dateIndex]);
                    }
                }
            } else if (slot.day_name) {
                // Fallback for logic consistency, though specific_date is preferred for exceptions
                days.add(slot.day_name.toLowerCase());
            }
        });

        return days;
    }, [filteredSlots, weekDates]);

    // Map slots to specific dates for the current week
    const datedSlots = useMemo(() => {
        const result: DatedSlot[] = [];

        weekDates.forEach((date, index) => {
            const dayName = DAY_ORDER[index];
            const dateString = toDateString(date);
            const isBooked = bookedDates.includes(dateString);

            // 1. Add matching recurring slots
            const recurringForDay = filteredSlots.recurringSlots.filter(
                s => s.day_of_week.toLowerCase() === dayName
            );

            recurringForDay.forEach(slot => {
                result.push({
                    ...slot,
                    date,
                    dateString,
                    isBooked,
                });
            });

            // 2. Add matching one-time/exception slots (MUST match specific date)
            const exceptionsForDate = filteredSlots.exceptionSlots.filter(
                s => {
                    if (!s.specific_date) return false;
                    const slotDate = s.specific_date.split(' ')[0].split('T')[0];
                    return slotDate === dateString;
                }
            );

            exceptionsForDate.forEach(slot => {
                result.push({
                    id: slot.id, // Use request ID
                    teacher_id: slot.teacher?.id || 0,
                    grade_id: slot.grade?.id || 0,
                    semester_id: slot.semester?.id || 0,
                    day_of_week: dayName,
                    start_time: slot.start_time,
                    end_time: slot.end_time,
                    status: 'approved',
                    date,
                    dateString,
                    isBooked,
                    isException: true,
                    grade: slot.grade, // Pass grade info
                    semester: slot.semester, // Pass semester info
                } as any);
            });
        });


        return result;
    }, [weekDates, filteredSlots, bookedDates]);

    // Slots for the selected day
    const slotsForSelectedDay = useMemo(() => {
        if (!selectedDay) return [];
        return datedSlots.filter(s => s.day_of_week.toLowerCase() === selectedDay);
    }, [datedSlots, selectedDay]);

    // Navigation handlers
    const goToPreviousWeek = useCallback(() => setWeekOffset(w => w - 1), []);
    const goToNextWeek = useCallback(() => setWeekOffset(w => w + 1), []);
    const goToThisWeek = useCallback(() => setWeekOffset(0), []);

    // Day selection handler
    const handleDayClick = useCallback((day: string) => {
        if (availableDays.has(day)) {
            setSelectedDay(prev => prev === day ? null : day);
        }
    }, [availableDays]);

    // Slot selection handler
    const handleSlotSelect = useCallback((slot: DatedSlot) => {
        if (slot.isBooked) return;

        const isSameSlot = selectedSlotId === slot.id && selectedDate === slot.dateString;
        onSelect(isSameSlot ? null : slot);
    }, [selectedSlotId, selectedDate, onSelect]);

    // Get info about pending/all-used states
    const { hasPending, allUsed } = useMemo(() => {
        const slots = allSlots as TeacherRecurringSlot[];
        const gradeFiltered = gradeId ? slots.filter(s => s.grade_id === gradeId) : slots;
        const semesterFiltered = semesterId ? gradeFiltered.filter(s => s.semester_id === semesterId) : gradeFiltered;

        const pending = semesterFiltered.filter(s => s.status === 'pending');
        const approved = semesterFiltered.filter(s => s.status === 'approved');
        const available = approved.filter(s => s.lecture_id === null);

        return {
            hasPending: pending.length > 0,
            allUsed: approved.length > 0 && available.length === 0,
        };
    }, [allSlots, gradeId, semesterId]);

    // ==================== Render ====================

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8 text-slate-400">
                <Loader2 className="animate-spin mr-2" size={20} />
                <span>جارِ تحميل المواعيد...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-8 text-red-500 gap-2">
                <AlertCircle size={20} />
                <span>فشل تحميل المواعيد المتاحة</span>
            </div>
        );
    }

    // No available slots
    if (filteredSlots.recurringSlots.length === 0 && filteredSlots.exceptionSlots.length === 0) {
        if (hasPending) {
            return (
                <div className="border-2 border-dashed border-amber-200 bg-amber-50/50 rounded-xl p-6 text-center">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3 text-amber-600">
                        <Clock size={24} />
                    </div>
                    <h4 className="text-amber-800 font-bold mb-1">يرجى الانتظار</h4>
                    <p className="text-amber-600 text-sm">
                        طلباتك للمواعيد قيد المراجعة حالياً من قبل الإدارة.
                    </p>
                </div>
            );
        }

        if (allUsed) {
            return (
                <div className="border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-xl p-6 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-600">
                        <CalendarDays size={24} />
                    </div>
                    <h4 className="text-blue-800 font-bold mb-1">جميع المواعيد مستخدمة</h4>
                    <p className="text-blue-600 text-sm mb-4">
                        لقد استخدمت جميع مواعيدك المعتمدة لهذه المرحلة والفصل.
                    </p>
                    {onRequestNewSlot && (
                        <button
                            type="button"
                            onClick={onRequestNewSlot}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium"
                        >
                            <Plus size={18} />
                            حجز موعد إضافي
                        </button>
                    )}
                </div>
            );
        }

        return (
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50/50">
                <div className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400 shadow-sm">
                    <GraduationCap size={24} />
                </div>
                <h4 className="text-slate-700 font-bold mb-1">لا توجد مواعيد متاحة</h4>
                <p className="text-slate-500 text-sm mb-4">
                    يجب حجز مواعيد أسبوعية لهذه المرحلة والفصل الدراسي أولاً.
                </p>
                {onRequestNewSlot && (
                    <button
                        type="button"
                        onClick={onRequestNewSlot}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-shibl-crimson text-white rounded-xl hover:bg-shibl-crimson-dark transition-all font-medium"
                    >
                        <Plus size={18} />
                        حجز موعد جديد
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Week Navigation Header */}
            <div className="flex items-center justify-between bg-gradient-to-l from-slate-100 to-slate-50 rounded-xl p-3 border border-slate-200">
                <button
                    type="button"
                    onClick={goToNextWeek}
                    className="p-2 hover:bg-white rounded-lg transition text-slate-600 hover:text-slate-900"
                >
                    <ChevronRight size={20} />
                </button>

                <div className="text-center">
                    <div className="font-bold text-slate-800 text-sm">
                        {formatWeekRange(currentWeekStart)}
                    </div>
                    {weekOffset !== 0 && (
                        <button
                            type="button"
                            onClick={goToThisWeek}
                            className="text-xs text-blue-600 hover:text-blue-700 mt-0.5"
                        >
                            العودة للأسبوع الحالي
                        </button>
                    )}
                </div>

                <button
                    type="button"
                    onClick={goToPreviousWeek}
                    className="p-2 hover:bg-white rounded-lg transition text-slate-600 hover:text-slate-900"
                >
                    <ChevronLeft size={20} />
                </button>
            </div>

            {/* Week Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {weekDates.map((date, index) => {
                    const day = DAY_ORDER[index];
                    const hasSlots = availableDays.has(day);
                    const isSelected = selectedDay === day;
                    const colors = DAY_COLORS[day];
                    const dayDate = date.getDate();

                    // Check if all slots for this day are booked
                    const daySlots = datedSlots.filter(s => s.day_of_week.toLowerCase() === day);
                    const allBooked = daySlots.length > 0 && daySlots.every(s => s.isBooked);

                    return (
                        <button
                            key={day}
                            type="button"
                            onClick={() => handleDayClick(day)}
                            disabled={!hasSlots || allBooked}
                            className={`
                                relative flex flex-col items-center py-2 px-1 rounded-lg transition-all
                                ${hasSlots && !allBooked
                                    ? isSelected
                                        ? `${colors.active} text-white shadow-lg transform scale-105`
                                        : `${colors.bg} ${colors.text} hover:${colors.border} border-2 border-transparent hover:border-current cursor-pointer`
                                    : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                                }
                                ${allBooked ? 'bg-red-50 text-red-300' : ''}
                            `}
                        >
                            <span className="text-[10px] font-medium mb-0.5">
                                {DAY_NAMES_SHORT_AR[day]}
                            </span>
                            <span className={`text-lg font-bold ${isSelected ? 'text-white' : ''}`}>
                                {dayDate}
                            </span>
                            {hasSlots && !allBooked && (
                                <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-white' : colors.active}`} />
                            )}
                            {allBooked && (
                                <Ban size={10} className="mt-0.5 text-red-400" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Selected Day Slots */}
            {selectedDay && slotsForSelectedDay.length > 0 && (
                <div className="space-y-2 border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Calendar size={16} />
                        <span>
                            {DAY_NAMES_AR[selectedDay]} - {formatDateShort(weekDates[DAY_ORDER.indexOf(selectedDay)])}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        {slotsForSelectedDay.map(slot => {
                            const isThisSelected = selectedSlotId === slot.id && selectedDate === slot.dateString;
                            const colors = DAY_COLORS[selectedDay];

                            return (
                                <button
                                    key={`${slot.id}-${slot.dateString}`}
                                    type="button"
                                    onClick={() => handleSlotSelect(slot)}
                                    disabled={slot.isBooked}
                                    className={`
                                        relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-right w-full
                                        ${slot.isBooked
                                            ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                                            : isThisSelected
                                                ? `${colors.bg} ${colors.border} ring-2 ring-offset-1 ring-purple-300`
                                                : `bg-white border-slate-200 hover:${colors.border} hover:${colors.bg}`
                                        }
                                    `}
                                >
                                    {/* Radio indicator */}
                                    <div
                                        className={`
                                            w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                                            ${slot.isBooked
                                                ? 'border-slate-300 bg-slate-100'
                                                : isThisSelected
                                                    ? 'bg-purple-600 border-purple-600 text-white'
                                                    : 'border-slate-300 bg-white'
                                            }
                                        `}
                                    >
                                        {slot.isBooked ? (
                                            <Ban size={10} />
                                        ) : isThisSelected ? (
                                            <CheckCircle2 size={12} />
                                        ) : null}
                                    </div>

                                    {/* Slot Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 text-slate-800 font-bold dir-ltr justify-end">
                                            <span className="text-sm">{formatTimeOnly(slot.start_time)}</span>
                                            <span className="text-slate-400">—</span>
                                            <span className="text-sm">{formatTimeOnly(slot.end_time)}</span>
                                            <Clock size={14} className="text-slate-400" />
                                        </div>

                                        {slot.semester && (
                                            <div className="text-xs text-slate-500 mt-1 truncate">
                                                {getLocalizedName(slot.semester.name)}
                                            </div>
                                        )}

                                        {/* Exception Slot Indicator */}
                                        {slot.isException && (
                                            <div className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full w-fit mt-1 border border-amber-100">
                                                <AlertCircle size={10} />
                                                <span>موعد استثنائي</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Status badges */}
                                    {slot.isBooked ? (
                                        <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-medium">
                                            محجوز
                                        </span>
                                    ) : isThisSelected && (
                                        <span className="text-[10px] px-2 py-0.5 bg-purple-600 text-white rounded-full font-medium">
                                            محدد
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Prompt to select a day */}
            {!selectedDay && (
                <div className="text-center py-4 text-slate-500 text-sm">
                    <CalendarDays size={24} className="mx-auto mb-2 text-slate-300" />
                    اختر يوماً من الأسبوع لعرض المواعيد المتاحة
                </div>
            )}

            {/* Request New Slot Link */}
            {onRequestNewSlot && (
                <button
                    type="button"
                    onClick={onRequestNewSlot}
                    className="w-full py-2 text-center text-sm text-shibl-crimson hover:text-shibl-crimson-dark transition flex items-center justify-center gap-2 border-t border-slate-100 pt-3"
                >
                    <Plus size={16} />
                    حجز موعد إضافي
                </button>
            )}
        </div>
    );
}

export default ApprovedSlotSelector;

