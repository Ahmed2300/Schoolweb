import { motion, AnimatePresence } from 'framer-motion';
import { X, Play } from 'lucide-react';
import { useEffect } from 'react';

interface VideoModalProps {
    isOpen: boolean;
    onClose: () => void;
    videoUrl: string; // YouTube or Vimeo URL
    title?: string;
    layoutId?: string; // For shared element transition
}

export function VideoModal({ isOpen, onClose, videoUrl, title = 'شرح توضيحي', layoutId }: VideoModalProps) {

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    // Simple parser for YouTube embeds from standard URLs
    const getEmbedUrl = (url: string) => {
        try {
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                const videoId = url.includes('youtu.be')
                    ? url.split('/').pop()
                    : new URLSearchParams(new URL(url).search).get('v');
                return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
            }
            return url;
        } catch (e) {
            return url;
        }
    };

    const embedSrc = getEmbedUrl(videoUrl);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" dir="rtl">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
                    />

                    {/* Modal Content */}
                    {/* If layoutId is provided, use it for shared transition. Otherwise fall back to scale animation */}
                    <motion.div
                        layoutId={layoutId} // Shared element transition
                        initial={layoutId ? undefined : { opacity: 0, scale: 0.95, y: 10 }}
                        animate={layoutId ? undefined : { opacity: 1, scale: 1, y: 0 }}
                        exit={layoutId ? undefined : { opacity: 0, scale: 0.95, y: 10 }}
                        transition={{
                            type: "spring",
                            duration: 0.6,
                            bounce: 0.2
                        }}
                        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/20 z-10"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-20">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-red-50 text-shibl-crimson flex items-center justify-center">
                                    <Play size={16} fill="currentColor" />
                                </span>
                                {title}
                            </h3>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Video Player */}
                        <div className="relative aspect-video bg-black">
                            {embedSrc ? (
                                <iframe
                                    src={embedSrc}
                                    className="absolute inset-0 w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    title={title}
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-white/50">
                                    <p>فشل تحميل الفيديو</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
