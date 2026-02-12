import {
    BookOpen,
    Users,
    Edit,
    Eye,
    Trash2,
    Clock,
    GraduationCap,
    Layers,
    MoreVertical
} from 'lucide-react';
import { TeacherCourse, getCourseName, getCourseDescription, getLocalizedName } from '../../../../data/api';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CourseCardProps {
    course: TeacherCourse;
    onView?: (id: number) => void;
    onEdit?: (id: number) => void;
    onDelete?: (id: number) => void;
    hasPendingRequest?: boolean;
}

export function TeacherCourseCard({ course, onView, onEdit, onDelete, hasPendingRequest }: CourseCardProps) {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);

    // Determine status
    const status: 'active' | 'draft' | 'archived' = course.is_active ? 'active' : 'draft';

    const statusStyles = {
        active: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-900/30', label: 'نشط' },
        draft: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-900/30', label: 'مسودة' },
        archived: { bg: 'bg-slate-50 dark:bg-white/5', text: 'text-slate-600 dark:text-gray-400', border: 'border-slate-200 dark:border-white/10', label: 'مؤرشف' },
    };

    const { bg, text, border, label } = statusStyles[status];
    const courseName = getCourseName(course.name);
    const courseDescription = getCourseDescription(course.description);
    const imageUrl = course.image_path ? course.image_path : null;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative bg-white dark:bg-[#1E1E1E] rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm dark:shadow-none hover:shadow-lg dark:hover:border-white/10 hover:border-shibl-crimson/20 transition-all duration-300 overflow-hidden flex flex-col h-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Image Container */}
            <div className="relative h-48 w-full overflow-hidden bg-slate-50 dark:bg-[#121212]">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={courseName}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#1E1E1E] dark:to-[#121212]">
                        <BookOpen className="w-12 h-12 text-slate-300/50 dark:text-white/10" />
                    </div>
                )}

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                {/* Status Badges */}
                <div className="absolute top-3 right-3 flex gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-md shadow-sm ${bg} ${text} ${border} border bg-opacity-90`}>
                        {label}
                    </span>
                </div>

                {/* Pending Request Badge */}
                {hasPendingRequest && (
                    <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/90 text-white backdrop-blur-md shadow-sm flex items-center gap-1.5 border border-amber-400/50">
                            <Clock size={12} />
                            طلب معلق
                        </span>
                    </div>
                )}

                {/* Action Buttons (Visible on Hover / Focus) */}
                <div className="absolute bottom-3 right-3 left-3 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 translate-y-2 group-hover:translate-y-0">
                    <button
                        onClick={(e) => { e.stopPropagation(); onView?.(course.id); }}
                        className="h-9 px-4 rounded-lg bg-white/95 dark:bg-[#1E1E1E]/95 backdrop-blur text-charcoal dark:text-white text-xs font-bold hover:bg-shibl-crimson hover:text-white transition-colors shadow-lg flex items-center gap-2"
                    >
                        <Eye size={14} />
                        عرض
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit?.(course.id); }}
                        className="h-9 w-9 rounded-lg bg-white/95 dark:bg-[#1E1E1E]/95 backdrop-blur text-slate-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-lg flex items-center justify-center"
                        title="تعديل"
                    >
                        <Edit size={14} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete?.(course.id); }}
                        className="h-9 w-9 rounded-lg bg-white/95 dark:bg-[#1E1E1E]/95 backdrop-blur text-slate-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors shadow-lg flex items-center justify-center"
                        title="حذف"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {/* Content Body */}
            <div className="p-5 flex flex-col flex-1">
                <div className="mb-4">
                    <h3
                        className="text-lg font-bold text-charcoal dark:text-white mb-2 leading-relaxed line-clamp-1 group-hover:text-shibl-crimson dark:group-hover:text-shibl-crimson-400 transition-colors cursor-pointer"
                        onClick={() => onView?.(course.id)}
                    >
                        {courseName}
                    </h3>
                    <p className="text-slate-500 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed h-10">
                        {courseDescription || 'لا يوجد وصف متاح للدورة حالياً.'}
                    </p>
                </div>

                {/* Meta Tags */}
                <div className="flex flex-wrap gap-2 mb-4 mt-auto">
                    {course.grade && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 dark:bg-white/5 border border-slate-100/50 dark:border-white/5 text-slate-600 dark:text-gray-300 text-[11px] font-medium">
                            <GraduationCap size={12} className="text-slate-400 dark:text-gray-400" />
                            <span className="truncate max-w-[100px]">{getLocalizedName(course.grade.name)}</span>
                        </div>
                    )}
                    {course.semester && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 dark:bg-white/5 border border-slate-100/50 dark:border-white/5 text-slate-600 dark:text-gray-300 text-[11px] font-medium">
                            <Layers size={12} className="text-slate-400 dark:text-gray-400" />
                            <span className="truncate max-w-[100px]">{getLocalizedName(course.semester.name)}</span>
                        </div>
                    )}
                </div>

                {/* Footer Stats */}
                <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-gray-400">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5" title="عدد الطلاب">
                            <Users size={14} className="text-slate-400" />
                            <span>{course.students_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="عدد المحاضرات">
                            <BookOpen size={14} className="text-slate-400 dark:text-gray-400" />
                            <span>{course.lectures_count || 0}</span>
                        </div>
                    </div>
                    {/* Optional: Add creation date or other meta here */}
                </div>
            </div>
        </motion.div>
    );
}

export function CourseCardSkeleton() {
    return (
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden h-[380px] flex flex-col">
            <div className="h-48 bg-slate-100 dark:bg-white/5 animate-pulse relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent skew-x-12 translate-x-[-100%] animate-shimmer" />
            </div>
            <div className="p-5 flex-1 flex flex-col space-y-4">
                <div className="space-y-2">
                    <div className="h-6 w-3/4 bg-slate-100 dark:bg-white/5 rounded-md animate-pulse" />
                    <div className="h-4 w-full bg-slate-50 dark:bg-white/5 rounded-md animate-pulse" />
                    <div className="h-4 w-2/3 bg-slate-50 dark:bg-white/5 rounded-md animate-pulse" />
                </div>
                <div className="flex gap-2 mt-auto pt-4">
                    <div className="h-6 w-16 bg-slate-100 dark:bg-white/5 rounded-md animate-pulse" />
                    <div className="h-6 w-16 bg-slate-100 dark:bg-white/5 rounded-md animate-pulse" />
                </div>
                <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-between">
                    <div className="h-4 w-12 bg-slate-100 dark:bg-white/5 rounded animate-pulse" />
                    <div className="h-4 w-12 bg-slate-100 dark:bg-white/5 rounded animate-pulse" />
                </div>
            </div>
        </div>
    );
}

export default TeacherCourseCard;
