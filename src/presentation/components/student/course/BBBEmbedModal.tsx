import { X, Maximize2, Minimize2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface BBBEmbedModalProps {
    isOpen: boolean;
    onClose: () => void;
    embedUrl: string | null;
}

export function BBBEmbedModal({ isOpen, onClose, embedUrl }: BBBEmbedModalProps) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Toggle fullscreen
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

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

        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen || !embedUrl) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex flex-col animate-in fade-in duration-200">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 bg-black text-white shrink-0">
                <div className="flex items-center gap-4">
                    <span className="text-red-500 animate-pulse text-xs font-black tracking-widest uppercase">🔴 LIVE</span>
                    <h3 className="font-bold text-lg text-slate-200">الجلسة المباشرة</h3>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleFullscreen}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                        title={isFullscreen ? 'تصغير' : 'ملء الشاشة'}
                    >
                        {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                    </button>

                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white/10 hover:bg-red-600 text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                    >
                        <X size={18} />
                        خروج
                    </button>
                </div>
            </div>

            {/* Iframe Container */}
            <div ref={containerRef} className="flex-1 bg-black relative overflow-hidden">
                <iframe
                    src={embedUrl}
                    className="w-full h-full border-0"
                    style={{
                        pointerEvents: 'auto',
                        zIndex: 10,
                        position: 'relative'
                    }}
                    allow="camera; microphone; display-capture; autoplay; fullscreen; picture-in-picture; geolocation"
                    allowFullScreen
                    title="Live Session"
                />
            </div>
        </div>
    );
}
