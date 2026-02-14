import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { AlertTriangle, LogOut } from 'lucide-react';

interface SessionConflictModalProps {
    isOpen: boolean;
    onClose: () => void;
    onForceLogin: () => void;
    isLoading?: boolean;
}

export const SessionConflictModal: React.FC<SessionConflictModalProps> = ({
    isOpen,
    onClose,
    onForceLogin,
    isLoading = false
}) => {
    const { isRTL } = useLanguage();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-scaleIn"
                dir={isRTL ? 'rtl' : 'ltr'}
            >
                {/* Header with Warning Icon */}
                <div className="bg-amber-50 p-6 flex flex-col items-center justify-center border-b border-amber-100">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4 text-amber-600 animate-pulse-slow">
                        <AlertTriangle size={32} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-xl font-extrabold text-charcoal text-center">
                        {isRTL ? 'تم اكتشاف جلسة نشطة' : 'Active Session Detected'}
                    </h3>
                </div>

                {/* Content */}
                <div className="p-6 text-center">
                    <p className="text-slate-600 mb-6 leading-relaxed">
                        {isRTL
                            ? 'أنت مسجل الدخول بالفعل من جهاز آخر. للمتابعة، يجب إنهاء الجلسة الأخرى. هل تريد تسجيل الدخول هنا وإنهاء الجلسة السابقة؟'
                            : 'You are already logged in from another device. To continue, the other session must be ended. Do you want to log in here and end the previous session?'
                        }
                    </p>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={onForceLogin}
                            disabled={isLoading}
                            className="btn-primary-pro w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 border-red-600 text-white shadow-lg shadow-red-500/20"
                        >
                            {isLoading ? (
                                <span className="loading loading-spinner text-white"></span>
                            ) : (
                                <>
                                    <LogOut size={18} />
                                    <span>
                                        {isRTL ? 'المتابعة و تسجيل الخروج من الأجهزة الأخرى' : 'Continue & Logout Other Devices'}
                                    </span>
                                </>
                            )}
                        </button>

                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="btn-ghost-pro w-full py-3 text-slate-500 hover:text-slate-700"
                        >
                            {isRTL ? 'إلغاء' : 'Cancel'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
