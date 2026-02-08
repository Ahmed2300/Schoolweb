/**
 * TimeSlotCard Component
 * 
 * Individual time slot card showing availability and allowing booking/cancellation.
 */

import { cn } from '@/lib/utils';
import { Clock, User, X, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AvailableSlot } from '@/hooks/useRecurringSchedule';
import { formatTime } from '@/utils/timeUtils';

interface TimeSlotCardProps {
    slot: AvailableSlot;
    onBook: () => void;
    onCancel: () => void;
    isBooking?: boolean;
    isCancelling?: boolean;
}



export function TimeSlotCard({
    slot,
    onBook,
    onCancel,
    isBooking = false,
    isCancelling = false,
}: TimeSlotCardProps) {
    const isLoading = isBooking || isCancelling;

    return (
        <div
            className={cn(
                'group relative flex flex-col gap-3 rounded-xl border-2 p-4 transition-all duration-200',
                slot.is_mine
                    ? 'border-green-500 bg-green-50 shadow-sm'
                    : slot.is_available
                        ? 'border-gray-200 bg-white hover:border-shibl-crimson hover:shadow-md'
                        : 'border-gray-100 bg-gray-50 opacity-60'
            )}
        >
            {/* Time Display */}
            <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span className="font-medium">
                    {formatTime(slot.start)} - {formatTime(slot.end)}
                </span>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2">
                {slot.is_mine ? (
                    <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                        <Check className="h-3 w-3" />
                        محجوز لك
                    </span>
                ) : slot.is_available ? (
                    <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                        متاح
                    </span>
                ) : (
                    <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500">
                        <User className="h-3 w-3" />
                        محجوز
                    </span>
                )}
            </div>

            {/* Action Button */}
            <div className="mt-auto pt-2">
                {slot.is_mine ? (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                    >
                        {isCancelling ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                جاري الإلغاء...
                            </>
                        ) : (
                            <>
                                <X className="mr-2 h-4 w-4" />
                                إلغاء الحجز
                            </>
                        )}
                    </Button>
                ) : slot.is_available ? (
                    <Button
                        size="sm"
                        onClick={onBook}
                        disabled={isLoading}
                        className="w-full bg-shibl-crimson hover:bg-shibl-crimson/90"
                    >
                        {isBooking ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                جاري الحجز...
                            </>
                        ) : (
                            'احجز هذا الموعد'
                        )}
                    </Button>
                ) : (
                    <Button
                        size="sm"
                        disabled
                        variant="secondary"
                        className="w-full cursor-not-allowed"
                    >
                        غير متاح
                    </Button>
                )}
            </div>
        </div>
    );
}

/**
 * Loading skeleton for TimeSlotCard
 */
export function TimeSlotCardSkeleton() {
    return (
        <div className="flex flex-col gap-3 rounded-xl border-2 border-gray-100 bg-white p-4">
            <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200" />
            <div className="mt-auto h-9 w-full animate-pulse rounded-md bg-gray-200" />
        </div>
    );
}

export default TimeSlotCard;
