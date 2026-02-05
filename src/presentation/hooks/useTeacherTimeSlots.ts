/**
 * React Query hooks for Teacher Time Slots management.
 * Provides data fetching and mutations for teachers to request and manage their slots.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import teacherService from '../../data/api/teacherService';
import type { TimeSlot } from '../../types/timeSlot';

// Query keys for cache management
export const teacherTimeSlotKeys = {
    all: ['teacherTimeSlots'] as const,
    available: (date?: string) => [...teacherTimeSlotKeys.all, 'available', date] as const,
    revision: () => [...teacherTimeSlotKeys.all, 'revision'] as const,
    myRequests: () => [...teacherTimeSlotKeys.all, 'myRequests'] as const,
    detail: (id: number) => [...teacherTimeSlotKeys.all, 'detail', id] as const,
};

/**
 * Hook to fetch available time slots for teachers.
 */
export function useAvailableSlots(date?: string) {
    return useQuery({
        queryKey: teacherTimeSlotKeys.available(date),
        queryFn: () => teacherService.getAvailableSlots(date),
        select: (data) => data as TimeSlot[],
    });
}

/**
 * Hook to fetch revision schedule slots for teachers.
 */
export function useRevisionSlots() {
    return useQuery({
        queryKey: teacherTimeSlotKeys.revision(),
        queryFn: () => teacherService.getRevisionSlots(),
        select: (data) => data as TimeSlot[],
    });
}

/**
 * Hook to fetch teacher's slot requests history.
 */
export function useMyRequests() {
    return useQuery({
        queryKey: teacherTimeSlotKeys.myRequests(),
        queryFn: () => teacherService.getMyRequests(),
        select: (data) => data as TimeSlot[],
    });
}

/**
 * Hook to request a slot.
 */
export function useRequestSlot() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, lectureId, notes }: { id: number; lectureId: number; notes?: string }) =>
            teacherService.requestSlot(id, lectureId, notes),
        onSuccess: () => {
            // Invalidate teacher's available slots cache
            queryClient.invalidateQueries({ queryKey: teacherTimeSlotKeys.all });
            // Also invalidate admin time slots to keep both views in sync
            queryClient.invalidateQueries({ queryKey: ['timeSlots'] });
        },
    });
}

/**
 * Hook to cancel a pending slot request.
 */
export function useCancelSlotRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => teacherService.cancelRequest(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: teacherTimeSlotKeys.all });
        },
    });
}
