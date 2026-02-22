import { X, Maximize2, Minimize2, Loader2, Mic, MicOff, AlertTriangle, RefreshCw } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuthStore } from '../../store';
import { SecurityWatermark } from './SecurityWatermark';
import { useMediaPermissions } from '../../../hooks/useMediaPermissions';

interface LiveSessionEmbedModalProps {
    isOpen: boolean;
    onClose: () => void;
    embedUrl: string | null;
    title?: string;
    /** If true (default), pre-request mic permission before loading iframe */
    isModerator?: boolean;
}

/**
 * Secure live session embed modal using React Portal.
 * Renders fullscreen above all layout elements.
 * 
 * Security features:
 * - Uses one-time-use tokens (expire after 30 seconds or first use)
 * - Iframe cannot be shared - URL is consumed on first load
 * - No direct BBB URL exposure to client
 */
export function LiveSessionEmbedModal({
    isOpen,
    onClose,
    embedUrl,
    title = 'الجلسة المباشرة',
    isModerator = true
}: LiveSessionEmbedModalProps) {
    const { user } = useAuthStore();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // ─────────────────────────────────────────────────────────────
    // Media Permission Pre-Request (moderators only)
    // ─────────────────────────────────────────────────────────────
    const {
        state: permissionState,
        errorMessage: permissionError,
        isRequesting: isRequestingPermission,
        requestPermissions,
        reset: resetPermissions,
    } = useMediaPermissions();

    // Auto-request mic permission when modal opens for moderators
    useEffect(() => {
        if (isOpen && embedUrl && isModerator && permissionState === 'idle') {
            requestPermissions({ audio: true, video: false });
        }
    }, [isOpen, embedUrl, isModerator, permissionState, requestPermissions]);

    // Reset permissions when modal closes
    useEffect(() => {
        if (!isOpen) {
            resetPermissions();
        }
    }, [isOpen, resetPermissions]);

    // Determine if we should show the iframe
    const shouldShowIframe = !isModerator || permissionState === 'granted';

    // Toggle fullscreen
    const toggleFullscreen = async () => {
        try {
            if (!document.fullscreenElement) {
                await containerRef.current?.requestFullscreen();
                setIsFullscreen(true);
            } else {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        } catch (err) {
            console.error('Fullscreen error:', err);
        }
    };

    // Handle fullscreen change events
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                    setIsFullscreen(false);
                } else {
                    onClose();
                }
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
        }
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Reset loading state when URL changes
    useEffect(() => {
        if (embedUrl) {
            setIsLoading(true);
            setLoadError(false);
            setRetryCount(prev => prev + 1); // Force a fresh key on new URLs as well
        }
    }, [embedUrl]);

    // Handle iframe load error
    const handleIframeError = () => {
        setIsLoading(false);
        setLoadError(true);
    };

    // Retry connection
    const handleRetry = () => {
        setIsLoading(true);
        setLoadError(false);
        setRetryCount(prev => prev + 1); // Changing the key forces the iframe to completely remount
    };

    if (!isOpen || !embedUrl) return null;

    // Use Portal to render outside the layout hierarchy
    return createPortal(
        <div
            ref={containerRef}
            className="fixed inset-0 flex flex-col bg-black"
            style={{
                zIndex: 99999,
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
            }}
        >
            {/* Toolbar */}
            <div
                className="flex items-center justify-between px-4 sm:px-6 py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white shrink-0 border-b border-slate-700"
                dir="rtl"
            >
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-2 bg-red-600/20 px-3 py-1.5 rounded-full">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        <span className="text-red-400 text-xs font-bold tracking-wide">مباشر</span>
                    </span>
                    <h3 className="font-bold text-sm sm:text-base text-slate-200 hidden sm:block">{title}</h3>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        onClick={toggleFullscreen}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                        title={isFullscreen ? 'تصغير' : 'ملء الشاشة'}
                    >
                        {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>

                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-colors"
                    >
                        <X size={16} />
                        <span className="hidden sm:inline">خروج</span>
                    </button>
                </div>
            </div>

            {/* Iframe Container */}
            <div className="flex-1 relative bg-black overflow-hidden">
                {/* Permission Request Overlay (moderators only) */}
                {isModerator && permissionState !== 'granted' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-20" dir="rtl">
                        {/* Requesting State */}
                        {isRequestingPermission && (
                            <>
                                <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                    <Mic size={48} className="text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">طلب إذن الميكروفون</h3>
                                <p className="text-slate-400 text-sm max-w-sm text-center">
                                    يرجى السماح بالوصول للميكروفون من نافذة المتصفح المنبثقة
                                </p>
                            </>
                        )}

                        {/* Denied State */}
                        {permissionState === 'denied' && (
                            <>
                                <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                                    <MicOff size={48} className="text-red-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">تم رفض إذن الميكروفون</h3>
                                <p className="text-slate-400 text-sm max-w-md text-center mb-2">
                                    {permissionError}
                                </p>
                                <div className="bg-slate-800/50 rounded-xl p-4 max-w-md text-sm text-slate-300 mb-6 border border-slate-700">
                                    <p className="font-bold mb-2 flex items-center gap-2">
                                        <AlertTriangle size={16} className="text-amber-400" />
                                        خطوات تفعيل الميكروفون:
                                    </p>
                                    <ol className="list-decimal list-inside space-y-1 text-slate-400">
                                        <li>اضغط على أيقونة القفل 🔒 بجانب عنوان الصفحة</li>
                                        <li>ابحث عن "الميكروفون" أو "Microphone"</li>
                                        <li>غيّر الإعداد إلى "سماح" أو "Allow"</li>
                                        <li>أعد تحميل الصفحة</li>
                                    </ol>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            resetPermissions();
                                            requestPermissions({ audio: true, video: false });
                                        }}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all"
                                    >
                                        <RefreshCw size={16} />
                                        إعادة المحاولة
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-bold transition-all"
                                    >
                                        إغلاق
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Unavailable / Error State */}
                        {(permissionState === 'unavailable' || permissionState === 'error') && (
                            <>
                                <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
                                    <AlertTriangle size={48} className="text-amber-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">
                                    {permissionState === 'unavailable' ? 'الميكروفون غير متوفر' : 'حدث خطأ'}
                                </h3>
                                <p className="text-slate-400 text-sm max-w-md text-center mb-6">
                                    {permissionError}
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            resetPermissions();
                                            requestPermissions({ audio: true, video: false });
                                        }}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all"
                                    >
                                        <RefreshCw size={16} />
                                        إعادة المحاولة
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-bold transition-all"
                                    >
                                        إغلاق
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Loading Overlay */}
                {shouldShowIframe && isLoading && !loadError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10">
                        <Loader2 size={48} className="animate-spin text-blue-500 mb-4" />
                        <p className="text-slate-400 font-medium">جاري الاتصال بالجلسة...</p>
                        <p className="text-slate-500 text-sm mt-2">يتم تحميل الفصل الافتراضي</p>
                    </div>
                )}

                {/* Error State */}
                {loadError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10">
                        <div className="text-red-500 mb-4 bg-red-500/10 p-4 rounded-full">
                            <X size={48} />
                        </div>
                        <p className="text-slate-200 font-bold text-lg mb-2">تعذر الاتصال بالجلسة</p>
                        <p className="text-slate-400 text-sm mb-6 max-w-md text-center">
                            قد يكون صلاحية الرابط قد انتهت، أو هناك مشكلة في الاتصال بالشبكة.
                            الرابط صالح لمدة 5 دقائق من لحظة طلبه.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={handleRetry}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center min-w-[140px]"
                            >
                                محاولة الاتصال مجدداً
                            </button>
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold border border-slate-700 transition-all"
                            >
                                إغلاق النافذة
                            </button>
                        </div>
                    </div>
                )}

                {/* Only load iframe after permissions are granted (or if not a moderator) */}
                {shouldShowIframe && !loadError && (
                    <iframe
                        key={`${embedUrl}-${retryCount}`}
                        src={embedUrl}
                        className="w-full h-full border-0"
                        style={{
                            display: 'block',
                            width: '100%',
                            height: '100%',
                        }}
                        allow="camera; microphone; display-capture; autoplay; fullscreen; picture-in-picture; geolocation"
                        allowFullScreen
                        title="Live Session"
                        onLoad={() => setIsLoading(false)}
                        onError={handleIframeError}
                    />
                )}
                {/* Floating Watermark */}
                <SecurityWatermark />

            </div>
        </div>,
        document.body
    );
}
