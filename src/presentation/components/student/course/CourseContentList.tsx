import { useState } from 'react';
import { ChevronDown, FolderOpen } from 'lucide-react';
import { Unit } from '../../../../data/api/studentCourseService';
import { getLocalizedName } from '../../../../data/api/studentService';
import { LectureItem } from './LectureItem';
import { QuizItem } from './QuizItem';
import { useLanguage } from '../../../hooks';

interface CourseContentListProps {
    units: Unit[];
    courseId: string;
}

export function CourseContentList({ units, courseId }: CourseContentListProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
                    <FolderOpen size={30} className="text-[#C41E3A]" />
                </div>
                <div>
                    <h2 className="text-3xl lg:text-4xl font-black text-slate-900">محتوى المادة</h2>
                    <p className="text-slate-400 font-bold text-lg mt-1">{units.length} وحدات تدريبية</p>
                </div>
            </div>

            <div className="space-y-4">
                {units.map((unit, index) => (
                    <UnitAccordion key={unit.id} unit={unit} index={index} courseId={courseId} />
                ))}

                {units.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 opacity-50">
                            <FolderOpen size={40} className="text-slate-300" />
                        </div>
                        <p className="text-slate-400 text-xl font-black">لا يوجد محتوى متاح حالياً</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function UnitAccordion({ unit, index, courseId }: { unit: Unit; index: number; courseId: string }) {
    const [isOpen, setIsOpen] = useState(index === 0);
    const { isRTL } = useLanguage();

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-50 overflow-hidden shadow-sm transition-all duration-500 hover:shadow-md">
            {/* Header */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 lg:p-8 hover:bg-slate-50/50 transition-colors"
            >
                <div className="flex items-center gap-5">
                    <div className={`
             w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm
             ${isOpen ? 'bg-[#C41E3A] text-white' : 'bg-slate-100 text-slate-500'}
             transition-colors duration-300
          `}>
                        {index + 1}
                    </div>
                    <div className="text-right">
                        <h3 className={`text-xl lg:text-2xl font-black ${isOpen ? 'text-slate-900' : 'text-slate-600'} transition-colors`}>
                            {getLocalizedName(unit.title, 'Unit')}
                        </h3>
                        <p className="text-slate-400 font-bold text-sm mt-1">
                            {unit.items.length} دروس
                        </p>
                    </div>
                </div>

                <div className={`p-4 rounded-full bg-slate-50 text-slate-400 transition-all duration-300 ${isOpen ? 'rotate-180 bg-red-50 text-[#C41E3A]' : ''}`}>
                    <ChevronDown size={24} strokeWidth={3} />
                </div>
            </button>

            {/* Content */}
            <div className={`
        grid transition-all duration-500 ease-in-out
        ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}
      `}>
                <div className="overflow-hidden">
                    <div className="p-6 lg:p-8 pt-0 space-y-4 border-t border-slate-50/50 bg-slate-50/30">
                        {unit.items.length > 0 ? (
                            unit.items.map(item => (
                                item.item_type === 'lecture' ? (
                                    <LectureItem key={`lec-${item.id}`} lecture={item} courseId={courseId} />
                                ) : (
                                    <QuizItem key={`quiz-${item.id}`} quiz={item} />
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
