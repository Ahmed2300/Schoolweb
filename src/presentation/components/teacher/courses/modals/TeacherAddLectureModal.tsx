import { useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Check, Video, FileText, Calendar, Loader2, Radio } from 'lucide-react';
import { teacherLectureService } from '../../../../../data/api/teacherLectureService';
import { teacherContentApprovalService } from '../../../../../data/api/teacherContentApprovalService';
import { TeacherVideoUploader } from './TeacherVideoUploader';
import { TimeSlotPicker } from '../../timeslots/TimeSlotPicker';
import type { TimeSlot } from '../../../../../data/api/teacherTimeSlotService';
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
    selectedSlotId: number | null;
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
    gradeId
}: TeacherAddLectureModalProps) {
    const [step, setStep] = useState(1);
    const { data: bookedSlots = [] } = useMyRequests();

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
        isOnline: false,
        selectedSlotId: null,
    };

    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

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
            const lectureData = {
                title: { ar: formData.titleAr, en: formData.titleEn },
                description: { ar: formData.descriptionAr, en: formData.descriptionEn },
                course_id: parseInt(formData.courseId),
                unit_id: formData.unitId ? parseInt(formData.unitId) : undefined,
                teacher_id: parseInt(formData.teacherId),
                start_time: selectedSlot?.start_time || formData.startTime || undefined,
                end_time: selectedSlot?.end_time || formData.endTime || undefined,
                is_online: formData.isOnline,
                video_path: uploadedVideoPath || undefined,
                is_published: true,
                time_slot_id: selectedSlot?.id || undefined,
            };

            // Switch to Approval Request Flow
            await teacherContentApprovalService.submitApprovalRequest({
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
            const pendingLecture = {
                id: `pending-${Date.now()}`, // Temporary ID
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" style={{ direction: 'rtl' }}>
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl text-right">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-none">
                    <div>
                        <h2 className="text-lg font-bold text-charcoal">إضافة محاضرة جديدة</h2>
                        <p className="text-sm text-slate-500">الخطوة {step} من 2</p>
                    </div>
                    <button onClick={handleClose} disabled={loading} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Steps Indicator */}
                <div className="px-6 py-4 flex-none border-b border-slate-50">
                    <div className="flex items-center justify-between relative max-w-md mx-auto">
                        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-100 -z-10" />
                        <div className={`flex flex-col items-center gap-2 bg-white px-2 ${step >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${step >= 1 ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                                <FileText size={20} />
                            </div>
                            <span className="text-xs font-medium">بيانات المحاضرة</span>
                        </div>
                        <div className={`flex flex-col items-center gap-2 bg-white px-2 ${step >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${step >= 2 ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                                <Video size={20} />
                            </div>
                            <span className="text-xs font-medium">الفيديو (اختياري)</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm">
                            <X size={18} />
                            {error}
                        </div>
                    )}

                    {step === 1 ? (
                        <form id="detailsForm" onSubmit={handleSubmitDetails} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-charcoal">عنوان المحاضرة (بالعربية) *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.titleAr}
                                        onChange={(e) => setFormData(prev => ({ ...prev, titleAr: e.target.value }))}
                                        className="w-full h-11 px-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-colors"
                                        dir="rtl"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-charcoal">عنوان المحاضرة (بالانجليزية)</label>
                                    <input
                                        type="text"
                                        value={formData.titleEn}
                                        onChange={(e) => setFormData(prev => ({ ...prev, titleEn: e.target.value }))}
                                        className="w-full h-11 px-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-colors"
                                        dir="ltr"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-charcoal">الكورس</label>
                                    <input
                                        type="text"
                                        value={courseName}
                                        disabled
                                        className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-charcoal flex items-center gap-2">
                                        الوحدة
                                    </label>
                                    <select
                                        value={formData.unitId}
                                        onChange={(e) => setFormData(prev => ({ ...prev, unitId: e.target.value }))}
                                        className="w-full h-11 px-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-colors appearance-none bg-white"
                                    >
                                        <option value="">اختر الوحدة (اختياري)</option>
                                        {units.map(u => <option key={u.id} value={u.id}>{getLocalizedName(u.title)}</option>)}
                                    </select>
                                </div>

                                <div className="col-span-full">
                                    <label className="text-sm font-medium text-charcoal mb-1.5 block">الوصف (بالعربية)</label>
                                    <textarea
                                        rows={4}
                                        value={formData.descriptionAr}
                                        onChange={(e) => setFormData(prev => ({ ...prev, descriptionAr: e.target.value }))}
                                        className="w-full p-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-colors resize-none"
                                        dir="rtl"
                                    />
                                </div>

                                <div className="col-span-full pt-2">
                                    <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={formData.isOnline}
                                            onChange={(e) => {
                                                setFormData(prev => ({ ...prev, isOnline: e.target.checked }));
                                                if (!e.target.checked) {
                                                    setSelectedSlot(null);
                                                }
                                            }}
                                            className="w-5 h-5 rounded text-blue-600 focus:ring-offset-0 focus:ring-0 cursor-pointer"
                                        />
                                        <div>
                                            <span className="text-sm font-bold text-charcoal block">محاضرة أونلاين (بث مباشر)</span>
                                            <span className="text-xs text-slate-500">سيتم جدولة موعد للبث المباشر بدلاً من رفع فيديو مسجل</span>
                                        </div>
                                    </label>
                                </div>

                                {formData.isOnline && (
                                    <div className="col-span-full border-t border-slate-100 pt-4">
                                        <label className="text-sm font-medium text-charcoal mb-3 block flex items-center gap-2">
                                            <Calendar size={18} className="text-blue-600" />
                                            اختر فترة البث المباشر *
                                        </label>
                                        <TimeSlotPicker
                                            onSelect={(slot) => {
                                                setSelectedSlot(slot);
                                                setFormData(prev => ({ ...prev, selectedSlotId: slot?.id || null }));
                                            }}
                                            selectedSlotId={selectedSlot?.id}
                                            bookedSlots={bookedSlots}
                                            currentData={{ course: { grade_id: gradeId } }}
                                        />
                                    </div>
                                )}
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-6 max-w-2xl mx-auto">
                            <div className="text-center space-y-2">
                                <h3 className="font-semibold text-charcoal text-lg">رفع فيديو المحاضرة</h3>
                                <p className="text-sm text-slate-500">يمكنك رفع فيديو مسجل للمحاضرة الآن أو تخطي هذه الخطوة</p>
                            </div>

                            <TeacherVideoUploader
                                onUploadComplete={(path) => setUploadedVideoPath(path)}
                                onError={(msg) => console.error(msg)}
                            />

                            <div className="p-5 bg-blue-50 text-blue-800 rounded-2xl text-sm border border-blue-100">
                                <p className="font-bold mb-2 flex items-center gap-2">
                                    <Video size={16} />
                                    معلومات عن الفيديو المطلوب:
                                </p>
                                <ul className="list-disc list-inside space-y-1.5 opacity-90 pr-2">
                                    <li>الصيغ المدعومة: MP4, AVI, MOV, MKV</li>
                                    <li>يتم دعم رفع الملفات الكبيرة (أكثر من 100MB)</li>
                                    <li>ينصح باستخدام جودة 1080p للحصول على أفضل تجربة مشاهدة</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-none rounded-b-2xl">
                    {step === 1 ? (
                        <>
                            <button
                                onClick={handleClose}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-white hover:border-slate-300 transition-all"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                form="detailsForm"
                                disabled={loading}
                                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        <span>جاري المعالجة...</span>
                                    </>
                                ) : (
                                    <>
                                        {formData.isOnline ? 'حفظ ونشر' : 'التالي'}
                                        {formData.isOnline ? <Check size={18} /> : <ChevronLeft size={18} />}
                                    </>
                                )}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setStep(1)}
                                disabled={loading}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-white hover:border-slate-300 transition-all flex items-center gap-2"
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
                                        حفظ المحاضرة
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

