import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../hooks';
import VerifiedIcon from '@mui/icons-material/Verified';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';

interface OtpVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (otp: string) => void;
    isLoading: boolean;
    onResend?: () => void;
    error?: string;
    email: string;
}

export function OtpVerificationModal({
    isOpen,
    onClose,
    onSubmit,
    isLoading,
    onResend,
    error,
    email
}: OtpVerificationModalProps) {
    const { isRTL } = useLanguage();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [countdown, setCountdown] = useState(60);
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setOtp(['', '', '', '', '', '']);
            setCountdown(60);
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        }
    }, [isOpen]);

    useEffect(() => {
        if (countdown > 0 && isOpen) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown, isOpen]);

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) {
            value = value.slice(-1);
        }
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtp = [...otp];
        pastedData.split('').forEach((char, i) => {
            if (i < 6) newOtp[i] = char;
        });
        setOtp(newOtp);
        if (pastedData.length === 6) {
            inputRefs.current[5]?.focus();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(otp.join(''));
    };

    const handleResendClick = async () => {
        if (onResend && countdown === 0) {
            setIsResending(true);
            await onResend();
            setCountdown(60);
            setIsResending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <CloseIcon />
                </button>

                <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">التحقق من الهوية</h2>
                    <p className="text-sm text-gray-600">
                        لإتمام عملية تسجيل الدخول وإنهاء الجلسات الأخرى، يرجى إدخال رمز التحقق المرسل إلى:
                    </p>
                    <p className="text-shibl-crimson font-bold mt-1 dir-ltr">{email}</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="flex justify-center gap-2 mb-6 dir-ltr">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                className="w-10 h-12 text-center text-xl font-bold border-2 border-slate-200 rounded-lg focus:border-shibl-crimson focus:ring-2 focus:ring-shibl-crimson/20 outline-none transition-all"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        className="btn-primary-pro w-full gap-2 py-3 rounded-xl mb-4"
                        disabled={isLoading || otp.join('').length !== 6}
                    >
                        {isLoading ? (
                            <span className="loading loading-spinner"></span>
                        ) : (
                            <>
                                <VerifiedIcon sx={{ fontSize: 20 }} />
                                <span>تأكيد وتسجيل الدخول</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center">
                    <button
                        onClick={handleResendClick}
                        disabled={countdown > 0 || isResending || !onResend}
                        className={`inline-flex items-center gap-1 text-sm font-bold ${countdown > 0 ? 'text-slate-400' : 'text-shibl-crimson hover:underline'
                            }`}
                    >
                        {isResending ? (
                            <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                            <RefreshIcon sx={{ fontSize: 16 }} />
                        )}
                        {countdown > 0 ? (
                            <span>إعادة الإرسال بعد {countdown} ثانية</span>
                        ) : (
                            <span>إعادة إرسال الرمز</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
