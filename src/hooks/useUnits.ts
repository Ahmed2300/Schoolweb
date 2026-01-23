/**
 * useUnits Hook
 *
 * React Query hooks for admin Units management.
 * Provides CRUD operations, reordering, and lecture management within units.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../data/api/adminService';
import type { Unit, CreateUnitRequest, UpdateUnitRequest } from '../types/unit';
import toast from 'react-hot-toast';

// Query keys for cache management
export const unitKeys = {
    all: ['units'] as const,
    list: (courseId: number) => [...unitKeys.all, 'list', courseId] as const,
    detail: (courseId: number, unitId: number) => [...unitKeys.all, 'detail', courseId, unitId] as const,
};

/**
 * Get all units for a course
 */
export const useUnits = (courseId: number) => {
    return useQuery({
        queryKey: unitKeys.list(courseId),
        queryFn: () => adminService.getUnits(courseId),
        enabled: !!courseId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

/**
 * Get a single unit by ID
 */
export const useUnit = (courseId: number, unitId: number) => {
    return useQuery({
        queryKey: unitKeys.detail(courseId, unitId),
        queryFn: () => adminService.getUnit(courseId, unitId),
        enabled: !!courseId && !!unitId,
    });
};

/**
 * Create a new unit
 */
export const useCreateUnit = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ courseId, data }: { courseId: number; data: CreateUnitRequest }) =>
            adminService.createUnit(courseId, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: unitKeys.list(variables.courseId) });
            toast.success('تم إنشاء الوحدة بنجاح');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'فشل في إنشاء الوحدة');
        },
    });
};

/**
 * Update a unit
 */
export const useUpdateUnit = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ courseId, unitId, data }: { courseId: number; unitId: number; data: UpdateUnitRequest }) =>
            adminService.updateUnit(courseId, unitId, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: unitKeys.list(variables.courseId) });
            queryClient.invalidateQueries({ queryKey: unitKeys.detail(variables.courseId, variables.unitId) });
            toast.success('تم تحديث الوحدة بنجاح');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'فشل في تحديث الوحدة');
        },
    });
};

/**
 * Delete a unit
 */
export const useDeleteUnit = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ courseId, unitId }: { courseId: number; unitId: number }) =>
            adminService.deleteUnit(courseId, unitId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: unitKeys.list(variables.courseId) });
            toast.success('تم حذف الوحدة بنجاح');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'فشل في حذف الوحدة');
        },
    });
};

/**
 * Reorder units within a course
 * Uses optimistic updates for smooth drag-drop UX
 */
export const useReorderUnits = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ courseId, order }: { courseId: number; order: number[] }) =>
            adminService.reorderUnits(courseId, order),

        // Optimistic update for smooth UX
        onMutate: async ({ courseId, order }) => {
            await queryClient.cancelQueries({ queryKey: unitKeys.list(courseId) });

            const previousData = queryClient.getQueryData(unitKeys.list(courseId));

            // Optimistically reorder
            queryClient.setQueryData(unitKeys.list(courseId), (old: { data: Unit[] } | undefined) => {
                if (!old?.data) return old;
                const reordered = order.map((id, index) => {
                    const unit = old.data.find((u: Unit) => u.id === id);
                    return unit ? { ...unit, order: index + 1 } : null;
                }).filter(Boolean);
                return { ...old, data: reordered };
            });

            return { previousData };
        },

        onError: (error, variables, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(unitKeys.list(variables.courseId), context.previousData);
            }
            toast.error('فشل في إعادة ترتيب الوحدات');
        },

        onSettled: (_data, _error, variables) => {
            queryClient.invalidateQueries({ queryKey: unitKeys.list(variables.courseId) });
        },
    });
};

/**
 * Move a lecture to a different unit
 */
export const useMoveLecture = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ unitId, lectureId, order }: { unitId: number; lectureId: number; order?: number }) =>
            adminService.moveLectureToUnit(unitId, lectureId, order),
        onSuccess: () => {
            // Invalidate all units since we don't know the source unit
            queryClient.invalidateQueries({ queryKey: unitKeys.all });
            toast.success('تم نقل المحاضرة بنجاح');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'فشل في نقل المحاضرة');
        },
    });
};

/**
 * Reorder lectures within a unit
 */
export const useReorderLectures = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ unitId, order }: { unitId: number; order: number[] }) =>
            adminService.reorderLectures(unitId, order),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: unitKeys.all });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'فشل في إعادة ترتيب المحاضرات');
        },
    });
};

/**
 * Toggle unit publish status
 */
export const useToggleUnitPublish = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (unitId: number) => adminService.toggleUnitPublish(unitId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: unitKeys.all });
            const status = data?.data?.is_published ? 'منشورة' : 'مخفية';
            toast.success(`الوحدة الآن ${status}`);
        },
        onError: (error: Error) => {
            toast.error(error.message || 'فشل في تغيير حالة النشر');
        },
    });
};
