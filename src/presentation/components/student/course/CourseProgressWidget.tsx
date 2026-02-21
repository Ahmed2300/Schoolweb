import { useState } from 'react';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
// Re-trigger build
import 'react-circular-progressbar/dist/styles.css';
import { Trophy, Target, Video, Radio, ClipboardCheck, Star, HelpCircle, Lightbulb, Clock } from 'lucide-react';
import { StudentCourseProgress } from '../../../../data/api/studentCourseService';
import { getLocalizedName } from '../../../../data/api/studentService';

interface CourseProgressWidgetProps {
    progress: StudentCourseProgress;
    courseName?: string;
}

export function CourseProgressWidget({ progress, courseName }: CourseProgressWidgetProps) {
    const [showPointsInfo, setShowPointsInfo] = useState(false);

    // Theme colors based on level
    const getLevelColor = (level: string) => {
        switch (level) {
            case 'Legend': return '#F59E0B'; // Amber (Gold)
            case 'Expert': return '#8B5CF6'; // Violet
            case 'Intermediate': return '#3B82F6'; // Blue
            default: return '#10B981'; // Emerald (Novice)
        }
    };

    const levelColor = getLevelColor(progress.level);

    return (
        <div className="bg-white rounded-3xl lg:rounded-[3rem] p-5 sm:p-6 lg:p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-50 sticky top-4 sm:top-10">
            {/* Header: Level & Points */}
            <div className="flex items-center justify-between mb-6 sm:mb-8 relative">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: `${levelColor}20` }}>
                            <Trophy size={28} style={{ color: levelColor }} />
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-white text-white text-[10px] font-bold">
                            Lvl
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">المستوى الحالي</p>
                        <h3 className="text-xl font-black text-slate-800">{getLocalizedName(progress.level, '')}</h3>
                    </div>
                </div>

                <div
                    className="text-left relative z-10"
                    onMouseEnter={() => setShowPointsInfo(true)}
                    onMouseLeave={() => setShowPointsInfo(false)}
                >
                    <div className="flex items-center gap-1 cursor-help">
                        <HelpCircle size={14} className="text-slate-300 hover:text-slate-500 transition-colors" />
                        <p className="text-xs text-slate-400 font-bold mb-0.5">النقاط</p>
                    </div>
                    <div className="flex items-center gap-1">
                        <Star size={16} className="text-amber-400 fill-amber-400" />
                        <span className="text-xl font-black text-slate-900">{progress.points_earned}</span>
                    </div>

                    {/* Points Calculation Tooltip */}
                    {showPointsInfo && (
                        <div className="absolute top-12 left-0 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 transform transition-all duration-300 origin-top-left animate-in fade-in zoom-in-95">
                            <div className="absolute -top-2 left-6 w-4 h-4 bg-white border-t border-r border-slate-100 transform -rotate-45"></div>

                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-50">
                                <Lightbulb size={18} className="text-amber-500" />
                                <h4 className="font-bold text-slate-800 text-sm">كيف تحتسب النقاط؟</h4>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3 p-2 bg-slate-50 rounded-xl">
                                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                        <Video size={14} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-700">الدروس ومشاهدة الحصص</p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">كل دقيقة مشاهدة = <span className="text-blue-600 font-bold">1 نقطة</span></p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-2 bg-slate-50 rounded-xl">
                                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                                        <ClipboardCheck size={14} className="text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-700">حل الكويزات</p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">كل دقيقة من مدة الكويز = <span className="text-purple-600 font-bold">1.5 نقطة</span></p>
                                    </div>
                                </div>

                                <div className="mt-2 text-[10px] text-slate-400 text-center px-2">
                                    تُمنح النقاط عند إكمال المحتوى التعليمي بنجاح
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Circular Progress */}
            <div className="flex justify-center mb-8 sm:mb-10">
                <div className="w-40 h-40 sm:w-48 sm:h-48 relative">
                    <CircularProgressbarWithChildren
                        value={progress.percentage}
                        styles={buildStyles({
                            pathColor: levelColor,
                            trailColor: '#F1F5F9', // Slate-100
                            strokeLinecap: 'round',
                            pathTransitionDuration: 1.5,
                        })}
                    >
                        <div className="text-center translate-y-1 sm:translate-y-2">
                            <p className="text-xs sm:text-sm text-slate-400 font-bold mb-0.5 sm:mb-1">الإنجاز العام</p>
                            <h2 className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight leading-none mb-1 sm:mb-0">{progress.percentage}%</h2>
                            {progress.percentage >= 100 && (
                                <span className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] sm:text-xs font-bold mt-1 sm:mt-2">
                                    مكتمل!
                                </span>
                            )}
                        </div>
                    </CircularProgressbarWithChildren>

                    {/* Decorative Blur */}
                    <div
                        className="absolute inset-0 rounded-full blur-2xl sm:blur-3xl -z-10 opacity-30"
                        style={{ backgroundColor: levelColor }}
                    ></div>
                </div>
            </div>

            {/* Streak / Next Milestone */}
            <div className="mb-6 sm:mb-8 p-4 sm:p-5 bg-slate-50 rounded-2xl sm:rounded-3xl border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Target size={18} className="text-slate-400" />
                        <span className="text-sm font-bold text-slate-600">المحطة القادمة</span>
                    </div>
                    <span className="text-sm font-black text-slate-800">{progress.next_milestone}%</span>
                </div>
                {/* Progress Bar */}
                <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                            width: `${(progress.percentage / progress.next_milestone) * 100}%`,
                            backgroundColor: levelColor
                        }}
                    ></div>
                </div>
                {progress.percentage < 100 && (
                    <p className="text-xs text-slate-400 mt-3 text-right">
                        واصل التعلم للوصول إلى المستوى التالي!
                    </p>
                )}
            </div>

            {/* Detailed Stats Grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <StatBox
                    icon={Video}
                    color="text-rose-500"
                    bg="bg-rose-50"
                    value={`${progress.video_completion_rate}%`}
                    label="الفيديوهات"
                />
                <StatBox
                    icon={Radio}
                    color="text-emerald-500"
                    bg="bg-emerald-50"
                    value={`${progress.attendance_rate}%`}
                    label="البث المباشر"
                />
                <StatBox
                    icon={ClipboardCheck}
                    color="text-blue-500"
                    bg="bg-blue-50"
                    value={`${progress.average_quiz_score}`}
                    label="معدل الكويز"
                    subLabel="/ 100"
                />
            </div>
        </div>
    );
}

function StatBox({ icon: Icon, color, bg, value, label, subLabel }: any) {
    return (
        <div className="flex flex-col items-center justify-center p-2 sm:p-3 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white border border-slate-100 shadow-sm text-center">
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${bg} flex items-center justify-center mb-1.5 sm:mb-2`}>
                <Icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${color}`} />
            </div>
            <div className="text-sm sm:text-lg font-black text-slate-800 leading-none mb-1 flex items-baseline">
                {value}{subLabel && <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium ml-0.5">{subLabel}</span>}
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-500 font-bold leading-tight">{label}</p>
        </div>
    );
}
