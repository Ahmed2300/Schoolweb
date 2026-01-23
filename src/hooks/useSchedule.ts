/**
 * useSchedule Hook
 *
 * React Query hooks for student schedule management.
 * Includes optimistic updates with rollback on error.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '../data/api/studentService';
import type { Schedule, CreateScheduleRequest, UpdateScheduleRequest } from '../types/schedule';
import toast from 'react-hot-toast';

// Query keys for cache management
export const scheduleKeys = {
    all: ['schedules'] as const,
    list: () => [...scheduleKeys.all, 'list'] as const,
};

/**
 * Get all scheduled lectures for the current student
 */
export const useSchedules = () => {
    return useQuery({
        queryKey: scheduleKeys.list(),
        queryFn: studentService.getSchedules,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

/**
 * Create a new scheduled lecture
 */
export const useCreateSchedule = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateScheduleRequest) => studentService.createSchedule(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: scheduleKeys.list() });
            toast.success('تمت جدولة المحاضرة بنجاح');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'فشل في جدولة المحاضرة');
        },
    });
};

/**
 * Update a scheduled lecture
 */
export const useUpdateSchedule = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateScheduleRequest }) =>
            studentService.updateSchedule(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: scheduleKeys.list() });
            toast.success('تم تحديث الموعد بنجاح');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'فشل في تحديث الموعد');
        },
    });
};

/**
 * Mark a scheduled lecture as completed
 * Uses optimistic updates with rollback on error
 */
export const useCompleteSchedule = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => studentService.completeSchedule(id),

        // Optimistic update
        onMutate: async (id: number) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: scheduleKeys.list() });

            // Snapshot the previous value
            const previousSchedules = queryClient.getQueryData<Schedule[]>(scheduleKeys.list());

            // Optimistically update to the new value
            queryClient.setQueryData<Schedule[]>(scheduleKeys.list(), (old) =>
                old?.map((schedule) =>
                    schedule.id === id ? { ...schedule, is_completed: true } : schedule
                )
            );

            // Return context with the previous value
            return { previousSchedules };
        },

        // On success, show toast
        onSuccess: () => {
            toast.success('تم تحديد المحاضرة كمكتملة');
        },

        // On error, rollback and show error toast
        onError: (error: Error, _id, context) => {
            // Rollback to previous state
            if (context?.previousSchedules) {
                queryClient.setQueryData(scheduleKeys.list(), context.previousSchedules);
            }
            toast.error('فشل في تحديث الحالة. يرجى المحاولة مرة أخرى.');
        },

        // Always refetch after error or success
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: scheduleKeys.list() });
        },
    });
};

/**
 * Delete a scheduled lecture
 * Uses optimistic updates with rollback on error
 */
export const useDeleteSchedule = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => studentService.deleteSchedule(id),

        // Optimistic update
        onMutate: async (id: number) => {
            await queryClient.cancelQueries({ queryKey: scheduleKeys.list() });

            const previousSchedules = queryClient.getQueryData<Schedule[]>(scheduleKeys.list());

            // Optimistically remove the schedule
            queryClient.setQueryData<Schedule[]>(scheduleKeys.list(), (old) =>
                old?.filter((schedule) => schedule.id !== id)
            );

            return { previousSchedules };
        },

        onSuccess: () => {
            toast.success('تم حذف المحاضرة من الجدول');
        },

        onError: (error: Error, _id, context) => {
            if (context?.previousSchedules) {
                queryClient.setQueryData(scheduleKeys.list(), context.previousSchedules);
            }
            toast.error('فشل في حذف المحاضرة. يرجى المحاولة مرة أخرى.');
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: scheduleKeys.list() });
        },
    });
};
