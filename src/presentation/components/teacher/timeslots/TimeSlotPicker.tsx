/**
 * TimeSlotPicker Component
 * 
 * A visual slot picker for teachers to select available time slots
 * when creating an online lecture. Shows slots grouped by date with
 * time ranges and availability status.
 * 
 * Uses React Query for cache management - automatically invalidates
 * when teacher books a slot.
 */

import { useState, useMemo, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import teacherService from '../../../../data/api/teacherService';
import { teacherTimeSlotKeys } from '../../../hooks/useTeacherTimeSlots';
import type { TimeSlot } from '../../../../types/timeSlot';

interface TimeSlotPickerProps {
    onSelect: (slot: TimeSlot | null) => void;
    selectedSlotId?: number | null;
}

// Helper to format date in Arabic
const formatDateArabic = (dateStr: string): string => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };
    return date.toLocaleDateString('ar-EG', options);
};

// Helper to format time
const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

// Group slots by date
const groupSlotsByDate = (slots: TimeSlot[]): Map<string, TimeSlot[]> => {
    const grouped = new Map<string, TimeSlot[]>();

    slots.forEach(slot => {
        const dateKey = new Date(slot.start_time).toISOString().split('T')[0];
        if (!grouped.has(dateKey)) {
            grouped.set(dateKey, []);
        }
        grouped.get(dateKey)!.push(slot);
    });

    // Sort slots within each date by start time
    grouped.forEach((dateSlots, key) => {
        grouped.set(key, dateSlots.sort((a, b) =>
            new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        ));
    });

    return grouped;
};

export function TimeSlotPicker({ onSelect, selectedSlotId }: TimeSlotPickerProps) {
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const queryClient = useQueryClient();

    // Use React Query for data fetching with cache management
    const {
        data: slots = [],
        isLoading: loading,
        error,
        refetch
    } = useQuery({
        queryKey: teacherTimeSlotKeys.available(),
        queryFn: () => teacherService.getAvailableSlots(),
        // Always refetch when component mounts to ensure fresh data
        refetchOnMount: 'always',
        // Data is considered stale immediately
        staleTime: 0,
        // Refetch when window gains focus
        refetchOnWindowFocus: true,
    });

    // Force refetch on mount to ensure we have fresh data
    useEffect(() => {
        // Invalidate and refetch to get the latest available slots
        queryClient.invalidateQueries({ queryKey: teacherTimeSlotKeys.available() });

        // Setup Real-time listener
        const channel = (window as any).Echo?.channel('time-slots');
        if (channel) {
            channel.listen('.TimeSlotUpdated', () => {
                // When any slot is updated (booked or released), refresh the list
                queryClient.invalidateQueries({ queryKey: teacherTimeSlotKeys.available() });
            });
        }

        return () => {
            if (channel) {
                channel.stopListening('.TimeSlotUpdated');
            }
        };
    }, [queryClient]);

    // Auto-select first available date when slots load
    useEffect(() => {
        if (slots.length > 0 && !selectedDate) {
            const firstDate = new Date(slots[0].start_time).toISOString().split('T')[0];
            setSelectedDate(firstDate);
        }
    }, [slots, selectedDate]);

    // Group slots by date
    const groupedSlots = useMemo(() => groupSlotsByDate(slots), [slots]);
    const availableDates = useMemo(() => Array.from(groupedSlots.keys()).sort(), [groupedSlots]);

    // Navigate dates
    const currentDateIndex = selectedDate ? availableDates.indexOf(selectedDate) : 0;
    const canGoPrev = currentDateIndex > 0;
    const canGoNext = currentDateIndex < availableDates.length - 1;

    const goToPrevDate = () => {
        if (canGoPrev) {
            setSelectedDate(availableDates[currentDateIndex - 1]);
        }
    };

    const goToNextDate = () => {
        if (canGoNext) {
            setSelectedDate(availableDates[currentDateIndex + 1]);
        }
    };

    // Handle slot selection
    const handleSlotClick = (slot: TimeSlot) => {
        if (selectedSlotId === slot.id) {
            onSelect(null); // Deselect
        } else {
            onSelect(slot);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Loader2 size={32} className="animate-spin mb-3" />
                <p className="text-sm">جاري تحميل الفترات المتاحة...</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-red-500">
                <AlertCircle size={32} className="mb-3" />
                <p className="text-sm">فشل تحميل الفترات الزمنية المتاحة</p>
                <button
                    onClick={() => refetch()}
                    className="mt-3 text-xs text-blue-600 hover:underline"
                >
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    // No slots available
    if (slots.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 bg-slate-50 rounded-xl">
                <Calendar size={32} className="mb-3 opacity-50" />
                <p className="text-sm font-medium">لا توجد فترات زمنية متاحة حالياً</p>
                <p className="text-xs mt-1">يرجى التواصل مع الإدارة لإضافة فترات جديدة</p>
                <button
                    onClick={() => refetch()}
                    className="mt-3 text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                    <Loader2 size={12} className="inline" />
                    تحديث القائمة
                </button>
            </div>
        );
    }

    const currentDateSlots = selectedDate ? groupedSlots.get(selectedDate) || [] : [];

    return (
        <div className="space-y-4">
            {/* Date Navigator */}
            <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3">
                <button
                    type="button"
                    onClick={goToPrevDate}
                    disabled={!canGoPrev}
                    className="p-2 rounded-lg hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                    <ChevronRight size={20} />
                </button>

                <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-charcoal font-bold">
                        <Calendar size={18} className="text-blue-600" />
                        <span>{selectedDate ? formatDateArabic(selectedDate) : 'اختر تاريخ'}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                        {currentDateSlots.length} فترة متاحة
                    </p>
                </div>

                <button
                    type="button"
                    onClick={goToNextDate}
                    disabled={!canGoNext}
                    className="p-2 rounded-lg hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                    <ChevronLeft size={20} />
                </button>
            </div>

            {/* Date Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {availableDates.slice(0, 7).map(dateKey => {
                    const isSelected = dateKey === selectedDate;
                    const dateObj = new Date(dateKey);
                    const dayName = dateObj.toLocaleDateString('ar-EG', { weekday: 'short' });
                    const dayNum = dateObj.getDate();

                    return (
                        <button
                            key={dateKey}
                            type="button"
                            onClick={() => setSelectedDate(dateKey)}
                            className={`flex flex-col items-center min-w-[60px] px-3 py-2 rounded-xl transition-all ${isSelected
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'bg-white border border-slate-200 hover:border-blue-300 text-slate-600'
                                }`}
                        >
                            <span className="text-[10px] uppercase">{dayName}</span>
                            <span className="text-lg font-bold">{dayNum}</span>
                        </button>
                    );
                })}
            </div>

            {/* Time Slots Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {currentDateSlots.map(slot => {
                    const isSelected = selectedSlotId === slot.id;
                    const startTime = formatTime(slot.start_time);
                    const endTime = formatTime(slot.end_time);

                    return (
                        <button
                            key={slot.id}
                            type="button"
                            onClick={() => handleSlotClick(slot)}
                            className={`relative p-4 rounded-xl border-2 transition-all text-center ${isSelected
                                ? 'border-blue-600 bg-blue-50 shadow-md'
                                : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/30'
                                }`}
                        >
                            {isSelected && (
                                <div className="absolute top-2 left-2">
                                    <CheckCircle2 size={18} className="text-blue-600" />
                                </div>
                            )}
                            <div className="flex items-center justify-center gap-1.5 text-slate-600 mb-1">
                                <Clock size={14} />
                            </div>
                            <p className={`font-bold ${isSelected ? 'text-blue-700' : 'text-charcoal'}`}>
                                {startTime}
                            </p>
                            <p className="text-xs text-slate-500">
                                إلى {endTime}
                            </p>
                        </button>
                    );
                })}
            </div>

            {/* Selected Slot Summary */}
            {selectedSlotId && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                    <CheckCircle2 size={24} className="text-green-600 shrink-0" />
                    <div>
                        <p className="font-bold text-green-800">تم اختيار الفترة</p>
                        <p className="text-sm text-green-700">
                            سيتم إرسال طلبك للموافقة بعد الحفظ
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
