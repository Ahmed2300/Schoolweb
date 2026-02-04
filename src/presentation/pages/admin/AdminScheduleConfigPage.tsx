import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Calendar,
    Settings,
    Save,
    CheckCircle2,
    AlertCircle,
    Lock,
    Unlock,
    Users,
    Trash2,
    Loader2,
    Wand2,
    Clock,
    LayoutGrid,
    Plus,
    X,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService, SemesterData, DayScheduleSettingData, BreakInterval as BackendBreakInterval } from '../../../data/api/adminService';
import { useBulkCreateTimeSlots } from '../../hooks/useTimeSlots';

// Local types (aligned with backend)
type BookingMode = 'individual' | 'multiple';

interface BreakInterval {
    id: string;
    start: string;
    end: string;
}

interface DayScheduleConfig {
    isActive: boolean;
    startTime: string;
    endTime: string;
    slotDurationMinutes: number;
    gapMinutes: number;
    bookingMode: BookingMode;
    breaks: BreakInterval[];
}


// Arabic day names
const WEEKDAYS = [
    { key: 0, name: 'الأحد' },
    { key: 1, name: 'الاثنين' },
    { key: 2, name: 'الثلاثاء' },
    { key: 3, name: 'الأربعاء' },
    { key: 4, name: 'الخميس' },
    { key: 5, name: 'الجمعة' },
    { key: 6, name: 'السبت' },
];

export function AdminScheduleConfigPage() {
    // Day configurations state - keyed by day_of_week (0-6)
    const [dayConfigs, setDayConfigs] = useState<Record<number, DayScheduleConfig>>({});
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [loadingSettings, setLoadingSettings] = useState(false);

    // Grade State
    const [grades, setGrades] = useState<any[]>([]);
    const [semesters, setSemesters] = useState<SemesterData[]>([]);
    const [loadingGrades, setLoadingGrades] = useState(true);
    const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null);
    const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);
    const [selectedDay, setSelectedDay] = useState<number>(0); // Default Sunday

    // Generation State
    const [isGenerating, setIsGenerating] = useState(false);
    const bulkCreateMutation = useBulkCreateTimeSlots();

    // Helper to convert backend data to local state
    const convertFromBackend = useCallback((backendDays: Record<number, DayScheduleSettingData>): Record<number, DayScheduleConfig> => {
        const result: Record<number, DayScheduleConfig> = {};
        for (let day = 0; day <= 6; day++) {
            const backendDay = backendDays[day];
            if (backendDay) {
                result[day] = {
                    isActive: backendDay.is_active,
                    startTime: backendDay.start_time?.substring(0, 5) || '08:00',
                    endTime: backendDay.end_time?.substring(0, 5) || '14:00',
                    slotDurationMinutes: backendDay.slot_duration_minutes,
                    gapMinutes: backendDay.gap_minutes,
                    bookingMode: backendDay.booking_mode,
                    breaks: (backendDay.breaks || []).map((b: BackendBreakInterval) => ({
                        id: b.id || crypto.randomUUID(),
                        start: b.start,
                        end: b.end
                    }))
                };
            } else {
                // Default for missing days
                result[day] = {
                    isActive: day <= 4,
                    startTime: '08:00',
                    endTime: '14:00',
                    slotDurationMinutes: 60,
                    gapMinutes: 0,
                    bookingMode: 'individual',
                    breaks: []
                };
            }
        }
        return result;
    }, []);

    // Fetch Grades on Mount
    useEffect(() => {
        const fetchGrades = async () => {
            try {
                const response = await adminService.getGrades({ per_page: 100 });
                setGrades(response.data || []);
                if (response.data.length > 0) {
                    setSelectedGradeId(response.data[0].id);
                }
            } catch (error) {
                console.error('Failed to fetch grades:', error);
                toast.error('فشل تحميل الصفوف الدراسية');
            } finally {
                setLoadingGrades(false);
            }
        };
        fetchGrades();
    }, []);

    // Fetch Schedule Settings when Grade Changes
    useEffect(() => {
        const fetchSettings = async () => {
            if (!selectedGradeId) return;
            setLoadingSettings(true);
            try {
                const response = await adminService.getScheduleSettings(selectedGradeId);
                if (response.success && response.data?.days) {
                    setDayConfigs(convertFromBackend(response.data.days));
                }
            } catch (error) {
                console.error('Failed to fetch schedule settings:', error);
                // Initialize with defaults if API fails
                setDayConfigs(convertFromBackend({}));
            } finally {
                setLoadingSettings(false);
                setHasChanges(false);
            }
        };
        fetchSettings();
    }, [selectedGradeId, convertFromBackend]);

    // Fetch Semesters when Selected Grade Changes
    useEffect(() => {
        const fetchSemestersForGrade = async () => {
            if (!selectedGradeId) return;
            try {
                const data = await adminService.getSemestersByGrade(selectedGradeId);
                setSemesters(data || []);
            } catch (error) {
                console.error('Failed to fetch semesters:', error);
            }
        };
        fetchSemestersForGrade();
    }, [selectedGradeId]);

    // Reset semester when grade changes
    useEffect(() => {
        setSelectedSemesterId(null);
    }, [selectedGradeId]);
    // Save Schedule Settings to Backend
    const handleSave = async () => {
        if (!selectedGradeId) {
            toast.error('الرجاء اختيار صف دراسي');
            return;
        }

        setIsSaving(true);
        try {
            // Convert local state to backend format
            const daysPayload = Object.entries(dayConfigs).map(([dayKey, config]) => ({
                day_of_week: Number(dayKey),
                is_active: config.isActive,
                start_time: config.startTime,
                end_time: config.endTime,
                slot_duration_minutes: config.slotDurationMinutes,
                gap_minutes: config.gapMinutes,
                booking_mode: config.bookingMode,
                breaks: config.breaks.map(b => ({ start: b.start, end: b.end }))
            }));

            await adminService.saveScheduleSettings(selectedGradeId, { days: daysPayload });
            setHasChanges(false);
            toast.success('تم حفظ الإعدادات بنجاح');
        } catch (error) {
            console.error('Failed to save schedule settings:', error);
            toast.error('فشل حفظ الإعدادات');
        } finally {
            setIsSaving(false);
        }
    };

    // Get current day configuration
    const currentDayConfig = useMemo(() => {
        return dayConfigs[selectedDay] || {
            isActive: false,
            startTime: '08:00',
            endTime: '14:00',
            slotDurationMinutes: 60,
            gapMinutes: 0,
            bookingMode: 'individual' as BookingMode,
            breaks: []
        };
    }, [dayConfigs, selectedDay]);

    // Update specific day config
    const updateDayConfig = (updates: Partial<DayScheduleConfig>) => {
        setDayConfigs(prev => ({
            ...prev,
            [selectedDay]: { ...prev[selectedDay], ...updates }
        }));
        setHasChanges(true);
    };

    // Break Management
    const addBreak = () => {
        const newBreak: BreakInterval = {
            id: crypto.randomUUID(),
            start: '10:00',
            end: '10:30'
        };
        updateDayConfig({ breaks: [...currentDayConfig.breaks, newBreak] });
    };

    const updateBreak = (id: string, field: 'start' | 'end', value: string) => {
        const updatedBreaks = currentDayConfig.breaks.map((b: BreakInterval) =>
            b.id === id ? { ...b, [field]: value } : b
        );
        updateDayConfig({ breaks: updatedBreaks });
    };

    const removeBreak = (id: string) => {
        const updatedBreaks = currentDayConfig.breaks.filter((b: BreakInterval) => b.id !== id);
        updateDayConfig({ breaks: updatedBreaks });
    };

    // Handle generating/publishing time slots
    const handlePublishSlots = async () => {
        if (!selectedSemesterId) return;

        setIsGenerating(true);
        try {
            await adminService.generateSlots(selectedSemesterId);
            toast.success('تم بدء عملية إنشاء الفترات الزمنية بنجاح');
        } catch (error) {
            console.error('Failed to generate slots:', error);
            toast.error('حدث خطأ أثناء إنشاء الفترات الزمنية');
        } finally {
            setIsGenerating(false);
        }
    };

    // Reset to defaults
    const resetToDefaults = () => {
        const defaultConfig: Record<number, DayScheduleConfig> = {};
        for (let day = 0; day <= 6; day++) {
            defaultConfig[day] = {
                isActive: day <= 4,
                startTime: '08:00',
                endTime: '14:00',
                slotDurationMinutes: 60,
                gapMinutes: 0,
                bookingMode: 'individual',
                breaks: []
            };
        }
        setDayConfigs(defaultConfig);
        setHasChanges(true);
    };

    return (
        <div className="space-y-6 pb-20 max-w-6xl mx-auto p-6" dir="rtl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight">
                        <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-xl shadow-indigo-600/20 ring-4 ring-indigo-50">
                            <Settings size={24} strokeWidth={2.5} />
                        </div>
                        إعدادات الجدولة
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg font-medium">تخصيص الأيام، فترات الراحة، وأنظمة الحجز الدراسية</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={!hasChanges}
                    className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-base transition-all transform active:scale-95 ${hasChanges
                        ? 'bg-[#AF0C15] hover:bg-[#8F0A12] text-white shadow-lg hover:shadow-xl shadow-[#AF0C15]/20'
                        : 'bg-slate-100/50 text-slate-400 cursor-not-allowed border border-slate-200'
                        }`}
                >
                    <Save size={18} strokeWidth={2.5} /> حفظ التغييرات
                </button>
            </div>

            {/* Config Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Grades List - Sidebar */}
                <div className="lg:col-span-1 bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 h-fit sticky top-6">
                    <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2.5 text-lg">
                        <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                            <Users size={18} strokeWidth={2.5} />
                        </span>
                        الصفوف الدراسية
                    </h3>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto pl-1 pr-1 custom-scrollbar">
                        {grades.map(grade => (
                            <button
                                key={grade.id}
                                onClick={() => setSelectedGradeId(grade.id)}
                                className={`w-full text-right px-4 py-3.5 rounded-xl text-sm font-bold transition-all border ${selectedGradeId === grade.id
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 border-transparent transform scale-[1.02]'
                                    : 'bg-white text-slate-600 hover:bg-slate-50 border-transparent hover:border-slate-200'
                                    }`}
                            >
                                <div className="flex justify-between items-center">
                                    <span>{grade.name?.ar || grade.name}</span>
                                    {selectedGradeId === grade.id && <CheckCircle2 size={16} className="text-indigo-200" />}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Day Editor */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Global Term Setting Removed by User Request */}

                    {selectedGradeId && currentDayConfig ? (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden ring-1 ring-slate-900/5">

                            {/* Grade & Semester Header */}
                            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-slate-50">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="font-bold text-slate-800 flex items-center gap-3 text-lg">
                                            <span className="p-2 bg-indigo-600 text-white rounded-lg">
                                                <Calendar size={18} />
                                            </span>
                                            إعدادات الجدول - {grades.find(g => g.id === selectedGradeId)?.name?.ar || grades.find(g => g.id === selectedGradeId)?.name}
                                        </h3>
                                        <p className="text-slate-500 text-sm mt-2">حدد الفصل الدراسي وأوقات الدوام</p>
                                    </div>

                                    {/* Semester Selector */}
                                    <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-indigo-100 shadow-sm">
                                        <div className="relative">
                                            <select
                                                value={selectedSemesterId || ''}
                                                onChange={(e) => setSelectedSemesterId(Number(e.target.value))}
                                                className="appearance-none bg-indigo-50/50 border border-indigo-200 text-indigo-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 pr-8 font-bold"
                                            >
                                                <option value="">اختر الفصل الدراسي</option>
                                                {semesters.map(term => (
                                                    <option key={term.id} value={term.id}>
                                                        {(term.name as any).ar || (term.name as any).en || term.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute left-2 top-3 text-indigo-400 pointer-events-none" size={16} />
                                        </div>

                                        {selectedSemesterId && (() => {
                                            const term = semesters.find(s => s.id === selectedSemesterId);
                                            if (term && term.start_date && term.end_date) {
                                                return (
                                                    <div className="flex flex-col text-xs px-3 border-r border-slate-100">
                                                        <span className="text-slate-400">الفترة الزمنية</span>
                                                        <span className="font-mono font-bold text-indigo-600" dir="ltr">
                                                            {new Date(term.start_date).toLocaleDateString()} - {new Date(term.end_date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </div>
                                </div>
                            </div>

                            {/* Day Tabs */}
                            <div className="flex border-b border-slate-100 overflow-x-auto p-2 gap-2 bg-slate-50/50">
                                {WEEKDAYS.map(day => (
                                    <button
                                        key={day.key}
                                        onClick={() => setSelectedDay(day.key)}
                                        className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${selectedDay === day.key
                                            ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200'
                                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
                                            }`}
                                    >
                                        {day.name}
                                    </button>
                                ))}
                            </div>

                            <div className="p-6 space-y-8">
                                {/* Day Activation & Booking Mode */}
                                <div className="flex flex-col md:flex-row gap-6 justify-between">
                                    <div className="flex items-center gap-4">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={currentDayConfig.isActive}
                                                onChange={(e) => updateDayConfig({ isActive: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <span className="ml-3 text-sm font-bold text-slate-700 whitespace-nowrap">تفعيل هذا اليوم</span>
                                            <div dir="ltr" className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                        </label>
                                    </div>

                                    <div className="flex bg-slate-100 p-1 rounded-lg">
                                        <button
                                            onClick={() => updateDayConfig({ bookingMode: 'individual' })}
                                            className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${currentDayConfig.bookingMode === 'individual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                                        >
                                            <Lock size={14} /> فردي (حصري)
                                        </button>
                                        <button
                                            onClick={() => updateDayConfig({ bookingMode: 'multiple' })}
                                            className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${currentDayConfig.bookingMode === 'multiple' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                                        >
                                            <Unlock size={14} /> متعدد (مفتوح)
                                        </button>
                                    </div>
                                </div>

                                {currentDayConfig.isActive && (
                                    <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-8">
                                        {/* Time Settings */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider">بداية الدوام</label>
                                                <div className="relative">
                                                    <input
                                                        type="time"
                                                        value={currentDayConfig.startTime}
                                                        onChange={(e) => updateDayConfig({ startTime: e.target.value })}
                                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-mono text-center font-bold text-slate-700"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider">نهاية الدوام</label>
                                                <div className="relative">
                                                    <input
                                                        type="time"
                                                        value={currentDayConfig.endTime}
                                                        onChange={(e) => updateDayConfig({ endTime: e.target.value })}
                                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-mono text-center font-bold text-slate-700"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider">مدة الحصة</label>
                                                <div className="relative">
                                                    <select
                                                        value={currentDayConfig.slotDurationMinutes}
                                                        onChange={(e) => updateDayConfig({ slotDurationMinutes: parseInt(e.target.value) })}
                                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-center font-bold text-slate-700 appearance-none"
                                                    >
                                                        <option value={30}>30 دقيقة</option>
                                                        <option value={45}>45 دقيقة</option>
                                                        <option value={60}>60 دقيقة</option>
                                                        <option value={90}>90 دقيقة</option>
                                                        <option value={120}>120 دقيقة (ساعتين)</option>
                                                    </select>
                                                    <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider">الفاصل الافتراضي</label>
                                                <div className="relative">
                                                    <select
                                                        value={currentDayConfig.gapMinutes}
                                                        onChange={(e) => updateDayConfig({ gapMinutes: parseInt(e.target.value) })}
                                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-center font-bold text-slate-700 appearance-none"
                                                    >
                                                        <option value={0}>لا يوجد</option>
                                                        <option value={5}>5 دقائق</option>
                                                        <option value={10}>10 دقائق</option>
                                                        <option value={15}>15 دقيقة</option>
                                                    </select>
                                                    <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Breaks Editor */}
                                        {/* Breaks Editor */}
                                        <div className="bg-amber-50/50 rounded-2xl p-6 border border-amber-100/60 ring-1 ring-amber-900/5">
                                            <div className="flex justify-between items-center mb-6">
                                                <h4 className="font-bold text-amber-900 flex items-center gap-2 text-base">
                                                    <div className="bg-amber-100 p-1.5 rounded-lg text-amber-600">
                                                        <Clock size={18} strokeWidth={2.5} />
                                                    </div>
                                                    فترات الراحة (Breaks)
                                                </h4>
                                                <button
                                                    onClick={() => addBreak()}
                                                    className="text-xs bg-white hover:bg-amber-50 text-amber-700 px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-all border border-amber-200 shadow-sm hover:shadow-md"
                                                >
                                                    <Plus size={14} strokeWidth={3} /> إضافة فترة راحة
                                                </button>
                                            </div>

                                            {currentDayConfig.breaks && currentDayConfig.breaks.length > 0 ? (
                                                <div className="space-y-3">
                                                    {currentDayConfig.breaks.map(item => (
                                                        <div key={item.id} className="flex items-center gap-4 bg-white p-3 rounded-xl border border-amber-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all group">
                                                            <div className="flex items-center gap-3 flex-1">
                                                                <span className="text-xs font-bold text-slate-400">من</span>
                                                                <input
                                                                    type="time"
                                                                    value={item.start}
                                                                    onChange={(e) => updateBreak(item.id, 'start', e.target.value)}
                                                                    className="px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all font-mono text-sm font-bold text-slate-700"
                                                                />
                                                                <span className="text-xs font-bold text-slate-400">إلى</span>
                                                                <input
                                                                    type="time"
                                                                    value={item.end}
                                                                    onChange={(e) => updateBreak(item.id, 'end', e.target.value)}
                                                                    className="px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all font-mono text-sm font-bold text-slate-700"
                                                                />
                                                            </div>
                                                            <button
                                                                onClick={() => removeBreak(item.id)}
                                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-100 lg:opacity-0 group-hover:opacity-100"
                                                                title="حذف الفترة"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 border-2 border-dashed border-amber-200/50 rounded-xl bg-amber-50/30">
                                                    <Clock size={24} className="mx-auto text-amber-300 mb-2" />
                                                    <p className="text-sm text-amber-800/60 font-medium">لا توجد فترات راحة محددة لهذا اليوم</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50 rounded-2xl p-12 text-center border-2 border-dashed border-slate-200">
                            <Settings size={32} className="mx-auto text-slate-300 mb-3" />
                            <p className="text-slate-400 font-medium">الرجاء اختيار صف دراسي للبدء في الإعداد</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Generator Action */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-900/20 relative overflow-hidden mt-10 border border-slate-700/50">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

                <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                    <div className="max-w-xl">
                        <h2 className="text-3xl font-bold mb-3 flex items-center gap-3">
                            <span className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300 ring-1 ring-indigo-500/40">
                                <Wand2 size={24} />
                            </span>
                            نشر الجدول الدراسي
                        </h2>
                        <p className="text-slate-300 text-lg leading-relaxed opacity-90">
                            {selectedSemesterId ?
                                `سيتم إنشاء الجداول للفترة من ${new Date(semesters.find(s => s.id === selectedSemesterId)?.start_date!).toLocaleDateString()} إلى ${new Date(semesters.find(s => s.id === selectedSemesterId)?.end_date!).toLocaleDateString()}`
                                : 'يرجى اختيار الفصل الدراسي أولاً لتحديد الفترة الزمنية للجدول.'}
                            <br />
                            احفظ الإعدادات أولاً ثم انقر للبدء في إنشاء الفترات الزمنية.
                        </p>
                    </div>
                    <button
                        onClick={handlePublishSlots}
                        disabled={isGenerating || !selectedSemesterId}
                        className={`px-10 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-900/20 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 active:translate-y-0 ${isGenerating
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed ring-1 ring-slate-700'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white ring-4 ring-indigo-600/20'
                            }`}
                    >
                        {isGenerating ? <Loader2 className="animate-spin" size={24} /> : 'تنفيذ الإنشاء الآن'}
                    </button>
                </div>
            </div>
        </div>
    );
}
