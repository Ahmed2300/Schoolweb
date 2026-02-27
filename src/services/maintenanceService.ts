/**
 * Maintenance Service
 * @module services/maintenanceService
 * 
 * Handles Firebase Remote Config fetching to determine maintenance mode status.
 * Uses the `isLive` parameter: true = app running, false = maintenance mode.
 */

// Firebase has been disabled to speed up the application load time.
// import { fetchAndActivate, getValue } from 'firebase/remote-config';
// import { remoteConfig } from './firebaseConfig';

export interface MaintenanceStatus {
    isLive: boolean;
    error: Error | null;
}

/**
 * Fetches the maintenance status from Firebase Remote Config.
 * 
 * @returns Promise<MaintenanceStatus> - isLive: true means app is running normally
 * @safety Falls back to isLive: true if fetch fails, keeping app accessible
 */
export async function fetchMaintenanceStatus(): Promise<MaintenanceStatus> {
    // Firebase listener has been disabled for performance. Simply return true instantly.
    return {
        isLive: true,
        error: null,
    };
}

/**
 * Quick check without network fetch - uses cached/default values
 */
export function getCachedMaintenanceStatus(): boolean {
    return true;
}
