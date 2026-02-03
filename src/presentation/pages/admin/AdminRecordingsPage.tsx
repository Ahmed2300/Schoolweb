import { useState, useEffect, useCallback } from 'react';
import {
    Video,
    PlayCircle,
    Eye,
    Search,
    ChevronDown,
    Loader2,
    AlertCircle,
    Clock,
    Users,
    BookOpen,
    Calendar,
    TrendingUp,
    X,
    GraduationCap,
    User,
    Filter,
} from 'lucide-react';
import { adminService } from '../../../data/api/adminService';
import api from '../../../data/api/ApiClient';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Recording {
    id: number;
    title: { ar?: string; en?: string } | string;
    description?: { ar?: string; en?: string } | string;
    course_id: number;
    teacher_id: number;
    recording_url?: string;
    has_recording: boolean;
    duration_minutes?: number;
    view_count?: number;
    start_time?: string;
    end_time?: string;
    updated_at?: string;
    course?: {
        id: number;
        title?: { ar?: string; en?: string } | string;
        grade?: { id: number; name: { ar?: string; en?: string } | string };
    };
    teacher?: { id: number; name: string; email?: string };
    time_slot?: {
        start_time?: string;
        end_time?: string;
        status?: string;
    };
}

interface RecordingStats {
    total_recordings: number;
    total_views: number;
    recordings_this_month: number;
    top_teacher: { id: number; name: string; count: number } | null;
}

interface FilterOption {
    id: number;
    name: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const extractName = (name: unknown): string => {
    if (!name) return '';
    if (typeof name === 'string') {
        try {
            const parsed = JSON.parse(name);
            if (typeof parsed === 'object' && parsed !== null) {
                return parsed.ar || parsed.en || name;
            }
        } catch {
            return name;
        }
        return name;
    }
    if (typeof name === 'object' && name !== null) {
        const obj = name as { ar?: string; en?: string };
        return obj.ar || obj.en || '';
    }
    return '';
};

const formatDuration = (minutes?: number): string => {
    if (!minutes) return '--';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) return `${hrs} ساعة ${mins > 0 ? `و ${mins} دقيقة` : ''}`;
    return `${mins} دقيقة`;
};

const formatDate = (dateString?: string): string => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const formatTime = (dateString?: string): string => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

// ─────────────────────────────────────────────────────────────────────────────
// Video Modal Component
// ─────────────────────────────────────────────────────────────────────────────

interface VideoModalProps {
    isOpen: boolean;
    onClose: () => void;
    recording: Recording | null;
}

function VideoModal({ isOpen, onClose, recording }: VideoModalProps) {
    if (!isOpen || !recording) return null;

    const videoUrl = recording.recording_url;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-4xl bg-charcoal rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div>
                        <h3 className="text-lg font-semibold text-white">
                            {extractName(recording.title)}
                        </h3>
                        <p className="text-sm text-slate-400">
                            {recording.teacher?.name} • {extractName(recording.course?.title)}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Video Player */}
                <div className="aspect-video bg-black">
                    {videoUrl ? (
                        <iframe
                            src={videoUrl}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={extractName(recording.title)}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <div className="text-center">
                                <Video size={48} className="mx-auto mb-3 opacity-50" />
                                <p>الفيديو غير متاح</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer with metadata */}
                <div className="p-4 border-t border-white/10 flex items-center gap-6 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span>{formatDuration(recording.duration_minutes)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Eye size={14} />
                        <span>{recording.view_count || 0} مشاهدة</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>{formatDate(recording.time_slot?.start_time || recording.updated_at)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export function AdminRecordingsPage() {
    // Data state
    const [recordings, setRecordings] = useState<Recording[]>([]);
    const [stats, setStats] = useState<RecordingStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
    const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Dropdown options
    const [teachers, setTeachers] = useState<FilterOption[]>([]);
    const [courses, setCourses] = useState<FilterOption[]>([]);
    const [grades, setGrades] = useState<FilterOption[]>([]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Modal state
    const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

    // ─────────────────────────────────────────────────────────────────────────
    // Data Fetching
    // ─────────────────────────────────────────────────────────────────────────

    const fetchRecordings = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params: Record<string, unknown> = {
                per_page: 12,
                page: currentPage,
            };
            if (selectedTeacherId) params.teacher_id = selectedTeacherId;
            if (selectedCourseId) params.course_id = selectedCourseId;
            if (selectedGradeId) params.grade_id = selectedGradeId;
            if (dateFrom) params.from_date = dateFrom;
            if (dateTo) params.to_date = dateTo;

            const response = await api.get('/api/v1/admin/recordings', { params });
            const data = response.data;

            setRecordings(data.data || []);
            setTotalPages(data.meta?.last_page || 1);
            setTotalCount(data.meta?.total || 0);
        } catch (err) {
            setError('فشل تحميل التسجيلات');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, selectedTeacherId, selectedCourseId, selectedGradeId, dateFrom, dateTo]);

    const fetchStats = useCallback(async () => {
        try {
            const response = await api.get('/api/v1/admin/recordings/stats');
            setStats(response.data.data);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    }, []);

    const fetchDropdowns = useCallback(async () => {
        try {
            const [teachersRes, coursesRes, gradesRes] = await Promise.allSettled([
                adminService.getTeachers({ per_page: 100 }),
                adminService.getCourses({ per_page: 100 }),
                adminService.getGrades({ per_page: 100 }),
            ]);

            if (teachersRes.status === 'fulfilled') {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setTeachers(teachersRes.value.data.map((t: any) => ({
                    id: t.id as number,
                    name: (t.name as string) || (t.email as string) || `معلم ${t.id}`,
                })));
            }
            if (coursesRes.status === 'fulfilled') {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setCourses(coursesRes.value.data.map((c: any) => ({
                    id: c.id as number,
                    name: extractName(c.title || c.name),
                })));
            }
            if (gradesRes.status === 'fulfilled') {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setGrades(gradesRes.value.data.map((g: any) => ({
                    id: g.id as number,
                    name: extractName(g.name),
                })));
            }
        } catch (err) {
            console.error('Failed to fetch dropdowns:', err);
        }
    }, []);

    useEffect(() => {
        fetchDropdowns();
        fetchStats();
    }, [fetchDropdowns, fetchStats]);

    useEffect(() => {
        fetchRecordings();
    }, [fetchRecordings]);

    // ─────────────────────────────────────────────────────────────────────────
    // Handlers
    // ─────────────────────────────────────────────────────────────────────────

    const handleViewRecording = async (recording: Recording) => {
        setSelectedRecording(recording);
        setIsVideoModalOpen(true);

        // Track view
        try {
            await api.post(`/api/v1/admin/recordings/${recording.id}/track-view`);
        } catch {
            // Silent fail for view tracking
        }
    };

    const handleResetFilters = () => {
        setSelectedTeacherId(null);
        setSelectedCourseId(null);
        setSelectedGradeId(null);
        setDateFrom('');
        setDateTo('');
        setSearchQuery('');
        setCurrentPage(1);
    };

    const hasActiveFilters = selectedTeacherId || selectedCourseId || selectedGradeId || dateFrom || dateTo;

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-charcoal">تسجيلات الجلسات</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        مراجعة وتقييم أداء المعلمين من خلال تسجيلات الجلسات المباشرة
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Recordings */}
                <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                            <Video size={22} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-charcoal">
                                {stats?.total_recordings ?? '--'}
                            </p>
                            <p className="text-sm text-slate-500">إجمالي التسجيلات</p>
                        </div>
                    </div>
                </div>

                {/* This Month */}
                <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
                            <TrendingUp size={22} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-charcoal">
                                {stats?.recordings_this_month ?? '--'}
                            </p>
                            <p className="text-sm text-slate-500">هذا الشهر</p>
                        </div>
                    </div>
                </div>

                {/* Total Views */}
                <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/25">
                            <Eye size={22} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-charcoal">
                                {stats?.total_views ?? '--'}
                            </p>
                            <p className="text-sm text-slate-500">إجمالي المشاهدات</p>
                        </div>
                    </div>
                </div>

                {/* Top Teacher */}
                <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/25">
                            <Users size={22} />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-charcoal truncate max-w-[140px]">
                                {stats?.top_teacher?.name ?? '--'}
                            </p>
                            <p className="text-sm text-slate-500">
                                {stats?.top_teacher ? `${stats.top_teacher.count} تسجيل` : 'أكثر تسجيلاً'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="بحث عن تسجيل..."
                            className="w-full h-10 pr-10 pl-4 rounded-lg bg-slate-50 border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all"
                            dir="rtl"
                        />
                    </div>

                    {/* Teacher Filter */}
                    <div className="relative min-w-[150px]">
                        <select
                            value={selectedTeacherId || ''}
                            onChange={(e) => {
                                setSelectedTeacherId(e.target.value ? parseInt(e.target.value) : null);
                                setCurrentPage(1);
                            }}
                            className="w-full h-10 px-3 pr-8 rounded-lg bg-slate-50 border border-slate-200 focus:border-blue-400 outline-none text-sm appearance-none cursor-pointer"
                        >
                            <option value="">كل المدرسين</option>
                            {teachers.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Course Filter */}
                    <div className="relative min-w-[150px]">
                        <select
                            value={selectedCourseId || ''}
                            onChange={(e) => {
                                setSelectedCourseId(e.target.value ? parseInt(e.target.value) : null);
                                setCurrentPage(1);
                            }}
                            className="w-full h-10 px-3 pr-8 rounded-lg bg-slate-50 border border-slate-200 focus:border-blue-400 outline-none text-sm appearance-none cursor-pointer"
                        >
                            <option value="">كل الكورسات</option>
                            {courses.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Grade Filter */}
                    <div className="relative min-w-[140px]">
                        <select
                            value={selectedGradeId || ''}
                            onChange={(e) => {
                                setSelectedGradeId(e.target.value ? parseInt(e.target.value) : null);
                                setCurrentPage(1);
                            }}
                            className="w-full h-10 px-3 pr-8 rounded-lg bg-slate-50 border border-slate-200 focus:border-blue-400 outline-none text-sm appearance-none cursor-pointer"
                        >
                            <option value="">كل الصفوف</option>
                            {grades.map((g) => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Date From */}
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => {
                            setDateFrom(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="h-10 px-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-blue-400 outline-none text-sm"
                    />

                    {/* Date To */}
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => {
                            setDateTo(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="h-10 px-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-blue-400 outline-none text-sm"
                    />

                    {/* Reset Filters */}
                    {hasActiveFilters && (
                        <button
                            onClick={handleResetFilters}
                            className="h-10 px-4 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                        >
                            <Filter size={14} />
                            إزالة التصفية
                        </button>
                    )}
                </div>
            </div>

            {/* Recordings Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={40} className="animate-spin text-blue-500" />
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 text-red-500">
                    <AlertCircle size={48} className="mb-3" />
                    <p className="font-medium">{error}</p>
                    <button
                        onClick={fetchRecordings}
                        className="mt-4 px-4 py-2 rounded-lg bg-red-100 text-red-600 text-sm font-medium hover:bg-red-200 transition-colors"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            ) : recordings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-xl border border-slate-200/80">
                    <Video size={64} className="mb-4 opacity-30" />
                    <p className="text-lg font-medium text-slate-500">لا توجد تسجيلات</p>
                    <p className="text-sm mt-1">لم يتم العثور على تسجيلات تطابق معايير البحث</p>
                    {hasActiveFilters && (
                        <button
                            onClick={handleResetFilters}
                            className="mt-4 px-4 py-2 rounded-lg bg-blue-100 text-blue-600 text-sm font-medium hover:bg-blue-200 transition-colors"
                        >
                            إزالة التصفية
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recordings.map((recording) => (
                        <div
                            key={recording.id}
                            className="group bg-white rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200 transition-all overflow-hidden cursor-pointer"
                            onClick={() => handleViewRecording(recording)}
                        >
                            {/* Thumbnail / Video Preview */}
                            <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-14 h-14 rounded-full bg-white/90 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <PlayCircle size={28} className="text-blue-600 ml-0.5" />
                                    </div>
                                </div>
                                {/* Duration Badge */}
                                <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/70 text-white text-xs font-medium">
                                    {formatDuration(recording.duration_minutes)}
                                </div>
                                {/* Views Badge */}
                                <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-black/70 text-white text-xs font-medium flex items-center gap-1">
                                    <Eye size={12} />
                                    {recording.view_count || 0}
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-4 space-y-3">
                                {/* Title */}
                                <h3 className="font-semibold text-charcoal line-clamp-1 group-hover:text-blue-600 transition-colors">
                                    {extractName(recording.title)}
                                </h3>

                                {/* Metadata */}
                                <div className="space-y-2 text-sm">
                                    {/* Teacher */}
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <User size={14} className="text-slate-400" />
                                        <span>{recording.teacher?.name || 'غير محدد'}</span>
                                    </div>

                                    {/* Course */}
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <BookOpen size={14} className="text-slate-400" />
                                        <span className="truncate">
                                            {extractName(recording.course?.title) || 'غير محدد'}
                                        </span>
                                    </div>

                                    {/* Grade */}
                                    {recording.course?.grade && (
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <GraduationCap size={14} className="text-slate-400" />
                                            <span>{extractName(recording.course.grade.name)}</span>
                                        </div>
                                    )}

                                    {/* Date & Time */}
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Calendar size={14} className="text-slate-400" />
                                        <span>
                                            {formatDate(recording.time_slot?.start_time || recording.updated_at)}
                                            {recording.time_slot?.start_time && (
                                                <span className="text-slate-400 mr-1">
                                                    • {formatTime(recording.time_slot.start_time)}
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200/80 p-4">
                    <p className="text-sm text-slate-500">
                        عرض {recordings.length} من {totalCount} تسجيل • الصفحة {currentPage} من {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="h-9 px-4 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            السابق
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="h-9 px-4 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            التالي
                        </button>
                    </div>
                </div>
            )}

            {/* Video Modal */}
            <VideoModal
                isOpen={isVideoModalOpen}
                onClose={() => {
                    setIsVideoModalOpen(false);
                    setSelectedRecording(null);
                }}
                recording={selectedRecording}
            />
        </div>
    );
}
