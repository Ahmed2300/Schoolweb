import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Check, Video, FileText, Calendar, Loader2, Radio, Upload, AlertCircle } from 'lucide-react';
import { teacherLectureService } from '../../../../../data/api/teacherLectureService';
import { teacherContentApprovalService } from '../../../../../data/api/teacherContentApprovalService';
import { TeacherVideoUploader } from './TeacherVideoUploader';
import { TimeSlotPicker } from '../../timeslots/TimeSlotPicker';
import { ApprovedSlotSelector, type DatedSlot } from '../../timeslots/ApprovedSlotSelector';
import type { SlotRequest } from '../../../../../types/slotRequest';
import type { Unit } from '../../../../../types/unit';
import { useMyRequests } from '../../../../hooks/useTeacherTimeSlots';

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

interface TeacherAddLectureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (lecture?: any) => void;
    courseId: number;
    courseName: string;
    teacherId: number;
    units: Unit[];
    initialUnitId?: number;
    defaultStartTime?: string;
    defaultEndTime?: string;
    gradeId?: number;
    semesterId?: number;
}

type SlotSourceType = 'available' | 'approved';

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
    selectedSlotId: number | null;
    slotRequestId: number | null;
}

export function TeacherAddLectureModal({
    isOpen,
    onClose,
    onSuccess,
    courseId,
    courseName,
    teacherId,
    units,
    initialUnitId,
    defaultStartTime,
    defaultEndTime,
    gradeId,
    semesterId
}: TeacherAddLectureModalProps) {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    const initialFormData: FormData = {
        titleAr: '',
        titleEn: '',
        descriptionAr: '',
        descriptionEn: '',
        courseId: courseId.toString(),
        unitId: initialUnitId?.toString() || '',
        teacherId: teacherId.toString(),
        startTime: defaultStartTime || '',
        endTime: defaultEndTime || '',
        isOnline: null as boolean | null, // null = not yet chosen, forces explicit selection
        selectedSlotId: null,
        slotRequestId: null,
    };

    const [selectedSlot, setSelectedSlot] = useState<DatedSlot | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadedVideoPath, setUploadedVideoPath] = useState<string | null>(null);

    const resetForm = useCallback(() => {
        setFormData(initialFormData);
        setStep(1);
        setError(null);
        setUploadedVideoPath(null);
        setSelectedSlot(null);
    }, [initialFormData]);

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

        // If online lecture, require slot selection
        if (formData.isOnline && !selectedSlot) {
            setError('يرجى اختيار فترة زمنية للبث المباشر');
            return;
        }

        // For LIVE lectures: skip video upload, submit directly
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
            // Format start/end times with date if selected
            let formattedStartTime = formData.startTime;
            let formattedEndTime = formData.endTime;

            if (selectedSlot && selectedDate) {
                // Combine date and time
                formattedStartTime = `${selectedDate} ${selectedSlot.start_time}`;
                formattedEndTime = `${selectedDate} ${selectedSlot.end_time}`;
            }

            const lectureData = {
                title: { ar: formData.titleAr, en: formData.titleEn },
                description: { ar: formData.descriptionAr, en: formData.descriptionEn },
                course_id: parseInt(formData.courseId),
                unit_id: formData.unitId ? parseInt(formData.unitId) : undefined,
                teacher_id: parseInt(formData.teacherId),
                start_time: formattedStartTime,
                end_time: formattedEndTime,
                is_online: formData.isOnline as boolean, // safe: validated non-null before reaching here
                video_path: uploadedVideoPath || undefined,
                is_published: true,
                // If it's a recurring slot (from ApprovedSlotSelector), send it as such
                teacher_recurring_slot_id: selectedSlot?.type === 'recurring' ? selectedSlot.id : undefined,
                // Only send time_slot_id if it's a legacy one-off slot request (not used here currently)
                // Note: For 'one_time' slots (exceptions), the ID is from SlotRequest. The backend will match by time.
                time_slot_id: undefined,
            };

            // Switch to Approval Request Flow
            const response = await teacherContentApprovalService.submitApprovalRequest({
                approvable_type: 'course',
                approvable_id: parseInt(formData.courseId),
                action: 'create_lecture',
                payload: lectureData,
            });

            // if (uploadedVideoPath) {
            //     await teacherLectureService.createLectureWithVideo(lectureData, uploadedVideoPath);
            // } else {
            //     await teacherLectureService.createLecture(lectureData);
            // }

            // Construct a "pending" lecture object for optimistic UI
            // CRITICAL FIX: Use the ACTUAL ID from the response, not a timestamp
            // The response.data is the ContentApprovalRequest, which has an 'id'
            const pendingLecture = {
                id: `pending-${response.data.id}`, // Use real DB ID from approval request
                ...lectureData,
                type: 'lecture',
                sortType: 'lecture',
                is_pending_approval: true,
                order: 9999 // Put at end
            };

            onSuccess(pendingLecture);
            resetForm();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'فشل إرسال طلب المحاضرة');
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
                                        id="detailsForm"
                                        onSubmit={handleSubmitDetails}
                                        className="space-y-6"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-charcoal dark:text-white">عنوان المحاضرة (بالعربية) *</label>
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
                                                <label className="text-sm font-medium text-charcoal dark:text-white">عنوان المحاضرة (بالانجليزية)</label>
                                                <input
                                                    type="text"
                                                    value={formData.titleEn}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, titleEn: e.target.value }))}
                                                    className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] text-charcoal dark:text-white focus:border-shibl-crimson focus:ring-1 focus:ring-shibl-crimson/30 outline-none transition-all placeholder-slate-400"
                                                    dir="ltr"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-charcoal dark:text-white">الكورس</label>
                                                <input
                                                    type="text"
                                                    value={courseName}
                                                    disabled
                                                    className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-soft-cloud dark:bg-[#121212] text-slate-grey dark:text-slate-400 cursor-not-allowed"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-charcoal dark:text-white flex items-center gap-2">
                                                    الوحدة
                                                </label>
                                                <select
                                                    value={formData.unitId}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, unitId: e.target.value }))}
                                                    className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] text-charcoal dark:text-white focus:border-shibl-crimson focus:ring-1 focus:ring-shibl-crimson/30 outline-none transition-all appearance-none"
                                                >
                                                    <option value="">اختر الوحدة (اختياري)</option>
                                                    {units.map(u => <option key={u.id} value={u.id} className="dark:bg-[#1E1E1E]">{getLocalizedName(u.title)}</option>)}
                                                </select>
                                            </div>

                                            <div className="col-span-full">
                                                <label className="text-sm font-medium text-charcoal dark:text-white mb-1.5 block">الوصف (بالعربية)</label>
                                                <textarea
                                                    rows={4}
                                                    value={formData.descriptionAr}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, descriptionAr: e.target.value }))}
                                                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] text-charcoal dark:text-white focus:border-shibl-crimson focus:ring-1 focus:ring-shibl-crimson/30 outline-none transition-all resize-none placeholder-slate-400 custom-scrollbar"
                                                    dir="rtl"
                                                />
                                            </div>

                                            {/* Lecture Type Selection — REQUIRED */}
                                            <div className="col-span-full pt-2 space-y-3">
                                                <label className="text-sm font-medium text-charcoal dark:text-white flex items-center gap-2">
                                                    نوع المحاضرة <span className="text-red-500">*</span>
                                                </label>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {/* Live Lecture Card */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData(prev => ({ ...prev, isOnline: true }));
                                                        }}
                                                        className={`flex items-center gap-3 p-4 rounded-xl border-2 text-right transition-all duration-300 ${formData.isOnline === true
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
                                                            <span className="text-xs text-slate-grey dark:text-slate-400">جدولة موعد للبث المباشر مع الطلاب</span>
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
                                                        className={`flex items-center gap-3 p-4 rounded-xl border-2 text-right transition-all duration-300 ${formData.isOnline === false
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
                                                            <span className="text-xs text-slate-grey dark:text-slate-400">رفع فيديو مسجل مسبقاً للطلاب</span>
                                                        </div>
                                                    </button>
                                                </div>
                                                {formData.isOnline === null && (
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                                        <AlertCircle size={14} />
                                                        يجب اختيار نوع المحاضرة للمتابعة
                                                    </p>
                                                )}
                                            </div>

                                            {formData.isOnline === true && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="col-span-full border-t border-slate-100 dark:border-white/5 pt-4 overflow-hidden"
                                                >
                                                    <label className="text-sm font-medium text-charcoal dark:text-white mb-3 flex items-center gap-2">
                                                        <Calendar size={18} className="text-shibl-crimson" />
                                                        اختر فترة البث المباشر *
                                                    </label>
                                                    <ApprovedSlotSelector
                                                        onSelect={(slot) => {
                                                            setSelectedSlot(slot);
                                                            setSelectedDate(slot?.dateString || null);
                                                            setFormData(prev => ({ ...prev, selectedSlotId: slot?.id || null }));
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
                                        className="space-y-6 max-w-2xl mx-auto"
                                    >
                                        <div className="text-center space-y-2">
                                            <h3 className="font-semibold text-slate-900 dark:text-white text-lg">رفع فيديو المحاضرة</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">يرجى رفع فيديو المحاضرة المسجلة</p>
                                        </div>

                                        <TeacherVideoUploader
                                            onUploadComplete={(path) => setUploadedVideoPath(path)}
                                            onError={(msg) => console.error(msg)}
                                        />

                                        {!uploadedVideoPath && (
                                            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-xl text-sm border border-amber-200 dark:border-amber-900/30 flex items-center gap-3">
                                                <AlertCircle size={20} className="flex-shrink-0" />
                                                <p>يجب رفع فيديو للمحاضرة المسجلة قبل الحفظ. لا يمكن إنشاء محاضرة مسجلة بدون فيديو.</p>
                                            </div>
                                        )}

                                        <div className="p-5 bg-soft-cloud dark:bg-[#121212] text-charcoal dark:text-white rounded-2xl text-sm border border-slate-200 dark:border-white/10">
                                            <p className="font-bold mb-2 flex items-center gap-2 text-shibl-crimson">
                                                <Video size={16} />
                                                معلومات عن الفيديو المطلوب:
                                            </p>
                                            <ul className="list-disc list-inside space-y-1.5 opacity-90 pr-2 text-slate-grey dark:text-slate-400">
                                                <li>الصيغ المدعومة: MP4, AVI, MOV, MKV</li>
                                                <li>يتم دعم رفع الملفات الكبيرة (أكثر من 100MB)</li>
                                                <li>ينصح باستخدام جودة 1080p للحصول على أفضل تجربة مشاهدة</li>
                                            </ul>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-soft-cloud dark:bg-[#1E1E1E] border-t border-slate-200 dark:border-white/5 flex items-center justify-between flex-none rounded-b-3xl">
                            {step === 1 ? (
                                <>
                                    <button
                                        onClick={handleClose}
                                        className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-grey dark:text-slate-300 font-bold hover:bg-white dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/20 transition-all"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        type="submit"
                                        form="detailsForm"
                                        disabled={loading || formData.isOnline === null}
                                        className="px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-shibl-crimson to-rose-600 text-white shadow-crimson hover:shadow-crimson-lg"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                <span>جاري المعالجة...</span>
                                            </>
                                        ) : (
                                            <>
                                                {formData.isOnline === true ? 'حفظ ونشر' : 'التالي'}
                                                {formData.isOnline === true ? <Check size={18} /> : <ChevronLeft size={18} />}
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

