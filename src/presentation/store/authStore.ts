import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../../core/entities';
import { authService, teacherAuthService, adminService, influencerService } from '../../data/api';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            setUser: (user) => set({
                user,
                isAuthenticated: !!user,
                error: null
            }),

            setLoading: (isLoading) => set({ isLoading }),

            setError: (error) => set({ error, isLoading: false }),

            logout: async () => {
                const { user } = get();
                
                // 1. Call Backend API to revoke session if user exists
                if (user) {
                    try {
                        const role = user.role as string;
                        if (role === 'student' || role === 'parent') {
                            await authService.logout(role as 'student' | 'parent');
                        } else if (role === 'teacher') {
                            await teacherAuthService.logout();
                        } else if (role === 'admin') {
                            await adminService.logout();
                        } else if (role === 'influencer') {
                            // Assuming influencerService might have a logout or uses a common one
                            if ((influencerService as any).logout) {
                                await (influencerService as any).logout();
                            }
                        }
                    } catch (error) {
                        console.error('Logout API failed:', error);
                        // Continue clearing local state anyway
                    }
                }

                // 2. Disconnect WebSocket
                try {
                    const { disconnectEcho } = await import('../../services/websocket');
                    disconnectEcho();
                } catch (e) {
                    // Ignore websocket errors
                }

                // 3. Clear Local State
                set({
                    user: null,
                    isAuthenticated: false,
                    error: null
                });

                // 4. Force clear any remaining storage if needed
                localStorage.removeItem('auth-storage');
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated
            }),
        }
    )
);
