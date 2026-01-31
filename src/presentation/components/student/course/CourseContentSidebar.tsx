import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Unit } from '../../../../data/api/studentCourseService';
import { getLocalizedName } from '../../../../data/api/studentService';
import { ChevronDown, Play, FileText, CheckCircle2, Lock, Radio, ClipboardCheck, Clock, PlayCircle } from 'lucide-react';
import { useLanguage } from '../../../hooks';

interface CourseContentSidebarProps {
    units: Unit[];
    activeLectureId: number;
    courseId: string;
}

export function CourseContentSidebar({ units, activeLectureId, courseId }: CourseContentSidebarProps) {
    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-6 pb-4 bg-white sticky top-0 z-10">
                <h3 className="text-xl font-black text-slate-800">محتوى الدورة</h3>
                <p className="text-sm text-slate-400 font-medium mt-1">{units.reduce((acc, unit) => acc + unit.items.length, 0)} درس تعليمي</p>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-10 space-y-4 custom-scrollbar">
                {units.map((unit, idx) => (
                    <SidebarUnit key={unit.id} unit={unit} index={idx} activeLectureId={activeLectureId} courseId={courseId} />
                ))}
            </div>
        </div>
    );
}

function SidebarUnit({ unit, index, activeLectureId, courseId }: { unit: Unit, index: number, activeLectureId: number, courseId: string }) {
    const isActiveUnit = unit.items.some(i => i.id === activeLectureId);
    const [isOpen, setIsOpen] = useState(isActiveUnit || index === 0);

    return (
        <div className="rounded-[1.5rem] border border-slate-100 overflow-hidden bg-slate-50/30 transition-all hover:bg-slate-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 transition-colors group"
            >
                <div className="text-right">
                    <span className="text-xs text-slate-400 font-bold block mb-1">الوحدة {index + 1}</span>
                    <div className={`font-black text-sm transition-colors ${isOpen ? 'text-slate-800' : 'text-slate-600'}`}>
                        {getLocalizedName(unit.title, 'Unit')}
                    </div>
                </div>
                <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
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

                            return (
                                <div key={`${item.item_type}-${item.id}`}>
                                    <SidebarItem
                                        item={item}
                                        isActive={isActive}
                                        courseId={courseId}
                                        hasVideo={hasVideo}
                                        isQuiz={isQuiz}
                                    />
                                    {/* Render Nested Quizzes for Lecture */}
                                    {item.item_type === 'lecture' && item.quizzes && item.quizzes.length > 0 && (
                                        <div className="mr-6 border-r-2 border-slate-100 pr-2 space-y-1 mt-1">
                                            {item.quizzes.map(quiz => (
                                                <SidebarItem
                                                    key={`quiz-${quiz.id}`}
                                                    item={quiz}
                                                    isActive={false} // Todo: Handle active state for quiz route
                                                    courseId={courseId}
                                                    hasVideo={false}
                                                    isQuiz={true}
                                                />
                                            ))}
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

function SidebarItem({ item, isActive, courseId, hasVideo, isQuiz }: any) {
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
                    : 'text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-sm'
                }
                ${!isAccessible ? 'opacity-50 cursor-not-allowed saturate-0' : ''}
            `}
        >
            <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors
                ${isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-400 shadow-sm'}
            `}>
                {item.is_completed ? (
                    <CheckCircle2 size={16} className={isActive ? "text-white" : "text-emerald-500"} />
                ) : (
                    isQuiz ? <ClipboardCheck size={16} className={isActive ? "text-white" : "text-amber-500"} /> :
                        item.is_online ? <Radio size={16} className={isActive ? "text-white" : "text-emerald-500"} /> :
                            hasVideo ? <Play size={16} fill={isActive ? "currentColor" : "none"} /> : <FileText size={16} />
                )}
            </div>

            <div className="min-w-0 flex-1">
                <div className="text-xs lg:text-sm truncate leading-snug flex items-center gap-1.5">
                    {getLocalizedName(item.title, isQuiz ? 'Quiz' : 'Lecture')}
                    {/* Session Status Badge */}
                    {!isQuiz && item.session_status === 'upcoming' && (
                        <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full shrink-0">
                            <Clock size={8} /> قريباً
                        </span>
                    )}
                    {!isQuiz && item.session_status === 'live' && (
                        <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full shrink-0 animate-pulse">
                            <Radio size={8} /> مباشر
                        </span>
                    )}
                    {!isQuiz && item.session_status === 'ended' && item.has_recording && (
                        <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full shrink-0">
                            <PlayCircle size={8} /> تسجيل
                        </span>
                    )}
                </div>
                {isQuiz && <div className="text-[10px] text-amber-500 font-bold mt-0.5">اختبار قصير</div>}
            </div>

            {item.is_locked && <Lock size={14} className="mr-auto text-slate-300" />}

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
