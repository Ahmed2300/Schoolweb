import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

interface TutorialThumbnailProps {
    videoUrl: string;
    onClick: () => void;
    layoutId?: string;
    title?: string;
}

export function TutorialThumbnail({ videoUrl, onClick, layoutId, title }: TutorialThumbnailProps) {
    // Extract video ID to get thumbnail
    const getVideoId = (url: string) => {
        try {
            if (url.includes('youtu.be')) return url.split('/').pop();
            const urlParams = new URL(url).search;
            return new URLSearchParams(urlParams).get('v');
        } catch (e) {
            return null;
        }
    };

    const videoId = getVideoId(videoUrl);
    // Use high-quality thumbnail
    const thumbnailUrl = videoId
        ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        : '';

    return (
        <motion.div
            layoutId={layoutId}
            onClick={onClick}
            className="relative group cursor-pointer overflow-hidden rounded-lg shadow-lg aspect-video w-64"
        >
            <img
                src={thumbnailUrl}
                alt="Tutorial Thumbnail"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors duration-300">
                <div className="relative z-10">
                    <div className="bg-white/90 dark:bg-black/90 rounded-full p-3 pl-4 pr-1 shadow-lg group-hover:scale-110 transition-transform duration-300 flex items-center gap-2">
                        <Play className="w-5 h-5 text-shibl-crimson fill-shibl-crimson" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white pl-2">تشغيل الفيديو</span>
                    </div>
                </div>
            </div>

            {/* Pulsing Waves */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                    className="absolute w-12 h-12 rounded-full bg-shibl-crimson/30"
                    animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                />
                <motion.div
                    className="absolute w-12 h-12 rounded-full bg-shibl-crimson/20"
                    animate={{ scale: [1, 2.5], opacity: [0.3, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                />
            </div>

            {/* Title Overlay */}
            {title && (
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    <p className="text-white text-xs font-bold text-center drop-shadow-md line-clamp-2">
                        {title}
                    </p>
                </div>
            )}
        </motion.div>
    );
}
