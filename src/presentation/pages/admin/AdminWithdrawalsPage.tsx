import { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks';
import adminService, { WithdrawalData } from '../../../data/api/adminService';
import {
    Wallet,
    Search,
    RefreshCcw,
    AlertCircle,
    Loader2,
    CheckCircle,
    XCircle,
    Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

export function AdminWithdrawalsPage() {
    const { isRTL } = useLanguage();
    const [withdrawals, setWithdrawals] = useState<WithdrawalData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

    // Modal state
    const [activeModal, setActiveModal] = useState<'approve' | 'reject' | null>(null);
    const [selectedWithdrawalId, setSelectedWithdrawalId] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    const fetchWithdrawals = async (page = 1, status = 'all') => {
        setIsLoading(true);
        setError(null);
        try {
            const params: any = { page, per_page: 15 };
            if (status !== 'all') {
                params.status = status;
            }
            const response = await adminService.getWithdrawals(params);
            setWithdrawals(response.data);
            setTotalPages(response.meta.last_page);
            setCurrentPage(response.meta.current_page);
        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء تحميل طلبات السحب');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchWithdrawals(1, filterStatus);
    }, [filterStatus]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchWithdrawals(currentPage, filterStatus);
    };

    const handleApprove = async () => {
        if (!selectedWithdrawalId) return;

        setActionLoadingId(selectedWithdrawalId);
        try {
            const response = await adminService.approveWithdrawal(selectedWithdrawalId);
            toast.success(response.message);
            setWithdrawals(withdrawals.map(w =>
                w.id === selectedWithdrawalId ? { ...w, status: 'completed' } : w
            ));
            setActiveModal(null);
            setSelectedWithdrawalId(null);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'تعذر الموافقة على الطلب');
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleReject = async () => {
        if (!selectedWithdrawalId) return;

        setActionLoadingId(selectedWithdrawalId);
        try {
            const response = await adminService.rejectWithdrawal(selectedWithdrawalId, rejectReason);
            toast.success(response.message);
            setWithdrawals(withdrawals.map(w =>
                w.id === selectedWithdrawalId ? { ...w, status: 'rejected', rejection_reason: rejectReason } : w
            ));
            setActiveModal(null);
            setSelectedWithdrawalId(null);
            setRejectReason('');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'تعذر رفض الطلب');
        } finally {
            setActionLoadingId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
            case 'approved': // keep approved for backwards compatibility if needed
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400">
                        <CheckCircle size={14} />
                        مكتمل
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400">
                        <XCircle size={14} />
                        مرفوض
                    </span>
                );
            case 'pending':
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400">
                        <Clock size={14} />
                        قيد المراجعة
                    </span>
                );
        }
    };

    return (
        <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Wallet className="text-shibl-crimson" />
                        طلبات السحب
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        إدارة طلبات سحب الأرباح للمؤثرين.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-white/5 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === 'all'
                            ? 'bg-shibl-crimson text-white shadow-sm'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
                            }`}
                    >
                        الكل
                    </button>
                    <button
                        onClick={() => setFilterStatus('pending')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === 'pending'
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
                            }`}
                    >
                        قيد المراجعة
                    </button>
                    <button
                        onClick={() => setFilterStatus('completed')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === 'completed' || filterStatus === 'approved'
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
                            }`}
                    >
                        مكتملة
                    </button>
                    <button
                        onClick={() => setFilterStatus('rejected')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === 'rejected'
                            ? 'bg-red-500 text-white shadow-sm'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
                            }`}
                    >
                        مرفوضة
                    </button>
                </div>

                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing || isLoading}
                    className="p-3 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-colors"
                >
                    <RefreshCcw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Content area */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden min-h-[400px]">
                {isLoading && !isRefreshing ? (
                    <div className="flex flex-col items-center justify-center p-12 text-slate-400 h-[400px]">
                        <Loader2 className="w-8 h-8 animate-spin mb-4 text-shibl-crimson" />
                        <p>جاري تحميل البيانات...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center p-12 h-[400px]">
                        <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-4">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">تعذر تحميل البيانات</h3>
                        <p className="text-slate-500 text-center mb-6 max-w-md">{error}</p>
                        <button
                            onClick={() => fetchWithdrawals(currentPage, filterStatus)}
                            className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                        >
                            إعادة المحاولة
                        </button>
                    </div>
                ) : withdrawals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-slate-500 h-[400px]">
                        <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-4">
                            <Wallet className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-lg font-medium text-slate-700 dark:text-slate-300">لا توجد طلبات سحب</p>
                        <p className="text-sm mt-1">لم يتم العثور على أي طلبات تطابق الفلتر المحدد.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right" dir="rtl">
                            <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400">رقم الطلب</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400">المؤثر</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400">المبلغ</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400">التاريخ</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400">الحالة</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 text-left">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                {withdrawals.map((withdrawal) => (
                                    <tr key={withdrawal.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            #{withdrawal.id}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-900 dark:text-white">
                                                    {withdrawal.requestable?.name || 'غير معروف'}
                                                </span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                                    {withdrawal.requestable?.email}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-shibl-crimson">
                                                {withdrawal.amount} ر.ع
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                            {new Date(withdrawal.created_at).toLocaleDateString('ar-OM', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(withdrawal.status)}
                                        </td>
                                        <td className="px-6 py-4 text-left">
                                            {withdrawal.status === 'pending' && (
                                                <div className="flex justify-end items-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedWithdrawalId(withdrawal.id);
                                                            setActiveModal('approve');
                                                        }}
                                                        disabled={actionLoadingId === withdrawal.id}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                                                    >
                                                        موافقة
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedWithdrawalId(withdrawal.id);
                                                            setActiveModal('reject');
                                                        }}
                                                        disabled={actionLoadingId === withdrawal.id}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                                    >
                                                        رفض
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && !isLoading && !error && withdrawals.length > 0 && (
                    <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => fetchWithdrawals(currentPage - 1, filterStatus)}
                            className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 dark:bg-black/20 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                        >
                            السابق
                        </button>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                            صفحة {currentPage} من {totalPages}
                        </span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => fetchWithdrawals(currentPage + 1, filterStatus)}
                            className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 dark:bg-black/20 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                        >
                            التالي
                        </button>
                    </div>
                )}
            </div>

            {/* Approve Modal */}
            {activeModal === 'approve' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl w-full max-w-sm shadow-xl p-6 border border-slate-100 dark:border-white/10" dir={isRTL ? 'rtl' : 'ltr'}>
                        <div className="flex justify-center mb-4">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-center text-slate-800 dark:text-white mb-2">
                            تأكيد التحويل
                        </h3>
                        <p className="text-center text-slate-500 dark:text-slate-400 mb-6 text-sm">
                            هل قمت بإتمام التحويل المالي الخارجي؟
                            <br />
                            <span className="text-xs mt-2 block text-slate-400">
                                هذه الخطوة فقط لتأكيد إتمام التحويل خارج المنصة. بمجرد تأكيدك، سيظهر المبلغ في حساب المؤثر كمسحوب بشكل طبيعي.
                            </span>
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={handleApprove}
                                disabled={actionLoadingId !== null}
                                className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
                            >
                                {actionLoadingId !== null ? <Loader2 size={18} className="animate-spin" /> : 'نعم'}
                            </button>
                            <button
                                onClick={() => {
                                    setActiveModal(null);
                                    setSelectedWithdrawalId(null);
                                }}
                                disabled={actionLoadingId !== null}
                                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors"
                            >
                                لا
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {activeModal === 'reject' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl w-full max-w-sm shadow-xl p-6 border border-slate-100 dark:border-white/10" dir={isRTL ? 'rtl' : 'ltr'}>
                        <div className="flex justify-center mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-center text-slate-800 dark:text-white mb-2">
                            رفض طلب السحب
                        </h3>
                        <p className="text-center text-slate-500 dark:text-slate-400 mb-6 text-sm">
                            الرجاء إدخال سبب الرفض (اختياري)
                        </p>

                        <div className="mb-6">
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="اكتب سبب الرفض هنا..."
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:bg-white dark:focus:bg-[#1E1E1E] outline-none transition-all dark:text-white resize-none h-24"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleReject}
                                disabled={actionLoadingId !== null}
                                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
                            >
                                {actionLoadingId !== null ? <Loader2 size={18} className="animate-spin" /> : 'تأكيد الرفض'}
                            </button>
                            <button
                                onClick={() => {
                                    setActiveModal(null);
                                    setSelectedWithdrawalId(null);
                                    setRejectReason('');
                                }}
                                disabled={actionLoadingId !== null}
                                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
