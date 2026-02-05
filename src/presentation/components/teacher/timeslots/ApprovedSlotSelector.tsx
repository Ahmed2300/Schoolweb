/**
 * ApprovedSlotSelector Component
 * 
 * Allows teachers to select from their approved slot requests
 * when creating a lecture. Shows only available approved slots
 * that haven't been assigned to a lecture yet.
 */

import { useMemo } from 'react';
import { Calendar, Clock, Loader2, AlertCircle, Plus, CheckCircle2, CalendarDays } from 'lucide-react';
import { useMyRequests } from '../../../hooks/useTeacherTimeSlots';
import { formatDate, formatTime } from '../../../../utils/timeUtils';
import type { SlotRequest } from '../../../../types/slotRequest';
import { SLOT_REQUEST_TYPES, DAYS_OF_WEEK } from '../../../../types/slotRequest';

interface ApprovedSlotSelectorProps {
    /** Currently selected slot request ID */
    selectedSlotId: number | null;
    /** Callback when a slot is selected */
    onSelect: (slot: SlotRequest | null) => void;
    /** Filter slots by grade ID (optional) */
    gradeId?: number;
    /** Callback to open add slot request dialog */
    onRequestNewSlot?: () => void;
}

export function ApprovedSlotSelector({
    selectedSlotId,
    onSelect,
    gradeId,
    onRequestNewSlot,
}: ApprovedSlotSelectorProps) {
    const { data: allRequests = [], isLoading, error } = useMyRequests();

    // Filter requests by status
    const { approvedSlots, pendingSlots } = useMemo(() => {
        const requests = allRequests;
        return {
            approvedSlots: requests.filter(r => r.status === 'approved'),
            pendingSlots: requests.filter(r => r.status === 'pending'),
        };
    }, [allRequests]);

    // Use all approved slots directly (requirement: show all teacher's slots regardless of grade match)
    const filteredSlots = approvedSlots;

    // Group slots by type for better organization
    const { weeklySlots, oneTimeSlots } = useMemo(() => {
        const weekly: SlotRequest[] = [];
        const oneTime: SlotRequest[] = [];

        filteredSlots.forEach(slot => {
            if (slot.type === SLOT_REQUEST_TYPES.WEEKLY) {
                weekly.push(slot);
            } else {
                oneTime.push(slot);
            }
        });

        // Sort weekly by day of week
        weekly.sort((a, b) => (a.day_of_week ?? 0) - (b.day_of_week ?? 0));
        // Sort one-time by date
        oneTime.sort((a, b) => {
            const dateA = a.specific_date || '';
            const dateB = b.specific_date || '';
            return dateA.localeCompare(dateB);
        });

        return { weeklySlots: weekly, oneTimeSlots: oneTime };
    }, [filteredSlots]);

    // Get day name in Arabic
    const getDayName = (dayOfWeek: number | null): string => {
        if (dayOfWeek === null) return '—';
        const day = DAYS_OF_WEEK.find(d => d.value === dayOfWeek);
        return day?.labelAr || '—';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8 text-slate-400">
                <Loader2 className="animate-spin mr-2" size={20} />
                <span>جارِ تحميل المواعيد...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-8 text-red-500 gap-2">
                <AlertCircle size={20} />
                <span>فشل تحميل المواعيد المتاحة</span>
            </div>
        );
    }

    if (filteredSlots.length === 0) {
        // Case A: Has Pending Requests -> "Wait for approval"
        if (pendingSlots.length > 0) {
            return (
                <div className="border-2 border-dashed border-amber-200 bg-amber-50/50 rounded-xl p-6 text-center">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3 text-amber-600">
                        <Clock size={24} />
                    </div>
                    <h4 className="text-amber-800 font-bold mb-1">يرجى الانتظار</h4>
                    <p className="text-amber-600 text-sm mb-0">
                        طلباتك للمواعيد قيد المراجعة حالياً من قبل الإدارة.<br />
                        سيتم إظهار المواعيد هنا فور اعتمادها.
                    </p>
                </div>
            );
        }

        // Case B: No Requests at all -> "Book your first slot"
        return (
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50/50">
                <div className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400 shadow-sm">
                    <Calendar size={24} />
                </div>
                <h4 className="text-slate-700 font-bold mb-1">لا توجد مواعيد محجوزة</h4>
                <p className="text-slate-500 text-sm mb-4">
                    لم تقم بحجز أي مواعيد بعد.
                </p>
                {onRequestNewSlot && (
                    <button
                        type="button"
                        onClick={onRequestNewSlot}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-lg shadow-blue-600/20 active:scale-95"
                    >
                        <Plus size={18} />
                        حجز أول موعد
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Weekly Slots Section */}
            {weeklySlots.length > 0 && (
                <div>
                    <h4 className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
                        <CalendarDays size={16} className="text-purple-500" />
                        المواعيد الأسبوعية المتكررة
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {weeklySlots.map(slot => (
                            <SlotCard
                                key={slot.id}
                                slot={slot}
                                isSelected={selectedSlotId === slot.id}
                                onSelect={() => onSelect(selectedSlotId === slot.id ? null : slot)}
                                label={getDayName(slot.day_of_week)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* One-Time Slots Section */}
            {oneTimeSlots.length > 0 && (
                <div>
                    <h4 className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
                        <Calendar size={16} className="text-blue-500" />
                        المواعيد لمرة واحدة
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {oneTimeSlots.map(slot => (
                            <SlotCard
                                key={slot.id}
                                slot={slot}
                                isSelected={selectedSlotId === slot.id}
                                onSelect={() => onSelect(selectedSlotId === slot.id ? null : slot)}
                                label={slot.specific_date ? formatDate(slot.specific_date) : '—'}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Request New Slot Link */}
            {onRequestNewSlot && (
                <button
                    type="button"
                    onClick={onRequestNewSlot}
                    className="w-full py-2 text-center text-sm text-shibl-crimson hover:text-shibl-crimson-dark transition flex items-center justify-center gap-2"
                >
                    <Plus size={16} />
                    طلب موعد إضافي
                </button>
            )}
        </div>
    );
}

// ==================== Slot Card Sub-component ====================

interface SlotCardProps {
    slot: SlotRequest;
    isSelected: boolean;
    onSelect: () => void;
    label: string;
}

function SlotCard({ slot, isSelected, onSelect, label }: SlotCardProps) {
    return (
        <button
            type="button"
            onClick={onSelect}
            className={`
                relative flex items-center gap-3 p-3 rounded-xl border transition-all text-right w-full
                ${isSelected
                    ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-200'
                    : 'bg-white border-slate-200 hover:border-purple-200 hover:bg-slate-50'
                }
            `}
        >
            {/* Selection indicator */}
            <div
                className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                    ${isSelected
                        ? 'bg-purple-600 border-purple-600 text-white'
                        : 'border-slate-300 bg-white'
                    }
                `}
            >
                {isSelected && <CheckCircle2 size={12} />}
            </div>

            {/* Slot Info */}
            <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-800 truncate">{label}</div>
                <div className="flex items-center gap-1 text-sm text-slate-500 dir-ltr">
                    <Clock size={12} />
                    <span>{formatTime(slot.start_time)} - {formatTime(slot.end_time)}</span>
                </div>
            </div>

            {/* Grade badge */}
            {slot.grade && (
                <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full whitespace-nowrap">
                    {slot.grade.name || '—'}
                </span>
            )}
        </button>
    );
}

export default ApprovedSlotSelector;
