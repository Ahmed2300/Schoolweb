/**
 * UnitCard Component
 * 
 * Collapsible card representing a unit with nested draggable lectures.
 * Supports drag handle for reordering and actions for edit/delete.
 * Enhanced with @dnd-kit for lecture reordering and cross-unit moving.
 */

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    ChevronDown,
    ChevronLeft,
    GripVertical,
    Pencil,
    Trash2,
    Eye,
    EyeOff,
    Loader2,
} from 'lucide-react';
import { DroppableLectureZone } from './DroppableLectureZone';
import type { Unit, UnitLecture } from '../../../../types/unit';

// Helper to get localized name
const getLocalizedTitle = (title: { ar?: string; en?: string } | string): string => {
    if (typeof title === 'string') return title;
    return title?.ar || title?.en || 'بدون عنوان';
};

interface UnitCardProps {
    unit: Unit;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onEdit: (unit: Unit) => void;
    onDelete: (unit: Unit) => void;
    onTogglePublish: (unit: Unit) => void;
    onAddLecture?: (unit: Unit) => void;
    onEditLecture?: (lecture: UnitLecture) => void;
    onDeleteLecture?: (lecture: UnitLecture) => void;
    onTogglePublishLecture?: (lecture: UnitLecture) => void;
    isDeleting?: boolean;
    isTogglingPublish?: boolean;
    isDropTarget?: boolean;
}

export function UnitCard({
    unit,
    isExpanded,
    onToggleExpand,
    onEdit,
    onDelete,
    onTogglePublish,
    onAddLecture,
    onEditLecture,
    onDeleteLecture,
    onTogglePublishLecture,
    isDeleting,
    isTogglingPublish,
    isDropTarget,
}: UnitCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: unit.id,
        data: {
            type: 'unit',
            unit,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const lectureCount = unit.lectures_count ?? unit.lectures?.length ?? 0;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
                bg-white rounded-xl border-2 transition-all duration-200
                ${isDragging ? 'border-shibl-crimson shadow-xl z-50' : 'border-slate-200 hover:border-slate-300'}
                ${!unit.is_published ? 'bg-slate-50' : ''}
                ${isDropTarget ? 'ring-2 ring-shibl-crimson/30 border-shibl-crimson/50' : ''}
            `}
        >
            {/* Header */}
            <div className="flex items-center gap-3 p-4">
                {/* Drag Handle */}
                <button
                    {...attributes}
                    {...listeners}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-grab active:cursor-grabbing"
                    aria-label="اسحب لإعادة الترتيب"
                >
                    <GripVertical size={20} />
                </button>

                {/* Expand/Collapse */}
                <button
                    onClick={onToggleExpand}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    aria-label={isExpanded ? 'طي' : 'توسيع'}
                >
                    {isExpanded ? <ChevronDown size={20} /> : <ChevronLeft size={20} />}
                </button>

                {/* Unit Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-800 truncate">
                            {getLocalizedTitle(unit.title)}
                        </h3>
                        {!unit.is_published && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                                مخفي
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-slate-500">
                        {lectureCount} محاضرة
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                    {/* Toggle Publish */}
                    <button
                        onClick={() => onTogglePublish(unit)}
                        disabled={isTogglingPublish}
                        className={`
                            p-2 rounded-lg transition-colors
                            ${unit.is_published
                                ? 'text-emerald-600 hover:bg-emerald-50'
                                : 'text-slate-400 hover:bg-slate-100'
                            }
                            disabled:opacity-50
                        `}
                        title={unit.is_published ? 'إخفاء الوحدة' : 'نشر الوحدة'}
                        aria-label={unit.is_published ? 'إخفاء الوحدة' : 'نشر الوحدة'}
                    >
                        {isTogglingPublish ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : unit.is_published ? (
                            <Eye size={18} />
                        ) : (
                            <EyeOff size={18} />
                        )}
                    </button>

                    {/* Edit */}
                    <button
                        onClick={() => onEdit(unit)}
                        className="p-2 rounded-lg text-slate-500 hover:text-shibl-crimson hover:bg-shibl-crimson/10 transition-colors"
                        title="تعديل الوحدة"
                        aria-label="تعديل الوحدة"
                    >
                        <Pencil size={18} />
                    </button>

                    {/* Delete */}
                    <button
                        onClick={() => onDelete(unit)}
                        disabled={isDeleting}
                        className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="حذف الوحدة"
                        aria-label="حذف الوحدة"
                    >
                        {isDeleting ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Trash2 size={18} />
                        )}
                    </button>
                </div>
            </div>

            {/* Lectures List (Expanded) with Drag-Drop */}
            {isExpanded && (
                <DroppableLectureZone
                    unitId={unit.id}
                    lectures={unit.lectures || []}
                    onAddLecture={onAddLecture ? () => onAddLecture(unit) : undefined}
                    onEditLecture={onEditLecture}
                    onDeleteLecture={onDeleteLecture}
                    onTogglePublishLecture={onTogglePublishLecture}
                    isOver={isDropTarget}
                />
            )}
        </div>
    );
}

export default UnitCard;
