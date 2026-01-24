
import React, { useState } from 'react';
import { ContentApprovalRequest } from '../../../../data/api/teacherContentApprovalService';
import { adminContentApprovalService } from '../../../../data/api/adminContentApprovalService';
import { ContentApprovalDiffViewer } from './ContentApprovalDiffViewer';
import { X, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ContentApprovalDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    request: ContentApprovalRequest;
    onSuccess: () => void;
}

// Status translations
const statusLabels: Record<string, string> = {
    pending: 'قيد الانتظار',
    approved: 'تمت الموافقة',
    rejected: 'مرفوض',
};

export const ContentApprovalDetailsModal: React.FC<ContentApprovalDetailsModalProps> = ({ isOpen, onClose, request, onSuccess }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);

    if (!isOpen) return null;

    const handleApprove = async () => {
        setIsProcessing(true);
        try {
            await adminContentApprovalService.approveRequest(request.id);
            toast.success('تمت الموافقة على الطلب بنجاح');
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('فشل في الموافقة على الطلب');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            toast.error('يرجى كتابة سبب الرفض');
            return;
        }

        setIsProcessing(true);
        try {
            await adminContentApprovalService.rejectRequest(request.id, rejectReason);
            toast.success('تم رفض الطلب');
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('فشل في رفض الطلب');
        } finally {
            setIsProcessing(false);
        }
    };

    // Extract friendly type label from full model path
    const getTypeLabel = (): string => {
        const fullPath = request.approvable_type;
        const parts = fullPath.replace(/\\\\/g, '\\').split('\\');
        const modelName = parts[parts.length - 1] || fullPath;

        const typeMap: Record<string, string> = {
            'Course': 'دورة',
            'Lecture': 'محاضرة',
            'Unit': 'وحدة',
        };
        return typeMap[modelName] || modelName;
    };

    // Extract approvable name from the object
    const getApprovableName = (): string => {
        const approvable = request.approvable;
        if (!approvable) return `#${request.approvable_id}`;

        if (approvable.name) {
            if (typeof approvable.name === 'string') return approvable.name;
            return approvable.name.ar || approvable.name.en || `#${request.approvable_id}`;
        }
        if (approvable.title) return approvable.title;
        return `#${request.approvable_id}`;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">مراجعة طلب التعديل #{request.id}</h2>
                        <p className="text-sm text-slate-500 mt-1">
                            مقدم من {request.requester?.name} بتاريخ {new Date(request.created_at).toLocaleDateString('ar-EG')}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                    <div className="mb-4">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">التغييرات المطلوبة</span>
                    </div>

                    <ContentApprovalDiffViewer request={request} />

                    {/* Metadata */}
                    <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-slate-600">
                        <div className="bg-white p-3 rounded-lg border border-slate-100">
                            <span className="block text-xs text-slate-400 mb-1">المحتوى</span>
                            <span className="font-medium text-slate-900">{getApprovableName()}</span>
                            <span className="block text-xs text-slate-400 mt-0.5">{getTypeLabel()}</span>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-slate-100">
                            <span className="block text-xs text-slate-400 mb-1">الحالة</span>
                            <span className={`font-medium ${request.status === 'pending' ? 'text-amber-600' :
                                request.status === 'approved' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {statusLabels[request.status] || request.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 bg-white rounded-b-2xl">
                    {request.status === 'pending' ? (
                        <>
                            {showRejectInput ? (
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-slate-700">سبب الرفض</label>
                                    <textarea
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none h-24 resize-none text-sm"
                                        placeholder="اكتب سبب رفض هذا الطلب..."
                                    />
                                    <div className="flex gap-3 justify-start">
                                        <button
                                            onClick={handleReject}
                                            disabled={isProcessing || !rejectReason.trim()}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : 'تأكيد الرفض'}
                                        </button>
                                        <button
                                            onClick={() => setShowRejectInput(false)}
                                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium"
                                        >
                                            إلغاء
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-3 justify-start">
                                    <button
                                        onClick={handleApprove}
                                        disabled={isProcessing}
                                        className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition flex items-center gap-2 shadow-lg shadow-green-600/20"
                                    >
                                        {isProcessing ? <Loader2 size={18} className="animate-spin" /> : (
                                            <>
                                                <Check size={18} /> الموافقة على التعديلات
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setShowRejectInput(true)}
                                        className="px-6 py-2.5 border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition"
                                    >
                                        رفض
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                            <span className="text-sm text-slate-500">
                                تمت معالجة الطلب بتاريخ {request.processed_at ? new Date(request.processed_at).toLocaleString('ar-EG') : 'غير محدد'}
                            </span>
                            <button onClick={onClose} className="text-slate-900 font-medium text-sm hover:underline">
                                إغلاق
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
