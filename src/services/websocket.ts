import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { getToken } from '../data/api/ApiClient';

// Make Pusher available globally for Laravel Echo
declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo: Echo<'reverb'>;
    }
}

// Disable Pusher logging in production and suppress connection errors
Pusher.logToConsole = false;

window.Pusher = Pusher;

/**
 * WebSocket Configuration - using Reverb
 * Set VITE_WEBSOCKET_ENABLED=false in .env to disable WebSocket
 */
const WEBSOCKET_ENABLED = import.meta.env.VITE_WEBSOCKET_ENABLED !== 'false';

const REVERB_CONFIG = {
    key: import.meta.env.VITE_REVERB_APP_KEY || 'school-reverb-key',
    host: import.meta.env.VITE_REVERB_HOST || 'localhost',
    port: parseInt(import.meta.env.VITE_REVERB_PORT || '8080'),
    scheme: import.meta.env.VITE_REVERB_SCHEME || 'http',
};

// Track connection status to prevent spamming
let connectionFailed = false;

let echoInstance: Echo<'reverb'> | null = null;
let studentEchoInstance: Echo<'reverb'> | null = null;
let parentEchoInstance: Echo<'reverb'> | null = null;
let teacherEchoInstance: Echo<'reverb'> | null = null;

/**
 * Initialize Laravel Echo with Reverb broadcaster (for Admin)
 * Returns null if WebSocket is disabled
 */
export function initializeEcho(authToken: string): Echo<'reverb'> | null {
    // Skip WebSocket if disabled via environment
    if (!WEBSOCKET_ENABLED) {
        return null;
    }

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
 * Initialize Laravel Echo with Reverb broadcaster (for Parent)
 */
export function initializeParentEcho(authToken: string): Echo<'reverb'> {
    if (parentEchoInstance) {
        return parentEchoInstance;
    }

    const apiBaseUrl = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:8000`;

    parentEchoInstance = new Echo({
        broadcaster: 'reverb',
        key: REVERB_CONFIG.key,
        wsHost: REVERB_CONFIG.host,
        wsPort: REVERB_CONFIG.port,
        wssPort: REVERB_CONFIG.port,
        forceTLS: REVERB_CONFIG.scheme === 'https',
        enabledTransports: ['ws', 'wss'],
        authEndpoint: `${apiBaseUrl}/api/broadcasting/auth/parent`,
        auth: {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        },
    });

    return parentEchoInstance;
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
 * Get the parent Echo instance
 */
export function getParentEcho(): Echo<'reverb'> | null {
    return parentEchoInstance;
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
 * Disconnect and cleanup parent Echo
 */
export function disconnectParentEcho(): void {
    if (parentEchoInstance) {
        parentEchoInstance.disconnect();
        parentEchoInstance = null;
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
 * Subscribe to global admins channel (for content approvals etc)
 * Self-initializing: will attempt to create Echo instance if token is available
 * Uses deferred execution to handle module loading timing issues
 */
export function subscribeToAllAdminsChannel(
    onNotification: (event: unknown) => void
): void {
    // Defer to next tick to ensure all modules are loaded
    setTimeout(() => {
        // Try to get existing instance
        let echo = getEcho();

        // If not initialized, try to initialize on demand
        if (!echo) {
            // Use direct localStorage access to avoid any import issues
            const token = localStorage.getItem('auth_token');
            console.log('WebSocket: Attempting init with token:', token ? 'present' : 'missing');

            if (token) {
                echo = initializeEcho(token);
            }
        }

        if (!echo) {
            // Token still not available - this is a genuine auth issue
            console.warn('WebSocket: Cannot subscribe to admins channel - not authenticated');
            return;
        }

        try {
            echo
                .private('admins')
                .listen('ContentChangeRequested', (event: unknown) => {
                    console.log('Received global admin notification:', event);
                    onNotification(event);
                });

            console.log('WebSocket: Successfully subscribed to admins channel');
        } catch (err) {
            console.error('WebSocket: Error subscribing to admins channel:', err);
        }
    }, 100); // Increase delay slightly
}

/**
 * Unsubscribe from global admins channel
 */
export function unsubscribeFromAllAdminsChannel(): void {
    const echo = getEcho();
    if (echo) {
        echo.leave('admins');
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

/**
 * Subscribe to parent notification channel
 */
export function subscribeToParentChannel(
    parentId: number,
    onNotification: (event: unknown) => void
): void {
    const echo = getParentEcho();
    if (!echo) {
        console.error('Parent Echo not initialized. Call initializeParentEcho first.');
        return;
    }

    echo
        .private(`parent.${parentId}`)
        .listen('.notification', (event: unknown) => {
            console.log('Received parent notification:', event);
            onNotification(event);
        });
}

/**
 * Unsubscribe from parent notification channel
 */
export function unsubscribeFromParentChannel(parentId: number): void {
    const echo = getParentEcho();
    if (echo) {
        echo.leave(`parent.${parentId}`);
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
    initializeParentEcho,
    getParentEcho,
    disconnectParentEcho,
    subscribeToParentChannel,
    unsubscribeFromParentChannel,
    initializeTeacherEcho,
    getTeacherEcho,
    disconnectTeacherEcho,
    subscribeToTeacherChannel,
    unsubscribeFromTeacherChannel,
    subscribeToAllAdminsChannel,
    unsubscribeFromAllAdminsChannel,
};

/**
 * Initialize Laravel Echo with Reverb broadcaster (for Teacher)
 */
export function initializeTeacherEcho(authToken: string): Echo<'reverb'> {
    if (teacherEchoInstance) {
        return teacherEchoInstance;
    }

    const apiBaseUrl = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:8000`;

    teacherEchoInstance = new Echo({
        broadcaster: 'reverb',
        key: REVERB_CONFIG.key,
        wsHost: REVERB_CONFIG.host,
        wsPort: REVERB_CONFIG.port,
        wssPort: REVERB_CONFIG.port,
        forceTLS: REVERB_CONFIG.scheme === 'https',
        enabledTransports: ['ws', 'wss'],
        authEndpoint: `${apiBaseUrl}/api/broadcasting/auth/teacher`,
        auth: {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        },
    });

    return teacherEchoInstance;
}

/**
 * Get the teacher Echo instance
 */
export function getTeacherEcho(): Echo<'reverb'> | null {
    return teacherEchoInstance;
}

/**
 * Disconnect and cleanup teacher Echo
 */
export function disconnectTeacherEcho(): void {
    if (teacherEchoInstance) {
        teacherEchoInstance.disconnect();
        teacherEchoInstance = null;
    }
}

/**
 * Subscribe to teacher notification channel
 */
export function subscribeToTeacherChannel(
    teacherId: number,
    onNotification: (event: unknown) => void
): void {
    const echo = getTeacherEcho();
    if (!echo) {
        console.error('Teacher Echo not initialized. Call initializeTeacherEcho first.');
        return;
    }

    echo
        .private(`teacher.${teacherId}`)
        .notification((notification: any) => {
            console.log('Received teacher notification:', notification);
            onNotification(notification);
        });
}

/**
 * Unsubscribe from teacher notification channel
 */
export function unsubscribeFromTeacherChannel(teacherId: number): void {
    const echo = getTeacherEcho();
    if (echo) {
        echo.leave(`teacher.${teacherId}`);
    }
}

