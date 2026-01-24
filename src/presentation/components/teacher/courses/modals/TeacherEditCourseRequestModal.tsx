
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    X,
    Upload,
    Loader2,
    BookOpen,
    DollarSign,
    Image as ImageIcon,
    AlertCircle
} from 'lucide-react';
import { useLanguage } from '../../../../hooks';
import { teacherContentApprovalService } from '../../../../../data/api/teacherContentApprovalService';
import { endpoints } from '../../../../../data/api/endpoints';
import apiClient from '../../../../../data/api/ApiClient';
import toast from 'react-hot-toast';

// ==================== SCHEMA ====================
// Simplified schema for request - focused on basic info
const courseRequestSchema = z.object({
    name_ar: z.string().min(3, 'الاسم بالعربية مطلوب (3 أحرف على الأقل)'),
    name_en: z.string().optional(),
    description_ar: z.string().optional(),
    description_en: z.string().optional(),
    image: z.any().optional(),
});

type CourseRequestFormData = z.infer<typeof courseRequestSchema>;

// ==================== TYPES ====================

interface TeacherEditCourseRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    courseData: any;
}

export function TeacherEditCourseRequestModal({ isOpen, onClose, onSuccess, courseData }: TeacherEditCourseRequestModalProps) {
    const { isRTL } = useLanguage();
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'ar' | 'en'>('ar');

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<CourseRequestFormData>({
        resolver: zodResolver(courseRequestSchema),
        defaultValues: {}
    });

    // Load Initial Data
    useEffect(() => {
        if (courseData && isOpen) {
            setValue('name_ar', typeof courseData.name === 'string' ? courseData.name : courseData.name?.ar);
            setValue('name_en', typeof courseData.name === 'object' ? courseData.name?.en : '');
            setValue('description_ar', typeof courseData.description === 'string' ? courseData.description : courseData.description?.ar);
            setValue('description_en', typeof courseData.description === 'object' ? courseData.description?.en : '');

            if (courseData.image_path) {
                // Check if it's a full URL or relative path
                const imgUrl = courseData.image_path.startsWith('http')
                    ? courseData.image_path
                    : `${apiClient.defaults.baseURL?.replace('/api/v1', '')}/storage/${courseData.image_path}`;
                setImagePreview(imgUrl);
            }
        }
    }, [courseData, isOpen, setValue]);

    const onSubmit = async (data: CourseRequestFormData) => {
        try {
            // Prepare payload
            const payload: Record<string, any> = {
                name: { ar: data.name_ar, en: data.name_en },
                description: { ar: data.description_ar, en: data.description_en },
                // Image handling: 
                // We send the file object if present. The backend must handle 'multipart/form-data' or ignores it if strict JSON
                // For this implementation, we mostly signal the intent.
                ...(data.image ? { image: data.image } : {})
            };

            await teacherContentApprovalService.submitApprovalRequest({
                approvable_type: 'course',
                approvable_id: courseData.id,
                payload: payload
            });

            toast.success('تم إرسال طلب التعديل بنجاح! سيتم إشعارك بعد المراجعة.', { duration: 4000 });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to submit request', error);
            toast.error('فشل في إرسال الطلب. يرجى المحاولة مرة أخرى.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-amber-50 border-b border-amber-100 flex items-center justify-between p-6">
                    <div>
                        <h2 className="text-xl font-bold text-amber-800 flex items-center gap-2">
                            <BookOpen className="text-amber-600" />
                            طلب تعديل بيانات الدورة
                        </h2>
                        <p className="text-xs text-amber-700 mt-1 opacity-80">
                            التعديلات ستخضع للمراجعة من قبل الإدارة قبل النشر
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-amber-100/50 rounded-lg transition text-amber-800">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 bg-amber-50/50 border-b border-amber-100">
                    <div className="flex gap-2 text-sm text-amber-800 items-start">
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        <p>
                            يمكنك تعديل الاسم، الوصف، والصورة. سيتم إشعار الطلاب بالتحديثات بعد الموافقة.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">

                    {/* Image Upload */}
                    <div className="flex justify-center">
                        <div className="relative w-full max-w-md aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center overflow-hidden hover:border-amber-500/50 transition-colors group">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center p-6">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-3 text-amber-600">
                                        <ImageIcon size={24} />
                                    </div>
                                    <p className="font-medium text-slate-700">صورة الدورة</p>
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
                    <div className="flex bg-slate-100 p-1 rounded-xl w-fit mx-auto">
                        <button
                            type="button"
                            onClick={() => setActiveTab('ar')}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'ar' ? 'bg-white shadow text-charcoal' : 'text-slate-500 hover:text-charcoal'
                                }`}
                        >
                            العربية
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('en')}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'en' ? 'bg-white shadow text-charcoal' : 'text-slate-500 hover:text-charcoal'
                                }`}
                        >
                            English
                        </button>
                    </div>

                    <div className="grid gap-4">
                        {/* Name */}
                        <div className={activeTab === 'ar' ? 'block' : 'hidden'}>
                            <label className="block text-sm font-medium text-slate-700 mb-1">اسم الدورة (بالعربية)</label>
                            <input
                                {...register('name_ar')}
                                className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none"
                            />
                            {errors.name_ar && <p className="text-red-500 text-xs mt-1">{errors.name_ar.message}</p>}
                        </div>
                        <div className={activeTab === 'en' ? 'block' : 'hidden'}>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Course Name (English)</label>
                            <input
                                {...register('name_en')}
                                className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none"
                                dir="ltr"
                            />
                        </div>

                        {/* Description */}
                        <div className={activeTab === 'ar' ? 'block' : 'hidden'}>
                            <label className="block text-sm font-medium text-slate-700 mb-1">الوصف (بالعربية)</label>
                            <textarea
                                {...register('description_ar')}
                                className="w-full p-4 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none h-32 resize-none"
                            />
                        </div>
                        <div className={activeTab === 'en' ? 'block' : 'hidden'}>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description (English)</label>
                            <textarea
                                {...register('description_en')}
                                className="w-full p-4 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none h-32 resize-none"
                                dir="ltr"
                            />
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-slate-100 p-6 flex gap-3 z-10">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold transition text-slate-600"
                        disabled={isSubmitting}
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={handleSubmit(onSubmit)}
                        className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : 'إرسال طلب تعديل'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TeacherEditCourseRequestModal;
