import { Play, FileText, Lock, CheckCircle2, Clock, Radio, Video } from 'lucide-react';
import { Lecture } from '../../../../data/api/studentCourseService';
import { useLanguage } from '../../../hooks';
import { QuizItem } from './QuizItem';
import { getLocalizedName } from '../../../../data/api/studentService';
import { useMemo } from 'react';

import { useNavigate } from 'react-router-dom';

interface LectureItemProps {
    lecture: Lecture;
    courseId: string;
}

type LiveState = 'not_scheduled' | 'pending' | 'upcoming' | 'live' | 'ended';

export function LectureItem({ lecture, courseId }: LectureItemProps) {
    const { isRTL } = useLanguage();
    const navigate = useNavigate();
    const hasQuizzes = lecture.quizzes && lecture.quizzes.length > 0;

    const isLive = lecture.is_online;
    const hasVideo = !!lecture.video_path;

    // Determine live session state
    const liveState = useMemo((): LiveState => {
        if (!isLive) return 'not_scheduled';

        // Check if meeting is actively running
        if (lecture.bbb_meeting_running) return 'live';

        const timeSlot = lecture.time_slot;
        if (!timeSlot) return 'live'; // No schedule = assume available to join

        if (timeSlot.status === 'pending') return 'pending';
        if (timeSlot.status === 'completed') return 'ended';
        if (timeSlot.status === 'rejected') return 'not_scheduled';

        const startTime = timeSlot.start_time ? new Date(timeSlot.start_time) : null;
        const endTime = timeSlot.end_time ? new Date(timeSlot.end_time) : null;

        if (!startTime) return 'not_scheduled';

        const now = new Date();
        if (now < startTime) return 'upcoming';
        if (endTime && now > endTime) return 'ended';

        // Within time slot period = assumelive
        return 'live';
    }, [isLive, lecture.bbb_meeting_running, lecture.time_slot]);

    // Determine Icon & Style based on state
    let Icon = FileText;
    let iconColor = 'text-blue-500';
    let iconBg = 'bg-blue-50';
    let hoverBorder = 'hover:border-blue-200';
    let hoverText = 'group-hover:text-blue-600';
    let btnBg = 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white';
    let actionText = 'اقرأ';

    if (isLive) {
        Icon = Radio;

        if (liveState === 'live') {
            // Currently active - show red/urgent styling
            iconColor = 'text-red-500';
            iconBg = 'bg-red-50';
            hoverBorder = 'hover:border-red-200';
            hoverText = 'group-hover:text-red-600';
            btnBg = 'bg-red-500 text-white animate-pulse';
            actionText = 'انضم الآن';
        } else if (liveState === 'upcoming') {
            iconColor = 'text-emerald-500';
            iconBg = 'bg-emerald-50';
            hoverBorder = 'hover:border-emerald-200';
            hoverText = 'group-hover:text-emerald-600';
            btnBg = 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white';
            actionText = 'قريباً';
        } else if (liveState === 'ended') {
            iconColor = 'text-slate-400';
            iconBg = 'bg-slate-100';
            hoverBorder = 'hover:border-slate-200';
            hoverText = 'group-hover:text-slate-600';
            btnBg = 'bg-slate-100 text-slate-500 group-hover:bg-slate-500 group-hover:text-white';
            actionText = lecture.recording_url ? 'شاهد التسجيل' : 'انتهت';
        } else {
            // Not scheduled or pending
            iconColor = 'text-amber-500';
            iconBg = 'bg-amber-50';
            hoverBorder = 'hover:border-amber-200';
            hoverText = 'group-hover:text-amber-600';
            btnBg = 'bg-amber-50 text-amber-600';
            actionText = liveState === 'pending' ? 'قيد الموافقة' : 'غير مجدول';
        }
    } else if (hasVideo) {
        Icon = Play;
        iconColor = 'text-[#C41E3A]';
        iconBg = 'bg-red-50';
        hoverBorder = 'hover:border-red-200';
        hoverText = 'group-hover:text-[#C41E3A]';
        btnBg = 'bg-red-50 text-[#C41E3A] group-hover:bg-[#C41E3A] group-hover:text-white';
        actionText = 'شاهد';
    }

    // A completed item should always be accessible, even if "locked" in progression
    const isAccessible = lecture.is_completed || !lecture.is_locked;

    const handleClick = () => {
        if (isAccessible) {
            navigate(`/dashboard/courses/${courseId}/lecture/${lecture.id}`);
        }
    };

    // Live status badge text
    const getLiveStatusText = () => {
        if (!isLive) return hasVideo ? 'درس فيديو' : 'درس مقروء';

        switch (liveState) {
            case 'live': return '🔴 مباشر الآن';
            case 'upcoming': return 'مباشر قريباً';
            case 'ended': return 'انتهى';
            case 'pending': return 'قيد الموافقة';
            default: return 'مباشر';
        }
    };

    return (
        <div className="flex flex-col gap-3">
            {/* Lecture Card */}
            <div
                onClick={handleClick}
                className={`
        relative group
        flex items-center gap-4 p-4 lg:p-5
        bg-white border border-slate-100 rounded-2xl
        hover:shadow-md ${hoverBorder} hover:-translate-y-0.5
        transition-all duration-300 cursor-pointer
        ${!isAccessible ? 'opacity-60 pointer-events-none grayscale' : ''}
        ${liveState === 'live' ? 'ring-2 ring-red-200 border-red-100' : ''}
      `}>
                {/* Icon Container */}
                <div className={`w-12 h-12 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm ${liveState === 'live' ? 'animate-pulse' : ''}`}>
                    <Icon size={22} className="stroke-[2.5]" fill={hasVideo ? "currentColor" : "none"} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className={`text-lg font-bold text-slate-800 truncate ${hoverText} transition-colors`}>
                            {getLocalizedName(lecture.title, 'Lecture')}
                        </h4>
                        {lecture.is_completed && (
                            <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                        )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                        {lecture.duration_minutes > 0 && (
                            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-md">
                                <Clock size={12} />
                                <span>{lecture.duration_minutes} دقيقة</span>
                            </div>
                        )}
                        <span className={`font-bold px-2 rounded ${liveState === 'live'
                            ? 'text-red-600 bg-red-50'
                            : isLive
                                ? 'text-emerald-500/80 bg-emerald-50'
                                : 'opacity-60'
                            }`}>
                            {getLiveStatusText()}
                        </span>
                    </div>
                </div>

                {/* Action / State */}
                <div className="shrink-0 flex items-center gap-3">
                    {!isAccessible ? (
                        <Lock size={20} className="text-slate-300" />
                    ) : (
                        <button className={`
              px-5 py-2.5 rounded-xl text-sm font-bold
              ${btnBg}
              transition-all shadow-sm
            `}>
                            {actionText}
                        </button>
                    )}
                </div>
            </div>

            {/* Nested Quizzes (Level 3) */}
            {hasQuizzes && (
                <div className={`flex flex-col gap-3 pr-8 lg:pr-10 ${isRTL ? 'border-r-2 border-slate-100 pr-8 mr-6' : 'border-l-2 border-slate-100 pl-8 ml-6'}`}>
                    {lecture.quizzes!.map(quiz => (
                        <QuizItem key={quiz.id} quiz={quiz} />
                    ))}
                </div>
            )}
        </div>
    );
}
