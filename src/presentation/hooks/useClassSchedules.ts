
import { useQuery } from '@tanstack/react-query';
import adminService from '../../data/api/adminService';

interface UseClassSchedulesParams {
    grade_id?: number;
    teacher_id?: number;
    day_of_week?: number;
    search?: string;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    grouped?: boolean;
}

export const useClassSchedules = (params: UseClassSchedulesParams = {}) => {
    return useQuery({
        queryKey: ['admin-class-schedules', params],
        queryFn: () => {
            if (params.grouped) {
                return adminService.getClassSchedulesGrouped(params);
            }
            return adminService.getClassSchedules(params);
        },
        placeholderData: (previousData) => previousData,
    });
};
