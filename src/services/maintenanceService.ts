/**
 * Maintenance Service
 * @module services/maintenanceService
 * 
 * Handles Firebase Remote Config fetching to determine maintenance mode status.
 * Uses the `isLive` parameter: true = app running, false = maintenance mode.
 */

import { fetchAndActivate, getValue } from 'firebase/remote-config';
import { remoteConfig } from './firebaseConfig';

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
    try {
        // Fetch and activate Remote Config values
        await fetchAndActivate(remoteConfig);

        // Get the isLive parameter
        const isLiveValue = getValue(remoteConfig, 'isLive');
        const isLive = isLiveValue.asBoolean();

        return {
            isLive,
            error: null,
        };
    } catch (error) {
        console.error('Error fetching Remote Config:', error);

        // Safe fallback: if we can't fetch, assume app is live
        // This prevents accidental lockouts due to network issues
        return {
            isLive: true,
            error: error instanceof Error ? error : new Error('Unknown error'),
        };
    }
}

/**
 * Quick check without network fetch - uses cached/default values
 */
export function getCachedMaintenanceStatus(): boolean {
    try {
        const isLiveValue = getValue(remoteConfig, 'isLive');
        return isLiveValue.asBoolean();
    } catch {
        return true; // Safe fallback
    }
}
