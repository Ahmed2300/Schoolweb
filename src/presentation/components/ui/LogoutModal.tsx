import { useState } from 'react';
import { LogOut, X, AlertTriangle } from 'lucide-react';

interface LogoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    userName?: string;
}

/**
 * Professional logout confirmation modal with cool animations
 */
export function LogoutModal({ isOpen, onClose, onConfirm, userName }: LogoutModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await onConfirm();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-scaleIn">
                {/* Header with gradient */}
                <div className="bg-gradient-to-l from-shibl-crimson to-[#8B0A12] p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <LogOut size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-extrabold">تسجيل الخروج</h2>
                                <p className="text-white/70 text-sm">هل أنت متأكد؟</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle size={24} className="text-amber-600" />
                        </div>
                        <div>
                            <p className="text-charcoal font-bold mb-1">
                                {userName ? `وداعاً، ${userName}!` : 'تسجيل الخروج'}
                            </p>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                سيتم تسجيل خروجك من حسابك. يمكنك تسجيل الدخول مرة أخرى في أي وقت.
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-200 text-charcoal font-bold hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                            إلغاء
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className="flex-1 px-6 py-3 rounded-xl bg-shibl-crimson text-white font-bold hover:bg-shibl-crimson-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>جاري الخروج...</span>
                                </>
                            ) : (
                                <>
                                    <LogOut size={18} />
                                    <span>تأكيد الخروج</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Decorative */}
                <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-shibl-crimson/5 rounded-full" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-shibl-crimson/10 rounded-full" />
            </div>
        </div>
    );
}

export default LogoutModal;
