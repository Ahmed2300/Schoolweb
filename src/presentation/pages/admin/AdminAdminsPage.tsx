import { useState, useEffect, useCallback } from 'react';
import {
    Search,
    Filter,
    Shield,
    ShieldCheck,
    UserPlus,
    Clock,
    Eye,
    Edit2,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { adminService, PaginatedResponse, RoleData } from '../../../data/api/adminService';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { AddAdminModal } from '../../components/admin/AddAdminModal';
import { EditAdminModal } from '../../components/admin/EditAdminModal';
import { useAuthStore } from '../../store';

// Types
interface AdminUser {
    id: number;
    name: string;
    email: string;
    created_at: string;
    updated_at?: string;
    roles?: RoleData[];
    status?: 'active' | 'inactive';
}

interface Stats {
    totalAdmins: number;
    activeAdmins: number;
    inactiveAdmins: number;
}

// Format date to Arabic
const formatDate = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-EG', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    } catch {
        return dateString;
    }
};

export function AdminAdminsPage() {
    const { user: currentUser } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage] = useState(10);

    // Data states
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [stats, setStats] = useState<Stats>({
        totalAdmins: 0,
        activeAdmins: 0,
        inactiveAdmins: 0,
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        total: 0,
    });

    // Loading and error states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<number | null>(null);

    // Delete dialog state
    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean;
        admin: AdminUser | null;
    }>({ isOpen: false, admin: null });

    // View modal state
    const [viewModal, setViewModal] = useState<{
        isOpen: boolean;
        admin: AdminUser | null;
    }>({ isOpen: false, admin: null });

    // Add admin modal state
    const [showAddAdminModal, setShowAddAdminModal] = useState(false);

    // Edit admin modal state
    const [editModal, setEditModal] = useState<{
        isOpen: boolean;
        admin: AdminUser | null;
    }>({ isOpen: false, admin: null });

    // Debounced search
    const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch admins
    const fetchAdmins = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const params = {
                page: currentPage,
                per_page: perPage,
                search: debouncedSearch || undefined,
            };

            const response: PaginatedResponse<AdminUser> = await adminService.getAdmins(params);
            setAdmins(response.data || []);
            setPagination({
                currentPage: response.meta?.current_page || 1,
                lastPage: response.meta?.last_page || 1,
                total: response.meta?.total || 0,
            });

            // Calculate stats
            const total = response.meta?.total || response.data?.length || 0;
            const active = response.data?.filter(a => a.status === 'active').length || total;
            const inactive = response.data?.filter(a => a.status === 'inactive').length || 0;

            setStats({
                totalAdmins: total,
                activeAdmins: active,
                inactiveAdmins: inactive,
            });
        } catch (err: any) {
            console.error('Error fetching admins:', err);
            setError(err.response?.data?.message || 'فشل في تحميل المديرين');
        } finally {
            setLoading(false);
        }
    }, [currentPage, perPage, debouncedSearch]);

    // Fetch on mount and when dependencies change
    useEffect(() => {
        fetchAdmins();
    }, [fetchAdmins]);

    // Open delete confirmation dialog
    const openDeleteDialog = (admin: AdminUser) => {
        setDeleteDialog({ isOpen: true, admin });
    };

    // Close delete confirmation dialog
    const closeDeleteDialog = () => {
        setDeleteDialog({ isOpen: false, admin: null });
    };

    // Open view modal
    const openViewModal = (admin: AdminUser) => {
        setViewModal({ isOpen: true, admin });
    };

    // Close view modal
    const closeViewModal = () => {
        setViewModal({ isOpen: false, admin: null });
    };

    // Open edit modal
    const openEditModal = (admin: AdminUser) => {
        setEditModal({ isOpen: true, admin });
    };

    // Close edit modal
    const closeEditModal = () => {
        setEditModal({ isOpen: false, admin: null });
    };

    // Handle delete admin
    const handleConfirmDelete = async () => {
        const admin = deleteDialog.admin;
        if (!admin) return;

        setDeleting(admin.id);
        try {
            await adminService.deleteAdmin(admin.id);
            fetchAdmins();
            closeDeleteDialog();
        } catch (err: any) {
            console.error('Error deleting admin:', err);
            setError(err.response?.data?.message || 'فشل في حذف المدير');
        } finally {
            setDeleting(null);
        }
    };

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages: number[] = [];
        const maxPages = 5;
        let start = Math.max(1, currentPage - Math.floor(maxPages / 2));
        const end = Math.min(pagination.lastPage, start + maxPages - 1);

        if (end - start + 1 < maxPages) {
            start = Math.max(1, end - maxPages + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    // Get role display name
    const getRoleDisplay = (admin: AdminUser): string => {
        if (admin.roles && admin.roles.length > 0) {
            return admin.roles.map(r => r.name).join(', ');
        }
        return 'مدير';
    };

    // Stats display data
    const statsDisplay = [
        { icon: <Shield size={22} className="text-shibl-crimson" />, label: 'إجمالي المديرين', value: stats.totalAdmins.toLocaleString('ar-EG'), bgColor: 'bg-red-50' },
        { icon: <ShieldCheck size={22} className="text-green-600" />, label: 'نشط', value: stats.activeAdmins.toLocaleString('ar-EG'), bgColor: 'bg-green-50' },
        { icon: <Clock size={22} className="text-slate-500" />, label: 'غير نشط', value: stats.inactiveAdmins.toLocaleString('ar-EG'), bgColor: 'bg-slate-100' },
    ];

    return (
        <>
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-charcoal dark:text-white">إدارة المديرين</h1>
                    <p className="text-sm text-slate-grey dark:text-slate-400 mt-1">إدارة حسابات المديرين والصلاحيات</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 lg:w-72">
                        <input
                            type="text"
                            placeholder="بحث بالاسم أو البريد..."
                            className="w-full h-11 pl-4 pr-11 rounded-[12px] bg-white dark:bg-[#2A2A2A] border border-slate-200 dark:border-white/10 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all text-sm dark:text-white dark:placeholder:text-slate-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>

                    {/* Filter Button */}
                    <button className="h-11 px-4 rounded-[12px] bg-white dark:bg-[#2A2A2A] border border-slate-200 dark:border-white/10 hover:border-shibl-crimson text-slate-600 dark:text-slate-400 hover:text-shibl-crimson transition-all flex items-center gap-2">
                        <Filter size={18} />
                    </button>

                    {/* Add Admin Button */}
                    <button
                        onClick={() => setShowAddAdminModal(true)}
                        className="h-11 px-5 rounded-pill bg-shibl-crimson hover:bg-red-700 text-white font-bold text-sm shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2"
                    >
                        <UserPlus size={18} />
                        <span>إضافة مدير</span>
                    </button>
                </div>
            </div>

            {/* Stats Mini Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {statsDisplay.map((stat, index) => (
                    <div key={index} className="bg-white dark:bg-[#1E1E1E] rounded-[16px] p-4 shadow-card border border-transparent dark:border-white/10 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-[12px] flex items-center justify-center ${stat.bgColor}`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-xs text-slate-grey dark:text-slate-400 font-medium">{stat.label}</p>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-extrabold text-charcoal dark:text-white">{stat.value}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-[12px] mb-6 flex items-center gap-2">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {/* Admins Table */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-[16px] shadow-card border border-transparent dark:border-white/10 overflow-hidden">
                {loading ? (
                    /* Shimmer Skeleton Loading */
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-[#2A2A2A] border-b border-slate-100 dark:border-white/10">
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey dark:text-slate-400 uppercase tracking-wider">الاسم</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey dark:text-slate-400 uppercase tracking-wider">البريد الإلكتروني</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey dark:text-slate-400 uppercase tracking-wider">الدور</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey dark:text-slate-400 uppercase tracking-wider">الحالة</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey dark:text-slate-400 uppercase tracking-wider">تاريخ الانضمام</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey dark:text-slate-400 uppercase tracking-wider">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                                {[...Array(6)].map((_, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" />
                                                <div className="h-4 w-28 rounded-md bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${index * 100}ms` }} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 w-40 rounded-md bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${index * 100 + 50}ms` }} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-6 w-16 rounded-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${index * 100 + 100}ms` }} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-6 w-14 rounded-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${index * 100 + 150}ms` }} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 w-28 rounded-md bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${index * 100 + 200}ms` }} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${index * 100 + 250}ms` }} />
                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${index * 100 + 300}ms` }} />
                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${index * 100 + 350}ms` }} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : admins.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400">
                        <Shield size={48} className="mb-4 text-slate-300 dark:text-slate-600" />
                        <p className="text-lg font-medium dark:text-white">لا يوجد مديرين</p>
                        <p className="text-sm">لم يتم إضافة أي مديرين بعد</p>
                        <button
                            onClick={() => setShowAddAdminModal(true)}
                            className="mt-4 px-6 py-2 bg-shibl-crimson text-white rounded-pill font-semibold text-sm hover:bg-red-700 transition-colors"
                        >
                            إضافة أول مدير
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-[#2A2A2A] border-b border-slate-100 dark:border-white/10">
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey dark:text-slate-400 uppercase tracking-wider">الاسم</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey dark:text-slate-400 uppercase tracking-wider">البريد الإلكتروني</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey dark:text-slate-400 uppercase tracking-wider">الدور</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey dark:text-slate-400 uppercase tracking-wider">الحالة</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey dark:text-slate-400 uppercase tracking-wider">تاريخ الانضمام</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey dark:text-slate-400 uppercase tracking-wider">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                                {admins.map((admin) => {
                                    const isCurrentUser = currentUser?.email === admin.email;
                                    return (
                                        <tr key={admin.id} className={`hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors ${isCurrentUser ? 'bg-blue-50/50 dark:bg-blue-500/5' : ''}`}>
                                            {/* Name with Avatar */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${isCurrentUser ? 'bg-gradient-to-br from-shibl-crimson to-red-700 ring-2 ring-shibl-crimson/30' : 'bg-gradient-to-br from-charcoal to-slate-700'}`}>
                                                        {admin.name.charAt(0)}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-charcoal dark:text-white">{admin.name}</span>
                                                        {isCurrentUser && (
                                                            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-shibl-crimson text-white">
                                                                أنت
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Email */}
                                            <td className="px-6 py-4 text-sm text-slate-grey dark:text-slate-400">{admin.email}</td>

                                            {/* Role Badge */}
                                            <td className="px-6 py-4">
                                                <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                                    {getRoleDisplay(admin)}
                                                </span>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${admin.status === 'inactive'
                                                    ? 'bg-slate-100 text-slate-500'
                                                    : 'bg-green-100 text-green-700'
                                                    }`}>
                                                    {admin.status === 'inactive' ? 'غير نشط' : 'نشط'}
                                                </span>
                                            </td>

                                            {/* Date */}
                                            <td className="px-6 py-4 text-sm text-slate-grey dark:text-slate-400">{formatDate(admin.created_at)}</td>

                                            {/* Actions */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => openViewModal(admin)}
                                                        className="w-8 h-8 rounded-[8px] bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 flex items-center justify-center text-slate-600 dark:text-slate-400 transition-colors"
                                                        title="عرض"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(admin)}
                                                        className="w-8 h-8 rounded-[8px] bg-blue-100 dark:bg-blue-500/10 hover:bg-blue-200 dark:hover:bg-blue-500/20 flex items-center justify-center text-blue-600 transition-colors"
                                                        title="تعديل"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteDialog(admin)}
                                                        disabled={deleting === admin.id}
                                                        className="w-8 h-8 rounded-[8px] bg-red-100 dark:bg-red-500/10 hover:bg-red-200 dark:hover:bg-red-500/20 flex items-center justify-center text-red-600 transition-colors disabled:opacity-50"
                                                        title="حذف"
                                                    >
                                                        {deleting === admin.id ? (
                                                            <Loader2 size={16} className="animate-spin" />
                                                        ) : (
                                                            <Trash2 size={16} />
                                                        )}
                                                    </button>
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
                {!loading && admins.length > 0 && (
                    <div className="px-6 py-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                        <p className="text-sm text-slate-grey dark:text-slate-400">
                            عرض {admins.length} من {pagination.total}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="w-9 h-9 rounded-[8px] bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 flex items-center justify-center text-slate-600 dark:text-slate-400 transition-colors disabled:opacity-50"
                            >
                                <ChevronRight size={18} />
                            </button>
                            {getPageNumbers().map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-9 h-9 rounded-[8px] font-semibold text-sm transition-colors ${currentPage === page
                                        ? 'bg-shibl-crimson text-white'
                                        : 'bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-600 dark:text-slate-400'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(pagination.lastPage, p + 1))}
                                disabled={currentPage === pagination.lastPage}
                                className="w-9 h-9 rounded-[8px] bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 flex items-center justify-center text-slate-600 dark:text-slate-400 transition-colors disabled:opacity-50"
                            >
                                <ChevronLeft size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={closeDeleteDialog}
                onConfirm={handleConfirmDelete}
                title="تأكيد الحذف"
                message={`هل أنت متأكد من حذف المدير "${deleteDialog.admin?.name || ''}"؟ لا يمكن التراجع عن هذا الإجراء.`}
                confirmText="حذف"
                cancelText="إلغاء"
                type="danger"
                isLoading={deleting === deleteDialog.admin?.id}
            />

            {/* View Admin Modal */}
            {viewModal.isOpen && viewModal.admin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm" onClick={closeViewModal} />
                    <div className="relative bg-white dark:bg-[#1E1E1E] rounded-[20px] shadow-xl w-full max-w-md mx-4 overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-br from-charcoal to-slate-800 px-6 py-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold">
                                    {viewModal.admin.name.charAt(0)}
                                </div>
                                <div className="text-white">
                                    <h2 className="text-lg font-extrabold">{viewModal.admin.name}</h2>
                                    <p className="text-xs text-white/80">{getRoleDisplay(viewModal.admin)}</p>
                                </div>
                            </div>
                            <button
                                onClick={closeViewModal}
                                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                            >
                                ×
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-white/10">
                                <span className="text-slate-grey dark:text-slate-400">البريد الإلكتروني</span>
                                <span className="font-semibold text-charcoal dark:text-white">{viewModal.admin.email}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-white/10">
                                <span className="text-slate-grey dark:text-slate-400">الحالة</span>
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${viewModal.admin.status === 'inactive'
                                    ? 'bg-slate-100 text-slate-500'
                                    : 'bg-green-100 text-green-700'
                                    }`}>
                                    {viewModal.admin.status === 'inactive' ? 'غير نشط' : 'نشط'}
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-white/10">
                                <span className="text-slate-grey dark:text-slate-400">تاريخ الانضمام</span>
                                <span className="font-semibold text-charcoal dark:text-white">{formatDate(viewModal.admin.created_at)}</span>
                            </div>
                            {viewModal.admin.roles && viewModal.admin.roles.length > 0 && (
                                <div className="py-2">
                                    <span className="text-slate-grey dark:text-slate-400 block mb-2">الأدوار والصلاحيات</span>
                                    <div className="flex flex-wrap gap-2">
                                        {viewModal.admin.roles.map(role => (
                                            <span key={role.id} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                                {role.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-slate-100 dark:border-white/10 flex gap-3">
                            <button
                                onClick={closeViewModal}
                                className="flex-1 h-11 rounded-pill bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-charcoal dark:text-white font-semibold text-sm transition-all"
                            >
                                إغلاق
                            </button>
                            <button
                                onClick={() => {
                                    closeViewModal();
                                    openEditModal(viewModal.admin!);
                                }}
                                className="flex-1 h-11 rounded-pill bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <Edit2 size={16} />
                                تعديل
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Admin Modal */}
            <AddAdminModal
                isOpen={showAddAdminModal}
                onClose={() => setShowAddAdminModal(false)}
                onSuccess={() => {
                    setShowAddAdminModal(false);
                    fetchAdmins();
                }}
            />

            {/* Edit Admin Modal */}
            <EditAdminModal
                isOpen={editModal.isOpen}
                onClose={closeEditModal}
                onSuccess={() => {
                    closeEditModal();
                    fetchAdmins();
                }}
                admin={editModal.admin}
            />
        </>
    );
}
