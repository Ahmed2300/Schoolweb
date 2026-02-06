/**
 * useSlotRequests Hook
 * 
 * Custom hook for managing teacher slot requests.
 * Uses TanStack Query for server state management.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { slotRequestService } from '../data/api/slotRequestService';
import type {
    SlotRequest,
    CreateSlotRequestPayload,
    SlotRequestStats,
} from '../types/slotRequest';
import toast from 'react-hot-toast';

// ==================== QUERY KEYS ====================

export const slotRequestKeys = {
    all: ['slotRequests'] as const,
    list: (filters: { status?: string }) => [...slotRequestKeys.all, 'list', filters] as const,
    stats: () => [...slotRequestKeys.all, 'stats'] as const,
    detail: (id: number) => [...slotRequestKeys.all, 'detail', id] as const,
    approved: () => [...slotRequestKeys.all, 'approved'] as const,
};

// ==================== QUERIES ====================

/**
 * Query for fetching teacher's slot requests with optional status filter.
 */
export function useSlotRequestsQuery(status?: string) {
    return useQuery({
        queryKey: slotRequestKeys.list({ status }),
        queryFn: () => slotRequestService.getMyRequests(status),
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

/**
 * Query for fetching approved slots available for lecture creation.
 */
export function useApprovedSlotsQuery() {
    return useQuery({
        queryKey: slotRequestKeys.approved(),
        queryFn: () => slotRequestService.getApprovedForLecture(),
        staleTime: 1000 * 60 * 2,
    });
}

/**
 * Query for fetching slot request stats.
 */
export function useSlotRequestStats() {
    return useQuery({
        queryKey: slotRequestKeys.stats(),
        queryFn: () => slotRequestService.getStats(),
        staleTime: 1000 * 60 * 5,
    });
}

// ==================== HOOK ====================

export function useSlotRequests(status?: string) {
    const queryClient = useQueryClient();

    // Fetch slot requests
    const requestsQuery = useSlotRequestsQuery(status);

    // Fetch stats
    const statsQuery = useSlotRequestStats();

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (payload: CreateSlotRequestPayload) =>
            slotRequestService.createRequest(payload),
        onSuccess: (data) => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: slotRequestKeys.all });
            toast.success(data.message || 'تم إرسال طلبك بنجاح');
        },
        onError: (error: Error & { response?: { data?: { message?: string } } }) => {
            const message = error.response?.data?.message || 'حدث خطأ أثناء إرسال الطلب';
            toast.error(message);
        },
    });

    // Cancel mutation
    const cancelMutation = useMutation({
        mutationFn: (id: number) => slotRequestService.cancelRequest(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: slotRequestKeys.all });
            toast.success(data.message || 'تم إلغاء الطلب بنجاح');
        },
        onError: (error: Error & { response?: { data?: { message?: string } } }) => {
            const message = error.response?.data?.message || 'حدث خطأ أثناء إلغاء الطلب';
            toast.error(message);
        },
    });

    return {
        // Data
        requests: requestsQuery.data ?? [] as SlotRequest[],
        stats: statsQuery.data as SlotRequestStats | undefined,

        // Loading states
        isLoading: requestsQuery.isLoading,
        isStatsLoading: statsQuery.isLoading,
        isCreating: createMutation.isPending,
        isCanceling: cancelMutation.isPending,

        // Error states
        error: requestsQuery.error,

        // Actions
        createRequest: createMutation.mutateAsync,
        cancelRequest: cancelMutation.mutateAsync,
        refetch: requestsQuery.refetch,
        refetchStats: statsQuery.refetch,
    };
}

export default useSlotRequests;
