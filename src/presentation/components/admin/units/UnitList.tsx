/**
 * UnitList Component
 * 
 * Drag-and-drop sortable list of units using @dnd-kit.
 * Supports:
 * 1. Unit reordering (drag units to change order)
 * 2. Lecture reordering (drag lectures within a unit)
 * 3. Lecture moving (drag lecture to different unit)
 */

import React, { useState, useMemo } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverEvent,
    DragStartEvent,
    DragOverlay,
    pointerWithin,
    rectIntersection,
    CollisionDetection,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { UnitCard } from './UnitCard';
import { SortableLecture } from './SortableLecture';
import type { Unit, UnitLecture } from '../../../../types/unit';
import { Layers, Plus, Video, GripVertical } from 'lucide-react';

interface UnitListProps {
    units: Unit[];
    onReorder: (orderedIds: number[]) => void;
    onReorderLectures: (unitId: number, orderedIds: number[]) => void;
    onMoveLecture: (lectureId: number, targetUnitId: number, order?: number) => void;
    onEdit: (unit: Unit) => void;
    onDelete: (unit: Unit) => void;
    onTogglePublish: (unit: Unit) => void;
    onAddLecture?: (unit: Unit) => void;
    onEditLecture?: (lecture: UnitLecture) => void;
    onDeleteLecture?: (lecture: UnitLecture) => void;
    onTogglePublishLecture?: (lecture: UnitLecture) => void;
    onAddUnit: () => void;
    deletingId?: number | null;
    togglingPublishId?: number | null;
    isLoading?: boolean;
}

// Custom collision detection for handling both units and lectures
const customCollisionDetection: CollisionDetection = (args) => {
    // First, try pointer within for precision
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
        return pointerCollisions;
    }
    // Fall back to rect intersection
    return rectIntersection(args);
};

// Helper to get localized name
const getLocalizedTitle = (title: { ar?: string; en?: string } | string): string => {
    if (typeof title === 'string') return title;
    return title?.ar || title?.en || 'بدون عنوان';
};

export function UnitList({
    units,
    onReorder,
    onReorderLectures,
    onMoveLecture,
    onEdit,
    onDelete,
    onTogglePublish,
    onAddLecture,
    onEditLecture,
    onDeleteLecture,
    onTogglePublishLecture,
    onAddUnit,
    deletingId,
    togglingPublishId,
    isLoading,
}: UnitListProps) {
    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
    const [activeItem, setActiveItem] = useState<{ type: 'unit' | 'lecture'; data: Unit | UnitLecture; unitId?: number } | null>(null);
    const [dropTargetUnitId, setDropTargetUnitId] = useState<number | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Build all sortable IDs (units + all lectures)
    const allIds = useMemo(() => {
        const ids: (number | string)[] = units.map(u => u.id);
        units.forEach(unit => {
            if (unit.lectures) {
                unit.lectures.forEach(lecture => {
                    ids.push(`lecture-${lecture.id}`);
                });
            }
        });
        return ids;
    }, [units]);

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const activeData = active.data.current;

        if (activeData?.type === 'unit') {
            setActiveItem({ type: 'unit', data: activeData.unit });
        } else if (activeData?.type === 'lecture') {
            setActiveItem({ type: 'lecture', data: activeData.lecture, unitId: activeData.unitId });
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { over } = event;

        if (over?.data.current?.type === 'unit-drop-zone') {
            setDropTargetUnitId(over.data.current.unitId);
        } else {
            setDropTargetUnitId(null);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        setActiveItem(null);
        setDropTargetUnitId(null);

        if (!over) return;

        const activeData = active.data.current;
        const overData = over.data.current;

        // Case 1: Unit reordering
        if (activeData?.type === 'unit' && typeof active.id === 'number') {
            if (over.id !== active.id && typeof over.id === 'number') {
                const oldIndex = units.findIndex((u) => u.id === active.id);
                const newIndex = units.findIndex((u) => u.id === over.id);
                if (oldIndex !== -1 && newIndex !== -1) {
                    const newOrder = arrayMove(units, oldIndex, newIndex);
                    onReorder(newOrder.map((u) => u.id));
                }
            }
            return;
        }

        // Case 2: Lecture operations
        if (activeData?.type === 'lecture') {
            const lectureId = (activeData.lecture as UnitLecture).id;
            const sourceUnitId = activeData.unitId;

            // Case 2a: Moving lecture to a different unit (drop zone)
            if (overData?.type === 'unit-drop-zone') {
                const targetUnitId = overData.unitId;
                if (sourceUnitId !== targetUnitId) {
                    onMoveLecture(lectureId, targetUnitId);
                }
                return;
            }

            // Case 2b: Lecture reordering within same unit
            if (overData?.type === 'lecture') {
                const overLectureId = (overData.lecture as UnitLecture).id;
                const targetUnitId = overData.unitId;

                if (sourceUnitId === targetUnitId) {
                    // Same unit - reorder
                    const unit = units.find(u => u.id === sourceUnitId);
                    if (unit?.lectures) {
                        const oldIndex = unit.lectures.findIndex(l => l.id === lectureId);
                        const newIndex = unit.lectures.findIndex(l => l.id === overLectureId);
                        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                            const newOrder = arrayMove(unit.lectures, oldIndex, newIndex);
                            onReorderLectures(sourceUnitId, newOrder.map(l => l.id));
                        }
                    }
                } else {
                    // Different unit - move to specific position
                    const targetUnit = units.find(u => u.id === targetUnitId);
                    if (targetUnit?.lectures) {
                        const targetIndex = targetUnit.lectures.findIndex(l => l.id === overLectureId);
                        onMoveLecture(lectureId, targetUnitId, targetIndex + 1);
                    }
                }
            }
        }
    };

    const toggleExpand = (unitId: number) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(unitId)) {
                next.delete(unitId);
            } else {
                next.add(unitId);
            }
            return next;
        });
    };

    const expandAll = () => {
        setExpandedIds(new Set(units.map((u) => u.id)));
    };

    const collapseAll = () => {
        setExpandedIds(new Set());
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    // Empty state
    if (units.length === 0) {
        return (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <Layers size={48} className="mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">
                    لا توجد وحدات
                </h3>
                <p className="text-slate-500 mb-6">
                    ابدأ بإضافة وحدات لتنظيم محاضرات الكورس
                </p>
                <button
                    onClick={onAddUnit}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-shibl-crimson text-white rounded-xl font-medium hover:bg-shibl-crimson/90 transition-colors shadow-lg shadow-shibl-crimson/30"
                >
                    <Plus size={20} />
                    إضافة وحدة جديدة
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        onClick={expandAll}
                        className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        توسيع الكل
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                        onClick={collapseAll}
                        className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        طي الكل
                    </button>
                </div>
                <button
                    onClick={onAddUnit}
                    className="flex items-center gap-2 px-4 py-2 bg-shibl-crimson text-white rounded-xl font-medium hover:bg-shibl-crimson/90 transition-colors shadow-md shadow-shibl-crimson/20"
                >
                    <Plus size={18} />
                    إضافة وحدة
                </button>
            </div>

            {/* Drag-Drop Context */}
            <DndContext
                sensors={sensors}
                collisionDetection={customCollisionDetection}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={units.map((u) => u.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-3">
                        {units.map((unit) => (
                            <UnitCard
                                key={unit.id}
                                unit={unit}
                                isExpanded={expandedIds.has(unit.id)}
                                onToggleExpand={() => toggleExpand(unit.id)}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onTogglePublish={onTogglePublish}
                                onAddLecture={onAddLecture}
                                onEditLecture={onEditLecture}
                                onDeleteLecture={onDeleteLecture}
                                onTogglePublishLecture={onTogglePublishLecture}
                                isDeleting={deletingId === unit.id}
                                isTogglingPublish={togglingPublishId === unit.id}
                                isDropTarget={dropTargetUnitId === unit.id}
                            />
                        ))}
                    </div>
                </SortableContext>

                {/* Drag Overlay */}
                <DragOverlay>
                    {activeItem?.type === 'unit' && (
                        <div className="bg-white rounded-xl border-2 border-shibl-crimson shadow-2xl p-4 opacity-90">
                            <div className="flex items-center gap-3">
                                <GripVertical size={20} className="text-slate-400" />
                                <span className="font-semibold text-slate-800">
                                    {getLocalizedTitle((activeItem.data as Unit).title)}
                                </span>
                            </div>
                        </div>
                    )}
                    {activeItem?.type === 'lecture' && (
                        <div className="bg-white rounded-lg border-2 border-shibl-crimson shadow-2xl p-3 opacity-90">
                            <div className="flex items-center gap-3">
                                <GripVertical size={14} className="text-slate-400" />
                                <Video size={16} className="text-shibl-crimson" />
                                <span className="text-sm text-slate-700">
                                    {getLocalizedTitle((activeItem.data as UnitLecture).title)}
                                </span>
                            </div>
                        </div>
                    )}
                </DragOverlay>
            </DndContext>

            {/* Instructions */}
            <div className="text-center text-xs text-slate-400 mt-4">
                <span className="inline-flex items-center gap-1">
                    <GripVertical size={12} />
                    اسحب الوحدات أو المحاضرات لإعادة ترتيبها أو نقلها
                </span>
            </div>
        </div>
    );
}

export default UnitList;
