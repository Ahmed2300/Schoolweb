import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2, Zap } from 'lucide-react';
import { teacherLectureService } from '../../../../data/api/teacherLectureService';
import type { Unit } from '../../../../types/unit';
import toast from 'react-hot-toast';

interface TeacherAddImmediateLectureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (lecture?: any) => void;
    courseId: number;
    units: Unit[];
    initialUnitId?: number;
}

export function TeacherAddImmediateLectureModal({
    isOpen,
    onClose,
    onSuccess,
    courseId,
    units,
    initialUnitId,
}: TeacherAddImmediateLectureModalProps) {
    const [formData, setFormData] = useState({
        titleAr: '',
        titleEn: '',
        descriptionAr: '',
        descriptionEn: '',
        unitId: initialUnitId?.toString() || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const resetForm = useCallback(() => {
        setFormData({
            titleAr: '',
            titleEn: '',
            descriptionAr: '',
            descriptionEn: '',
            unitId: initialUnitId?.toString() || '',
        });
        setError(null);
    }, [initialUnitId]);

    const handleClose = useCallback(() => {
        if (!loading) {
            resetForm();
            onClose();
        }
    }, [loading, onClose, resetForm]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.titleAr) {
            setError('عنوان المحاضرة بالعربية مطلوب');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                title: { ar: formData.titleAr, en: formData.titleEn },
                description: { ar: formData.descriptionAr, en: formData.descriptionEn },
                course_id: courseId,
                unit_id: formData.unitId ? parseInt(formData.unitId) : undefined,
            };

            const response = await teacherLectureService.createImmediateLecture(payload);

            // Laravel API resource wraps the response in a 'data' array/object.
            if (response && response.data) {
                toast.success('تم إنشاء المحاضرة الفورية بنجاح');
                onSuccess(response.data);
                resetForm();
            } else {
                setError(response.message || 'فشل إنشاء المحاضرة');
            }
        } catch (err: any) {
            console.error('Create immediate lecture error:', err);
            setError(err.response?.data?.message || err.message || 'حدث خطأ غير متوقع');
        } finally {
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
                        className="bg-white dark:bg-[#1E1E1E] rounded-3xl w-full max-w-2xl flex flex-col shadow-card hover:shadow-card-hover text-right border border-slate-200 dark:border-white/5 overflow-hidden"
                    >
                        {/* Header with Illustration/Theme */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-shibl-crimson/10 via-rose-50 to-white dark:from-shibl-crimson/20 dark:via-[#1e1e1e] dark:to-[#121212] p-8 border-b border-rose-100 dark:border-white/5">
                            {/* Abstract Decor */}
                            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-64 h-64 bg-shibl-crimson/10 dark:bg-shibl-crimson/5 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-48 h-48 bg-rose-400/10 dark:bg-rose-900/10 rounded-full blur-2xl" />

                            <div className="relative z-10 flex items-start justify-between">
                                <div className="flex gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#121212] flex items-center justify-center shadow-lg shadow-shibl-crimson/10 border border-shibl-crimson/20">
                                        <Zap className="w-7 h-7 text-shibl-crimson fill-shibl-crimson/20" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">محاضرة تفاعلية فورية</h2>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                                            أنشئ محاضرة مباشرة الآن للطلاب دون الحاجة لجدولتها مسبقاً أو انتظار موافقة الإدارة.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClose}
                                    disabled={loading}
                                    className="p-2 rounded-full bg-white/50 hover:bg-white dark:bg-white/5 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all backdrop-blur-sm"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3 text-sm border border-red-100 dark:border-red-900/30"
                                >
                                    <X size={18} className="flex-shrink-0" />
                                    <p>{error}</p>
                                </motion.div>
                            )}

                            <form id="immediateLectureForm" onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-charcoal dark:text-white">عنوان المحاضرة (بالعربية) <span className="text-shibl-crimson">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.titleAr}
                                        onChange={(e) => setFormData(prev => ({ ...prev, titleAr: e.target.value }))}
                                        placeholder="مثال: مراجعة عاجلة لدرس الحركة"
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121212] text-charcoal dark:text-white focus:bg-white focus:border-shibl-crimson focus:ring-2 focus:ring-shibl-crimson/20 outline-none transition-all placeholder-slate-400"
                                        dir="rtl"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-charcoal dark:text-white">عنوان المحاضرة (بالانجليزية) <span className="text-slate-400 text-xs font-normal ml-1">اختياري</span></label>
                                    <input
                                        type="text"
                                        value={formData.titleEn}
                                        onChange={(e) => setFormData(prev => ({ ...prev, titleEn: e.target.value }))}
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121212] text-charcoal dark:text-white focus:bg-white focus:border-shibl-crimson focus:ring-2 focus:ring-shibl-crimson/20 outline-none transition-all placeholder-slate-400"
                                        dir="ltr"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-charcoal dark:text-white">الوحدة المرتبطة <span className="text-slate-400 text-xs font-normal ml-1">اختياري</span></label>
                                    <select
                                        value={formData.unitId}
                                        onChange={(e) => setFormData(prev => ({ ...prev, unitId: e.target.value }))}
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121212] text-charcoal dark:text-white focus:bg-white focus:border-shibl-crimson focus:ring-2 focus:ring-shibl-crimson/20 outline-none transition-all appearance-none"
                                    >
                                        <option value="">محاضرة عامة بالكورس (بدون وحدة)</option>
                                        {units.map(u => (
                                            <option key={u.id} value={u.id} className="dark:bg-[#1E1E1E]">
                                                {typeof u.title === 'string' ? u.title : (u.title?.ar || u.title?.en || 'بدون اسم')}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-charcoal dark:text-white">تفاصيل المحاضرة <span className="text-slate-400 text-xs font-normal ml-1">اختياري</span></label>
                                    <textarea
                                        rows={3}
                                        value={formData.descriptionAr}
                                        onChange={(e) => setFormData(prev => ({ ...prev, descriptionAr: e.target.value }))}
                                        placeholder="اكتب وصفاً موجزاً لما سيتم تغطيته في هذه المحاضرة..."
                                        className="w-full p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121212] text-charcoal dark:text-white focus:bg-white focus:border-shibl-crimson focus:ring-2 focus:ring-shibl-crimson/20 outline-none transition-all resize-none placeholder-slate-400 custom-scrollbar"
                                        dir="rtl"
                                    />
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-5 bg-slate-50 dark:bg-[#1E1E1E] border-t border-slate-200 dark:border-white/5 flex items-center justify-between flex-none rounded-b-3xl">
                            <button
                                onClick={handleClose}
                                disabled={loading}
                                className="px-6 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                form="immediateLectureForm"
                                disabled={loading || !formData.titleAr.trim()}
                                className="px-8 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed bg-shibl-crimson text-white shadow-lg shadow-shibl-crimson/30 hover:shadow-xl hover:shadow-shibl-crimson/40 hover:-translate-y-0.5"
                            >
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[30deg] group-hover:animate-shimmer" />

                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        <span>جاري الإنشاء...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check size={18} />
                                        <span>بدء المحاضرة الفورية</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

