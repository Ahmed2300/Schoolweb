
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    X,
    Upload,
    Loader2,
    BookOpen,
    DollarSign,
    GraduationCap,
    Book,
    FileText,
    Image as ImageIcon
} from 'lucide-react';
import { useLanguage } from '../../../hooks';
import { teacherService } from '../../../../data/api';
import apiClient from '../../../../data/api/ApiClient';
import { endpoints } from '../../../../data/api/endpoints';

// ==================== SCHEMA ====================

const courseSchema = z.object({
    name_ar: z.string().min(3, 'الاسم بالعربية مطلوب (3 أحرف على الأقل)'),
    name_en: z.string().optional(),
    description_ar: z.string().optional(),
    description_en: z.string().optional(),
    price: z.number().min(0, 'السعر يجب أن يكون 0 أو أكثر'),
    discount_price: z.number().min(0, 'سعر الخصم يجب أن يكون 0 أو أكثر').optional(),
    subject_id: z.number().min(1, 'المادة مطلوبة'),
    grade_id: z.number().min(1, 'الصف مطلوب'),
    semester_id: z.number().min(1, 'الفصل الدراسي مطلوب'),
    image: z.any().optional(), // File handling is manual
});

type CourseFormData = z.infer<typeof courseSchema>;

// ==================== TYPES ====================

interface TeacherCourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any; // If editing
}

export function TeacherCourseModal({ isOpen, onClose, onSuccess, initialData }: TeacherCourseModalProps) {
    const { isRTL } = useLanguage();
    const [imagePreview, setImagePreview] = React.useState<string | null>(null);
    const [activeTab, setActiveTab] = React.useState<'ar' | 'en'>('ar');

    // Data lists
    const [subjects, setSubjects] = React.useState<any[]>([]);
    const [grades, setGrades] = React.useState<any[]>([]);
    const [semesters, setSemesters] = React.useState<any[]>([]);
    const [loadingData, setLoadingData] = React.useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<CourseFormData>({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            price: 0,
            discount_price: 0,
        }
    });

    // Load Dropdown Data
    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                setLoadingData(true);
                try {
                    const [subRes, gradeRes, semRes] = await Promise.all([
                        apiClient.get(endpoints.admin.subjects.list),
                        apiClient.get(endpoints.grades.list),
                        apiClient.get(endpoints.semesters.list)
                    ]);

                    setSubjects(subRes.data.data || subRes.data || []);
                    setGrades(gradeRes.data.data || gradeRes.data || []);
                    setSemesters(semRes.data.data || semRes.data || []);
                } catch (e) {
                    console.error("Failed to load options", e);
                } finally {
                    setLoadingData(false);
                }
            };
            fetchData();
        }
    }, [isOpen]);

    // Load Initial Data
    useEffect(() => {
        if (initialData) {
            // Populate form
            setValue('name_ar', typeof initialData.name === 'string' ? initialData.name : initialData.name?.ar);
            setValue('name_en', typeof initialData.name === 'object' ? initialData.name?.en : '');
            setValue('description_ar', typeof initialData.description === 'string' ? initialData.description : initialData.description?.ar);
            setValue('description_en', typeof initialData.description === 'object' ? initialData.description?.en : '');
            setValue('price', Number(initialData.price));
            setValue('discount_price', Number(initialData.discount_price));
            setValue('subject_id', Number(initialData.subject_id));
            setValue('grade_id', Number(initialData.grade_id));
            setValue('semester_id', Number(initialData.semester_id));

            if (initialData.image_path) {
                setImagePreview(initialData.image_path);
            }
        } else {
            reset();
            setImagePreview(null);
        }
    }, [initialData, isOpen, reset, setValue]);

    const onSubmit = async (data: CourseFormData) => {
        try {
            const formattedData = {
                ...data,
                name: { ar: data.name_ar, en: data.name_en },
                description: { ar: data.description_ar, en: data.description_en },
                // image is handled separately if attached
            };

            if (initialData) {
                await teacherService.updateCourse(initialData.id, formattedData);
            } else {
                await teacherService.createCourse(formattedData);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to save course', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between p-6">
                    <h2 className="text-xl font-bold text-charcoal dark:text-white flex items-center gap-2">
                        <BookOpen className="text-shibl-crimson" />
                        {initialData ? 'تعديل الدورة' : 'إضافة دورة جديدة'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg transition">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">

                    {/* Image Upload */}
                    <div className="flex justify-center">
                        <div className="relative w-full max-w-md aspect-video bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center overflow-hidden hover:border-shibl-crimson/50 dark:hover:border-shibl-crimson/50 transition-colors group">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center p-6">
                                    <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-xl shadow-sm flex items-center justify-center mx-auto mb-3 text-shibl-crimson dark:text-shibl-crimson-400">
                                        <ImageIcon size={24} />
                                    </div>
                                    <p className="font-medium text-slate-700 dark:text-slate-300">صورة الدورة</p>
                                    <p className="text-xs text-slate-400 mt-1">PNG, JPG حتى 2MB</p>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setValue('image', file);
                                        setImagePreview(URL.createObjectURL(file));
                                    }
                                }}
                            />
                            {imagePreview && (
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white font-medium flex items-center gap-2">
                                        <Upload size={18} /> تغيير الصورة
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Language Tabs */}
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit mx-auto">
                        <button
                            type="button"
                            onClick={() => setActiveTab('ar')}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'ar' ? 'bg-white dark:bg-slate-700 shadow text-charcoal dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-charcoal dark:hover:text-slate-200'
                                }`}
                        >
                            العربية
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('en')}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'en' ? 'bg-white dark:bg-slate-700 shadow text-charcoal dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-charcoal dark:hover:text-slate-200'
                                }`}
                        >
                            English
                        </button>
                    </div>

                    <div className="grid gap-4">
                        {/* Name */}
                        <div className={activeTab === 'ar' ? 'block' : 'hidden'}>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">اسم الدورة (بالعربية)</label>
                            <input
                                {...register('name_ar')}
                                className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-charcoal dark:text-white focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none"
                                placeholder="مثال: الرياضيات للصف الأول"
                            />
                            {errors.name_ar && <p className="text-red-500 text-xs mt-1">{errors.name_ar.message}</p>}
                        </div>
                        <div className={activeTab === 'en' ? 'block' : 'hidden'}>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Course Name (English)</label>
                            <input
                                {...register('name_en')}
                                className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-charcoal dark:text-white focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none"
                                placeholder="Ex: Mathematics for Grade 1"
                                dir="ltr"
                            />
                        </div>

                        {/* Description */}
                        <div className={activeTab === 'ar' ? 'block' : 'hidden'}>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الوصف (بالعربية)</label>
                            <textarea
                                {...register('description_ar')}
                                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-charcoal dark:text-white focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none h-32 resize-none"
                                placeholder="وصف محتويات الدورة..."
                            />
                        </div>
                        <div className={activeTab === 'en' ? 'block' : 'hidden'}>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description (English)</label>
                            <textarea
                                {...register('description_en')}
                                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-charcoal dark:text-white focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none h-32 resize-none"
                                placeholder="Course description..."
                                dir="ltr"
                            />
                        </div>
                    </div>

                    {/* Meta Data */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">السعر</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    {...register('price', { valueAsNumber: true })}
                                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-charcoal dark:text-white focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none"
                                />
                                <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>
                            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">سعر الخصم (اختياري)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    {...register('discount_price', { valueAsNumber: true })}
                                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-charcoal dark:text-white focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none"
                                />
                                <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>
                        </div>
                    </div>

                    {/* Taxonomies */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">المادة</label>
                            <select
                                {...register('subject_id', { valueAsNumber: true })}
                                className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-charcoal dark:text-white focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none"
                                disabled={loadingData}
                            >
                                <option value="">{loadingData ? 'جاري التحميل...' : 'اختر المادة'}</option>
                                {subjects.map((sub: any) => (
                                    <option key={sub.id} value={sub.id}>
                                        {typeof sub.name === 'string' ? sub.name : (activeTab === 'ar' ? sub.name?.ar : sub.name?.en)}
                                    </option>
                                ))}
                            </select>
                            {errors.subject_id && <p className="text-red-500 text-xs mt-1">{errors.subject_id.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الصف</label>
                            <select
                                {...register('grade_id', { valueAsNumber: true })}
                                className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-charcoal dark:text-white focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none"
                                disabled={loadingData}
                            >
                                <option value="">{loadingData ? 'جاري التحميل...' : 'اختر الصف'}</option>
                                {grades.map((g: any) => (
                                    <option key={g.id} value={g.id}>
                                        {typeof g.name === 'string' ? g.name : g.name?.ar || g.name}
                                    </option>
                                ))}
                            </select>
                            {errors.grade_id && <p className="text-red-500 text-xs mt-1">{errors.grade_id.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الفصل الدراسي</label>
                            <select
                                {...register('semester_id', { valueAsNumber: true })}
                                className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-charcoal dark:text-white focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none"
                                disabled={loadingData}
                            >
                                <option value="">{loadingData ? 'جاري التحميل...' : 'اختر الفصل'}</option>
                                {semesters.map((s: any) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                            {errors.semester_id && <p className="text-red-500 text-xs mt-1">{errors.semester_id.message}</p>}
                        </div>
                    </div>

                </form>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-6 flex gap-3 z-10">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-bold transition text-slate-600 dark:text-slate-300"
                        disabled={isSubmitting}
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={handleSubmit(onSubmit)}
                        className="flex-1 py-3 bg-shibl-crimson hover:bg-shibl-crimson-dark text-white rounded-xl font-bold transition shadow-lg shadow-shibl-crimson/20 flex items-center justify-center gap-2"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : (initialData ? 'حفظ التغييرات' : 'إنشاء الدورة')}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TeacherCourseModal;
