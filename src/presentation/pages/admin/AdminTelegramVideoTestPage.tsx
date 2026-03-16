import { useState, useEffect, useCallback } from 'react';
import { VideoUploader } from '../../../presentation/components/admin/VideoUploader';
import { PlayCircle, Link2, AlertCircle, RefreshCw, Cloud, CheckCircle2, Copy, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../../data/api/ApiClient';
import { endpoints } from '../../../data/api/endpoints';

interface TelegramVideo {
    id: number;
    title: Record<string, string> | string;
    original_filename: string;
    course_name: Record<string, string> | string | null;
    telegram_file_id: string;
    secure_url: string;
    file_size_mb: number | null;
    lecture_id: number | null;
    is_test: boolean;
    uploaded_at: string;
}

export function AdminTelegramVideoTestPage() {
    const [streamUrl, setStreamUrl] = useState('');
    const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
    const [activeVideoTitle, setActiveVideoTitle] = useState<string>('');
    const [telegramVideos, setTelegramVideos] = useState<TelegramVideo[]>([]);
    const [isLoadingVideos, setIsLoadingVideos] = useState(false);
    const [videoCount, setVideoCount] = useState(0);

    const getLocalizedText = (value: Record<string, string> | string | null | undefined): string => {
        if (!value) return '';
        if (typeof value === 'string') return value;
        return value.ar || value.en || Object.values(value)[0] || '';
    };

    const fetchTelegramVideos = useCallback(async () => {
        setIsLoadingVideos(true);
        try {
            const response = await apiClient.get(endpoints.admin.videos.telegramList);
            if (response.data?.success) {
                setTelegramVideos(response.data.data || []);
                setVideoCount(response.data.count || 0);
            }
        } catch {
            // Silently fail — list may just be empty
            setTelegramVideos([]);
        } finally {
            setIsLoadingVideos(false);
        }
    }, []);

    useEffect(() => {
        fetchTelegramVideos();
    }, [fetchTelegramVideos]);

    const handleUploadComplete = (_videoPath: string, _videoUrl: string) => {
        toast.success('تم الرفع إلى الخادم بنجاح! سيتم إرساله إلى تيليجرام في الخلفية.');
        // Auto-refresh list after a delay to catch the background job
        setTimeout(() => fetchTelegramVideos(), 5000);
    };

    const handlePlayStream = () => {
        if (!streamUrl) {
            toast.error('الرجاء إدخال رابط البث');
            return;
        }
        if (!streamUrl.startsWith('http')) {
            toast.error('يجب أن يبدأ الرابط بـ http:// أو https://');
            return;
        }
        setActiveVideoUrl(streamUrl);
        setActiveVideoTitle('بث مباشر');
    };

    const handlePlayVideo = (video: TelegramVideo) => {
        if (!video.secure_url) {
            toast.error('رابط البث غير متوفر');
            return;
        }
        setActiveVideoUrl(video.secure_url);
        setActiveVideoTitle(getLocalizedText(video.title) || video.original_filename || `#${video.id}`);
        setStreamUrl(video.secure_url);
        // Scroll to player
        document.getElementById('video-player-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    const copyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success('تم نسخ الرابط');
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">اختبار بث تيليجرام</h1>
                <p className="text-slate-500 mt-2">
                    رفع الفيديوهات إلى Telegram Cloud Storage عبر Telerealm CDN واختبار تشغيل البث المباشر.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Section */}
                <div className="bg-white p-6 justify-between flex flex-col rounded-2xl border border-slate-200 shadow-sm">
                    <div>
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                <MonitorArrowUp className="text-blue-600" size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-slate-800">1. رفع الفيديو</h2>
                                <p className="text-sm text-slate-500">يتم رفع الفيديو مجزأ للخادم ثم إرساله لتيليجرام</p>
                            </div>
                        </div>

                        <div className="mb-4 p-4 rounded-xl bg-amber-50 border border-amber-200 flex gap-3 text-amber-800 text-sm">
                            <AlertCircle className="shrink-0 mt-0.5" size={18} />
                            <p>
                                بعد اكتمال الرفع، سيقوم الخادم بإرسال الفيديو إلى Telerealm CDN في الخلفية. 
                                سيظهر الفيديو في المكتبة تلقائياً بعد عدة ثوان.
                            </p>
                        </div>

                        <VideoUploader 
                            onUploadComplete={handleUploadComplete} 
                        />
                    </div>
                </div>

                {/* Stream Test Section */}
                <div id="video-player-section" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                            <PlayCircle className="text-indigo-600" size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-800">2. اختبار البث</h2>
                            <p className="text-sm text-slate-500">قم بتشغيل رابط Telerealm أو اختر فيديو من المكتبة</p>
                        </div>
                    </div>

                    <div className="space-y-4 flex-1">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                رابط فيديو Telerealm 
                                <span className="text-xs text-slate-400 font-normal mr-2">
                                    (مثال: http://localhost:7777/drive/SECURE_ID)
                                </span>
                            </label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                                        <Link2 size={18} />
                                    </div>
                                    <input
                                        type="url"
                                        value={streamUrl}
                                        onChange={(e) => setStreamUrl(e.target.value)}
                                        placeholder="أدخل رابط البث أو اختر فيديو من أدناه"
                                        className="block w-full rounded-xl border-slate-200 pl-4 pr-10 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 outline-none transition-shadow"
                                    />
                                </div>
                                <button
                                    onClick={handlePlayStream}
                                    className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors shrink-0"
                                >
                                    تشغيل
                                </button>
                            </div>
                        </div>

                        {activeVideoUrl ? (
                            <div className="mt-4 space-y-2">
                                {activeVideoTitle && (
                                    <p className="text-sm font-medium text-slate-700">▶ {activeVideoTitle}</p>
                                )}
                                <div className="rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center relative shadow-inner">
                                    <video
                                        key={activeVideoUrl}
                                        src={activeVideoUrl}
                                        controls
                                        className="w-full h-full"
                                        autoPlay
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 aspect-video flex flex-col items-center justify-center text-slate-400">
                                <PlayCircle size={48} className="mb-3 opacity-20" />
                                <p className="text-sm">اختر فيديو من المكتبة أو ضع رابط بث</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Telegram Videos Library */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center">
                            <Cloud className="text-sky-600" size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-800">
                                مكتبة فيديوهات تيليجرام
                                {videoCount > 0 && (
                                    <span className="text-sm font-normal text-slate-400 mr-2">({videoCount})</span>
                                )}
                            </h2>
                            <p className="text-sm text-slate-500">جميع الفيديوهات المخزنة على Telegram Cloud</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchTelegramVideos}
                        disabled={isLoadingVideos}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={isLoadingVideos ? 'animate-spin' : ''} />
                        تحديث
                    </button>
                </div>

                {isLoadingVideos ? (
                    <div className="p-12 flex flex-col items-center justify-center">
                        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-sky-500 animate-spin" />
                        <p className="text-sm text-slate-400 mt-4">جاري تحميل الفيديوهات...</p>
                    </div>
                ) : telegramVideos.length === 0 ? (
                    <div className="p-12 flex flex-col items-center justify-center text-slate-400">
                        <Cloud size={48} className="mb-3 opacity-20" />
                        <p className="text-lg font-medium">لا توجد فيديوهات بعد</p>
                        <p className="text-sm mt-1">قم برفع فيديو أعلاه لرؤيته هنا</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {telegramVideos.map((video) => (
                            <div
                                key={video.id}
                                className="p-5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4"
                            >
                                <div className="flex items-center gap-4 min-w-0 flex-1">
                                    {/* Play thumbnail */}
                                    <button
                                        onClick={() => handlePlayVideo(video)}
                                        className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 hover:opacity-90 transition-opacity shadow-md"
                                    >
                                        <PlayCircle size={28} />
                                    </button>

                                    <div className="min-w-0">
                                        <p className="font-semibold text-slate-800 truncate">
                                            {getLocalizedText(video.title) || video.original_filename || `#${video.id}`}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                            {video.is_test && (
                                                <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                                    اختبار
                                                </span>
                                            )}
                                            {video.course_name && (
                                                <span className="bg-slate-100 px-2 py-0.5 rounded-full">
                                                    {getLocalizedText(video.course_name)}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <CheckCircle2 size={12} className="text-emerald-500" />
                                                Telegram Cloud
                                            </span>
                                            {video.file_size_mb && (
                                                <span>{video.file_size_mb} MB</span>
                                            )}
                                        </div>
                                        {video.uploaded_at && (
                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                {new Date(video.uploaded_at).toLocaleDateString('ar-EG', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 shrink-0">
                                    {video.secure_url && (
                                        <>
                                            <button
                                                onClick={() => copyUrl(video.secure_url)}
                                                className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
                                                title="نسخ الرابط"
                                            >
                                                <Copy size={16} />
                                            </button>
                                            <a
                                                href={video.secure_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
                                                title="فتح في نافذة جديدة"
                                            >
                                                <ExternalLink size={16} />
                                            </a>
                                        </>
                                    )}
                                    <button
                                        onClick={() => handlePlayVideo(video)}
                                        className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
                                    >
                                        تشغيل
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Quick inline icon component
function MonitorArrowUp(props: React.SVGProps<SVGSVGElement> & { size?: number }) {
    const { size = 24, ...rest } = props;
    return (
        <svg
            {...rest}
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m12 14 4-4 4 4" />
            <path d="M16 10v6" />
            <rect width="20" height="14" x="2" y="3" rx="2" />
            <path d="M12 17v4" />
            <path d="M8 21h8" />
        </svg>
    );
}
