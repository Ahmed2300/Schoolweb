/**
 * React Query hooks for Slot Requests management (Admin).
 * Provides data fetching, caching, and mutations for the teacher schedule request workflow.
 * 
 * This connects to the NEW SlotRequest system (/admin/schedule/requests)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminService from '../../data/api/adminService';
import type {
    SlotRequest,
    SlotRequestStats,
    SlotRequestStatus,
} from '../../types/slotRequest';

// Query keys for cache management
export const slotRequestKeys = {
    all: ['slotRequests'] as const,
    lists: () => [...slotRequestKeys.all, 'list'] as const,
    list: (filters?: SlotRequestFilters) => [...slotRequestKeys.lists(), filters] as const,
    stats: () => [...slotRequestKeys.all, 'stats'] as const,
    detail: (id: number) => [...slotRequestKeys.all, 'detail', id] as const,
};

interface SlotRequestFilters {
    status?: SlotRequestStatus | 'all';
    grade_id?: number;
    teacher_id?: number;
    type?: 'weekly' | 'one-time';
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
export function useSlotRequest(id: number) {
    return useQuery({
        queryKey: slotRequestKeys.detail(id),
        queryFn: () => adminService.getSlotRequest(id),
        select: (response: { data: SlotRequest }) => response.data,
        enabled: !!id,
    });
}

/**
 * Hook to fetch slot request statistics for dashboard.
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
 */
export function useApproveTeacherSlotRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => adminService.approveTeacherSlotRequest(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: slotRequestKeys.all });
            // Also invalidate teacher's slots cache
            queryClient.invalidateQueries({ queryKey: ['teacherTimeSlots'] });
        },
    });
}

/**
 * Hook to reject a teacher's slot request.
 */
export function useRejectTeacherSlotRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reason }: { id: number; reason: string }) =>
            adminService.rejectTeacherSlotRequest(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: slotRequestKeys.all });
            queryClient.invalidateQueries({ queryKey: ['teacherTimeSlots'] });
        },
    });
}

/**
 * Hook to bulk approve multiple slot requests.
 */
export function useBulkApproveSlotRequests() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (ids: number[]) => adminService.bulkApproveSlotRequests(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: slotRequestKeys.all });
            queryClient.invalidateQueries({ queryKey: ['teacherTimeSlots'] });
        },
    });
}

/**
 * Hook to bulk reject multiple slot requests.
 */
export function useBulkRejectSlotRequests() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ ids, reason }: { ids: number[]; reason: string }) =>
            adminService.bulkRejectSlotRequests(ids, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: slotRequestKeys.all });
            queryClient.invalidateQueries({ queryKey: ['teacherTimeSlots'] });
        },
    });
}
