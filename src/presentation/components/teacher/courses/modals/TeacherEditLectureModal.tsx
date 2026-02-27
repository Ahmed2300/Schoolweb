import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Check, Video, FileText, Calendar, Trash2, Loader2, Radio, Upload, AlertCircle } from 'lucide-react';
import { teacherLectureService } from '../../../../../data/api/teacherLectureService';
import { TeacherVideoUploader } from './TeacherVideoUploader';
import { ApprovedSlotSelector, type DatedSlot } from '../../timeslots/ApprovedSlotSelector';
import type { Unit } from '../../../../../types/unit';

const extractName = (name: unknown): { ar: string, en: string } => {
    if (!name) return { ar: '', en: '' };
    if (typeof name === 'string') {
        try {
            const parsed = JSON.parse(name);
            if (typeof parsed === 'object' && parsed !== null) {
                return { ar: parsed.ar || '', en: parsed.en || '' };
            }
            return { ar: name, en: '' };
        } catch {
            return { ar: name, en: '' };
        }
    }
    if (typeof name === 'object' && name !== null) {
        const obj = name as { ar?: string; en?: string };
        return { ar: obj.ar || '', en: obj.en || '' };
    }
    return { ar: '', en: '' };
};

// Helper to get localized name
const getLocalizedName = (name: { ar?: string; en?: string } | string | undefined): string => {
    if (!name) return 'بدون اسم';
    if (typeof name === 'string') {
        try {
            const parsed = JSON.parse(name);
            if (typeof parsed === 'object' && parsed !== null) {
                return parsed.ar || parsed.en || name;
            }
            return name;
        } catch {
            return name;
        }
    }
    return name.ar || name.en || 'بدون اسم';
};

interface TeacherEditLectureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (updatedLecture?: any) => void;
    lecture: {
        id: number;
        title: { ar?: string; en?: string } | string;
        description?: { ar?: string; en?: string } | string;
        course_id: number;
        unit_id?: number;
        teacher_id: number;
        recording_path?: string;
        start_time?: string;
        end_time?: string;
        is_online: boolean;
        recording_url?: string;
    };
    courseName?: string;
    units: Unit[];
    gradeId?: number;
    semesterId?: number;
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
    isOnline: boolean;
}

export function TeacherEditLectureModal({ isOpen, onClose, onSuccess, lecture, courseName, units, gradeId, semesterId }: TeacherEditLectureModalProps) {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({
        titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '',
        courseId: '', unitId: '', teacherId: '', startTime: '', endTime: '', isOnline: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newVideoPath, setNewVideoPath] = useState<string | null>(null);

    // Slot selection state for live sessions
    const [selectedSlot, setSelectedSlot] = useState<DatedSlot | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    useEffect(() => {
        if (lecture) {
            const title = extractName(lecture.title);
            const desc = extractName(lecture.description);
            setFormData({
                titleAr: title.ar,
                titleEn: title.en,
                descriptionAr: desc.ar,
                descriptionEn: desc.en,
                courseId: lecture.course_id.toString(),
                unitId: lecture.unit_id ? lecture.unit_id.toString() : '',
                teacherId: lecture.teacher_id.toString(),
                startTime: lecture.start_time ? new Date(lecture.start_time).toISOString().slice(0, 16) : '',
                endTime: lecture.end_time ? new Date(lecture.end_time).toISOString().slice(0, 16) : '',
                isOnline: lecture.is_online,
            });
            setNewVideoPath(null);
            setSelectedSlot(null);
            setSelectedDate(null);
        }
    }, [lecture]);

    const handleClose = useCallback(() => {
        if (!loading) {
            setStep(1);
            setSelectedSlot(null);
            setSelectedDate(null);
            onClose();
        }
    }, [loading, onClose]);

    const handleSubmitDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.titleAr || !formData.courseId || !formData.teacherId) {
            setError('يرجى ملء جميع الحقول المطلوبة');
            return;
        }

        // For LIVE lectures: submit directly (no video step)
        if (formData.isOnline) {
            await handleFinalSubmit();
            return;
        }

        // For recorded lectures: go to video upload step
        setStep(2);
    };

    const handleFinalSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            // Compare times against original to detect actual changes
            const originalStartTime = lecture.start_time
                ? new Date(lecture.start_time).toISOString().slice(0, 16)
                : '';
            const originalEndTime = lecture.end_time
                ? new Date(lecture.end_time).toISOString().slice(0, 16)
                : '';

            // Format start/end times from slot if selected
            let formattedStartTime: string | undefined = formData.startTime || undefined;
            let formattedEndTime: string | undefined = formData.endTime || undefined;

            if (selectedSlot && selectedDate) {
                formattedStartTime = `${selectedDate} ${selectedSlot.start_time}`;
                formattedEndTime = `${selectedDate} ${selectedSlot.end_time}`;
            }

            const lectureData: Record<string, unknown> = {
                title: { ar: formData.titleAr, en: formData.titleEn },
                description: { ar: formData.descriptionAr, en: formData.descriptionEn },
                course_id: parseInt(formData.courseId),
                teacher_id: parseInt(formData.teacherId),
                is_online: formData.isOnline,
            };

            if (formData.unitId) {
                lectureData.unit_id = parseInt(formData.unitId);
            }

            // Only send time fields if they actually changed (or a new slot was selected)
            if (selectedSlot && selectedDate) {
                lectureData.start_time = formattedStartTime;
                lectureData.end_time = formattedEndTime;
                if (selectedSlot.type === 'recurring') {
                    lectureData.teacher_recurring_slot_id = selectedSlot.id;
                }
            } else if (formData.startTime !== originalStartTime) {
                lectureData.start_time = formattedStartTime || null;
                lectureData.end_time = formattedEndTime || null;
            }

            if (newVideoPath) {
                await teacherLectureService.updateLectureWithVideo(lecture.id, lectureData, newVideoPath);
            } else {
                await teacherLectureService.updateLecture(lecture.id, lectureData);
            }

            // Merge existing ID with new data for optimistic update
            const updated = {
                ...lecture,
                ...lectureData
            };
            onSuccess(updated);
            handleClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'فشل تعديل المحاضرة');
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    // Determine if we need the 2-step flow (only for recorded lectures)
    const isRecordedLecture = !formData.isOnline;

    return (
        <AnimatePresence>
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
                            <h2 className="text-lg font-bold text-charcoal dark:text-white">تعديل المحاضرة</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{formData.titleAr || 'بدون عنوان'}</p>
                        </div>
                        <button onClick={handleClose} disabled={loading} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Steps Indicator — only show for recorded lectures */}
                    {isRecordedLecture && (
                        <div className="px-6 py-4 flex-none border-b border-slate-50 dark:border-white/5">
                            <div className="flex items-center justify-between relative max-w-md mx-auto">
                                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-100 dark:bg-white/5 -z-10 rounded-full" />
                                <div className={`flex flex-col items-center gap-2 bg-white dark:bg-[#1E1E1E] px-2 ${step >= 1 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-gray-500'}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${step >= 1 ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E1E1E]'}`}>
                                        <FileText size={20} />
                                    </div>
                                    <span className="text-xs font-medium">بيانات المحاضرة</span>
                                </div>
                                <div className={`flex flex-col items-center gap-2 bg-white dark:bg-[#1E1E1E] px-2 ${step >= 2 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-gray-500'}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${step >= 2 ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E1E1E]'}`}>
                                        <Video size={20} />
                                    </div>
                                    <span className="text-xs font-medium">الفيديو</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2 text-sm">
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
                                    id="editForm"
                                    onSubmit={handleSubmitDetails}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-charcoal dark:text-white">عنوان المحاضرة (بالعربية) *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.titleAr}
                                                onChange={(e) => setFormData(prev => ({ ...prev, titleAr: e.target.value }))}
                                                className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all"
                                                dir="rtl"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-charcoal dark:text-white">Lecture Title (English)</label>
                                            <input
                                                type="text"
                                                value={formData.titleEn}
                                                onChange={(e) => setFormData(prev => ({ ...prev, titleEn: e.target.value }))}
                                                className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all"
                                                dir="ltr"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-charcoal dark:text-white">الكورس</label>
                                            <input
                                                type="text"
                                                value={courseName || 'الكورس الحالي'}
                                                disabled
                                                className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121212] text-slate-500 dark:text-slate-400 cursor-not-allowed"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-charcoal dark:text-white flex items-center gap-2">
                                                الوحدة
                                            </label>
                                            <select
                                                value={formData.unitId}
                                                onChange={(e) => setFormData(prev => ({ ...prev, unitId: e.target.value }))}
                                                className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] text-slate-900 dark:text-white focus:border-blue-500 outline-none transition-colors appearance-none"
                                            >
                                                <option value="">اختر الوحدة (اختياري)</option>
                                                {(units || []).map(u => <option key={u.id} value={u.id} className="dark:bg-[#1E1E1E]">{getLocalizedName(u.title)}</option>)}
                                            </select>
                                        </div>

                                        <div className="col-span-full">
                                            <label className="text-sm font-medium text-charcoal dark:text-white mb-1.5 block">الوصف (بالعربية)</label>
                                            <textarea
                                                rows={3}
                                                value={formData.descriptionAr}
                                                onChange={(e) => setFormData(prev => ({ ...prev, descriptionAr: e.target.value }))}
                                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] text-slate-900 dark:text-white focus:border-blue-500 outline-none transition-colors resize-none"
                                                dir="rtl"
                                            />
                                        </div>

                                        {/* Lecture Type — read-only indicator for edit */}
                                        <div className="col-span-full pt-2">
                                            <div className={`flex items-center gap-3 p-4 rounded-xl border-2 ${formData.isOnline
                                                ? 'border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800/30'
                                                : 'border-emerald-200 bg-emerald-50 dark:bg-emerald-900/10 dark:border-emerald-800/30'
                                                }`}>
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${formData.isOnline
                                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                    : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                                    }`}>
                                                    {formData.isOnline ? <Radio size={20} /> : <Upload size={20} />}
                                                </div>
                                                <div>
                                                    <span className={`text-sm font-bold block ${formData.isOnline ? 'text-blue-700 dark:text-blue-300' : 'text-emerald-700 dark:text-emerald-300'
                                                        }`}>
                                                        {formData.isOnline ? 'بث مباشر (أونلاين)' : 'فيديو مسجل'}
                                                    </span>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                                        {formData.isOnline ? 'هذه محاضرة بث مباشر — اختر موعداً من الفترات المتاحة' : 'هذه محاضرة مسجلة — يمكنك تعديل الفيديو في الخطوة التالية'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Slot Selector for LIVE sessions */}
                                        {formData.isOnline && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="col-span-full border-t border-slate-100 dark:border-white/5 pt-4 overflow-hidden"
                                            >
                                                <label className="text-sm font-medium text-charcoal dark:text-white mb-3 flex items-center gap-2">
                                                    <Calendar size={18} className="text-blue-600" />
                                                    تعديل فترة البث المباشر
                                                </label>
                                                {formData.startTime && !selectedSlot && (
                                                    <div className="mb-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                                        <Calendar size={16} className="text-slate-400" />
                                                        <span>الموعد الحالي: {new Date(formData.startTime).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                                    </div>
                                                )}
                                                <ApprovedSlotSelector
                                                    onSelect={(slot) => {
                                                        setSelectedSlot(slot);
                                                        setSelectedDate(slot?.dateString || null);
                                                    }}
                                                    selectedSlotId={selectedSlot?.id || null}
                                                    selectedDate={selectedDate}
                                                    gradeId={gradeId}
                                                    semesterId={semesterId}
                                                    onRequestNewSlot={() => {
                                                        navigate('/teacher/weekly-schedule');
                                                    }}
                                                />
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.form>
                            ) : (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                >
                                    {lecture.recording_path && !newVideoPath ? (
                                        <div className="space-y-4">
                                            <div className="aspect-video bg-black rounded-xl overflow-hidden relative group">
                                                {lecture.recording_url ? (
                                                    <video
                                                        src={lecture.recording_url}
                                                        controls
                                                        className="w-full h-full object-contain"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-[#121212]/50">
                                                        <Video size={48} className="text-white opacity-50" />
                                                    </div>
                                                )}
                                                <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-[#1E1E1E]/90 backdrop-blur rounded-lg p-3 flex items-center justify-between transition-opacity opacity-0 group-hover:opacity-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                                            <Video size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-sm text-charcoal dark:text-white">فيديو المحاضرة الحالي</p>
                                                            <p className="text-xs text-green-600 dark:text-green-400">متوفر</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={async () => {
                                                            if (confirm('هل أنت متأكد من حذف الفيديو الحالي؟')) {
                                                                setLoading(true);
                                                                try {
                                                                    await teacherLectureService.updateLecture(lecture.id, { remove_video: true });
                                                                    onSuccess();
                                                                    onClose();
                                                                } catch (e) {
                                                                    console.error('Failed to delete video', e);
                                                                    setError('فشل حذف الفيديو');
                                                                    setLoading(false);
                                                                }
                                                            }
                                                        }}
                                                        className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center gap-1.5"
                                                    >
                                                        <Trash2 size={14} />
                                                        حذف الفيديو
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-xl text-sm flex items-start gap-3">
                                                <div className="shrink-0 mt-0.5"><Video size={18} /></div>
                                                <div>
                                                    <p className="font-semibold mb-1">استبدال الفيديو:</p>
                                                    <p>يمكنك رفع فيديو جديد أدناه. سيتم استبدال الفيديو الحالي تلقائياً عند الحفظ.</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}

                                    <TeacherVideoUploader
                                        onUploadComplete={(path) => setNewVideoPath(path)}
                                        onError={(msg) => console.error(msg)}
                                        existingVideoUrl={!lecture.recording_path ? undefined : undefined}
                                    />

                                    {lecture.recording_path && newVideoPath && (
                                        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 rounded-xl text-sm flex items-start gap-3">
                                            <Video size={20} className="shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-semibold mb-1">تنبيه:</p>
                                                <p>سيتم استبدال الفيديو القديم بالفيديو الجديد الذي قمت برفعه الآن.</p>
                                            </div>
                                        </div>
                                    )}

                                    {!lecture.recording_path && !newVideoPath && !loading && (
                                        <div className="text-center py-8 text-slate-400">
                                            <p>لا يوجد فيديو حالياً</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-slate-50 dark:bg-[#1E1E1E] border-t border-slate-200 dark:border-white/5 flex items-center justify-between flex-none">
                        {step === 1 ? (
                            <>
                                <button
                                    onClick={handleClose}
                                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-medium hover:bg-white dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/20 transition-all"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    form="editForm"
                                    disabled={loading}
                                    className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            جاري الحفظ...
                                        </>
                                    ) : formData.isOnline ? (
                                        <>
                                            <Check size={18} />
                                            حفظ التعديلات
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
                                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-medium hover:bg-white dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/20 transition-all flex items-center gap-2"
                                >
                                    <ChevronRight size={18} />
                                    السابق
                                </button>
                                <button
                                    onClick={handleFinalSubmit}
                                    disabled={loading}
                                    className="px-5 py-2.5 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        'جاري الحفظ...'
                                    ) : (
                                        <>
                                            <Check size={18} />
                                            حفظ التعديلات
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
