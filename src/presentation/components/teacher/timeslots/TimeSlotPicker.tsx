import { useState, useMemo, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, Loader2, AlertCircle, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import teacherService from '../../../../data/api/teacherService';
import { teacherTimeSlotKeys } from '../../../hooks/useTeacherTimeSlots';
import type { TimeSlot } from '../../../../types/timeSlot';
import { formatDate as formatDateArabic, formatTime } from '../../../../utils/timeUtils';
import { frontendSettings } from '../../../../services/FrontendSettingsService';
import { getEcho } from '../../../../services/websocket';

interface TimeSlotPickerProps {
    onSelect: (slot: TimeSlot | null) => void;
    selectedSlotId?: number | null;
    bookedSlots?: TimeSlot[]; // For conflict checking
    currentData?: any; // To check grade against booked slots
    bypassLocks?: boolean; // New prop for Extra Class
}

export function TimeSlotPicker({ onSelect, selectedSlotId, bookedSlots = [], currentData, bypassLocks = false }: TimeSlotPickerProps) {
    const [selectedDate, setSelectedDate] = useState<string>('');
    const queryClient = useQueryClient();

    // 1. Fetch available slots
    const { data: slots = [], isLoading, error } = useQuery({
        queryKey: teacherTimeSlotKeys.available(selectedDate),
        queryFn: () => teacherService.getAvailableSlots(selectedDate),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // 2. Real-time updates via Echo
    useEffect(() => {
        if (!selectedDate) return;

        const echo = getEcho();
        const channel = echo?.channel('time-slots');
        if (!channel) return;

        console.log(`Listening for time-slots on date: ${selectedDate}`);

        const handleUpdate = (e: any) => {
            console.log('Real-time slot update:', e);
            queryClient.invalidateQueries({ queryKey: teacherTimeSlotKeys.available(selectedDate) });
        };

        channel.listen('.TimeSlotUpdated', handleUpdate);

        return () => {
            channel.stopListening('.TimeSlotUpdated', handleUpdate);
        };
    }, [selectedDate, queryClient]);

    // 3. Group slots by date
    const slotsByDate = useMemo(() => {
        const grouped: Record<string, TimeSlot[]> = {};
        const currentGradeId = currentData?.course?.grade?.id || currentData?.course?.grade_id;

        slots.forEach(slot => {
            // Apply TERM filter locally checks specific grade config if provided
            if (!frontendSettings.isDateInTerm(slot.start_time, currentGradeId ? Number(currentGradeId) : undefined)) return;

            const date = slot.start_time.split('T')[0];
            if (!grouped[date]) grouped[date] = [];
            grouped[date].push(slot);
        });
        return grouped;
    }, [slots, currentData]);

    // 4. Get sorted dates
    const dates = useMemo(() => Object.keys(slotsByDate).sort(), [slotsByDate]);

    // 5. Auto-select first date if available and not selected
    useEffect(() => {
        if (dates.length > 0 && !selectedDate) {
            setSelectedDate(dates[0]);
        }
    }, [dates, selectedDate]);

    // 6. Logic to check conflicts based on Booking Mode
    const isDayLocked = (dateStr: string) => {
        if (bypassLocks) return false; // Bypass all locks if Extra Class mode is on

        // Ensure we have current course data to check against
        const currentGradeId = currentData?.course?.grade?.id || currentData?.course?.grade_id;
        if (!currentGradeId) return false;

        // Determine Booking Mode for THIS SPECIFIC DAY
        const dateObj = new Date(dateStr);
        const dayIndex = dateObj.getDay();
        const dayConfig = frontendSettings.getDayConfig(Number(currentGradeId), dayIndex);

        // If booking mode is 'multiple', NO locking needed for the day
        if (dayConfig.bookingMode === 'multiple') return false;

        // Otherwise (Individual), check if ANY booked slot matches this Date + Grade
        return bookedSlots.some(booked => {
            if (booked.status === 'rejected' || booked.status === 'available') return false;

            const bookedDate = booked.date || (booked.start_time ? booked.start_time.split('T')[0] : '');
            if (!bookedDate) return false;

            const lecture = booked.lecture as any;
            const bookedGradeId = lecture?.course?.grade?.id || lecture?.course?.grade_id;

            return bookedDate === dateStr && Number(bookedGradeId) === Number(currentGradeId);
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-purple-600" size={32} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-12 text-red-500 gap-2">
                <AlertCircle size={24} />
                <p>فشل تحميل المواعيد المتاحة</p>
            </div>
        );
    }

    if (dates.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Calendar size={48} className="mb-4 opacity-50" />
                <p>لا توجد مواعيد متاحة حالياً</p>
            </div>
        );
    }

    const currentSlots = slotsByDate[selectedDate] || [];
    const isCurrentDayLocked = isDayLocked(selectedDate);

    return (
        <div className="space-y-6">
            {/* Date Navigation */}
            <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl">
                <button
                    onClick={() => {
                        const idx = dates.indexOf(selectedDate);
                        if (idx > 0) setSelectedDate(dates[idx - 1]);
                    }}
                    disabled={dates.indexOf(selectedDate) === 0}
                    className="p-2 hover:bg-white rounded-lg disabled:opacity-30 transition-all shadow-sm disabled:shadow-none"
                >
                    <ChevronRight size={20} />
                </button>

                <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-purple-600" />
                    <span className="font-bold text-charcoal">
                        {selectedDate ? formatDateArabic(selectedDate) : 'حدد يوماً'}
                    </span>
                    {isCurrentDayLocked && (
                        <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium flex items-center gap-1">
                            <Lock size={10} />
                            محجوز مسبقاً
                        </span>
                    )}
                </div>

                <button
                    onClick={() => {
                        const idx = dates.indexOf(selectedDate);
                        if (idx < dates.length - 1) setSelectedDate(dates[idx + 1]);
                    }}
                    disabled={dates.indexOf(selectedDate) === dates.length - 1}
                    className="p-2 hover:bg-white rounded-lg disabled:opacity-30 transition-all shadow-sm disabled:shadow-none"
                >
                    <ChevronLeft size={20} />
                </button>
            </div>

            {/* Warning for Locked Day */}
            {isCurrentDayLocked && (
                <div className="bg-purple-50 border border-purple-200 p-3 rounded-xl flex items-center gap-3 text-purple-800 text-sm animate-in slide-in-from-top-2">
                    <Lock size={18} className="shrink-0" />
                    <p>
                        لقد قمت بحجز موعد لهذا الصف في هذا اليوم بالفعل.
                        سياسة المدرسة تسمح بموعد واحد فقط يومياً لكل صف.
                    </p>
                </div>
            )}

            {/* Slots Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {currentSlots.map(slot => {
                    const isSelected = selectedSlotId === slot.id;
                    const isDayLockedForGrade = isCurrentDayLocked;

                    // Check if THIS specific slot is already booked/requested by me (and not rejected)
                    const isSlotBookedByMe = bookedSlots.some(booked => booked.id === slot.id && booked.status !== 'rejected');

                    // Locked if day is locked OR slot is booked by me
                    const locked = isDayLockedForGrade || isSlotBookedByMe;

                    return (
                        <button
                            key={slot.id}
                            onClick={() => !locked && onSelect(slot)}
                            disabled={locked}
                            className={`
                                relative p-3 rounded-xl border text-center transition-all group
                                flex flex-col items-center justify-center gap-2
                                ${isSelected
                                    ? 'bg-purple-600 border-purple-600 text-white shadow-lg scale-105 z-10'
                                    : locked
                                        ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed opacity-75'
                                        : 'bg-white border-slate-200 hover:border-purple-300 hover:shadow-md text-charcoal'
                                }
                            `}
                        >
                            <div className="flex items-center gap-1.5 font-bold text-lg dir-ltr">
                                <Clock size={16} className={isSelected ? 'text-purple-200' : 'text-slate-400'} />
                                {formatTime(slot.start_time)}
                            </div>

                            {/* Duration or End Time could go here if needed */}

                            {isSelected && (
                                <div className="absolute -top-2 -right-2 bg-white text-purple-600 rounded-full p-0.5 shadow-sm">
                                    <CheckCircle2 size={16} />
                                </div>
                            )}

                            {locked && (
                                <div className="absolute top-2 right-2 text-slate-400">
                                    {isSlotBookedByMe ? (
                                        <CheckCircle2 size={14} className="text-emerald-500" />
                                    ) : (
                                        <Lock size={14} />
                                    )}
                                </div>
                            )}

                            {isSlotBookedByMe && (
                                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full absolute -bottom-2 whitespace-nowrap z-20">
                                    طلبي
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="text-center text-xs text-slate-400 mt-4 border-t border-slate-100 pt-3">
                يتم تحديث المواعيد تلقائياً عند حجزها من قبل مدرسين آخرين
            </div>
        </div>
    );
}
