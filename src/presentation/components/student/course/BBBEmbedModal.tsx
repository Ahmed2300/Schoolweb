import { X, Maximize2, Minimize2, Loader2, Wifi, WifiOff, RefreshCw, Users } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSessionHeartbeat, ConnectionStatus, getConnectionStatusConfig } from '../../../../hooks/useSessionHeartbeat';

interface BBBEmbedModalProps {
    isOpen: boolean;
    onClose: () => void;
    embedUrl: string | null;
    lectureId?: number; // Optional for backward compatibility
    onSessionEnded?: () => void;
}

export function BBBEmbedModal({
    isOpen,
    onClose,
    embedUrl,
    lectureId,
    onSessionEnded
}: BBBEmbedModalProps) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showDisconnectedOverlay, setShowDisconnectedOverlay] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // ─────────────────────────────────────────────────────────────
    // Session Heartbeat - Only enabled when lectureId is provided
    // ─────────────────────────────────────────────────────────────
    const {
        connectionStatus,
        isLive,
        participantCount,
        isOnline,
        forceReconnect
    } = useSessionHeartbeat({
        lectureId: lectureId ?? 0,
        enabled: isOpen && !!lectureId && !!embedUrl,
        pollingInterval: 30000, // 30 seconds
        onSessionEnded: () => {
            onSessionEnded?.();
            onClose();
        },
        onDisconnected: () => {
            setShowDisconnectedOverlay(true);
        },
        onReconnected: () => {
            setShowDisconnectedOverlay(false);
        },
    });

    // Reset overlay when modal closes
    useEffect(() => {
        if (!isOpen) {
            setShowDisconnectedOverlay(false);
        }
    }, [isOpen]);

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
        }
    }, [embedUrl]);

    if (!isOpen || !embedUrl) return null;

    // Get connection status config for indicator
    const statusConfig = getConnectionStatusConfig(connectionStatus);

    // Use Portal to render outside the layout hierarchy
    return createPortal(
        <div
            ref={containerRef}
            data-live-session
            className="fixed inset-0 flex flex-col bg-black"
            style={{
                zIndex: 99999,  // Maximum z-index to ensure it's above everything
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
            }}
        >
            {/* Toolbar - Always visible */}
            <div
                className="flex items-center justify-between px-4 sm:px-6 py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white shrink-0 border-b border-slate-700"
                dir="rtl"
            >
                <div className="flex items-center gap-3">
                    {/* Live Badge */}
                    <span className="flex items-center gap-2 bg-red-600/20 px-3 py-1.5 rounded-full">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        <span className="text-red-400 text-xs font-bold tracking-wide">مباشر</span>
                    </span>

                    {/* Connection Status Indicator */}
                    {lectureId && (
                        <span
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${connectionStatus === 'connected'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : connectionStatus === 'reconnecting'
                                    ? 'bg-amber-500/20 text-amber-400 animate-pulse'
                                    : connectionStatus === 'disconnected'
                                        ? 'bg-red-500/20 text-red-400'
                                        : 'bg-blue-500/20 text-blue-400'
                                }`}
                            title={statusConfig.text}
                        >
                            {connectionStatus === 'connected' && <Wifi size={14} />}
                            {connectionStatus === 'reconnecting' && <RefreshCw size={14} className="animate-spin" />}
                            {connectionStatus === 'disconnected' && <WifiOff size={14} />}
                            {connectionStatus === 'checking' && <Loader2 size={14} className="animate-spin" />}
                            <span className="hidden sm:inline">{statusConfig.text}</span>
                        </span>
                    )}

                    {/* Participant Count */}
                    {participantCount > 0 && (
                        <span className="flex items-center gap-1.5 bg-slate-700/50 px-2.5 py-1.5 rounded-full text-xs text-slate-300">
                            <Users size={12} />
                            <span>{participantCount}</span>
                        </span>
                    )}

                    <h3 className="font-bold text-sm sm:text-base text-slate-200 hidden sm:block">الجلسة المباشرة</h3>
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

            {/* Iframe Container - Takes full remaining space */}
            <div className="flex-1 relative bg-black overflow-hidden">
                {/* Loading Overlay */}
                {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10">
                        <Loader2 size={48} className="animate-spin text-blue-500 mb-4" />
                        <p className="text-slate-400 font-medium">جاري الاتصال بالجلسة...</p>
                    </div>
                )}

                {/* Disconnected Overlay */}
                {showDisconnectedOverlay && !isLoading && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-20">
                        <div className="bg-slate-900 rounded-2xl p-8 max-w-md text-center border border-slate-700 shadow-2xl">
                            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <WifiOff size={40} className="text-red-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">انقطع الاتصال</h2>
                            <p className="text-slate-400 mb-6">
                                يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={forceReconnect}
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all"
                                >
                                    <RefreshCw size={18} />
                                    إعادة الاتصال
                                </button>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-bold transition-all"
                                >
                                    إغلاق
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <iframe
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
                />
            </div>
        </div>,
        document.body  // Render directly to body, outside all layout components
    );
}

