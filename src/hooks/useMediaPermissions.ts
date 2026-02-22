/**
 * useMediaPermissions Hook
 *
 * Pre-requests microphone/camera permissions via navigator.mediaDevices.getUserMedia()
 * BEFORE loading a BBB iframe. This is critical because:
 *
 * 1. Browsers delegate media permissions from the parent page to iframes via `allow` attribute
 * 2. If the parent page has never been granted mic/camera, the iframe's request silently fails
 * 3. By calling getUserMedia() first, the browser prompts on OUR domain
 * 4. Once granted, the embedded iframe inherits the permission
 *
 * Usage:
 *   const { state, requestPermissions } = useMediaPermissions();
 *   // Call requestPermissions() before opening the BBB modal
 */

import { useState, useCallback, useRef } from 'react';

export type MediaPermissionState =
    | 'idle'        // Not yet requested
    | 'requesting'  // Prompt is showing
    | 'granted'     // User allowed
    | 'denied'      // User blocked
    | 'unavailable' // No mic/camera hardware or not HTTPS
    | 'error';      // Unexpected failure

export interface MediaPermissionResult {
    /** Current permission state */
    state: MediaPermissionState;
    /** Human-readable Arabic error message (null when granted/idle) */
    errorMessage: string | null;
    /** Whether a request is in progress */
    isRequesting: boolean;
    /** Request mic/camera permissions. Returns true if granted. */
    requestPermissions: (options?: { audio?: boolean; video?: boolean }) => Promise<boolean>;
    /** Reset state back to idle */
    reset: () => void;
}

/**
 * Request microphone and/or camera permissions from the browser.
 * Immediately releases the media stream after obtaining permission.
 */
export function useMediaPermissions(): MediaPermissionResult {
    const [state, setState] = useState<MediaPermissionState>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const requestInFlight = useRef(false);

    const reset = useCallback(() => {
        setState('idle');
        setErrorMessage(null);
        requestInFlight.current = false;
    }, []);

    const requestPermissions = useCallback(
        async (options: { audio?: boolean; video?: boolean } = { audio: true }): Promise<boolean> => {
            // Prevent concurrent requests
            if (requestInFlight.current) return state === 'granted';
            requestInFlight.current = true;

            // Check if getUserMedia is available (requires HTTPS)
            if (!navigator.mediaDevices?.getUserMedia) {
                setState('unavailable');
                setErrorMessage(
                    'متصفحك لا يدعم الوصول للميكروفون. تأكد من استخدام HTTPS ومتصفح حديث.'
                );
                requestInFlight.current = false;
                return false;
            }

            setState('requesting');
            setErrorMessage(null);

            try {
                // Request the media stream — this triggers the browser's permission prompt
                const constraints: MediaStreamConstraints = {
                    audio: options.audio ?? true,
                    video: options.video ?? false,
                };

                const stream = await navigator.mediaDevices.getUserMedia(constraints);

                // Immediately stop all tracks — we only needed the permission grant
                stream.getTracks().forEach((track) => track.stop());

                setState('granted');
                setErrorMessage(null);
                requestInFlight.current = false;
                return true;
            } catch (err: unknown) {
                requestInFlight.current = false;

                if (err instanceof DOMException) {
                    switch (err.name) {
                        case 'NotAllowedError':
                            // User denied the permission prompt
                            setState('denied');
                            setErrorMessage(
                                'تم رفض إذن الميكروفون. لتفعيله، اضغط على أيقونة القفل بجانب عنوان الصفحة واسمح بالوصول للميكروفون.'
                            );
                            return false;

                        case 'NotFoundError':
                            // No mic/camera hardware detected
                            setState('unavailable');
                            setErrorMessage(
                                'لم يتم العثور على ميكروفون متصل بجهازك. تأكد من توصيل سماعة أو ميكروفون.'
                            );
                            return false;

                        case 'NotReadableError':
                            // Device is in use by another application
                            setState('error');
                            setErrorMessage(
                                'الميكروفون مستخدم من تطبيق آخر. أغلق التطبيقات الأخرى وحاول مرة أخرى.'
                            );
                            return false;

                        case 'AbortError':
                            setState('error');
                            setErrorMessage('تم إلغاء طلب الإذن. يرجى المحاولة مرة أخرى.');
                            return false;

                        default:
                            setState('error');
                            setErrorMessage(`حدث خطأ غير متوقع: ${err.message}`);
                            return false;
                    }
                }

                // Non-DOMException errors
                setState('error');
                setErrorMessage('حدث خطأ أثناء طلب إذن الميكروفون. يرجى المحاولة مرة أخرى.');
                return false;
            }
        },
        [state]
    );

    return {
        state,
        errorMessage,
        isRequesting: state === 'requesting',
        requestPermissions,
        reset,
    };
}

/**
 * Standalone utility: request mic permission once, return boolean.
 * Use this in event handlers where you don't need reactive state.
 */
export async function requestMicPermission(): Promise<{ granted: boolean; errorMessage: string | null }> {
    if (!navigator.mediaDevices?.getUserMedia) {
        return {
            granted: false,
            errorMessage: 'متصفحك لا يدعم الوصول للميكروفون. تأكد من استخدام HTTPS ومتصفح حديث.',
        };
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
        return { granted: true, errorMessage: null };
    } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'NotAllowedError') {
            return {
                granted: false,
                errorMessage:
                    'تم رفض إذن الميكروفون. لتفعيله، اضغط على أيقونة القفل بجانب عنوان الصفحة واسمح بالوصول للميكروفون.',
            };
        }
        if (err instanceof DOMException && err.name === 'NotFoundError') {
            return {
                granted: false,
                errorMessage: 'لم يتم العثور على ميكروفون متصل بجهازك.',
            };
        }
        return {
            granted: false,
            errorMessage: 'حدث خطأ أثناء طلب إذن الميكروفون.',
        };
    }
}
