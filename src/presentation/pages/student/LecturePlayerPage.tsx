import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { studentCourseService, Lecture, Unit } from '../../../data/api/studentCourseService';
import { Loader2, ArrowRight, CheckCircle2, FileText, ChevronRight, Menu, Clock, Radio, PlayCircle, Lock } from 'lucide-react';
import { VideoPlayer } from '../../components/student/course/VideoPlayer';
import { CourseContentSidebar } from '../../components/student/course/CourseContentSidebar';
import { LiveSessionContent } from '../../components/student/course/LiveSessionContent';
import { MilestoneCelebration, MilestoneData } from '../../components/student/course/MilestoneCelebration';
import { useLanguage } from '../../hooks';
import { getLocalizedName } from '../../../data/api/studentService';
import toast from 'react-hot-toast';

export function LecturePlayerPage() {
    const { id: courseId, lectureId } = useParams();
    const navigate = useNavigate();
    const { isRTL } = useLanguage();
    const queryClient = useQueryClient();
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 1024);
    const [isCompleting, setIsCompleting] = useState(false);
    const [milestone, setMilestone] = useState<MilestoneData | null>(null);

    // Auto-close sidebar on window resize if it gets smaller than lg breakpoint
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const { data: course, isLoading, error } = useQuery({
        queryKey: ['student-course', courseId],
        queryFn: () => studentCourseService.getStudentCourseDetails(courseId!)
    });

    // Find current lecture
    const currentLecture = course?.content
        .flatMap(u => u.items)
        .find((item): item is Lecture => item.id === Number(lectureId) && item.item_type === 'lecture');

    // Flatten all items (lectures + their nested quizzes + unit level quizzes)
    // IMPORTANT: Unit quizzes must always come LAST within each unit (they gate progression)
    const allItems = course?.content.flatMap(unit => {
        const lectures = unit.items.filter(item => item.item_type === 'lecture');
        const unitQuizzes = unit.items.filter(item => item.item_type === 'quiz' && !('quizzes' in item));
        // Expand lectures with their nested quizzes, then append unit-level quizzes at end
        const expandedLectures = lectures.flatMap(item => {
            if (item.item_type === 'lecture' && item.quizzes && item.quizzes.length > 0) {
                return [item, ...item.quizzes];
            }
            return [item];
        });
        return [...expandedLectures, ...unitQuizzes];
    }) || [];

    // Find current index
    const currentIndex = allItems.findIndex(item => item.id === Number(lectureId) && item.item_type === 'lecture');

    const nextItem = currentIndex !== -1 && currentIndex < allItems.length - 1
        ? allItems[currentIndex + 1]
        : null;

    const prevItem = currentIndex !== -1 && currentIndex > 0
        ? allItems[currentIndex - 1]
        : null;

    // Find the first incomplete item before the current position that's blocking progression
    const firstBlocker = useMemo(() => {
        if (currentIndex <= 0) return null;
        // Only relevant if the next item is actually locked
        if (!nextItem?.is_locked && currentLecture?.is_completed) return null;
        for (let i = 0; i < currentIndex; i++) {
            const item = allItems[i];
            if (!item.is_completed && !item.is_locked) {
                return { id: item.id, type: item.item_type, title: item.title };
            }
        }
        // Also check current lecture's quizzes
        if (currentLecture?.quizzes) {
            const incompleteQuiz = currentLecture.quizzes.find(q => !q.is_completed);
            if (incompleteQuiz) {
                return { id: incompleteQuiz.id, type: 'quiz' as const, title: incompleteQuiz.title };
            }
        }
        return null;
    }, [allItems, currentIndex, nextItem, currentLecture]);

    // Find the next action item — first non-completed, non-locked item the student should do
    const nextActionItem = useMemo(() => {
        for (const item of allItems) {
            if (!item.is_completed && !item.is_locked) {
                return { id: item.id, type: item.item_type };
            }
        }
        return null;
    }, [allItems]);

    const navigateToItem = (item: any) => {
        if (item.item_type === 'quiz') {
            navigate(`/dashboard/quizzes/${item.id}`);
        } else {
            navigate(`/dashboard/courses/${courseId}/lecture/${item.id}`);
        }
    };

    // Helper: check if all items in a unit are completed (including nested quizzes)
    const isUnitComplete = useCallback((unit: Unit) => {
        return unit.items.every(item => {
            if (!item.is_completed) return false;
            if (item.item_type === 'lecture' && item.quizzes && item.quizzes.length > 0) {
                return item.quizzes.every(q => q.is_completed);
            }
            return true;
        });
    }, []);

    const handleComplete = async () => {
        if (!currentLecture || isCompleting) return;

        // Capture completion state BEFORE marking — only redirect on first completion
        const wasAlreadyCompleted = currentLecture.is_completed;

        setIsCompleting(true);
        try {
            // Snapshot: which units were already complete BEFORE this action?
            const unitStatusBefore = course?.content.map(u => ({
                id: u.id,
                title: u.title,
                wasComplete: isUnitComplete(u),
            })) || [];

            await studentCourseService.markLectureComplete(currentLecture.id, currentLecture.duration_minutes * 60);
            // Force refetch to update is_completed status everywhere
            const result = await queryClient.fetchQuery({
                queryKey: ['student-course', courseId],
                queryFn: () => studentCourseService.getStudentCourseDetails(courseId!),
            });

            toast.success('تم تحديد الدرس كمكتمل بنجاح!', { icon: '✓' });

            // Auto-redirect to attached quiz only on FIRST completion (Manar Branch Logic)
            if (!wasAlreadyCompleted) {
                const firstQuiz = currentLecture.quizzes?.[0];
                if (firstQuiz && !firstQuiz.is_completed) {
                    toast('يتم توجيهك للاختبار...', { icon: '📝', duration: 2000 });
                    setTimeout(() => navigate(`/dashboard/quizzes/${firstQuiz.id}`), 1500);
                }
            }

            // Milestone detection: compare before vs after (AzamEgoO Branch Logic)
            if (result?.content) {
                // Check entire course completion first
                const allUnitsNowComplete = result.content.every(u =>
                    u.items.every(item => {
                        if (!item.is_completed) return false;
                        if (item.item_type === 'lecture' && item.quizzes?.length) {
                            return item.quizzes.every(q => q.is_completed);
                        }
                        return true;
                    })
                );
                const wasAllComplete = unitStatusBefore.every(u => u.wasComplete);

                if (allUnitsNowComplete && !wasAllComplete) {
                    // 🎉 Course completed!
                    setMilestone({ type: 'course', title: result.name || '' });
                } else {
                    // Check individual unit completion
                    for (let i = 0; i < result.content.length; i++) {
                        const unit = result.content[i];
                        const before = unitStatusBefore.find(u => u.id === unit.id);
                        const isNowComplete = unit.items.every(item => {
                            if (!item.is_completed) return false;
                            if (item.item_type === 'lecture' && item.quizzes?.length) {
                                return item.quizzes.every(q => q.is_completed);
                            }
                            return true;
                        });
                        if (isNowComplete && before && !before.wasComplete) {
                            const nextUnit = result.content[i + 1];
                            setMilestone({
                                type: 'unit',
                                title: unit.title,
                                nextUnitTitle: nextUnit?.title,
                            });
                            break; // Only show one milestone at a time
                        }
                    }
                }
            }
        } catch (err: any) {
            console.error('Failed to mark complete', err);
            const errorMessage = (err as Record<string, unknown> & { response?: { data?: { message?: string } } })?.response?.data?.message || 'حدث خطأ أثناء تحديد الدرس كمكتمل';
            toast.error(errorMessage);
        } finally {
            setIsCompleting(false);
        }
    };

    // Auto-redirect to quiz when a live session ends (first time only)
    const handleLiveSessionEnd = useCallback(() => {
        // Skip redirect if lecture was already completed before this session
        if (currentLecture?.is_completed) return;

        const firstQuiz = currentLecture?.quizzes?.[0];
        if (firstQuiz && !firstQuiz.is_completed) {
            toast('انتهت الجلسة! يتم توجيهك للاختبار...', { icon: '📝', duration: 2000 });
            setTimeout(() => navigate(`/dashboard/quizzes/${firstQuiz.id}`), 1500);
        }
    }, [currentLecture, navigate]);

    if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#AF0C15]" size={50} /></div>;
    if (error || !currentLecture) return <div className="p-10 text-center text-slate-500">حدث خطأ أثناء تحميل المحتوى</div>;

    return (
        <div className="flex h-screen bg-[#FDFDFD] overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-md h-20 border-b border-slate-100 flex items-center justify-between px-6 lg:px-10 shrink-0 z-20 sticky top-0">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate(`/dashboard/courses/${courseId}`)}
                            className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-[#AF0C15] text-slate-400 hover:text-white rounded-full transition-all duration-300 shadow-sm hover:shadow-[#AF0C15]/20"
                        >
                            <ArrowRight size={20} className={isRTL ? '' : 'rotate-180'} strokeWidth={2.5} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold tracking-wider text-[#AF0C15] bg-[#AF0C15]/5 px-2 py-0.5 rounded-full uppercase">
                                    {course?.name}
                                </span>
                            </div>
                            <h1 className="font-black text-slate-900 line-clamp-1 text-lg flex items-center gap-2">
                                {getLocalizedName(currentLecture.title, 'Lecture')}
                                {/* Session Status Badge */}
                                {currentLecture.session_status === 'upcoming' && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                        <Clock size={10} /> قريباً
                                    </span>
                                )}
                                {currentLecture.session_status === 'live' && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded-full animate-pulse">
                                        <Radio size={10} /> مباشر
                                    </span>
                                )}
                                {currentLecture.session_status === 'ended' && currentLecture.has_recording && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                        <PlayCircle size={10} /> تسجيل
                                    </span>
                                )}
                            </h1>
                        </div>
                    </div>
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-500 hover:text-[#AF0C15]">
                        <Menu size={28} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-5xl mx-auto space-y-8 pb-20">
                        {/* Video / Live / Content Viewer */}
                        <div className="bg-black rounded-[2rem] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] ring-1 ring-white/10 relative z-10">
                            {currentLecture.is_online ? (
                                <LiveSessionContent
                                    lecture={currentLecture}
                                    onSessionEnd={handleLiveSessionEnd}
                                    onComplete={handleComplete}
                                    isCompleting={isCompleting}
                                    isCompleted={currentLecture.is_completed}
                                />

                            ) : currentLecture.video_path ? (
                                <VideoPlayer
                                    src={currentLecture.video_path}
                                    onComplete={handleComplete}
                                />
                            ) : (
                                <div className="aspect-video bg-gradient-to-br from-slate-50 to-white flex flex-col items-center justify-center p-10 text-center">
                                    {currentLecture.is_completed ? (
                                        <>
                                            <div className="w-24 h-24 bg-emerald-50 rounded-3xl flex items-center justify-center shadow-sm mb-6 ring-4 ring-emerald-100">
                                                <CheckCircle2 size={48} className="text-emerald-500" />
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-800 mb-2">تم إكمال هذا الدرس ✓</h3>
                                            <p className="text-slate-400 font-medium">يمكنك الانتقال للدرس التالي</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-6 ring-4 ring-[#AF0C15]/10">
                                                <FileText size={48} className="text-[#AF0C15] opacity-80" />
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-800 mb-2">محتوى نصي / PDF</h3>
                                            <p className="text-slate-500 font-medium mb-8">اقرأ المحتوى ثم اضغط الزر أدناه لتحديده كمكتمل</p>
                                            <button
                                                onClick={handleComplete}
                                                disabled={isCompleting || currentLecture.can_complete === false}
                                                className={`h-14 px-10 bg-[#AF0C15] text-white hover:bg-[#8E0A11] rounded-full font-black transition-all shadow-lg shadow-[#AF0C15]/25 hover:shadow-[#AF0C15]/40 active:scale-95 flex items-center gap-3 mx-auto ${isCompleting ? 'opacity-70 cursor-wait' : ''} ${currentLecture.can_complete === false ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {isCompleting ? (
                                                    <>
                                                        <Loader2 size={22} className="animate-spin" />
                                                        جاري التحديد...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle2 size={22} />
                                                        قرأت المحتوى — تحديد كمكتمل
                                                    </>
                                                )}
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Controls & Info */}
                        <div className="flex flex-col lg:flex-row gap-8 items-start">
                            {/* Actions */}
                            <div className="w-full lg:w-auto lg:shrink-0 flex items-center gap-3 order-2 lg:order-1">
                                {prevItem ? (
                                    <button
                                        onClick={() => navigateToItem(prevItem)}
                                        className="h-14 px-6 rounded-full border border-slate-200 bg-white text-slate-600 hover:border-[#AF0C15] hover:text-[#AF0C15] font-bold transition-all flex items-center gap-2"
                                    >
                                        <ChevronRight className={isRTL ? '' : 'rotate-180'} size={20} />
                                        {prevItem.item_type === 'quiz' ? 'الاختبار السابق' : 'السابق'}
                                    </button>
                                ) : (
                                    <div className="h-14 px-6"></div> // Spacer
                                )}

                                <div className="flex items-center gap-3 flex-1 lg:flex-none justify-center">
                                    {currentLecture.is_completed ? (
                                        <button disabled className="h-14 px-8 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full font-black flex items-center gap-2 cursor-default">
                                            <CheckCircle2 size={24} /> مكتمل
                                        </button>
                                    ) : currentLecture.session_status === 'upcoming' ? (
                                        <button disabled className="h-14 px-8 bg-amber-50 text-amber-600 border border-amber-100 rounded-full font-black flex items-center gap-2 cursor-not-allowed">
                                            <Clock size={20} /> الجلسة لم تبدأ بعد
                                        </button>
                                    ) : currentLecture.session_status === 'live' && !currentLecture.can_complete ? (
                                        <button disabled className="h-14 px-8 bg-red-50/50 text-red-400 border border-red-100 rounded-full font-black flex items-center gap-2 cursor-not-allowed">
                                            <Radio size={20} /> انضم للجلسة أولاً
                                        </button>
                                    ) : currentLecture.can_complete !== false ? (
                                        <button
                                            onClick={handleComplete}
                                            disabled={isCompleting}
                                            className={`h-14 px-10 bg-[#AF0C15] text-white hover:bg-[#8E0A11] rounded-full font-black transition-all shadow-lg shadow-[#AF0C15]/25 hover:shadow-[#AF0C15]/40 active:scale-95 flex items-center gap-2 ${isCompleting ? 'opacity-70 cursor-wait' : ''}`}
                                        >
                                            {isCompleting ? (
                                                <>
                                                    <Loader2 size={20} className="animate-spin" />
                                                    جاري التحديد...
                                                </>
                                            ) : (
                                                'تحديد كمكتمل'
                                            )}
                                        </button>
                                    ) : (
                                        <button disabled className="h-14 px-8 bg-slate-50 text-slate-400 border border-slate-100 rounded-full font-black flex items-center gap-2 cursor-not-allowed">
                                            غير متاح
                                        </button>
                                    )}
                                </div>

                                {nextItem && (
                                    nextItem.is_locked ? (
                                        <div className="relative group/next">
                                            <button
                                                disabled
                                                className="h-14 px-6 rounded-full bg-slate-100 text-slate-400 border border-slate-200 font-bold transition-all flex items-center gap-2 cursor-not-allowed"
                                            >
                                                <Lock size={16} />
                                                {nextItem.item_type === 'quiz' ? 'الاختبار التالي' : 'التالي'}
                                                <ChevronRight className={isRTL ? 'rotate-180' : ''} size={20} />
                                            </button>
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover/next:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
                                                <div className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg max-w-[250px] text-center">
                                                    {!currentLecture.is_completed
                                                        ? 'أكمل الدرس الحالي أولاً'
                                                        : firstBlocker
                                                            ? `أكمل ${firstBlocker.type === 'quiz' ? 'الاختبار' : 'الدرس'}: "${getLocalizedName(firstBlocker.title, firstBlocker.type === 'quiz' ? 'Quiz' : 'Lecture')}" أولاً`
                                                            : 'أكمل المتطلبات السابقة أولاً'}
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => navigateToItem(nextItem)}
                                            className="h-14 px-6 rounded-full bg-slate-900 text-white hover:bg-slate-800 font-bold transition-all flex items-center gap-2 shadow-lg shadow-slate-900/20"
                                        >
                                            {nextItem.item_type === 'quiz' ? 'ابدأ الاختبار' : 'التالي'}
                                            <ChevronRight className={isRTL ? 'rotate-180' : ''} size={20} />
                                        </button>
                                    )
                                )}
                            </div>

                            {/* Title & Desc */}
                            <div className="flex-1 order-1 lg:order-2 text-right">
                                <h2 className="text-2xl lg:text-3xl font-black text-slate-900 mb-4 leading-tight">
                                    {getLocalizedName(currentLecture.title, 'Lecture')}
                                </h2>
                                {currentLecture.description && (
                                    <div className="prose prose-slate prose-lg text-slate-500 leading-relaxed">
                                        {getLocalizedName(currentLecture.description, 'Lecture Desc')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 right-0 lg:static w-[350px] bg-white border-r border-[#AF0C15]/5 lg:border-r-0 lg:border-l border-slate-100 shadow-2xl lg:shadow-none
                transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) z-30
                ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 lg:overflow-hidden'}
            `}>
                {course && (
                    <CourseContentSidebar
                        units={course.content}
                        activeLectureId={Number(lectureId)}
                        courseId={courseId!}
                        firstBlocker={firstBlocker}
                        nextActionItem={nextActionItem}
                    />
                )}
            </div>

            {/* Milestone Celebration Overlay */}
            <MilestoneCelebration
                milestone={milestone}
                onDismiss={() => setMilestone(null)}
            />
        </div>
    );
}
