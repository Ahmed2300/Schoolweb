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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div
                className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-scaleIn"
                dir={isRTL ? 'rtl' : 'ltr'}
            >
                {/* Header with Warning Icon */}
                <div className="bg-amber-50 p-4 sm:p-6 flex flex-col items-center justify-center border-b border-amber-100">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-amber-100 rounded-full flex items-center justify-center mb-3 sm:mb-4 text-amber-600 animate-pulse-slow">
                        <AlertTriangle size={24} className="sm:hidden" strokeWidth={2.5} />
                        <AlertTriangle size={32} className="hidden sm:block" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-charcoal text-center">
                        {isRTL ? 'تم اكتشاف جلسة نشطة' : 'Active Session Detected'}
                    </h3>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 text-center">
                    <p className="text-slate-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                        {isRTL
                            ? 'أنت مسجل الدخول بالفعل من جهاز آخر. للمتابعة، يجب إنهاء الجلسة الأخرى. هل تريد تسجيل الدخول هنا وإنهاء الجلسة السابقة؟'
                            : 'You are already logged in from another device. To continue, the other session must be ended. Do you want to log in here and end the previous session?'
                        }
                    </p>

                    <div className="flex flex-col gap-2.5 sm:gap-3 pb-2 sm:pb-0">
                        <button
                            onClick={onForceLogin}
                            disabled={isLoading}
                            className="btn-primary-pro w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 border-red-600 text-white shadow-lg shadow-red-500/20 text-sm sm:text-base"
                        >
                            {isLoading ? (
                                <span className="loading loading-spinner text-white"></span>
                            ) : (
                                <>
                                    <LogOut size={16} className="sm:hidden" />
                                    <LogOut size={18} className="hidden sm:block" />
                                    <span>
                                        {isRTL ? 'المتابعة و تسجيل الخروج من الأجهزة الأخرى' : 'Continue & Logout Other Devices'}
                                    </span>
                                </>
                            )}
                        </button>

                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="btn-ghost-pro w-full py-2.5 sm:py-3 text-slate-500 hover:text-slate-700 text-sm sm:text-base"
                        >
                            {isRTL ? 'إلغاء' : 'Cancel'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
