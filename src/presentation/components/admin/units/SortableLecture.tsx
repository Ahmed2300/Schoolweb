/**
 * SortableLecture Component
 * 
 * Draggable lecture item within a unit. Supports:
 * - Drag within same unit (reorder)
 * - Drag to different unit (move)
 */

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Video, Pencil, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import type { UnitLecture } from '../../../../types/unit';

// Helper to get localized name - handles both objects and JSON strings
const getLocalizedTitle = (title: { ar?: string; en?: string } | string | undefined): string => {
    if (!title) return 'بدون عنوان';

    // If it's already a string, try to parse it as JSON
    if (typeof title === 'string') {
        try {
            const parsed = JSON.parse(title);
            if (typeof parsed === 'object' && parsed !== null) {
                return parsed.ar || parsed.en || title;
            }
            return title;
        } catch {
            // Not JSON, return as-is
            return title;
        }
    }

    // It's an object
    return title.ar || title.en || 'بدون عنوان';
};

interface SortableLectureProps {
    lecture: UnitLecture;
    index: number;
    unitId: number;
    onEdit?: (lecture: UnitLecture) => void;
    onDelete?: (lecture: UnitLecture) => void;
    onTogglePublish?: (lecture: UnitLecture) => Promise<void> | void;
}

export function SortableLecture({
    lecture,
    index,
    unitId,
    onEdit,
    onDelete,
    onTogglePublish
}: SortableLectureProps) {
    const [isToggling, setIsToggling] = useState(false);

    const handleToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!onTogglePublish || isToggling) return;

        setIsToggling(true);
        try {
            await onTogglePublish(lecture);
        } finally {
            setIsToggling(false);
        }
    };

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: `lecture-${lecture.id}`,
        data: {
            type: 'lecture',
            lecture,
            unitId,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
                flex items-center gap-3 p-3 bg-white rounded-lg border transition-all group
                ${isDragging
                    ? 'border-shibl-crimson shadow-lg z-50 ring-2 ring-shibl-crimson/20'
                    : 'border-slate-200 hover:border-slate-300'
                }
            `}
        >
            {/* Drag Handle */}
            <button
                {...attributes}
                {...listeners}
                className="p-1 rounded text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing"
                aria-label="اسحب لإعادة الترتيب"
            >
                <GripVertical size={14} />
            </button>

            {/* Index Badge */}
            <span className="w-6 h-6 flex items-center justify-center text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                {index + 1}
            </span>

            {/* Video Icon */}
            <Video size={16} className={`flex-shrink-0 ${lecture.is_published ? 'text-shibl-crimson' : 'text-slate-400'}`} />

            {/* Title */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className={`text-sm truncate ${lecture.is_published ? 'text-slate-700' : 'text-slate-500'}`}>
                        {getLocalizedTitle(lecture.title)}
                    </span>
                    {!lecture.is_published && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-600 rounded">
                            مخفي
                        </span>
                    )}
                </div>
            </div>

            {/* Duration */}
            {lecture.duration_minutes && (
                <span className="text-xs text-slate-400 flex-shrink-0">
                    {lecture.duration_minutes} د
                </span>
            )}

            {/* Actions - Visible on Hover */}
            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                {onTogglePublish && (
                    <button
                        onClick={handleToggle}
                        disabled={isToggling}
                        className={`p-1.5 rounded transition-colors ${lecture.is_published ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`}
                        title={lecture.is_published ? 'إخفاء' : 'نشر'}
                    >
                        {isToggling ? (
                            <Loader2 size={14} className="animate-spin text-shibl-crimson" />
                        ) : (
                            lecture.is_published ? <Eye size={14} /> : <EyeOff size={14} />
                        )}
                    </button>
                )}
                {onEdit && (
                    <button
                        onClick={() => onEdit(lecture)}
                        className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="تعديل"
                    >
                        <Pencil size={14} />
                    </button>
                )}
                {onDelete && (
                    <button
                        onClick={() => onDelete(lecture)}
                        className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="حذف"
                    >
                        <Trash2 size={14} />
                    </button>
                )}
            </div>
        </div>

    );
}

export default SortableLecture;
