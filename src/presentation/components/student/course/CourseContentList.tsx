import { useState } from 'react';
import { ChevronDown, FolderOpen } from 'lucide-react';
import { Unit } from '../../../../data/api/studentCourseService';
import { getLocalizedName } from '../../../../data/api/studentService';
import { LectureItem } from './LectureItem';
import { QuizItem } from './QuizItem';
import { useLanguage } from '../../../hooks';
import { useLocation } from 'react-router-dom';

interface CourseContentListProps {
    units: Unit[];
    courseId: string;
    isSubscribed?: boolean;
}

export function CourseContentList({ units, courseId, isSubscribed = false }: CourseContentListProps) {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const openLectureIdRaw = queryParams.get('open_lecture');
    const openLectureId = openLectureIdRaw ? parseInt(openLectureIdRaw, 10) : null;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-50 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
                    <FolderOpen className="text-[#C41E3A] w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight">محتوى المادة</h2>
                    <p className="text-slate-400 font-bold text-sm sm:text-lg mt-0.5 sm:mt-1">{units.length} وحدات تدريبية</p>
                </div>
            </div>

            <div className="space-y-4">
                {units.map((unit, index) => {
                    const hasTargetLecture = openLectureId ? unit.items.some(item => item.item_type === 'lecture' && item.id === openLectureId) : false;
                    return (
                        <UnitAccordion
                            key={unit.id}
                            unit={unit}
                            index={index}
                            courseId={courseId}
                            isSubscribed={isSubscribed}
                            defaultOpen={hasTargetLecture || (!openLectureId && index === 0)}
                            openLectureId={openLectureId}
                        />
                    );
                })}

                {units.length === 0 && (
                    <div className="text-center py-12 sm:py-20 bg-white rounded-3xl sm:rounded-[3rem] border border-dashed border-slate-200">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 opacity-50">
                            <FolderOpen className="text-slate-300 w-8 h-8 sm:w-10 sm:h-10" />
                        </div>
                        <p className="text-slate-400 text-lg sm:text-xl font-black">لا يوجد محتوى متاح حالياً</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function UnitAccordion({ unit, index, courseId, isSubscribed, defaultOpen, openLectureId }: { unit: Unit; index: number; courseId: string; isSubscribed: boolean; defaultOpen: boolean; openLectureId: number | null }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const { isRTL } = useLanguage();

    return (
        <div className="bg-white rounded-3xl sm:rounded-[2.5rem] border border-slate-50 overflow-hidden shadow-sm transition-all duration-500 hover:shadow-md">
            {/* Header */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 sm:p-6 lg:p-8 hover:bg-slate-50/50 transition-colors text-right"
            >
                <div className="flex flex-row items-center gap-3 sm:gap-5 flex-1 pr-2 sm:pr-0">
                    <div className={`
             w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-lg sm:text-xl shadow-sm
             ${isOpen ? 'bg-[#C41E3A] text-white' : 'bg-slate-100 text-slate-500'}
             transition-colors duration-300
          `}>
                        {index + 1}
                    </div>
                    <div>
                        <h3 className={`text-lg sm:text-xl lg:text-2xl font-black ${isOpen ? 'text-slate-900' : 'text-slate-600'} transition-colors leading-tight line-clamp-2`}>
                            {getLocalizedName(unit.title, 'Unit')}
                        </h3>
                        <p className="text-slate-400 font-bold text-xs sm:text-sm mt-0.5 sm:mt-1">
                            {unit.items.length} دروس
                        </p>
                    </div>
                </div>

                <div className={`p-2 sm:p-4 shrink-0 rounded-full bg-slate-50 text-slate-400 transition-all duration-300 ${isOpen ? 'rotate-180 bg-red-50 text-[#C41E3A]' : ''}`}>
                    <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3} />
                </div>
            </button>

            {/* Content */}
            <div className={`
        grid transition-all duration-500 ease-in-out
        ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}
      `}>
                <div className="overflow-hidden">
                    <div className="p-4 sm:p-6 lg:p-8 pt-0 space-y-3 sm:space-y-4 border-t border-slate-50/50 bg-slate-50/30">
                        {unit.items.length > 0 ? (
                            unit.items.map(item => (
                                item.item_type === 'lecture' ? (
                                    <LectureItem
                                        key={`lec-${item.id}`}
                                        lecture={item}
                                        courseId={courseId}
                                        isSubscribed={isSubscribed}
                                        isHighlighted={openLectureId === item.id}
                                    />
                                ) : (
                                    <QuizItem
                                        key={`quiz-${item.id}`}
                                        quiz={item}
                                        isSubscribed={isSubscribed}
                                        isUnitQuiz={true}
                                    />
                                )
                            ))
                        ) : (
                            <p className="text-center py-8 text-slate-400 font-medium">لا توجد دروس في هذه الوحدة</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
