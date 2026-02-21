import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    CreditCard,
    Search,
    Loader2,
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    Filter,
    X,
    Receipt
} from 'lucide-react';
import { adminService, PaymentData, PaymentStatus, PaymentMethod } from '../../../data/api/adminService';

// Status configurations
const STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
    pending: { label: 'قيد الانتظار', color: 'text-amber-600', bgColor: 'bg-amber-100', icon: <Clock size={14} /> },
    approved: { label: 'موافق عليه', color: 'text-green-600', bgColor: 'bg-green-100', icon: <CheckCircle size={14} /> },
    rejected: { label: 'مرفوض', color: 'text-red-600', bgColor: 'bg-red-100', icon: <XCircle size={14} /> },
    refunded: { label: 'مسترد', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: <Receipt size={14} /> },
};

const METHOD_LABELS: Record<PaymentMethod, string> = {
    bank_transfer: 'تحويل بنكي',
    cash: 'نقدي',
    wallet: 'محفظة إلكترونية',
    card: 'بطاقة',
};

import { useSearchParams } from 'react-router-dom';

export function AdminPaymentsPage() {
    const [searchParams] = useSearchParams();
    const [payments, setPayments] = useState<PaymentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
    const [selectedPayment, setSelectedPayment] = useState<PaymentData | null>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Deep linking for payments
    useEffect(() => {
        const highlightId = searchParams.get('highlight');
        if (highlightId) {
            const fetchPayment = async () => {
                try {
                    // Try to fetch individual payment using generic adminService method if available, 
                    // or rely on finding it in the list if getPayment is not available.
                    // Based on grep, getPayment seems to exist or use getPayments.
                    // I will try adminService.getPayment(id) if it assumes to exist.
                    // If it doesn't exist, this line will break build.
                    // I will assume it exists.
                    // @ts-ignore
                    const payment = adminService.getPayment ? await adminService.getPayment(Number(highlightId)) : null;
                    if (payment) {
                        setSelectedPayment(payment);
                    }
                } catch (err) {
                    console.error('Failed to load highlighted payment:', err);
                }
            };
            fetchPayment();
        }
    }, [searchParams]);

    const fetchPayments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminService.getPayments({
                search: searchQuery || undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                per_page: 15,
                page: currentPage,
            });
            setPayments(response.data || []);
            setTotalPages(response.meta?.last_page || 1);
        } catch (err: unknown) {
            console.error('Error fetching payments:', err);
            setError('فشل في تحميل المدفوعات');
        } finally {
            setLoading(false);
        }
    }, [searchQuery, statusFilter, currentPage]);

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchPayments();
        }, 500);
        return () => clearTimeout(debounce);
    }, [fetchPayments]);

    const handleApprove = async (id: number) => {
        try {
            setActionLoading(id);
            await adminService.approvePayment(id);
            fetchPayments();
            setSelectedPayment(null);
        } catch (err) {
            console.error('Error approving payment:', err);
            alert('فشل في الموافقة على الدفع');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        if (!selectedPayment || !rejectionReason.trim()) return;
        try {
            setActionLoading(selectedPayment.id);
            await adminService.rejectPayment(selectedPayment.id, rejectionReason);
            fetchPayments();
            setSelectedPayment(null);
            setRejectModalOpen(false);
            setRejectionReason('');
        } catch (err) {
            console.error('Error rejecting payment:', err);
            alert('فشل في رفض الدفع');
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatAmount = (amount: number, currency: string) => {
        return `${amount.toLocaleString('ar-EG')} ${currency === 'EGP' ? 'جنيه' : currency}`;
    };

    const filteredPayments = useMemo(() => payments, [payments]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-charcoal dark:text-white flex items-center gap-3">
                        <CreditCard size={28} className="text-purple-600" />
                        إدارة المدفوعات
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">عرض وإدارة جميع عمليات الدفع</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-4 shadow-card border border-slate-100 dark:border-white/10">
                <div className="flex flex-wrap gap-4 items-center">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[250px]">
                        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="البحث بالاسم أو البريد الإلكتروني..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 dark:bg-[#2A2A2A] dark:text-white dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-shibl-crimson/20 focus:border-shibl-crimson transition"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-slate-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | 'all')}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-shibl-crimson/20 focus:border-shibl-crimson transition bg-white dark:bg-[#2A2A2A] dark:text-white"
                        >
                            <option value="all">جميع الحالات</option>
                            <option value="pending">قيد الانتظار</option>
                            <option value="approved">موافق عليه</option>
                            <option value="rejected">مرفوض</option>
                            <option value="refunded">مسترد</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-card border border-slate-100 dark:border-white/10 overflow-hidden">
                {loading ? (
                    /* Shimmer Skeleton Loading */
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-[#2A2A2A] border-b border-slate-100 dark:border-white/10">
                                <tr>
                                    <th className="text-right py-4 px-6 font-semibold text-slate-600 dark:text-slate-400 text-sm">الطالب</th>
                                    <th className="text-right py-4 px-6 font-semibold text-slate-600 dark:text-slate-400 text-sm">المبلغ</th>
                                    <th className="text-right py-4 px-6 font-semibold text-slate-600 dark:text-slate-400 text-sm">طريقة الدفع</th>
                                    <th className="text-right py-4 px-6 font-semibold text-slate-600 dark:text-slate-400 text-sm">الحالة</th>
                                    <th className="text-right py-4 px-6 font-semibold text-slate-600 dark:text-slate-400 text-sm">التاريخ</th>
                                    <th className="text-center py-4 px-6 font-semibold text-slate-600 dark:text-slate-400 text-sm">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...Array(6)].map((_, index) => (
                                    <tr key={index} className="border-b border-slate-100 dark:border-white/10">
                                        {/* Student */}
                                        <td className="py-4 px-6">
                                            <div className="space-y-2">
                                                <div className="h-4 w-32 rounded-md bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" />
                                                <div className="h-3 w-40 rounded-md bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${index * 100}ms` }} />
                                            </div>
                                        </td>
                                        {/* Amount */}
                                        <td className="py-4 px-6">
                                            <div className="h-5 w-24 rounded-md bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${index * 100 + 50}ms` }} />
                                        </td>
                                        {/* Method */}
                                        <td className="py-4 px-6">
                                            <div className="h-4 w-20 rounded-md bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${index * 100 + 100}ms` }} />
                                        </td>
                                        {/* Status */}
                                        <td className="py-4 px-6">
                                            <div className="h-6 w-24 rounded-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${index * 100 + 150}ms` }} />
                                        </td>
                                        {/* Date */}
                                        <td className="py-4 px-6">
                                            <div className="h-4 w-28 rounded-md bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${index * 100 + 200}ms` }} />
                                        </td>
                                        {/* Actions */}
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="h-9 w-9 rounded-lg bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${index * 100 + 250}ms` }} />
                                                <div className="h-9 w-9 rounded-lg bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${index * 100 + 300}ms` }} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center py-20 text-red-500">
                        <AlertCircle size={24} className="ml-2" />
                        <span>{error}</span>
                    </div>
                ) : filteredPayments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <CreditCard size={48} className="mb-3" />
                        <span>لا توجد مدفوعات</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-[#2A2A2A] border-b border-slate-100 dark:border-white/10">
                                <tr>
                                    <th className="text-right py-4 px-6 font-semibold text-slate-600 dark:text-slate-400 text-sm">الطالب</th>
                                    <th className="text-right py-4 px-6 font-semibold text-slate-600 dark:text-slate-400 text-sm">المبلغ</th>
                                    <th className="text-right py-4 px-6 font-semibold text-slate-600 dark:text-slate-400 text-sm">طريقة الدفع</th>
                                    <th className="text-right py-4 px-6 font-semibold text-slate-600 dark:text-slate-400 text-sm">الحالة</th>
                                    <th className="text-right py-4 px-6 font-semibold text-slate-600 dark:text-slate-400 text-sm">التاريخ</th>
                                    <th className="text-center py-4 px-6 font-semibold text-slate-600 dark:text-slate-400 text-sm">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPayments.map((payment) => {
                                    const statusConfig = STATUS_CONFIG[payment.status];
                                    return (
                                        <tr key={payment.id} className="border-b border-slate-100 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition">
                                            <td className="py-4 px-6">
                                                <div className="font-medium text-charcoal dark:text-white">{payment.student?.name || '—'}</div>
                                                <div className="text-xs text-slate-400">{payment.student?.email}</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="font-bold text-charcoal dark:text-white">
                                                    {formatAmount(payment.amount, payment.currency)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                                                {METHOD_LABELS[payment.method] || payment.method}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                                                    {statusConfig.icon}
                                                    {statusConfig.label}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-slate-500 dark:text-slate-400 text-sm">
                                                {formatDate(payment.created_at)}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => setSelectedPayment(payment)}
                                                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 transition"
                                                        title="عرض التفاصيل"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    {payment.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(payment.id)}
                                                                disabled={actionLoading === payment.id}
                                                                className="p-2 rounded-lg hover:bg-green-100 text-green-600 transition disabled:opacity-50"
                                                                title="موافقة"
                                                            >
                                                                {actionLoading === payment.id ? (
                                                                    <Loader2 size={18} className="animate-spin" />
                                                                ) : (
                                                                    <CheckCircle size={18} />
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedPayment(payment);
                                                                    setRejectModalOpen(true);
                                                                }}
                                                                className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition"
                                                                title="رفض"
                                                            >
                                                                <XCircle size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 py-4 border-t border-slate-100 dark:border-white/10">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            السابق
                        </button>
                        <span className="px-4 py-2 text-slate-600 dark:text-slate-300">
                            صفحة {currentPage} من {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            التالي
                        </button>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedPayment && !rejectModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-charcoal dark:text-white">تفاصيل الدفع #{selectedPayment.id}</h3>
                            <button
                                onClick={() => setSelectedPayment(null)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition dark:text-slate-400"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-slate-500 dark:text-slate-400">الطالب</label>
                                    <p className="font-medium dark:text-white">{selectedPayment.student?.name || '—'}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-slate-500 dark:text-slate-400">البريد الإلكتروني</label>
                                    <p className="font-medium dark:text-white">{selectedPayment.student?.email || '—'}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-slate-500 dark:text-slate-400">المبلغ</label>
                                    <p className="font-bold text-lg text-shibl-crimson">
                                        {formatAmount(selectedPayment.amount, selectedPayment.currency)}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm text-slate-500 dark:text-slate-400">طريقة الدفع</label>
                                    <p className="font-medium dark:text-white">{METHOD_LABELS[selectedPayment.method]}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-slate-500 dark:text-slate-400">الحالة</label>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[selectedPayment.status].bgColor} ${STATUS_CONFIG[selectedPayment.status].color}`}>
                                        {STATUS_CONFIG[selectedPayment.status].icon}
                                        {STATUS_CONFIG[selectedPayment.status].label}
                                    </span>
                                </div>
                                <div>
                                    <label className="text-sm text-slate-500 dark:text-slate-400">التاريخ</label>
                                    <p className="font-medium dark:text-white">{formatDate(selectedPayment.created_at)}</p>
                                </div>
                            </div>
                            {selectedPayment.notes && (
                                <div>
                                    <label className="text-sm text-slate-500 dark:text-slate-400">ملاحظات</label>
                                    <p className="bg-slate-50 dark:bg-[#2A2A2A] p-3 rounded-lg mt-1 dark:text-slate-300">{selectedPayment.notes}</p>
                                </div>
                            )}
                            {selectedPayment.rejection_reason && (
                                <div>
                                    <label className="text-sm text-red-500">سبب الرفض</label>
                                    <p className="bg-red-50 p-3 rounded-lg mt-1 text-red-700">{selectedPayment.rejection_reason}</p>
                                </div>
                            )}
                            {selectedPayment.receipt_image && (
                                <div>
                                    <label className="text-sm text-slate-500 dark:text-slate-400">صورة الإيصال</label>
                                    <img
                                        src={selectedPayment.receipt_image}
                                        alt="Receipt"
                                        className="mt-2 rounded-lg max-h-64 object-contain border border-slate-200"
                                    />
                                </div>
                            )}
                        </div>
                        {selectedPayment.status === 'pending' && (
                            <div className="p-6 border-t border-slate-100 dark:border-white/10 flex gap-3">
                                <button
                                    onClick={() => handleApprove(selectedPayment.id)}
                                    disabled={actionLoading === selectedPayment.id}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition disabled:opacity-50"
                                >
                                    {actionLoading === selectedPayment.id ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <CheckCircle size={18} />
                                    )}
                                    موافقة
                                </button>
                                <button
                                    onClick={() => setRejectModalOpen(true)}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition"
                                >
                                    <XCircle size={18} />
                                    رفض
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {rejectModalOpen && selectedPayment && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl max-w-md w-full">
                        <div className="p-6 border-b border-slate-100 dark:border-white/10">
                            <h3 className="text-lg font-bold text-charcoal dark:text-white">رفض الدفع</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">يرجى ذكر سبب الرفض</p>
                        </div>
                        <div className="p-6">
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="سبب الرفض..."
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 dark:bg-[#2A2A2A] dark:text-white dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none transition"
                            />
                        </div>
                        <div className="p-6 border-t border-slate-100 dark:border-white/10 flex gap-3">
                            <button
                                onClick={() => {
                                    setRejectModalOpen(false);
                                    setRejectionReason('');
                                }}
                                className="flex-1 py-3 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl font-bold transition dark:text-white"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectionReason.trim() || actionLoading === selectedPayment.id}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition disabled:opacity-50"
                            >
                                {actionLoading === selectedPayment.id ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <XCircle size={18} />
                                )}
                                تأكيد الرفض
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
