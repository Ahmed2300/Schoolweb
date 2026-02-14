import { useState, useEffect } from 'react';
import {
    Video,
    Play,
    Trash2,
    Eye,
    Calendar,
    Clock,
    TrendingUp,
    Film,
    Loader2,
    Search,
    Download,
    AlertCircle
} from 'lucide-react';
import { teacherLectureService } from '../../../data/api/teacherLectureService';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { LiveSessionEmbedModal } from '../../components/shared/LiveSessionEmbedModal';

interface Recording {
    id: number;
    title: string | { ar?: string; en?: string };
    recording_url: string | null;
    video_path: string | null;
    view_count: number;
    duration_minutes: number;
    meeting_status: string;
    updated_at: string;
    course?: {
        id: number;
        title: string | { ar?: string; en?: string };
    };
    time_slot?: {
        start_time: string;
        end_time: string;
    };
}

interface RecordingStats {
    total_recordings: number;
    total_views: number;
    recordings_this_month: number;
    pending_recordings: number;
}

export default function TeacherRecordingsPage() {
    const [recordings, setRecordings] = useState<Recording[]>([]);
    const [stats, setStats] = useState<RecordingStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteModalId, setDeleteModalId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLiveSessionModalOpen, setIsLiveSessionModalOpen] = useState(false);
    const [liveSessionEmbedUrl, setLiveSessionEmbedUrl] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [recordingsRes, statsRes] = await Promise.all([
                teacherLectureService.getRecordings(),
                teacherLectureService.getRecordingStats()
            ]);
            setRecordings(recordingsRes.data || []);
            setStats(statsRes.data);
        } catch (error) {
            console.error('Error loading recordings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getTitle = (title: string | { ar?: string; en?: string } | null): string => {
        if (!title) return 'تسجيل بدون عنوان';
        if (typeof title === 'string') return title;
        return title.ar || title.en || 'تسجيل بدون عنوان';
    };

    const handleDelete = async (id: number) => {
        setIsDeleting(true);
        try {
            await teacherLectureService.deleteRecording(id);
            setRecordings(prev => prev.filter(r => r.id !== id));
            setDeleteModalId(null);
            if (stats) {
                setStats({
                    ...stats,
                    total_recordings: stats.total_recordings - 1
                });
            }
        } catch (error) {
            console.error('Error deleting recording:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handlePlay = (recording: Recording) => {
        const url = recording.recording_url || recording.video_path;
        if (url) {
            teacherLectureService.trackRecordingView(recording.id);
            setLiveSessionEmbedUrl(url);
            setIsLiveSessionModalOpen(true);
        }
    };

    const filteredRecordings = recordings.filter(recording => {
        const title = getTitle(recording.title).toLowerCase();
        const courseTitle = recording.course ? getTitle(recording.course.title).toLowerCase() : '';
        return title.includes(searchQuery.toLowerCase()) ||
            courseTitle.includes(searchQuery.toLowerCase());
    });

    const StatCard = ({
        icon: Icon,
        label,
        value,
        gradient
    }: {
        icon: typeof Video;
        label: string;
        value: number | string;
        gradient: string;
    }) => (
        <div className={`rounded-2xl p-6 ${gradient} text-white shadow-lg`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-white/80 text-sm font-medium">{label}</p>
                    <p className="text-3xl font-black mt-1">{value}</p>
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Icon size={28} className="text-white" />
                </div>
            </div>
        </div>
    );

    const RecordingCard = ({ recording }: { recording: Recording }) => {
        const recordingUrl = recording.recording_url || recording.video_path;
        const sessionDate = recording.time_slot?.start_time
            ? new Date(recording.time_slot.start_time)
            : new Date(recording.updated_at);

        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all group">
                {/* Video Thumbnail Area */}
                <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <Film size={48} className="text-slate-600 dark:text-slate-500" />

                    {/* Play Button Overlay */}
                    {recordingUrl && (
                        <button
                            onClick={() => handlePlay(recording)}
                            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                                <Play size={28} className="text-slate-800 mr-[-2px]" fill="currentColor" />
                            </div>
                        </button>
                    )}

                    {/* Duration Badge */}
                    {recording.duration_minutes > 0 && (
                        <span className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded-lg font-medium">
                            {recording.duration_minutes} دقيقة
                        </span>
                    )}

                    {/* Views Badge */}
                    <span className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-lg font-medium flex items-center gap-1">
                        <Eye size={12} />
                        {recording.view_count}
                    </span>
                </div>

                {/* Content */}
                <div className="p-5">
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-2 line-clamp-1">
                        {getTitle(recording.title)}
                    </h3>

                    {recording.course && (
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-3 line-clamp-1">
                            {getTitle(recording.course.title)}
                        </p>
                    )}

                    <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500 text-sm mb-4">
                        <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {formatDistanceToNow(sessionDate, { addSuffix: true, locale: ar })}
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                        {recordingUrl ? (
                            <>
                                <button
                                    onClick={() => handlePlay(recording)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-shibl-crimson hover:bg-shibl-crimson-dark text-white rounded-xl font-bold text-sm transition-colors shadow-crimson"
                                >
                                    <Play size={16} />
                                    مشاهدة
                                </button>
                                <a
                                    href={recordingUrl}
                                    download
                                    className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors"
                                    title="تحميل"
                                >
                                    <Download size={18} />
                                </a>
                                <button
                                    onClick={() => setDeleteModalId(recording.id)}
                                    className="p-2.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl transition-colors"
                                    title="حذف"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl font-medium text-sm">
                                <Loader2 size={16} className="animate-spin" />
                                جاري تجهيز التسجيل...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white">التسجيلات</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">إدارة تسجيلات الجلسات المباشرة</p>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        icon={Film}
                        label="إجمالي التسجيلات"
                        value={stats.total_recordings}
                        gradient="bg-gradient-to-br from-purple-500 to-purple-700 dark:from-purple-600 dark:to-purple-800"
                    />
                    <StatCard
                        icon={Eye}
                        label="إجمالي المشاهدات"
                        value={stats.total_views}
                        gradient="bg-gradient-to-br from-teal-400 to-teal-600 dark:from-teal-500 dark:to-teal-700"
                    />
                    <StatCard
                        icon={TrendingUp}
                        label="تسجيلات هذا الشهر"
                        value={stats.recordings_this_month}
                        gradient="bg-gradient-to-br from-amber-400 to-yellow-500 dark:from-amber-500 dark:to-yellow-600"
                    />
                    <StatCard
                        icon={Clock}
                        label="قيد التجهيز"
                        value={stats.pending_recordings}
                        gradient="bg-gradient-to-br from-rose-500 to-shibl-crimson dark:from-rose-600 dark:to-red-700"
                    />
                </div>
            )}

            {/* Search */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-4 mb-6">
                <div className="relative">
                    <Search size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                    <input
                        type="text"
                        placeholder="البحث في التسجيلات..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pr-12 pl-4 py-3 bg-slate-50 dark:bg-slate-800 border-0 rounded-xl text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    />
                </div>
            </div>

            {/* Loading */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={40} className="animate-spin text-blue-600 dark:text-blue-400" />
                </div>
            ) : filteredRecordings.length === 0 ? (
                /* Empty State */
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-12 text-center">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Video size={40} className="text-slate-400 dark:text-slate-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                        {searchQuery ? 'لا توجد نتائج' : 'لا توجد تسجيلات'}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400">
                        {searchQuery
                            ? 'جرب البحث بكلمات مختلفة'
                            : 'ستظهر تسجيلات الجلسات المباشرة هنا بعد انتهائها'}
                    </p>
                </div>
            ) : (
                /* Recordings Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRecordings.map(recording => (
                        <RecordingCard key={recording.id} recording={recording} />
                    ))}
                </div>
            )}

            {/* Delete Modal */}
            {deleteModalId && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <AlertCircle size={32} className="text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white text-center mb-2">
                            حذف التسجيل
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-center mb-6">
                            هل أنت متأكد من حذف هذا التسجيل؟ لا يمكن التراجع عن هذا الإجراء.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteModalId(null)}
                                disabled={isDeleting}
                                className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={() => handleDelete(deleteModalId)}
                                disabled={isDeleting}
                                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <Trash2 size={20} />
                                )}
                                حذف
                            </button>
                            {/* Live Session Embed Modal */}
                            <LiveSessionEmbedModal
                                isOpen={isLiveSessionModalOpen}
                                onClose={() => {
                                    setIsLiveSessionModalOpen(false);
                                    setLiveSessionEmbedUrl(null);
                                }}
                                embedUrl={liveSessionEmbedUrl}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
