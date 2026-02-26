import { useState } from 'react';
import { influencerService } from '../../../data/api/influencerService';
import { X, Wallet, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface WithdrawalRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentBalance: number;
    onSuccess: (amount: number) => void;
}

export function WithdrawalRequestModal({ isOpen, onClose, currentBalance, onSuccess }: WithdrawalRequestModalProps) {
    const [amount, setAmount] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<string>('Bank Transfer');
    const [paymentDetails, setPaymentDetails] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Common payment methods for influencers
    const PAYMENT_METHODS = [
        { id: 'Bank Transfer', label: 'تحويل بنكي' },
        { id: 'PayPal', label: 'PayPal' },
        { id: 'Cash', label: 'نقدي (في المكتب)' }
    ];

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const withdrawalAmount = parseFloat(amount);

        if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
            setError('يرجى إدخال مبلغ صحيح');
            return;
        }

        if (withdrawalAmount > currentBalance) {
            setError('المبلغ المطلوب يتجاوز رصيدك المتاح');
            return;
        }

        if (!paymentMethod) {
            setError('يرجى اختيار طريقة الدفع');
            return;
        }

        if (!paymentDetails.trim() && paymentMethod !== 'Cash') {
            setError('يرجى إدخال تفاصيل الدفع');
            return;
        }

        setIsLoading(true);
        try {
            await influencerService.createWithdrawal(
                withdrawalAmount,
                paymentMethod,
                paymentMethod === 'Cash' ? 'Cash Pickup' : paymentDetails
            );
            toast.success('تم إرسال طلب السحب بنجاح');
            onSuccess(withdrawalAmount);
            onClose();
            // Reset form
            setAmount('');
            setPaymentDetails('');
            setPaymentMethod('Bank Transfer');
        } catch (err: any) {
            setError(err.response?.data?.message || 'حدث خطأ أثناء إرسال طلب السحب');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-[#18181A] border border-[#27272A] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-5 border-b border-[#27272A] flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                        <Wallet className="text-indigo-400" />
                        طلب سحب رصيد
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-[#888888] hover:text-white">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6">
                    <div className="bg-[#27272A]/50 border border-[#27272A] rounded-2xl p-4 mb-6 flex justify-between items-center">
                        <p className="text-sm text-[#888888] font-medium">الرصيد المتاح</p>
                        <p className="text-lg font-bold text-white">{currentBalance} ر.ع</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-[#888888] mb-1">
                                المبلغ المطلوب (ر.ع)
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={amount}
                                onChange={(e) => {
                                    setAmount(e.target.value);
                                    setError(null);
                                }}
                                className="w-full h-12 px-4 rounded-xl border border-[#27272A] bg-black/20 text-white focus:border-indigo-500/50 focus:bg-[#1E1E1E] outline-none transition-all placeholder:text-[#555555]"
                                placeholder="0.00"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-[#888888] mb-1">
                                طريقة الدفع
                            </label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => {
                                    setPaymentMethod(e.target.value);
                                    setError(null);
                                }}
                                className="w-full h-12 px-4 rounded-xl border border-[#27272A] bg-black/20 text-white focus:border-indigo-500/50 focus:bg-[#1E1E1E] outline-none transition-all appearance-none"
                                required
                            >
                                {PAYMENT_METHODS.map(method => (
                                    <option key={method.id} value={method.id} className="bg-[#18181A] text-white">
                                        {method.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {paymentMethod !== 'Cash' && (
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-[#888888] mb-1">
                                    {paymentMethod === 'Bank Transfer' ? 'تفاصيل الحساب البنكي (الاسم، البنك، رقم الحساب)' : 'البريد الإلكتروني لحساب PayPal'}
                                </label>
                                <textarea
                                    value={paymentDetails}
                                    onChange={(e) => {
                                        setPaymentDetails(e.target.value);
                                        setError(null);
                                    }}
                                    className="w-full min-h-[80px] p-4 rounded-xl border border-[#27272A] bg-black/20 text-white focus:border-indigo-500/50 focus:bg-[#1E1E1E] outline-none transition-all resize-none placeholder:text-[#555555]"
                                    placeholder={paymentMethod === 'Bank Transfer' ? "أدخل تفاصيل حسابك البنكي هنا..." : "example@domain.com"}
                                    required={paymentMethod !== 'Cash'}
                                />
                            </div>
                        )}

                        {error && (
                            <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-sm">
                                <AlertCircle size={16} className="shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 px-4 rounded-xl font-semibold text-[#888888] bg-[#27272A]/50 hover:bg-[#27272A] hover:text-white border border-[#27272A] transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || !amount || parseFloat(amount) <= 0 || (!paymentDetails.trim() && paymentMethod !== 'Cash')}
                                className="flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border border-indigo-500/50"
                            >
                                {isLoading ? (
                                    <><Loader2 size={18} className="animate-spin" /> جاري الإرسال...</>
                                ) : (
                                    'تأكيد الطلب'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
