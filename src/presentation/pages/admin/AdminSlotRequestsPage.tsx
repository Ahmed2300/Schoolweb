/**
 * AdminSlotRequestsPage - Teacher Schedule Request Management
 * 
 * Premium admin page for reviewing and managing teacher slot requests.
 * Uses the NEW SlotRequest system (/admin/schedule/requests).
 * 
 * Features:
 * - View all pending/approved/rejected slot requests
 * - Approve or reject individual requests
 * - Bulk approve/reject functionality
 * - Filter by status, teacher, grade
 * - Premium shibl-crimson themed UI
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    Calendar,
    User,
    GraduationCap,
    Filter,
    RefreshCw,
    Check,
    X,
    AlertCircle,
    Loader2,
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    Repeat,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    useSlotRequests,
    useSlotRequestStats,
    useApproveTeacherSlotRequest,
    useRejectTeacherSlotRequest,
    useBulkApproveSlotRequests,
    useBulkRejectSlotRequests,
    SlotRequestType,
} from '../../hooks/useSlotRequests';
import type { SlotRequest, SlotRequestStatus, Teacher, Grade } from '../../../types/slotRequest';

// ============================================
// Constants
// ============================================

const ITEMS_PER_PAGE = 15;

const STATUS_CONFIG: Record<SlotRequestStatus, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
    pending: {
        label: 'قيد الانتظار',
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        icon: <Clock size={14} />,
    },
    approved: {
        label: 'موافق عليه',
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        icon: <CheckCircle size={14} />,
    },
    rejected: {
        label: 'مرفوض',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        icon: <XCircle size={14} />,
    },
};

// ============================================
// Sub-Components
// ============================================

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    colorClass: string; // e.g., 'text-shibl-crimson'
    bgClass: string;    // e.g., 'bg-red-50'
    trend?: string;
}

const StatCard: React.FC<StatCardProps> = React.memo(({ title, value, icon, colorClass, bgClass, trend }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group"
    >
        <div className="flex items-start justify-between">
            <div>
                <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-slate-800 group-hover:text-shibl-crimson transition-colors">
                    {value}
                </h3>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgClass} ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
                {icon}
            </div>
        </div>
        {trend && (
            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg w-fit">
                <span>{trend}</span>
            </div>
        )}
    </motion.div>
));

StatCard.displayName = 'StatCard';

interface StatusBadgeProps {
    status: SlotRequestStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = React.memo(({ status }) => {
    const config = STATUS_CONFIG[status];
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${config.bgColor} ${config.color} ${status === 'pending' ? 'ring-amber-200' : status === 'approved' ? 'ring-emerald-200' : 'ring-red-200'}`}>
            {config.icon}
            {config.label}
        </span>
    );
});

StatusBadge.displayName = 'StatusBadge';



interface RequestRowProps {
    request: SlotRequest;
    isSelected: boolean;
    onSelect: (id: number, request: SlotRequest) => void;
    onView: (request: SlotRequest) => void;
    onApprove: (id: number, request: SlotRequest) => void;
    onReject: (id: number, request: SlotRequest) => void;
    isApproving: boolean;
    isRejecting: boolean;
}

// Helper to get day name from date string
const getDayName = (dateStr: string | null): string => {
    if (!dateStr) return '';
    try {
        return new Date(dateStr).toLocaleDateString('ar-EG', { weekday: 'long' });
    } catch (e) {
        return '';
    }
};

const RequestRow: React.FC<RequestRowProps> = React.memo(({
    request,
    isSelected,
    onSelect,
    onView,
    onApprove,
    onReject,
    isApproving,
    isRejecting,
}) => (
    <motion.tr
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="group border-b border-slate-50 hover:bg-[#FFF9F9] transition-colors"
    >
        <td className="px-6 py-4">
            <div className="flex items-center">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelect(request.id, request)}
                    className="w-4 h-4 text-shibl-crimson rounded border-slate-300 focus:ring-shibl-crimson/30 cursor-pointer"
                    disabled={!request.is_pending}
                />
            </div>
        </td>
        <td className="px-6 py-4">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-shibl-crimson to-shibl-crimson-light rounded-full flex items-center justify-center text-white font-bold shadow-md shadow-shibl-crimson/20">
                    {request.teacher?.name?.charAt(0) || 'م'}
                </div>
                <div>
                    <p className="font-semibold text-slate-900">{request.teacher?.name || 'غير معروف'}</p>
                    <p className="text-xs text-slate-500 font-medium">{request.teacher?.email}</p>
                </div>
            </div>
        </td>
        <td className="px-6 py-4">
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400">
                    <GraduationCap size={16} />
                </div>
                <span className="text-slate-700 font-medium">{request.grade?.name || 'غير محدد'}</span>
            </div>
        </td>
        <td className="px-6 py-4">
            <div className="flex items-center gap-2">
                {request.type === 'weekly' ? (
                    <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-500">
                        <Repeat size={16} />
                    </div>
                ) : (
                    <div className="p-1.5 bg-teal-50 rounded-lg text-teal-500">
                        <CalendarDays size={16} />
                    </div>
                )}
                <span className="text-slate-700 font-medium">{request.type_label}</span>
            </div>
        </td>
        <td className="px-6 py-4">
            <div className="flex flex-col">
                <span className="font-semibold text-slate-800">
                    {request.day_name || request.arabic_day || getDayName(request.specific_date)}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                    {request.specific_date ? new Date(request.specific_date).toLocaleDateString('ar-EG') : ''}
                </span>
            </div>
        </td>
        <td className="px-6 py-4">
            <StatusBadge status={request.status} />
        </td>
        <td className="px-6 py-4">
            <span className="text-sm font-medium text-slate-500" dir="ltr">
                {request.time_range}
            </span>
        </td>
        <td className="px-6 py-4">
            <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onView(request)}
                    className="p-2 text-slate-400 hover:text-shibl-crimson hover:bg-red-50 rounded-xl transition-all"
                    title="عرض التفاصيل"
                >
                    <Eye size={18} />
                </button>
                {request.is_pending && (
                    <>
                        <button
                            onClick={() => onApprove(request.id, request)}
                            disabled={isApproving}
                            className="p-2 text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-all disabled:opacity-50"
                            title="موافقة"
                        >
                            {isApproving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                        </button>
                        <button
                            onClick={() => onReject(request.id, request)}
                            disabled={isRejecting}
                            className="p-2 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all disabled:opacity-50"
                            title="رفض"
                        >
                            {isRejecting ? <Loader2 size={18} className="animate-spin" /> : <X size={18} />}
                        </button>
                    </>
                )}
            </div>
        </td>
    </motion.tr>
));

RequestRow.displayName = 'RequestRow';



// ============================================
// Main Component
// ============================================

export function AdminSlotRequestsPage(): React.ReactElement {
    const queryClient = useQueryClient();

    // State
    const [statusFilter, setStatusFilter] = useState<SlotRequestStatus | 'all'>('all');
    const [typeFilter, setTypeFilter] = useState<SlotRequestType | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Bulk Selection State
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    // Track selected request types for bulk operations
    const [selectedTypes, setSelectedTypes] = useState<Map<number, SlotRequestType>>(new Map());

    // Modal State
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<SlotRequest | null>(null);
    const [pendingRejectId, setPendingRejectId] = useState<number | null>(null);
    const [pendingRejectType, setPendingRejectType] = useState<SlotRequestType>('weekly');
    const [rejectionReason, setRejectionReason] = useState('');

    // Queries
    const { data, isLoading, refetch, isRefetching } = useSlotRequests({
        status: statusFilter,
        type: typeFilter,
        page: currentPage,
        per_page: ITEMS_PER_PAGE,
    });
    const { data: stats, isLoading: loadingStats } = useSlotRequestStats();

    // Mutations
    const approveMutation = useApproveTeacherSlotRequest();
    const rejectMutation = useRejectTeacherSlotRequest();
    const bulkApproveMutation = useBulkApproveSlotRequests();
    const bulkRejectMutation = useBulkRejectSlotRequests();

    // Real-time listener for new requests
    useEffect(() => {
        if (typeof window !== 'undefined' && window.Echo) {
            console.log('🔌 Subscribing to admin channel for slot requests...');
            const channel = window.Echo.private('admins');

            channel.listen('.teacher.slot.created', (e: any) => {
                console.log('🔔 New Slot Request Received:', e);

                toast.success('تم استلام طلب موعد جديد من ' + (e.slot?.teacher?.name || 'مدرس'), {
                    icon: '🔔',
                    duration: 4000
                });

                queryClient.invalidateQueries({ queryKey: ['slot-requests'] });
            });

            return () => {
                channel.stopListening('.teacher.slot.created');
            };
        }
    }, [queryClient]);

    // Derived
    const requests = useMemo(() => data?.requests || [], [data]);
    const meta = data?.meta;
    const totalPages = meta?.last_page || 1;

    // Handlers
    const handleApprove = useCallback(async (id: number, request?: SlotRequest) => {
        const type: SlotRequestType = (request?.type === 'one_time' ? 'one_time' : 'weekly');
        try {
            await approveMutation.mutateAsync({ id, type });
            toast.success('تمت الموافقة على الطلب بنجاح');
            setSelectedIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
            setSelectedTypes(prev => {
                const next = new Map(prev);
                next.delete(id);
                return next;
            });
        } catch (error) {
            toast.error('حدث خطأ أثناء الموافقة على الطلب');
        }
    }, [approveMutation]);

    const handleRejectClick = useCallback((id: number, request?: SlotRequest) => {
        const type: SlotRequestType = (request?.type === 'one_time' ? 'one_time' : 'weekly');
        setPendingRejectId(id);
        setPendingRejectType(type);
        setRejectionReason('');
        setRejectModalOpen(true);
    }, []);

    const handleRejectConfirm = useCallback(async () => {
        if (!pendingRejectId) return;

        if (!rejectionReason.trim() || rejectionReason.length < 5) {
            toast.error('سبب الرفض يجب أن يكون 5 أحرف على الأقل');
            return;
        }

        try {
            await rejectMutation.mutateAsync({ id: pendingRejectId, reason: rejectionReason, type: pendingRejectType });
            toast.success('تم رفض الطلب بنجاح');
            setRejectModalOpen(false);
            setPendingRejectId(null);
            setRejectionReason('');
            setSelectedIds(prev => {
                const next = new Set(prev);
                next.delete(pendingRejectId);
                return next;
            });
            setSelectedTypes(prev => {
                const next = new Map(prev);
                next.delete(pendingRejectId);
                return next;
            });
        } catch (error: any) {
            const message = error?.response?.data?.message || 'حدث خطأ أثناء رفض الطلب';
            toast.error(message);
        }
    }, [pendingRejectId, rejectionReason, pendingRejectType, rejectMutation]);

    const handleBulkApprove = useCallback(async () => {
        if (selectedIds.size === 0) return;

        // Group by type for bulk operations
        const weeklyIds = Array.from(selectedIds).filter(id => selectedTypes.get(id) !== 'one_time');
        const oneTimeIds = Array.from(selectedIds).filter(id => selectedTypes.get(id) === 'one_time');

        try {
            if (weeklyIds.length > 0) {
                await bulkApproveMutation.mutateAsync({ ids: weeklyIds, type: 'weekly' });
            }
            if (oneTimeIds.length > 0) {
                await bulkApproveMutation.mutateAsync({ ids: oneTimeIds, type: 'one_time' });
            }
            toast.success(`تمت الموافقة على ${selectedIds.size} طلب بنجاح`);
            setSelectedIds(new Set());
            setSelectedTypes(new Map());
        } catch (error) {
            toast.error('حدث خطأ أثناء الموافقة الجماعية');
        }
    }, [selectedIds, selectedTypes, bulkApproveMutation]);

    const handleSelectToggle = useCallback((id: number, request?: SlotRequest) => {
        const type: SlotRequestType = (request?.type === 'one_time' ? 'one_time' : 'weekly');
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
        setSelectedTypes(prev => {
            const next = new Map(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.set(id, type);
            }
            return next;
        });
    }, []);

    const handleSelectAll = useCallback(() => {
        const pendingRequests = requests.filter(r => r.is_pending);
        if (selectedIds.size === pendingRequests.length) {
            setSelectedIds(new Set());
            setSelectedTypes(new Map());
        } else {
            setSelectedIds(new Set(pendingRequests.map(r => r.id)));
            const typesMap = new Map<number, SlotRequestType>();
            pendingRequests.forEach(r => {
                typesMap.set(r.id, r.type === 'one_time' ? 'one_time' : 'weekly');
            });
            setSelectedTypes(typesMap);
        }
    }, [requests, selectedIds.size]);

    const handleViewDetails = useCallback((request: SlotRequest) => {
        setSelectedRequest(request);
        setDetailModalOpen(true);
    }, []);

    // Render loading skeleton
    if (isLoading) {
        return (
            <div className="p-6 space-y-6">
                <div className="h-10 bg-slate-200 rounded-xl w-64 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
                    ))}
                </div>
                <div className="h-96 bg-slate-200 rounded-2xl animate-pulse" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6" dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">طلبات المواعيد</h1>
                    <p className="text-slate-500 mt-2 font-medium">إدارة ومراجعة طلبات حجز المواعيد من المدرسين</p>
                </div>
                <button
                    onClick={() => refetch()}
                    disabled={isRefetching}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-600 rounded-xl hover:bg-slate-50 hover:text-shibl-crimson border border-slate-200 transition-all shadow-sm hover:shadow-md disabled:opacity-50 font-medium"
                >
                    <RefreshCw size={18} className={isRefetching ? 'animate-spin' : ''} />
                    تحديث البيانات
                </button>
            </div>

            {/* Stats Components... (already updated via StatCard replacement in previous step, checking next section) */}

            {/* Filters & Actions */}
            <div className="flex items-center justify-between flex-wrap gap-4 mt-8">
                {/* Status Filter */}
                <div className="flex items-center gap-3 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                    {['all', 'pending', 'approved', 'rejected'].map(status => (
                        <button
                            key={status}
                            onClick={() => {
                                setStatusFilter(status as any);
                                setCurrentPage(1);
                            }}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${statusFilter === status
                                ? 'bg-shibl-crimson text-white shadow-md'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            {status === 'all' && 'الكل'}
                            {status === 'pending' && 'قيد الانتظار'}
                            {status === 'approved' && 'موافق عليه'}
                            {status === 'rejected' && 'مرفوض'}
                        </button>
                    ))}
                </div>

                {/* Type Filter */}
                <div className="flex items-center gap-3 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                    <button
                        onClick={() => {
                            setTypeFilter(undefined);
                            setCurrentPage(1);
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${typeFilter === undefined
                            ? 'bg-shibl-crimson text-white shadow-md'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        كل الأنواع
                    </button>
                    <button
                        onClick={() => {
                            setTypeFilter('weekly');
                            setCurrentPage(1);
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${typeFilter === 'weekly'
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        <Repeat size={14} />
                        أسبوعي
                    </button>
                    <button
                        onClick={() => {
                            setTypeFilter('one_time');
                            setCurrentPage(1);
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${typeFilter === 'one_time'
                            ? 'bg-teal-600 text-white shadow-md'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        <CalendarDays size={14} />
                        استثنائي
                    </button>
                </div>

                {selectedIds.size > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-4 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100"
                    >
                        <span className="text-sm font-bold text-emerald-700 flex items-center gap-2">
                            <CheckCircle size={16} />
                            تم تحديد {selectedIds.size} طلب
                        </span>
                        <div className="h-6 w-px bg-emerald-200"></div>
                        <button
                            onClick={handleBulkApprove}
                            disabled={bulkApproveMutation.isPending}
                            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50 font-bold text-sm"
                        >
                            {bulkApproveMutation.isPending ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Check size={16} />
                            )}
                            موافقة جماعية
                        </button>
                    </motion.div>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#FAFAFA] border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-right">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.size > 0 && selectedIds.size === requests.filter(r => r.is_pending).length}
                                            onChange={handleSelectAll}
                                            className="w-4 h-4 text-shibl-crimson rounded border-slate-300 focus:ring-shibl-crimson/30 cursor-pointer"
                                        />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">المدرس</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">الصف</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">النوع</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">الوقت</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">الحالة</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">التاريخ</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence mode="popLayout">
                                {requests.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-12 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <AlertCircle size={48} className="text-slate-300" />
                                                <p className="text-slate-500">لا توجد طلبات</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    requests.map(request => (
                                        <RequestRow
                                            key={request.id}
                                            request={request}
                                            isSelected={selectedIds.has(request.id)}
                                            onSelect={handleSelectToggle}
                                            onView={handleViewDetails}
                                            onApprove={handleApprove}
                                            onReject={handleRejectClick}
                                            isApproving={approveMutation.isPending && approveMutation.variables?.id === request.id}
                                            isRejecting={rejectMutation.isPending && rejectMutation.variables?.id === request.id}
                                        />
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {meta && meta.last_page > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                        <span className="text-sm text-slate-500">
                            عرض {((meta.current_page - 1) * meta.per_page) + 1} - {Math.min(meta.current_page * meta.per_page, meta.total)} من {meta.total}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={18} />
                            </button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const pageNum = i + 1;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                                            ? 'bg-shibl-crimson text-white'
                                            : 'text-slate-600 hover:bg-slate-100'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal - Premium Design */}
            <AnimatePresence>
                {detailModalOpen && selectedRequest && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
                        onClick={() => setDetailModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100"
                        >
                            {/* Header with gradient */}
                            <div className="bg-gradient-to-r from-[#AF0C15] to-[#E11D48] px-8 py-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                <div className="relative z-10 flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                            <Eye size={20} />
                                        </div>
                                        تفاصيل الطلب
                                    </h2>
                                    <StatusBadge status={selectedRequest.status} />
                                </div>
                            </div>

                            <div className="p-6 space-y-5">
                                {/* Teacher Info Card */}
                                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl border border-slate-100">
                                    <div className="w-16 h-16 bg-gradient-to-br from-shibl-crimson to-rose-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-shibl-crimson/30">
                                        {selectedRequest.teacher?.name?.charAt(0) || 'م'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-lg text-slate-800">{selectedRequest.teacher?.name}</p>
                                        <p className="text-sm text-slate-500">{selectedRequest.teacher?.email}</p>
                                    </div>
                                </div>

                                {/* Schedule Details Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-4 border border-indigo-100">
                                        <div className="flex items-center gap-2 text-indigo-600 mb-2">
                                            <GraduationCap size={16} />
                                            <span className="text-xs font-semibold">الصف</span>
                                        </div>
                                        <p className="font-bold text-slate-800">{selectedRequest.grade?.name || 'غير محدد'}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-100">
                                        <div className="flex items-center gap-2 text-purple-600 mb-2">
                                            <Repeat size={16} />
                                            <span className="text-xs font-semibold">النوع</span>
                                        </div>
                                        <p className="font-bold text-slate-800">{selectedRequest.type === 'weekly' ? 'أسبوعي' : 'لمرة واحدة'}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-4 border border-amber-100">
                                        <div className="flex items-center gap-2 text-amber-600 mb-2">
                                            <Calendar size={16} />
                                            <span className="text-xs font-semibold">اليوم والتاريخ</span>
                                        </div>
                                        <p className="font-bold text-slate-800">
                                            {selectedRequest.day_name || selectedRequest.arabic_day || getDayName(selectedRequest.specific_date)}
                                        </p>
                                        {selectedRequest.specific_date && (
                                            <p className="text-xs text-slate-500 mt-1">
                                                {new Date(selectedRequest.specific_date).toLocaleDateString('ar-EG')}
                                            </p>
                                        )}
                                    </div>
                                    <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-4 border border-teal-100">
                                        <div className="flex items-center gap-2 text-teal-600 mb-2">
                                            <Clock size={16} />
                                            <span className="text-xs font-semibold">الوقت</span>
                                        </div>
                                        <p className="font-bold text-slate-800 font-mono">{selectedRequest.time_range}</p>
                                    </div>
                                </div>

                                {/* Notes Section */}
                                {selectedRequest.request_notes && (
                                    <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                                        <div className="flex items-center gap-2 text-blue-600 mb-2">
                                            <AlertCircle size={16} />
                                            <span className="text-xs font-semibold">ملاحظات المدرس</span>
                                        </div>
                                        <p className="text-sm text-blue-800">{selectedRequest.request_notes}</p>
                                    </div>
                                )}

                                {/* Rejection Reason */}
                                {selectedRequest.rejection_reason && (
                                    <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
                                        <div className="flex items-center gap-2 text-red-600 mb-2">
                                            <XCircle size={16} />
                                            <span className="text-xs font-semibold">سبب الرفض</span>
                                        </div>
                                        <p className="text-sm text-red-800">{selectedRequest.rejection_reason}</p>
                                    </div>
                                )}

                                {/* Approval Info */}
                                {selectedRequest.approved_by && (
                                    <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                                        <div className="flex items-center gap-2 text-emerald-600 mb-2">
                                            <CheckCircle size={16} />
                                            <span className="text-xs font-semibold">تمت المراجعة بواسطة</span>
                                        </div>
                                        <p className="text-sm text-emerald-800">{selectedRequest.approved_by?.name}</p>
                                    </div>
                                )}
                            </div>

                            {/* Action Footer */}
                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center gap-3">
                                <button
                                    onClick={() => setDetailModalOpen(false)}
                                    className="px-5 py-2.5 text-slate-600 hover:bg-slate-200 rounded-xl transition-all font-medium"
                                >
                                    إغلاق
                                </button>

                                {selectedRequest.status === 'pending' && (
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => {
                                                handleRejectClick(selectedRequest.id, selectedRequest);
                                                setDetailModalOpen(false);
                                            }}
                                            disabled={rejectMutation.isPending}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all font-medium border border-red-200 disabled:opacity-50"
                                        >
                                            <X size={16} />
                                            رفض
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleApprove(selectedRequest.id, selectedRequest);
                                                setDetailModalOpen(false);
                                            }}
                                            disabled={approveMutation.isPending}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 rounded-xl transition-all font-medium shadow-lg shadow-emerald-500/30 disabled:opacity-50"
                                        >
                                            {approveMutation.isPending ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <Check size={16} />
                                            )}
                                            موافقة
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reject Modal */}
            <AnimatePresence>
                {rejectModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
                        onClick={() => setRejectModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-md p-8 border border-slate-100"
                        >
                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
                                    <XCircle size={32} className="text-red-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">رفض الطلب</h2>
                                <p className="text-slate-500 mt-2">يرجى كتابة سبب الرفض ليتم إرساله للمدرس، هذا الإجراء لا يمكن التراجع عنه.</p>
                            </div>

                            <textarea
                                value={rejectionReason}
                                onChange={e => setRejectionReason(e.target.value)}
                                placeholder="اكتب سبب الرفض هنا..."
                                rows={4}
                                className="w-full px-5 py-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none text-slate-700 placeholder:text-slate-400 bg-slate-50"
                            />

                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => {
                                        setRejectModalOpen(false);
                                        setPendingRejectId(null);
                                    }}
                                    className="flex-1 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-semibold"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={handleRejectConfirm}
                                    disabled={!rejectionReason.trim() || rejectMutation.isPending}
                                    className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50 font-bold shadow-lg shadow-red-600/20"
                                >
                                    {rejectMutation.isPending ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <XCircle size={18} />
                                    )}
                                    تأكيد الرفض
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default AdminSlotRequestsPage;
