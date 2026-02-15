/**
 * React Query hooks for Teacher Time Slots management.
 * Provides data fetching and mutations for teachers to request and manage their slots.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import teacherService from '../../data/api/teacherService';
import adminService from '../../data/api/adminService';
import type { TimeSlot } from '../../types/timeSlot';

// Query keys for cache management
export const teacherTimeSlotKeys = {
    all: ['teacherTimeSlots'] as const,
    available: (date?: string) => [...teacherTimeSlotKeys.all, 'available', date] as const,
    revision: () => [...teacherTimeSlotKeys.all, 'revision'] as const,
    myRequests: () => [...teacherTimeSlotKeys.all, 'myRequests'] as const,
    myRecurringSchedule: () => [...teacherTimeSlotKeys.all, 'myRecurringSchedule'] as const,
    approvedOneTime: () => [...teacherTimeSlotKeys.all, 'approvedOneTime'] as const,
    detail: (id: number) => [...teacherTimeSlotKeys.all, 'detail', id] as const,
    teacherRecurringSchedule: (teacherId: number) => [...teacherTimeSlotKeys.all, 'recurringSchedule', teacherId] as const,
    teacherApprovedOneTime: (teacherId: number) => [...teacherTimeSlotKeys.all, 'approvedOneTime', teacherId] as const,
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
 * Hook to fetch approved one-time slots (exception slots).
 */
export function useApprovedOneTimeSlots(teacherId?: number) {
    return useQuery({
        queryKey: teacherId ? teacherTimeSlotKeys.teacherApprovedOneTime(teacherId) : teacherTimeSlotKeys.approvedOneTime(),
        queryFn: () => teacherId ? adminService.getTeacherApprovedOneTimeSlots(teacherId) : teacherService.getApprovedOneTimeSlots(),
        select: (response) => response.data,
    });
}

/**
 * Hook to fetch teacher's recurring schedule (for ApprovedSlotSelector).
 * Returns the recurring slots used for lecture scheduling.
 */
export function useMyRecurringSchedule(teacherId?: number) {
    return useQuery({
        queryKey: teacherId ? teacherTimeSlotKeys.teacherRecurringSchedule(teacherId) : teacherTimeSlotKeys.myRecurringSchedule(),
        queryFn: () => teacherId ? adminService.getTeacherRecurringSchedule(teacherId) : teacherService.getMyRecurringSchedule(),
        select: (response) => response.data,
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

/**
 * Hook to cancel all pending slot requests.
 */
export function useCancelAllRequests() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => teacherService.cancelAllRequests(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: teacherTimeSlotKeys.all });
            queryClient.invalidateQueries({ queryKey: ['timeSlots'] });
        },
    });
}
