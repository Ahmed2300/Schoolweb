import { useState, useEffect, useMemo } from 'react';
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
import { frontendSettings } from '../../../services/FrontendSettingsService';
import type { ScheduleConfig, GradeSlotConfig, DayScheduleConfig, BreakInterval } from '../../../services/FrontendSettingsService';
import { adminService, SemesterData } from '../../../data/api/adminService';
import { useBulkCreateTimeSlots } from '../../hooks/useTimeSlots';

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
    const [config, setConfig] = useState<ScheduleConfig>(frontendSettings.getConfig());
    const [hasChanges, setHasChanges] = useState(false);

    // Grade State
    const [grades, setGrades] = useState<any[]>([]);
    const [semesters, setSemesters] = useState<SemesterData[]>([]);
    const [loadingGrades, setLoadingGrades] = useState(true);
    const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null);
    const [selectedDay, setSelectedDay] = useState<number>(0); // Default Sunday

    // Generation State
    const [isGenerating, setIsGenerating] = useState(false);
    const bulkCreateMutation = useBulkCreateTimeSlots();

    // Reload config on mount and listen for updates
    useEffect(() => {
        const loadConfig = () => setConfig(frontendSettings.getConfig());
        window.addEventListener('schedule-config-updated', loadConfig);
        return () => window.removeEventListener('schedule-config-updated', loadConfig);
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

    // Fetch Semesters when Selected Grade Changes
    useEffect(() => {
        const fetchSemestersForGrade = async () => {
            if (!selectedGradeId) return;
            try {
                // Fetch semesters linked to this grade
                const data = await adminService.getSemestersByGrade(selectedGradeId);
                console.log('AdminScheduleConfig: Fetched semesters for grade', selectedGradeId, data);
                setSemesters(data || []);
            } catch (error) {
                console.error('Failed to fetch semesters:', error);
                // Don't show toast error here to avoid spamming if endpoint 404s for grades with no semesters
            }
        };
        fetchSemestersForGrade();
    }, [selectedGradeId]);

    const handleSave = async () => {
        if (config.term.startDate && config.term.endDate) {
            if (new Date(config.term.startDate) > new Date(config.term.endDate)) {
                toast.error('تاريخ البداية يجب أن يكون قبل تاريخ النهاية');
                return;
            }
        }

        // Save backend settings for Exam Schedules (semesterId === -1)
        const examConfigs = config.gradeConfigs
            .filter(g => g.term?.semesterId === -1 && g.term?.isActive && g.term?.startDate && g.term?.endDate);

        if (examConfigs.length > 0) {
            const promises = [];
            for (const gradeConfig of examConfigs) {
                // Save Start Date
                promises.push(adminService.upsertSetting({
                    key: `grade_${gradeConfig.gradeId}_exam_start_date`,
                    value: gradeConfig.term!.startDate!,
                    type: 'date',
                    description: `Start date for Grade ${gradeConfig.gradeId} Exam Review Period`
                }));
                // Save End Date
                promises.push(adminService.upsertSetting({
                    key: `grade_${gradeConfig.gradeId}_exam_end_date`,
                    value: gradeConfig.term!.endDate!,
                    type: 'date',
                    description: `End date for Grade ${gradeConfig.gradeId} Exam Review Period`
                }));
            }

            try {
                await Promise.all(promises);
                console.log('Backend exam settings saved successfully');
            } catch (error) {
                console.error('Failed to save backend exam settings', error);
                toast.error('فشل حفظ تواريخ الامتحانات في النظام');
                // We typically continue to save local config anyway, or return?
                // Let's continue but warn.
            }
        }

        frontendSettings.saveConfig(config);
        setHasChanges(false);
        toast.success('تم حفظ الإعدادات بنجاح');
    };

    const updateTerm = (key: keyof typeof config.term, value: string | boolean) => {
        setConfig(prev => ({
            ...prev,
            term: { ...prev.term, [key]: value }
        }));
        setHasChanges(true);
    };

    // Helper to get or initialize Grade Config
    const getGradeConfig = (gradeId: number): GradeSlotConfig => {
        return config.gradeConfigs.find(c => c.gradeId === gradeId) || {
            gradeId,
            days: {
                0: { isActive: true, startTime: '08:00', endTime: '14:00', slotDurationMinutes: 60, gapMinutes: 0, bookingMode: 'individual', breaks: [] },
                1: { isActive: true, startTime: '08:00', endTime: '14:00', slotDurationMinutes: 60, gapMinutes: 0, bookingMode: 'individual', breaks: [] },
                2: { isActive: true, startTime: '08:00', endTime: '14:00', slotDurationMinutes: 60, gapMinutes: 0, bookingMode: 'individual', breaks: [] },
                3: { isActive: true, startTime: '08:00', endTime: '14:00', slotDurationMinutes: 60, gapMinutes: 0, bookingMode: 'individual', breaks: [] },
                4: { isActive: true, startTime: '08:00', endTime: '14:00', slotDurationMinutes: 60, gapMinutes: 0, bookingMode: 'individual', breaks: [] },
                5: { isActive: false, startTime: '08:00', endTime: '14:00', slotDurationMinutes: 60, gapMinutes: 0, bookingMode: 'individual', breaks: [] },
                6: { isActive: false, startTime: '08:00', endTime: '14:00', slotDurationMinutes: 60, gapMinutes: 0, bookingMode: 'individual', breaks: [] }
            }
        };
    };

    // Update specific day config
    const updateDayConfig = (gradeId: number, dayKey: number, updates: Partial<DayScheduleConfig>) => {
        const gradeConfig = getGradeConfig(gradeId);
        const dayConfig = gradeConfig.days[dayKey] || { isActive: false, startTime: '08:00', endTime: '14:00', slotDurationMinutes: 60, gapMinutes: 0, bookingMode: 'individual', breaks: [] };

        const newDayConfig = { ...dayConfig, ...updates };
        const newDays = { ...gradeConfig.days, [dayKey]: newDayConfig };

        frontendSettings.updateGradeConfig(gradeId, { days: newDays });
        setHasChanges(false); // Saved via service
        setConfig(frontendSettings.getConfig()); // Refresh
    };

    // Break Management
    const addBreak = (gradeId: number, dayKey: number) => {
        const gradeConfig = getGradeConfig(gradeId);
        const dayConfig = gradeConfig.days[dayKey];
        const newBreak: BreakInterval = { id: Math.random().toString(36).substr(2, 9), start: '10:00', end: '10:30' };
        updateDayConfig(gradeId, dayKey, { breaks: [...(dayConfig.breaks || []), newBreak] });
    };

    const removeBreak = (gradeId: number, dayKey: number, breakId: string) => {
        const gradeConfig = getGradeConfig(gradeId);
        const dayConfig = gradeConfig.days[dayKey];
        updateDayConfig(gradeId, dayKey, { breaks: dayConfig.breaks.filter(b => b.id !== breakId) });
    };

    const updateBreak = (gradeId: number, dayKey: number, breakId: string, field: 'start' | 'end', value: string) => {
        const gradeConfig = getGradeConfig(gradeId);
        const dayConfig = gradeConfig.days[dayKey];
        const newBreaks = dayConfig.breaks.map(b => b.id === breakId ? { ...b, [field]: value } : b);
        updateDayConfig(gradeId, dayKey, { breaks: newBreaks });
    };

    // Update grade-specific term
    const updateGradeTerm = (gradeId: number, termUpdates: any) => {
        console.log('AdminScheduleConfig: Updating grade term', gradeId, termUpdates);
        frontendSettings.updateGradeConfig(gradeId, { term: termUpdates });
        setHasChanges(false);
        setConfig(frontendSettings.getConfig());
    };

    // Slot Generation Logic
    const generatedPreview = useMemo(() => {
        // 1. Determine Global Range (Min Start -> Max End)
        let minStart: Date | null = null;
        let maxEnd: Date | null = null;

        // Check Global Term
        if (config.term.startDate && config.term.endDate) {
            minStart = new Date(config.term.startDate);
            maxEnd = new Date(config.term.endDate);
        }

        // Check Grade Overrides
        config.gradeConfigs.forEach(g => {
            if (g.term?.startDate && g.term?.endDate && g.term?.isActive) {
                const s = new Date(g.term.startDate);
                const e = new Date(g.term.endDate);
                if (!minStart || s < minStart) minStart = s;
                if (!maxEnd || e > maxEnd) maxEnd = e;
            }
        });

        if (!minStart || !maxEnd) return { count: 0, distinctSlots: [] };

        const distinctSlots = new Map<string, { start_time: string, end_time: string }>();
        const loopDate = new Date(minStart);

        while (loopDate <= maxEnd) {
            const dayOfWeek = loopDate.getDay();
            const dateStr = loopDate.toLocaleDateString('en-CA'); // YYYY-MM-DD

            // Loop through all grades
            config.gradeConfigs.forEach(gradeConfig => {
                // Check if this date is valid for this specific grade
                const termToUse = (gradeConfig.term && gradeConfig.term.isActive) ? gradeConfig.term : config.term;

                // If term is invalid or inactive, skip
                if (!termToUse.startDate || !termToUse.endDate || !termToUse.isActive) return;

                const termStart = new Date(termToUse.startDate);
                const termEnd = new Date(termToUse.endDate);
                termStart.setHours(0, 0, 0, 0);
                termEnd.setHours(23, 59, 59, 999);

                // Skip if date is outside this grade's term
                // Note: loopDate is already normalized by setHours logic usually, but let's be safe
                const currentCheck = new Date(loopDate);
                currentCheck.setHours(0, 0, 0, 0);
                if (currentCheck < termStart || currentCheck > termEnd) return;


                const dayConfig = gradeConfig.days[dayOfWeek];
                if (dayConfig && dayConfig.isActive) {

                    const [startH, startM] = dayConfig.startTime.split(':').map(Number);
                    const [endH, endM] = dayConfig.endTime.split(':').map(Number);

                    let currentMinutes = startH * 60 + startM;
                    const endMinutes = endH * 60 + endM;

                    // Parse Breaks into minutes ranges
                    const breakRanges = (dayConfig.breaks || []).map(b => {
                        const [bStartH, bStartM] = b.start.split(':').map(Number);
                        const [bEndH, bEndM] = b.end.split(':').map(Number);
                        return { start: bStartH * 60 + bStartM, end: bEndH * 60 + bEndM };
                    });

                    while (currentMinutes + dayConfig.slotDurationMinutes <= endMinutes) {
                        const slotStartMins = currentMinutes;
                        const slotEndMins = currentMinutes + dayConfig.slotDurationMinutes;

                        // Check intersection with ANY break
                        // Conflict if (SlotStart < BreakEnd) AND (SlotEnd > BreakStart)
                        const hasConflict = breakRanges.some(br =>
                            slotStartMins < br.end && slotEndMins > br.start
                        );

                        if (!hasConflict) {
                            const slotStartH = Math.floor(slotStartMins / 60);
                            const slotStartM = slotStartMins % 60;
                            const slotEndH = Math.floor(slotEndMins / 60);
                            const slotEndM = slotEndMins % 60;

                            const timeKey = `${dateStr} ${slotStartH}:${slotStartM}-${slotEndH}:${slotEndM}`;
                            const startTimeStr = `${dateStr} ${String(slotStartH).padStart(2, '0')}:${String(slotStartM).padStart(2, '0')}:00`;
                            const endTimeStr = `${dateStr} ${String(slotEndH).padStart(2, '0')}:${String(slotEndM).padStart(2, '0')}:00`;

                            distinctSlots.set(timeKey, {
                                start_time: startTimeStr,
                                end_time: endTimeStr
                            });
                        }

                        currentMinutes += dayConfig.slotDurationMinutes + (dayConfig.gapMinutes || 0);
                    }
                }
            });

            loopDate.setDate(loopDate.getDate() + 1);
        }

        return { count: distinctSlots.size, distinctSlots: Array.from(distinctSlots.values()) };
    }, [config]);

    const handlePublishSlots = async () => {
        if (generatedPreview.count === 0) return;
        if (!window.confirm(`سيتم إنشاء ${generatedPreview.count} فترة زمنية. هل أنت متأكد؟`)) return;

        setIsGenerating(true);
        try {
            const slots = generatedPreview.distinctSlots;
            const chunkSize = 20;
            let createdCount = 0;

            for (let i = 0; i < slots.length; i += chunkSize) {
                const chunk = slots.slice(i, i + chunkSize);
                try {
                    await bulkCreateMutation.mutateAsync(chunk);
                    createdCount += chunk.length;
                    await new Promise(r => setTimeout(r, 200));
                } catch (e) {
                    console.error('Chunk failed', e);
                }
            }

            toast.success(`تم إنشاء ${createdCount} فترة بنجاح.`);
        } catch (error) {
            console.error('Generation failed:', error);
            toast.error('حدث خطأ أثناء إنشاء الفترات');
        } finally {
            setIsGenerating(false);
        }
    };

    const currentDayConfig = selectedGradeId ? getGradeConfig(selectedGradeId).days[selectedDay] || { isActive: false, startTime: '08:00', endTime: '14:00', slotDurationMinutes: 60, gapMinutes: 0, bookingMode: 'individual', breaks: [] } : null;

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

                            {/* Per-Grade Settings Header (Term Dates) */}
                            {/* Per-Grade Settings Header (Semester Allocation) */}
                            <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Calendar size={18} className="text-indigo-600" />
                                    تخصيص الفصل الدراسي لهذا الصف
                                </h3>

                                <div className="flex flex-col gap-4">
                                    {/* Semester Selection */}
                                    <div className="flex items-center gap-4 flex-wrap">
                                        <div className="flex-1 min-w-[200px]">
                                            <label className="text-xs font-bold text-slate-500 mb-1 block">اختر الفصل الدراسي</label>
                                            <div className="relative">
                                                <select
                                                    value={getGradeConfig(selectedGradeId).term?.semesterId || ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        const currentTerm = getGradeConfig(selectedGradeId).term || { ...config.term };

                                                        if (!val) {
                                                            updateGradeTerm(selectedGradeId, {
                                                                ...currentTerm,
                                                                semesterId: undefined,
                                                                isActive: false // Deactivate if reset
                                                            });
                                                            return;
                                                        }

                                                        const semId = Number(val);

                                                        // Case: Exam Schedule (Manual Dates)
                                                        if (semId === -1) {
                                                            updateGradeTerm(selectedGradeId, {
                                                                ...currentTerm,
                                                                semesterId: -1,
                                                                isActive: true
                                                            });
                                                            return;
                                                        }

                                                        const semester = semesters.find(s => s.id === semId);
                                                        console.log('AdminScheduleConfig: Selected semester', semId, semester);
                                                        if (semester) {
                                                            updateGradeTerm(selectedGradeId, {
                                                                ...currentTerm,
                                                                semesterId: semId,
                                                                startDate: semester.start_date ? semester.start_date.substring(0, 10) : '',
                                                                endDate: semester.end_date ? semester.end_date.substring(0, 10) : '',
                                                                isActive: true // Auto-activate
                                                            });
                                                        }
                                                    }}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500/20 appearance-none"
                                                >
                                                    <option value="">-- اختر الفصل (إلغاء التخصيص) --</option>
                                                    <option value="-1" className="font-bold text-indigo-700 bg-indigo-50">📅 جدول الامتحانات (تحديد يدوي)</option>
                                                    <hr />
                                                    {semesters
                                                        .map(sem => (
                                                            <option key={sem.id} value={sem.id}>
                                                                {typeof sem.name === 'string' ? sem.name : (sem.name.ar || sem.name.en)}
                                                            </option>
                                                        ))}
                                                </select>
                                                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Date Display / Edit */}
                                    <div className={`flex flex-wrap gap-4 items-end p-3 rounded-lg border transition-colors ${getGradeConfig(selectedGradeId).term?.semesterId === -1
                                        ? 'bg-white border-indigo-200 shadow-sm'
                                        : 'bg-slate-50 border-slate-100 opacity-70'
                                        }`}>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 mb-1 block">تاريخ البدء</label>
                                            <input
                                                type="date"
                                                value={getGradeConfig(selectedGradeId).term?.startDate?.substring(0, 10) || ''}
                                                onChange={(e) => {
                                                    // Only allow edit if Exam Schedule (-1)
                                                    if (getGradeConfig(selectedGradeId).term?.semesterId === -1) {
                                                        const currentTerm = getGradeConfig(selectedGradeId).term || { ...config.term };
                                                        updateGradeTerm(selectedGradeId, { ...currentTerm, startDate: e.target.value });
                                                    }
                                                }}
                                                readOnly={getGradeConfig(selectedGradeId).term?.semesterId !== -1}
                                                disabled={getGradeConfig(selectedGradeId).term?.semesterId !== -1}
                                                className={`px-3 py-2 border rounded-lg text-sm transition-all focus:ring-2 focus:ring-indigo-500/20 ${getGradeConfig(selectedGradeId).term?.semesterId === -1
                                                    ? 'bg-white border-slate-300 cursor-text'
                                                    : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                                                    }`}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 mb-1 block">تاريخ الانتهاء</label>
                                            <input
                                                type="date"
                                                value={getGradeConfig(selectedGradeId).term?.endDate?.substring(0, 10) || ''}
                                                onChange={(e) => {
                                                    if (getGradeConfig(selectedGradeId).term?.semesterId === -1) {
                                                        const currentTerm = getGradeConfig(selectedGradeId).term || { ...config.term };
                                                        updateGradeTerm(selectedGradeId, { ...currentTerm, endDate: e.target.value });
                                                    }
                                                }}
                                                readOnly={getGradeConfig(selectedGradeId).term?.semesterId !== -1}
                                                disabled={getGradeConfig(selectedGradeId).term?.semesterId !== -1}
                                                className={`px-3 py-2 border rounded-lg text-sm transition-all focus:ring-2 focus:ring-indigo-500/20 ${getGradeConfig(selectedGradeId).term?.semesterId === -1
                                                    ? 'bg-white border-slate-300 cursor-text'
                                                    : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                                                    }`}
                                            />
                                        </div>
                                        <span className="text-xs text-slate-400 mr-auto self-end pb-2">
                                            {getGradeConfig(selectedGradeId).term?.semesterId === -1
                                                ? '* يمكنك تحديد فترة الامتحانات يدوياً'
                                                : '* يتم تحديد التواريخ تلقائياً بناءً على الفصل المختار'}
                                        </span>
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
                                                onChange={(e) => updateDayConfig(selectedGradeId, selectedDay, { isActive: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <span className="ml-3 text-sm font-bold text-slate-700 whitespace-nowrap">تفعيل هذا اليوم</span>
                                            <div dir="ltr" className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                        </label>
                                    </div>

                                    <div className="flex bg-slate-100 p-1 rounded-lg">
                                        <button
                                            onClick={() => updateDayConfig(selectedGradeId, selectedDay, { bookingMode: 'individual' })}
                                            className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${currentDayConfig.bookingMode === 'individual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                                        >
                                            <Lock size={14} /> فردي (حصري)
                                        </button>
                                        <button
                                            onClick={() => updateDayConfig(selectedGradeId, selectedDay, { bookingMode: 'multiple' })}
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
                                                        onChange={(e) => updateDayConfig(selectedGradeId, selectedDay, { startTime: e.target.value })}
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
                                                        onChange={(e) => updateDayConfig(selectedGradeId, selectedDay, { endTime: e.target.value })}
                                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-mono text-center font-bold text-slate-700"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider">مدة الحصة</label>
                                                <div className="relative">
                                                    <select
                                                        value={currentDayConfig.slotDurationMinutes}
                                                        onChange={(e) => updateDayConfig(selectedGradeId, selectedDay, { slotDurationMinutes: parseInt(e.target.value) })}
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
                                                        onChange={(e) => updateDayConfig(selectedGradeId, selectedDay, { gapMinutes: parseInt(e.target.value) })}
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
                                                    onClick={() => addBreak(selectedGradeId, selectedDay)}
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
                                                                    onChange={(e) => updateBreak(selectedGradeId, selectedDay, item.id, 'start', e.target.value)}
                                                                    className="px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all font-mono text-sm font-bold text-slate-700"
                                                                />
                                                                <span className="text-xs font-bold text-slate-400">إلى</span>
                                                                <input
                                                                    type="time"
                                                                    value={item.end}
                                                                    onChange={(e) => updateBreak(selectedGradeId, selectedDay, item.id, 'end', e.target.value)}
                                                                    className="px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all font-mono text-sm font-bold text-slate-700"
                                                                />
                                                            </div>
                                                            <button
                                                                onClick={() => removeBreak(selectedGradeId, selectedDay, item.id)}
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
                            سيتم تحليل القواعد وإنشاء <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded-md">{generatedPreview.count}</span> فترة زمنية جاهزة للحجز.
                        </p>
                    </div>
                    <button
                        onClick={handlePublishSlots}
                        disabled={isGenerating || generatedPreview.count === 0}
                        className={`px-10 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-900/20 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 active:translate-y-0 ${isGenerating || generatedPreview.count === 0
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
