import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Unit } from '../../../../data/api/studentCourseService';
import { getLocalizedName } from '../../../../data/api/studentService';
import { ChevronDown, Play, FileText, CheckCircle2, Lock, Radio, ClipboardCheck, Clock, PlayCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../../hooks';

interface CourseContentSidebarProps {
    units: Unit[];
    activeLectureId: number;
    courseId: string;
    firstBlocker?: { id: number; type: string; title: string } | null;
    nextActionItem?: { id: number; type: string } | null;
}

export function CourseContentSidebar({ units, activeLectureId, courseId, firstBlocker, nextActionItem }: CourseContentSidebarProps) {
    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-6 pb-4 bg-white sticky top-0 z-10">
                <h3 className="text-xl font-black text-slate-800">محتوى الدورة</h3>
                <p className="text-sm text-slate-400 font-medium mt-1">{units.reduce((acc, unit) => acc + unit.items.length, 0)} درس تعليمي</p>
            </div>
            {/* Blocker Banner */}
            {firstBlocker && (
                <div className="mx-4 mb-3 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 animate-pulse">
                    <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                    <p className="text-[11px] text-amber-700 font-bold leading-tight">
                        أكمل {firstBlocker.type === 'quiz' ? 'الاختبار' : 'الدرس'} المحدد بالأصفر للمتابعة
                    </p>
                </div>
            )}
            <div className="flex-1 overflow-y-auto px-4 pb-10 space-y-4 custom-scrollbar">
                {units.map((unit, idx) => (
                    <SidebarUnit key={unit.id} unit={unit} index={idx} activeLectureId={activeLectureId} courseId={courseId} firstBlocker={firstBlocker} nextActionItem={nextActionItem} />
                ))}
            </div>
        </div>
    );
}

function SidebarUnit({ unit, index, activeLectureId, courseId, firstBlocker, nextActionItem }: { unit: Unit, index: number, activeLectureId: number, courseId: string, firstBlocker?: { id: number; type: string; title: string } | null, nextActionItem?: { id: number; type: string } | null }) {
    const isActiveUnit = unit.items.some(i => i.id === activeLectureId);
    const [isOpen, setIsOpen] = useState(isActiveUnit || index === 0);

    // Auto-open unit containing the blocker
    const hasBlocker = firstBlocker && unit.items.some(i => {
        if (i.id === firstBlocker.id && i.item_type === firstBlocker.type) return true;
        // Check nested quizzes
        if (i.item_type === 'lecture' && i.quizzes) {
            return i.quizzes.some(q => q.id === firstBlocker.id && firstBlocker.type === 'quiz');
        }
        return false;
    });

    // Check if next action is in this unit
    const hasNextAction = nextActionItem && unit.items.some(i => {
        if (i.id === nextActionItem.id && i.item_type === nextActionItem.type) return true;
        if (i.item_type === 'lecture' && i.quizzes) {
            return i.quizzes.some(q => q.id === nextActionItem.id && nextActionItem.type === 'quiz');
        }
        return false;
    });

    // Auto-expand the unit containing the blocker or next action
    useEffect(() => {
        if ((hasBlocker || hasNextAction) && !isOpen) setIsOpen(true);
    }, [hasBlocker, hasNextAction]);

    // Count completed items for progress
    const totalItems = unit.items.length;
    const completedItems = unit.items.filter(i => i.is_completed).length;
    const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return (
        <div className={`rounded-[1.5rem] border overflow-hidden transition-all hover:bg-slate-50 ${hasNextAction && !hasBlocker
                ? 'border-emerald-200 bg-emerald-50/20'
                : 'border-slate-100 bg-slate-50/30'
            }`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 transition-colors group"
            >
                <div className="text-right flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-slate-400 font-bold">الوحدة {index + 1}</span>
                        {progressPercent > 0 && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${progressPercent === 100
                                    ? 'bg-emerald-100 text-emerald-600'
                                    : 'bg-slate-100 text-slate-500'
                                }`}>
                                {progressPercent}%
                            </span>
                        )}
                    </div>
                    <div className={`font-black text-sm transition-colors ${isOpen ? 'text-slate-800' : 'text-slate-600'}`}>
                        {getLocalizedName(unit.title, 'Unit')}
                    </div>
                    {/* Mini progress bar */}
                    {totalItems > 0 && (
                        <div className="mt-2 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${progressPercent === 100 ? 'bg-emerald-400' : 'bg-[#AF0C15]/60'
                                    }`}
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    )}
                </div>
                <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ml-3
                    ${isOpen ? 'bg-[#AF0C15]/10 text-[#AF0C15] rotate-180' : 'bg-slate-200/50 text-slate-400'}
                `}>
                    <ChevronDown size={16} strokeWidth={2.5} />
                </div>
            </button>

            <div className={`
                grid transition-all duration-300 ease-in-out
                ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}
            `}>
                <div className="overflow-hidden">
                    <div className="px-2 pb-2 space-y-1">
                        {unit.items.map(item => {
                            const isActive = item.id === activeLectureId && item.item_type === 'lecture';
                            const hasVideo = item.item_type === 'lecture' && !!item.video_path;
                            const isQuiz = item.item_type === 'quiz';
                            const isBlocker = firstBlocker && item.id === firstBlocker.id && item.item_type === firstBlocker.type;
                            const isNextAction = !isBlocker && nextActionItem && item.id === nextActionItem.id && item.item_type === nextActionItem.type;

                            return (
                                <div key={`${item.item_type}-${item.id}`}>
                                    <SidebarItem
                                        item={item}
                                        isActive={isActive}
                                        courseId={courseId}
                                        hasVideo={hasVideo}
                                        isQuiz={isQuiz}
                                        isBlocker={!!isBlocker}
                                        isNextAction={!!isNextAction}
                                    />
                                    {/* Render Nested Quizzes for Lecture */}
                                    {item.item_type === 'lecture' && item.quizzes && item.quizzes.length > 0 && (
                                        <div className="mr-6 border-r-2 border-slate-100 pr-2 space-y-1 mt-1">
                                            {item.quizzes.map(quiz => {
                                                const isQuizBlocker = firstBlocker && quiz.id === firstBlocker.id && firstBlocker.type === 'quiz';
                                                const isQuizNextAction = !isQuizBlocker && nextActionItem && quiz.id === nextActionItem.id && nextActionItem.type === 'quiz';
                                                return (
                                                    <SidebarItem
                                                        key={`quiz-${quiz.id}`}
                                                        item={quiz}
                                                        isActive={false}
                                                        courseId={courseId}
                                                        hasVideo={false}
                                                        isQuiz={true}
                                                        isBlocker={!!isQuizBlocker}
                                                        isNextAction={!!isQuizNextAction}
                                                    />
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

function SidebarItem({ item, isActive, courseId, hasVideo, isQuiz, isBlocker = false, isNextAction = false }: any) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (isQuiz) {
            navigate(`/dashboard/quizzes/${item.id}`);
        } else {
            navigate(`/dashboard/courses/${courseId}/lecture/${item.id}`);
        }
    };

    // A completed item should always be accessible, even if "locked" in progression
    const isAccessible = item.is_completed || !item.is_locked;

    return (
        <button
            disabled={!isAccessible}
            onClick={handleClick}
            className={`
                w-full flex items-center gap-3 p-3 rounded-xl text-right transition-all duration-200 relative
                ${isActive
                    ? 'bg-[#AF0C15] text-white shadow-lg shadow-[#AF0C15]/20 scale-[1.02] font-bold z-10'
                    : isBlocker
                        ? 'bg-amber-50 text-amber-800 ring-2 ring-amber-400 shadow-md shadow-amber-100 scale-[1.01] z-10'
                        : isNextAction
                            ? 'bg-emerald-50 text-emerald-800 ring-2 ring-emerald-400 shadow-md shadow-emerald-100 scale-[1.01] z-10'
                            : 'text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-sm'
                }
                ${!isAccessible && !isBlocker ? 'opacity-50 cursor-not-allowed saturate-0' : ''}
            `}
        >
            <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors
                ${isActive ? 'bg-white/20 text-white' : isBlocker ? 'bg-amber-100 text-amber-600' : isNextAction ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-slate-400 shadow-sm'}
            `}>
                {item.is_completed ? (
                    <CheckCircle2 size={16} className={isActive ? "text-white" : "text-emerald-500"} />
                ) : isBlocker ? (
                    <AlertTriangle size={16} className="text-amber-500" />
                ) : isNextAction ? (
                    <ArrowLeft size={16} className="text-emerald-500" />
                ) : (
                    isQuiz ? <ClipboardCheck size={16} className={isActive ? "text-white" : "text-amber-500"} /> :
                        item.is_online ? <Radio size={16} className={isActive ? "text-white" : "text-emerald-500"} /> :
                            hasVideo ? <Play size={16} fill={isActive ? "currentColor" : "none"} /> : <FileText size={16} />
                )}
            </div>

            <div className="min-w-0 flex-1">
                <div className="text-xs lg:text-sm truncate leading-snug flex items-center gap-1.5">
                    {getLocalizedName(item.title, isQuiz ? 'Quiz' : 'Lecture')}
                    {/* Blocker Badge */}
                    {isBlocker && (
                        <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full shrink-0 animate-pulse">
                            <AlertTriangle size={8} /> مطلوب
                        </span>
                    )}
                    {/* Next Action Badge */}
                    {isNextAction && !isBlocker && (
                        <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full shrink-0">
                            <ArrowLeft size={8} /> التالي
                        </span>
                    )}
                    {/* Session Status Badge */}
                    {!isQuiz && !isBlocker && !isNextAction && item.session_status === 'upcoming' && (
                        <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full shrink-0">
                            <Clock size={8} /> قريباً
                        </span>
                    )}
                    {!isQuiz && !isBlocker && !isNextAction && item.session_status === 'live' && (
                        <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full shrink-0 animate-pulse">
                            <Radio size={8} /> مباشر
                        </span>
                    )}
                    {!isQuiz && !isBlocker && !isNextAction && item.session_status === 'ended' && item.has_recording && (
                        <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full shrink-0">
                            <PlayCircle size={8} /> تسجيل
                        </span>
                    )}
                </div>
                {isQuiz && !isBlocker && !isNextAction && <div className="text-[10px] text-amber-500 font-bold mt-0.5">اختبار قصير</div>}
                {isBlocker && <div className="text-[10px] text-amber-600 font-bold mt-0.5">أكمل هذا المتطلب للمتابعة</div>}
                {isNextAction && !isBlocker && <div className="text-[10px] text-emerald-600 font-bold mt-0.5">خطوتك التالية</div>}
            </div>

            {item.is_locked && !isBlocker && !isNextAction && <Lock size={14} className="mr-auto text-slate-300" />}

            {/* Playing Indicator */}
            {isActive && !isQuiz && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex gap-0.5 h-3">
                    <div className="w-1 bg-white/50 rounded-full animate-music-bar-1"></div>
                    <div className="w-1 bg-white/50 rounded-full animate-music-bar-2"></div>
                    <div className="w-1 bg-white/50 rounded-full animate-music-bar-3"></div>
                </div>
            )}
        </button>
    );
}
