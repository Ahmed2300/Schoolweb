/**
 * useLiveSession Hook
 *
 * React Query hooks for live session management with graceful error handling.
 * Handles specific error codes for better UX: NOT_ENROLLED, MEETING_NOT_RUNNING, SESSION_ENDED
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '../data/api/ApiClient';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type LiveSessionErrorCode =
    | 'NOT_ENROLLED'
    | 'MEETING_NOT_RUNNING'
    | 'SESSION_ENDED'
    | 'SESSION_NOT_STARTED'
    | 'TOO_EARLY'
    | 'UNAUTHORIZED';

export interface JoinSessionResponse {
    success: boolean;
    join_url?: string;
    message?: string;
    error_code?: LiveSessionErrorCode;
    already_started?: boolean;
}

export interface SessionStatusResponse {
    success: boolean;
    is_live: boolean;
    meeting_status: 'scheduled' | 'ongoing' | 'ended';
    participant_count?: number;
    start_time?: string;
    end_time?: string;
}

export interface SecureEmbedTokenResponse {
    success: boolean;
    data?: {
        embed_url: string;
        expires_at: string;
        expires_in_seconds: number;
    };
    message?: string;
}

interface ApiError {
    response?: {
        status: number;
        data: {
            success?: boolean;
            message?: string;
            error_code?: LiveSessionErrorCode;
        };
    };
}

// ═══════════════════════════════════════════════════════════════
// Query Keys
// ═══════════════════════════════════════════════════════════════

export const liveSessionKeys = {
    all: ['liveSession'] as const,
    status: (lectureId: number) => [...liveSessionKeys.all, 'status', lectureId] as const,
};

// ═══════════════════════════════════════════════════════════════
// Error Handler
// ═══════════════════════════════════════════════════════════════

/**
 * Handle API errors with user-friendly Arabic messages
 */
function handleLiveSessionError(error: ApiError): void {
    const status = error.response?.status;
    const errorCode = error.response?.data?.error_code;
    const message = error.response?.data?.message;

    switch (status) {
        case 401:
            toast.error('يجب تسجيل الدخول أولاً', {
                icon: '🔐',
            });
            // Optionally redirect to login
            break;

        case 403:
            if (errorCode === 'NOT_ENROLLED') {
                toast.error('لم تقم بالاشتراك في هذه الدورة', {
                    icon: '📚',
                    duration: 5000,
                });
                toast('يرجى الاشتراك في الدورة أولاً للانضمام للجلسة المباشرة', {
                    icon: 'ℹ️',
                    duration: 4000,
                });
            } else if (errorCode === 'UNAUTHORIZED') {
                toast.error('غير مصرح لك بالانضمام لهذه الجلسة', {
                    icon: '🚫',
                });
            } else {
                toast.error(message || 'ليس لديك صلاحية للوصول لهذه الجلسة');
            }
            break;

        case 400:
            if (errorCode === 'MEETING_NOT_RUNNING' || errorCode === 'SESSION_NOT_STARTED') {
                toast('الجلسة لم تبدأ بعد', {
                    icon: '⏳',
                    duration: 5000,
                });
                toast('انتظر المعلم لبدء الجلسة', {
                    icon: '👨‍🏫',
                    duration: 4000,
                });
            } else if (errorCode === 'SESSION_ENDED') {
                toast.error('انتهت الجلسة', {
                    icon: '⏰',
                });
                toast('يمكنك مشاهدة التسجيل إذا كان متاحاً', {
                    icon: '🎬',
                    duration: 4000,
                });
            } else if (errorCode === 'TOO_EARLY') {
                toast.error('لا يمكن بدء الجلسة الآن', {
                    icon: '🕐',
                });
                toast(message || 'يمكنك البدء قبل 15 دقيقة من الموعد المحدد', {
                    icon: 'ℹ️',
                    duration: 4000,
                });
            } else {
                toast.error(message || 'حدث خطأ في الطلب');
            }
            break;

        case 404:
            toast.error('الجلسة غير موجودة', {
                icon: '❓',
            });
            break;

        case 500:
            toast.error('حدث خطأ في الخادم', {
                icon: '⚠️',
            });
            toast('يرجى المحاولة مرة أخرى لاحقاً', {
                icon: 'ℹ️',
                duration: 3000,
            });
            break;

        default:
            toast.error('حدث خطأ غير متوقع', {
                icon: '❌',
            });
            toast('يرجى إعادة المحاولة', {
                icon: '🔄',
                duration: 3000,
            });
    }
}

// ═══════════════════════════════════════════════════════════════
// Hooks
// ═══════════════════════════════════════════════════════════════

/**
 * Get live session status
 * Use this to check if a session is running before allowing join
 */
export function useSessionStatus(lectureId: number, enabled: boolean = true) {
    return useQuery({
        queryKey: liveSessionKeys.status(lectureId),
        queryFn: async (): Promise<SessionStatusResponse> => {
            const response = await apiClient.get(`/api/v1/lectures/${lectureId}/bbb/status`);
            return response.data;
        },
        enabled: enabled && lectureId > 0,
        refetchInterval: 30000, // Poll every 30 seconds
        staleTime: 10000, // Consider data fresh for 10 seconds
    });
}

/**
 * Join a live session as a student
 * Returns the join URL which should be opened in an iframe/modal
 */
export function useJoinLiveSession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (lectureId: number): Promise<JoinSessionResponse> => {
            const response = await apiClient.get(`/api/v1/lectures/${lectureId}/bbb/join`);
            return response.data;
        },

        onSuccess: (data, lectureId) => {
            if (data.success) {
                toast.success('جاري الانضمام للجلسة...', {
                    icon: '🎥',
                    duration: 2000,
                });
                // Invalidate status query to refresh UI
                queryClient.invalidateQueries({ queryKey: liveSessionKeys.status(lectureId) });
            }
        },

        onError: (error: ApiError) => {
            handleLiveSessionError(error);
        },
    });
}

/**
 * Start a live session (for teachers)
 */
export function useStartLiveSession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (lectureId: number): Promise<JoinSessionResponse> => {
            const response = await apiClient.post(`/api/v1/lectures/${lectureId}/bbb/start`);
            return response.data;
        },

        onSuccess: (data, lectureId) => {
            if (data.success) {
                if (data.already_started) {
                    toast.success('الجلسة قيد التشغيل بالفعل', {
                        icon: '✅',
                        duration: 2000,
                    });
                } else {
                    toast.success('تم بدء الجلسة بنجاح', {
                        icon: '🎉',
                        duration: 2000,
                    });
                }
                queryClient.invalidateQueries({ queryKey: liveSessionKeys.status(lectureId) });
            }
        },

        onError: (error: ApiError) => {
            handleLiveSessionError(error);
        },
    });
}

/**
 * Generate a secure embed token (for teachers/admins)
 * Returns a one-time-use URL for embedding the session in an iframe
 */
export function useGenerateSecureToken() {
    return useMutation({
        mutationFn: async (lectureId: number): Promise<SecureEmbedTokenResponse> => {
            const response = await apiClient.post(`/api/v1/lectures/${lectureId}/bbb/generate-secure-token`);
            return response.data;
        },

        onSuccess: (data) => {
            if (data.success) {
                toast.success('تم تجهيز الجلسة', {
                    icon: '🔐',
                    duration: 1500,
                });
            }
        },

        onError: (error: ApiError) => {
            handleLiveSessionError(error);
        },
    });
}

/**
 * Hook to manage live session state with loading and error indicators
 * Combines multiple hooks for a complete session management experience
 */
export function useLiveSessionManager(lectureId: number) {
    const statusQuery = useSessionStatus(lectureId);
    const joinMutation = useJoinLiveSession();
    const startMutation = useStartLiveSession();
    const generateTokenMutation = useGenerateSecureToken();

    return {
        // Status
        isLive: statusQuery.data?.is_live ?? false,
        meetingStatus: statusQuery.data?.meeting_status ?? 'scheduled',
        participantCount: statusQuery.data?.participant_count ?? 0,
        isLoadingStatus: statusQuery.isLoading,
        statusError: statusQuery.error,
        refetchStatus: statusQuery.refetch,

        // Join (for students)
        joinSession: joinMutation.mutate,
        joinSessionAsync: joinMutation.mutateAsync,
        isJoining: joinMutation.isPending,
        joinError: joinMutation.error,
        joinData: joinMutation.data,

        // Start (for teachers)
        startSession: startMutation.mutate,
        startSessionAsync: startMutation.mutateAsync,
        isStarting: startMutation.isPending,
        startError: startMutation.error,
        startData: startMutation.data,

        // Secure Token (for embed modal)
        generateToken: generateTokenMutation.mutate,
        generateTokenAsync: generateTokenMutation.mutateAsync,
        isGeneratingToken: generateTokenMutation.isPending,
        tokenError: generateTokenMutation.error,
        tokenData: generateTokenMutation.data,
    };
}
