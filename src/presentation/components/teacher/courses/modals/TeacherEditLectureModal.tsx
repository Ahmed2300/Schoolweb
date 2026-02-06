import { useState, useCallback, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Check, Video, FileText, Calendar, Trash2 } from 'lucide-react';
import { teacherLectureService } from '../../../../../data/api/teacherLectureService';
import { TeacherVideoUploader } from './TeacherVideoUploader';
import type { Unit } from '../../../../../types/unit';
import { localToUtcIso } from '../../../../../utils/timeUtils';

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

export function TeacherEditLectureModal({ isOpen, onClose, onSuccess, lecture, courseName, units }: TeacherEditLectureModalProps) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({
        titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '',
        courseId: '', unitId: '', teacherId: '', startTime: '', endTime: '', isOnline: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newVideoPath, setNewVideoPath] = useState<string | null>(null);

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
        }
    }, [lecture]);

    const handleClose = useCallback(() => {
        if (!loading) {
            setStep(1);
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
                // Convert local datetime to UTC ISO string for backend
                start_time: localToUtcIso(formData.startTime),
                end_time: localToUtcIso(formData.endTime),
                is_online: formData.isOnline,
            };

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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" style={{ direction: 'rtl' }}>
            <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl text-right">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-charcoal">تعديل المحاضرة</h2>
                        <p className="text-sm text-slate-500">{formData.titleAr}</p>
                    </div>
                    <button onClick={handleClose} disabled={loading} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Steps Indicator */}
                <div className="px-6 py-4">
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

                <div className="p-6">
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
                                    <label className="text-sm font-medium text-charcoal">الكورس</label>
                                    <input
                                        type="text"
                                        value={courseName || 'الكورس الحالي'} // Use prop
                                        disabled
                                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-charcoal flex items-center gap-2">
                                        الوحدة
                                    </label>
                                    <select
                                        value={formData.unitId}
                                        onChange={(e) => setFormData(prev => ({ ...prev, unitId: e.target.value }))}
                                        className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:border-blue-500 outline-none transition-colors appearance-none bg-white"
                                    >
                                        <option value="">اختر الوحدة (اختياري)</option>
                                        {(units || []).map(u => <option key={u.id} value={u.id}>{getLocalizedName(u.title)}</option>)}
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

                                {formData.isOnline && (
                                    <>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-charcoal flex items-center gap-2">
                                                وقت البدء
                                            </label>
                                            <div className="relative">
                                                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                                <input
                                                    type="datetime-local"
                                                    value={formData.startTime}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                                                    className="w-full h-10 pl-10 pr-3 rounded-lg border border-slate-200 focus:border-blue-500 outline-none transition-colors text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-charcoal flex items-center gap-2">
                                                وقت الانتهاء
                                            </label>
                                            <div className="relative">
                                                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                                <input
                                                    type="datetime-local"
                                                    value={formData.endTime}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                                                    className="w-full h-10 pl-10 pr-3 rounded-lg border border-slate-200 focus:border-blue-500 outline-none transition-colors text-sm"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {lecture.is_online && (
                                    <div className="col-span-full pt-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.isOnline}
                                                onChange={(e) => setFormData(prev => ({ ...prev, isOnline: e.target.checked }))}
                                                className="w-4 h-4 rounded text-blue-600 focus:ring-offset-0 focus:ring-0 cursor-pointer"
                                            />
                                            <span className="text-sm text-charcoal select-none">محاضرة أونلاين (بث مباشر)</span>
                                        </label>
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

                            <TeacherVideoUploader
                                onUploadComplete={(path) => setNewVideoPath(path)}
                                onError={(msg) => console.error(msg)}
                                existingVideoUrl={!lecture.recording_path ? undefined : undefined} // Logic is handled above
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
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
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
                                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all flex items-center gap-2"
                            >
                                التالي
                                <ChevronLeft size={18} />
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
            </div>
        </div>
    );
}
