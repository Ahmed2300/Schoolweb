import { useQuery } from '@tanstack/react-query';
import { adminService, GradeData, SubjectData, UserData, PaginatedResponse } from '../../data/api/adminService';

// Grades Hook
export const useGrades = () => {
    return useQuery<PaginatedResponse<GradeData>>({
        queryKey: ['admin-grades'],
        queryFn: async () => {
            const response = await adminService.getGrades({ per_page: 100 });
            return response;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Teachers Hook
export const useTeachers = () => {
    return useQuery<PaginatedResponse<UserData>>({
        queryKey: ['admin-teachers-list'],
        queryFn: async () => {
            const response = await adminService.getTeachers({ per_page: 100 });
            return response;
        },
        staleTime: 5 * 60 * 1000,
    });
};

// Subjects Hook
export const useSubjects = () => {
    return useQuery<PaginatedResponse<SubjectData>>({
        queryKey: ['admin-subjects-list'],
        queryFn: async () => {
            const response = await adminService.getSubjects({ per_page: 100 });
            return response;
        },
        staleTime: 5 * 60 * 1000,
    });
};
