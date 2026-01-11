import { useState, useEffect, useCallback } from 'react';
import {
    Search,
    Filter,
    Shield,
    Users,
    UserCheck,
    Clock,
    Eye,
    Edit2,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { adminService, UserData, UserRole, UserStatus, PaginatedResponse } from '../../../data/api/adminService';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EditUserModal } from '../../components/admin/EditUserModal';
import { ViewUserModal } from '../../components/admin/ViewUserModal';
import { AddStudentModal } from '../../components/admin/AddStudentModal';
import { AddParentModal } from '../../components/admin/AddParentModal';

// Types
type FilterTab = 'all' | 'students' | 'parents';

interface Stats {
    totalUsers: number;
    totalStudents: number;
    totalParents: number;
}

const filterTabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'الكل' },
    { key: 'students', label: 'الطلاب' },
    { key: 'parents', label: 'أولياء الأمور' },
];

const roleConfig: Record<UserRole, { label: string; bgColor: string; textColor: string }> = {
    student: { label: 'طالب', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
    parent: { label: 'ولي أمر', bgColor: 'bg-green-100', textColor: 'text-green-700' },
    teacher: { label: 'مدرس', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
};

const statusConfig: Record<UserStatus, { label: string; bgColor: string; textColor: string }> = {
    active: { label: 'نشط', bgColor: 'bg-green-100', textColor: 'text-green-700' },
    inactive: { label: 'غير نشط', bgColor: 'bg-slate-100', textColor: 'text-slate-500' },
};

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

export function AdminUsersPage() {
    const [activeTab, setActiveTab] = useState<FilterTab>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage] = useState(10);

    // Data states
    const [users, setUsers] = useState<UserData[]>([]);
    const [stats, setStats] = useState<Stats>({
        totalUsers: 0,
        totalStudents: 0,
        totalParents: 0,
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
        user: UserData | null;
    }>({ isOpen: false, user: null });

    // Edit modal state
    const [editModal, setEditModal] = useState<{
        isOpen: boolean;
        user: UserData | null;
    }>({ isOpen: false, user: null });

    // View modal state
    const [viewModal, setViewModal] = useState<{
        isOpen: boolean;
        user: UserData | null;
    }>({ isOpen: false, user: null });

    // Add user modal states
    const [showAddStudentModal, setShowAddStudentModal] = useState(false);
    const [showAddParentModal, setShowAddParentModal] = useState(false);

    // Debounced search
    const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1); // Reset to first page on search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch users based on active tab
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const params = {
                page: currentPage,
                per_page: perPage,
                search: debouncedSearch || undefined,
            };

            if (activeTab === 'all') {
                // Fetch all users
                const result = await adminService.getAllUsers(params);
                setUsers(result.users);
                setStats({
                    totalUsers: result.stats.totalStudents + result.stats.totalParents,
                    totalStudents: result.stats.totalStudents,
                    totalParents: result.stats.totalParents,
                });
                setPagination({
                    currentPage: 1,
                    lastPage: 1,
                    total: result.users.length,
                });
            } else {
                // Fetch specific user type
                let response: PaginatedResponse<UserData>;

                switch (activeTab) {
                    case 'students':
                        response = await adminService.getStudents(params);
                        break;
                    case 'parents':
                        response = await adminService.getParents(params);
                        break;
                    default:
                        response = await adminService.getStudents(params);
                }

                setUsers(response.data);
                setPagination({
                    currentPage: response.meta.current_page,
                    lastPage: response.meta.last_page,
                    total: response.meta.total,
                });

                // Update stats for the specific type
                setStats(prev => ({
                    ...prev,
                    [`total${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`]: response.meta.total,
                }));
            }
        } catch (err: any) {
            console.error('Error fetching users:', err);
            setError(err.response?.data?.message || 'فشل في تحميل المستخدمين');
        } finally {
            setLoading(false);
        }
    }, [activeTab, currentPage, perPage, debouncedSearch]);

    // Fetch on mount and when dependencies change
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Reset page when tab changes
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    // Open delete confirmation dialog
    const openDeleteDialog = (user: UserData) => {
        setDeleteDialog({ isOpen: true, user });
    };

    // Close delete confirmation dialog
    const closeDeleteDialog = () => {
        setDeleteDialog({ isOpen: false, user: null });
    };

    // Open edit modal
    const openEditModal = (user: UserData) => {
        setEditModal({ isOpen: true, user });
    };

    // Close edit modal
    const closeEditModal = () => {
        setEditModal({ isOpen: false, user: null });
    };

    // Handle successful edit
    const handleEditSuccess = () => {
        fetchUsers(); // Refresh the list
    };

    // Open view modal
    const openViewModal = (user: UserData) => {
        setViewModal({ isOpen: true, user });
    };

    // Close view modal
    const closeViewModal = () => {
        setViewModal({ isOpen: false, user: null });
    };

    // Handle delete user
    const handleConfirmDelete = async () => {
        const user = deleteDialog.user;
        if (!user) return;

        setDeleting(user.id);
        try {
            await adminService.deleteUser(user.role, user.id);
            // Refresh the list
            fetchUsers();
            closeDeleteDialog();
        } catch (err: any) {
            console.error('Error deleting user:', err);
            setError(err.response?.data?.message || 'فشل في حذف المستخدم');
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

    // Stats display data
    const statsDisplay = [
        { icon: <Users size={22} className="text-shibl-crimson" />, label: 'إجمالي المستخدمين', value: stats.totalUsers.toLocaleString('ar-EG'), bgColor: 'bg-red-50' },
        { icon: <UserCheck size={22} className="text-blue-600" />, label: 'الطلاب', value: stats.totalStudents.toLocaleString('ar-EG'), bgColor: 'bg-blue-50' },
        { icon: <Clock size={22} className="text-green-600" />, label: 'أولياء الأمور', value: stats.totalParents.toLocaleString('ar-EG'), bgColor: 'bg-green-50' },
    ];

    return (
        <>
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <h1 className="text-2xl font-extrabold text-charcoal">إدارة المستخدمين</h1>

                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 lg:w-72">
                        <input
                            type="text"
                            placeholder="بحث في المستخدمين..."
                            className="w-full h-11 pl-4 pr-11 rounded-[12px] bg-white border border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>

                    {/* Filter Button */}
                    <button className="h-11 px-4 rounded-[12px] bg-white border border-slate-200 hover:border-shibl-crimson text-slate-600 hover:text-shibl-crimson transition-all flex items-center gap-2">
                        <Filter size={18} />
                    </button>

                    {/* Add User Buttons */}
                    <button
                        onClick={() => setShowAddStudentModal(true)}
                        className="h-11 px-5 rounded-pill bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2"
                    >
                        <UserCheck size={18} />
                        <span>إضافة طالب</span>
                    </button>
                    <button
                        onClick={() => setShowAddParentModal(true)}
                        className="h-11 px-5 rounded-pill bg-green-600 hover:bg-green-700 text-white font-bold text-sm shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2"
                    >
                        <Users size={18} />
                        <span>إضافة ولي أمر</span>
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
                {filterTabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-5 py-2.5 rounded-[12px] font-semibold text-sm transition-all duration-200 ${activeTab === tab.key
                            ? 'bg-shibl-crimson text-white shadow-crimson'
                            : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Stats Mini Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {statsDisplay.map((stat, index) => (
                    <div key={index} className="bg-white rounded-[16px] p-4 shadow-card flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-[12px] flex items-center justify-center ${stat.bgColor}`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-xs text-slate-grey font-medium">{stat.label}</p>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-extrabold text-charcoal">{stat.value}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[12px] mb-6">
                    {error}
                </div>
            )}

            {/* Users Table */}
            <div className="bg-white rounded-[16px] shadow-card overflow-hidden">
                {loading ? (
                    /* Shimmer Skeleton Loading */
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase tracking-wider">الاسم</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase tracking-wider">البريد الإلكتروني</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase tracking-wider">الدور</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase tracking-wider">الحالة</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase tracking-wider">تاريخ الانضمام</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase tracking-wider">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
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
                                            <div className="h-6 w-14 rounded-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${index * 100 + 100}ms` }} />
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
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                        <Users size={48} className="mb-4 text-slate-300" />
                        <p className="text-lg font-medium">لا يوجد مستخدمين</p>
                        <p className="text-sm">لم يتم العثور على أي مستخدمين مطابقين</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase tracking-wider">الاسم</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase tracking-wider">البريد الإلكتروني</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase tracking-wider">الدور</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase tracking-wider">الحالة</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase tracking-wider">تاريخ الانضمام</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase tracking-wider">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.map((user) => (
                                    <tr key={`${user.role}-${user.id}`} className="hover:bg-slate-50/50 transition-colors">
                                        {/* Name with Avatar */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-shibl-crimson to-red-700 flex items-center justify-center text-white font-bold text-sm">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <span className="font-semibold text-charcoal">{user.name}</span>
                                            </div>
                                        </td>

                                        {/* Email */}
                                        <td className="px-6 py-4 text-sm text-slate-grey">{user.email}</td>

                                        {/* Role Badge */}
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${roleConfig[user.role].bgColor} ${roleConfig[user.role].textColor}`}>
                                                {roleConfig[user.role].label}
                                            </span>
                                        </td>

                                        {/* Status Badge */}
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${statusConfig[user.status].bgColor} ${statusConfig[user.status].textColor}`}>
                                                {statusConfig[user.status].label}
                                            </span>
                                        </td>

                                        {/* Date */}
                                        <td className="px-6 py-4 text-sm text-slate-grey">{formatDate(user.created_at)}</td>

                                        {/* Actions */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openViewModal(user)}
                                                    className="w-8 h-8 rounded-[8px] bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="w-8 h-8 rounded-[8px] bg-blue-100 hover:bg-blue-200 flex items-center justify-center text-blue-600 transition-colors"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteDialog(user)}
                                                    disabled={deleting === user.id}
                                                    className="w-8 h-8 rounded-[8px] bg-red-100 hover:bg-red-200 flex items-center justify-center text-red-600 transition-colors disabled:opacity-50"
                                                >
                                                    {deleting === user.id ? (
                                                        <Loader2 size={16} className="animate-spin" />
                                                    ) : (
                                                        <Trash2 size={16} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && users.length > 0 && (
                    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-sm text-slate-grey">
                            عرض {users.length} من {pagination.total}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="w-9 h-9 rounded-[8px] bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors disabled:opacity-50"
                            >
                                <ChevronRight size={18} />
                            </button>
                            {getPageNumbers().map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-9 h-9 rounded-[8px] font-semibold text-sm transition-colors ${currentPage === page
                                        ? 'bg-shibl-crimson text-white'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(pagination.lastPage, p + 1))}
                                disabled={currentPage === pagination.lastPage}
                                className="w-9 h-9 rounded-[8px] bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors disabled:opacity-50"
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
                message={`هل أنت متأكد من حذف "${deleteDialog.user?.name || ''}"؟ لا يمكن التراجع عن هذا الإجراء.`}
                confirmText="حذف"
                cancelText="إلغاء"
                type="danger"
                isLoading={deleting === deleteDialog.user?.id}
            />

            {/* Edit User Modal */}
            <EditUserModal
                isOpen={editModal.isOpen}
                onClose={closeEditModal}
                onSuccess={handleEditSuccess}
                user={editModal.user}
            />

            {/* View User Modal */}
            <ViewUserModal
                isOpen={viewModal.isOpen}
                onClose={closeViewModal}
                user={viewModal.user}
                onEdit={(user) => {
                    closeViewModal();
                    openEditModal(user);
                }}
            />

            {/* Add Student Modal */}
            <AddStudentModal
                isOpen={showAddStudentModal}
                onClose={() => setShowAddStudentModal(false)}
                onSuccess={() => {
                    setShowAddStudentModal(false);
                    fetchUsers();
                }}
            />

            {/* Add Parent Modal */}
            <AddParentModal
                isOpen={showAddParentModal}
                onClose={() => setShowAddParentModal(false)}
                onSuccess={() => {
                    setShowAddParentModal(false);
                    fetchUsers();
                }}
            />
        </>
    );
}
