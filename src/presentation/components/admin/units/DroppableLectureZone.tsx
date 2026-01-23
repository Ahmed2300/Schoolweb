/**
 * DroppableLectureZone Component
 * 
 * Drop zone for lectures within a unit.
 * Used for moving lectures between units.
 */

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableLecture } from './SortableLecture';
import { Video, Plus, ArrowDownToLine } from 'lucide-react';
import type { UnitLecture } from '../../../../types/unit';

interface DroppableLectureZoneProps {
    unitId: number;
    lectures: UnitLecture[];
    onAddLecture?: () => void;
    onEditLecture?: (lecture: UnitLecture) => void;
    onDeleteLecture?: (lecture: UnitLecture) => void;
    onTogglePublishLecture?: (lecture: UnitLecture) => void;
    isOver?: boolean;
}

export function DroppableLectureZone({
    unitId,
    lectures,
    onAddLecture,
    onEditLecture,
    onDeleteLecture,
    onTogglePublishLecture,
    isOver,
}: DroppableLectureZoneProps) {
    const { setNodeRef, isOver: dropIsOver } = useDroppable({
        id: `unit-drop-${unitId}`,
        data: {
            type: 'unit-drop-zone',
            unitId,
        },
    });

    const showDropIndicator = isOver || dropIsOver;

    return (
        <div
            ref={setNodeRef}
            className={`
                border-t border-slate-100 p-4 transition-all duration-200
                ${showDropIndicator
                    ? 'bg-shibl-crimson/5 border-shibl-crimson/20'
                    : 'bg-slate-50/50'
                }
            `}
        >
            {/* Drop Indicator */}
            {showDropIndicator && (
                <div className="flex items-center justify-center gap-2 mb-3 p-2 bg-shibl-crimson/10 rounded-lg border-2 border-dashed border-shibl-crimson/30">
                    <ArrowDownToLine size={16} className="text-shibl-crimson" />
                    <span className="text-sm font-medium text-shibl-crimson">
                        أفلت هنا لنقل المحاضرة
                    </span>
                </div>
            )}

            {/* Lectures List */}
            {lectures.length > 0 ? (
                <SortableContext
                    items={lectures.map(l => `lecture-${l.id}`)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-2">
                        {lectures.map((lecture, index) => (
                            <SortableLecture
                                key={lecture.id}
                                lecture={lecture}
                                index={index}
                                unitId={unitId}
                                onEdit={onEditLecture}
                                onDelete={onDeleteLecture}
                                onTogglePublish={onTogglePublishLecture}
                            />
                        ))}
                    </div>
                </SortableContext>
            ) : (
                <div className="text-center py-6 text-slate-400">
                    <Video size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">لا توجد محاضرات في هذه الوحدة</p>
                </div>
            )}

            {/* Add Lecture Button */}
            {onAddLecture && (
                <button
                    onClick={onAddLecture}
                    className="mt-3 w-full flex items-center justify-center gap-2 p-2 text-sm text-shibl-crimson hover:bg-shibl-crimson/5 rounded-lg border-2 border-dashed border-slate-200 hover:border-shibl-crimson/30 transition-colors"
                >
                    <Plus size={16} />
                    إضافة محاضرة
                </button>
            )}
        </div>
    );
}

export default DroppableLectureZone;
