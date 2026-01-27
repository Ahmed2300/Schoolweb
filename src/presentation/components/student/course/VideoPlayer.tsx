import { useRef, useEffect } from 'react';

interface VideoPlayerProps {
    src: string;
    onComplete?: () => void;
    onProgress?: (seconds: number) => void;
    poster?: string;
}

export function VideoPlayer({ src, onComplete, onProgress, poster }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            if (onProgress) {
                onProgress(Math.floor(video.currentTime));
            }
        };

        const handleEnded = () => {
            if (onComplete) {
                onComplete();
            }
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('ended', handleEnded);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('ended', handleEnded);
        };
    }, [onProgress, onComplete]);

    return (
        <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-xl border border-slate-900/10">
            <video
                ref={videoRef}
                className="w-full h-full object-cover"
                controls
                playsInline
                poster={poster}
            >
                <source src={src} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
    );
}
