/**
 * React Query hooks for Teacher Recurring Schedule (Slots 2.0)
 * 
 * Provides hooks for managing weekly recurring slot bookings.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherService } from '../data/api/teacherService';
import toast from 'react-hot-toast';

// Query Keys
export const recurringScheduleKeys = {
    all: ['recurring-schedule'] as const,
    assignedGrades: () => [...recurringScheduleKeys.all, 'assigned-grades'] as const,
    weekConfig: (gradeId: number, semesterId: number) =>
        [...recurringScheduleKeys.all, 'week-config', gradeId, semesterId] as const,
    availableSlots: (gradeId: number, semesterId: number, day: string) =>
        [...recurringScheduleKeys.all, 'available-slots', gradeId, semesterId, day] as const,
    mySchedule: (semesterId?: number) =>
        [...recurringScheduleKeys.all, 'my-schedule', semesterId] as const,
};

/**
 * Hook to fetch grades assigned to the teacher
 */
export function useAssignedGrades() {
    return useQuery({
        queryKey: recurringScheduleKeys.assignedGrades(),
        queryFn: () => teacherService.getAssignedGrades(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Hook to fetch weekly configuration (day tabs status)
 */
export function useWeekConfig(gradeId: number, semesterId: number) {
    return useQuery({
        queryKey: recurringScheduleKeys.weekConfig(gradeId, semesterId),
        queryFn: () => teacherService.getWeekConfig(gradeId, semesterId),
        enabled: !!gradeId && !!semesterId,
        staleTime: 30 * 1000, // 30 seconds
    });
}

/**
 * Hook to fetch available slots for a specific day
 */
export function useAvailableRecurringSlots(gradeId: number, semesterId: number, day: string) {
    return useQuery({
        queryKey: recurringScheduleKeys.availableSlots(gradeId, semesterId, day),
        queryFn: () => teacherService.getAvailableRecurringSlots(gradeId, semesterId, day),
        enabled: !!gradeId && !!semesterId && !!day,
        staleTime: 15 * 1000, // 15 seconds
    });
}

/**
 * Hook to fetch teacher's recurring schedule
 */
export function useMyRecurringSchedule(semesterId?: number) {
    return useQuery({
        queryKey: recurringScheduleKeys.mySchedule(semesterId),
        queryFn: () => teacherService.getMyRecurringSchedule(semesterId),
        staleTime: 30 * 1000,
    });
}

/**
 * Hook to submit a recurring slot booking
 */
export function useSubmitRecurringSlot() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: teacherService.submitRecurringSlot,
        onSuccess: (data) => {
            toast.success(data.message || 'تم حجز الموعد بنجاح');
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: recurringScheduleKeys.all });
        },
        onError: (error: Error & { response?: { data?: { message?: string } } }) => {
            const message = error.response?.data?.message || 'حدث خطأ أثناء حجز الموعد';
            toast.error(message);
        },
    });
}

/**
 * Hook to cancel a recurring slot
 */
export function useCancelRecurringSlot() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: teacherService.cancelRecurringSlot,
        // Optimistic update: immediately remove from cache to prevent flash on refresh
        onMutate: async (slotId: number) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: recurringScheduleKeys.all });

            // Snapshot the previous value for rollback
            const previousSchedule = queryClient.getQueriesData({ queryKey: recurringScheduleKeys.all });

            // Optimistically remove the slot from all mySchedule caches
            queryClient.setQueriesData(
                { queryKey: recurringScheduleKeys.all },
                (old: unknown) => {
                    if (!old || typeof old !== 'object') return old;
                    const data = old as { data?: RecurringSlot[] };
                    if (Array.isArray(data?.data)) {
                        return {
                            ...data,
                            data: data.data.filter((s: RecurringSlot) => s.id !== slotId)
                        };
                    }
                    return old;
                }
            );

            return { previousSchedule };
        },
        onSuccess: (data) => {
            toast.success(data.message || 'تم إلغاء الموعد بنجاح');
            // Invalidate to sync with server
            queryClient.invalidateQueries({ queryKey: recurringScheduleKeys.all });
        },
        onError: (error: Error & { response?: { data?: { message?: string } } }, _slotId, context) => {
            // Rollback on error
            if (context?.previousSchedule) {
                context.previousSchedule.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            const message = error.response?.data?.message || 'حدث خطأ أثناء إلغاء الموعد';
            toast.error(message);
        },
    });
}

// Re-export types for convenience
export type WeekDayConfig = {
    day: string;
    is_active: boolean;
    mode: 'individual' | 'multiple';
    my_bookings_count: number;
    is_locked: boolean;
};

export type AvailableSlot = {
    start: string;
    end: string;
    is_available: boolean;
    is_mine: boolean;
    is_taken?: boolean;
    booking_disabled?: boolean;
    slot_id?: number;
    status?: 'pending' | 'approved' | 'rejected';
    locked_reason?: string;
    mode?: 'individual' | 'multiple';
    teacher_name?: string | null;
};

export type RecurringSlot = {
    id: number;
    grade_id: number;
    semester_id: number;
    day_of_week: string;
    start_time: string;
    end_time: string;
    status: 'pending' | 'approved' | 'rejected';
    grade?: { id: number; name: string };
    semester?: { id: number; name: string };
    lecture?: { id: number; title: string };
};
