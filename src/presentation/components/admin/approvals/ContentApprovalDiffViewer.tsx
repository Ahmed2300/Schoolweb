
import React from 'react';
import { ContentApprovalRequest } from '../../../../data/api/teacherContentApprovalService';
import { useLanguage } from '../../../hooks';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface ContentApprovalDiffViewerProps {
    request: ContentApprovalRequest;
}

// Field name translations
const fieldLabels: Record<string, string> = {
    name: 'الاسم',
    description: 'الوصف',
    title: 'العنوان',
    price: 'السعر',
    image: 'الصورة',
    video_url: 'رابط الفيديو',
    duration: 'المدة',
    is_active: 'الحالة',
    order: 'الترتيب',
};

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

    // Helper to get field label
    const getFieldLabel = (key: string): string => {
        return fieldLabels[key] || key;
    };

    // Helper to render value - properly formats multilingual objects
    const renderValue = (val: unknown): React.ReactNode => {
        if (val === null || val === undefined) {
            return <span className="text-slate-400 italic">لا يوجد</span>;
        }

        if (typeof val === 'boolean') {
            return val ? 'نعم' : 'لا';
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

            // For other objects, show a simple summary
            return <span className="text-slate-500">{Object.keys(obj).length} عناصر</span>;
        }

        return String(val);
    };

    // Calculate changed keys
    const changedKeys = Object.keys(payload);

    return (
        <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                    <tr>
                        <th className="p-3 text-slate-500 font-medium text-right">الحقل</th>
                        <th className="p-3 text-slate-500 font-medium text-right w-2/5">القيمة الحالية</th>
                        <th className="p-3 text-center w-8"></th>
                        <th className="p-3 text-slate-900 font-medium text-right w-2/5 bg-green-50/50">التعديل المطلوب</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {changedKeys.map((key) => {
                        const originalValue = approvable[key];
                        const newValue = payload[key];

                        // Skip if values are identical
                        if (JSON.stringify(originalValue) === JSON.stringify(newValue)) return null;

                        return (
                            <tr key={key} className="hover:bg-slate-50/50">
                                <td className="p-3 font-medium text-slate-700">{getFieldLabel(key)}</td>
                                <td className="p-3 text-slate-600">
                                    {renderValue(originalValue)}
                                </td>
                                <td className="p-3 text-center text-green-500">
                                    {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                                </td>
                                <td className="p-3 text-slate-900 bg-green-50/30 font-medium">
                                    {renderValue(newValue)}
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
        </div>
    );
};
