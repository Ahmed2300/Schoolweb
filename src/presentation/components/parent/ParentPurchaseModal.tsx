import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import {
    X,
    Upload,
    CheckCircle,
    Loader2,
    BookOpen,
    ImageIcon,
    AlertCircle,
} from 'lucide-react';

// ==================== Types ====================

export type PurchaseItemType = 'package' | 'course';

export interface PurchaseItem {
    id: number;
    name: string;
    description?: string;
    price: number;
    finalPrice?: number;
    discountPercentage?: number;
    image?: string;
    coursesCount?: number;
    type: PurchaseItemType;
    childName: string;
}

interface ParentPurchaseModalProps {
    item: PurchaseItem;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (billImage: File) => Promise<void>;
}

// ==================== Component ====================

export function ParentPurchaseModal({
    item,
    isOpen,
    onClose,
    onSubmit,
}: ParentPurchaseModalProps) {
    const [billImage, setBillImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [purchaseSuccess, setPurchaseSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const displayPrice = item.finalPrice ?? item.price;
    const hasDiscount =
        item.finalPrice !== undefined &&
        item.finalPrice !== null &&
        item.finalPrice < item.price;

    // --- Handlers ---

    const handleFileSelect = (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('يرجى رفع صورة فقط (PNG, JPG, WEBP)');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setError('حجم الصورة يجب أن يكون أقل من 10 ميجابايت');
            return;
        }
        setError(null);
        setBillImage(file);
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFileSelect(file);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleRemoveFile = () => {
        setBillImage(null);
        setPreview(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async () => {
        if (!billImage) return;
        setIsPurchasing(true);
        setError(null);
        try {
            await onSubmit(billImage);
            setPurchaseSuccess(true);
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : 'حدث خطأ أثناء إتمام العملية';
            setError(message);
        } finally {
            setIsPurchasing(false);
        }
    };

    const handleClose = () => {
        setBillImage(null);
        setPreview(null);
        setError(null);
        setPurchaseSuccess(false);
        setIsPurchasing(false);
        onClose();
    };

    // --- Render ---

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) handleClose();
            }}
            role="dialog"
            aria-modal="true"
            aria-label="إتمام الشراء"
        >
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-br from-shibl-crimson to-red-700 p-6 text-white shrink-0">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg">
                            {item.type === 'package' ? 'شراء الباقة' : 'الاشتراك في الدورة'}
                        </h3>
                        <button
                            onClick={handleClose}
                            className="text-white/80 hover:text-white transition-colors"
                            aria-label="إغلاق"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <p className="text-white/80 text-sm mt-1">{item.name}</p>
                    <p className="text-white/60 text-xs mt-0.5">
                        لصالح: {item.childName}
                    </p>
                </div>

                {/* Body — scrollable */}
                <div className="p-6 space-y-5 overflow-y-auto flex-1">
                    {/* Success State */}
                    {purchaseSuccess ? (
                        <div className="text-center py-8">
                            <CheckCircle className="mx-auto text-emerald-500" size={60} />
                            <h4 className="mt-4 font-bold text-charcoal text-lg">
                                تم إرسال طلبك بنجاح!
                            </h4>
                            <p className="text-slate-400 text-sm mt-1">
                                سيتم مراجعة طلبك وإشعارك فور الموافقة
                            </p>
                            <button
                                onClick={handleClose}
                                className="mt-6 bg-charcoal text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-slate-800 transition-colors"
                            >
                                حسناً
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Price Summary */}
                            <div className="bg-slate-50 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-600 font-medium">إجمالي المبلغ</span>
                                    <div className="flex items-center gap-2">
                                        {hasDiscount && (
                                            <span className="text-sm text-slate-400 line-through">
                                                {item.price} ر.ع
                                            </span>
                                        )}
                                        <span className="font-bold text-xl text-charcoal">
                                            {displayPrice} ر.ع
                                        </span>
                                    </div>
                                </div>
                                {item.coursesCount !== undefined && item.coursesCount > 0 && (
                                    <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
                                        <BookOpen size={12} />
                                        <span>{item.coursesCount} دورة مشمولة</span>
                                    </div>
                                )}
                            </div>

                            {/* Bank Account Info */}
                            <div className="space-y-3">
                                <h4 className="font-bold text-charcoal text-sm flex items-center gap-2">
                                    <svg
                                        className="w-4 h-4 text-shibl-crimson"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <rect width="20" height="14" x="2" y="5" rx="2" />
                                        <path d="M2 10h20" />
                                    </svg>
                                    معلومات الحساب البنكي
                                </h4>

                                {/* Bank Name */}
                                <BankInfoRow label="اسم البنك" value="Bank Muscat" />
                                {/* Account Name */}
                                <BankInfoRow
                                    label="اسم الحساب"
                                    value="ABDALLA MOHSEN KAMAL MOHAMMED ALI"
                                />
                                {/* Account Number */}
                                <BankInfoRow
                                    label="رقم الحساب"
                                    value="0476079726660011"
                                    mono
                                />
                                {/* IBAN */}
                                <BankInfoRow
                                    label="رقم IBAN"
                                    value="OM72BMSC0476079726660011"
                                    mono
                                />
                            </div>

                            {/* Divider */}
                            <div className="relative py-1">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-slate-200" />
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-white px-2 text-xs text-slate-500">أو</span>
                                </div>
                            </div>

                            {/* Digital wallet */}
                            <BankInfoRow label="محفظة إلكترونية" value="91938082" />

                            {/* Bill Upload Area */}
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">
                                    صورة إيصال الدفع <span className="text-red-500">*</span>
                                </label>
                                <div
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${isDragging
                                            ? 'border-shibl-crimson bg-shibl-crimson/5'
                                            : billImage
                                                ? 'border-emerald-300 bg-emerald-50/50'
                                                : 'border-slate-200 hover:border-shibl-crimson'
                                        }`}
                                >
                                    {preview ? (
                                        <div className="space-y-3">
                                            <img
                                                src={preview}
                                                alt="إيصال الدفع"
                                                className="mx-auto max-h-32 rounded-lg object-contain"
                                            />
                                            <p className="text-sm text-slate-600 truncate">
                                                {billImage?.name}
                                            </p>
                                            <button
                                                onClick={handleRemoveFile}
                                                className="text-red-500 text-xs hover:underline"
                                            >
                                                إزالة
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer block">
                                            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                {isDragging ? (
                                                    <ImageIcon className="text-shibl-crimson" size={24} />
                                                ) : (
                                                    <Upload className="text-slate-400" size={24} />
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500">
                                                اسحب الصورة هنا أو{' '}
                                                <span className="text-shibl-crimson font-bold">اضغط للرفع</span>
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                PNG, JPG أو WEBP — حد أقصى 10 ميجابايت
                                            </p>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleInputChange}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                                    <AlertCircle size={16} className="shrink-0" />
                                    {error}
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                onClick={handleSubmit}
                                disabled={isPurchasing || !billImage}
                                className="w-full bg-shibl-crimson text-white py-3.5 rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isPurchasing ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        جاري الإرسال...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={18} />
                                        تأكيد{' '}
                                        {item.type === 'package' ? 'الشراء' : 'الاشتراك'} —{' '}
                                        {displayPrice} ر.ع
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// ==================== Sub-component ====================

function BankInfoRow({
    label,
    value,
    mono = false,
}: {
    label: string;
    value: string;
    mono?: boolean;
}) {
    const handleCopy = () => {
        navigator.clipboard.writeText(value);
    };

    return (
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-shibl-crimson/30 transition-colors group">
            <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400">{label}</p>
                <p
                    className={`font-semibold text-charcoal text-sm truncate ${mono ? 'font-mono' : ''}`}
                    dir="ltr"
                >
                    {value}
                </p>
            </div>
            <button
                onClick={handleCopy}
                className="w-8 h-8 rounded-lg bg-white hover:bg-shibl-crimson/10 flex items-center justify-center transition-all shrink-0 mr-2 border border-slate-200"
                title="نسخ"
            >
                <svg
                    className="w-4 h-4 text-slate-400 group-hover:text-shibl-crimson"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
            </button>
        </div>
    );
}

export default ParentPurchaseModal;
