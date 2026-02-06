import { useState, useMemo, useCallback } from 'react';
import {
    Calendar,
    Clock,
    CalendarDays,
    Sparkles,
    X,
    Loader2,
    AlertCircle,
    CheckCircle2,
} from 'lucide-react';
import { localToUtcIso } from '../../../../utils/timeUtils';

// Arabic day names (week starts on Sunday)
const WEEKDAYS = [
    { key: 0, nameAr: 'الأحد', nameEn: 'Sun' },
    { key: 1, nameAr: 'الاثنين', nameEn: 'Mon' },
    { key: 2, nameAr: 'الثلاثاء', nameEn: 'Tue' },
    { key: 3, nameAr: 'الأربعاء', nameEn: 'Wed' },
    { key: 4, nameAr: 'الخميس', nameEn: 'Thu' },
    { key: 5, nameAr: 'الجمعة', nameEn: 'Fri' },
    { key: 6, nameAr: 'السبت', nameEn: 'Sat' },
];

// Slot duration options in minutes
const SLOT_DURATIONS = [
    { value: 30, label: '30 دقيقة' },
    { value: 45, label: '45 دقيقة' },
    { value: 60, label: 'ساعة واحدة' },
    { value: 90, label: 'ساعة ونصف' },
    { value: 120, label: 'ساعتين' },
];

interface BulkSlotGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (slots: Array<{ start_time: string; end_time: string }>) => Promise<void>;
    isSubmitting: boolean;
}

export function BulkSlotGeneratorModal({
    isOpen,
    onClose,
    onSubmit,
    isSubmitting,
}: BulkSlotGeneratorModalProps) {
    // Form state
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4]); // Sun-Thu default
    const [slotDuration, setSlotDuration] = useState(60); // 1 hour default
    const [dailyStartTime, setDailyStartTime] = useState('08:00');
    const [dailyEndTime, setDailyEndTime] = useState('16:00');

    // Toggle a weekday
    const toggleDay = useCallback((dayKey: number) => {
        setSelectedDays(prev =>
            prev.includes(dayKey)
                ? prev.filter(d => d !== dayKey)
                : [...prev, dayKey].sort()
        );
    }, []);

    // Generate slots based on form inputs
    const generatedSlots = useMemo(() => {
        if (!startDate || !endDate || selectedDays.length === 0 || !dailyStartTime || !dailyEndTime) {
            return [];
        }

        const slots: Array<{ start_time: string; end_time: string }> = [];
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Validate date range
        if (start > end) return [];

        // Parse time strings
        const [startHour, startMinute] = dailyStartTime.split(':').map(Number);
        const [endHour, endMinute] = dailyEndTime.split(':').map(Number);
        const dailyStartMinutes = startHour * 60 + startMinute;
        const dailyEndMinutes = endHour * 60 + endMinute;

        // Validate time range
        if (dailyStartMinutes >= dailyEndMinutes) return [];

        // Safety limits
        const MAX_SLOTS = 1000;
        const MAX_ITERATIONS = 5000;
        let iterationCount = 0;

        // Iterate through each day in the range
        // Use a new Date instance to avoid mutating the original 'start' if used elsewhere
        const current = new Date(start);

        // Reset time to midnight to ensure clean day comparison
        current.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        while (current <= end) {
            // Safety break to prevent infinite loops or freezing
            if (iterationCount++ > MAX_ITERATIONS) break;
            if (slots.length >= MAX_SLOTS) break;

            const dayOfWeek = current.getDay();

            // Check if this day is selected
            if (selectedDays.includes(dayOfWeek)) {
                // Generate slots for this day
                let currentMinutes = dailyStartMinutes;

                while (currentMinutes + slotDuration <= dailyEndMinutes) {
                    const slotStartHour = Math.floor(currentMinutes / 60);
                    const slotStartMin = currentMinutes % 60;
                    const slotEndMinutes = currentMinutes + slotDuration;
                    const slotEndHour = Math.floor(slotEndMinutes / 60);
                    const slotEndMin = slotEndMinutes % 60;

                    // Build date string for this day
                    const year = current.getFullYear();
                    const month = String(current.getMonth() + 1).padStart(2, '0');
                    const day = String(current.getDate()).padStart(2, '0');
                    const dateStr = `${year}-${month}-${day}`;

                    // Format time components with leading zeros
                    const startHourStr = String(slotStartHour).padStart(2, '0');
                    const startMinStr = String(slotStartMin).padStart(2, '0');
                    const endHourStr = String(slotEndHour).padStart(2, '0');
                    const endMinStr = String(slotEndMin).padStart(2, '0');

                    // Convert local datetime to UTC ISO string for backend
                    const localStartTime = `${dateStr}T${startHourStr}:${startMinStr}`;
                    const localEndTime = `${dateStr}T${endHourStr}:${endMinStr}`;

                    slots.push({
                        start_time: localToUtcIso(localStartTime) || localStartTime,
                        end_time: localToUtcIso(localEndTime) || localEndTime,
                    });

                    currentMinutes += slotDuration;
                }
            }

            // Move to next day safely
            current.setDate(current.getDate() + 1);
        }

        return slots;
    }, [startDate, endDate, selectedDays, slotDuration, dailyStartTime, dailyEndTime]);

    // Handle form submission
    const handleSubmit = async () => {
        if (generatedSlots.length === 0) return;
        await onSubmit(generatedSlots);
    };

    // Reset form
    const resetForm = useCallback(() => {
        setStartDate('');
        setEndDate('');
        setSelectedDays([0, 1, 2, 3, 4]);
        setSlotDuration(60);
        setDailyStartTime('08:00');
        setDailyEndTime('16:00');
    }, []);

    // Handle close
    const handleClose = () => {
        if (!isSubmitting) {
            resetForm();
            onClose();
        }
    };

    if (!isOpen) return null;

    // Check if date range exceeds 3 months (90 days)
    const MAX_DAYS = 90;
    let dateRangeExceeded = false;
    let daysDifference = 0;
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        daysDifference = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        dateRangeExceeded = daysDifference > MAX_DAYS;
    }

    // Compute specific reason why 0 slots are generated (for better UX feedback)
    const getEmptyStateReason = (): { icon: 'warning' | 'info'; message: string } | null => {
        if (!startDate || !endDate) {
            return { icon: 'info', message: 'حدد نطاق التاريخ (من - إلى)' };
        }
        if (new Date(startDate) > new Date(endDate)) {
            return { icon: 'warning', message: 'تاريخ البداية يجب أن يكون قبل تاريخ النهاية' };
        }
        if (selectedDays.length === 0) {
            return { icon: 'info', message: 'اختر يوم عمل واحد على الأقل' };
        }
        if (!dailyStartTime || !dailyEndTime) {
            return { icon: 'info', message: 'حدد ساعات العمل اليومية' };
        }
        const [startHour, startMinute] = dailyStartTime.split(':').map(Number);
        const [endHour, endMinute] = dailyEndTime.split(':').map(Number);
        if (startHour * 60 + startMinute >= endHour * 60 + endMinute) {
            return { icon: 'warning', message: 'وقت البداية يجب أن يكون قبل وقت النهاية' };
        }
        if (generatedSlots.length === 0 && startDate && endDate) {
            return { icon: 'warning', message: 'لا توجد أيام عمل في هذا النطاق. تحقق من الأيام المختارة.' };
        }
        return null;
    };
    const emptyStateReason = getEmptyStateReason();

    const isFormValid = startDate && endDate && selectedDays.length > 0 && dailyStartTime && dailyEndTime && generatedSlots.length > 0 && !dateRangeExceeded;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-red-50 rounded-xl">
                            <CalendarDays size={22} className="text-[#AF0C15]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[#1F1F1F]">إنشاء جدول الفترات الأسبوعي</h3>
                            <p className="text-sm text-[#636E72]">إنشاء فترات متعددة بسهولة</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="p-2 hover:bg-slate-100 rounded-lg transition disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Content */}
                <div className="p-6 space-y-6">
                    {/* Date Range Section */}
                    <div className="bg-[#F8F9FA] rounded-2xl p-5 space-y-4">
                        <div className="flex items-center gap-2 text-[#1F1F1F] font-semibold">
                            <Calendar size={18} className="text-[#AF0C15]" />
                            <span>نطاق التاريخ</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[#636E72] mb-2">من تاريخ</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#AF0C15]/20 focus:border-[#AF0C15] transition bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#636E72] mb-2">إلى تاريخ</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    min={startDate || new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#AF0C15]/20 focus:border-[#AF0C15] transition bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Working Days Section */}
                    <div className="bg-[#F8F9FA] rounded-2xl p-5 space-y-4">
                        <div className="flex items-center gap-2 text-[#1F1F1F] font-semibold">
                            <CalendarDays size={18} className="text-[#AF0C15]" />
                            <span>أيام العمل</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {WEEKDAYS.map((day) => (
                                <button
                                    key={day.key}
                                    type="button"
                                    onClick={() => toggleDay(day.key)}
                                    className={`px-4 py-2.5 rounded-xl font-medium transition-all ${selectedDays.includes(day.key)
                                        ? 'bg-[#AF0C15] text-white shadow-md'
                                        : 'bg-white text-[#636E72] border border-slate-200 hover:border-[#AF0C15] hover:text-[#AF0C15]'
                                        }`}
                                >
                                    {day.nameAr}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-[#636E72]">
                            اختر الأيام التي تريد إنشاء فترات فيها (مثال: استثني الجمعة والسبت)
                        </p>
                    </div>

                    {/* Slot Duration Section */}
                    <div className="bg-[#F8F9FA] rounded-2xl p-5 space-y-4">
                        <div className="flex items-center gap-2 text-[#1F1F1F] font-semibold">
                            <Clock size={18} className="text-[#AF0C15]" />
                            <span>مدة الفترة الواحدة</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {SLOT_DURATIONS.map((duration) => (
                                <button
                                    key={duration.value}
                                    type="button"
                                    onClick={() => setSlotDuration(duration.value)}
                                    className={`px-4 py-2.5 rounded-xl font-medium transition-all ${slotDuration === duration.value
                                        ? 'bg-[#AF0C15] text-white shadow-md'
                                        : 'bg-white text-[#636E72] border border-slate-200 hover:border-[#AF0C15] hover:text-[#AF0C15]'
                                        }`}
                                >
                                    {duration.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Working Hours Section */}
                    <div className="bg-[#F8F9FA] rounded-2xl p-5 space-y-4">
                        <div className="flex items-center gap-2 text-[#1F1F1F] font-semibold">
                            <Clock size={18} className="text-[#AF0C15]" />
                            <span>ساعات العمل اليومية</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[#636E72] mb-2">من الساعة</label>
                                <input
                                    type="time"
                                    value={dailyStartTime}
                                    onChange={(e) => setDailyStartTime(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#AF0C15]/20 focus:border-[#AF0C15] transition bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#636E72] mb-2">إلى الساعة</label>
                                <input
                                    type="time"
                                    value={dailyEndTime}
                                    onChange={(e) => setDailyEndTime(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#AF0C15]/20 focus:border-[#AF0C15] transition bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Preview Section */}
                    <div className={`rounded-2xl p-5 ${dateRangeExceeded
                        ? 'bg-red-50 border border-red-200'
                        : generatedSlots.length > 0
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-amber-50 border border-amber-200'
                        }`}>
                        <div className="flex items-center gap-3">
                            {dateRangeExceeded ? (
                                <>
                                    <div className="p-2 bg-red-500 rounded-full">
                                        <AlertCircle size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-red-600 font-bold text-lg">
                                            نطاق التاريخ كبير جداً ({daysDifference} يوم)
                                        </p>
                                        <p className="text-sm text-red-500">
                                            الحد الأقصى هو 3 أشهر (90 يوم). يرجى تقليل النطاق.
                                        </p>
                                    </div>
                                </>
                            ) : generatedSlots.length > 0 ? (
                                <>
                                    <div className="p-2 bg-[#27AE60] rounded-full">
                                        <CheckCircle2 size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[#27AE60] font-bold text-lg">
                                            سيتم إنشاء {generatedSlots.length.toLocaleString('ar-EG')} فترة زمنية
                                        </p>
                                        <p className="text-sm text-green-600">
                                            من {startDate} إلى {endDate}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className={`p-2 rounded-full ${emptyStateReason?.icon === 'warning' ? 'bg-red-400' : 'bg-amber-400'}`}>
                                        <AlertCircle size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <p className={`font-medium ${emptyStateReason?.icon === 'warning' ? 'text-red-600' : 'text-amber-700'}`}>
                                            {emptyStateReason?.message || 'قم بتعبئة جميع الحقول لمعاينة عدد الفترات'}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 flex gap-3 sticky bottom-0 bg-white">
                    {isSubmitting ? (
                        // Enhanced loading state
                        <div className="w-full flex flex-col items-center justify-center gap-4 py-4">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-[#AF0C15] animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles size={24} className="text-[#AF0C15] animate-pulse" />
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-[#1F1F1F]">جاري إنشاء {generatedSlots.length.toLocaleString('ar-EG')} فترة...</p>
                                <p className="text-sm text-[#636E72] mt-1">يُرجى الانتظار، هذا قد يستغرق بضع ثوان</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={handleClose}
                                className="flex-1 py-3.5 border border-slate-200 hover:bg-slate-50 rounded-full font-bold transition"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!isFormValid}
                                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#AF0C15] hover:bg-[#8F0A12] text-white rounded-full font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Sparkles size={18} />
                                إنشاء الفترات
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
