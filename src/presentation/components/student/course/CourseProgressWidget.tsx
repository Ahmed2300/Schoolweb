import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
// Re-trigger build
import 'react-circular-progressbar/dist/styles.css';
import { Trophy, Flame, Target, Video, Radio, ClipboardCheck, Star } from 'lucide-react';
import { StudentCourseProgress } from '../../../../data/api/studentCourseService';
import { getLocalizedName } from '../../../../data/api/studentService';

interface CourseProgressWidgetProps {
    progress: StudentCourseProgress;
    courseName?: string;
}

export function CourseProgressWidget({ progress, courseName }: CourseProgressWidgetProps) {
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
        <div className="bg-white rounded-[3rem] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-50 sticky top-10">
            {/* Header: Level & Points */}
            <div className="flex items-center justify-between mb-8">
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

                <div className="text-left">
                    <p className="text-xs text-slate-400 font-bold mb-0.5">النقاط</p>
                    <div className="flex items-center gap-1">
                        <Star size={16} className="text-amber-400 fill-amber-400" />
                        <span className="text-xl font-black text-slate-900">{progress.points_earned}</span>
                    </div>
                </div>
            </div>

            {/* Main Circular Progress */}
            <div className="flex justify-center mb-10">
                <div className="w-48 h-48 relative">
                    <CircularProgressbarWithChildren
                        value={progress.percentage}
                        styles={buildStyles({
                            pathColor: levelColor,
                            trailColor: '#F1F5F9', // Slate-100
                            strokeLinecap: 'round',
                            pathTransitionDuration: 1.5,
                        })}
                    >
                        <div className="text-center">
                            <p className="text-sm text-slate-400 font-bold mb-1">الإنجاز العام</p>
                            <h2 className="text-5xl font-black text-slate-800 tracking-tight">{progress.percentage}%</h2>
                            {progress.percentage >= 100 && (
                                <span className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                                    مكتمل!
                                </span>
                            )}
                        </div>
                    </CircularProgressbarWithChildren>

                    {/* Decorative Blur */}
                    <div
                        className="absolute inset-0 rounded-full blur-3xl -z-10 opacity-30"
                        style={{ backgroundColor: levelColor }}
                    ></div>
                </div>
            </div>

            {/* Streak / Next Milestone */}
            <div className="mb-8 p-5 bg-slate-50 rounded-3xl border border-slate-100">
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
            <div className="grid grid-cols-3 gap-3">
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
        <div className="flex flex-col items-center justify-center p-3 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center mb-2`}>
                <Icon size={14} className={color} />
            </div>
            <div className="text-lg font-black text-slate-800 leading-none mb-1">
                {value}<span className="text-[10px] text-slate-400 font-meduim ml-0.5">{subLabel}</span>
            </div>
            <p className="text-[10px] text-slate-500 font-bold">{label}</p>
        </div>
    );
}
