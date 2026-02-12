import { useState } from 'react';
import { X, Trash2, Loader2, AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    itemName?: string;
    onConfirm: () => Promise<void>;
    onClose: () => void;
}

export function DeleteConfirmModal({
    isOpen,
    title,
    message,
    itemName,
    onConfirm,
    onClose
}: DeleteConfirmModalProps) {
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm();
            onClose();
        } catch (error) {
            console.error('Delete failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm"
                onClick={loading ? undefined : onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-slate-900 rounded-[20px] shadow-xl w-full max-w-md mx-4 animate-in zoom-in-95 fade-in duration-200 border border-slate-200 dark:border-slate-800">
                {/* Header */}
                <div className="bg-gradient-to-br from-red-500 to-red-600 px-6 py-5 flex items-center justify-between rounded-t-[20px]">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                            <AlertTriangle size={24} className="text-white" />
                        </div>
                        <h2 className="text-lg font-extrabold text-white">{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-slate-900 dark:text-white text-sm leading-relaxed">
                        {message}
                    </p>

                    {itemName && (
                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-[12px]">
                            <p className="text-sm font-semibold text-red-700 dark:text-red-400 text-center">
                                {itemName}
                            </p>
                        </div>
                    )}

                    <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                        هذا الإجراء لا يمكن التراجع عنه.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 px-6 pb-6">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 h-12 rounded-pill bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold text-sm transition-all disabled:opacity-50"
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="flex-1 h-12 rounded-pill bg-red-500 hover:bg-red-600 text-white font-bold text-sm shadow-lg transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                <span>جاري الحذف...</span>
                            </>
                        ) : (
                            <>
                                <Trash2 size={18} />
                                <span>حذف</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
