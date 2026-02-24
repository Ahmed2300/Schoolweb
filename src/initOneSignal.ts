/**
 * Initialize OneSignal SDK — loads the script dynamically instead of
 * blocking the initial HTML parse with a synchronous <script> tag.
 *
 * The SDK script is injected after the page becomes interactive,
 * improving FCP/LCP by ~200-400ms on mobile.
 */
export const initOneSignal = async () => {
    // Defer loading until after initial paint
    const loadSDK = () => {
        // Don't load twice
        if (document.querySelector('script[src*="OneSignalSDK"]')) return;

        const script = document.createElement('script');
        script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
        script.defer = true;
        script.onload = () => {
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            window.OneSignalDeferred.push(async (OneSignal: any) => {
                try {
                    await OneSignal.init({
                        appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
                        allowLocalhostAsSecureOrigin: true,
                    });
                } catch (error) {
                    console.error('OneSignal Initialization Error:', error);
                }
            });
        };
        document.head.appendChild(script);
    };

    // Wait for the page to become interactive before loading.
    // requestIdleCallback → ideal, falls back to setTimeout for Safari.
    if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(loadSDK, { timeout: 5000 });
    } else {
        setTimeout(loadSDK, 3000);
    }
};
