/**
 * Admin Package Subscriptions Management Page
 * 
 * Allows admins to view, approve, and reject package subscription requests.
 */

import { useState, useEffect, useCallback } from 'react';
import {
    Package,
    Search,
    Clock,
    AlertCircle,
    Calendar,
    Check,
    X,
    User,
    BookOpen,
    XCircle,
    Loader2,
    RefreshCw,
    Receipt,
    DollarSign,
    GraduationCap,
    CheckCircle
} from 'lucide-react';
import { packageService, PackageSubscription } from '../../../data/api';
import { getLocalizedName } from '../../../data/api/studentService';


// Status filter options
const statusFilters: { label: string; value: string | undefined; icon: typeof Package; activeColor: string }[] = [
    { label: 'كل الطلبات', value: undefined, icon: Package, activeColor: 'bg-slate-600' },
    { label: 'قيد المراجعة', value: 'pending', icon: Clock, activeColor: 'bg-amber-500' },
    { label: 'نشطة', value: 'active', icon: CheckCircle, activeColor: 'bg-green-600' },
    { label: 'مرفوضة', value: 'rejected', icon: XCircle, activeColor: 'bg-red-500' },
];

// Status labels and colors
const StatusLabels: Record<string, string> = {
    pending: 'قيد المراجعة',
    active: 'نشط',
    rejected: 'مرفوض',
    expired: 'منتهي',
};

const StatusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    active: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    expired: 'bg-slate-100 text-slate-700',
};

export function AdminPackageSubscriptionsPage() {
    // State
    const [subscriptions, setSubscriptions] = useState<PackageSubscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string | undefined>('pending'); // Default to pending
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Modal states
    const [selectedSubscription, setSelectedSubscription] = useState<PackageSubscription | null>(null);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [showPackageModal, setShowPackageModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    // Fetch subscriptions
    const fetchSubscriptions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Pass status filter directly to API
            const response = await packageService.getAllSubscriptions(currentPage, 15, statusFilter);
            const data = response.data || [];

            setSubscriptions(data);
            setTotalPages(response.meta?.last_page || 1);
            setTotalItems(response.meta?.total || data.length);
        } catch (err) {
            console.error('Error fetching package subscriptions:', err);
            setError('فشل في تحميل اشتراكات الباقات');
        } finally {
            setLoading(false);
        }
    }, [statusFilter, currentPage]);

    useEffect(() => {
        fetchSubscriptions();
    }, [fetchSubscriptions]);

    // Listen for real-time updates
    useEffect(() => {
        const handleDataUpdate = (event: Event) => {
            const customEvent = event as CustomEvent;
            const notification = customEvent.detail;

            // Refetch when package subscription-related notifications arrive
            if (notification?.type?.includes('package') || notification?.type?.includes('subscription')) {
                console.log('Package subscription data update received, refreshing list...');
                fetchSubscriptions();
            }
        };

        window.addEventListener('admin-notification', handleDataUpdate);

        return () => {
            window.removeEventListener('admin-notification', handleDataUpdate);
        };
    }, [fetchSubscriptions]);

    // Handlers
    const handleApprove = async (subscription: PackageSubscription) => {
        if (!confirm(`هل تريد تفعيل اشتراك ${subscription.student?.name} في باقة ${subscription.package?.name}؟`)) return;
        setActionLoading(true);
        try {
            await packageService.approveSubscription(subscription.id);
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
            await packageService.rejectSubscription(selectedSubscription.id, rejectionReason);
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

    const openRejectModal = (subscription: PackageSubscription) => {
        setSelectedSubscription(subscription);
        setRejectionReason('');
        setShowRejectModal(true);
    };

    const openReceiptModal = (subscription: PackageSubscription) => {
        setSelectedSubscription(subscription);
        setShowReceiptModal(true);
    };

    // Filter by search
    const filteredSubscriptions = subscriptions.filter(sub => {
        if (!searchQuery) return true;
        const studentName = sub.student?.name?.toLowerCase() || '';
        const packageName = sub.package?.name?.toLowerCase() || '';
        return studentName.includes(searchQuery.toLowerCase()) || packageName.includes(searchQuery.toLowerCase());
    });

    // Count pending
    const pendingCount = subscriptions.filter(s => s.status === 'pending').length;

    return (
        <>
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-shibl-crimson to-[#8B0A12] flex items-center justify-center shadow-lg">
                        <Package size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-charcoal">اشتراكات الباقات</h1>
                        <p className="text-sm text-slate-grey">مراجعة وإدارة طلبات الاشتراك في الباقات الدراسية</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 lg:w-72">
                        <input
                            type="text"
                            placeholder="بحث بالاسم أو الباقة..."
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
                            {filter.value === 'pending' && pendingCount > 0 && (
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
                    <Package size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-charcoal mb-2">لا توجد اشتراكات</h3>
                    <p className="text-sm text-slate-grey">لا توجد طلبات اشتراك في الباقات بالحالة المحددة</p>
                </div>
            ) : (
                <div className="bg-white rounded-[16px] shadow-card overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Package size={20} className="text-shibl-crimson" />
                            <h2 className="font-bold text-charcoal">قائمة اشتراكات الباقات</h2>
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                                {totalItems} اشتراك
                            </span>
                        </div>
                    </div>

                    {/* Subscriptions Grid */}
                    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {filteredSubscriptions.map((sub) => (
                            <div
                                key={sub.id}
                                className="border border-slate-200 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 hover:border-shibl-crimson/30"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        {/* Package Image */}
                                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                                            <img
                                                src={sub.package?.image || '/images/package-placeholder.png'}
                                                alt={sub.package?.name || 'Package'}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = '/images/package-placeholder.png';
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-charcoal">{sub.package?.name || 'باقة'}</h3>
                                            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                                <BookOpen size={14} />
                                                <span>{sub.package?.courses_count || sub.package?.courses?.length || 0} دورة</span>
                                            </div>
                                            {sub.package?.price && (
                                                <div className="flex items-center gap-1 text-sm text-shibl-crimson font-bold mt-1">
                                                    <DollarSign size={14} />
                                                    <span>{sub.package.final_price ?? sub.package.price} ر.ع</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {/* Status Badge */}
                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${StatusColors[sub.status] || 'bg-slate-100 text-slate-600'}`}>
                                        {StatusLabels[sub.status] || sub.status}
                                    </span>
                                </div>

                                {/* Student Info */}
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-4">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-white border border-slate-200 flex-shrink-0">
                                        <img
                                            src={sub.student?.avatar || '/images/student-placeholder.png'}
                                            alt={sub.student?.name || 'Student'}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/images/student-placeholder.png';
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <span className="font-semibold text-charcoal block">{sub.student?.name || 'غير معروف'}</span>
                                        <span className="text-xs text-slate-grey">{sub.student?.email || ''}</span>
                                    </div>
                                </div>

                                {/* Date & Rejection Reason */}
                                <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} />
                                        <span>{sub.created_at ? new Date(sub.created_at).toLocaleDateString('ar-EG') : '-'}</span>
                                    </div>
                                </div>

                                {sub.status === 'rejected' && sub.rejection_reason && (
                                    <div className="p-3 bg-red-50 rounded-xl mb-4">
                                        <p className="text-xs text-red-600">
                                            <strong>سبب الرفض:</strong> {sub.rejection_reason}
                                        </p>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        {/* View Package Details */}
                                        <button
                                            onClick={() => {
                                                setSelectedSubscription(sub);
                                                setShowPackageModal(true);
                                            }}
                                            className="flex-1 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                                            title="عرض تفاصيل الباقة"
                                        >
                                            <BookOpen size={16} />
                                            تفاصيل الباقة
                                        </button>

                                        {/* View Receipt */}
                                        {sub.bill_image_url ? (
                                            <button
                                                onClick={() => openReceiptModal(sub)}
                                                className="flex-1 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Receipt size={16} />
                                                الإيصال
                                            </button>
                                        ) : (
                                            <button
                                                disabled
                                                className="flex-1 py-2.5 rounded-xl bg-slate-50 text-slate-300 font-semibold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                                                title="لا يوجد إيصال"
                                            >
                                                <Receipt size={16} />
                                                الإيصال
                                            </button>
                                        )}
                                    </div>

                                    {/* Approve/Reject for pending */}
                                    {sub.status === 'pending' && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleApprove(sub)}
                                                disabled={actionLoading}
                                                className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-green-500/20 font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                <Check size={16} />
                                                قبول
                                            </button>
                                            <button
                                                onClick={() => openRejectModal(sub)}
                                                disabled={actionLoading}
                                                className="flex-1 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                <X size={16} />
                                                رفض
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
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
                            {selectedSubscription.bill_image_url ? (
                                <img
                                    src={selectedSubscription.bill_image_url}
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
                                    <Package size={18} className="text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-grey">الباقة</p>
                                        <p className="font-semibold text-charcoal">{selectedSubscription.package?.name}</p>
                                    </div>
                                </div>
                                {selectedSubscription.package?.price && (
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-[10px]">
                                        <DollarSign size={18} className="text-slate-400" />
                                        <div>
                                            <p className="text-xs text-slate-grey">السعر</p>
                                            <p className="font-semibold text-shibl-crimson">{selectedSubscription.package.final_price ?? selectedSubscription.package.price} ر.ع</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {selectedSubscription.status === 'pending' && (
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
                                أنت على وشك رفض طلب اشتراك <strong>{selectedSubscription.student?.name}</strong> في باقة <strong>{selectedSubscription.package?.name}</strong>
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

            {/* Package Details Modal */}
            {showPackageModal && selectedSubscription?.package && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPackageModal(false)}>
                    <div className="bg-white rounded-[20px] max-w-lg w-full overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="relative h-48 bg-slate-100">
                            <img
                                src={selectedSubscription.package.image || '/images/package-placeholder.png'}
                                alt={selectedSubscription.package.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/images/package-placeholder.png';
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-1">{selectedSubscription.package.name}</h3>
                                    <p className="text-white/90 text-sm">{selectedSubscription.package.courses_count || 0} دورات</p>
                                </div>
                            </div>
                            <button onClick={() => setShowPackageModal(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Price */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                <span className="text-slate-600 font-medium">سعر الباقة</span>
                                <div className="text-right">
                                    {selectedSubscription.package.final_price && selectedSubscription.package.final_price < selectedSubscription.package.price ? (
                                        <>
                                            <span className="block text-2xl font-bold text-shibl-crimson">{selectedSubscription.package.final_price} ر.ع</span>
                                            <span className="text-sm text-slate-400 line-through">{selectedSubscription.package.price} ر.ع</span>
                                        </>
                                    ) : (
                                        <span className="text-2xl font-bold text-shibl-crimson">{selectedSubscription.package.price} ر.ع</span>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            {selectedSubscription.package.description && (
                                <div>
                                    <h4 className="font-bold text-charcoal mb-2">وصف الباقة</h4>
                                    <p className="text-slate-600 text-sm leading-relaxed">{selectedSubscription.package.description}</p>
                                </div>
                            )}

                            {/* Courses */}
                            <div>
                                <h4 className="font-bold text-charcoal mb-3 flex items-center gap-2">
                                    <BookOpen size={18} className="text-shibl-crimson" />
                                    الدورات المشمولة ({selectedSubscription.package.courses?.length || 0})
                                </h4>
                                <div className="space-y-3">
                                    {selectedSubscription.package.courses?.map(course => (
                                        <div key={course.id} className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors">
                                            <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                                                <img
                                                    src={course.image || '/images/course-placeholder.png'}
                                                    alt={getLocalizedName(course.name)}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = '/images/course-placeholder.png';
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h5 className="font-bold text-charcoal text-sm">{getLocalizedName(course.name)}</h5>
                                                {course.subject && <span className="text-xs text-slate-500">{getLocalizedName(course.subject.name)}</span>}
                                            </div>
                                        </div>
                                    ))}
                                    {(!selectedSubscription.package.courses || selectedSubscription.package.courses.length === 0) && (
                                        <p className="text-slate-500 text-center py-4 bg-slate-50 rounded-xl text-sm">لا توجد دورات في هذه الباقة</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
                            <button onClick={() => setShowPackageModal(false)} className="text-slate-500 hover:text-charcoal text-sm font-medium">
                                إغلاق
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
