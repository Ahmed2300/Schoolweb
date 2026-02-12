/**
 * UnitFormModal Component
 * 
 * Modal dialog for creating and editing units.
 * Supports multilingual title/description fields.
 */

import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { Unit, CreateUnitRequest, UpdateUnitRequest } from '../../../../types/unit';

interface UnitFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateUnitRequest | UpdateUnitRequest) => void;
    unit?: Unit | null; // If provided, editing mode
    isSubmitting?: boolean;
}

export function UnitFormModal({
    isOpen,
    onClose,
    onSubmit,
    unit,
    isSubmitting,
}: UnitFormModalProps) {
    const [titleAr, setTitleAr] = useState('');
    const [titleEn, setTitleEn] = useState('');
    const [descriptionAr, setDescriptionAr] = useState('');
    const [descriptionEn, setDescriptionEn] = useState('');
    const [isPublished, setIsPublished] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const isEditing = !!unit;

    // Populate form when editing
    useEffect(() => {
        if (unit) {
            setTitleAr(unit.title?.ar || '');
            setTitleEn(unit.title?.en || '');
            setDescriptionAr(unit.description?.ar || '');
            setDescriptionEn(unit.description?.en || '');
            setIsPublished(unit.is_published);
        } else {
            // Reset form for new unit
            setTitleAr('');
            setTitleEn('');
            setDescriptionAr('');
            setDescriptionEn('');
            setIsPublished(false);
        }
        setErrors({});
    }, [unit, isOpen]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!titleAr.trim()) {
            newErrors.titleAr = 'عنوان الوحدة بالعربية مطلوب';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        const data: CreateUnitRequest | UpdateUnitRequest = {
            title: { ar: titleAr.trim(), en: titleEn.trim() || undefined },
            description: descriptionAr || descriptionEn
                ? { ar: descriptionAr.trim() || undefined, en: descriptionEn.trim() || undefined }
                : undefined,
            is_published: isPublished,
        };

        onSubmit(data);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            {/* Backdrop */}
            <div
                className="absolute inset-0"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                        {isEditing ? 'تعديل الوحدة' : 'إضافة وحدة جديدة'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label="إغلاق"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 space-y-5">
                    {/* Title Arabic */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            عنوان الوحدة (عربي) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={titleAr}
                            onChange={(e) => setTitleAr(e.target.value)}
                            placeholder="مثال: الوحدة الأولى - الجبر"
                            className={`
                                w-full px-4 py-3 rounded-xl border-2 text-right transition-all
                                bg-white dark:bg-slate-950/50 text-slate-900 dark:text-white
                                focus:outline-none focus:ring-2 focus:ring-shibl-crimson/20 focus:border-shibl-crimson
                                ${errors.titleAr ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/10' : 'border-slate-200 dark:border-slate-700'}
                            `}
                            dir="rtl"
                        />
                        {errors.titleAr && (
                            <p className="mt-1 text-sm text-red-500">{errors.titleAr}</p>
                        )}
                    </div>

                    {/* Title English */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            عنوان الوحدة (إنجليزي)
                        </label>
                        <input
                            type="text"
                            value={titleEn}
                            onChange={(e) => setTitleEn(e.target.value)}
                            placeholder="e.g. Unit 1 - Algebra"
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-shibl-crimson/20 focus:border-shibl-crimson transition-all"
                            dir="ltr"
                        />
                    </div>

                    {/* Description Arabic */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            وصف الوحدة (عربي)
                        </label>
                        <textarea
                            value={descriptionAr}
                            onChange={(e) => setDescriptionAr(e.target.value)}
                            placeholder="وصف مختصر للوحدة..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-shibl-crimson/20 focus:border-shibl-crimson resize-none transition-all"
                            dir="rtl"
                        />
                    </div>

                    {/* Publish Toggle */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div>
                            <p className="font-medium text-slate-700 dark:text-slate-200">نشر الوحدة</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">الوحدة ستكون مرئية للطلاب</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isPublished}
                                onChange={(e) => setIsPublished(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-shibl-crimson/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-shibl-crimson"></div>
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-shibl-crimson text-white rounded-xl font-medium hover:bg-shibl-crimson/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-shibl-crimson/20"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    جاري الحفظ...
                                </>
                            ) : (
                                isEditing ? 'حفظ التعديلات' : 'إضافة الوحدة'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UnitFormModal;
