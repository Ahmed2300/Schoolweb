/**
 * Subscription Modal Component
 * 
 * Production-ready modal for students to subscribe to paid courses.
 * Features: Dynamic bank info, receipt upload with preview, clean modern UI.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
    X,
    Upload,
    CheckCircle,
    AlertCircle,
    Loader2,
    CreditCard,
    Building2,
    Copy,
    Check,
    Image as ImageIcon,
    FileImage,
    Sparkles,
    ArrowLeft,
    Shield
} from 'lucide-react';
import { studentService, Course, getLocalizedName } from '../../../data/api/studentService';
import { useSettings } from '../../../hooks/useSettings';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    course: Course;
    onSuccess: () => void;
}

type Step = 'payment' | 'upload' | 'processing' | 'success' | 'error' | 'free-confirm';

// Bank info - In production, this would come from settings/API
// Fallback values in case settings are missing
const DEFAULT_BANK_INFO = {
    bankName: 'Bank Muscat',
    accountName: '', // Empty by default if not set
    accountNumber: '',
    iban: '',
};

const DEFAULT_WALLET_INFO = {
    label: 'محفظة إلكترونية',
    number: '',
};

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
    isOpen,
    onClose,
    course,
    onSuccess,
}) => {
    const [step, setStep] = useState<Step>('payment');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { data: settings = {}, isLoading: loadingSettings } = useSettings();
    const [bankInfo, setBankInfo] = useState(DEFAULT_BANK_INFO);
    const [walletInfo, setWalletInfo] = useState(DEFAULT_WALLET_INFO);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [subscriptionId, setSubscriptionId] = useState<number | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isFree = !course.price || course.price === 0;

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setStep(isFree ? 'free-confirm' : 'payment');
            setLoading(false);
            setError(null);
            setSelectedFile(null);
            setPreviewUrl(null);
            setSubscriptionId(null);
            setCopiedField(null);
        }
    }, [isOpen, isFree]);

    // Process system settings on mount (only for paid courses)
    useEffect(() => {
        if (!isOpen || isFree || Object.keys(settings).length === 0) return;

        if (settings.bank_account) {
            const lines = settings.bank_account.split('\n').map((l: string) => l.trim()).filter(Boolean);

            if (lines.length > 0) {
                setBankInfo({
                    bankName: lines[0] || DEFAULT_BANK_INFO.bankName,
                    accountName: lines[1] || '',
                    accountNumber: lines[2] || '',
                    iban: lines[3] || '',
                });
            }
        }

        if (settings.phone_wallet) {
            setWalletInfo({
                label: 'محفظة إلكترونية',
                number: settings.phone_wallet,
            });
        }
    }, [isOpen, isFree, settings]);

    if (!isOpen) return null;

    const courseName = getLocalizedName(course.name, 'الدورة');
    const coursePrice = course.price || 0;

    // Copy to clipboard
    const handleCopy = async (text: string, field: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // File handling
    const handleFileSelect = (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('يرجى اختيار صورة صالحة (PNG, JPG, JPEG)');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setError('حجم الصورة يجب أن يكون أقل من 10 ميجابايت');
            return;
        }
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setError(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFileSelect(file);
    };

    const removeFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Submit handlers
    // First button just navigates to upload step - NO API call
    const handleProceedToUpload = () => {
        setError(null);
        setStep('upload');
    };

    // Free course: direct subscribe — no receipt needed
    const handleFreeSubscribe = async () => {
        setLoading(true);
        setError(null);

        try {
            const subscription = await studentService.subscribeToCourse(course.id);
            setSubscriptionId(subscription.id);
            setStep('success');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            const message = error.response?.data?.message || 'حدث خطأ أثناء الاشتراك';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // This creates subscription AND uploads receipt together
    const handleSubmitReceipt = async () => {
        if (!selectedFile) {
            setError('يرجى اختيار صورة الإيصال');
            return;
        }

        setStep('processing');
        setError(null);

        try {
            // Step 1: Create the subscription
            const subscription = await studentService.subscribeToCourse(course.id);

            // Step 2: Upload the receipt
            await studentService.uploadPaymentReceipt(subscription.id, selectedFile);

            setSubscriptionId(subscription.id);
            setStep('success');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            const message = error.response?.data?.message || 'حدث خطأ أثناء إرسال طلب الاشتراك';
            setError(message);
            setStep('upload');
        }
    };

    const handleClose = () => {
        if (step === 'success') {
            onSuccess();
        }
        onClose();
    };

    // Render bank info item with copy
    const BankInfoItem = ({ label, value, field, onCopy }: { label: string; value: string; field: string; onCopy: (text: string, field: string) => void }) => (
        <div className="flex items-center justify-between p-2.5 sm:p-3 bg-white rounded-xl border border-slate-100 group hover:border-shibl-crimson/30 transition-colors">
            <div className="flex-1 min-w-0">
                <p className="text-[11px] sm:text-xs text-slate-500 mb-0.5">{label}</p>
                <p className="font-semibold text-charcoal text-xs sm:text-sm break-all leading-relaxed" dir="ltr">{value}</p>
            </div>
            <button
                onClick={() => onCopy(value, field)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-50 hover:bg-shibl-crimson/10 flex items-center justify-center transition-all shrink-0 mr-2"
                title="نسخ"
            >
                {copiedField === field ? (
                    <Check size={16} className="text-emerald-500" />
                ) : (
                    <Copy size={16} className="text-slate-400 group-hover:text-shibl-crimson" />
                )}
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={handleClose}
            />

            {/* Modal — bottom-sheet on mobile, centered card on desktop */}
            <div className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md max-h-[95dvh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 fade-in duration-300">

                {/* Drag Handle — mobile only */}
                <div className="sm:hidden flex justify-center pt-2 pb-0 shrink-0">
                    <div className="w-10 h-1 rounded-full bg-slate-300" />
                </div>

                {/* Header */}
                <div className="relative bg-gradient-to-l from-shibl-crimson via-[#A31621] to-[#8B0A12] px-4 py-3 sm:px-6 sm:py-5 shrink-0">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/20 -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/2" />
                    </div>

                    <button
                        onClick={handleClose}
                        className="absolute top-3 left-3 sm:top-4 sm:left-4 w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors backdrop-blur-sm z-10"
                    >
                        <X size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
                    </button>

                    <div className="flex items-center gap-3 sm:gap-4 relative">
                        <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg shrink-0">
                            <CreditCard size={22} className="text-white sm:w-[26px] sm:h-[26px]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg sm:text-xl font-bold text-white mb-0.5 sm:mb-1">الاشتراك في الدورة</h2>
                            <p className="text-white/80 text-xs sm:text-sm truncate">{courseName}</p>
                        </div>
                    </div>
                </div>

                {/* Progress Indicator (paid courses only) */}
                {!isFree && (step === 'payment' || step === 'upload') && (
                    <div className="px-4 sm:px-6 pt-3 sm:pt-4 shrink-0">
                        <div className="flex items-center gap-2">
                            <div className={`flex-1 h-1.5 rounded-full transition-colors ${step === 'payment' ? 'bg-shibl-crimson' : 'bg-shibl-crimson'}`} />
                            <div className={`flex-1 h-1.5 rounded-full transition-colors ${step === 'upload' ? 'bg-shibl-crimson' : 'bg-slate-200'}`} />
                        </div>
                        <div className="flex justify-between mt-1.5 sm:mt-2 text-xs text-slate-500">
                            <span className={step === 'payment' ? 'text-shibl-crimson font-medium' : ''}>معلومات الدفع</span>
                            <span className={step === 'upload' ? 'text-shibl-crimson font-medium' : ''}>رفع الإيصال</span>
                        </div>
                    </div>
                )}

                {/* Content — scrollable area */}
                <div className="p-4 sm:p-6 overflow-y-auto flex-1">

                    {/* Free Course: Direct Subscribe */}
                    {(step === 'free-confirm' && isFree) && (
                        <div className="space-y-5">
                            {/* Free Badge */}
                            <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-50 rounded-2xl p-6 border border-emerald-100/50 text-center">
                                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                                    <Sparkles size={28} className="text-emerald-600" />
                                </div>
                                <p className="text-lg font-bold text-emerald-800 mb-1">دورة مجانية!</p>
                                <p className="text-sm text-emerald-600">
                                    يمكنك الاشتراك مباشرة بدون الحاجة لإرسال إيصال أو انتظار موافقة
                                </p>
                            </div>

                            {/* Course Info */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                                        <CheckCircle size={20} className="text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-charcoal text-sm">{courseName}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">سيتم تفعيل اشتراكك فوراً</p>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
                                    <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            <button
                                onClick={handleFreeSubscribe}
                                disabled={loading}
                                className="w-full h-14 rounded-2xl bg-gradient-to-l from-emerald-500 to-emerald-600 text-white font-bold text-base shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        جاري الاشتراك...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={20} />
                                        اشترك الآن مجاناً
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Step 1: Payment Info (paid courses only) */}
                    {step === 'payment' && (
                        <div className="space-y-4 sm:space-y-5">
                            {/* Price Card */}
                            <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-amber-100/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-600 text-xs sm:text-sm mb-0.5 sm:mb-1">سعر الدورة</p>
                                        <p className="text-[11px] sm:text-xs text-slate-500">شامل جميع المحاضرات والمواد</p>
                                    </div>
                                    <div className="text-left">
                                        <span className="text-2xl sm:text-3xl font-black text-shibl-crimson">{coursePrice}</span>
                                        <span className="text-base sm:text-lg font-bold text-shibl-crimson mr-1">ر.ع</span>
                                    </div>
                                </div>
                            </div>

                            {/* Bank Info */}
                            <div className="space-y-2.5 sm:space-y-3">
                                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                                    <Building2 className="text-red-600" size={20} />
                                    معلومات الحساب البنكي
                                </h3>

                                {loadingSettings ? (
                                    <div className="flex justify-center py-6 sm:py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-3 sm:space-y-4 mb-5 sm:mb-8">
                                            {/* Only show items that have values */}
                                            {bankInfo.bankName && <BankInfoItem label="اسم البنك" value={bankInfo.bankName} field="bank" onCopy={handleCopy} />}
                                            {bankInfo.accountName && <BankInfoItem label="اسم الحساب" value={bankInfo.accountName} field="name" onCopy={handleCopy} />}
                                            {bankInfo.accountNumber && <BankInfoItem label="رقم الحساب" value={bankInfo.accountNumber} field="account" onCopy={handleCopy} />}
                                            {bankInfo.iban && <BankInfoItem label="رقم IBAN" value={bankInfo.iban} field="iban" onCopy={handleCopy} />}
                                        </div>

                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-gray-200"></div>
                                            </div>
                                            <div className="relative flex justify-center text-sm">
                                                <span className="px-2 bg-white text-gray-500">أو</span>
                                            </div>
                                        </div>

                                        <div className="mt-5 sm:mt-8">
                                            {walletInfo.number && <BankInfoItem label={walletInfo.label} value={walletInfo.number} field="wallet" onCopy={handleCopy} />}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Instructions */}
                            <div className="bg-blue-50 rounded-xl p-3 sm:p-4 border border-blue-100">
                                <div className="flex gap-2.5 sm:gap-3">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                                        <Shield size={14} className="text-blue-600 sm:w-4 sm:h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs sm:text-sm text-blue-800 font-medium mb-1">خطوات التسجيل</p>
                                        <ol className="text-[11px] sm:text-xs text-blue-700 space-y-0.5 sm:space-y-1 list-decimal list-inside">
                                            <li>قم بتحويل المبلغ إلى الحساب البنكي أعلاه</li>
                                            <li>احتفظ بصورة واضحة لإيصال التحويل</li>
                                            <li>ارفع صورة الإيصال في الخطوة التالية</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
                                    <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            <button
                                onClick={handleProceedToUpload}
                                disabled={loading}
                                className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-l from-shibl-crimson to-[#8B0A12] text-white font-bold text-sm sm:text-base shadow-lg shadow-shibl-crimson/25 hover:shadow-xl hover:shadow-shibl-crimson/30 transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        جاري التحميل...
                                    </>
                                ) : (
                                    <>
                                        قمت بالتحويل، التالي
                                        <ArrowLeft size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Step 2: Upload Receipt */}
                    {step === 'upload' && (
                        <div className="space-y-4 sm:space-y-5">
                            {/* Back button */}
                            <button
                                onClick={() => setStep('payment')}
                                className="flex items-center gap-2 text-sm text-slate-500 hover:text-shibl-crimson transition-colors"
                            >
                                <ArrowLeft size={16} className="rotate-180" />
                                العودة لمعلومات الدفع
                            </button>

                            {/* Upload Area */}
                            <div
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => !selectedFile && fileInputRef.current?.click()}
                                className={`relative border-2 border-dashed rounded-xl sm:rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden ${dragActive
                                    ? 'border-shibl-crimson bg-shibl-crimson/5 scale-[1.02]'
                                    : selectedFile
                                        ? 'border-emerald-300 bg-emerald-50/50'
                                        : 'border-slate-200 hover:border-shibl-crimson/50 hover:bg-slate-50'
                                    }`}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />

                                {previewUrl ? (
                                    <div className="p-4">
                                        <div className="relative">
                                            <img
                                                src={previewUrl}
                                                alt="معاينة الإيصال"
                                                className="w-full max-h-44 sm:max-h-56 object-contain rounded-xl shadow-md"
                                            />
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeFile();
                                                }}
                                                className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                        <div className="mt-3 flex items-center justify-center gap-2 text-emerald-600">
                                            <CheckCircle size={16} />
                                            <span className="text-sm font-medium">{selectedFile?.name}</span>
                                        </div>
                                        <p className="text-center text-xs text-slate-400 mt-1">انقر لتغيير الصورة</p>
                                    </div>
                                ) : (
                                    <div className="p-5 sm:p-8 text-center">
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-sm">
                                            <FileImage size={24} className="text-slate-400 sm:w-7 sm:h-7" />
                                        </div>
                                        <p className="font-semibold text-charcoal text-sm mb-0.5 sm:mb-1">اسحب صورة الإيصال هنا</p>
                                        <p className="text-xs sm:text-sm text-slate-500 mb-2 sm:mb-3">أو انقر لاختيار صورة من جهازك</p>
                                        <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <ImageIcon size={14} />
                                                PNG, JPG
                                            </span>
                                            <span>حتى 10MB</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Tips */}
                            <div className="bg-amber-50 rounded-xl p-3 sm:p-4 border border-amber-100">
                                <p className="text-xs sm:text-sm text-amber-800 font-medium mb-1.5 sm:mb-2">💡 نصائح للحصول على موافقة سريعة</p>
                                <ul className="text-[11px] sm:text-xs text-amber-700 space-y-0.5 sm:space-y-1">
                                    <li>• تأكد من وضوح جميع تفاصيل التحويل</li>
                                    <li>• يجب أن يظهر المبلغ ورقم الحساب بوضوح</li>
                                    <li>• استخدم صورة بجودة عالية</li>
                                </ul>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
                                    <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            <button
                                onClick={handleSubmitReceipt}
                                disabled={!selectedFile || loading}
                                className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-l from-emerald-500 to-emerald-600 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
                            >
                                <Upload size={20} />
                                إرسال طلب الاشتراك
                            </button>
                        </div>
                    )}

                    {/* Processing State */}
                    {step === 'processing' && (
                        <div className="py-6 sm:py-8 text-center">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-shibl-crimson/10 to-shibl-crimson/5 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                                <Loader2 size={30} className="animate-spin text-shibl-crimson sm:w-9 sm:h-9" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-charcoal mb-2">جاري إرسال طلبك...</h3>
                            <p className="text-slate-500 text-xs sm:text-sm">يرجى الانتظار قليلاً</p>
                        </div>
                    )}

                    {/* Success State */}
                    {step === 'success' && (
                        <div className="py-4 sm:py-6 text-center">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center mx-auto mb-4 sm:mb-5 shadow-lg shadow-emerald-100">
                                <CheckCircle size={32} className="text-emerald-500 sm:w-10 sm:h-10" />
                            </div>
                            <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                                <Sparkles size={16} className="text-amber-500 sm:w-5 sm:h-5" />
                                <h3 className="text-lg sm:text-xl font-bold text-charcoal">
                                    {isFree ? 'تم الاشتراك بنجاح!' : 'تم إرسال طلبك بنجاح!'}
                                </h3>
                                <Sparkles size={16} className="text-amber-500 sm:w-5 sm:h-5" />
                            </div>
                            <p className="text-slate-500 mb-4 sm:mb-6 text-xs sm:text-sm leading-relaxed">
                                {isFree ? (
                                    <>تم تفعيل اشتراكك في الدورة<br />يمكنك البدء في التعلم الآن!</>
                                ) : (
                                    <>سيتم مراجعة إيصال الدفع وتفعيل اشتراكك<br />خلال 24 ساعة كحد أقصى</>
                                )}
                            </p>

                            {!isFree && (
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
                                    <p className="text-xs sm:text-sm text-blue-800">
                                        ✉️ ستتلقى إشعاراً فور الموافقة على طلبك
                                    </p>
                                </div>
                            )}

                            {isFree && (
                                <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
                                    <p className="text-xs sm:text-sm text-emerald-800">
                                        🎉 اشتراكك مفعّل! يمكنك الوصول لجميع المحتوى الآن
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={handleClose}
                                className="w-full h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-charcoal font-semibold transition-colors"
                            >
                                {isFree ? 'ابدأ التعلم' : 'حسناً، فهمت'}
                            </button>
                        </div>
                    )}

                    {/* Error State */}
                    {step === 'error' && (
                        <div className="py-4 sm:py-6 text-center">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center mx-auto mb-4 sm:mb-5">
                                <AlertCircle size={32} className="text-red-500 sm:w-10 sm:h-10" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-charcoal mb-2">حدث خطأ</h3>
                            <p className="text-slate-500 text-sm mb-4 sm:mb-6">{error}</p>
                            <button
                                onClick={() => setStep('payment')}
                                className="w-full h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-charcoal font-semibold transition-colors"
                            >
                                المحاولة مرة أخرى
                            </button>
                        </div>
                    )}
                </div>
            </div >
        </div >
    );
};

export default SubscriptionModal;
