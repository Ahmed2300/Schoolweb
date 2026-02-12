/**
 * TeacherSlotRequestsPage
 * 
 * Page for teachers to view and manage their slot requests.
 * Redesigned for a premium, modern look using Shibl theme colors.
 */
import { useState, useMemo } from 'react';
import {
    Plus,
    Clock,
    CheckCircle2,
    XCircle,
    Timer,
    Calendar,
    CalendarDays,
    Loader2,
    Filter,
    X,
    AlertCircle,
    Search,
    ChevronDown,
    MoreHorizontal,
    ArrowRight
} from 'lucide-react';
import { useSlotRequests, useSlotRequestStats } from '../../../hooks/useSlotRequests';
import { SlotRequestDialog } from '../../components/teacher/SlotRequestDialog';
import { SlotRequestStatusBadge } from '../../components/teacher/SlotRequestStatusBadge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import type { SlotRequest, SlotRequestStatus } from '../../../types/slotRequest';
import { SLOT_REQUEST_TYPES, SLOT_REQUEST_STATUSES, DAYS_OF_WEEK } from '../../../types/slotRequest';
import { formatDate, formatTime } from '../../../utils/timeUtils';
import { motion, AnimatePresence } from 'framer-motion';

// ==================== TYPES ====================

type StatusFilter = 'all' | SlotRequestStatus;

// ==================== STATS CARD COMPONENT ====================

interface StatsCardProps {
    label: string;
    value: number;
    icon: React.ReactNode;
    type: 'pending' | 'approved' | 'rejected';
    isActive?: boolean;
    onClick?: () => void;
}

function StatsCard({ label, value, icon, type, isActive, onClick }: StatsCardProps) {
    const styles = {
        pending: {
            bg: 'bg-gradient-to-br from-amber-50 via-white to-amber-50/50 dark:from-amber-900/20 dark:via-slate-900 dark:to-amber-900/10',
            border: 'border-amber-100 dark:border-amber-900/50',
            checkedBorder: 'border-amber-400 dark:border-amber-500',
            text: 'text-amber-700 dark:text-amber-400',
            iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
            shadow: 'shadow-amber-100/50 dark:shadow-none',
            activeRing: 'ring-amber-200 dark:ring-amber-900/40'
        },
        approved: {
            bg: 'bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 dark:from-emerald-900/20 dark:via-slate-900 dark:to-emerald-900/10',
            border: 'border-emerald-100 dark:border-emerald-900/50',
            checkedBorder: 'border-emerald-400 dark:border-emerald-500',
            text: 'text-emerald-700 dark:text-emerald-400',
            iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
            shadow: 'shadow-emerald-100/50 dark:shadow-none',
            activeRing: 'ring-emerald-200 dark:ring-emerald-900/40'
        },
        rejected: {
            bg: 'bg-gradient-to-br from-rose-50 via-white to-rose-50/50 dark:from-rose-900/20 dark:via-slate-900 dark:to-rose-900/10',
            border: 'border-rose-100 dark:border-rose-900/50',
            checkedBorder: 'border-rose-400 dark:border-rose-500',
            text: 'text-rose-700 dark:text-rose-400',
            iconBg: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
            shadow: 'shadow-rose-100/50 dark:shadow-none',
            activeRing: 'ring-rose-200 dark:ring-rose-900/40'
        },
    };

    const style = styles[type];

    return (
        <motion.button
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`
                relative flex flex-col items-start p-5 rounded-3xl transition-all duration-300 w-full text-right group h-full
                border ${isActive ? `${style.checkedBorder} ring-4 ${style.activeRing}` : style.border}
                ${style.bg} shadow-sm hover:shadow-lg ${style.shadow}
            `}
        >
            <div className="flex items-center justify-between w-full mb-4">
                <div className={`p-3.5 rounded-2xl ${style.iconBg} shadow-inner transition-transform group-hover:rotate-6`}>
                    {icon}
                </div>
                {isActive && (
                    <div className={`w-3 h-3 rounded-full ${style.iconBg.split(' ')[1].replace('text', 'bg')} animate-pulse`} />
                )}
            </div>

            <span className="text-3xl font-bold text-slate-800 dark:text-white mb-1 font-numeric">
                {value}
            </span>
            <span className={`text-sm font-medium ${style.text}`}>
                {label}
            </span>

            {/* Background Decoration */}
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-current opacity-[0.03] rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
        </motion.button>
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
        // DAYS_OF_WEEK should be imported or defined
        const day = DAYS_OF_WEEK.find(d => d.value === dayOfWeek);
        return day?.labelAr || '—';
    };

    const isWeekly = request.type === SLOT_REQUEST_TYPES.WEEKLY;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-100/80 dark:border-slate-800 p-5 shadow-[0_2px_15px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.06)] hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-300"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Info Section */}
                <div className="flex items-start gap-4">
                    {/* Icon Box */}
                    <div className={`
                        shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center border transition-colors
                        ${isWeekly
                            ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800/30 text-purple-600 dark:text-purple-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30'
                            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30'
                        }
                    `}>
                        {isWeekly ? <CalendarDays size={24} strokeWidth={1.5} /> : <Calendar size={24} strokeWidth={1.5} />}
                    </div>

                    {/* Details */}
                    <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-base font-bold text-slate-800 dark:text-white">
                                {isWeekly ? getDayName(request.day_of_week) : formatDate(request.specific_date || '')}
                            </h3>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${isWeekly
                                ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800/30'
                                : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/30'
                                }`}>
                                {isWeekly ? 'أسبوعي' : 'مرة واحدة'}
                            </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">
                                <Clock size={14} className="text-slate-400 dark:text-slate-500" />
                                <span className="dir-ltr font-medium font-numeric">
                                    {formatTime(request.start_time)} - {formatTime(request.end_time)}
                                </span>
                            </div>

                            {request.grade && (
                                <div className="hidden sm:flex items-center gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                    <span>{request.grade.name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Status & Actions Section */}
                <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-50 dark:border-slate-800 md:border-none">
                    <div className="flex flex-col items-end gap-1">
                        <SlotRequestStatusBadge status={request.status} />
                        <span className="text-[10px] text-slate-400">
                            {formatDate(request.created_at)}
                        </span>
                    </div>

                    {request.can_cancel && (
                        <div className="pr-4 border-r border-slate-100 dark:border-slate-800 mr-2">
                            <button
                                type="button"
                                onClick={() => onCancel(request)}
                                disabled={isCanceling}
                                className="w-9 h-9 rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-700 dark:hover:text-rose-400 transition-colors disabled:opacity-50"
                                title="إلغاء الطلب"
                            >
                                {isCanceling ? <Loader2 size={16} className="animate-spin" /> : <X size={18} />}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Notes Section - Animated */}
            {request.notes && (
                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm text-slate-600 dark:text-slate-300 border border-slate-100/50 dark:border-slate-700/50 flex gap-2 items-start">
                    <ArrowRight size={14} className="mt-1 text-slate-400 shrink-0 rotate-180" />
                    <span>{request.notes}</span>
                </div>
            )}

            {/* Rejection Reason - Prominent */}
            {request.is_rejected && request.rejection_reason && (
                <div className="mt-4 p-4 bg-rose-50/50 dark:bg-rose-900/10 rounded-xl border border-rose-100 dark:border-rose-900/20 flex gap-3 animate-in fade-in slide-in-from-top-1">
                    <div className="shrink-0 p-1 bg-rose-100 dark:bg-rose-900/30 rounded-full h-fit text-rose-600 dark:text-rose-400">
                        <AlertCircle size={16} />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-rose-800 dark:text-rose-300 block mb-1">سبب الرفض</span>
                        <p className="text-sm text-rose-700 dark:text-rose-400 leading-relaxed">
                            {request.rejection_reason}
                        </p>
                    </div>
                </div>
            )}
        </motion.div>
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
        const data = (statsResponse as any)?.data || statsResponse;
        return {
            pending: data.pending ?? 0,
            approved: data.approved ?? 0,
            rejected: data.rejected ?? 0,
        };
    }, [statsResponse]);

    // Client-side safety net: detect expired one-time pending requests
    // (covers the gap between the cron runs)
    const isExpiredRequest = (r: SlotRequest): boolean => {
        // If the backend already told us it's expired
        if (r.is_expired) return true;
        // Client-side check: one-time + pending + specific_date in the past
        if (
            r.type === SLOT_REQUEST_TYPES.ONE_TIME &&
            r.status === SLOT_REQUEST_STATUSES.PENDING &&
            r.specific_date
        ) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const reqDate = new Date(r.specific_date);
            reqDate.setHours(0, 0, 0, 0);
            return reqDate < today;
        }
        return false;
    };

    // Filter out expired requests, then apply status filter
    const filteredRequests = useMemo(() => {
        const active = requests.filter(r => !isExpiredRequest(r));
        if (statusFilter === 'all') return active;
        return active.filter(r => r.status === statusFilter);
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
        <div className="min-h-screen bg-soft-cloud/30 dark:bg-slate-950 pb-20 p-6 md:p-8" style={{ direction: 'rtl' }}>
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-l from-shibl-crimson to-rose-600 mb-2">
                            طلبات المواعيد
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl leading-relaxed">
                            إدارة طلباتك للحصص الإضافية والأسبوعية، ومتابعة حالة الموافقات.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowRequestDialog(true)}
                        className="group relative inline-flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-shibl-crimson to-shibl-crimson-dark text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-rose-600/20 hover:-translate-y-0.5 transition-all duration-300"
                    >
                        <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform">
                            <Plus size={16} strokeWidth={3} />
                        </span>
                        <span>طلب موعد جديد</span>
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <StatsCard
                        label="قيد الانتظار"
                        value={stats.pending}
                        icon={<Timer size={24} />}
                        type="pending"
                        isActive={statusFilter === SLOT_REQUEST_STATUSES.PENDING}
                        onClick={() => setStatusFilter(
                            statusFilter === SLOT_REQUEST_STATUSES.PENDING ? 'all' : SLOT_REQUEST_STATUSES.PENDING
                        )}
                    />
                    <StatsCard
                        label="تمت الموافقة"
                        value={stats.approved}
                        icon={<CheckCircle2 size={24} />}
                        type="approved"
                        isActive={statusFilter === SLOT_REQUEST_STATUSES.APPROVED}
                        onClick={() => setStatusFilter(
                            statusFilter === SLOT_REQUEST_STATUSES.APPROVED ? 'all' : SLOT_REQUEST_STATUSES.APPROVED
                        )}
                    />
                    <StatsCard
                        label="مرفوضة"
                        value={stats.rejected}
                        icon={<XCircle size={24} />}
                        type="rejected"
                        isActive={statusFilter === SLOT_REQUEST_STATUSES.REJECTED}
                        onClick={() => setStatusFilter(
                            statusFilter === SLOT_REQUEST_STATUSES.REJECTED ? 'all' : SLOT_REQUEST_STATUSES.REJECTED
                        )}
                    />
                </div>

                {/* Active Filters Bar */}
                <AnimatePresence>
                    {statusFilter !== 'all' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-sm text-sm text-slate-600 dark:text-slate-300">
                                <Filter size={14} className="text-slate-400" />
                                <span>تصفية حسب:</span>
                                <span className="font-bold text-charcoal dark:text-white">
                                    {statusFilter === SLOT_REQUEST_STATUSES.PENDING && 'قيد الانتظار'}
                                    {statusFilter === SLOT_REQUEST_STATUSES.APPROVED && 'موافق عليها'}
                                    {statusFilter === SLOT_REQUEST_STATUSES.REJECTED && 'مرفوضة'}
                                </span>
                                <button
                                    onClick={() => setStatusFilter('all')}
                                    className="mr-2 p-0.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Content Section */}
                <div className="space-y-4">
                    {/* Section Header */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-charcoal dark:text-white flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                                <Clock size={16} />
                            </span>
                            سجل الطلبات
                            {!isLoading && (
                                <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400 font-numeric">
                                    {filteredRequests.length}
                                </span>
                            )}
                        </h2>
                    </div>

                    {isLoading ? (
                        <div className="grid gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                <Search size={32} className="text-slate-300 dark:text-slate-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                                {statusFilter === 'all' ? 'لا توجد طلبات حالياً' : 'لا توجد نتائج مطابقة'}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm mb-8 leading-relaxed">
                                {statusFilter === 'all'
                                    ? 'يمكنك البدء بتقديم طلب جديد لتحديد مواعيد حصصك الإضافية أو الأسبوعية.'
                                    : 'لم يتم العثور على طلبات بهذه الحالة. حاول تغيير خيارات التصفية.'
                                }
                            </p>
                            {statusFilter === 'all' && (
                                <button
                                    onClick={() => setShowRequestDialog(true)}
                                    className="px-6 py-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl shadow-lg shadow-slate-200 dark:shadow-none hover:shadow-xl hover:scale-105 transition-all text-sm font-bold"
                                >
                                    إنشاء طلب جديد
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            <AnimatePresence mode="popLayout">
                                {filteredRequests.map(request => (
                                    <RequestCard
                                        key={request.id}
                                        request={request}
                                        onCancel={setRequestToCancel}
                                        isCanceling={isCanceling}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Dialogs */}
                <SlotRequestDialog
                    open={showRequestDialog}
                    onClose={() => setShowRequestDialog(false)}
                    onSuccess={() => {
                        setShowRequestDialog(false);
                        refetch();
                    }}
                />

                <ConfirmDialog
                    isOpen={!!requestToCancel}
                    onClose={() => setRequestToCancel(null)}
                    onConfirm={handleCancelConfirm}
                    title="هل تريد إلغاء الطلب؟"
                    message="سيتم حذف هذا الطلب نهائياً. هل أنت متأكد من الاستمرار؟"
                    confirmText="نعم، إلغاء الطلب"
                    cancelText="تراجع"
                    type="danger"
                    isLoading={isCanceling}
                />
            </div>
        </div>
    );
}

export default TeacherSlotRequestsPage;
