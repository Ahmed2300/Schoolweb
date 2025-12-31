import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'تأكيد',
    cancelText = 'إلغاء',
    type = 'danger',
    isLoading = false,
}: ConfirmDialogProps) {
    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const typeStyles = {
        danger: {
            iconBg: 'bg-red-100',
            iconColor: 'text-shibl-crimson',
            confirmBg: 'bg-shibl-crimson hover:bg-shibl-crimson-dark',
            confirmShadow: 'shadow-crimson',
        },
        warning: {
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-600',
            confirmBg: 'bg-amber-500 hover:bg-amber-600',
            confirmShadow: 'shadow-amber-500/30',
        },
        info: {
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            confirmBg: 'bg-blue-500 hover:bg-blue-600',
            confirmShadow: 'shadow-blue-500/30',
        },
    };

    const styles = typeStyles[type];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="relative bg-white rounded-[20px] shadow-xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 left-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-charcoal transition-colors"
                >
                    <X size={18} />
                </button>

                {/* Content */}
                <div className="p-6 pt-8 text-center">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-full ${styles.iconBg} flex items-center justify-center mx-auto mb-4`}>
                        <AlertTriangle size={32} className={styles.iconColor} />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-extrabold text-charcoal mb-2">
                        {title}
                    </h3>

                    {/* Message */}
                    <p className="text-slate-grey text-sm leading-relaxed mb-6">
                        {message}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-6 py-3 rounded-pill bg-slate-100 hover:bg-slate-200 text-charcoal font-semibold text-sm transition-all duration-200 disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`px-6 py-3 rounded-pill ${styles.confirmBg} text-white font-bold text-sm ${styles.confirmShadow} transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center gap-2`}
                        >
                            {isLoading && (
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
