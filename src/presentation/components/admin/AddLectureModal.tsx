import { useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Check, Video, FileText, Calendar } from 'lucide-react';
import { lectureService } from '../../../data/api/lectureService';
import { VideoUploader } from './VideoUploader';

interface CourseOption {
    id: number;
    name: string;
}

interface TeacherOption {
    id: number;
    name: string;
}

interface AddLectureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    courses: CourseOption[];
    teachers: TeacherOption[];
}

interface FormData {
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    courseId: string;
    teacherId: string;
    startTime: string;
    endTime: string;
    isOnline: boolean;
}

const initialFormData: FormData = {
    titleAr: '',
    titleEn: '',
    descriptionAr: '',
    descriptionEn: '',
    courseId: '',
    teacherId: '',
    startTime: '',
    endTime: '',
    isOnline: false,
};

export function AddLectureModal({ isOpen, onClose, onSuccess, courses, teachers }: AddLectureModalProps) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadedVideoPath, setUploadedVideoPath] = useState<string | null>(null);

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
                teacher_id: parseInt(formData.teacherId),
                start_time: formData.startTime || undefined,
                end_time: formData.endTime || undefined,
                is_online: formData.isOnline,
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-charcoal">إضافة محاضرة جديدة</h2>
                        <p className="text-sm text-slate-500">الخطوة {step} من 2</p>
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
                            <span className="text-xs font-medium">الفيديو (اختياري)</span>
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
                        <form id="detailsForm" onSubmit={handleSubmitDetails} className="space-y-4">
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
                                        onChange={(e) => setFormData(prev => ({ ...prev, courseId: e.target.value }))}
                                        className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:border-blue-500 outline-none transition-colors appearance-none bg-white"
                                    >
                                        <option value="">اختر الكورس</option>
                                        {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
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

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-charcoal">وقت البدء</label>
                                    <div className="relative">
                                        <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        <input
                                            type="datetime-local"
                                            value={formData.startTime}
                                            onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                                            className="w-full h-10 pr-10 pl-3 rounded-lg border border-slate-200 focus:border-blue-500 outline-none transition-colors text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-charcoal">وقت الانتهاء</label>
                                    <div className="relative">
                                        <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        <input
                                            type="datetime-local"
                                            value={formData.endTime}
                                            onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                                            className="w-full h-10 pr-10 pl-3 rounded-lg border border-slate-200 focus:border-blue-500 outline-none transition-colors text-sm"
                                        />
                                    </div>
                                </div>

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
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <div className="text-center space-y-2">
                                <h3 className="font-semibold text-charcoal">رفع فيديو المحاضرة</h3>
                                <p className="text-sm text-slate-500">يمكنك رفع فيديو مسجل للمحاضرة الآن أو تخطي هذه الخطوة</p>
                            </div>

                            <VideoUploader
                                onUploadComplete={(path) => setUploadedVideoPath(path)}
                                onError={(msg) => console.error(msg)}
                            />

                            <div className="p-4 bg-blue-50 text-blue-800 rounded-xl text-sm">
                                <p className="font-semibold mb-1">معلومات عن الفيديو:</p>
                                <ul className="list-disc list-inside space-y-1 opacity-80">
                                    <li>الصيغ المدعومة: MP4, AVI, MOV, MKV</li>
                                    <li>يتم دعم رفع الملفات الكبيرة (أكثر من 100MB) بتقنية التجزئة</li>
                                    <li>يمكنك إغلاق هذه النافذة وسيكتمل الرفع في الخلفية (قريباً)</li>
                                </ul>
                            </div>
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
                                form="detailsForm"
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
