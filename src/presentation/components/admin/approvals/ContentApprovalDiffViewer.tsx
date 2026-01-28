
import React from 'react';
import { ContentApprovalRequest } from '../../../../data/api/teacherContentApprovalService';
import { useLanguage } from '../../../hooks';
import { ArrowRight, ArrowLeft, Calendar, Video } from 'lucide-react';

interface ContentApprovalDiffViewerProps {
    request: ContentApprovalRequest;
}

export const ContentApprovalDiffViewer: React.FC<ContentApprovalDiffViewerProps> = ({ request }) => {
    const { isRTL } = useLanguage();
    const { payload, approvable } = request;

    if (!approvable) {
        return (
            <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg">
                المحتوى الأصلي غير موجود (ربما تم حذفه). عرض التغييرات المقترحة فقط.
            </div>
        );
    }

    // Field name translations
    const fieldLabels: Record<string, string> = {
        name: 'الاسم',
        description: 'الوصف',
        title: 'العنوان',
        price: 'السعر',
        discount_price: 'السعر بعد الخصم',
        image: 'الصورة',
        image_path: 'صورة الغلاف',
        thumbnail: 'الصورة المصغرة',
        video_url: 'رابط الفيديو',
        video_path: 'الفيديو',
        duration: 'المدة (دقيقة)',
        is_active: 'الحالة',
        order: 'الترتيب',
        unit_id: 'الوحدة',
        is_online: 'نوع المحاضرة',
        start_time: 'وقت البدء',
        end_time: 'وقت الانتهاء',
        course_id: 'الكورس',
        is_published: 'النشر',
        time_slot_id: 'فترة البث المباشر',
        type: 'النوع',
        category: 'القسم',
        category_id: 'القسم',
        grade_id: 'الصف الدراسي',
        term_id: 'الترم/الفصل',
        requirements: 'المتطلبات',
        objectives: 'ماذا ستتعلم',
        what_will_learn: 'ماذا ستتعلم', // sometimes used alias
        is_free: 'مجاني',
        level: 'المستوى',
        language: 'اللغة',
        created_at: 'تاريخ الإنشاء',
        updated_at: 'تاريخ التحديث',
        teacher_id: 'المعلم',
    };

    // Helper to format date/time in Arabic
    const formatDateTime = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            return date.toLocaleString('ar-EG', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            });
        } catch {
            return dateString;
        }
    };

    const [zoomedImage, setZoomedImage] = React.useState<string | null>(null);

    // Helper to get field label
    const getFieldLabel = (key: string): string => {
        return fieldLabels[key] || key;
    };

    // Helper to get localized name
    const getLocalizedName = (name: any): string => {
        if (!name) return '';
        if (typeof name === 'string') return name;
        return name.ar || name.en || '';
    };

    // Helper to check if string is ISO Date
    const isIsoDate = (str: string): boolean => {
        return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(str);
    };

    // Helper to render value
    const renderValue = (val: unknown, key?: string): React.ReactNode => {
        // Handle null/undefined
        if (val === null || val === undefined) {
            if (key === 'video_path') return <span className="text-slate-400 italic">لا يوجد فيديو</span>;
            if (key === 'image_path') {
                return (
                    <div className="w-32 aspect-video bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 border-dashed">
                        <span className="text-xs text-slate-400">لا توجد صورة</span>
                    </div>
                );
            }
            return <span className="text-slate-300 select-none">-</span>;
        }

        // Array Handling (e.g., requirements, objectives)
        if (Array.isArray(val)) {
            if (val.length === 0) return <span className="text-slate-400 italic">لا يوجد</span>;
            return (
                <ul className="list-disc list-inside space-y-1">
                    {val.map((item, idx) => (
                        <li key={idx} className="text-slate-700">{typeof item === 'object' ? getLocalizedName(item) : String(item)}</li>
                    ))}
                </ul>
            );
        }

        // Course ID Lookup
        if (key === 'course_id') {
            if (approvable && (approvable.id == val || approvable.id === Number(val))) {
                return (
                    <span className="font-medium text-slate-900">
                        {getLocalizedName((approvable as any).name || (approvable as any).title)}
                    </span>
                );
            }
            return <span className="font-mono text-slate-600">ID: {String(val)}</span>;
        }

        // Video Path Handling
        if (key === 'video_path' && typeof val === 'string') {
            const baseUrl = 'http://localhost:8000'; // Or use import.meta.env.VITE_API_URL
            const videoUrl = val.startsWith('http') ? val : `${baseUrl}/storage/${val}`;

            return (
                <div className="space-y-2">
                    <video
                        controls
                        className="w-full max-w-sm rounded-lg border border-slate-200 bg-black"
                        src={videoUrl}
                    >
                        المتصفح لا يدعم عرض الفيديو.
                    </video>
                    <a href={videoUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline block text-center">
                        فتح الفيديو في نافذة جديدة
                    </a>
                </div>
            );
        }

        // Image Path/Thumbnail Handling
        if ((key === 'image_path' || key === 'thumbnail' || key === 'image') && typeof val === 'string') {
            const baseUrl = 'http://localhost:8000';
            const imageUrl = val.startsWith('http') ? val : `${baseUrl}/storage/${val}`;

            return (
                <>
                    <div
                        className="relative w-32 aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200 cursor-zoom-in group"
                        onClick={() => setZoomedImage(imageUrl)}
                    >
                        <img
                            src={imageUrl}
                            alt="Preview"
                            className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement?.classList.add('flex', 'items-center', 'justify-center');
                                (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-xs text-slate-400">فشل التحميل</span>';
                            }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        </div>
                    </div>
                </>
            );
        }

        // Explicit Date/Time fields or Auto-detection
        if ((key === 'start_time' || key === 'end_time' || key === 'created_at' || key === 'updated_at') || (typeof val === 'string' && isIsoDate(val))) {
            return (
                <span className="inline-flex items-center gap-1.5 text-slate-800">
                    <Calendar size={14} className="text-slate-500" />
                    {formatDateTime(String(val))}
                </span>
            );
        }

        // Time Slot ID
        if (key === 'time_slot_id' && (typeof val === 'number' || typeof val === 'string')) {
            return (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-medium">
                    <Video size={14} />
                    حجز فترة #{val}
                </span>
            );
        }

        // is_published
        if (key === 'is_published' && typeof val === 'boolean') {
            return val ? (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                    ✓ سيتم النشر بعد الموافقة
                </span>
            ) : (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
                    مسودة
                </span>
            );
        }

        // is_free
        if (key === 'is_free' && typeof val === 'boolean') {
            return val ? (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                    مجاني
                </span>
            ) : (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700">
                    مدفوع
                </span>
            );
        }

        // is_online
        if (key === 'is_online' && typeof val === 'boolean') {
            return val ? (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700">
                    بث مباشر (أونلاين)
                </span>
            ) : (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700">
                    محاضرة مسجلة
                </span>
            );
        }

        if (typeof val === 'boolean') {
            return val ? 'نعم' : 'لا';
        }

        // Unit ID Lookup
        if (key === 'unit_id' && (typeof val === 'number' || typeof val === 'string')) {
            const units = (approvable as any).units as Array<any> | undefined;
            if (units && Array.isArray(units)) {
                const unit = units.find(u => String(u.id) === String(val));
                if (unit) {
                    return (
                        <span className="font-medium text-slate-900">
                            {getLocalizedName(unit.title) || getLocalizedName(unit.name)}
                        </span>
                    );
                }
            }
            return <span className="text-slate-500">{val}</span>;
        }

        if (typeof val === 'object') {
            const obj = val as Record<string, unknown>;

            // Handle multilingual {ar, en} objects
            if ('ar' in obj || 'en' in obj) {
                const arVal = obj.ar as string | undefined;
                const enVal = obj.en as string | undefined;

                return (
                    <div className="space-y-1">
                        {arVal && (
                            <div className="flex items-center gap-1">
                                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-medium">عربي</span>
                                <span>{arVal}</span>
                            </div>
                        )}
                        {enVal && (
                            <div className="flex items-center gap-1">
                                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-medium">EN</span>
                                <span dir="ltr">{enVal}</span>
                            </div>
                        )}
                        {!arVal && !enVal && <span className="text-slate-400 italic">لا يوجد</span>}
                    </div>
                );
            }

            // For active_sections or similar nested structures, try to be smart
            if (Array.isArray(obj)) {
                return renderValue(obj, key);
            }

            // For other objects, show a simple summary
            return <span className="text-slate-500">{Object.keys(obj).length} عناصر</span>;
        }

        return String(val);
    };

    // Calculate changed keys
    const changedKeys = Object.keys(payload).filter(k => k !== 'action' && k !== 'teacher_id');

    // Check if this is a creation request
    const action = payload.action as string | undefined;
    const isCreation = action?.startsWith('create_');

    return (
        <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                    <tr>
                        <th className="p-3 text-slate-500 font-medium text-right">الحقل</th>
                        <th className="p-3 text-slate-500 font-medium text-right w-2/5">
                            {isCreation ? 'القيمة الحالية' : 'القيمة الحالية'}
                        </th>
                        <th className="p-3 text-center w-8"></th>
                        <th className="p-3 text-slate-900 font-medium text-right w-2/5 bg-green-50/50">
                            {isCreation ? 'البيانات الجديدة' : 'التعديل المطلوب'}
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {changedKeys.map((key) => {
                        const newValue = payload[key];
                        const originalValue = isCreation ? null : approvable[key];

                        if (!isCreation && JSON.stringify(originalValue) === JSON.stringify(newValue)) return null;

                        return (
                            <tr key={key} className="hover:bg-slate-50/50">
                                <td className="p-3 font-medium text-slate-700">{getFieldLabel(key)}</td>
                                <td className="p-3 text-slate-600">
                                    {isCreation ? (
                                        <span className="text-slate-300 select-none">-</span>
                                    ) : (
                                        renderValue(originalValue, key)
                                    )}
                                </td>
                                <td className="p-3 text-center text-green-500">
                                    {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                                </td>
                                <td className="p-3 text-slate-900 bg-green-50/30 font-medium">
                                    {renderValue(newValue, key)}
                                </td>
                            </tr>
                        );
                    })}
                    {changedKeys.length === 0 && (
                        <tr>
                            <td colSpan={4} className="p-8 text-center text-slate-500">
                                لا توجد تغييرات مكتشفة
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Image Zoom Modal */}
            {zoomedImage && (
                <div
                    className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
                    onClick={() => setZoomedImage(null)}
                >
                    <img
                        src={zoomedImage}
                        alt="Zoomed"
                        className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain animate-in zoom-in-95 duration-200"
                    />
                    <button
                        className="absolute top-4 right-4 text-white/50 hover:text-white transition"
                        onClick={() => setZoomedImage(null)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            )}
        </div>
    );
};
