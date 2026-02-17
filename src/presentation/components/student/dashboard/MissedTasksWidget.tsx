import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle,
    Video,
    ClipboardList,
    ChevronDown,
    ChevronUp,
    PlayCircle,
    ExternalLink,
    CheckCircle2,
    Clock,
} from 'lucide-react';
import studentService, {
    MissedTasksResponse,
    MissedLectureItem,
    MissedQuizItem,
} from '../../../../data/api/studentService';

interface MissedTasksWidgetProps {
    /** Number of days to look back (1-30) */
    days?: number;
    /** Maximum items to show before collapsing */
    maxVisible?: number;
    /** Callback when a lecture item is clicked */
    onLectureClick?: (lectureId: number, courseId: number) => void;
    /** Callback when a quiz item is clicked */
    onQuizClick?: (quizId: number, courseId: number) => void;
}

export function MissedTasksWidget({
    days = 7,
    maxVisible = 3,
    onLectureClick,
    onQuizClick,
}: MissedTasksWidgetProps) {
    const [data, setData] = useState<MissedTasksResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const fetchData = async () => {
            setLoading(true);
            const result = await studentService.getMissedTasks(days);
            if (!cancelled) {
                setData(result);
                setLoading(false);
            }
        };

        fetchData();
        return () => { cancelled = true; };
    }, [days]);

    // ── Loading skeleton ──
    if (loading) {
        return (
            <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm animate-pulse">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
                    <div className="h-6 w-40 bg-slate-100 rounded-lg" />
                </div>
                <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="h-16 bg-slate-50 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    // ── Nothing missed ──
    if (!data || data.total_missed === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-emerald-50 to-white rounded-[24px] p-6 border border-emerald-100 shadow-sm relative overflow-hidden"
            >
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center shadow-sm">
                        <CheckCircle2 size={24} className="text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-emerald-900 text-lg mb-0.5">ممتاز! لا توجد مهام فائتة 🎉</h3>
                        <p className="text-sm text-emerald-700/80 font-medium">أنت على المسار الصحيح، واصل التقدم الرائع.</p>
                    </div>
                </div>
                {/* Decor */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-100/30 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
            </motion.div>
        );
    }

    // ── Build combined items list ──
    const allItems: Array<{ type: 'lecture' | 'quiz'; item: MissedLectureItem | MissedQuizItem }> = [
        ...data.missed_lectures.map((item) => ({ type: 'lecture' as const, item })),
        ...data.missed_quizzes.map((item) => ({ type: 'quiz' as const, item })),
    ];

    const visibleItems = expanded ? allItems : allItems.slice(0, maxVisible);
    const hasMore = allItems.length > maxVisible;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="bg-white rounded-[24px] p-6 border border-amber-100 shadow-[0_4px_20px_-8px_rgba(251,191,36,0.2)] relative overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-400"></div>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100 shadow-sm">
                        <AlertTriangle size={24} className="text-amber-500" />
                    </div>
                    <div>
                        <h3 className="font-exrabold text-slate-800 text-lg">
                            المهام الفائتة
                        </h3>
                        <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mt-1">
                            <Clock size={12} />
                            آخر {data.period_days} أيام
                        </p>
                    </div>
                </div>

                {/* Badge */}
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm font-bold border border-amber-200 shadow-sm">
                    {data.total_missed}
                    <span className="text-[10px] opacity-80 font-medium">فائت</span>
                </span>
            </div>

            {/* Items list */}
            <div className="space-y-3">
                <AnimatePresence initial={false}>
                    {visibleItems.map(({ type, item }, index) => (
                        <motion.div
                            key={`${type}-${item.id}`}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                        >
                            {type === 'lecture' ? (
                                <LectureItem
                                    item={item as MissedLectureItem}
                                    onClick={onLectureClick}
                                />
                            ) : (
                                <QuizItem
                                    item={item as MissedQuizItem}
                                    onClick={onQuizClick}
                                />
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Expand / Collapse */}
            {hasMore && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="mt-4 w-full flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-all py-3 rounded-xl hover:bg-slate-50 group"
                >
                    {expanded ? (
                        <>
                            إخفاء القائمة <ChevronUp size={16} className="text-slate-400 group-hover:text-slate-600" />
                        </>
                    ) : (
                        <>
                            عرض الكل ({allItems.length}) <ChevronDown size={16} className="text-slate-400 group-hover:text-slate-600" />
                        </>
                    )}
                </button>
            )}
        </motion.div>
    );
}

// ── Lecture Item ──
function LectureItem({
    item,
    onClick,
}: {
    item: MissedLectureItem;
    onClick?: (lectureId: number, courseId: number) => void;
}) {
    const formattedTime = item.time
        ? new Date(item.time).toLocaleDateString('ar-SA', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
        : null;

    return (
        <button
            id={`missed-lecture-${item.id}`}
            onClick={() => onClick?.(item.id, item.course_id)}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-50/50 hover:bg-red-50 border border-red-100/60 transition-all group text-right"
        >
            <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                <Video size={16} className="text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-700 truncate">{item.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-slate-400 truncate">{item.course}</span>
                    {formattedTime && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                            <Clock size={10} /> {formattedTime}
                        </span>
                    )}
                </div>
            </div>
            {item.has_recording ? (
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-lg text-blue-600 text-[10px] font-bold border border-blue-100 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <PlayCircle size={12} /> مشاهدة
                </div>
            ) : (
                <ExternalLink size={14} className="text-slate-300 group-hover:text-slate-400 transition-colors flex-shrink-0" />
            )}
        </button>
    );
}

// ── Quiz Item ──
function QuizItem({
    item,
    onClick,
}: {
    item: MissedQuizItem;
    onClick?: (quizId: number, courseId: number) => void;
}) {
    return (
        <button
            id={`missed-quiz-${item.id}`}
            onClick={() => onClick?.(item.id, item.course_id)}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-purple-50/50 hover:bg-purple-50 border border-purple-100/60 transition-all group text-right"
        >
            <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <ClipboardList size={16} className="text-purple-500" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-700 truncate">{item.name}</p>
                <span className="text-[10px] text-slate-400 truncate">{item.course}</span>
            </div>
            <ExternalLink size={14} className="text-slate-300 group-hover:text-slate-400 transition-colors flex-shrink-0" />
        </button>
    );
}
