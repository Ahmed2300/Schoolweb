/**
 * React Query hooks for Time Slots management (Admin).
 * Provides data fetching, caching, and mutations for the slots approval workflow.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminService from '../../data/api/adminService';
import type {
    TimeSlot,
    TimeSlotStats,
    TimeSlotFilters,
    CreateTimeSlotRequest,
    UpdateTimeSlotRequest,
} from '../../types/timeSlot';

// Query keys for cache management
export const timeSlotKeys = {
    all: ['timeSlots'] as const,
    lists: () => [...timeSlotKeys.all, 'list'] as const,
    list: (filters?: TimeSlotFilters) => [...timeSlotKeys.lists(), filters] as const,
    pending: () => [...timeSlotKeys.all, 'pending'] as const,
    stats: () => [...timeSlotKeys.all, 'stats'] as const,
    detail: (id: number) => [...timeSlotKeys.all, 'detail', id] as const,
};

/**
 * Hook to fetch all time slots with optional filters.
 */
export function useTimeSlots(filters?: TimeSlotFilters) {
    return useQuery({
        queryKey: timeSlotKeys.list(filters),
        queryFn: () => adminService.getTimeSlots(filters),
        select: (response) => response.data as TimeSlot[],
    });
}

/**
 * Hook to fetch a single time slot by ID.
 */
export function useTimeSlot(id: number) {
    return useQuery({
        queryKey: timeSlotKeys.detail(id),
        queryFn: () => adminService.getTimeSlot(id),
        select: (response) => response.data as TimeSlot,
        enabled: !!id,
    });
}

/**
 * Hook to fetch pending slot requests for approval.
 */
export function usePendingSlots() {
    return useQuery({
        queryKey: timeSlotKeys.pending(),
        queryFn: () => adminService.getPendingSlots(),
        select: (response) => ({
            slots: response.data as TimeSlot[],
            count: response.count as number,
        }),
    });
}

/**
 * Hook to fetch time slot statistics for dashboard.
 */
export function useTimeSlotStats() {
    return useQuery({
        queryKey: timeSlotKeys.stats(),
        queryFn: () => adminService.getTimeSlotStats(),
        select: (response) => response.data as TimeSlotStats,
    });
}

/**
 * Hook to create a new time slot.
 */
export function useCreateTimeSlot() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateTimeSlotRequest) => adminService.createTimeSlot(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: timeSlotKeys.all });
        },
    });
}

/**
 * Hook to update an existing time slot.
 */
export function useUpdateTimeSlot() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateTimeSlotRequest }) =>
            adminService.updateTimeSlot(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: timeSlotKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: timeSlotKeys.lists() });
        },
    });
}

/**
 * Hook to delete a time slot.
 */
export function useDeleteTimeSlot() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => adminService.deleteTimeSlot(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: timeSlotKeys.all });
        },
    });
}

/**
 * Hook to approve a teacher's slot request.
 */
export function useApproveSlotRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => adminService.approveSlotRequest(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: timeSlotKeys.all });
        },
    });
}

/**
 * Hook to reject a teacher's slot request.
 */
export function useRejectSlotRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reason }: { id: number; reason: string }) =>
            adminService.rejectSlotRequest(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: timeSlotKeys.all });
        },
    });
}

/**
 * Hook to bulk create multiple time slots.
 */
export function useBulkCreateTimeSlots() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (slots: Array<{ start_time: string; end_time: string }>) =>
            adminService.bulkCreateTimeSlots(slots),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: timeSlotKeys.all });
        },
    });
}

/**
 * Hook to delete all time slots.
 */
export function useDeleteAllTimeSlots() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => adminService.deleteAllTimeSlots(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: timeSlotKeys.all });
        },
    });
}
