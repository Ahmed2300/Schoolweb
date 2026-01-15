import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Make Pusher available globally for Laravel Echo
declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo: Echo<'reverb'>;
    }
}

window.Pusher = Pusher;

/**
 * WebSocket Configuration - using Reverb
 */
const REVERB_CONFIG = {
    key: import.meta.env.VITE_REVERB_APP_KEY || 'school-reverb-key',
    host: import.meta.env.VITE_REVERB_HOST || 'localhost',
    port: parseInt(import.meta.env.VITE_REVERB_PORT || '8080'),
    scheme: import.meta.env.VITE_REVERB_SCHEME || 'http',
};

let echoInstance: Echo<'reverb'> | null = null;

/**
 * Initialize Laravel Echo with Reverb broadcaster
 */
export function initializeEcho(authToken: string): Echo<'reverb'> {
    if (echoInstance) {
        return echoInstance;
    }

    const apiBaseUrl = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:8000`;

    echoInstance = new Echo({
        broadcaster: 'reverb',
        key: REVERB_CONFIG.key,
        wsHost: REVERB_CONFIG.host,
        wsPort: REVERB_CONFIG.port,
        wssPort: REVERB_CONFIG.port,
        forceTLS: REVERB_CONFIG.scheme === 'https',
        enabledTransports: ['ws', 'wss'],
        authEndpoint: `${apiBaseUrl}/api/broadcasting/auth`,
        auth: {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        },
    });

    window.Echo = echoInstance;
    return echoInstance;
}

/**
 * Get the Echo instance
 */
export function getEcho(): Echo<'reverb'> | null {
    return echoInstance;
}

/**
 * Disconnect and cleanup Echo
 */
export function disconnectEcho(): void {
    if (echoInstance) {
        echoInstance.disconnect();
        echoInstance = null;
    }
}

/**
 * Subscribe to admin notification channel
 */
export function subscribeToAdminChannel(
    adminId: number,
    onNotification: (event: unknown) => void
): void {
    const echo = getEcho();
    if (!echo) {
        console.error('Echo not initialized. Call initializeEcho first.');
        return;
    }

    echo
        .private(`admin.${adminId}`)
        .listen('.notification', (event: unknown) => {
            console.log('Received notification:', event);
            onNotification(event);
        });
}

/**
 * Unsubscribe from admin notification channel
 */
export function unsubscribeFromAdminChannel(adminId: number): void {
    const echo = getEcho();
    if (echo) {
        echo.leave(`admin.${adminId}`);
    }
}

export default {
    initializeEcho,
    getEcho,
    disconnectEcho,
    subscribeToAdminChannel,
    unsubscribeFromAdminChannel,
};
