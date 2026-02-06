/**
 * React Query hooks for Slot Requests management (Admin).
 * Provides data fetching, caching, and mutations for the teacher schedule request workflow.
 * 
 * This connects to the NEW SlotRequest system (/admin/schedule/requests)
 * Supports BOTH weekly (TeacherRecurringSlot) and one_time (SlotRequest) types.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminService from '../../data/api/adminService';
import type {
    SlotRequest,
    SlotRequestStats,
    SlotRequestStatus,
} from '../../types/slotRequest';

// Type for slot request type filter
export type SlotRequestType = 'weekly' | 'one_time';

// Query keys for cache management
export const slotRequestKeys = {
    all: ['slotRequests'] as const,
    lists: () => [...slotRequestKeys.all, 'list'] as const,
    list: (filters?: SlotRequestFilters) => [...slotRequestKeys.lists(), filters] as const,
    stats: () => [...slotRequestKeys.all, 'stats'] as const,
    detail: (id: number, type?: SlotRequestType) => [...slotRequestKeys.all, 'detail', id, type] as const,
};

export interface SlotRequestFilters {
    status?: SlotRequestStatus | 'all';
    grade_id?: number;
    teacher_id?: number;
    type?: SlotRequestType;
    page?: number;
    per_page?: number;
}

interface SlotRequestListResponse {
    success: boolean;
    data: SlotRequest[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

/**
 * Hook to fetch all slot requests with optional filters.
 */
export function useSlotRequests(filters?: SlotRequestFilters) {
    return useQuery({
        queryKey: slotRequestKeys.list(filters),
        queryFn: () => adminService.getSlotRequests(filters),
        select: (response: SlotRequestListResponse) => ({
            requests: response.data as SlotRequest[],
            meta: response.meta,
        }),
    });
}

/**
 * Hook to fetch pending slot requests only.
 */
export function usePendingSlotRequests() {
    return useQuery({
        queryKey: slotRequestKeys.list({ status: 'pending' }),
        queryFn: () => adminService.getSlotRequests({ status: 'pending', per_page: 100 }),
        select: (response: SlotRequestListResponse) => ({
            requests: response.data as SlotRequest[],
            count: response.meta?.total || response.data.length,
        }),
    });
}

/**
 * Hook to fetch a single slot request by ID.
 */
export function useSlotRequest(id: number, type: SlotRequestType = 'weekly') {
    return useQuery({
        queryKey: slotRequestKeys.detail(id, type),
        queryFn: () => adminService.getSlotRequest(id, type),
        select: (response: { data: SlotRequest }) => response.data,
        enabled: !!id,
    });
}

/**
 * Hook to fetch slot request statistics for dashboard.
 * Returns combined stats for both weekly and one_time requests.
 */
export function useSlotRequestStats() {
    return useQuery({
        queryKey: slotRequestKeys.stats(),
        queryFn: () => adminService.getSlotRequestStats(),
        select: (response: { data: SlotRequestStats }) => response.data as SlotRequestStats,
    });
}

/**
 * Hook to approve a teacher's slot request.
 * Supports both weekly and one_time request types.
 */
export function useApproveTeacherSlotRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, type = 'weekly' }: { id: number; type?: SlotRequestType }) =>
            adminService.approveTeacherSlotRequest(id, type),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: slotRequestKeys.all });
            // Also invalidate teacher's slots cache
            queryClient.invalidateQueries({ queryKey: ['teacherTimeSlots'] });
        },
    });
}

/**
 * Hook to reject a teacher's slot request.
 * Supports both weekly and one_time request types.
 */
export function useRejectTeacherSlotRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reason, type = 'weekly' }: { id: number; reason: string; type?: SlotRequestType }) =>
            adminService.rejectTeacherSlotRequest(id, reason, type),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: slotRequestKeys.all });
            queryClient.invalidateQueries({ queryKey: ['teacherTimeSlots'] });
        },
    });
}

/**
 * Hook to bulk approve multiple slot requests.
 * Supports both weekly and one_time request types.
 */
export function useBulkApproveSlotRequests() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ ids, type = 'weekly' }: { ids: number[]; type?: SlotRequestType }) =>
            adminService.bulkApproveSlotRequests(ids, type),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: slotRequestKeys.all });
            queryClient.invalidateQueries({ queryKey: ['teacherTimeSlots'] });
        },
    });
}

/**
 * Hook to bulk reject multiple slot requests.
 * Supports both weekly and one_time request types.
 */
export function useBulkRejectSlotRequests() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ ids, reason, type = 'weekly' }: { ids: number[]; reason: string; type?: SlotRequestType }) =>
            adminService.bulkRejectSlotRequests(ids, reason, type),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: slotRequestKeys.all });
            queryClient.invalidateQueries({ queryKey: ['teacherTimeSlots'] });
        },
    });
}
