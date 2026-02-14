import { oneSignalService } from './data/api/onesignal'; // Not used directly but ensure service is ready? No, direct window access.

/**
 * Initialize OneSignal SDK
 */
export const initOneSignal = async () => {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal: any) => {
        try {
            await OneSignal.init({
                appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
                allowLocalhostAsSecureOrigin: true,
            });
            // console.log('OneSignal Initialized');
            // console.log('OneSignal Initialized');
        } catch (error) {
            console.error('OneSignal Initialization Error:', error);
        }
    });
};
