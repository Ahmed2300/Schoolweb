import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Filter,
    Users,
    UserCheck,
    Clock,
    Eye,
    Edit2,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Loader2,
    ShieldCheck
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { adminService, UserData, UserRole, UserStatus } from '../../../data/api/adminService';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EditUserModal } from '../../components/admin/EditUserModal';
import { ViewUserModal } from '../../components/admin/ViewUserModal';
import { AddStudentModal } from '../../components/admin/AddStudentModal';

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

const roleConfig: Record<UserRole, { label: string; bgColor: string; textColor: string; borderColor: string }> = {
    student: {
        label: 'طالب',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200'
    },
    parent: {
        label: 'ولي أمر',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200'
    },
    teacher: {
        label: 'مدرس',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-700',
        borderColor: 'border-purple-200'
    },
};

const statusConfig: Record<UserStatus, { label: string; bgColor: string; textColor: string; icon: any }> = {
    active: {
        label: 'نشط',
        bgColor: 'bg-green-100/50',
        textColor: 'text-green-700',
        icon: UserCheck
    },
    inactive: {
        label: 'غير نشط',
        bgColor: 'bg-slate-100',
        textColor: 'text-slate-500',
        icon: Clock
    },
    'on-leave': {
        label: 'في إجازة',
        bgColor: 'bg-amber-100/50',
        textColor: 'text-amber-700',
        icon: Clock
    },
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
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<FilterTab>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage] = useState(10);
    const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1); // Reset to first page on search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Reset page when tab changes
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    // Query for Users
    const {
        data: usersData,
        isLoading: isUsersLoading,
        isFetching: isUsersFetching,
        isError: isUsersError,
        error: usersError,
        refetch: refetchUsers
    } = useQuery({
        queryKey: ['admin-users', activeTab, currentPage, perPage, debouncedSearch],
        queryFn: async () => {
            const params = {
                page: currentPage,
                per_page: perPage,
                search: debouncedSearch || undefined,
            };

            if (activeTab === 'all') {
                return adminService.getStudentsAndParents(params);
            } else if (activeTab === 'students') {
                const response = await adminService.getStudents(params);
                return {
                    users: response.data,
                    stats: {
                        totalStudents: response.meta.total,
                        totalParents: 0,
                        total: response.meta.total
                    },
                    meta: response.meta
                };
            } else { // parents
                const response = await adminService.getParents(params);
                return {
                    users: response.data,
                    stats: {
                        totalStudents: 0,
                        totalParents: response.meta.total,
                        total: response.meta.total
                    },
                    meta: response.meta
                };
            }
        },
        placeholderData: (previousData) => previousData, // Keep previous data while fetching new data (smart loading)
    });

    // Derived state
    const users = usersData?.users || [];
    const rawStats = usersData?.stats || { total: 0, totalStudents: 0, totalParents: 0 };
    const stats = {
        totalUsers: rawStats.total,
        totalStudents: rawStats.totalStudents,
        totalParents: rawStats.totalParents
    };

    // Handle meta for pagination
    const pagination = usersData && 'meta' in usersData ? (usersData as any).meta : {
        currentPage: 1, lastPage: 1, total: stats.totalUsers
    };

    const totalItems = pagination.total;
    const lastPage = pagination.last_page || pagination.lastPage || 1;
    const currentP = pagination.current_page || pagination.currentPage || 1;

    // Loading and error states
    const showSkeleton = isUsersLoading;

    const [deleting, setDeleting] = useState<number | null>(null);

    // Dialog & Modal states
    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean;
        user: UserData | null;
    }>({ isOpen: false, user: null });

    const [editModal, setEditModal] = useState<{
        isOpen: boolean;
        user: UserData | null;
    }>({ isOpen: false, user: null });

    const [viewModal, setViewModal] = useState<{
        isOpen: boolean;
        user: UserData | null;
    }>({ isOpen: false, user: null });

    const [showAddStudentModal, setShowAddStudentModal] = useState(false);

    // Handlers
    const openDeleteDialog = (user: UserData) => setDeleteDialog({ isOpen: true, user });
    const closeDeleteDialog = () => setDeleteDialog({ isOpen: false, user: null });
    const openEditModal = (user: UserData) => setEditModal({ isOpen: true, user });
    const closeEditModal = () => setEditModal({ isOpen: false, user: null });
    const handleEditSuccess = () => refetchUsers();
    const openViewModal = (user: UserData) => setViewModal({ isOpen: true, user });
    const closeViewModal = () => setViewModal({ isOpen: false, user: null });

    const handleConfirmDelete = async () => {
        const user = deleteDialog.user;
        if (!user) return;

        setDeleting(user.id);
        try {
            await adminService.deleteUser(user.role, user.id);
            refetchUsers();
            closeDeleteDialog();
        } catch (err: any) {
            console.error('Error deleting user:', err);
        } finally {
            setDeleting(null);
        }
    };

    const getPageNumbers = () => {
        const pages: number[] = [];
        const maxPages = 5;
        let start = Math.max(1, currentPage - Math.floor(maxPages / 2));
        const end = Math.min(lastPage, start + maxPages - 1);

        if (end - start + 1 < maxPages) {
            start = Math.max(1, end - maxPages + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    // Enhanced Stats Display
    const statsDisplay = [
        {
            icon: Users,
            label: 'إجمالي المستخدمين',
            value: stats.totalUsers.toLocaleString('ar-EG'),
            gradient: 'from-[#AF0C15] to-[#E11D48]', // Shibl Crimson -> Rose
            iconColor: 'text-white',
            bgOpacity: 'bg-opacity-100'
        },
        {
            icon: UserCheck,
            label: 'الطلاب',
            value: stats.totalStudents.toLocaleString('ar-EG'),
            gradient: 'from-blue-500 to-blue-600',
            iconColor: 'text-white',
            bgOpacity: 'bg-opacity-100'
        },
        {
            icon: ShieldCheck,
            label: 'أولياء الأمور',
            value: stats.totalParents.toLocaleString('ar-EG'),
            gradient: 'from-emerald-500 to-emerald-600',
            iconColor: 'text-white',
            bgOpacity: 'bg-opacity-100'
        },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-l from-shibl-crimson to-rose-600">
                        إدارة المستخدمين
                    </h1>
                    <p className="text-slate-grey text-sm mt-1">إدارة حسابات الطلاب وأولياء الأمور والمشرفين</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowAddStudentModal(true)}
                        className="h-11 px-6 rounded-full bg-gradient-to-r from-shibl-crimson to-[#8B0A11] hover:shadow-lg hover:shadow-shibl-crimson/30 text-white font-bold text-sm transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2"
                    >
                        <UserCheck size={18} />
                        <span>إضافة مستخدم جديد</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {statsDisplay.map((stat, index) => (
                    <div key={index} className="relative overflow-hidden bg-white rounded-[20px] p-6 shadow-sm border border-slate-100 group hover:shadow-md transition-all duration-300">
                        <div className="flex items-center justify-between relative z-10">
                            <div>
                                <p className="text-slate-500 text-sm font-medium mb-1">{stat.label}</p>
                                <h3 className="text-3xl font-bold text-charcoal">{stat.value}</h3>
                            </div>
                            <div className={`w-12 h-12 rounded-[14px] bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg shadow-gray-200 transform group-hover:scale-110 transition-transform duration-300`}>
                                <stat.icon className="text-white" size={24} />
                            </div>
                        </div>
                        {/* Decorative background blob */}
                        <div className={`absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`} />
                    </div>
                ))}
            </div>

            {/* Controls Bar */}
            <div className="bg-white rounded-[16px] p-4 shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-4 items-center justify-between">

                {/* Search */}
                <div className="relative w-full lg:w-96 group">
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-slate-400 group-focus-within:text-shibl-crimson transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="بحث بالاسم أو البريد الإلكتروني..."
                        className="w-full h-11 pr-10 pl-4 bg-slate-50 border-transparent focus:bg-white border focus:border-shibl-crimson/20 rounded-[12px] text-sm text-charcoal shadow-sm transition-all outline-none focus:ring-4 focus:ring-shibl-crimson/5 placeholder:text-slate-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex bg-slate-50 p-1.5 rounded-[14px] w-full lg:w-auto">
                    {filterTabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 lg:flex-initial px-6 py-2 rounded-[10px] text-sm font-bold transition-all duration-200 ${activeTab === tab.key
                                ? 'bg-white text-shibl-crimson shadow-sm ring-1 ring-black/5'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                    <button className="px-3 text-slate-400 hover:text-slate-600 border-r border-slate-200 mr-2 pr-2">
                        <Filter size={18} />
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {isUsersError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[12px] flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    {usersError instanceof Error ? usersError.message : 'حدث خطأ أثناء تحميل البيانات'}
                </div>
            )}

            {/* Users Table */}
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 overflow-hidden">
                {showSkeleton ? (
                    /* Shimmer Skeleton Loading */
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="text-right px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">الاسم</th>
                                    <th className="text-right px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">البريد الإلكتروني</th>
                                    <th className="text-right px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">الدور</th>
                                    <th className="text-right px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">الحالة</th>
                                    <th className="text-right px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">تاريخ الانضمام</th>
                                    <th className="text-right px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {[...Array(6)].map((_, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4"><div className="w-40 h-5 bg-slate-100 rounded animate-pulse" /></td>
                                        <td className="px-6 py-4"><div className="w-32 h-4 bg-slate-100 rounded animate-pulse" /></td>
                                        <td className="px-6 py-4"><div className="w-16 h-6 bg-slate-100 rounded-full animate-pulse" /></td>
                                        <td className="px-6 py-4"><div className="w-16 h-6 bg-slate-100 rounded-full animate-pulse" /></td>
                                        <td className="px-6 py-4"><div className="w-24 h-4 bg-slate-100 rounded animate-pulse" /></td>
                                        <td className="px-6 py-4"><div className="w-20 h-8 bg-slate-100 rounded animate-pulse" /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-500">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Users size={32} className="text-slate-300" />
                        </div>
                        <p className="text-lg font-bold text-charcoal">لا يوجد مستخدمين</p>
                        <p className="text-sm text-slate-400 mt-1">لم يتم العثور على أي مستخدمين مطابقين لبحثك</p>
                    </div>
                ) : (
                    <div className={`overflow-x-auto transition-opacity duration-200 ${isUsersFetching && !isUsersLoading ? 'opacity-50' : 'opacity-100'}`}>
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100">
                                    <th className="text-right px-6 py-4 text-xs font-extrabold text-slate-grey uppercase tracking-wider">الاسم</th>
                                    <th className="text-right px-6 py-4 text-xs font-extrabold text-slate-grey uppercase tracking-wider">البريد الإلكتروني</th>
                                    <th className="text-right px-6 py-4 text-xs font-extrabold text-slate-grey uppercase tracking-wider">الدور</th>
                                    <th className="text-right px-6 py-4 text-xs font-extrabold text-slate-grey uppercase tracking-wider">الحالة</th>
                                    <th className="text-right px-6 py-4 text-xs font-extrabold text-slate-grey uppercase tracking-wider">تاريخ الانضمام</th>
                                    <th className="text-right px-6 py-4 text-xs font-extrabold text-slate-grey uppercase tracking-wider">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {users.map((user) => (
                                    <tr
                                        key={`${user.role}-${user.id}`}
                                        className="hover:bg-soft-cloud transition-colors duration-200 group"
                                    >
                                        {/* Name with Avatar */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-white shadow-sm flex items-center justify-center text-slate-600 font-bold text-sm ring-2 ring-transparent group-hover:ring-shibl-crimson/10 transition-all">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <span className="font-bold text-charcoal group-hover:text-shibl-crimson transition-colors">{user.name}</span>
                                            </div>
                                        </td>

                                        {/* Email */}
                                        <td className="px-6 py-4 text-sm font-medium text-slate-grey">{user.email}</td>

                                        {/* Role Badge */}
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${roleConfig[user.role].bgColor} ${roleConfig[user.role].textColor} ${roleConfig[user.role].borderColor}`}>
                                                {roleConfig[user.role].label}
                                            </span>
                                        </td>

                                        {/* Status Badge */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-slate-300'}`} />
                                                <span className={`text-xs font-bold ${statusConfig[user.status].textColor}`}>
                                                    {statusConfig[user.status].label}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Date */}
                                        <td className="px-6 py-4 text-sm font-medium text-slate-grey">{formatDate(user.created_at)}</td>

                                        {/* Actions */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        if (user.role === 'student') {
                                                            navigate(`/admin/users/students/${user.id}`);
                                                        } else if (user.role === 'parent') {
                                                            navigate(`/admin/users/parents/${user.id}`);
                                                        } else {
                                                            openViewModal(user);
                                                        }
                                                    }}
                                                    className="w-8 h-8 rounded-[8px] bg-slate-50 hover:bg-white hover:shadow-md border border-slate-100 hover:border-slate-200 flex items-center justify-center text-slate-500 hover:text-shibl-crimson transition-all"
                                                    title="عرض"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="w-8 h-8 rounded-[8px] bg-blue-50 hover:bg-blue-600 hover:shadow-md hover:shadow-blue-200 border border-blue-100 hover:border-blue-600 flex items-center justify-center text-blue-600 hover:text-white transition-all"
                                                    title="تعديل"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteDialog(user)}
                                                    disabled={deleting === user.id}
                                                    className="w-8 h-8 rounded-[8px] bg-red-50 hover:bg-red-600 hover:shadow-md hover:shadow-red-200 border border-red-100 hover:border-red-600 flex items-center justify-center text-red-600 hover:text-white transition-all disabled:opacity-50"
                                                    title="حذف"
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
                {!showSkeleton && users.length > 0 && (
                    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white">
                        <p className="text-sm font-medium text-slate-grey">
                            عرض {users.length} من {pagination.total}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="w-9 h-9 rounded-[10px] bg-white border border-slate-200 hover:border-shibl-crimson/50 hover:text-shibl-crimson flex items-center justify-center text-slate-500 transition-all disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-500"
                            >
                                <ChevronRight size={18} />
                            </button>
                            {getPageNumbers().map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-9 h-9 rounded-[10px] font-bold text-sm transition-all shadow-sm ${currentPage === page
                                        ? 'bg-gradient-to-br from-shibl-crimson to-[#8B0A11] text-white shadow-shibl-crimson/20'
                                        : 'bg-white border border-slate-200 text-slate-600 hover:border-shibl-crimson/50 hover:text-shibl-crimson'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(lastPage, p + 1))}
                                disabled={currentPage === lastPage}
                                className="w-9 h-9 rounded-[10px] bg-white border border-slate-200 hover:border-shibl-crimson/50 hover:text-shibl-crimson flex items-center justify-center text-slate-500 transition-all disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-500"
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
                    refetchUsers(); // Changed from fetchUsers to refetchUsers
                }}
            />
        </div>
    );
}
