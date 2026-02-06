/**
 * TeacherSlotRequestsPage
 * 
 * Page for teachers to view and manage their slot requests.
 * Shows stats cards, request list with status badges,
 * and allows creating new requests or canceling pending ones.
 */

import { useState, useMemo } from 'react';
import {
    Plus,
    Clock,
    CheckCircle,
    XCircle,
    HourglassIcon,
    Calendar,
    CalendarDays,
    Loader2,
    Filter,
    X,
    AlertCircle,
} from 'lucide-react';
import { useSlotRequests, useSlotRequestStats } from '../../../hooks/useSlotRequests';
import { SlotRequestDialog } from '../../components/teacher/SlotRequestDialog';
import { SlotRequestStatusBadge } from '../../components/teacher/SlotRequestStatusBadge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import type { SlotRequest, SlotRequestStatus } from '../../../types/slotRequest';
import { SLOT_REQUEST_TYPES, SLOT_REQUEST_STATUSES, DAYS_OF_WEEK } from '../../../types/slotRequest';
import { formatDate, formatTime } from '../../../utils/timeUtils';

// ==================== TYPES ====================

type StatusFilter = 'all' | SlotRequestStatus;

// ==================== STATS CARD COMPONENT ====================

interface StatsCardProps {
    label: string;
    value: number;
    icon: React.ReactNode;
    color: 'amber' | 'emerald' | 'red' | 'purple';
    isActive?: boolean;
    onClick?: () => void;
}

function StatsCard({ label, value, icon, color, isActive, onClick }: StatsCardProps) {
    const colorClasses = {
        amber: {
            bg: 'bg-gradient-to-br from-amber-500 to-amber-600',
            ring: 'ring-amber-300',
        },
        emerald: {
            bg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
            ring: 'ring-emerald-300',
        },
        red: {
            bg: 'bg-gradient-to-br from-red-500 to-red-600',
            ring: 'ring-red-300',
        },
        purple: {
            bg: 'bg-gradient-to-br from-purple-500 to-purple-600',
            ring: 'ring-purple-300',
        },
    };

    const classes = colorClasses[color];

    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                flex items-center gap-4 p-4 rounded-2xl shadow-lg text-white transition-all text-right w-full
                ${classes.bg}
                ${isActive ? `ring-4 ${classes.ring} scale-105` : 'hover:scale-102 hover:shadow-xl'}
            `}
        >
            <div className="p-3 bg-white/20 rounded-xl shrink-0">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-sm opacity-90 truncate">{label}</p>
            </div>
        </button>
    );
}

// ==================== REQUEST CARD COMPONENT ====================

interface RequestCardProps {
    request: SlotRequest;
    onCancel: (request: SlotRequest) => void;
    isCanceling: boolean;
}

function RequestCard({ request, onCancel, isCanceling }: RequestCardProps) {
    const getDayName = (dayOfWeek: number | null): string => {
        if (dayOfWeek === null) return '—';
        const day = DAYS_OF_WEEK.find(d => d.value === dayOfWeek);
        return day?.labelAr || '—';
    };

    const isWeekly = request.type === SLOT_REQUEST_TYPES.WEEKLY;

    return (
        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
                {/* Left: Status & Type */}
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${isWeekly ? 'bg-purple-50' : 'bg-blue-50'}`}>
                        {isWeekly ? (
                            <CalendarDays size={20} className="text-purple-600" />
                        ) : (
                            <Calendar size={20} className="text-blue-600" />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">
                                {isWeekly ? getDayName(request.day_of_week) : formatDate(request.specific_date || '')}
                            </span>
                            <SlotRequestStatusBadge status={request.status} size="sm" />
                        </div>
                        <div className="flex items-center gap-1 text-sm text-slate-500 mt-0.5">
                            <Clock size={12} />
                            <span className="dir-ltr">
                                {formatTime(request.start_time)} - {formatTime(request.end_time)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Grade & Actions */}
                <div className="flex flex-col items-end gap-2">
                    {request.grade && (
                        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                            {request.grade.name}
                        </span>
                    )}
                    {request.can_cancel && (
                        <button
                            type="button"
                            onClick={() => onCancel(request)}
                            disabled={isCanceling}
                            className="text-xs px-2.5 py-1 text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-1"
                        >
                            {isCanceling ? (
                                <Loader2 size={12} className="animate-spin" />
                            ) : (
                                <X size={12} />
                            )}
                            إلغاء
                        </button>
                    )}
                </div>
            </div>

            {/* Notes */}
            {request.notes && (
                <p className="mt-3 text-sm text-slate-600 border-t border-slate-50 pt-3">
                    {request.notes}
                </p>
            )}

            {/* Rejection reason */}
            {request.is_rejected && request.rejection_reason && (
                <div className="mt-3 p-2 bg-red-50 rounded-lg border border-red-100 flex items-start gap-2">
                    <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                    <div>
                        <span className="text-xs font-bold text-red-600 block">سبب الرفض:</span>
                        <span className="text-sm text-red-700">{request.rejection_reason}</span>
                    </div>
                </div>
            )}

            {/* Timestamp */}
            <div className="mt-3 text-xs text-slate-400 flex items-center justify-between">
                <span>تم الإرسال: {formatDate(request.created_at)}</span>
                {request.reviewed_at && (
                    <span>تمت المراجعة: {formatDate(request.reviewed_at)}</span>
                )}
            </div>
        </div>
    );
}

// ==================== MAIN PAGE COMPONENT ====================

export function TeacherSlotRequestsPage() {
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [showRequestDialog, setShowRequestDialog] = useState(false);
    const [requestToCancel, setRequestToCancel] = useState<SlotRequest | null>(null);

    // Fetch data
    const { requests, isLoading, isCanceling, cancelRequest, refetch } = useSlotRequests();
    const { data: statsResponse, isLoading: isStatsLoading } = useSlotRequestStats();

    // Stats from response
    const stats = useMemo(() => {
        if (!statsResponse) return { pending: 0, approved: 0, rejected: 0 };
        // Handle both direct data and nested data structure
        const data = (statsResponse as any)?.data || statsResponse;
        return {
            pending: data.pending ?? 0,
            approved: data.approved ?? 0,
            rejected: data.rejected ?? 0,
        };
    }, [statsResponse]);

    // Filter requests
    const filteredRequests = useMemo(() => {
        if (statusFilter === 'all') return requests;
        return requests.filter(r => r.status === statusFilter);
    }, [requests, statusFilter]);

    // Handle cancel
    const handleCancelConfirm = async () => {
        if (!requestToCancel) return;
        try {
            await cancelRequest(requestToCancel.id);
            setRequestToCancel(null);
        } catch {
            // Error handled in hook
        }
    };

    return (
        <div className="space-y-6 pb-8 p-6" style={{ direction: 'rtl' }}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-charcoal flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-shibl-crimson to-shibl-crimson-dark rounded-xl text-white shadow-lg shadow-shibl-crimson/25">
                            <Calendar size={24} />
                        </div>
                        طلبات المواعيد
                    </h1>
                    <p className="text-slate-500 mt-1">إدارة طلبات المواعيد الأسبوعية والإضافية</p>
                </div>

                <button
                    type="button"
                    onClick={() => setShowRequestDialog(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-shibl-crimson to-shibl-crimson-dark text-white rounded-xl font-medium shadow-lg shadow-shibl-crimson/25 hover:shadow-xl hover:scale-105 transition-all"
                >
                    <Plus size={18} />
                    طلب موعد جديد
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatsCard
                    label="قيد الانتظار"
                    value={stats.pending}
                    icon={<HourglassIcon size={24} />}
                    color="amber"
                    isActive={statusFilter === SLOT_REQUEST_STATUSES.PENDING}
                    onClick={() => setStatusFilter(
                        statusFilter === SLOT_REQUEST_STATUSES.PENDING ? 'all' : SLOT_REQUEST_STATUSES.PENDING
                    )}
                />
                <StatsCard
                    label="موافق عليها"
                    value={stats.approved}
                    icon={<CheckCircle size={24} />}
                    color="emerald"
                    isActive={statusFilter === SLOT_REQUEST_STATUSES.APPROVED}
                    onClick={() => setStatusFilter(
                        statusFilter === SLOT_REQUEST_STATUSES.APPROVED ? 'all' : SLOT_REQUEST_STATUSES.APPROVED
                    )}
                />
                <StatsCard
                    label="مرفوضة"
                    value={stats.rejected}
                    icon={<XCircle size={24} />}
                    color="red"
                    isActive={statusFilter === SLOT_REQUEST_STATUSES.REJECTED}
                    onClick={() => setStatusFilter(
                        statusFilter === SLOT_REQUEST_STATUSES.REJECTED ? 'all' : SLOT_REQUEST_STATUSES.REJECTED
                    )}
                />
            </div>

            {/* Filter Indicator */}
            {statusFilter !== 'all' && (
                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl text-sm">
                    <Filter size={14} className="text-slate-400" />
                    <span className="text-slate-600">
                        عرض: <span className="font-bold">
                            {statusFilter === SLOT_REQUEST_STATUSES.PENDING && 'قيد الانتظار'}
                            {statusFilter === SLOT_REQUEST_STATUSES.APPROVED && 'موافق عليها'}
                            {statusFilter === SLOT_REQUEST_STATUSES.REJECTED && 'مرفوضة'}
                        </span>
                    </span>
                    <button
                        type="button"
                        onClick={() => setStatusFilter('all')}
                        className="mr-auto text-slate-400 hover:text-slate-600 transition"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Requests List */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-charcoal flex items-center gap-2">
                    <Clock size={18} className="text-slate-400" />
                    الطلبات
                    {!isLoading && (
                        <span className="text-sm font-normal text-slate-400">
                            ({filteredRequests.length})
                        </span>
                    )}
                </h2>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 size={32} className="animate-spin text-shibl-crimson" />
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                        <Calendar size={48} className="mx-auto mb-4 text-slate-200" />
                        <h3 className="text-lg font-semibold text-slate-600 mb-2">
                            {statusFilter === 'all' ? 'لا توجد طلبات بعد' : 'لا توجد طلبات بهذه الحالة'}
                        </h3>
                        <p className="text-slate-400 mb-4">
                            {statusFilter === 'all'
                                ? 'قم بإنشاء طلب موعد جديد للبدء'
                                : 'جرب تغيير الفلتر لعرض طلبات أخرى'
                            }
                        </p>
                        {statusFilter === 'all' && (
                            <button
                                type="button"
                                onClick={() => setShowRequestDialog(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-shibl-crimson text-white rounded-lg hover:bg-shibl-crimson-dark transition"
                            >
                                <Plus size={16} />
                                طلب موعد جديد
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredRequests.map(request => (
                            <RequestCard
                                key={request.id}
                                request={request}
                                onCancel={setRequestToCancel}
                                isCanceling={isCanceling}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Request Dialog */}
            <SlotRequestDialog
                open={showRequestDialog}
                onClose={() => setShowRequestDialog(false)}
                onSuccess={() => {
                    setShowRequestDialog(false);
                    refetch();
                }}
            />

            {/* Cancel Confirmation Dialog */}
            <ConfirmDialog
                isOpen={!!requestToCancel}
                onClose={() => setRequestToCancel(null)}
                onConfirm={handleCancelConfirm}
                title="إلغاء الطلب"
                message="هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء."
                confirmText="نعم، إلغاء الطلب"
                cancelText="تراجع"
                type="danger"
                isLoading={isCanceling}
            />
        </div>
    );
}

export default TeacherSlotRequestsPage;
