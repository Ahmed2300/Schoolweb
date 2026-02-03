/**
 * useSessionHeartbeat Hook
 * 
 * Monitors network connectivity and session status during live sessions.
 * Handles reconnection attempts and provides visual feedback for connection state.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../data/api/ApiClient';
import toast from 'react-hot-toast';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type ConnectionStatus = 'connected' | 'checking' | 'disconnected' | 'reconnecting';

export interface SessionStatusResponse {
    success: boolean;
    is_live: boolean;
    meeting_status?: 'pending' | 'ready' | 'ongoing' | 'completed';
    participant_count?: number;
    started_at?: string;
    has_recording?: boolean;
    recording_url?: string | null;
}

export interface UseSessionHeartbeatOptions {
    lectureId: number;
    enabled: boolean;
    pollingInterval?: number; // Default: 30000ms (30 seconds)
    maxReconnectAttempts?: number; // Default: 3
    onSessionEnded?: () => void;
    onDisconnected?: () => void;
    onReconnected?: () => void;
}

export interface UseSessionHeartbeatReturn {
    connectionStatus: ConnectionStatus;
    isLive: boolean;
    meetingStatus: string | undefined;
    participantCount: number;
    isOnline: boolean;
    lastChecked: Date | null;
    forceReconnect: () => void;
}

// ═══════════════════════════════════════════════════════════════
// Error Messages (Arabic)
// ═══════════════════════════════════════════════════════════════

const MESSAGES = {
    CONNECTION_LOST: 'انقطع الاتصال بالجلسة',
    RECONNECTING: 'جاري إعادة الاتصال...',
    RECONNECTED: 'تم إعادة الاتصال بنجاح',
    SESSION_ENDED: 'انتهت الجلسة المباشرة',
    CHECK_CONNECTION: 'يرجى التحقق من اتصالك بالإنترنت',
    SESSION_ENDED_RECORDING: 'انتهت الجلسة. يمكنك مشاهدة التسجيل لاحقاً',
};

// ═══════════════════════════════════════════════════════════════
// Hook Implementation
// ═══════════════════════════════════════════════════════════════

export function useSessionHeartbeat({
    lectureId,
    enabled,
    pollingInterval = 30000,
    maxReconnectAttempts = 3,
    onSessionEnded,
    onDisconnected,
    onReconnected,
}: UseSessionHeartbeatOptions): UseSessionHeartbeatReturn {
    const queryClient = useQueryClient();

    // State
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('checking');
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [lastChecked, setLastChecked] = useState<Date | null>(null);

    // Refs for tracking attempts and callbacks
    const reconnectAttempts = useRef(0);
    const wasDisconnected = useRef(false);
    const onSessionEndedRef = useRef(onSessionEnded);
    const onDisconnectedRef = useRef(onDisconnected);
    const onReconnectedRef = useRef(onReconnected);

    // Update refs when callbacks change
    useEffect(() => {
        onSessionEndedRef.current = onSessionEnded;
        onDisconnectedRef.current = onDisconnected;
        onReconnectedRef.current = onReconnected;
    }, [onSessionEnded, onDisconnected, onReconnected]);

    // ─────────────────────────────────────────────────────────────
    // Session Status Polling Query
    // ─────────────────────────────────────────────────────────────
    const {
        data: sessionStatus,
        error,
        refetch,
        isError,
        isFetching,
    } = useQuery<SessionStatusResponse>({
        queryKey: ['session-heartbeat', lectureId],
        queryFn: async () => {
            const response = await apiClient.get(`/api/v1/lectures/${lectureId}/bbb/status`);
            return response.data;
        },
        enabled: enabled && isOnline,
        refetchInterval: pollingInterval,
        refetchIntervalInBackground: true,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        staleTime: pollingInterval / 2,
    });

    // ─────────────────────────────────────────────────────────────
    // Handle Successful Status Check
    // ─────────────────────────────────────────────────────────────
    useEffect(() => {
        if (sessionStatus) {
            setLastChecked(new Date());
            reconnectAttempts.current = 0;

            // Check if we were disconnected and now reconnected
            if (wasDisconnected.current) {
                wasDisconnected.current = false;
                setConnectionStatus('connected');
                toast.success(MESSAGES.RECONNECTED, {
                    icon: '🔗',
                    duration: 3000,
                });
                onReconnectedRef.current?.();
            } else if (connectionStatus !== 'connected') {
                setConnectionStatus('connected');
            }

            // Check if session has ended
            if (!sessionStatus.is_live && sessionStatus.meeting_status === 'completed') {
                if (sessionStatus.has_recording && sessionStatus.recording_url) {
                    toast.success(MESSAGES.SESSION_ENDED_RECORDING, {
                        icon: '🎥',
                        duration: 5000,
                    });
                } else {
                    toast(MESSAGES.SESSION_ENDED, {
                        icon: '📋',
                        duration: 4000,
                    });
                }
                onSessionEndedRef.current?.();
            }
        }
    }, [sessionStatus, connectionStatus]);

    // ─────────────────────────────────────────────────────────────
    // Handle Query Errors
    // ─────────────────────────────────────────────────────────────
    useEffect(() => {
        if (isError && error) {
            reconnectAttempts.current += 1;

            if (reconnectAttempts.current >= maxReconnectAttempts) {
                setConnectionStatus('disconnected');
                wasDisconnected.current = true;
                toast.error(MESSAGES.CONNECTION_LOST, {
                    icon: '⚠️',
                    duration: 5000,
                    id: 'connection-lost', // Prevent duplicate toasts
                });
                onDisconnectedRef.current?.();
            } else {
                setConnectionStatus('reconnecting');
                toast.loading(MESSAGES.RECONNECTING, {
                    id: 'reconnecting',
                    duration: 3000,
                });
            }
        }
    }, [isError, error, maxReconnectAttempts]);

    // ─────────────────────────────────────────────────────────────
    // Network Online/Offline Listeners
    // ─────────────────────────────────────────────────────────────
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setConnectionStatus('reconnecting');
            toast.loading(MESSAGES.RECONNECTING, {
                id: 'reconnecting',
                duration: 2000,
            });

            // Force immediate refetch when coming back online
            setTimeout(() => {
                refetch();
            }, 1000);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setConnectionStatus('disconnected');
            wasDisconnected.current = true;
            toast.error(MESSAGES.CHECK_CONNECTION, {
                icon: '📶',
                id: 'offline',
                duration: Infinity, // Keep until they're back online
            });
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [refetch]);

    // Dismiss offline toast when back online
    useEffect(() => {
        if (isOnline) {
            toast.dismiss('offline');
        }
    }, [isOnline]);

    // ─────────────────────────────────────────────────────────────
    // WebSocket/Echo Listener for Real-time Session End Detection
    // ─────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!enabled) return;

        // Check if Laravel Echo is available (window.Echo is set by Laravel Echo)
        const echo = (window as unknown as {
            Echo?: {
                channel: (name: string) => {
                    listen: (event: string, callback: () => void) => void;
                    stopListening: (event: string) => void;
                };
                leave: (name: string) => void;
            }
        }).Echo;

        if (!echo) {
            // Echo not available - fallback to polling only (already handled above)
            return;
        }

        const channelName = `lecture.${lectureId}`;
        const channel = echo.channel(channelName);

        // Listen for session ended event
        channel.listen('.session.ended', () => {
            toast(MESSAGES.SESSION_ENDED, {
                icon: '📋',
                duration: 4000,
            });
            onSessionEndedRef.current?.();
        });

        // Listen for session started event (optional - for UI updates)
        channel.listen('.session.started', () => {
            refetch(); // Refresh session status
        });

        return () => {
            channel.stopListening('.session.ended');
            channel.stopListening('.session.started');
            echo.leave(channelName);
        };
    }, [lectureId, enabled, refetch]);

    // ─────────────────────────────────────────────────────────────
    // Force Reconnect Function
    // ─────────────────────────────────────────────────────────────
    const forceReconnect = useCallback(() => {
        reconnectAttempts.current = 0;
        setConnectionStatus('reconnecting');
        toast.loading(MESSAGES.RECONNECTING, {
            id: 'reconnecting',
            duration: 2000,
        });

        // Invalidate and refetch
        queryClient.invalidateQueries({ queryKey: ['session-heartbeat', lectureId] });
        refetch();
    }, [queryClient, lectureId, refetch]);

    // ─────────────────────────────────────────────────────────────
    // Return Values
    // ─────────────────────────────────────────────────────────────
    return {
        connectionStatus: isFetching && connectionStatus === 'checking' ? 'checking' : connectionStatus,
        isLive: sessionStatus?.is_live ?? false,
        meetingStatus: sessionStatus?.meeting_status,
        participantCount: sessionStatus?.participant_count ?? 0,
        isOnline,
        lastChecked,
        forceReconnect,
    };
}

// ═══════════════════════════════════════════════════════════════
// Connection Status Indicator Component (for export)
// ═══════════════════════════════════════════════════════════════

export interface ConnectionIndicatorProps {
    status: ConnectionStatus;
    participantCount?: number;
    onRetry?: () => void;
}

/**
 * Simple connection status indicator that can be overlayed on the session
 */
export function getConnectionStatusConfig(status: ConnectionStatus) {
    switch (status) {
        case 'connected':
            return {
                color: 'bg-emerald-500',
                text: 'متصل',
                icon: '🟢',
                showRetry: false,
            };
        case 'checking':
            return {
                color: 'bg-blue-500',
                text: 'جاري التحقق...',
                icon: '🔵',
                showRetry: false,
            };
        case 'reconnecting':
            return {
                color: 'bg-amber-500',
                text: 'جاري إعادة الاتصال...',
                icon: '🟡',
                showRetry: false,
            };
        case 'disconnected':
            return {
                color: 'bg-red-500',
                text: 'غير متصل',
                icon: '🔴',
                showRetry: true,
            };
    }
}
