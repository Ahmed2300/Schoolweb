import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
    Clock,
    CalendarClock,
    Search,
    Loader2,
    AlertCircle,
    CheckCircle,
    XCircle,
    HourglassIcon,
    Plus,
    Filter,
    X,
    Eye,
    Trash2,
    Edit3,
    Calendar,
    User,
    BookOpen,
    TrendingUp,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import {
    useTimeSlots,
    usePendingSlots,
    useTimeSlotStats,
    useCreateTimeSlot,
    useUpdateTimeSlot,
    useDeleteTimeSlot,
    useApproveSlotRequest,
    useRejectSlotRequest,
    useBulkCreateTimeSlots,
    useDeleteAllTimeSlots,
} from '../../hooks/useTimeSlots';
import type { TimeSlot, TimeSlotStatus } from '../../../types/timeSlot';
import { BulkSlotGeneratorModal } from '../../components/admin/timeslots';

// Status configurations with colors and icons
const STATUS_CONFIG: Record<TimeSlotStatus, {
    label: string;
    labelEn: string;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: React.ReactNode;
}> = {
    available: {
        label: 'متاح',
        labelEn: 'Available',
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        icon: <CheckCircle size={14} />
    },
    pending: {
        label: 'قيد الانتظار',
        labelEn: 'Pending',
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        icon: <HourglassIcon size={14} />
    },
    approved: {
        label: 'موافق عليه',
        labelEn: 'Approved',
        color: 'text-[#27AE60]',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: <CheckCircle size={14} />
    },
    rejected: {
        label: 'مرفوض',
        labelEn: 'Rejected',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: <XCircle size={14} />
    },
};

// Stats card component
function StatCard({
    title,
    value,
    icon,
    color,
    bgColor,
    isLoading
}: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    isLoading?: boolean;
}) {
    return (
        <div className={`relative overflow-hidden rounded-xl sm:rounded-2xl ${bgColor} p-3 sm:p-5 border border-white/50 shadow-sm hover:shadow-md transition-all duration-300 group`}>
            <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-slate-600 mb-0.5 sm:mb-1 truncate">{title}</p>
                    {isLoading ? (
                        <div className="h-6 sm:h-8 w-12 sm:w-16 rounded-lg bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" />
                    ) : (
                        <p className={`text-xl sm:text-3xl font-bold ${color}`}>{value}</p>
                    )}
                </div>
                <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${color} bg-white/60 shadow-sm group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                    <span className="[&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-[22px] sm:[&>svg]:h-[22px]">{icon}</span>
                </div>
            </div>
            {/* Decorative gradient - hidden on mobile for performance */}
            <div className={`hidden sm:block absolute -bottom-4 -left-4 w-24 h-24 rounded-full ${bgColor} opacity-50 blur-2xl`} />
        </div>
    );
}

// Pagination constant
const ITEMS_PER_PAGE = 25;

export function AdminTimeSlotsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<TimeSlotStatus | 'all'>('all');
    const [dateFilter, setDateFilter] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');
    const [currentPage, setCurrentPage] = useState(1);

    // Modal states
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [bulkGeneratorOpen, setBulkGeneratorOpen] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteAllModalOpen, setDeleteAllModalOpen] = useState(false);
    const [isBulkCreating, setIsBulkCreating] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    // Form states for create modal
    const [newSlotDate, setNewSlotDate] = useState('');
    const [newSlotStartTime, setNewSlotStartTime] = useState('');
    const [newSlotEndTime, setNewSlotEndTime] = useState('');
    const [createModalError, setCreateModalError] = useState<string | null>(null);

    // Form states for edit modal
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editDate, setEditDate] = useState('');
    const [editStartTime, setEditStartTime] = useState('');
    const [editEndTime, setEditEndTime] = useState('');

    // Queries
    const { data: allSlots = [], isLoading: loadingSlots, refetch: refetchSlots } = useTimeSlots(
        statusFilter !== 'all' ? { status: statusFilter, date: dateFilter || undefined } : { date: dateFilter || undefined }
    );
    const { data: pendingData, isLoading: loadingPending } = usePendingSlots();
    const { data: stats, isLoading: loadingStats } = useTimeSlotStats();

    // Mutations
    const createMutation = useCreateTimeSlot();
    const updateMutation = useUpdateTimeSlot();
    const deleteMutation = useDeleteTimeSlot();
    const approveMutation = useApproveSlotRequest();
    const rejectMutation = useRejectSlotRequest();
    const bulkCreateMutation = useBulkCreateTimeSlots();
    const deleteAllMutation = useDeleteAllTimeSlots();

    // Filter slots based on search
    const filteredSlots = useMemo(() => {
        const slots = activeTab === 'pending' ? (pendingData?.slots || []) : allSlots;

        if (!searchQuery) return slots;

        return slots.filter(slot =>
            slot.teacher?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            slot.lecture?.title?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [allSlots, pendingData, activeTab, searchQuery]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredSlots.length / ITEMS_PER_PAGE);
    const paginatedSlots = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredSlots.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredSlots, currentPage]);

    // Reset to page 1 when filters change
    const handleFilterChange = (newFilter: TimeSlotStatus | 'all') => {
        setStatusFilter(newFilter);
        setCurrentPage(1);
    };
    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
    };
    const handleTabChange = (tab: 'all' | 'pending') => {
        setActiveTab(tab);
        setCurrentPage(1);
    };

    // Format time display
    const formatTime = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleTimeString('ar-EG', {
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return '—';
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('ar-EG', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return '—';
        }
    };

    // Handle create slot with smart time adjustment
    const handleCreateSlot = async () => {
        if (!newSlotDate || !newSlotStartTime || !newSlotEndTime) return;

        // Validate end time is after start time
        if (newSlotEndTime <= newSlotStartTime) return;

        const today = new Date().toISOString().split('T')[0];
        const now = new Date();
        const currentHour = now.getHours();

        // Parse times
        const [startH] = newSlotStartTime.split(':').map(Number);
        const [endH] = newSlotEndTime.split(':').map(Number);

        let adjustedStartTime = newSlotStartTime;

        // If today and times are involved
        if (newSlotDate === today) {
            // If entire range is in the past, block submission
            if (endH <= currentHour) {
                console.error('Cannot create slot entirely in the past');
                return;
            }

            // If start is in past but end is in future, adjust start to next hour
            if (startH <= currentHour) {
                const nextHour = currentHour + 1;
                adjustedStartTime = `${String(nextHour).padStart(2, '0')}:00`;

                // If adjusted start >= end, block
                if (nextHour >= endH) {
                    console.error('Adjusted start time would be after end time');
                    return;
                }
            }
        }

        setCreateModalError(null); // Clear previous errors
        try {
            await createMutation.mutateAsync({
                start_time: `${newSlotDate}T${adjustedStartTime}:00`,
                end_time: `${newSlotDate}T${newSlotEndTime}:00`,
                is_available: true,
            });
            toast.success('تم إنشاء الفترة الزمنية بنجاح');
            setCreateModalOpen(false);
            setNewSlotDate('');
            setNewSlotStartTime('');
            setNewSlotEndTime('');
            setCreateModalError(null);
        } catch (error: unknown) {
            console.error('Error creating slot:', error);
            // Parse error response for validation messages (overlap detection)
            // Handle multiple error structures:
            // 1. Direct error message (from ApiClient transformation)
            // 2. Laravel validation errors (response.data.errors.start_time)
            // 3. Generic message (response.data.message)
            const err = error as {
                message?: string;
                response?: {
                    data?: {
                        errors?: { start_time?: string[] };
                        message?: string
                    }
                }
            };

            // Check for direct error message first (ApiClient transforms errors)
            const directMessage = err.message;
            const overlapError = err.response?.data?.errors?.start_time?.[0];
            const genericError = err.response?.data?.message;

            // Set the error in the modal
            if (overlapError) {
                setCreateModalError(overlapError);
            } else if (genericError) {
                setCreateModalError(genericError);
            } else if (directMessage && directMessage.includes('تعارض')) {
                // Error message contains overlap info directly
                setCreateModalError(directMessage);
            } else {
                setCreateModalError('حدث خطأ أثناء إنشاء الفترة الزمنية');
            }
        }
    };

    // Handle edit click
    const handleEditClick = (slot: TimeSlot) => {
        setSelectedSlot(slot);
        const startDate = new Date(slot.start_time);
        const endDate = new Date(slot.end_time);

        // Format date as YYYY-MM-DD
        const dateStr = startDate.toISOString().split('T')[0];

        // Format time as HH:MM
        const startTimeStr = startDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
        const endTimeStr = endDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

        setEditDate(dateStr);
        setEditStartTime(startTimeStr);
        setEditEndTime(endTimeStr);
        setEditModalOpen(true);
    };

    // Handle update slot
    const handleUpdateSlot = async () => {
        if (!selectedSlot || !editDate || !editStartTime || !editEndTime) return;

        try {
            await updateMutation.mutateAsync({
                id: selectedSlot.id,
                data: {
                    start_time: `${editDate}T${editStartTime}:00`,
                    end_time: `${editDate}T${editEndTime}:00`,
                }
            });
            setEditModalOpen(false);
            setSelectedSlot(null);
        } catch (error) {
            console.error('Error updating slot:', error);
        }
    };

    // Handle approve
    const handleApprove = async (id: number) => {
        try {
            await approveMutation.mutateAsync(id);
            setDetailModalOpen(false);
            setSelectedSlot(null);
        } catch (error) {
            console.error('Error approving slot:', error);
        }
    };

    // Handle reject
    const handleReject = async () => {
        if (!selectedSlot || !rejectionReason.trim()) return;

        try {
            await rejectMutation.mutateAsync({ id: selectedSlot.id, reason: rejectionReason });
            setRejectModalOpen(false);
            setDetailModalOpen(false);
            setSelectedSlot(null);
            setRejectionReason('');
        } catch (error) {
            console.error('Error rejecting slot:', error);
        }
    };

    // Handle delete
    const handleDelete = async () => {
        if (!selectedSlot) return;

        try {
            await deleteMutation.mutateAsync(selectedSlot.id);
            setDeleteModalOpen(false);
            setSelectedSlot(null);
        } catch (error) {
            console.error('Error deleting slot:', error);
        }
    };

    // Handle bulk create - track entire process with local state
    const handleBulkCreate = async (slots: Array<{ start_time: string; end_time: string }>) => {
        setIsBulkCreating(true);
        try {
            const response = await bulkCreateMutation.mutateAsync(slots);
            // Wait for the data to be refetched before closing modal
            await refetchSlots();
            setBulkGeneratorOpen(false);

            // Show success message with skipped count if any
            const data = response as { message?: string; created_count?: number; skipped_count?: number };
            if (data.skipped_count && data.skipped_count > 0) {
                toast.success(`تم إنشاء ${data.created_count} فترة (تم تخطي ${data.skipped_count} فترة متعارضة)`, {
                    duration: 5000,
                    icon: '⚠️',
                });
            } else {
                toast.success(data.message || `تم إنشاء ${data.created_count} فترة زمنية بنجاح`);
            }
        } catch (error: unknown) {
            console.error('Error bulk creating slots:', error);
            // Parse error response for conflict messages
            const err = error as { response?: { data?: { message?: string; skipped_count?: number }; status?: number } };
            if (err.response?.status === 409) {
                // All slots were overlapping
                toast.error(err.response.data?.message || 'جميع الفترات الزمنية تتعارض مع فترات موجودة');
            } else if (err.response?.data?.message) {
                toast.error(err.response.data.message);
            } else {
                toast.error('حدث خطأ أثناء إنشاء الفترات الزمنية');
            }
            // Don't close modal on error - let user retry
        } finally {
            setIsBulkCreating(false);
        }
    };

    const isLoading = loadingSlots || loadingPending;

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#1F1F1F] flex items-center gap-3">
                        <div className="p-2 bg-[#AF0C15] rounded-xl text-white shadow-lg shadow-[#AF0C15]/25">
                            <CalendarClock size={24} />
                        </div>
                        إدارة الفترات الزمنية
                    </h1>
                    <p className="text-[#636E72] mt-1">إنشاء وإدارة فترات الحصص المباشرة والموافقة على طلبات المدرسين</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
                    {allSlots.length > 0 && (
                        <button
                            onClick={() => setDeleteAllModalOpen(true)}
                            className="flex items-center justify-center gap-2 p-2 sm:px-4 sm:py-2.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-full font-medium transition-all hover:scale-105"
                            title="حذف جميع الفترات"
                        >
                            <Trash2 size={18} />
                            <span className="hidden sm:inline">حذف الكل</span>
                        </button>
                    )}
                    <button
                        onClick={() => refetchSlots()}
                        className="p-2 sm:p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all hover:scale-105"
                        title="تحديث"
                    >
                        <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="flex items-center justify-center gap-2 p-2 sm:px-4 sm:py-2.5 border border-slate-200 hover:bg-slate-50 text-[#1F1F1F] rounded-full font-medium transition-all hover:scale-105"
                        title="إضافة فترة واحدة"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">فترة واحدة</span>
                    </button>
                    <button
                        onClick={() => setBulkGeneratorOpen(true)}
                        className="flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-[#AF0C15] hover:bg-[#8F0A12] text-white rounded-full font-bold shadow-lg shadow-[#AF0C15]/25 transition-all hover:scale-105 hover:shadow-xl text-sm sm:text-base"
                    >
                        <Calendar size={18} />
                        <span className="hidden xs:inline">إنشاء جدول فترات</span>
                        <span className="xs:hidden">جدول</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    title="إجمالي الفترات"
                    value={stats?.total || 0}
                    icon={<Calendar size={22} />}
                    color="text-slate-700"
                    bgColor="bg-gradient-to-br from-slate-50 to-slate-100"
                    isLoading={loadingStats}
                />
                <StatCard
                    title="متاحة للحجز"
                    value={stats?.available || 0}
                    icon={<CheckCircle size={22} />}
                    color="text-emerald-600"
                    bgColor="bg-gradient-to-br from-emerald-50 to-green-100"
                    isLoading={loadingStats}
                />
                <StatCard
                    title="طلبات معلقة"
                    value={stats?.pending || 0}
                    icon={<HourglassIcon size={22} />}
                    color="text-amber-600"
                    bgColor="bg-gradient-to-br from-amber-50 to-yellow-100"
                    isLoading={loadingStats}
                />
                <StatCard
                    title="تم الموافقة"
                    value={stats?.approved || 0}
                    icon={<TrendingUp size={22} />}
                    color="text-[#27AE60]"
                    bgColor="bg-gradient-to-br from-green-50 to-emerald-100"
                    isLoading={loadingStats}
                />
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 w-fit">
                <button
                    onClick={() => handleTabChange('all')}
                    className={`px-5 py-2.5 rounded-xl font-medium transition-all ${activeTab === 'all'
                        ? 'bg-[#AF0C15] text-white shadow-md'
                        : 'text-[#636E72] hover:bg-slate-50'
                        }`}
                >
                    جميع الفترات
                </button>
                <button
                    onClick={() => handleTabChange('pending')}
                    className={`px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 ${activeTab === 'pending'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    طلبات الانتظار
                    {(stats?.pending || 0) > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'pending'
                            ? 'bg-white/20 text-white'
                            : 'bg-amber-100 text-amber-700'
                            }`}>
                            {stats?.pending}
                        </span>
                    )}
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-100">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center sm:flex-wrap">
                    {/* Search */}
                    <div className="relative flex-1 min-w-0 sm:min-w-[250px]">
                        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="البحث بالمدرس أو المحاضرة..."
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#AF0C15]/20 focus:border-[#AF0C15] transition text-sm sm:text-base"
                        />
                    </div>

                    {/* Date & Status Filters Row */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                        {/* Date Filter */}
                        <div className="flex items-center gap-2 flex-1 sm:flex-none min-w-[140px]">
                            <Calendar size={16} className="text-slate-400 hidden sm:block" />
                            <input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#AF0C15]/20 focus:border-[#AF0C15] transition bg-white text-sm"
                            />
                        </div>

                        {/* Status Filter */}
                        {activeTab === 'all' && (
                            <div className="flex items-center gap-2 flex-1 sm:flex-none min-w-[120px]">
                                <Filter size={16} className="text-slate-400 hidden sm:block" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as TimeSlotStatus | 'all')}
                                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#AF0C15]/20 focus:border-[#AF0C15] transition bg-white text-sm"
                                >
                                    <option value="all">جميع الحالات</option>
                                    <option value="available">متاح</option>
                                    <option value="pending">قيد الانتظار</option>
                                    <option value="approved">موافق عليه</option>
                                    <option value="rejected">مرفوض</option>
                                </select>
                            </div>
                        )}

                        {/* Clear filters */}
                        {(searchQuery || dateFilter || statusFilter !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setDateFilter('');
                                    setStatusFilter('all');
                                }}
                                className="flex items-center gap-1 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                            >
                                <X size={14} />
                                <span className="hidden sm:inline">مسح الفلاتر</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {isLoading ? (
                    /* Shimmer Loading */
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-100">
                                <tr>
                                    <th className="text-right py-4 px-6 font-semibold text-slate-600 text-sm">التاريخ</th>
                                    <th className="text-right py-4 px-6 font-semibold text-slate-600 text-sm">الوقت</th>
                                    <th className="text-right py-4 px-6 font-semibold text-slate-600 text-sm">المدرس</th>
                                    <th className="text-right py-4 px-6 font-semibold text-slate-600 text-sm">المحاضرة</th>
                                    <th className="text-right py-4 px-6 font-semibold text-slate-600 text-sm">الحالة</th>
                                    <th className="text-center py-4 px-6 font-semibold text-slate-600 text-sm">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...Array(5)].map((_, index) => (
                                    <tr key={index} className="border-b border-slate-100">
                                        <td className="py-4 px-6">
                                            <div className="h-4 w-28 rounded-md bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" />
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="h-4 w-24 rounded-md bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" />
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="h-4 w-32 rounded-md bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" />
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="h-4 w-36 rounded-md bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" />
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="h-6 w-24 rounded-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" />
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="h-9 w-9 rounded-lg bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : filteredSlots.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <div className="p-4 bg-slate-100 rounded-full mb-4">
                            <CalendarClock size={48} />
                        </div>
                        <p className="text-lg font-medium text-slate-600">لا توجد فترات زمنية</p>
                        <p className="text-sm text-slate-400 mt-1">
                            {activeTab === 'pending'
                                ? 'لا توجد طلبات معلقة حالياً'
                                : 'قم بإضافة فترة جديدة للبدء'}
                        </p>
                        {activeTab !== 'pending' && (
                            <button
                                onClick={() => setBulkGeneratorOpen(true)}
                                className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-[#AF0C15] hover:bg-[#8F0A12] text-white rounded-full font-medium transition"
                            >
                                <Calendar size={18} />
                                إنشاء جدول فترات
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-slate-100">
                            {paginatedSlots.map((slot) => {
                                const statusConfig = STATUS_CONFIG[slot.status];
                                return (
                                    <div key={slot.id} className="p-4 hover:bg-slate-50/50 transition">
                                        {/* Header: Date, Time & Status */}
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Calendar size={14} className="text-slate-400 flex-shrink-0" />
                                                    <span className="font-medium text-charcoal text-sm">
                                                        {formatDate(slot.start_time)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock size={14} className="text-[#AF0C15] flex-shrink-0" />
                                                    <span className="text-[#AF0C15] font-semibold text-sm">
                                                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color} border ${statusConfig.borderColor} flex-shrink-0`}>
                                                {statusConfig.icon}
                                                {statusConfig.label}
                                            </span>
                                        </div>

                                        {/* Teacher & Lecture */}
                                        {(slot.teacher || slot.lecture) && (
                                            <div className="flex flex-wrap gap-3 mb-3 text-sm">
                                                {slot.teacher && (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 bg-[#AF0C15] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                            {slot.teacher.name?.charAt(0) || 'م'}
                                                        </div>
                                                        <span className="text-slate-700 truncate max-w-[120px]">{slot.teacher.name}</span>
                                                    </div>
                                                )}
                                                {slot.lecture && (
                                                    <div className="flex items-center gap-2">
                                                        <BookOpen size={14} className="text-emerald-500 flex-shrink-0" />
                                                        <span className="text-slate-600 truncate max-w-[120px]">{slot.lecture.title}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 pt-2 border-t border-slate-100">
                                            <button
                                                onClick={() => {
                                                    setSelectedSlot(slot);
                                                    setDetailModalOpen(true);
                                                }}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium transition"
                                            >
                                                <Eye size={16} />
                                                عرض
                                            </button>
                                            {slot.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(slot.id)}
                                                        disabled={approveMutation.isPending}
                                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-green-100 hover:bg-green-200 text-[#27AE60] text-sm font-medium transition disabled:opacity-50"
                                                    >
                                                        {approveMutation.isPending ? (
                                                            <Loader2 size={16} className="animate-spin" />
                                                        ) : (
                                                            <CheckCircle size={16} />
                                                        )}
                                                        قبول
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedSlot(slot);
                                                            setRejectModalOpen(true);
                                                        }}
                                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 text-sm font-medium transition"
                                                    >
                                                        <XCircle size={16} />
                                                        رفض
                                                    </button>
                                                </>
                                            )}
                                            {slot.status === 'available' && (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedSlot(slot);
                                                            handleEditClick(slot);
                                                        }}
                                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 text-sm font-medium transition"
                                                    >
                                                        <Edit3 size={16} />
                                                        تعديل
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedSlot(slot);
                                                            setDeleteModalOpen(true);
                                                        }}
                                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 text-sm font-medium transition"
                                                    >
                                                        <Trash2 size={16} />
                                                        حذف
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-100">
                                    <tr>
                                        <th className="text-right py-4 px-6 font-semibold text-slate-600 text-sm">التاريخ</th>
                                        <th className="text-right py-4 px-6 font-semibold text-slate-600 text-sm">الوقت</th>
                                        <th className="text-right py-4 px-6 font-semibold text-slate-600 text-sm">المدرس</th>
                                        <th className="text-right py-4 px-6 font-semibold text-slate-600 text-sm">المحاضرة</th>
                                        <th className="text-right py-4 px-6 font-semibold text-slate-600 text-sm">الحالة</th>
                                        <th className="text-center py-4 px-6 font-semibold text-slate-600 text-sm">الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedSlots.map((slot) => {
                                        const statusConfig = STATUS_CONFIG[slot.status];
                                        return (
                                            <tr key={slot.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1.5 bg-slate-100 rounded-lg">
                                                            <Calendar size={14} className="text-slate-500" />
                                                        </div>
                                                        <span className="font-medium text-charcoal">
                                                            {formatDate(slot.start_time)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-2 font-medium">
                                                        <Clock size={14} className="text-[#AF0C15]" />
                                                        <span className="text-[#AF0C15]">
                                                            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    {slot.teacher ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 bg-[#AF0C15] rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                                {slot.teacher.name?.charAt(0) || 'م'}
                                                            </div>
                                                            <span className="font-medium text-[#1F1F1F]">{slot.teacher.name}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400">—</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6">
                                                    {slot.lecture ? (
                                                        <div className="flex items-center gap-2">
                                                            <BookOpen size={14} className="text-emerald-500" />
                                                            <span className="text-slate-700">{slot.lecture.title}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400">—</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color} border ${statusConfig.borderColor}`}>
                                                        {statusConfig.icon}
                                                        {statusConfig.label}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedSlot(slot);
                                                                setDetailModalOpen(true);
                                                            }}
                                                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition"
                                                            title="عرض التفاصيل"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                        {slot.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleApprove(slot.id)}
                                                                    disabled={approveMutation.isPending}
                                                                    className="p-2 rounded-lg hover:bg-green-100 text-[#27AE60] transition disabled:opacity-50"
                                                                    title="موافقة"
                                                                >
                                                                    {approveMutation.isPending ? (
                                                                        <Loader2 size={18} className="animate-spin" />
                                                                    ) : (
                                                                        <CheckCircle size={18} />
                                                                    )}
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedSlot(slot);
                                                                        setRejectModalOpen(true);
                                                                    }}
                                                                    className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition"
                                                                    title="رفض"
                                                                >
                                                                    <XCircle size={18} />
                                                                </button>
                                                            </>
                                                        )}
                                                        {slot.status === 'available' && (
                                                            <>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedSlot(slot);
                                                                        handleEditClick(slot);
                                                                    }}
                                                                    className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition"
                                                                    title="تعديل"
                                                                >
                                                                    <Edit3 size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedSlot(slot);
                                                                        setDeleteModalOpen(true);
                                                                    }}
                                                                    className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition"
                                                                    title="حذف"
                                                                >
                                                                    <Trash2 size={18} />
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
                    </>
                )}

                {/* Pagination Controls */}
                {filteredSlots.length > ITEMS_PER_PAGE && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 p-4 border-t border-slate-100">
                        <div className="text-xs sm:text-sm text-slate-600 order-2 sm:order-1">
                            عرض {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredSlots.length)} من {filteredSlots.length.toLocaleString('ar-EG')} فترة
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
                            <button
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                                className="hidden sm:block px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                الأولى
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                <ChevronRight size={18} />
                            </button>

                            {/* Mobile: Simple page indicator */}
                            <div className="sm:hidden px-3 py-2 text-sm font-medium text-slate-600">
                                {currentPage} / {totalPages}
                            </div>

                            {/* Desktop: Page numbers */}
                            <div className="hidden sm:flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum: number;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-10 h-10 rounded-lg text-sm font-medium transition ${currentPage === pageNum
                                                ? 'bg-[#AF0C15] text-white shadow-md'
                                                : 'border border-slate-200 hover:bg-slate-50'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}
                                className="hidden sm:block px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                الأخيرة
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {createModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-50 rounded-xl">
                                    <Plus size={20} className="text-[#AF0C15]" />
                                </div>
                                <h3 className="text-lg font-bold text-[#1F1F1F]">إضافة فترة زمنية جديدة</h3>
                            </div>
                            <button
                                onClick={() => setCreateModalOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">التاريخ</label>
                                <input
                                    type="date"
                                    value={newSlotDate}
                                    onChange={(e) => setNewSlotDate(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#AF0C15]/20 focus:border-[#AF0C15] transition"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">وقت البداية</label>
                                    <input
                                        type="time"
                                        value={newSlotStartTime}
                                        onChange={(e) => setNewSlotStartTime(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#AF0C15]/20 focus:border-[#AF0C15] transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">وقت النهاية</label>
                                    <input
                                        type="time"
                                        value={newSlotEndTime}
                                        onChange={(e) => setNewSlotEndTime(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#AF0C15]/20 focus:border-[#AF0C15] transition"
                                    />
                                </div>
                            </div>

                            {/* Smart Time Validation Warning */}
                            {(() => {
                                if (!newSlotDate || !newSlotStartTime || !newSlotEndTime) return null;

                                const today = new Date().toISOString().split('T')[0];
                                const now = new Date();
                                const currentHour = now.getHours();
                                const currentMinute = now.getMinutes();

                                // Parse start and end times
                                const [startH, startM] = newSlotStartTime.split(':').map(Number);
                                const [endH, endM] = newSlotEndTime.split(':').map(Number);

                                // Check if end time is before start time
                                if (endH < startH || (endH === startH && endM <= startM)) {
                                    return (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                                            <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-red-600">وقت النهاية يجب أن يكون بعد وقت البداية</p>
                                        </div>
                                    );
                                }

                                // Check if selected date is today and time is in the past
                                if (newSlotDate === today) {
                                    const startInPast = startH < currentHour || (startH === currentHour && startM <= currentMinute);
                                    const nextHour = currentHour + 1;

                                    if (startInPast && endH > currentHour) {
                                        return (
                                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                                                <AlertCircle size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
                                                <div className="text-sm text-amber-700">
                                                    <p className="font-medium">وقت البداية في الماضي</p>
                                                    <p>سيبدأ الحجز من الساعة {String(nextHour).padStart(2, '0')}:00 بدلاً من {newSlotStartTime}</p>
                                                </div>
                                            </div>
                                        );
                                    } else if (endH <= currentHour) {
                                        return (
                                            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                                                <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                                                <p className="text-sm text-red-600">لا يمكن إنشاء فترة في الماضي. اختر وقتاً مستقبلياً.</p>
                                            </div>
                                        );
                                    }
                                }

                                return null;
                            })()}

                            {/* API Error Display (Overlap Detection) */}
                            {createModalError && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                                    <AlertCircle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm text-red-700">
                                        <p className="font-bold mb-1">تعارض في الفترات الزمنية</p>
                                        <p>{createModalError}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-slate-100 flex gap-3">
                            <button
                                onClick={() => {
                                    setCreateModalOpen(false);
                                    setCreateModalError(null);
                                }}
                                className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold transition"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleCreateSlot}
                                disabled={(() => {
                                    if (!newSlotDate || !newSlotStartTime || !newSlotEndTime || createMutation.isPending) return true;
                                    if (newSlotEndTime <= newSlotStartTime) return true;

                                    // Block if today and entire range is in the past
                                    const today = new Date().toISOString().split('T')[0];
                                    if (newSlotDate === today) {
                                        const currentHour = new Date().getHours();
                                        const [endH] = newSlotEndTime.split(':').map(Number);
                                        if (endH <= currentHour) return true;
                                    }
                                    return false;
                                })()}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#AF0C15] hover:bg-[#8F0A12] text-white rounded-full font-bold transition disabled:opacity-50"
                            >
                                {createMutation.isPending ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <Plus size={18} />
                                )}
                                إضافة الفترة
                            </button>
                        </div>
                    </div>
                </div>
            )
            }

            {/* Detail Modal */}
            {
                detailModalOpen && selectedSlot && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-charcoal">تفاصيل الفترة الزمنية</h3>
                                <button
                                    onClick={() => {
                                        setDetailModalOpen(false);
                                        setSelectedSlot(null);
                                    }}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-slate-500">التاريخ</label>
                                        <p className="font-medium mt-1">{formatDate(selectedSlot.start_time)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-slate-500">الوقت</label>
                                        <p className="font-medium mt-1">
                                            {formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-slate-500">الحالة</label>
                                        <div className="mt-1">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${STATUS_CONFIG[selectedSlot.status].bgColor} ${STATUS_CONFIG[selectedSlot.status].color}`}>
                                                {STATUS_CONFIG[selectedSlot.status].icon}
                                                {STATUS_CONFIG[selectedSlot.status].label}
                                            </span>
                                        </div>
                                    </div>
                                    {selectedSlot.teacher && (
                                        <div>
                                            <label className="text-sm text-slate-500">المدرس</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <User size={16} className="text-slate-400" />
                                                <span className="font-medium">{selectedSlot.teacher.name}</span>
                                            </div>
                                        </div>
                                    )}
                                    {selectedSlot.lecture && (
                                        <div className="col-span-2">
                                            <label className="text-sm text-slate-500">المحاضرة</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <BookOpen size={16} className="text-slate-400" />
                                                <span className="font-medium">{selectedSlot.lecture.title}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {selectedSlot.request_notes && (
                                    <div>
                                        <label className="text-sm text-slate-500">ملاحظات الطلب</label>
                                        <p className="bg-slate-50 p-3 rounded-lg mt-1">{selectedSlot.request_notes}</p>
                                    </div>
                                )}
                                {selectedSlot.rejection_reason && (
                                    <div>
                                        <label className="text-sm text-red-500">سبب الرفض</label>
                                        <p className="bg-red-50 p-3 rounded-lg mt-1 text-red-700">{selectedSlot.rejection_reason}</p>
                                    </div>
                                )}
                            </div>
                            {selectedSlot.status === 'pending' && (
                                <div className="p-6 border-t border-slate-100 flex gap-3">
                                    <button
                                        onClick={() => handleApprove(selectedSlot.id)}
                                        disabled={approveMutation.isPending}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#27AE60] hover:bg-[#229954] text-white rounded-full font-bold transition disabled:opacity-50"
                                    >
                                        {approveMutation.isPending ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            <CheckCircle size={18} />
                                        )}
                                        موافقة
                                    </button>
                                    <button
                                        onClick={() => setRejectModalOpen(true)}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#AF0C15] hover:bg-[#8F0A12] text-white rounded-full font-bold transition"
                                    >
                                        <XCircle size={18} />
                                        رفض
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

            {/* Reject Modal */}
            {
                rejectModalOpen && selectedSlot && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-slate-100">
                                <h3 className="text-lg font-bold text-charcoal flex items-center gap-2">
                                    <XCircle size={20} className="text-red-500" />
                                    رفض الطلب
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">يرجى ذكر سبب الرفض للمدرس</p>
                            </div>
                            <div className="p-6">
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="سبب الرفض..."
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none transition"
                                />
                            </div>
                            <div className="p-6 border-t border-slate-100 flex gap-3">
                                <button
                                    onClick={() => {
                                        setRejectModalOpen(false);
                                        setRejectionReason('');
                                    }}
                                    className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold transition"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={!rejectionReason.trim() || rejectMutation.isPending}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#AF0C15] hover:bg-[#8F0A12] text-white rounded-full font-bold transition disabled:opacity-50"
                                >
                                    {rejectMutation.isPending ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <XCircle size={18} />
                                    )}
                                    رفض الطلب
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Edit Modal */}
            {
                editModalOpen && selectedSlot && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-50 rounded-xl">
                                        <Edit3 size={20} className="text-[#AF0C15]" />
                                    </div>
                                    <h3 className="text-lg font-bold text-[#1F1F1F]">تعديل الفترة الزمنية</h3>
                                </div>
                                <button
                                    onClick={() => setEditModalOpen(false)}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">التاريخ</label>
                                    <input
                                        type="date"
                                        value={editDate}
                                        onChange={(e) => setEditDate(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#AF0C15]/20 focus:border-[#AF0C15] transition"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">وقت البداية</label>
                                        <input
                                            type="time"
                                            value={editStartTime}
                                            onChange={(e) => setEditStartTime(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#AF0C15]/20 focus:border-[#AF0C15] transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">وقت النهاية</label>
                                        <input
                                            type="time"
                                            value={editEndTime}
                                            onChange={(e) => setEditEndTime(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#AF0C15]/20 focus:border-[#AF0C15] transition"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-slate-100 flex gap-3">
                                <button
                                    onClick={() => setEditModalOpen(false)}
                                    className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold transition"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={handleUpdateSlot}
                                    disabled={!editDate || !editStartTime || !editEndTime || updateMutation.isPending}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#AF0C15] hover:bg-[#8F0A12] text-white rounded-full font-bold transition disabled:opacity-50"
                                >
                                    {updateMutation.isPending ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <Edit3 size={18} />
                                    )}
                                    حفظ التغييرات
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }



            {/* Delete Modal */}
            {
                deleteModalOpen && selectedSlot && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-slate-100">
                                <h3 className="text-lg font-bold text-charcoal flex items-center gap-2">
                                    <Trash2 size={20} className="text-red-500" />
                                    حذف الفترة الزمنية
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    هل أنت متأكد من حذف هذه الفترة الزمنية؟ لا يمكن التراجع عن هذا الإجراء.
                                </p>
                            </div>
                            <div className="p-6 bg-slate-50 border-y border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-200 rounded-lg">
                                        <Clock size={20} className="text-slate-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{formatDate(selectedSlot.start_time)}</p>
                                        <p className="text-sm text-slate-500">
                                            {formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 flex gap-3">
                                <button
                                    onClick={() => {
                                        setDeleteModalOpen(false);
                                        setSelectedSlot(null);
                                    }}
                                    className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold transition"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleteMutation.isPending}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#AF0C15] hover:bg-[#8F0A12] text-white rounded-full font-bold transition disabled:opacity-50"
                                >
                                    {deleteMutation.isPending ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <Trash2 size={18} />
                                    )}
                                    حذف
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Bulk Slot Generator Modal */}
            <BulkSlotGeneratorModal
                isOpen={bulkGeneratorOpen}
                onClose={() => setBulkGeneratorOpen(false)}
                onSubmit={handleBulkCreate}
                isSubmitting={isBulkCreating}
            />

            {/* Delete All Confirmation Modal */}
            {
                deleteAllModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div
                            className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200"
                            dir="rtl"
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                                    <Trash2 size={32} className="text-amber-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    حذف الفترات المستقبلية المتاحة
                                </h3>
                                <p className="text-gray-500 mb-2">
                                    سيتم حذف الفترات الزمنية <span className="font-bold text-amber-600">المستقبلية والمتاحة فقط</span>
                                </p>
                                <p className="text-green-600 text-sm font-medium mb-6">
                                    ✓ الفترات المحجوزة والمعلقة والسابقة ستبقى محفوظة
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteAllModalOpen(false)}
                                    disabled={deleteAllMutation.isPending}
                                    className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 rounded-full font-medium transition disabled:opacity-50"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            await deleteAllMutation.mutateAsync();
                                            setDeleteAllModalOpen(false);
                                            setCurrentPage(1); // Reset pagination after deletion
                                        } catch (error) {
                                            console.error('Error deleting slots:', error);
                                        }
                                    }}
                                    disabled={deleteAllMutation.isPending}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-full font-bold transition disabled:opacity-50"
                                >
                                    {deleteAllMutation.isPending ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <Trash2 size={18} />
                                    )}
                                    حذف المتاحة
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
