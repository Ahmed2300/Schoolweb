import { useState, useCallback, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Check, Video, FileText, Calendar, Trash2, Loader2, Radio, Upload } from 'lucide-react';
import { lectureService } from '../../../data/api/lectureService';
import { adminService } from '../../../data/api/adminService';
import { VideoUploader } from './VideoUploader';
import { ApprovedSlotSelector, type DatedSlot } from '../teacher/timeslots/ApprovedSlotSelector';

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

interface Lecture {
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
}

interface EditLectureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    lecture: Lecture;
    courses: CourseOption[];
    teachers: TeacherOption[];
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

export function EditLectureModal({ isOpen, onClose, onSuccess, lecture, courses, teachers }: EditLectureModalProps) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({
        titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '',
        courseId: '', unitId: '', teacherId: '', startTime: '', endTime: '', isOnline: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newVideoPath, setNewVideoPath] = useState<string | null>(null);
    const [units, setUnits] = useState<UnitOption[]>([]);
    const [loadingUnits, setLoadingUnits] = useState(false);

    // Course-derived IDs for slot filtering
    const [gradeId, setGradeId] = useState<number | undefined>(undefined);
    const [semesterId, setSemesterId] = useState<number | undefined>(undefined);

    // Slot selection state for live sessions
    const [selectedSlot, setSelectedSlot] = useState<DatedSlot | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // Helper to extract unit name
    const getUnitName = (unit: UnitOption): string => {
        if (typeof unit.title === 'string') return unit.title;
        return unit.title?.ar || unit.title?.en || `وحدة ${unit.id}`;
    };

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

    // Fetch units and course details (including grade_id / semester_id) when course changes
    useEffect(() => {
        const fetchCourseData = async () => {
            if (!formData.courseId) {
                setUnits([]);
                setGradeId(undefined);
                setSemesterId(undefined);
                return;
            }
            setLoadingUnits(true);
            try {
                // Fetch units
                const unitsResponse = await adminService.getUnits(parseInt(formData.courseId));
                setUnits(unitsResponse.data || unitsResponse || []);

                // Fetch course details for grade/semester/teacher
                const courseDetails = await adminService.getCourse(parseInt(formData.courseId));
                if (courseDetails) {
                    setGradeId(courseDetails.grade_id);
                    setSemesterId(courseDetails.semester_id);

                    // Auto-populate teacher from course if not already set
                    if (courseDetails.teacher_id && !formData.teacherId) {
                        setFormData(prev => ({
                            ...prev,
                            teacherId: courseDetails.teacher_id?.toString() || '',
                        }));
                    }
                }
            } catch (err) {
                console.error('Error fetching course data:', err);
                setUnits([]);
                setGradeId(undefined);
                setSemesterId(undefined);
            } finally {
                setLoadingUnits(false);
            }
        };
        fetchCourseData();
    }, [formData.courseId]);

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
            }
            if (!selectedSlot && formData.endTime !== originalEndTime) {
                lectureData.end_time = formattedEndTime || null;
            }

            if (newVideoPath) {
                await lectureService.updateLectureWithVideo(lecture.id, lectureData, newVideoPath);
            } else {
                await lectureService.updateLecture(lecture.id, lectureData);
            }

            onSuccess();
            handleClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'فشل تعديل المحاضرة');
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    // Only show 2-step flow for recorded lectures
    const isRecordedLecture = !formData.isOnline;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" style={{ direction: 'rtl' }}>
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-xl">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-none">
                    <div>
                        <h2 className="text-lg font-bold text-charcoal">تعديل المحاضرة</h2>
                        <p className="text-sm text-slate-500">{formData.titleAr || 'بدون عنوان'}</p>
                    </div>
                    <button onClick={handleClose} disabled={loading} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Steps Indicator — only for recorded lectures */}
                {isRecordedLecture && (
                    <div className="px-6 py-4 flex-none">
                        <div className="flex items-center justify-between relative">
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
                                <span className="text-xs font-medium">الفيديو</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="p-6 flex-1 overflow-y-auto">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm">
                            <X size={18} />
                            {error}
                        </div>
                    )}

                    {step === 1 ? (
                        <form id="editForm" onSubmit={handleSubmitDetails} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-charcoal">عنوان المحاضرة (بالعربية) *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.titleAr}
                                        onChange={(e) => setFormData(prev => ({ ...prev, titleAr: e.target.value }))}
                                        className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:border-blue-500 outline-none transition-colors"
                                        dir="rtl"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-charcoal">Lecture Title (English)</label>
                                    <input
                                        type="text"
                                        value={formData.titleEn}
                                        onChange={(e) => setFormData(prev => ({ ...prev, titleEn: e.target.value }))}
                                        className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:border-blue-500 outline-none transition-colors"
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
                                        className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:border-blue-500 outline-none transition-colors appearance-none bg-white"
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
                                            className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:border-blue-500 outline-none transition-colors appearance-none bg-white disabled:bg-slate-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="">{loadingUnits ? 'جاري التحميل...' : units.length === 0 ? 'لا توجد وحدات' : 'اختر الوحدة (اختياري)'}</option>
                                            {units.map(u => <option key={u.id} value={u.id}>{getUnitName(u)}</option>)}
                                        </select>
                                    </div>
                                )}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-charcoal">المدرس *</label>
                                    <select
                                        required
                                        value={formData.teacherId}
                                        onChange={(e) => setFormData(prev => ({ ...prev, teacherId: e.target.value }))}
                                        className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:border-blue-500 outline-none transition-colors appearance-none bg-white"
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
                                        className="w-full p-3 rounded-lg border border-slate-200 focus:border-blue-500 outline-none transition-colors resize-none"
                                        dir="rtl"
                                    />
                                </div>

                                {/* Lecture Type Indicator — read-only, same as teacher */}
                                <div className="col-span-full pt-2">
                                    <div className={`flex items-center gap-3 p-4 rounded-xl border-2 ${formData.isOnline
                                        ? 'border-blue-200 bg-blue-50'
                                        : 'border-emerald-200 bg-emerald-50'
                                        }`}>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${formData.isOnline
                                            ? 'bg-blue-100 text-blue-600'
                                            : 'bg-emerald-100 text-emerald-600'
                                            }`}>
                                            {formData.isOnline ? <Radio size={20} /> : <Upload size={20} />}
                                        </div>
                                        <div>
                                            <span className={`text-sm font-bold block ${formData.isOnline ? 'text-blue-700' : 'text-emerald-700'
                                                }`}>
                                                {formData.isOnline ? 'بث مباشر (أونلاين)' : 'فيديو مسجل'}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                                {formData.isOnline ? 'هذه محاضرة بث مباشر — اختر موعداً من الفترات المتاحة' : 'هذه محاضرة مسجلة — يمكنك تعديل الفيديو في الخطوة التالية'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Slot Selector for LIVE sessions */}
                                {formData.isOnline && (
                                    <div className="col-span-full border-t border-slate-100 pt-4">
                                        <label className="text-sm font-medium text-charcoal mb-3 flex items-center gap-2">
                                            <Calendar size={18} className="text-blue-600" />
                                            تعديل فترة البث المباشر
                                        </label>
                                        {formData.startTime && !selectedSlot && (
                                            <div className="mb-3 p-3 bg-slate-50 rounded-xl text-sm text-slate-600 flex items-center gap-2">
                                                <Calendar size={16} className="text-slate-400" />
                                                <span>الموعد الحالي: {new Date(formData.startTime).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                            </div>
                                        )}
                                        {formData.teacherId ? (
                                            <ApprovedSlotSelector
                                                onSelect={(slot) => {
                                                    setSelectedSlot(slot);
                                                    setSelectedDate(slot?.dateString || null);
                                                }}
                                                selectedSlotId={selectedSlot?.id || null}
                                                selectedDate={selectedDate}
                                                gradeId={gradeId}
                                                semesterId={semesterId}
                                                teacherId={parseInt(formData.teacherId)}
                                            />
                                        ) : (
                                            <div className="text-center py-6 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                                                يرجى اختيار المدرس أولاً لعرض المواعيد المتاحة
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-6">
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
                                            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50">
                                                <Video size={48} className="text-white opacity-50" />
                                            </div>
                                        )}
                                        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur rounded-lg p-3 flex items-center justify-between transition-opacity opacity-0 group-hover:opacity-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                                                    <Video size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm text-charcoal">فيديو المحاضرة الحالي</p>
                                                    <p className="text-xs text-green-600">متوفر</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    if (confirm('هل أنت متأكد من حذف الفيديو الحالي؟')) {
                                                        setLoading(true);
                                                        try {
                                                            await lectureService.updateLecture(lecture.id, { remove_video: true });
                                                            onSuccess(); // Refresh list/data
                                                            onClose();
                                                        } catch (e) {
                                                            console.error('Failed to delete video', e);
                                                            setError('فشل حذف الفيديو');
                                                            setLoading(false);
                                                        }
                                                    }
                                                }}
                                                className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors flex items-center gap-1.5"
                                            >
                                                <Trash2 size={14} />
                                                حذف الفيديو
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-blue-50 text-blue-800 rounded-xl text-sm flex items-start gap-3">
                                        <div className="shrink-0 mt-0.5"><Video size={18} /></div>
                                        <div>
                                            <p className="font-semibold mb-1">استبدال الفيديو:</p>
                                            <p>يمكنك رفع فيديو جديد أدناه. سيتم استبدال الفيديو الحالي تلقائياً عند الحفظ.</p>
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            <VideoUploader
                                onUploadComplete={(path) => setNewVideoPath(path)}
                                onError={(msg) => console.error(msg)}
                            />

                            {lecture.recording_path && newVideoPath && (
                                <div className="p-4 bg-orange-50 text-orange-800 rounded-xl text-sm flex items-start gap-3">
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
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-none">
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
                                        حفظ التعديلات
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div >
        </div >
    );
}
