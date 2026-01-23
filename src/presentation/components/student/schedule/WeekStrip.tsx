/**
 * WeekStrip Component
 *
 * A horizontal week calendar strip for navigating between days.
 * Follows Senior Full Stack Design principles:
 * - Mobile-first responsive design
 * - Keyboard accessible
 * - Touch-friendly tap targets
 */

import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, subDays, isToday, isSameDay, startOfWeek } from 'date-fns';
import { ar } from 'date-fns/locale';

// ============================================================
// Types
// ============================================================

interface WeekStripProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
    scheduleCounts?: Record<string, number>; // dateKey -> count of schedules
}

interface DayItem {
    date: Date;
    dateKey: string;
    dayName: string;
    dayNumber: string;
    isToday: boolean;
    isSelected: boolean;
    scheduleCount: number;
}

// ============================================================
// Component
// ============================================================

export function WeekStrip({ selectedDate, onDateSelect, scheduleCounts = {} }: WeekStripProps) {
    // Generate 7 days starting from the current week's start (Saturday for Arabic locale)
    const weekDays = useMemo((): DayItem[] => {
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 6 }); // Saturday
        const days: DayItem[] = [];

        for (let i = 0; i < 7; i++) {
            const date = addDays(weekStart, i);
            const dateKey = format(date, 'yyyy-MM-dd');
            days.push({
                date,
                dateKey,
                dayName: format(date, 'EEE', { locale: ar }),
                dayNumber: format(date, 'd', { locale: ar }),
                isToday: isToday(date),
                isSelected: isSameDay(date, selectedDate),
                scheduleCount: scheduleCounts[dateKey] || 0,
            });
        }

        return days;
    }, [selectedDate, scheduleCounts]);

    // Navigation handlers
    const handlePrevWeek = () => {
        onDateSelect(subDays(selectedDate, 7));
    };

    const handleNextWeek = () => {
        onDateSelect(addDays(selectedDate, 7));
    };

    // Get month/year label
    const monthLabel = format(selectedDate, 'MMMM yyyy', { locale: ar });

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6">
            {/* Header with month and navigation */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-charcoal">{monthLabel}</h2>
                <div className="flex items-center gap-1">
                    <button
                        onClick={handlePrevWeek}
                        className="w-9 h-9 rounded-lg bg-slate-50 hover:bg-shibl-crimson/10 flex items-center justify-center transition-colors"
                        aria-label="الأسبوع السابق"
                    >
                        <ChevronRight size={20} className="text-slate-600" />
                    </button>
                    <button
                        onClick={handleNextWeek}
                        className="w-9 h-9 rounded-lg bg-slate-50 hover:bg-shibl-crimson/10 flex items-center justify-center transition-colors"
                        aria-label="الأسبوع التالي"
                    >
                        <ChevronLeft size={20} className="text-slate-600" />
                    </button>
                </div>
            </div>

            {/* Days row */}
            <div className="flex items-center gap-2" role="tablist" aria-label="أيام الأسبوع">
                {weekDays.map((day) => (
                    <button
                        key={day.dateKey}
                        onClick={() => onDateSelect(day.date)}
                        role="tab"
                        aria-selected={day.isSelected}
                        aria-label={`${day.dayName} ${day.dayNumber}`}
                        className={`
                            relative flex-1 flex flex-col items-center py-3 px-2 rounded-xl transition-all duration-200
                            focus:outline-none focus:ring-2 focus:ring-shibl-crimson/30
                            ${day.isSelected
                                ? 'bg-shibl-crimson text-white shadow-lg shadow-shibl-crimson/25'
                                : day.isToday
                                    ? 'bg-shibl-crimson/10 text-shibl-crimson hover:bg-shibl-crimson/20'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }
                        `}
                    >
                        <span className={`text-xs font-medium mb-1 ${day.isSelected ? 'text-white/80' : ''}`}>
                            {day.dayName}
                        </span>
                        <span className={`text-lg font-bold ${day.isSelected ? 'text-white' : ''}`}>
                            {day.dayNumber}
                        </span>

                        {/* Schedule count indicator */}
                        {day.scheduleCount > 0 && (
                            <div
                                className={`
                                    absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold
                                    flex items-center justify-center px-1
                                    ${day.isSelected
                                        ? 'bg-white text-shibl-crimson'
                                        : 'bg-shibl-crimson text-white'
                                    }
                                `}
                            >
                                {day.scheduleCount}
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default WeekStrip;
