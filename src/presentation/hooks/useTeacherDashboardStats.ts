import { useQuery } from '@tanstack/react-query';
import { teacherService } from '../../data/api';

interface DashboardStats {
    totalCourses: number;
    activeCourses: number;
    totalStudents: number;
    totalLectures: number;
}

/**
 * Custom hook for fetching teacher dashboard statistics.
 * Implements stale-while-revalidate pattern for better UX.
 * - Shows cached data immediately while revalidating in the background.
 * - Data is considered fresh for 2 minutes (staleTime).
 * - Cached data is kept for 10 minutes (gcTime).
 */
export function useTeacherDashboardStats() {
    return useQuery<DashboardStats>({
        queryKey: ['teacher', 'dashboard', 'stats'],
        queryFn: teacherService.getDashboardStats,
        staleTime: 2 * 60 * 1000, // 2 minutes - data is fresh
        gcTime: 10 * 60 * 1000, // 10 minutes - cache retention
        refetchOnWindowFocus: true, // Refetch when user returns to tab
        retry: 2, // Retry failed requests twice
        placeholderData: (previousData) => previousData, // Keep showing old data while fetching
    });
}

export default useTeacherDashboardStats;
