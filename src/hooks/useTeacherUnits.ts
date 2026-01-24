/**
 * useTeacherUnits Hook
 *
 * React Query hooks for Teacher Units management.
 * Provides CRUD operations, reordering, and lecture management within units.
 * Mirrors useUnits but uses teacherService.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherService } from '../data/api/teacherService';
import type { Unit, CreateUnitRequest, UpdateUnitRequest } from '../types/unit';
import toast from 'react-hot-toast';

// Query keys for cache management
export const teacherUnitKeys = {
    all: ['teacher-units'] as const,
    list: (courseId: number) => [...teacherUnitKeys.all, 'list', courseId] as const,
    detail: (courseId: number, unitId: number) => [...teacherUnitKeys.all, 'detail', courseId, unitId] as const,
};

/**
 * Get all units for a course (Teacher)
 */
export const useTeacherUnits = (courseId: number) => {
    return useQuery({
        queryKey: teacherUnitKeys.list(courseId),
        queryFn: () => teacherService.getUnits(courseId),
        enabled: !!courseId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

/**
 * Create a new unit (Teacher)
 */
export const useTeacherCreateUnit = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ courseId, data }: { courseId: number; data: CreateUnitRequest }) =>
            teacherService.createUnit(courseId, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: teacherUnitKeys.list(variables.courseId) });
            toast.success('تم إنشاء الوحدة بنجاح');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'فشل في إنشاء الوحدة');
        },
    });
};

/**
 * Update a unit (Teacher)
 */
export const useTeacherUpdateUnit = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ courseId, unitId, data }: { courseId: number; unitId: number; data: UpdateUnitRequest }) =>
            teacherService.updateUnit(courseId, unitId, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: teacherUnitKeys.list(variables.courseId) });
            queryClient.invalidateQueries({ queryKey: teacherUnitKeys.detail(variables.courseId, variables.unitId) });
            toast.success('تم تحديث الوحدة بنجاح');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'فشل في تحديث الوحدة');
        },
    });
};

/**
 * Delete a unit (Teacher)
 */
export const useTeacherDeleteUnit = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ courseId, unitId }: { courseId: number; unitId: number }) =>
            teacherService.deleteUnit(courseId, unitId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: teacherUnitKeys.list(variables.courseId) });
            toast.success('تم حذف الوحدة بنجاح');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'فشل في حذف الوحدة');
        },
    });
};

/**
 * Reorder units within a course (Teacher)
 */
export const useTeacherReorderUnits = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ courseId, order }: { courseId: number; order: number[] }) =>
            teacherService.reorderUnits(courseId, order),

        // Optimistic update
        onMutate: async ({ courseId, order }) => {
            await queryClient.cancelQueries({ queryKey: teacherUnitKeys.list(courseId) });

            const previousData = queryClient.getQueryData(teacherUnitKeys.list(courseId));

            // Optimistically reorder
            queryClient.setQueryData(teacherUnitKeys.list(courseId), (old: { data: Unit[] } | undefined) => {
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
                queryClient.setQueryData(teacherUnitKeys.list(variables.courseId), context.previousData);
            }
            toast.error('فشل في إعادة ترتيب الوحدات');
        },

        onSettled: (_data, _error, variables) => {
            queryClient.invalidateQueries({ queryKey: teacherUnitKeys.list(variables.courseId) });
        },
    });
};

// Assuming lectures still use the central lectureService or we need to add lecture methods to teacherService
// For now, let's assume we might need to copy lecture hooks too if endpoints differ.
// But usually lecture manipulation (other than linking) might be generic if permission allows.
// However, the admin hook uses adminService.moveLectureToUnit.
// teacherService likely needs to implement lecture logic too if the backend enforces policies strictly.

