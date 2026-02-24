import apiClient from './ApiClient';
import { endpoints } from './endpoints';

declare global {
    interface Window {
        OneSignalDeferred: any[];
        OneSignal: any;
    }
}

/**
 * OneSignal Helper Service
 * Handles interactions with the OneSignal SDK and backend device registration.
 */
export const oneSignalService = {
    /**
     * Get the current OneSignal Player ID (Subscription ID) from the SDK.
     */
    async getSubscriptionId(): Promise<string | null> {
        return new Promise((resolve) => {
            const timeoutId = setTimeout(() => {
                // If OneSignal doesn't load within 3 seconds, resolve null to prevent hanging
                console.warn('OneSignal: getSubscriptionId timed out');
                resolve(null);
            }, 3000);

            window.OneSignalDeferred = window.OneSignalDeferred || [];
            window.OneSignalDeferred.push(async (OneSignal: any) => {
                try {
                    const id = await OneSignal.User.PushSubscription.id;
                    clearTimeout(timeoutId);
                    resolve(id || null);
                } catch (error) {
                    console.warn('OneSignal: Failed to get subscription ID', error);
                    clearTimeout(timeoutId);
                    resolve(null);
                }
            });
        });
    },

    /**
     * Register the current device with the backend.
     * Call this after successful login.
     */
    async registerDevice(): Promise<void> {
        try {
            const playerId = await this.getSubscriptionId();
            if (!playerId) {
                console.warn('OneSignal: No player ID found, skipping registration.');
                return;
            }

            await apiClient.post(endpoints.deviceTokens.store, {
                player_id: playerId,
                device_type: 'web',
                device_name: navigator.userAgent,
            });
            // console.log('OneSignal: Device registered successfully.');
        } catch (error) {
            console.error('OneSignal: Failed to register device', error);
        }
    },

    /**
     * Unregister the current device from the backend.
     * Call this before logout.
     */
    async unregisterDevice(): Promise<void> {
        try {
            const playerId = await this.getSubscriptionId();
            if (!playerId) return;

            // We use 'data' here because axios DELETE requests generally require it for the body
            await apiClient.delete(endpoints.deviceTokens.delete, {
                data: { player_id: playerId },
            });
            // console.log('OneSignal: Device unregistered successfully.');
        } catch (error) {
            console.error('OneSignal: Failed to unregister device', error);
        }
    },
};
