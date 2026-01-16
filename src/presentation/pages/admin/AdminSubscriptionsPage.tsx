/**
 * Admin Subscriptions Management Page
 * 
 * Allows admins to view, approve, and reject course subscription requests.
 */

import { useState, useEffect, useCallback } from 'react';
import {
    CreditCard,
    Search,
    Clock,
    AlertCircle,
    Calendar,
    Check,
    X,
    Eye,
    User,
    BookOpen,
    XCircle,
    Loader2,
    RefreshCw,
    Receipt,
    DollarSign
} from 'lucide-react';
import adminService, {
    AdminSubscription,
    AdminSubscriptionStatus,
    AdminSubscriptionStatusLabels,
    AdminSubscriptionStatusColors,
    PaginatedResponse
} from '../../../data/api/adminService';

// Status filter options
const statusFilters: { label: string; value: AdminSubscriptionStatus | undefined; icon: typeof CreditCard; activeColor: string }[] = [
    { label: 'كل الطلبات', value: undefined, icon: CreditCard, activeColor: 'bg-slate-600' },
    { label: 'قيد المراجعة', value: 2, icon: Clock, activeColor: 'bg-amber-500' },
    { label: 'نشطة', value: 1, icon: CreditCard, activeColor: 'bg-green-600' },
    { label: 'مرفوضة', value: 3, icon: XCircle, activeColor: 'bg-red-500' },
];

// Helper to get localized name
const getLocalizedName = (name: { ar?: string; en?: string } | string | undefined): string => {
    if (!name) return 'غير معروف';
    if (typeof name === 'string') {
        try {
            const parsed = JSON.parse(name);
            return parsed.ar || parsed.en || name;
        } catch {
            return name;
        }
    }
    return name.ar || name.en || 'غير معروف';
};

export function AdminSubscriptionsPage() {
    // State
    const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<AdminSubscriptionStatus | undefined>(2); // Default to pending
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Modal states
    const [selectedSubscription, setSelectedSubscription] = useState<AdminSubscription | null>(null);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    // Fetch subscriptions
    const fetchSubscriptions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response: PaginatedResponse<AdminSubscription> = await adminService.getSubscriptions({
                status: statusFilter,
                page: currentPage,
                per_page: 10,
            });
            setSubscriptions(response.data || []);
            setTotalPages(response.meta?.last_page || 1);
            setTotalItems(response.meta?.total || 0);
        } catch (err) {
            console.error('Error fetching subscriptions:', err);
            setError('فشل في تحميل الاشتراكات');
        } finally {
            setLoading(false);
        }
    }, [statusFilter, currentPage]);

    useEffect(() => {
        fetchSubscriptions();
    }, [fetchSubscriptions]);

    // Listen for real-time updates - refetch when admin receives subscription-related notifications
    useEffect(() => {
        const handleDataUpdate = (event: Event) => {
            const customEvent = event as CustomEvent;
            const notification = customEvent.detail;

            // Refetch when subscription-related notifications arrive
            if (notification?.type?.includes('subscription')) {
                console.log('Subscription data update received, refreshing list...');
                fetchSubscriptions();
            }
        };

        // Listen for admin notifications (dispatched from NotificationBell)
        window.addEventListener('admin-notification', handleDataUpdate);

        return () => {
            window.removeEventListener('admin-notification', handleDataUpdate);
        };
    }, [fetchSubscriptions]);

    // Handlers
    const handleApprove = async (subscription: AdminSubscription) => {
        if (!confirm(`هل تريد تفعيل اشتراك ${subscription.student?.name}؟`)) return;
        setActionLoading(true);
        try {
            await adminService.approveSubscription(subscription.id);
            fetchSubscriptions();
        } catch (err) {
            console.error('Error approving subscription:', err);
            alert('فشل في تفعيل الاشتراك');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!selectedSubscription || !rejectionReason.trim()) return;
        setActionLoading(true);
        try {
            await adminService.rejectSubscription(selectedSubscription.id, rejectionReason);
            setShowRejectModal(false);
            setRejectionReason('');
            setSelectedSubscription(null);
            fetchSubscriptions();
        } catch (err) {
            console.error('Error rejecting subscription:', err);
            alert('فشل في رفض الاشتراك');
        } finally {
            setActionLoading(false);
        }
    };

    const openRejectModal = (subscription: AdminSubscription) => {
        setSelectedSubscription(subscription);
        setRejectionReason('');
        setShowRejectModal(true);
    };

    const openReceiptModal = (subscription: AdminSubscription) => {
        setSelectedSubscription(subscription);
        setShowReceiptModal(true);
    };

    // Filter by search
    const filteredSubscriptions = subscriptions.filter(sub => {
        if (!searchQuery) return true;
        const studentName = sub.student?.name?.toLowerCase() || '';
        const courseName = getLocalizedName(sub.course?.name).toLowerCase();
        return studentName.includes(searchQuery.toLowerCase()) || courseName.includes(searchQuery.toLowerCase());
    });

    // Count pending
    const pendingCount = statusFilter === 2 ? totalItems : subscriptions.filter(s => s.status === 2).length;

    return (
        <>
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-shibl-crimson to-[#8B0A12] flex items-center justify-center shadow-lg">
                        <CreditCard size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-charcoal">إدارة الاشتراكات</h1>
                        <p className="text-sm text-slate-grey">مراجعة وإدارة طلبات الاشتراك في الدورات</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 lg:w-72">
                        <input
                            type="text"
                            placeholder="بحث بالاسم أو الكورس..."
                            className="w-full h-11 pl-4 pr-11 rounded-[12px] bg-white border border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                    {/* Refresh */}
                    <button
                        onClick={fetchSubscriptions}
                        disabled={loading}
                        className="h-11 px-4 rounded-[12px] bg-white border border-slate-200 hover:border-shibl-crimson text-slate-600 hover:text-shibl-crimson font-semibold text-sm transition-all flex items-center gap-2"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex gap-3 mb-6 flex-wrap">
                {statusFilters.map((filter) => {
                    const Icon = filter.icon;
                    const isActive = statusFilter === filter.value;
                    return (
                        <button
                            key={filter.label}
                            onClick={() => {
                                setStatusFilter(filter.value);
                                setCurrentPage(1);
                            }}
                            className={`flex items-center gap-2 px-5 py-3 rounded-[12px] font-bold text-sm transition-all duration-300 ${isActive
                                ? `${filter.activeColor} text-white shadow-lg`
                                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                                }`}
                        >
                            <Icon size={18} />
                            <span>{filter.label}</span>
                            {filter.value === 2 && pendingCount > 0 && (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                    {pendingCount}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            {loading ? (
                <div className="bg-white rounded-[16px] shadow-card p-12 flex items-center justify-center">
                    <Loader2 size={40} className="animate-spin text-shibl-crimson" />
                </div>
            ) : error ? (
                <div className="bg-white rounded-[16px] shadow-card p-12 text-center">
                    <AlertCircle className="mx-auto mb-3 text-red-500" size={48} />
                    <p className="text-red-600 font-medium mb-4">{error}</p>
                    <button
                        onClick={fetchSubscriptions}
                        className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-colors"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            ) : filteredSubscriptions.length === 0 ? (
                <div className="bg-white rounded-[16px] shadow-card p-12 text-center">
                    <CreditCard size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-charcoal mb-2">لا توجد اشتراكات</h3>
                    <p className="text-sm text-slate-grey">لا توجد طلبات اشتراك بالحالة المحددة</p>
                </div>
            ) : (
                <div className="bg-white rounded-[16px] shadow-card overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CreditCard size={20} className="text-shibl-crimson" />
                            <h2 className="font-bold text-charcoal">قائمة الاشتراكات</h2>
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                                {totalItems} اشتراك
                            </span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الطالب</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الدورة</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الحالة</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">التاريخ</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredSubscriptions.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                                                    {sub.student?.name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-charcoal block">{sub.student?.name || 'غير معروف'}</span>
                                                    <span className="text-xs text-slate-grey">{sub.student?.email || ''}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <BookOpen size={16} className="text-shibl-crimson" />
                                                <span className="text-sm text-charcoal font-medium">{getLocalizedName(sub.course?.name)}</span>
                                            </div>
                                            {sub.course?.price && (
                                                <span className="text-xs text-slate-grey flex items-center gap-1 mt-1">
                                                    <DollarSign size={12} />
                                                    {sub.course.price} ر.ع
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${AdminSubscriptionStatusColors[sub.status]}`}>
                                                {AdminSubscriptionStatusLabels[sub.status]}
                                            </span>
                                            {sub.status === 3 && sub.rejection_reason && (
                                                <p className="text-xs text-red-500 mt-1 max-w-[150px] truncate" title={sub.rejection_reason}>
                                                    {sub.rejection_reason}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-grey text-sm">
                                                <Calendar size={14} />
                                                {sub.created_at ? new Date(sub.created_at).toLocaleDateString('ar-EG') : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {/* View Receipt */}
                                                {sub.bill_image_path && (
                                                    <button
                                                        onClick={() => openReceiptModal(sub)}
                                                        className="py-2 px-3 rounded-[8px] bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold text-xs transition-colors flex items-center gap-1"
                                                        title="عرض الإيصال"
                                                    >
                                                        <Receipt size={14} />
                                                        الإيصال
                                                    </button>
                                                )}

                                                {/* Approve/Reject for pending */}
                                                {sub.status === 2 && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(sub)}
                                                            disabled={actionLoading}
                                                            className="py-2 px-4 rounded-[8px] bg-green-100 hover:bg-green-200 text-green-700 font-semibold text-xs transition-colors flex items-center gap-1 disabled:opacity-50"
                                                        >
                                                            <Check size={14} />
                                                            قبول
                                                        </button>
                                                        <button
                                                            onClick={() => openRejectModal(sub)}
                                                            disabled={actionLoading}
                                                            className="py-2 px-4 rounded-[8px] bg-red-100 hover:bg-red-200 text-red-600 font-semibold text-xs transition-colors flex items-center gap-1 disabled:opacity-50"
                                                        >
                                                            <X size={14} />
                                                            رفض
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-slate-100 flex justify-center gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-10 h-10 rounded-[8px] font-medium transition-all ${currentPage === page
                                        ? 'bg-shibl-crimson text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Receipt Preview Modal */}
            {showReceiptModal && selectedSubscription && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowReceiptModal(false)}>
                    <div className="bg-white rounded-[20px] max-w-lg w-full overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-charcoal flex items-center gap-2">
                                <Receipt size={20} />
                                معاينة الإيصال
                            </h3>
                            <button onClick={() => setShowReceiptModal(false)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
                                <X size={18} className="text-slate-500" />
                            </button>
                        </div>
                        <div className="p-6">
                            {selectedSubscription.bill_image_path ? (
                                <img
                                    src={selectedSubscription.bill_image_path}
                                    alt="إيصال الدفع"
                                    className="w-full rounded-[12px] shadow-lg mb-6"
                                />
                            ) : (
                                <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 rounded-[12px] flex items-center justify-center mb-6">
                                    <Receipt size={48} className="text-slate-400" />
                                </div>
                            )}
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-[10px]">
                                    <User size={18} className="text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-grey">الطالب</p>
                                        <p className="font-semibold text-charcoal">{selectedSubscription.student?.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-[10px]">
                                    <BookOpen size={18} className="text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-grey">الدورة</p>
                                        <p className="font-semibold text-charcoal">{getLocalizedName(selectedSubscription.course?.name)}</p>
                                    </div>
                                </div>
                            </div>
                            {selectedSubscription.status === 2 && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setShowReceiptModal(false);
                                            handleApprove(selectedSubscription);
                                        }}
                                        disabled={actionLoading}
                                        className="flex-1 py-3 rounded-[12px] bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <Check size={18} />
                                        قبول الاشتراك
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowReceiptModal(false);
                                            openRejectModal(selectedSubscription);
                                        }}
                                        className="flex-1 py-3 rounded-[12px] bg-red-100 hover:bg-red-200 text-red-600 font-bold text-sm transition-colors flex items-center justify-center gap-2"
                                    >
                                        <X size={18} />
                                        رفض
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && selectedSubscription && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowRejectModal(false)}>
                    <div className="bg-white rounded-[20px] max-w-md w-full overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-red-100 bg-red-50 flex items-center justify-between">
                            <h3 className="font-bold text-red-700 flex items-center gap-2">
                                <XCircle size={20} />
                                رفض الاشتراك
                            </h3>
                            <button onClick={() => setShowRejectModal(false)} className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center">
                                <X size={18} className="text-red-600" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-slate-600">
                                أنت على وشك رفض طلب اشتراك <strong>{selectedSubscription.student?.name}</strong> في دورة <strong>{getLocalizedName(selectedSubscription.course?.name)}</strong>
                            </p>
                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-2">سبب الرفض *</label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="اكتب سبب رفض الطلب..."
                                    className="w-full h-24 rounded-[12px] border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none p-3 text-sm resize-none"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowRejectModal(false)}
                                    className="flex-1 py-3 rounded-[12px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={actionLoading || !rejectionReason.trim()}
                                    className="flex-1 py-3 rounded-[12px] bg-red-600 hover:bg-red-700 text-white font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {actionLoading ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <XCircle size={18} />
                                    )}
                                    تأكيد الرفض
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
