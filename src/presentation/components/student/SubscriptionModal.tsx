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

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    course: Course;
    onSuccess: () => void;
}

type Step = 'payment' | 'upload' | 'processing' | 'success' | 'error';

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
    const [bankInfo, setBankInfo] = useState(DEFAULT_BANK_INFO);
    const [walletInfo, setWalletInfo] = useState(DEFAULT_WALLET_INFO);
    const [loadingSettings, setLoadingSettings] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [subscriptionId, setSubscriptionId] = useState<number | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setStep('payment');
            setLoading(false);
            setError(null);
            setSelectedFile(null);
            setPreviewUrl(null);
            setSubscriptionId(null);
            setCopiedField(null);
        }
    }, [isOpen]);

    // Fetch system settings on mount
    useEffect(() => {
        const fetchSettings = async () => {
            if (!isOpen) return;

            setLoadingSettings(true);
            try {
                const settings = await studentService.getSystemSettings();

                // Parse bank account info if available
                if (settings.bank_account) {
                    // Try to parse if it's JSON, otherwise use as raw text or structured string
                    // For now, assuming it comes as a string, let's just use it directly 
                    // or parse if the admin saves it as specific format.
                    // Based on AdminSettingsPage, it's a simple text area.
                    // Let's assume the text area contains lines like:
                    // Bank Name: ...
                    // Account Name: ...
                    // Account Number: ...
                    // IBAN: ...
                    // OR just simple text.

                    // Actually, looking at the UI in the screenshot, it expects structured data.
                    // But the Admin Settings page only has a single text area for "Bank Account Details".
                    // We need to parse this text area to extract the fields, or simple display the text.
                    // The current UI components <BankInfoItem> expect specific fields.
                    // Let's try to map the text content to these fields if possible, or 
                    // we might need to adjust the UI to just show the text block.

                    // improved approach: The Admin Settings save it as a string. 
                    // Let's see if we can perform a simple split by newline.
                    const lines = settings.bank_account.split('\n').map(l => l.trim()).filter(Boolean);

                    // Heuristic mapping:
                    // 1st line -> Bank Name
                    // 2nd line -> Account Name
                    // 3rd line -> Account Number
                    // 4th line -> IBAN
                    // This is a bit fragile but workable for now until we have structured settings.
                    // If less than 4 lines, fill what we can.

                    if (lines.length > 0) {
                        setBankInfo({
                            bankName: lines[0] || DEFAULT_BANK_INFO.bankName,
                            accountName: lines[1] || '',
                            accountNumber: lines[2] || '',
                            iban: lines[3] || '',
                        });
                    }
                }

                // Parse wallet info
                if (settings.phone_wallet) {
                    setWalletInfo({
                        label: 'محفظة إلكترونية',
                        number: settings.phone_wallet,
                    });
                }
            } catch (err) {
                console.error('Failed to load payment settings', err);
            } finally {
                setLoadingSettings(false);
            }
        };

        if (isOpen) {
            fetchSettings();
        }
    }, [isOpen]);

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
        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 group hover:border-shibl-crimson/30 transition-colors">
            <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                <p className="font-semibold text-charcoal text-sm truncate" dir="ltr">{value}</p>
            </div>
            <button
                onClick={() => onCopy(value, field)}
                className="w-9 h-9 rounded-lg bg-slate-50 hover:bg-shibl-crimson/10 flex items-center justify-center transition-all shrink-0 mr-2"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-300">

                {/* Header */}
                <div className="relative bg-gradient-to-l from-shibl-crimson via-[#A31621] to-[#8B0A12] px-6 py-5">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/20 -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/2" />
                    </div>

                    <button
                        onClick={handleClose}
                        className="absolute top-4 left-4 w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors backdrop-blur-sm z-10"
                    >
                        <X size={18} className="text-white" />
                    </button>

                    <div className="flex items-center gap-4 relative">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                            <CreditCard size={26} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl font-bold text-white mb-1">الاشتراك في الدورة</h2>
                            <p className="text-white/80 text-sm truncate">{courseName}</p>
                        </div>
                    </div>
                </div>

                {/* Progress Indicator */}
                {(step === 'payment' || step === 'upload') && (
                    <div className="px-6 pt-4">
                        <div className="flex items-center gap-2">
                            <div className={`flex-1 h-1.5 rounded-full transition-colors ${step === 'payment' ? 'bg-shibl-crimson' : 'bg-shibl-crimson'}`} />
                            <div className={`flex-1 h-1.5 rounded-full transition-colors ${step === 'upload' ? 'bg-shibl-crimson' : 'bg-slate-200'}`} />
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-slate-500">
                            <span className={step === 'payment' ? 'text-shibl-crimson font-medium' : ''}>معلومات الدفع</span>
                            <span className={step === 'upload' ? 'text-shibl-crimson font-medium' : ''}>رفع الإيصال</span>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="p-6">

                    {/* Step 1: Payment Info */}
                    {step === 'payment' && (
                        <div className="space-y-5">
                            {/* Price Card */}
                            <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 rounded-2xl p-5 border border-amber-100/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-600 text-sm mb-1">سعر الدورة</p>
                                        <p className="text-xs text-slate-500">شامل جميع المحاضرات والمواد</p>
                                    </div>
                                    <div className="text-left">
                                        <span className="text-3xl font-black text-shibl-crimson">{coursePrice}</span>
                                        <span className="text-lg font-bold text-shibl-crimson mr-1">ر.ع</span>
                                    </div>
                                </div>
                            </div>

                            {/* Bank Info */}
                            <div className="space-y-3">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Building2 className="text-red-600" size={24} />
                                    معلومات الحساب البنكي
                                </h3>

                                {loadingSettings ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-4 mb-8">
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

                                        <div className="mt-8">
                                            {walletInfo.number && <BankInfoItem label={walletInfo.label} value={walletInfo.number} field="wallet" onCopy={handleCopy} />}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Instructions */}
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                                        <Shield size={16} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-blue-800 font-medium mb-1">خطوات التسجيل</p>
                                        <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
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
                                className="w-full h-14 rounded-2xl bg-gradient-to-l from-shibl-crimson to-[#8B0A12] text-white font-bold text-base shadow-lg shadow-shibl-crimson/25 hover:shadow-xl hover:shadow-shibl-crimson/30 transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
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
                        <div className="space-y-5">
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
                                className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden ${dragActive
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
                                                className="w-full max-h-56 object-contain rounded-xl shadow-md"
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
                                    <div className="p-8 text-center">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mx-auto mb-4 shadow-sm">
                                            <FileImage size={28} className="text-slate-400" />
                                        </div>
                                        <p className="font-semibold text-charcoal mb-1">اسحب صورة الإيصال هنا</p>
                                        <p className="text-sm text-slate-500 mb-3">أو انقر لاختيار صورة من جهازك</p>
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
                            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                                <p className="text-sm text-amber-800 font-medium mb-2">💡 نصائح للحصول على موافقة سريعة</p>
                                <ul className="text-xs text-amber-700 space-y-1">
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
                                className="w-full h-14 rounded-2xl bg-gradient-to-l from-emerald-500 to-emerald-600 text-white font-bold text-base shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
                            >
                                <Upload size={20} />
                                إرسال طلب الاشتراك
                            </button>
                        </div>
                    )}

                    {/* Processing State */}
                    {step === 'processing' && (
                        <div className="py-8 text-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-shibl-crimson/10 to-shibl-crimson/5 flex items-center justify-center mx-auto mb-6">
                                <Loader2 size={36} className="animate-spin text-shibl-crimson" />
                            </div>
                            <h3 className="text-xl font-bold text-charcoal mb-2">جاري إرسال طلبك...</h3>
                            <p className="text-slate-500 text-sm">يرجى الانتظار قليلاً</p>
                        </div>
                    )}

                    {/* Success State */}
                    {step === 'success' && (
                        <div className="py-6 text-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-100">
                                <CheckCircle size={40} className="text-emerald-500" />
                            </div>
                            <div className="flex items-center justify-center gap-2 mb-3">
                                <Sparkles size={20} className="text-amber-500" />
                                <h3 className="text-xl font-bold text-charcoal">تم إرسال طلبك بنجاح!</h3>
                                <Sparkles size={20} className="text-amber-500" />
                            </div>
                            <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                                سيتم مراجعة إيصال الدفع وتفعيل اشتراكك<br />
                                خلال 24 ساعة كحد أقصى
                            </p>

                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 mb-6">
                                <p className="text-sm text-blue-800">
                                    ✉️ ستتلقى إشعاراً فور الموافقة على طلبك
                                </p>
                            </div>

                            <button
                                onClick={handleClose}
                                className="w-full h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-charcoal font-semibold transition-colors"
                            >
                                حسناً، فهمت
                            </button>
                        </div>
                    )}

                    {/* Error State */}
                    {step === 'error' && (
                        <div className="py-6 text-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center mx-auto mb-5">
                                <AlertCircle size={40} className="text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-charcoal mb-2">حدث خطأ</h3>
                            <p className="text-slate-500 mb-6">{error}</p>
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
