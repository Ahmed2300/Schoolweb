import { X, Maximize2, Minimize2, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface LiveSessionEmbedModalProps {
    isOpen: boolean;
    onClose: () => void;
    embedUrl: string | null;
    title?: string;
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
    title = 'الجلسة المباشرة'
}: LiveSessionEmbedModalProps) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

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
        }
    }, [embedUrl]);

    // Handle iframe load error
    const handleIframeError = () => {
        setIsLoading(false);
        setLoadError(true);
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
                {/* Loading Overlay */}
                {isLoading && !loadError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10">
                        <Loader2 size={48} className="animate-spin text-blue-500 mb-4" />
                        <p className="text-slate-400 font-medium">جاري الاتصال بالجلسة...</p>
                        <p className="text-slate-500 text-sm mt-2">يتم تحميل الفصل الافتراضي</p>
                    </div>
                )}

                {/* Error State */}
                {loadError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10">
                        <div className="text-red-500 mb-4">
                            <X size={48} />
                        </div>
                        <p className="text-slate-200 font-bold text-lg mb-2">فشل تحميل الجلسة</p>
                        <p className="text-slate-400 text-sm mb-4">انتهت صلاحية الرابط أو حدث خطأ</p>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                        >
                            العودة وإعادة الانضمام
                        </button>
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
                    onError={handleIframeError}
                />
            </div>
        </div>,
        document.body
    );
}
