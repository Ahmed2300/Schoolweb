/**
 * Native TypeScript WebSocket Client for Laravel Reverb (Pusher Protocol)
 * Replaces laravel-echo and pusher-js to provide exact control over ports/URIs
 */

const WEBSOCKET_ENABLED = import.meta.env.VITE_WEBSOCKET_ENABLED !== 'false';

const REVERB_CONFIG = {
    key: import.meta.env.VITE_REVERB_APP_KEY || 'school-reverb-key',
    host: import.meta.env.VITE_REVERB_HOST || 'localhost',
    port: parseInt(import.meta.env.VITE_REVERB_PORT ?? '443'),
    scheme: import.meta.env.VITE_REVERB_SCHEME || 'https',
};

// Global Tracking
let echoInstance: MockEcho | null = null;
let studentEchoInstance: MockEcho | null = null;
let parentEchoInstance: MockEcho | null = null;
let teacherEchoInstance: MockEcho | null = null;

class ReverbClient {
    private ws: WebSocket | null = null;
    private socketId: string | null = null;
    // channelName => eventName => callbacks
    private listeners: Record<string, Record<string, Function[]>> = {};
    private pendingSubscriptions: Set<string> = new Set();
    private subscribedChannels: Set<string> = new Set();

    constructor(
        private authToken: string,
        private authEndpointPath: string
    ) {
        this.connect();
    }

    private connect() {
        if (!WEBSOCKET_ENABLED) return;

        // Build connection URI based precisely on our env values
        const wsScheme = REVERB_CONFIG.scheme === 'https' ? 'wss' : 'ws';
        // Add port only if it's non-standard to prevent browser blocking
        const portSuffix = (REVERB_CONFIG.port === 80 || REVERB_CONFIG.port === 443) ? '' : `:${REVERB_CONFIG.port}`;

        const uri = `${wsScheme}://${REVERB_CONFIG.host}${portSuffix}/app/${REVERB_CONFIG.key}?protocol=7&client=js&version=8.4.0&flash=false`;



        try {
            this.ws = new WebSocket(uri);
        } catch (e) {
            console.error('[ReverbClient] Failed to create WebSocket:', e);
            return;
        }

        this.ws.onopen = () => {

        };

        this.ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                this.handlePusherMessage(message);
            } catch (err) {
                console.error('[ReverbClient] Failed to parse message', err);
            }
        };

        this.ws.onclose = () => {

            this.socketId = null;
        };

        this.ws.onerror = (error) => {
            console.error('[ReverbClient] WebSocket error:', error);
        };
    }

    private handlePusherMessage(message: any) {
        // 1. Connection Established (Handshake)
        if (message.event === 'pusher:connection_established') {
            const data = JSON.parse(message.data);
            this.socketId = data.socket_id;


            // Process any subscriptions that were queued while connecting
            this.processPendingSubscriptions();
            return;
        }

        // 2. Ping / Pong Heartbeat
        if (message.event === 'pusher:ping') {
            this.send({ event: 'pusher:pong', data: {} });
            return;
        }

        // 3. User custom events or internal subscription successes
        if (message.channel && message.event) {
            // Laravel prepends namespaces. We trim the `App\\Events\\` if they use broadcasing
            // Or just pass the raw event name to listeners
            const channelListeners = this.listeners[message.channel];
            if (channelListeners && channelListeners[message.event]) {
                const payload = typeof message.data === 'string' ? JSON.parse(message.data) : message.data;
                channelListeners[message.event].forEach(cb => cb(payload));
            }
        }
    }

    private send(payload: any) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(payload));
        }
    }

    private async processPendingSubscriptions() {
        if (!this.socketId) return;

        for (const channel of this.pendingSubscriptions) {
            await this.authenticateAndSubscribe(channel);
        }
        this.pendingSubscriptions.clear();
    }

    private async authenticateAndSubscribe(channel: string) {
        if (this.subscribedChannels.has(channel)) return;

        if (channel.startsWith('private-') || channel.startsWith('presence-')) {
            // Must authenticate
            try {
                const apiBaseUrl = (import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:8000`).replace(/\/$/, '');
                const response = await fetch(`${apiBaseUrl}${this.authEndpointPath}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.authToken}`,
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        socket_id: this.socketId,
                        channel_name: channel
                    })
                });

                if (!response.ok) {
                    console.error(`[ReverbClient] Auth failed for channel ${channel}`);
                    return;
                }

                const data = await response.json();
                this.send({
                    event: 'pusher:subscribe',
                    data: {
                        auth: data.auth,
                        channel: channel
                    }
                });
                this.subscribedChannels.add(channel);


            } catch (err) {
                console.error(`[ReverbClient] Auth request failed for channel ${channel}`, err);
            }
        } else {
            // Public channel
            this.send({
                event: 'pusher:subscribe',
                data: {
                    channel: channel
                }
            });
            this.subscribedChannels.add(channel);
        }
    }

    // Public API for MockChannel
    public listen(channelName: string, eventName: string, callback: Function) {
        // Let the caller pass the exact channel name ('time-slots' or 'private-time-slots')
        const actualChannel = channelName;

        if (!this.listeners[actualChannel]) this.listeners[actualChannel] = {};

        // Laravel Echo maps '.event' to 'event' or prefixes namespace. We append namespace if it doesn't start with dot
        let actualEvent = eventName;
        if (actualEvent.startsWith('.')) {
            actualEvent = actualEvent.substring(1); // Remove dot (custom event)
        } else {
            actualEvent = `App\\Events\\${actualEvent}`; // Default namespace
        }

        if (!this.listeners[actualChannel][actualEvent]) {
            this.listeners[actualChannel][actualEvent] = [];
        }
        this.listeners[actualChannel][actualEvent].push(callback);

        if (this.socketId) {
            this.authenticateAndSubscribe(actualChannel);
        } else {
            this.pendingSubscriptions.add(actualChannel);
        }
    }

    public stopListening(channelName: string, eventName: string, callback?: Function) {
        const actualChannel = channelName;
        let actualEvent = eventName;
        if (actualEvent.startsWith('.')) {
            actualEvent = actualEvent.substring(1);
        } else {
            actualEvent = `App\\Events\\${actualEvent}`;
        }

        if (this.listeners[actualChannel] && this.listeners[actualChannel][actualEvent]) {
            if (callback) {
                this.listeners[actualChannel][actualEvent] = this.listeners[actualChannel][actualEvent].filter(cb => cb !== callback);
            } else {
                delete this.listeners[actualChannel][actualEvent];
            }
        }
    }

    public leave(channelName: string) {
        const actualChannel = channelName.startsWith('private-') ? channelName : `private-${channelName}`;
        this.send({
            event: 'pusher:unsubscribe',
            data: { channel: actualChannel }
        });
        this.subscribedChannels.delete(actualChannel);
        delete this.listeners[actualChannel];
    }

    public disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}

// ==========================================
// MOCK ECHO API to prevent rewrites across app
// ==========================================

class MockChannel {
    constructor(private channelName: string, private client: ReverbClient) { }

    listen(event: string, callback: Function) {
        this.client.listen(this.channelName, event, callback);
        return this; // For chaining .listen().listen()
    }

    stopListening(event: string, callback?: Function) {
        this.client.stopListening(this.channelName, event, callback);
        return this;
    }

    /**
     * No-op error handler for Laravel Echo API compatibility.
     * Our WebSocket client handles errors internally via console.error.
     */
    error(_callback: (error: any) => void) {
        // Stub — error handling is done in ReverbClient.authenticateAndSubscribe
        return this;
    }

    /**
     * No-op notification handler for Laravel Echo API compatibility.
     */
    notification(_callback: (notification: any) => void) {
        return this;
    }
}

export class MockEcho {
    constructor(public client: ReverbClient) { }

    private(channel: string) {
        return new MockChannel(`private-${channel}`, this.client);
    }

    channel(channelName: string) {
        return new MockChannel(channelName, this.client);
    }

    leave(channel: string) {
        // We'd have to know if it was private or not, but Echo usually expects the un-prefixed name in leave() if it's public.
        // Or prefixed if it's private. If someone calls leave('chat'), we assume they know the exact channel name or they use leaveChannel handling.
        // For simplicity we just delegate.
        this.client.leave(channel);
    }

    disconnect() {
        this.client.disconnect();
    }
}


// ==========================================
// EXPORTED FUNCTIONS
// ==========================================

export function initializeEcho(authToken: string): MockEcho | null {
    if (!WEBSOCKET_ENABLED) return null;
    if (echoInstance) return echoInstance;

    const client = new ReverbClient(authToken, '/api/broadcasting/auth');
    echoInstance = new MockEcho(client);
    return echoInstance;
}

export function initializeStudentEcho(authToken: string): MockEcho | null {
    if (!WEBSOCKET_ENABLED) return null;
    if (studentEchoInstance) return studentEchoInstance;

    const client = new ReverbClient(authToken, '/api/broadcasting/auth/student');
    studentEchoInstance = new MockEcho(client);
    return studentEchoInstance;
}

export function initializeParentEcho(authToken: string): MockEcho | null {
    if (!WEBSOCKET_ENABLED) return null;
    if (parentEchoInstance) return parentEchoInstance;

    const client = new ReverbClient(authToken, '/api/broadcasting/auth/parent');
    parentEchoInstance = new MockEcho(client);
    return parentEchoInstance;
}

export function initializeTeacherEcho(authToken: string): MockEcho | null {
    if (!WEBSOCKET_ENABLED) return null;
    if (teacherEchoInstance) return teacherEchoInstance;

    const client = new ReverbClient(authToken, '/api/broadcasting/auth/teacher');
    teacherEchoInstance = new MockEcho(client);
    return teacherEchoInstance;
}

export function getEcho(): MockEcho | null { return echoInstance; }
export function getStudentEcho(): MockEcho | null { return studentEchoInstance; }
export function getParentEcho(): MockEcho | null { return parentEchoInstance; }
export function getTeacherEcho(): MockEcho | null { return teacherEchoInstance; }

export function disconnectEcho(): void {
    if (echoInstance) { echoInstance.disconnect(); echoInstance = null; }
}
export function disconnectStudentEcho(): void {
    if (studentEchoInstance) { studentEchoInstance.disconnect(); studentEchoInstance = null; }
}
export function disconnectParentEcho(): void {
    if (parentEchoInstance) { parentEchoInstance.disconnect(); parentEchoInstance = null; }
}
export function disconnectTeacherEcho(): void {
    if (teacherEchoInstance) { teacherEchoInstance.disconnect(); teacherEchoInstance = null; }
}

// Subscriptions
export function subscribeToAdminChannel(adminId: number, onNotification: (event: unknown) => void): void {
    const echo = getEcho();
    if (!echo) return;
    echo.private(`admin.${adminId}`).listen('.notification', onNotification);
}
export function unsubscribeFromAdminChannel(adminId: number): void {
    const echo = getEcho();
    if (echo) echo.leave(`admin.${adminId}`);
}

export function subscribeToAllAdminsChannel(onNotification: (event: unknown) => void): void {
    setTimeout(() => {
        let echo = getEcho();
        if (!echo) {
            const token = localStorage.getItem('auth_token');
            if (token) echo = initializeEcho(token);
        }
        if (!echo) return;
        echo.private('admins').listen('.ContentChangeRequested', onNotification);
    }, 100);
}
export function unsubscribeFromAllAdminsChannel(): void {
    const echo = getEcho();
    if (echo) echo.leave('admins');
}

export function subscribeToStudentChannel(studentId: number, onNotification: (event: unknown) => void): void {
    const echo = getStudentEcho();
    if (!echo) return;
    echo.private(`student.${studentId}`).listen('.notification', onNotification);
}
export function unsubscribeFromStudentChannel(studentId: number): void {
    const echo = getStudentEcho();
    if (echo) echo.leave(`student.${studentId}`);
}

export function subscribeToParentChannel(parentId: number, onNotification: (event: unknown) => void): void {
    const echo = getParentEcho();
    if (!echo) return;
    echo.private(`parent.${parentId}`).listen('.notification', onNotification);
}
export function unsubscribeFromParentChannel(parentId: number): void {
    const echo = getParentEcho();
    if (echo) echo.leave(`parent.${parentId}`);
}

export function subscribeToTeacherChannel(teacherId: number, onNotification: (event: unknown) => void): void {
    const echo = getTeacherEcho();
    if (!echo) return;
    echo.private(`teacher.${teacherId}`)
        .listen('.notification', onNotification)
        .listen('.content.decision', onNotification)
        .listen('.slot.decision', onNotification);
}
export function unsubscribeFromTeacherChannel(teacherId: number): void {
    const echo = getTeacherEcho();
    if (echo) echo.leave(`teacher.${teacherId}`);
}

export default {
    initializeEcho, initializeStudentEcho, getEcho, getStudentEcho, disconnectEcho, disconnectStudentEcho,
    subscribeToAdminChannel, unsubscribeFromAdminChannel, subscribeToStudentChannel, unsubscribeFromStudentChannel,
    initializeParentEcho, getParentEcho, disconnectParentEcho, subscribeToParentChannel, unsubscribeFromParentChannel,
    initializeTeacherEcho, getTeacherEcho, disconnectTeacherEcho, subscribeToTeacherChannel, unsubscribeFromTeacherChannel,
    subscribeToAllAdminsChannel, unsubscribeFromAllAdminsChannel,
};
