import { useQuery } from '@tanstack/react-query';
import { commonService } from '../data/api/commonService';

/**
 * Hook to fetch and cache public settings globally.
 * React Query ensures this is only fetched once, even if called
 * simultaneously by Navbar, Footer, Sidebar, etc.
 */
export const useSettings = () => {
    return useQuery({
        queryKey: ['public-settings'],
        queryFn: async () => {
            const data = await commonService.getSettings();
            
            // Convert array of settings to object key-value pairs
            const settingsMap: Record<string, any> = {};
            if (Array.isArray(data)) {
                data.forEach((setting: any) => {
                    if (setting.key && setting.value !== undefined) {
                        settingsMap[setting.key] = setting.value;
                    }
                });
                return settingsMap;
            } else if (typeof data === 'object' && data !== null) {
                return data;
            }
            return {};
        },
        staleTime: 1000 * 60 * 60, // Cache for 1 hour
        gcTime: 1000 * 60 * 60 * 24, // Keep in garbage collection for 24 hours
        refetchOnWindowFocus: false, // Don't refetch on tab switch
        refetchOnMount: false,
    });
};
