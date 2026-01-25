
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teacherLectureService } from '../../../data/api/teacherLectureService';
import { Loader2, ArrowRight } from 'lucide-react';

export default function LiveClassroomPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [joinUrl, setJoinUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchJoinUrl = async () => {
            if (!id) return;
            try {
                setLoading(true);
                // We use the same join endpoint, but now we embed it
                const response = await teacherLectureService.joinSession(Number(id));
                if (response.success && response.join_url) {
                    setJoinUrl(response.join_url);
                } else {
                    setError('Failed to join session');
                }
            } catch (err) {
                console.error('Join error:', err);
                setError('Could not join the session. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchJoinUrl();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white">
                <Loader2 size={48} className="animate-spin mb-4 text-blue-500" />
                <p>Connecting to secure classroom...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-800">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
                    <p className="text-red-500 font-bold mb-4">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg font-medium transition"
                    >
                        Return
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden">
            {/* Overlay Header (Auto-hides) */}
            <div className="absolute top-0 left-0 right-0 z-50 p-4 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="flex justify-between items-start pointer-events-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-4 py-2 bg-black/50 hover:bg-black/70 text-white rounded-lg backdrop-blur-sm transition"
                    >
                        <ArrowRight size={18} className="rotate-180" />
                        <span>Exit Classroom</span>
                    </button>
                </div>
            </div>

            {/* Embedded BBB Client */}
            <iframe
                src={joinUrl!}
                className="w-full h-full border-0"
                allow="camera; microphone; display-capture; autoplay; fullscreen"
                title="Classroom"
                onContextMenu={(e) => e.preventDefault()} // Basic Right-Click Block
            />
        </div>
    );
}
