/**
 * WeekDayTabs Component
 * 
 * Displays a horizontal row of day tabs for the weekly schedule view.
 * Shows status indicators for each day (locked, active, has bookings).
 */

import { cn } from '@/lib/utils';
import { Lock, Check, Circle } from 'lucide-react';
import type { WeekDayConfig } from '@/hooks/useRecurringSchedule';

interface WeekDayTabsProps {
    days: WeekDayConfig[];
    selectedDay: string;
    onSelectDay: (day: string) => void;
    isLoading?: boolean;
}

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

export function WeekDayTabs({ days, selectedDay, onSelectDay, isLoading }: WeekDayTabsProps) {
    if (isLoading) {
        return (
            <div className="flex gap-2 overflow-x-auto pb-2">
                {[...Array(7)].map((_, i) => (
                    <div
                        key={i}
                        className="h-12 w-24 shrink-0 animate-pulse rounded-lg bg-gray-200"
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300">
            {days.map((day) => {
                const isSelected = selectedDay === day.day;
                const hasBookings = day.my_bookings_count > 0;

                return (
                    <button
                        key={day.day}
                        onClick={() => !day.is_locked && onSelectDay(day.day)}
                        disabled={day.is_locked}
                        className={cn(
                            'relative flex min-w-[100px] shrink-0 flex-col items-center gap-1 rounded-xl border-2 px-4 py-3 transition-all duration-200',
                            isSelected
                                ? 'border-shibl-crimson bg-shibl-crimson/10 shadow-md'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50',
                            day.is_locked && 'cursor-not-allowed opacity-50',
                            !day.is_active && 'opacity-60'
                        )}
                    >
                        {/* Day Name */}
                        <span
                            className={cn(
                                'text-sm font-semibold',
                                isSelected ? 'text-shibl-crimson' : 'text-gray-700'
                            )}
                        >
                            {dayNamesAr[day.day] || day.day}
                        </span>

                        {/* Status Indicator */}
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

                        {/* Mode Badge */}
                        <span
                            className={cn(
                                'absolute -top-2 right-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                                day.mode === 'individual'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-blue-100 text-blue-700'
                            )}
                        >
                            {day.mode === 'individual' ? 'فردي' : 'متعدد'}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

export default WeekDayTabs;
