import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    BookOpen,
    Video,
    Users,
    Award,
    CheckCircle2,
    Clock,
    Loader2,
    AlertCircle,
    BarChart3,
    TrendingUp
} from 'lucide-react';
import { parentService } from '../../../data/api';
import { useLanguage } from '../../hooks';
import toast from 'react-hot-toast';

// Reusing CircularProgress from ParentChildrenPage (or similar)
const CircularProgress = ({ value, color, label, size = 120, strokeWidth = 8 }: { value: number; color: string; label: string; size?: number; strokeWidth?: number }) => {
    const radius = size / 2 - strokeWidth;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - ((value || 0) / 100) * circumference;

    return (
        <div className="flex flex-col items-center justify-center relative">
            <div className="relative" style={{ width: size, height: size }}>
                {/* Background Ring */}
                <svg className="transform -rotate-90 w-full h-full">
                    <circle
                        className="text-slate-100"
                        strokeWidth={strokeWidth}
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx="50%"
                        cy="50%"
                    />
                    {/* Progress Ring */}
                    <circle
                        style={{ stroke: color, strokeDasharray: circumference, strokeDashoffset }}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx="50%"
                        cy="50%"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-charcoal">{value}%</span>
                </div>
            </div>
            <span className="text-sm font-bold text-slate-500 mt-3">{label}</span>
        </div>
    );
};

interface ProgressData {
    course_id: number;
    percentage: number;
    is_completed: boolean;
    total_items: number;
    completed_items: number;

    // Video Stats
    total_videos: number;
    watched_videos: number;
    video_completion_rate: number;

    // Live Stats
    total_lives: number;
    attended_lives: number;
    attendance_rate: number;

    // Quiz Stats
    total_quizzes: number;
    completed_quizzes: number;
    quiz_completion_rate: number;
    average_quiz_score: number;

    // Gamification
    points_earned: number;
    level: string;
    next_milestone: number;
}

export function ParentCourseProgressPage() {
    const { childId, courseId } = useParams();
    const navigate = useNavigate();
    const { isRTL } = useLanguage();

    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState<ProgressData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProgress = async () => {
            if (!childId || !courseId) return;

            setLoading(true);
            try {
                const data = await parentService.getStudentCourseProgress(Number(childId), Number(courseId));
                setProgress(data);
            } catch (err) {
                console.error('Failed to fetch course progress:', err);
                setError('فشل في تحميل بيانات التقدم. الرجاء المحاولة مرة أخرى.');
                toast.error('حدث خطأ أثناء تحميل البيانات');
            } finally {
                setLoading(false);
            }
        };

        fetchProgress();
    }, [childId, courseId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <Loader2 size={40} className="text-shibl-crimson animate-spin mb-4" />
                <p className="text-slate-500 font-bold">جاري تحليل بيانات الطالب...</p>
            </div>
        );
    }

    if (error || !progress) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
                <AlertCircle size={60} className="text-red-400 mb-4" />
                <h2 className="text-xl font-bold text-charcoal mb-2">عذراً، حدث خطأ</h2>
                <p className="text-slate-500 mb-6">{error || 'لم يتم العثور على بيانات التقدم لهذا المساق'}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50"
                >
                    العودة للخلف
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFDFD] pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
                    >
                        <ArrowRight size={20} className={isRTL ? '' : 'rotate-180'} />
                    </button>
                    <div>
                        <h1 className="text-lg md:text-xl font-bold text-charcoal">تفاصيل التقدم الأكاديمي</h1>
                        <p className="text-xs text-slate-400 font-medium">عرض تحليلي لأداء الطالب في المادة</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">

                {/* 1. Main Overview Card */}
                <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-shibl-crimson to-rose-500"></div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="text-center md:text-right flex-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-xs font-bold mb-4">
                                <TrendingUp size={14} />
                                تقرير شامل
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-charcoal mb-2">ملخص الأداء العام</h2>
                            <p className="text-slate-500 max-w-lg leading-relaxed">
                                يعكس هذا التقرير مدى التزام الطالب وحضوره للدروس المباشرة، بالإضافة إلى أدائه في الاختبارات القصيرة والواجبات.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
                                <div className="px-5 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-xs text-slate-400 font-bold mb-1">المستوى الحالي</p>
                                    <p className="text-lg font-black text-shibl-crimson">{progress.level}</p>
                                </div>
                                <div className="px-5 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-xs text-slate-400 font-bold mb-1">النقاط المكتسبة</p>
                                    <p className="text-lg font-black text-amber-500">{progress.points_earned}</p>
                                </div>
                            </div>
                        </div>

                        {/* Overall Progress Circle */}
                        <div className="shrink-0 relative">
                            <CircularProgress
                                value={progress.percentage}
                                color={progress.percentage >= 75 ? '#10B981' : progress.percentage >= 50 ? '#F59E0B' : '#EF4444'}
                                label="إنجاز المادة"
                                size={180}
                                strokeWidth={12}
                            />
                            {progress.is_completed && (
                                <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-2 rounded-full shadow-lg animate-bounce">
                                    <CheckCircle2 size={24} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Detailed Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Video Stats */}
                    <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4">
                            <Video size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-charcoal mb-1">الدروس المسجلة</h3>
                        <p className="text-slate-400 text-sm mb-6">متابعة مشاهدة الفيديوهات التعليمية</p>

                        <div className="flex items-end justify-between mb-2">
                            <span className="text-3xl font-black text-slate-800">{progress.video_completion_rate}%</span>
                            <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                                {progress.watched_videos} من {progress.total_videos} درس
                            </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                style={{ width: `${progress.video_completion_rate}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Live Stats */}
                    <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center mb-4">
                            <Users size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-charcoal mb-1">البث المباشر</h3>
                        <p className="text-slate-400 text-sm mb-6">نسبة الحضور والتفاعل في الحصص</p>

                        <div className="flex items-end justify-between mb-2">
                            <span className="text-3xl font-black text-slate-800">{progress.attendance_rate}%</span>
                            <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                                {progress.attended_lives} من {progress.total_lives} حصة
                            </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-purple-500 rounded-full transition-all duration-1000"
                                style={{ width: `${progress.attendance_rate}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Quiz Stats */}
                    <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-4">
                            <Award size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-charcoal mb-1">الاختبارات</h3>
                        <p className="text-slate-400 text-sm mb-6">الأداء في الاختبارات والتقييمات</p>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                                    <span>نسبة الإنجاز</span>
                                    <span>{progress.completed_quizzes}/{progress.total_quizzes}</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-amber-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${progress.quiz_completion_rate}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-400">متوسط الدرجات</span>
                                <span className="text-xl font-black text-slate-800">{progress.average_quiz_score}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Detailed Breakdown / Syllabus List (Optional - Simplification for now) */}
                <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <BookOpen size={24} className="text-slate-400" />
                        <h3 className="text-xl font-bold text-charcoal">تفاصيل المحتوى التعليمي</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm">
                                <Video size={18} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-700">الدروس المسجلة الكاملة</p>
                                <p className="text-xs text-slate-500 mt-0.5">{progress.watched_videos} درس مكتمل</p>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm">
                                <Users size={18} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-700">الحصص المباشرة المحضورة</p>
                                <p className="text-xs text-slate-500 mt-0.5">{progress.attended_lives} حصة</p>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm">
                                <Award size={18} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-700">الاختبارات المجتازة</p>
                                <p className="text-xs text-slate-500 mt-0.5">{progress.completed_quizzes} اختبار</p>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm">
                                <Clock size={18} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-700">تحديث البيانات</p>
                                <p className="text-xs text-slate-500 mt-0.5">لحظي (Real-time)</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default ParentCourseProgressPage;
