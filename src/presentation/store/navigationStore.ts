import { create } from 'zustand';

interface NavigationState {
    isNavigating: boolean;
    startNavigation: () => void;
    endNavigation: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
    isNavigating: false,
    startNavigation: () => set({ isNavigating: true }),
    endNavigation: () => set({ isNavigating: false }),
}));
