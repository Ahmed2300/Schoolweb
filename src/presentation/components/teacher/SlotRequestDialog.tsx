/**
 * SlotRequestDialog Component - Redesigned
 * 
 * Modal dialog for teachers to request exceptional lesson slots.
 * New Flow: Grade → Date → Available Slots (clickable cards)
 * 
 * Changes from previous version:
 * - Removed weekly/one-time toggle (only one-time now)
 * - Removed start/end time dropdowns
 * - Added slot card selector (fetched from backend)
 * - Added clearer status indicators
 */

import { useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getTeacherEcho } from '../../../services/websocket';
import { X, Calendar, Clock, Loader2, Plus, CalendarDays, BookOpen, GraduationCap, Check, AlertCircle, User } from 'lucide-react';
import { useSlotRequests, useAvailableSlotsQuery, slotRequestKeys } from '../../../hooks/useSlotRequests';
import { useAssignedGrades } from '../../../hooks/useRecurringSchedule';
import { useTeacherCourses } from '../../hooks/useTeacherContent';
import { getCourseName } from '../../../data/api/teacherService';
import type { AvailableSlot } from '../../../data/api/slotRequestService';

// ==================== TYPES ====================

interface Grade {
    id: number;
    name: string | { ar?: string; en?: string };
}

interface SlotRequestDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

// Helper to extract localized name
const getLocalizedName = (name: string | { ar?: string; en?: string } | undefined | null): string => {
    if (!name) return '';
    if (typeof name === 'string') return name;
    return name.ar || name.en || '';
};

// Format time for display
const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'م' : 'ص';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
};

// ==================== SLOT CARD COMPONENT ====================

interface SlotCardProps {
    slot: AvailableSlot;
    isSelected: boolean;
    onSelect: () => void;
    disabled?: boolean;
}

function SlotCard({ slot, isSelected, onSelect, disabled }: SlotCardProps) {
    const isAvailable = slot.is_available;

    return (
        <button
            type="button"
            onClick={onSelect}
            disabled={disabled || !isAvailable}
            className={`
                relative p-4 rounded-2xl border-2 transition-all duration-200 text-center
                ${isSelected
                    ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-500/20'
                    : isAvailable
                        ? 'border-slate-200 bg-white hover:border-rose-300 hover:bg-rose-50/50'
                        : 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
        >
            {/* Selected Checkmark */}
            {isSelected && (
                <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                </div>
            )}

            {/* Time Display */}
            <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className={`w-4 h-4 ${isAvailable ? 'text-rose-500' : 'text-slate-400'}`} />
                <span className={`text-lg font-bold ${isAvailable ? 'text-charcoal' : 'text-slate-400'}`}>
                    {formatTime(slot.start)}
                </span>
            </div>
            <div className="text-sm text-slate-500">
                إلى {formatTime(slot.end)}
            </div>

            {/* Reserved By Badge */}
            {!isAvailable && slot.reserved_by && (
                <div className="mt-2 flex items-center justify-center gap-1 text-xs text-slate-400">
                    <User className="w-3 h-3" />
                    <span>{slot.reserved_by}</span>
                </div>
            )}

            {/* Available Badge */}
            {isAvailable && !isSelected && (
                <div className="mt-2 text-xs text-rose-600 font-medium">
                    متاح للحجز
                </div>
            )}
        </button>
    );
}

// ==================== MAIN COMPONENT ====================

export function SlotRequestDialog({ open, onClose, onSuccess }: SlotRequestDialogProps) {
    const queryClient = useQueryClient();
    const { createRequest, isCreating } = useSlotRequests();
    const { data: myCourses = [], isLoading: isLoadingCourses } = useTeacherCourses();
    const { data: gradesData, isLoading: isLoadingGrades } = useAssignedGrades();

    // Form state - simplified
    const [gradeId, setGradeId] = useState<number | null>(null);
    const [courseId, setCourseId] = useState<number | null>(null);
    const [semesterId, setSemesterId] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
    const [notes, setNotes] = useState<string>('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [apiError, setApiError] = useState<string | null>(null);

    // Fetch available slots when grade and date are selected
    const {
        data: availableSlots = [],
        isLoading: isLoadingSlots,
        error: slotsError,
        refetch: refetchSlots,
    } = useAvailableSlotsQuery(gradeId, selectedDate);

    // Use grades from API (teacher's assigned grades)
    const assignedGrades = gradesData?.data ?? [];

    // Selected course details
    const selectedCourse = useMemo(() => {
        if (!courseId) return null;
        return myCourses.find(c => c.id === courseId);
    }, [courseId, myCourses]);

    // Auto-set semester and grade when course is selected
    useEffect(() => {
        if (selectedCourse) {
            if (selectedCourse.semester?.id) {
                setSemesterId(selectedCourse.semester.id);
            }
            if (selectedCourse.grade?.id) {
                setGradeId(selectedCourse.grade.id);
            }
        }
    }, [selectedCourse]);

    // Reset form when dialog opens/closes
    useEffect(() => {
        if (open) {
            setGradeId(null);
            setCourseId(null);
            setSemesterId(null);
            setSelectedDate('');
            setSelectedSlot(null);
            setNotes('');
            setErrors({});
            setApiError(null);
        }
    }, [open]);

    // WebSocket for real-time updates
    useEffect(() => {
        if (!gradeId) return;

        const echo = getTeacherEcho();
        if (!echo) {
            console.warn('⚠️ SlotRequestDialog: Echo not initialized');
            return;
        }

        const channelName = `grade.${gradeId}.schedule`;
        const channel = echo.private(channelName);

        // Debug log
        console.log(`🔌 SlotRequestDialog: Subscribing to ${channelName}`);

        channel.listen('.slot.status.changed', (e: any) => {
            console.log('🔔 SlotRequestDialog: Slot status changed', e);

            // Invalidate queries to refetch data
            queryClient.invalidateQueries({ queryKey: slotRequestKeys.availableSlots(gradeId, selectedDate) });
            queryClient.invalidateQueries({ queryKey: slotRequestKeys.list({}) });
        });

        return () => {
            console.log(`🔌 SlotRequestDialog: Unsubscribing from ${channelName}`);
            channel.stopListening('.slot.status.changed');
        };
    }, [gradeId, selectedDate, queryClient]);

    // Clear slot selection when date changes
    useEffect(() => {
        setSelectedSlot(null);
    }, [selectedDate, gradeId]);

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

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!gradeId) {
            newErrors.grade_id = 'يرجى اختيار الصف';
        }
        if (!courseId) {
            newErrors.course_id = 'يرجى اختيار المادة';
        }
        if (!selectedDate) {
            newErrors.date = 'يرجى اختيار التاريخ';
        }
        if (!selectedSlot) {
            newErrors.slot = 'يرجى اختيار موعد متاح';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!validateForm()) return;
        setApiError(null);

        try {
            await createRequest({
                grade_id: gradeId!,
                course_id: courseId ?? undefined,
                semester_id: semesterId ?? undefined,
                specific_date: selectedDate,
                slot_time: selectedSlot!.slot_time,
                notes: notes || undefined,
            });

            onSuccess?.();
            onClose();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { errors?: { conflict?: { message?: string } }; message?: string } } };
            if (error?.response?.data?.errors?.conflict) {
                setApiError(error.response.data.errors.conflict.message ?? 'تعارض في الموعد');
            } else if (error?.response?.data?.message) {
                setApiError(error.response.data.message);
            } else {
                setApiError('حدث خطأ أثناء إرسال الطلب');
            }
        }
    };

    // Get min date (today)
    const minDate = new Date().toISOString().split('T')[0];

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
                <div className="bg-gradient-to-r from-shibl-crimson to-rose-600 px-6 py-5 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <Plus size={22} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">طلب موعد استثنائي</h2>
                                <p className="text-sm text-white/80">حجز موعد لحصة استثنائية</p>
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
                    {/* API Error */}
                    {apiError && (
                        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-2 animate-in slide-in-from-top-2">
                            <div className="shrink-0 p-1 bg-rose-100 rounded-full">
                                <AlertCircle size={14} />
                            </div>
                            <p>{apiError}</p>
                        </div>
                    )}

                    {/* Step 1: Course Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-charcoal mb-2">
                            <BookOpen size={16} className="inline ml-1" />
                            المادة الدراسية
                        </label>
                        <select
                            value={courseId ?? ''}
                            onChange={e => {
                                setCourseId(e.target.value ? Number(e.target.value) : null);
                                setErrors(prev => ({ ...prev, course_id: '' }));
                            }}
                            disabled={isLoadingCourses}
                            className={`w-full px-4 py-3 rounded-xl border-2 bg-white text-charcoal transition-all focus:outline-none focus:ring-2 focus:ring-rose-500/20 ${errors.course_id ? 'border-rose-400' : 'border-slate-200 focus:border-rose-500'
                                }`}
                        >
                            <option value="">
                                {isLoadingCourses ? 'جارٍ التحميل...' : 'اختر المادة...'}
                            </option>
                            {myCourses.map((course) => (
                                <option key={course.id} value={course.id}>
                                    {getCourseName(course.name)}
                                    {course.grade?.name && ` - ${course.grade.name}`}
                                </option>
                            ))}
                        </select>
                        {errors.course_id && (
                            <p className="text-rose-500 text-xs mt-1">{errors.course_id}</p>
                        )}
                    </div>

                    {/* Semester Display (auto-filled from course) */}
                    {selectedCourse?.semester && (
                        <div>
                            <label className="block text-sm font-semibold text-charcoal mb-2">
                                <GraduationCap size={16} className="inline ml-1" />
                                الفصل الدراسي
                            </label>
                            <div className="px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-charcoal font-medium">
                                {getLocalizedName(selectedCourse.semester.name)}
                            </div>
                        </div>
                    )}

                    {/* Grade Selection (auto-filled but can be changed) */}
                    <div>
                        <label className="block text-sm font-semibold text-charcoal mb-2">
                            الصف
                        </label>
                        <select
                            value={gradeId ?? ''}
                            onChange={e => {
                                setGradeId(e.target.value ? Number(e.target.value) : null);
                                setErrors(prev => ({ ...prev, grade_id: '' }));
                            }}
                            disabled={isLoadingGrades}
                            className={`w-full px-4 py-3 rounded-xl border-2 bg-white text-charcoal transition-all focus:outline-none focus:ring-2 focus:ring-rose-500/20 ${errors.grade_id ? 'border-rose-400' : 'border-slate-200 focus:border-rose-500'
                                }`}
                        >
                            <option value="">
                                {isLoadingGrades ? 'جارٍ التحميل...' : 'اختر الصف...'}
                            </option>
                            {assignedGrades.map((grade: Grade) => (
                                <option key={grade.id} value={grade.id}>
                                    {getLocalizedName(grade.name)}
                                </option>
                            ))}
                        </select>
                        {errors.grade_id && (
                            <p className="text-rose-500 text-xs mt-1">{errors.grade_id}</p>
                        )}
                    </div>

                    {/* Step 2: Date Picker */}
                    <div>
                        <label className="block text-sm font-semibold text-charcoal mb-2">
                            <Calendar size={16} className="inline ml-1" />
                            التاريخ
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            min={minDate}
                            onChange={e => {
                                setSelectedDate(e.target.value);
                                setErrors(prev => ({ ...prev, date: '' }));
                            }}
                            className={`w-full px-4 py-3 rounded-xl border-2 bg-white text-charcoal transition-all focus:outline-none focus:ring-2 focus:ring-rose-500/20 ${errors.date ? 'border-rose-400' : 'border-slate-200 focus:border-rose-500'
                                }`}
                        />
                        {errors.date && (
                            <p className="text-rose-500 text-xs mt-1">{errors.date}</p>
                        )}
                    </div>

                    {/* Step 3: Available Slots */}
                    {gradeId && selectedDate && (
                        <div>
                            <label className="block text-sm font-semibold text-charcoal mb-3">
                                <CalendarDays size={16} className="inline ml-1" />
                                اختر الموعد المتاح
                            </label>

                            {isLoadingSlots ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
                                    <span className="mr-2 text-slate-500">جارٍ تحميل المواعيد...</span>
                                </div>
                            ) : slotsError ? (
                                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm">
                                    <AlertCircle className="inline w-4 h-4 ml-1" />
                                    حدث خطأ أثناء تحميل المواعيد
                                    <button
                                        onClick={() => refetchSlots()}
                                        className="mr-2 underline"
                                    >
                                        إعادة المحاولة
                                    </button>
                                </div>
                            ) : availableSlots.length === 0 ? (
                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
                                    <AlertCircle className="inline w-4 h-4 ml-1" />
                                    لا توجد مواعيد متاحة لهذا اليوم. يرجى اختيار تاريخ آخر.
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        {availableSlots.map((slot) => (
                                            <SlotCard
                                                key={slot.slot_time}
                                                slot={slot}
                                                isSelected={selectedSlot?.slot_time === slot.slot_time}
                                                onSelect={() => {
                                                    setSelectedSlot(slot);
                                                    setErrors(prev => ({ ...prev, slot: '' }));
                                                }}
                                                disabled={isCreating}
                                            />
                                        ))}
                                    </div>
                                    {errors.slot && (
                                        <p className="text-rose-500 text-xs mt-2">{errors.slot}</p>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* Prompt to complete steps */}
                    {(!gradeId || !selectedDate) && (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-sm">
                            <CalendarDays size={16} className="inline ml-1" />
                            {!gradeId
                                ? 'اختر المادة والصف أولاً لعرض المواعيد المتاحة'
                                : 'اختر التاريخ لعرض المواعيد المتاحة'
                            }
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-semibold text-charcoal mb-2">
                            ملاحظات (اختياري)
                        </label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="أضف ملاحظات إضافية للإدارة..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-charcoal placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
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
                        disabled={isCreating || !selectedSlot}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-shibl-crimson to-rose-600 hover:shadow-lg hover:shadow-rose-500/30 text-white font-bold text-sm transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center gap-2"
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
