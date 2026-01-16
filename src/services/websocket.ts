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
let studentEchoInstance: Echo<'reverb'> | null = null;

/**
 * Initialize Laravel Echo with Reverb broadcaster (for Admin)
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
 * Initialize Laravel Echo with Reverb broadcaster (for Student)
 */
export function initializeStudentEcho(authToken: string): Echo<'reverb'> {
    if (studentEchoInstance) {
        return studentEchoInstance;
    }

    const apiBaseUrl = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:8000`;

    studentEchoInstance = new Echo({
        broadcaster: 'reverb',
        key: REVERB_CONFIG.key,
        wsHost: REVERB_CONFIG.host,
        wsPort: REVERB_CONFIG.port,
        wssPort: REVERB_CONFIG.port,
        forceTLS: REVERB_CONFIG.scheme === 'https',
        enabledTransports: ['ws', 'wss'],
        authEndpoint: `${apiBaseUrl}/api/broadcasting/auth/student`,
        auth: {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        },
    });

    return studentEchoInstance;
}

/**
 * Get the Echo instance (admin)
 */
export function getEcho(): Echo<'reverb'> | null {
    return echoInstance;
}

/**
 * Get the student Echo instance
 */
export function getStudentEcho(): Echo<'reverb'> | null {
    return studentEchoInstance;
}

/**
 * Disconnect and cleanup Echo (admin)
 */
export function disconnectEcho(): void {
    if (echoInstance) {
        echoInstance.disconnect();
        echoInstance = null;
    }
}

/**
 * Disconnect and cleanup student Echo
 */
export function disconnectStudentEcho(): void {
    if (studentEchoInstance) {
        studentEchoInstance.disconnect();
        studentEchoInstance = null;
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

/**
 * Subscribe to student notification channel
 */
export function subscribeToStudentChannel(
    studentId: number,
    onNotification: (event: unknown) => void
): void {
    const echo = getStudentEcho();
    if (!echo) {
        console.error('Student Echo not initialized. Call initializeStudentEcho first.');
        return;
    }

    echo
        .private(`student.${studentId}`)
        .listen('.notification', (event: unknown) => {
            console.log('Received student notification:', event);
            onNotification(event);
        });
}

/**
 * Unsubscribe from student notification channel
 */
export function unsubscribeFromStudentChannel(studentId: number): void {
    const echo = getStudentEcho();
    if (echo) {
        echo.leave(`student.${studentId}`);
    }
}

export default {
    initializeEcho,
    initializeStudentEcho,
    getEcho,
    getStudentEcho,
    disconnectEcho,
    disconnectStudentEcho,
    subscribeToAdminChannel,
    unsubscribeFromAdminChannel,
    subscribeToStudentChannel,
    unsubscribeFromStudentChannel,
};
