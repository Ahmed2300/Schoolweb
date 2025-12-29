import { useState } from 'react';
import {
    Search,
    Filter,
    UserPlus,
    Users,
    UserCheck,
    Clock,
    AlertCircle,
    Eye,
    Edit2,
    Trash2,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

// Types
type UserRole = 'student' | 'parent' | 'teacher';
type UserStatus = 'active' | 'inactive';
type FilterTab = 'all' | 'students' | 'parents' | 'teachers';

interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    joinedDate: string;
    avatar?: string;
}

// Mock data
const mockUsers: User[] = [
    { id: 1, name: 'أحمد علي', email: 'ahmed.ali@example.com', role: 'student', status: 'active', joinedDate: '15 أكتوبر 2023' },
    { id: 2, name: 'فاطمة حسن', email: 'fatima.hassan@example.com', role: 'parent', status: 'active', joinedDate: '10 سبتمبر 2023' },
    { id: 3, name: 'محمد إبراهيم', email: 'mohamed.ibrahim@example.com', role: 'teacher', status: 'active', joinedDate: '5 أغسطس 2023' },
    { id: 4, name: 'نور الهدى', email: 'nour.elhuda@example.com', role: 'student', status: 'inactive', joinedDate: '20 يوليو 2023' },
    { id: 5, name: 'يوسف أحمد', email: 'youssef.ahmed@example.com', role: 'teacher', status: 'active', joinedDate: '12 يونيو 2023' },
    { id: 6, name: 'مريم خالد', email: 'mariam.khaled@example.com', role: 'parent', status: 'active', joinedDate: '1 مايو 2023' },
];

const stats = [
    { icon: <Users size={22} className="text-shibl-crimson" />, label: 'إجمالي المستخدمين', value: '2,540', trend: '+12%', trendPositive: true, bgColor: 'bg-red-50' },
    { icon: <UserCheck size={22} className="text-green-600" />, label: 'نشط اليوم', value: '450', trend: '', trendPositive: true, bgColor: 'bg-green-50' },
    { icon: <Clock size={22} className="text-blue-600" />, label: 'جديد هذا الأسبوع', value: '120', trend: '+5%', trendPositive: true, bgColor: 'bg-blue-50' },
    { icon: <AlertCircle size={22} className="text-amber-600" />, label: 'بانتظار التحقق', value: '35', trend: '+', trendPositive: false, bgColor: 'bg-amber-50' },
];

const filterTabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'الكل' },
    { key: 'students', label: 'الطلاب' },
    { key: 'parents', label: 'أولياء الأمور' },
    { key: 'teachers', label: 'المدرسين' },
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

export function AdminUsersPage() {
    const [activeTab, setActiveTab] = useState<FilterTab>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Filter users based on tab
    const filteredUsers = mockUsers.filter(user => {
        if (activeTab === 'all') return true;
        if (activeTab === 'students') return user.role === 'student';
        if (activeTab === 'parents') return user.role === 'parent';
        if (activeTab === 'teachers') return user.role === 'teacher';
        return true;
    });

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

                    {/* Add User Button */}
                    <button className="h-11 px-6 rounded-pill bg-shibl-crimson hover:bg-shibl-crimson-dark text-white font-bold text-sm shadow-crimson transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2">
                        <UserPlus size={18} />
                        <span>إضافة مستخدم</span>
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
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-[16px] p-4 shadow-card flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-[12px] flex items-center justify-center ${stat.bgColor}`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-xs text-slate-grey font-medium">{stat.label}</p>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-extrabold text-charcoal">{stat.value}</span>
                                {stat.trend && (
                                    <span className={`text-xs font-semibold ${stat.trendPositive ? 'text-success-green' : 'text-amber-500'}`}>
                                        {stat.trend}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-[16px] shadow-card overflow-hidden">
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
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
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
                                    <td className="px-6 py-4 text-sm text-slate-grey">{user.joinedDate}</td>

                                    {/* Actions */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button className="w-8 h-8 rounded-[8px] bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors">
                                                <Eye size={16} />
                                            </button>
                                            <button className="w-8 h-8 rounded-[8px] bg-blue-100 hover:bg-blue-200 flex items-center justify-center text-blue-600 transition-colors">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="w-8 h-8 rounded-[8px] bg-red-100 hover:bg-red-200 flex items-center justify-center text-red-600 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-sm text-slate-grey">عرض 10 من 250</p>
                    <div className="flex items-center gap-2">
                        <button className="w-9 h-9 rounded-[8px] bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors">
                            <ChevronRight size={18} />
                        </button>
                        {[1, 2, 3, 4, 5].map(page => (
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
                        <button className="w-9 h-9 rounded-[8px] bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors">
                            <ChevronLeft size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
