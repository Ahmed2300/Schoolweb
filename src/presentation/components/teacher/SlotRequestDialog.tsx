/**
 * SlotRequestDialog Component
 * 
 * Modal dialog for teachers to request additional time slots.
 * Features:
 * - Request type toggle (Weekly / One-time)
 * - Grade selection from assigned grades
 * - Day/Date picker based on type
 * - Time range selector
 * - Optional notes
 */

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Loader2, Plus, CalendarDays, Repeat } from 'lucide-react';
import { useSlotRequests } from '../../../hooks/useSlotRequests';
import type {
    SlotRequestFormState,
    DayOfWeek,
} from '../../../types/slotRequest';
import { DAYS_OF_WEEK, SLOT_REQUEST_TYPES } from '../../../types/slotRequest';

// ==================== TYPES ====================

interface Grade {
    id: number;
    name: string;
}

interface SlotRequestDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    /** List of grades assigned to this teacher */
    grades?: Grade[];
}

// ==================== TIME OPTIONS ====================

const TIME_OPTIONS = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00',
];

// ==================== COMPONENT ====================

export function SlotRequestDialog({ open, onClose, onSuccess, grades = [] }: SlotRequestDialogProps) {
    const { createRequest, isCreating } = useSlotRequests();

    // Form state
    const [formState, setFormState] = useState<SlotRequestFormState>({
        grade_id: null,
        type: SLOT_REQUEST_TYPES.WEEKLY,
        day_of_week: null,
        specific_date: '',
        start_time: '08:00',
        end_time: '10:00',
        notes: '',
    });

    const [errors, setErrors] = useState<Partial<Record<keyof SlotRequestFormState, string>>>({});

    // Reset form when dialog opens/closes
    useEffect(() => {
        if (open) {
            setFormState({
                grade_id: null,
                type: SLOT_REQUEST_TYPES.WEEKLY,
                day_of_week: null,
                specific_date: '',
                start_time: '08:00',
                end_time: '10:00',
                notes: '',
            });
            setErrors({});
        }
    }, [open]);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && open) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [open, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [open]);

    // Use grades from props
    const assignedGrades = grades;

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof SlotRequestFormState, string>> = {};

        if (!formState.grade_id) {
            newErrors.grade_id = 'يرجى اختيار الصف';
        }

        if (formState.type === SLOT_REQUEST_TYPES.WEEKLY && formState.day_of_week === null) {
            newErrors.day_of_week = 'يرجى اختيار يوم الأسبوع';
        }

        if (formState.type === SLOT_REQUEST_TYPES.ONE_TIME && !formState.specific_date) {
            newErrors.specific_date = 'يرجى اختيار التاريخ';
        }

        if (!formState.start_time) {
            newErrors.start_time = 'يرجى اختيار وقت البدء';
        }

        if (!formState.end_time) {
            newErrors.end_time = 'يرجى اختيار وقت الانتهاء';
        }

        if (formState.start_time && formState.end_time && formState.start_time >= formState.end_time) {
            newErrors.end_time = 'وقت الانتهاء يجب أن يكون بعد وقت البدء';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            await createRequest({
                grade_id: formState.grade_id!,
                type: formState.type,
                day_of_week: formState.type === SLOT_REQUEST_TYPES.WEEKLY ? formState.day_of_week ?? undefined : undefined,
                specific_date: formState.type === SLOT_REQUEST_TYPES.ONE_TIME ? formState.specific_date : undefined,
                start_time: formState.start_time,
                end_time: formState.end_time,
                notes: formState.notes || undefined,
            });

            onSuccess?.();
            onClose();
        } catch {
            // Error handled by hook
        }
    };

    // Update form field
    const updateField = <K extends keyof SlotRequestFormState>(
        field: K,
        value: SlotRequestFormState[K]
    ) => {
        setFormState(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-shibl-crimson to-shibl-crimson-dark px-6 py-5 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <Plus size={22} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">طلب موعد جديد</h2>
                                <p className="text-sm text-white/80">إضافة موعد إلى جدولك</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                    {/* Request Type Toggle */}
                    <div>
                        <label className="block text-sm font-semibold text-charcoal mb-2">
                            نوع الطلب
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => updateField('type', SLOT_REQUEST_TYPES.WEEKLY)}
                                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all ${formState.type === SLOT_REQUEST_TYPES.WEEKLY
                                    ? 'border-shibl-crimson bg-shibl-crimson/5 text-shibl-crimson'
                                    : 'border-slate-200 hover:border-slate-300 text-slate-grey'
                                    }`}
                            >
                                <Repeat size={18} />
                                <span className="font-semibold">أسبوعي</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => updateField('type', SLOT_REQUEST_TYPES.ONE_TIME)}
                                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all ${formState.type === SLOT_REQUEST_TYPES.ONE_TIME
                                    ? 'border-shibl-crimson bg-shibl-crimson/5 text-shibl-crimson'
                                    : 'border-slate-200 hover:border-slate-300 text-slate-grey'
                                    }`}
                            >
                                <CalendarDays size={18} />
                                <span className="font-semibold">مرة واحدة</span>
                            </button>
                        </div>
                    </div>

                    {/* Grade Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-charcoal mb-2">
                            الصف
                        </label>
                        <select
                            value={formState.grade_id ?? ''}
                            onChange={e => updateField('grade_id', e.target.value ? Number(e.target.value) : null)}
                            className={`w-full px-4 py-3 rounded-xl border-2 bg-white text-charcoal transition-all focus:outline-none focus:ring-2 focus:ring-shibl-crimson/20 ${errors.grade_id ? 'border-red-400' : 'border-slate-200 focus:border-shibl-crimson'
                                }`}
                        >
                            <option value="">اختر الصف...</option>
                            {assignedGrades.map((grade: { id: number; name: string }) => (
                                <option key={grade.id} value={grade.id}>
                                    {grade.name}
                                </option>
                            ))}
                        </select>
                        {errors.grade_id && (
                            <p className="text-red-500 text-xs mt-1">{errors.grade_id}</p>
                        )}
                    </div>

                    {/* Day Selector (for Weekly) */}
                    {formState.type === SLOT_REQUEST_TYPES.WEEKLY && (
                        <div>
                            <label className="block text-sm font-semibold text-charcoal mb-2">
                                <Calendar size={16} className="inline ml-1" />
                                يوم الأسبوع
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {DAYS_OF_WEEK.filter(day => day.value !== 5).map(day => (
                                    <button
                                        key={day.value}
                                        type="button"
                                        onClick={() => updateField('day_of_week', day.value as DayOfWeek)}
                                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${formState.day_of_week === day.value
                                            ? 'bg-shibl-crimson text-white'
                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-grey'
                                            }`}
                                    >
                                        {day.labelAr}
                                    </button>
                                ))}
                            </div>
                            {errors.day_of_week && (
                                <p className="text-red-500 text-xs mt-1">{errors.day_of_week}</p>
                            )}
                        </div>
                    )}

                    {/* Date Picker (for One-time) */}
                    {formState.type === SLOT_REQUEST_TYPES.ONE_TIME && (
                        <div>
                            <label className="block text-sm font-semibold text-charcoal mb-2">
                                <Calendar size={16} className="inline ml-1" />
                                التاريخ
                            </label>
                            <input
                                type="date"
                                value={formState.specific_date}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={e => updateField('specific_date', e.target.value)}
                                className={`w-full px-4 py-3 rounded-xl border-2 bg-white text-charcoal transition-all focus:outline-none focus:ring-2 focus:ring-shibl-crimson/20 ${errors.specific_date ? 'border-red-400' : 'border-slate-200 focus:border-shibl-crimson'
                                    }`}
                            />
                            {errors.specific_date && (
                                <p className="text-red-500 text-xs mt-1">{errors.specific_date}</p>
                            )}
                        </div>
                    )}

                    {/* Time Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-charcoal mb-2">
                                <Clock size={16} className="inline ml-1" />
                                من
                            </label>
                            <select
                                value={formState.start_time}
                                onChange={e => updateField('start_time', e.target.value)}
                                className={`w-full px-4 py-3 rounded-xl border-2 bg-white text-charcoal transition-all focus:outline-none focus:ring-2 focus:ring-shibl-crimson/20 ${errors.start_time ? 'border-red-400' : 'border-slate-200 focus:border-shibl-crimson'
                                    }`}
                            >
                                {TIME_OPTIONS.map(time => (
                                    <option key={time} value={time}>{time}</option>
                                ))}
                            </select>
                            {errors.start_time && (
                                <p className="text-red-500 text-xs mt-1">{errors.start_time}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-charcoal mb-2">
                                <Clock size={16} className="inline ml-1" />
                                إلى
                            </label>
                            <select
                                value={formState.end_time}
                                onChange={e => updateField('end_time', e.target.value)}
                                className={`w-full px-4 py-3 rounded-xl border-2 bg-white text-charcoal transition-all focus:outline-none focus:ring-2 focus:ring-shibl-crimson/20 ${errors.end_time ? 'border-red-400' : 'border-slate-200 focus:border-shibl-crimson'
                                    }`}
                            >
                                {TIME_OPTIONS.map(time => (
                                    <option key={time} value={time}>{time}</option>
                                ))}
                            </select>
                            {errors.end_time && (
                                <p className="text-red-500 text-xs mt-1">{errors.end_time}</p>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-semibold text-charcoal mb-2">
                            ملاحظات (اختياري)
                        </label>
                        <textarea
                            value={formState.notes}
                            onChange={e => updateField('notes', e.target.value)}
                            placeholder="أضف ملاحظات إضافية للإدارة..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-charcoal placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-shibl-crimson/20 focus:border-shibl-crimson resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        disabled={isCreating}
                        className="px-6 py-3 rounded-xl bg-white border-2 border-slate-200 hover:bg-slate-50 text-charcoal font-semibold text-sm transition-all disabled:opacity-50"
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isCreating}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-shibl-crimson to-shibl-crimson-dark hover:from-shibl-crimson-dark hover:to-shibl-crimson text-white font-bold text-sm shadow-lg shadow-shibl-crimson/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center gap-2"
                    >
                        {isCreating ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                جارٍ الإرسال...
                            </>
                        ) : (
                            <>
                                <Plus size={18} />
                                إرسال الطلب
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SlotRequestDialog;
