import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000, // Data matches query for 1 minute
            refetchOnWindowFocus: false, // Prevents unnecessary refetches
            retry: 1, // Retry failed requests once
        },
    },
});
