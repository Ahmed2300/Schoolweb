import { useState, useCallback, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Check, Video, FileText, Calendar, Loader2, Radio, Upload, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { lectureService } from '../../../data/api/lectureService';
import { adminService } from '../../../data/api/adminService';
import { VideoUploader } from './VideoUploader';
import { ApprovedSlotSelector, DatedSlot } from '../teacher/timeslots/ApprovedSlotSelector';

interface CourseOption {
    id: number;
    name: string;
}

interface TeacherOption {
    id: number;
    name: string;
}

interface UnitOption {
    id: number;
    title: { ar?: string; en?: string } | string;
}

interface AddLectureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    courses: CourseOption[];
    teachers: TeacherOption[];
    initialCourseId?: number;
    initialUnitId?: number;
}

interface FormData {
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    courseId: string;
    unitId: string;
    teacherId: string;
    startTime: string;
    endTime: string;
    isOnline: boolean | null; // null = not yet chosen
}

const initialFormData: FormData = {
    titleAr: '',
    titleEn: '',
    descriptionAr: '',
    descriptionEn: '',
    courseId: '',
    unitId: '',
    teacherId: '',
    startTime: '',
    endTime: '',
    isOnline: null as boolean | null, // null = not yet chosen
};

export function AddLectureModal({
    isOpen,
    onClose,
    onSuccess,
    courses,
    teachers,
    initialCourseId,
    initialUnitId
}: AddLectureModalProps) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({
        ...initialFormData,
        courseId: initialCourseId?.toString() || '',
        unitId: initialUnitId?.toString() || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadedVideoPath, setUploadedVideoPath] = useState<string | null>(null);
    const [units, setUnits] = useState<UnitOption[]>([]);
    const [loadingUnits, setLoadingUnits] = useState(false);

    const [courseDates, setCourseDates] = useState<{ start: string; end: string } | null>(null);
    const [gradeId, setGradeId] = useState<number | undefined>();
    const [semesterId, setSemesterId] = useState<number | undefined>();
    const [selectedSlot, setSelectedSlot] = useState<DatedSlot | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // Helper to extract unit name
    const getUnitName = (unit: UnitOption): string => {
        if (typeof unit.title === 'string') return unit.title;
        return unit.title?.ar || unit.title?.en || `وحدة ${unit.id}`;
    };

    // Fetch units and course details when course changes
    useEffect(() => {
        const fetchCourseData = async () => {
            if (!formData.courseId) {
                setUnits([]);
                setCourseDates(null);
                return;
            }
            setLoadingUnits(true);
            try {
                // Fetch units
                const unitsResponse = await adminService.getUnits(parseInt(formData.courseId));
                setUnits(unitsResponse.data || unitsResponse || []);

                // Fetch course details for dates and teacher
                const courseDetails = await adminService.getCourse(parseInt(formData.courseId));
                if (courseDetails) {
                    setGradeId(courseDetails.grade_id);
                    setSemesterId(courseDetails.semester_id);
                    const startDate = courseDetails.start_date ? courseDetails.start_date.split('T')[0] + 'T09:00' : '';
                    const endDate = courseDetails.end_date ? courseDetails.end_date.split('T')[0] + 'T10:00' : '';
                    setCourseDates({ start: startDate, end: endDate });

                    // Auto-populate teacher and dates from course
                    setFormData(prev => ({
                        ...prev,
                        teacherId: courseDetails.teacher_id?.toString() || prev.teacherId,
                        startTime: !prev.isOnline ? startDate : prev.startTime,
                        endTime: !prev.isOnline ? endDate : prev.endTime,
                    }));
                }
            } catch (err) {
                console.error('Error fetching course data:', err);
                setUnits([]);
                setCourseDates(null);
            } finally {
                setLoadingUnits(false);
            }
        };
        fetchCourseData();
    }, [formData.courseId]);

    const resetForm = useCallback(() => {
        setFormData(initialFormData);
        setStep(1);
        setError(null);
        setUploadedVideoPath(null);
    }, []);

    const handleClose = useCallback(() => {
        if (!loading) {
            resetForm();
            onClose();
        }
    }, [loading, onClose, resetForm]);

    const handleSubmitDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Basic validation
        if (!formData.titleAr || !formData.courseId || !formData.teacherId) {
            setError('يرجى ملء جميع الحقول المطلوبة');
            return;
        }

        // Lecture type must be explicitly chosen
        if (formData.isOnline === null) {
            setError('يرجى اختيار نوع المحاضرة: بث مباشر أو فيديو مسجل');
            return;
        }

        if (formData.isOnline) {
            await handleFinalSubmit();
        } else {
            setStep(2);
        }
    };

    const handleFinalSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            const lectureData = {
                title: { ar: formData.titleAr, en: formData.titleEn },
                description: { ar: formData.descriptionAr, en: formData.descriptionEn },
                course_id: parseInt(formData.courseId),
                unit_id: formData.unitId ? parseInt(formData.unitId) : undefined,
                teacher_id: parseInt(formData.teacherId),
                start_time: formData.startTime || undefined,
                end_time: formData.endTime || undefined,
                is_online: formData.isOnline as boolean, // safe: validated non-null before reaching here
            };

            if (uploadedVideoPath) {
                await lectureService.createLectureWithVideo(lectureData, uploadedVideoPath);
            } else {
                await lectureService.createLecture(lectureData);
            }

            onSuccess();
            resetForm();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'فشل إنشاء المحاضرة');
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    style={{ direction: 'rtl' }}
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.95, y: 20, opacity: 0 }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                        className="bg-white dark:bg-[#1E1E1E] rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-card hover:shadow-card-hover text-right border border-slate-200 dark:border-white/5 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5 flex-none">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">إضافة محاضرة جديدة</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">الخطوة {step} من 2</p>
                            </div>
                            <button onClick={handleClose} disabled={loading} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Steps Indicator */}
                        <div className="px-6 py-4 flex-none border-b border-slate-50 dark:border-white/5">
                            <div className="flex items-center justify-between relative max-w-md mx-auto">
                                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-100 dark:bg-white/5 -z-10 rounded-full" />
                                <div className={`flex flex-col items-center gap-2 bg-white dark:bg-[#1E1E1E] px-2 ${step >= 1 ? 'text-shibl-crimson' : 'text-slate-grey dark:text-gray-500'}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${step >= 1 ? 'border-shibl-crimson bg-rose-50 dark:bg-shibl-crimson/10' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E1E1E]'}`}>
                                        <FileText size={20} />
                                    </div>
                                    <span className="text-xs font-bold">بيانات المحاضرة</span>
                                </div>
                                <div className={`flex flex-col items-center gap-2 bg-white dark:bg-[#1E1E1E] px-2 ${step >= 2 ? 'text-shibl-crimson' : 'text-slate-grey dark:text-gray-500'}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${step >= 2 ? 'border-shibl-crimson bg-rose-50 dark:bg-shibl-crimson/10' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E1E1E]'}`}>
                                        <Video size={20} />
                                    </div>
                                    <span className="text-xs font-bold">الفيديو (اختياري)</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar overscroll-contain">
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm">
                                    <X size={18} />
                                    {error}
                                </div>
                            )}

                            <AnimatePresence mode="wait">
                                {step === 1 ? (
                                    <motion.form
                                        key="step1"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3 }}
                                        id="detailsForm"
                                        onSubmit={handleSubmitDetails}
                                        className="space-y-6"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-charcoal">عنوان المحاضرة (بالعربية) *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.titleAr}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, titleAr: e.target.value }))}
                                                    className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] text-charcoal dark:text-white focus:border-shibl-crimson focus:ring-1 focus:ring-shibl-crimson/30 outline-none transition-all placeholder-slate-400"
                                                    dir="rtl"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-charcoal">Lecture Title (English)</label>
                                                <input
                                                    type="text"
                                                    value={formData.titleEn}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, titleEn: e.target.value }))}
                                                    className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] text-charcoal dark:text-white focus:border-shibl-crimson focus:ring-1 focus:ring-shibl-crimson/30 outline-none transition-all placeholder-slate-400"
                                                    dir="ltr"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-charcoal">الكورس *</label>
                                                <select
                                                    required
                                                    value={formData.courseId}
                                                    onChange={(e) => {
                                                        setFormData(prev => ({ ...prev, courseId: e.target.value, unitId: '' }));
                                                    }}
                                                    className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] text-charcoal dark:text-white focus:border-shibl-crimson focus:ring-1 focus:ring-shibl-crimson/30 outline-none transition-all appearance-none cursor-pointer"
                                                >
                                                    <option value="">اختر الكورس</option>
                                                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                </select>
                                            </div>
                                            {/* Unit dropdown - shows after course selection */}
                                            {formData.courseId && (
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-medium text-charcoal flex items-center gap-2">
                                                        الوحدة
                                                        {loadingUnits && <Loader2 size={14} className="animate-spin text-slate-400" />}
                                                    </label>
                                                    <select
                                                        value={formData.unitId}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, unitId: e.target.value }))}
                                                        disabled={loadingUnits}
                                                        className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] text-charcoal dark:text-white focus:border-shibl-crimson focus:ring-1 focus:ring-shibl-crimson/30 outline-none transition-all appearance-none disabled:bg-slate-50 dark:disabled:bg-white/5 disabled:cursor-not-allowed cursor-pointer"
                                                    >
                                                        <option value="">{loadingUnits ? 'جاري التحميل...' : units.length === 0 ? 'لا توجد وحدات' : 'اختر الوحدة (اختياري)'}</option>
                                                        {units.map(u => <option key={u.id} value={u.id}>{getUnitName(u)}</option>)}
                                                    </select>
                                                </div>
                                            )}
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-charcoal flex items-center gap-2">
                                                    المدرس
                                                    {formData.courseId && formData.teacherId && (
                                                        <span className="text-xs text-emerald-600 font-normal">(من الكورس)</span>
                                                    )}
                                                </label>
                                                <select
                                                    required
                                                    value={formData.teacherId}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, teacherId: e.target.value }))}
                                                    disabled={!!formData.courseId && !!formData.teacherId}
                                                    className={`w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-white/10 text-charcoal dark:text-white focus:border-shibl-crimson focus:ring-1 focus:ring-shibl-crimson/30 outline-none transition-all appearance-none cursor-pointer ${formData.courseId && formData.teacherId ? 'bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 cursor-not-allowed pointer-events-none' : 'bg-white dark:bg-[#121212]'}`}
                                                >
                                                    <option value="">اختر المدرس</option>
                                                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                </select>
                                            </div>

                                            <div className="col-span-full">
                                                <label className="text-sm font-medium text-charcoal mb-1.5 block">الوصف (بالعربية)</label>
                                                <textarea
                                                    rows={3}
                                                    value={formData.descriptionAr}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, descriptionAr: e.target.value }))}
                                                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] text-charcoal dark:text-white focus:border-shibl-crimson focus:ring-1 focus:ring-shibl-crimson/30 outline-none transition-all resize-none placeholder-slate-400"
                                                    dir="rtl"
                                                />
                                            </div>

                                            {formData.isOnline === true ? (
                                                <div className="col-span-full space-y-2 mt-2">
                                                    <label className="text-sm font-medium text-charcoal block">
                                                        الموعد (اختر من المواعيد المتاحة للمدرس)
                                                    </label>
                                                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                                                        {formData.teacherId ? (
                                                            <ApprovedSlotSelector
                                                                onSelect={(slot) => {
                                                                    setSelectedSlot(slot);
                                                                    setSelectedDate(slot?.dateString || null);
                                                                    if (slot) {
                                                                        const start = `${slot.dateString}T${slot.start_time.substring(0, 5)}`;
                                                                        const end = `${slot.dateString}T${slot.end_time.substring(0, 5)}`;
                                                                        setFormData(prev => ({ ...prev, startTime: start, endTime: end }));
                                                                    } else {
                                                                        setFormData(prev => ({ ...prev, startTime: '', endTime: '' }));
                                                                    }
                                                                }}
                                                                selectedSlotId={selectedSlot?.id || null}
                                                                selectedDate={selectedDate}
                                                                gradeId={gradeId}
                                                                semesterId={semesterId}
                                                                teacherId={parseInt(formData.teacherId)}
                                                                onRequestNewSlot={() => { }}
                                                            />
                                                        ) : (
                                                            <div className="text-center py-8 text-slate-500 bg-white rounded-lg border border-slate-200 border-dashed">
                                                                <Calendar className="mx-auto mb-2 text-slate-300" size={24} />
                                                                <p>يرجى اختيار المدرس أولاً لعرض المواعيد المتاحة</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* Hidden inputs to maintain form data compatibility if needed, or just relying on state */}
                                                    {formData.startTime && (
                                                        <div className="text-xs text-slate-500 mt-1 flex gap-4">
                                                            <span>البدء: {new Date(formData.startTime).toLocaleString('ar-SA')}</span>
                                                            <span>الانتهاء: {new Date(formData.endTime).toLocaleString('ar-SA')}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="space-y-1.5">
                                                        <label className="text-sm font-medium text-charcoal flex items-center gap-2">
                                                            وقت البدء
                                                            {courseDates && (
                                                                <span className="text-xs text-slate-400">(من الكورس)</span>
                                                            )}
                                                        </label>
                                                        <div className="relative">
                                                            <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                                            <input
                                                                type="datetime-local"
                                                                value={formData.startTime}
                                                                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                                                                className="w-full h-11 pr-10 pl-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] text-charcoal dark:text-white focus:border-shibl-crimson focus:ring-1 focus:ring-shibl-crimson/30 outline-none transition-all text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-sm font-medium text-charcoal flex items-center gap-2">
                                                            وقت الانتهاء
                                                            {courseDates && (
                                                                <span className="text-xs text-slate-400">(من الكورس)</span>
                                                            )}
                                                        </label>
                                                        <div className="relative">
                                                            <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                                            <input
                                                                type="datetime-local"
                                                                value={formData.endTime}
                                                                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                                                                className="w-full h-11 pr-10 pl-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] text-charcoal dark:text-white focus:border-shibl-crimson focus:ring-1 focus:ring-shibl-crimson/30 outline-none transition-all text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* Lecture Type Selection — REQUIRED */}
                                            <div className="col-span-full pt-2 space-y-3">
                                                <label className="text-sm font-medium text-charcoal flex items-center gap-2">
                                                    نوع المحاضرة <span className="text-red-500">*</span>
                                                </label>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {/* Live Lecture Card */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, isOnline: true }))}
                                                        className={`flex justify-start items-center gap-3 p-4 rounded-xl border-2 text-right transition-all duration-300 ${formData.isOnline === true
                                                            ? 'border-shibl-crimson bg-rose-50 dark:bg-shibl-crimson/10 ring-1 ring-shibl-crimson/30 shadow-crimson'
                                                            : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:bg-soft-cloud dark:hover:bg-white/5'
                                                            }`}
                                                    >
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${formData.isOnline === true
                                                            ? 'bg-rose-100 dark:bg-shibl-crimson/20 text-shibl-crimson'
                                                            : 'bg-soft-cloud dark:bg-white/10 text-slate-grey dark:text-slate-400'
                                                            }`}>
                                                            <Radio size={20} />
                                                        </div>
                                                        <div>
                                                            <span className={`text-sm font-bold block transition-colors ${formData.isOnline === true
                                                                ? 'text-shibl-crimson'
                                                                : 'text-charcoal dark:text-white'
                                                                }`}>بث مباشر (أونلاين)</span>
                                                            <span className="text-xs text-slate-500 dark:text-slate-400">جدولة موعد للبث المباشر مع الطلاب</span>
                                                        </div>
                                                    </button>

                                                    {/* Recorded Lecture Card */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData(prev => ({ ...prev, isOnline: false }));
                                                            setSelectedSlot(null);
                                                            setSelectedDate(null);
                                                        }}
                                                        className={`flex justify-start items-center gap-3 p-4 rounded-xl border-2 text-right transition-all duration-300 ${formData.isOnline === false
                                                            ? 'border-success-green bg-success-green/5 ring-1 ring-success-green/30 shadow-[0_4px_14px_0_rgba(39,174,96,0.15)]'
                                                            : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:bg-soft-cloud dark:hover:bg-white/5'
                                                            }`}
                                                    >
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${formData.isOnline === false
                                                            ? 'bg-success-green/10 text-success-green'
                                                            : 'bg-soft-cloud dark:bg-white/10 text-slate-grey dark:text-slate-400'
                                                            }`}>
                                                            <Upload size={20} />
                                                        </div>
                                                        <div>
                                                            <span className={`text-sm font-bold block transition-colors ${formData.isOnline === false
                                                                ? 'text-success-green'
                                                                : 'text-charcoal dark:text-white'
                                                                }`}>فيديو مسجل</span>
                                                            <span className="text-xs text-slate-500 dark:text-slate-400">رفع فيديو مسجل مسبقاً للطلاب</span>
                                                        </div>
                                                    </button>
                                                </div>
                                                {formData.isOnline === null && (
                                                    <p className="text-xs text-slate-400 flex items-center gap-1">
                                                        <AlertCircle size={14} />
                                                        يجب اختيار نوع المحاضرة للمتابعة
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.form>
                                ) : (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-6 max-w-2xl mx-auto"
                                    >
                                        <div className="text-center space-y-2">
                                            <h3 className="font-semibold text-charcoal">رفع فيديو المحاضرة</h3>
                                            <p className="text-sm text-slate-500">يرجى رفع فيديو المحاضرة المسجلة</p>
                                        </div>

                                        <VideoUploader
                                            onUploadComplete={(path) => setUploadedVideoPath(path)}
                                            onError={(msg) => console.error(msg)}
                                        />

                                        {!uploadedVideoPath && (
                                            <div className="p-4 bg-amber-50 text-amber-700 rounded-xl text-sm border border-amber-200 flex items-center gap-3">
                                                <AlertCircle size={20} className="flex-shrink-0" />
                                                <p>يجب رفع فيديو للمحاضرة المسجلة قبل الحفظ.</p>
                                            </div>
                                        )}

                                        <div className="p-4 bg-blue-50 text-blue-800 rounded-xl text-sm">
                                            <p className="font-semibold mb-1">معلومات عن الفيديو:</p>
                                            <ul className="list-disc list-inside space-y-1 opacity-80">
                                                <li>الصيغ المدعومة: MP4, AVI, MOV, MKV</li>
                                                <li>يتم دعم رفع الملفات الكبيرة (أكثر من 100MB) بتقنية التجزئة</li>
                                                <li>يمكنك إغلاق هذه النافذة وسيكتمل الرفع في الخلفية (قريباً)</li>
                                            </ul>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer - Fixed at bottom */}
                        <div className="px-6 py-4 bg-slate-50/80 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between flex-none backdrop-blur-md">
                            {step === 1 ? (
                                <>
                                    <button
                                        onClick={handleClose}
                                        type="button"
                                        className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-grey dark:text-slate-300 font-bold hover:bg-white dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/20 transition-all"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        type="submit"
                                        form="detailsForm"
                                        disabled={loading || formData.isOnline === null}
                                        className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${formData.isOnline === true
                                            ? 'bg-gradient-to-r from-success-green to-emerald-500 text-white hover:shadow-[0_8px_24px_0_rgba(39,174,96,0.3)] shadow-[0_4px_14px_0_rgba(39,174,96,0.2)]'
                                            : 'bg-gradient-to-r from-shibl-crimson to-rose-600 text-white shadow-crimson hover:shadow-crimson-lg'
                                            }`}
                                    >
                                        {loading && formData.isOnline === true ? (
                                            'جاري الحفظ...'
                                        ) : formData.isOnline === true ? (
                                            <>
                                                حفظ ونشر
                                                <Check size={18} />
                                            </>
                                        ) : (
                                            <>
                                                التالي
                                                <ChevronLeft size={18} />
                                            </>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setStep(1)}
                                        disabled={loading}
                                        className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-grey dark:text-slate-300 font-bold hover:bg-white dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/20 transition-all flex items-center gap-2"
                                    >
                                        <ChevronRight size={18} />
                                        السابق
                                    </button>
                                    <button
                                        onClick={handleFinalSubmit}
                                        disabled={loading || !uploadedVideoPath}
                                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-success-green to-emerald-500 text-white font-bold hover:shadow-[0_8px_24px_0_rgba(39,174,96,0.3)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(39,174,96,0.2)]"
                                        title={!uploadedVideoPath ? 'يرجى رفع فيديو أولاً' : ''}
                                    >
                                        {loading ? (
                                            'جاري الحفظ...'
                                        ) : (
                                            <>
                                                <Check size={18} />
                                                حفظ المحاضرة
                                            </>
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
