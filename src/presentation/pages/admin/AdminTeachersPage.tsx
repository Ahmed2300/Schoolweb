import { useState, useEffect } from 'react';
import {
    Search,
    GraduationCap,
    Lightbulb,
    Users,
    BookOpen,
    Clock,
    AlertCircle,
    Star,
    Eye,
    Edit2,
    Trash2,
    Check,
    X,
    ChevronDown,
    ChevronUp,
    DollarSign,
    Loader2
} from 'lucide-react';
import { AddTeacherModal } from '../../components/admin/AddTeacherModal';
import { EditTeacherModal } from '../../components/admin/EditTeacherModal';
import { DeleteConfirmModal } from '../../components/admin/DeleteConfirmModal';
import { adminService, UserData } from '../../../data/api/adminService';
import teacherPlaceholder from '../../../assets/images/teacher-placeholder.png';

// Types
type MainTab = 'teachers' | 'instructors';
type StaffStatus = 'active' | 'pending' | 'inactive';

interface Teacher {
    id: number;
    name: string;
    avatar: string;
    subjects: string[];
    grades: string[];
    students: number;
    status: StaffStatus;
}

interface Instructor {
    id: number;
    name: string;
    avatar: string;
    specialty: string;
    courses: number;
    revenue: string;
    rating: number;
    status: StaffStatus;
}

interface PendingRequest {
    id: number;
    type: 'content' | 'profile';
    from: string;
    description: string;
    time: string;
}

// Mock data - Teachers
const mockTeachers: Teacher[] = [
    { id: 1, name: 'أ. أمل الشحي', avatar: 'أ', subjects: ['الرياضيات', 'الفيزياء'], grades: ['الصف الأول', 'الصف الثاني'], students: 450, status: 'active' },
    { id: 2, name: 'أ. محمد سالم', avatar: 'م', subjects: ['اللغة العربية'], grades: ['الصف الثالث'], students: 320, status: 'active' },
    { id: 3, name: 'أ. سارة حسن', avatar: 'س', subjects: ['اللغة الإنجليزية', 'الرياضيات'], grades: ['الصف الأول'], students: 180, status: 'pending' },
];

// Mock data - Instructors
const mockInstructors: Instructor[] = [
    { id: 1, name: 'ليلى العلي', avatar: 'ل', specialty: 'التسويق الرقمي', courses: 8, revenue: '1200 ر.ع', rating: 4.6, status: 'active' },
    { id: 2, name: 'خالد يوسف', avatar: 'خ', specialty: 'تطوير الويب', courses: 15, revenue: '2500 ر.ع', rating: 4.8, status: 'active' },
];

// Mock data - Pending Requests
const mockPendingRequests: PendingRequest[] = [
    { id: 1, type: 'content', from: 'أحمد سمير', description: 'الموافقة على محتوى الدورة "أساسيات البرمجة"', time: 'منذ ساعتين' },
    { id: 2, type: 'profile', from: 'هدى أحمد', description: 'طلب تحديث الملف الشخصي للمعلمة', time: 'منذ 5 ساعات' },
];

const stats = [
    { icon: <GraduationCap size={22} className="text-blue-600" />, label: 'مجموع المدرسين', value: '124', bgColor: 'bg-blue-50' },
    { icon: <Lightbulb size={22} className="text-green-600" />, label: 'مجموع المدربين', value: '56', bgColor: 'bg-green-50' },
    { icon: <BookOpen size={22} className="text-purple-600" />, label: 'الدروس النشطة', value: '312', bgColor: 'bg-purple-50' },
    { icon: <AlertCircle size={22} className="text-amber-600" />, label: 'طلبات قيد الانتظار', value: '18', bgColor: 'bg-amber-50' },
];

const statusConfig: Record<StaffStatus, { label: string; bgColor: string; textColor: string }> = {
    active: { label: 'نشط', bgColor: 'bg-green-100', textColor: 'text-green-700' },
    pending: { label: 'قيد المراجعة', bgColor: 'bg-amber-100', textColor: 'text-amber-700' },
    inactive: { label: 'غير نشط', bgColor: 'bg-slate-100', textColor: 'text-slate-500' },
};

const subjectColors: Record<string, string> = {
    'الرياضيات': 'bg-blue-100 text-blue-700',
    'الفيزياء': 'bg-purple-100 text-purple-700',
    'اللغة العربية': 'bg-emerald-100 text-emerald-700',
    'اللغة الإنجليزية': 'bg-pink-100 text-pink-700',
};

export function AdminTeachersPage() {
    const [activeTab, setActiveTab] = useState<MainTab>('teachers');
    const [searchQuery, setSearchQuery] = useState('');
    const [showPendingRequests, setShowPendingRequests] = useState(true);
    const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
    const [showEditTeacherModal, setShowEditTeacherModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<UserData | null>(null);
    const [teacherToDelete, setTeacherToDelete] = useState<UserData | null>(null);

    // Data fetching states
    const [teachers, setTeachers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({
        totalTeachers: 0,
        totalInstructors: 0,
        activeLessons: 0,
        pendingRequests: 0,
    });

    // Fetch teachers from backend
    const fetchTeachers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminService.getTeachers({ per_page: 100 });
            setTeachers(response.data);
            // Calculate stats based on teacher type
            const academicTeachers = response.data.filter((t: UserData) => t.type === 'teacher' || t.is_academic === undefined || t.is_academic === true);
            const instructors = response.data.filter((t: UserData) => t.type === 'instructor' || t.is_academic === false);
            setStats(prev => ({
                ...prev,
                totalTeachers: academicTeachers.length,
                totalInstructors: instructors.length,
            }));
        } catch (err) {
            console.error('Error fetching teachers:', err);
            setError('فشل في تحميل بيانات المدرسين');
        } finally {
            setLoading(false);
        }
    };

    // Fetch on mount
    useEffect(() => {
        fetchTeachers();
    }, []);

    // Handle delete teacher
    const handleDeleteTeacher = async (): Promise<void> => {
        if (!teacherToDelete) return;
        await adminService.deleteTeacher(teacherToDelete.id);
        fetchTeachers(); // Refresh list
    };

    // Open delete modal
    const openDeleteModal = (teacher: UserData) => {
        setTeacherToDelete(teacher);
        setShowDeleteModal(true);
    };

    // Close delete modal
    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setTeacherToDelete(null);
    };

    // Filter teachers based on search and type (is_academic)
    const filteredTeachers = teachers.filter(teacher => {
        const matchesSearch = teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            teacher.email.toLowerCase().includes(searchQuery.toLowerCase());

        // Filter by type: teachers tab shows academic (is_academic=true), instructors tab shows non-academic
        const matchesType = activeTab === 'teachers'
            ? teacher.type === 'teacher' || teacher.is_academic === undefined || teacher.is_academic === true
            : teacher.type === 'instructor' || teacher.is_academic === false;

        return matchesSearch && matchesType;
    });

    const statsDisplay = [
        { icon: <GraduationCap size={24} className="text-blue-600" />, label: 'مجموع المدرسين', value: String(stats.totalTeachers), bgColor: 'bg-blue-50' },
        { icon: <Lightbulb size={24} className="text-green-600" />, label: 'مجموع المدربين', value: String(stats.totalInstructors), bgColor: 'bg-green-50' },
        { icon: <BookOpen size={24} className="text-purple-600" />, label: 'الدروس النشطة', value: String(stats.activeLessons), bgColor: 'bg-purple-50' },
        { icon: <AlertCircle size={24} className="text-amber-600" />, label: 'طلبات قيد الانتظار', value: String(stats.pendingRequests), bgColor: 'bg-amber-50' },
    ];

    return (
        <>
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <h1 className="text-2xl font-extrabold text-charcoal">إدارة المدرسين والمدربين</h1>

                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 lg:w-72">
                        <input
                            type="text"
                            placeholder="بحث باسم المدرس أو البريد الإلكتروني..."
                            className="w-full h-12 pl-4 pr-11 rounded-xl bg-white border border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all text-sm shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>

                    {/* Add Button */}
                    <button
                        onClick={() => setShowAddTeacherModal(true)}
                        className="h-11 px-6 rounded-pill bg-shibl-crimson hover:bg-shibl-crimson-dark text-white font-bold text-sm shadow-crimson transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2"
                    >
                        <GraduationCap size={18} />
                        <span>إضافة مدرس/مدرب</span>
                    </button>
                </div>
            </div>

            {/* Main Tabs - Teachers vs Instructors */}
            <div className="flex gap-3 mb-6">
                <button
                    onClick={() => setActiveTab('teachers')}
                    className={`flex items-center gap-3 px-6 py-3.5 rounded-[16px] font-bold text-sm transition-all duration-300 ${activeTab === 'teachers'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                        : 'bg-white text-slate-600 hover:bg-blue-50 border border-slate-200'
                        }`}
                >
                    <GraduationCap size={20} />
                    <span>المدرسون</span>
                </button>
                <button
                    onClick={() => setActiveTab('instructors')}
                    className={`flex items-center gap-3 px-6 py-3.5 rounded-[16px] font-bold text-sm transition-all duration-300 ${activeTab === 'instructors'
                        ? 'bg-green-600 text-white shadow-lg shadow-green-600/25'
                        : 'bg-white text-slate-600 hover:bg-green-50 border border-slate-200'
                        }`}
                >
                    <Lightbulb size={20} />
                    <span>المدربون</span>
                </button>
            </div>

            {/* Stats Mini Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {statsDisplay.map((stat, index) => (
                    <div key={index} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow duration-300">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${stat.bgColor}`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium mb-1">{stat.label}</p>
                            <span className="text-3xl font-bold text-slate-800">{stat.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Teachers Tab Content */}
            {activeTab === 'teachers' && (
                <>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                            <GraduationCap size={20} className="text-blue-600" />
                            <h2 className="font-bold text-charcoal">المدرسون</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">المعلم</th>
                                        <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">المواد الدراسية</th>
                                        <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الصفوف الدراسية</th>
                                        <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الدورات</th>
                                        <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الحالة</th>
                                        <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        /* Shimmer Skeleton Loading */
                                        [...Array(5)].map((_, index) => (
                                            <tr key={index}>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" />
                                                        <div className="space-y-2">
                                                            <div className="h-4 w-28 rounded-md bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${index * 100}ms` }} />
                                                            <div className="h-3 w-36 rounded-md bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${index * 100 + 50}ms` }} />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="h-4 w-20 rounded-md bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${index * 100 + 100}ms` }} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="h-4 w-16 rounded-md bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${index * 100 + 150}ms` }} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="h-4 w-10 rounded-md bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${index * 100 + 200}ms` }} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="h-6 w-14 rounded-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${index * 100 + 250}ms` }} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${index * 100 + 300}ms` }} />
                                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${index * 100 + 350}ms` }} />
                                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${index * 100 + 400}ms` }} />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : error ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-16 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <AlertCircle size={40} className="text-red-500" />
                                                    <p className="text-red-600">{error}</p>
                                                    <button
                                                        onClick={fetchTeachers}
                                                        className="px-6 py-2 bg-shibl-crimson text-white rounded-pill font-semibold hover:bg-shibl-crimson-dark transition-colors"
                                                    >
                                                        إعادة المحاولة
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredTeachers.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-16 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <GraduationCap size={40} className="text-slate-400" />
                                                    <p className="text-slate-600">
                                                        {searchQuery ? 'لا توجد نتائج للبحث' : 'لا يوجد مدرسون بعد'}
                                                    </p>
                                                    {!searchQuery && (
                                                        <button
                                                            onClick={() => setShowAddTeacherModal(true)}
                                                            className="px-6 py-2 bg-shibl-crimson text-white rounded-pill font-semibold hover:bg-shibl-crimson-dark transition-colors"
                                                        >
                                                            إضافة أول مدرس
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredTeachers.map((teacher) => (
                                            <tr key={teacher.id} className="hover:bg-slate-50/80 transition-colors group">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-4">
                                                        {/* Profile Image or Placeholder */}
                                                        {teacher.image_path && !teacher.image_path.includes('default.jpg') ? (
                                                            <img
                                                                src={teacher.image_path}
                                                                alt={teacher.name}
                                                                className="w-10 h-10 rounded-full object-cover border-2 border-slate-200"
                                                            />
                                                        ) : (
                                                            <img
                                                                src={teacherPlaceholder}
                                                                alt={teacher.name}
                                                                className="w-10 h-10 rounded-full object-cover border-2 border-slate-200"
                                                            />
                                                        )}
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-slate-800 text-base">{teacher.name}</span>
                                                            </div>
                                                            <span className="text-xs text-slate-400 mt-0.5">{teacher.email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    {/* Subjects from backend */}
                                                    {teacher.subjects && teacher.subjects.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {teacher.subjects.slice(0, 2).map((subject: string, idx: number) => (
                                                                <span
                                                                    key={idx}
                                                                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${subjectColors[subject] || 'bg-slate-100 text-slate-600'
                                                                        }`}
                                                                >
                                                                    {subject}
                                                                </span>
                                                            ))}
                                                            {teacher.subjects.length > 2 && (
                                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
                                                                    +{teacher.subjects.length - 2}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-slate-300 font-light">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5">
                                                    {/* Grades from backend */}
                                                    {teacher.grades && teacher.grades.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {teacher.grades.slice(0, 2).map((grade: string, idx: number) => (
                                                                <span key={idx} className="text-xs text-slate-600 bg-slate-50 px-2 py-0.5 rounded">
                                                                    {grade}
                                                                </span>
                                                            ))}
                                                            {teacher.grades.length > 2 && (
                                                                <span className="text-xs text-slate-400">+{teacher.grades.length - 2}</span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-slate-300 font-light">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5">
                                                    {/* Courses count from backend */}
                                                    <div className="flex items-center gap-2">
                                                        <BookOpen size={16} className="text-slate-400" />
                                                        <span className="font-semibold text-charcoal">
                                                            {teacher.courses_count ?? teacher.courses?.length ?? 0}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${teacher.status === 'active'
                                                        ? 'bg-green-100 text-green-700'
                                                        : teacher.status === 'on-leave'
                                                            ? 'bg-amber-100 text-amber-700'
                                                            : 'bg-slate-100 text-slate-500'
                                                        }`}>
                                                        {teacher.status === 'active' ? 'نشط' : teacher.status === 'on-leave' ? 'في إجازة' : 'غير نشط'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                                                            title="عرض الملف"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedTeacher(teacher);
                                                                setShowEditTeacherModal(true);
                                                            }}
                                                            className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 flex items-center justify-center transition-all duration-200"
                                                            title="تعديل"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => openDeleteModal(teacher)}
                                                            className="w-9 h-9 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-all duration-200"
                                                            title="حذف"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Instructors Tab Content */}
            {activeTab === 'instructors' && (
                <>
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Lightbulb size={20} className="text-green-600" />
                            <h2 className="font-bold text-charcoal">المدربون</h2>
                        </div>

                        {loading ? (
                            /* Loading Skeleton for Instructors */
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(3)].map((_, index) => (
                                    <div key={index} className="bg-white rounded-[16px] shadow-card p-6">
                                        <div className="flex items-start gap-3 mb-4">
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-5 w-28 rounded-md bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" />
                                                <div className="h-4 w-20 rounded-md bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-slate-100">
                                            {[...Array(3)].map((_, i) => (
                                                <div key={i} className="text-center">
                                                    <div className="h-3 w-12 mx-auto rounded-md bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%] mb-2" />
                                                    <div className="h-5 w-8 mx-auto rounded-md bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:200%_100%]" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            /* Error State */
                            <div className="bg-white rounded-[16px] shadow-card p-12 text-center">
                                <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
                                <p className="text-red-600 mb-4">{error}</p>
                                <button
                                    onClick={fetchTeachers}
                                    className="px-6 py-2 bg-shibl-crimson text-white rounded-pill font-semibold hover:bg-shibl-crimson-dark transition-colors"
                                >
                                    إعادة المحاولة
                                </button>
                            </div>
                        ) : filteredTeachers.length === 0 ? (
                            /* Empty State */
                            <div className="bg-white rounded-[16px] shadow-card p-12 text-center">
                                <Lightbulb size={40} className="text-slate-400 mx-auto mb-4" />
                                <p className="text-slate-600 mb-4">
                                    {searchQuery ? 'لا توجد نتائج للبحث' : 'لا يوجد مدربون بعد'}
                                </p>
                                {!searchQuery && (
                                    <button
                                        onClick={() => setShowAddTeacherModal(true)}
                                        className="px-6 py-2 bg-shibl-crimson text-white rounded-pill font-semibold hover:bg-shibl-crimson-dark transition-colors"
                                    >
                                        إضافة أول مدرب
                                    </button>
                                )}
                            </div>
                        ) : (
                            /* Instructors Grid */
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredTeachers.map((instructor) => (
                                    <div key={instructor.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                                        <div className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    {instructor.image_path && !instructor.image_path.includes('default.jpg') ? (
                                                        <img
                                                            src={instructor.image_path}
                                                            alt={instructor.name}
                                                            className="w-14 h-14 rounded-full object-cover border-2 border-green-200"
                                                        />
                                                    ) : (
                                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-white font-bold text-xl">
                                                            {instructor.name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h3 className="font-bold text-charcoal text-lg">{instructor.name}</h3>
                                                        <p className="text-sm text-slate-grey">{instructor.specialization || 'مدرب مهارات'}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${instructor.status === 'active'
                                                    ? 'bg-green-100 text-green-700'
                                                    : instructor.status === 'on-leave'
                                                        ? 'bg-amber-100 text-amber-700'
                                                        : 'bg-slate-100 text-slate-500'
                                                    }`}>
                                                    {instructor.status === 'active' ? 'نشط' : instructor.status === 'on-leave' ? 'في إجازة' : 'غير نشط'}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4 mb-4 py-4 border-t border-b border-slate-100">
                                                <div className="text-center">
                                                    <p className="text-xs text-slate-grey mb-1">عدد الدورات</p>
                                                    <p className="font-bold text-charcoal">{instructor.courses_count ?? instructor.courses?.length ?? 0}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-slate-grey mb-1">الرصيد</p>
                                                    <p className="font-bold text-green-600">{instructor.balance || '0'} ر.ع</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-slate-grey mb-1">البريد</p>
                                                    <p className="font-bold text-charcoal text-xs truncate" title={instructor.email}>
                                                        {instructor.email.split('@')[0]}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button className="flex-1 py-2.5 rounded-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm transition-colors flex items-center justify-center gap-1">
                                                    <Eye size={16} />
                                                    عرض الملف
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedTeacher(instructor);
                                                        setShowEditTeacherModal(true);
                                                    }}
                                                    className="py-2.5 px-4 rounded-[10px] bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(instructor)}
                                                    className="py-2.5 px-4 rounded-[10px] bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )
            }


            {/* Add Teacher Modal */}
            <AddTeacherModal
                isOpen={showAddTeacherModal}
                onClose={() => setShowAddTeacherModal(false)}
                onSuccess={() => {
                    setShowAddTeacherModal(false);
                    fetchTeachers(); // Refresh teachers list
                }}
            />

            {/* Edit Teacher Modal */}
            <EditTeacherModal
                isOpen={showEditTeacherModal}
                teacher={selectedTeacher}
                onClose={() => {
                    setShowEditTeacherModal(false);
                    setSelectedTeacher(null);
                }}
                onSuccess={() => {
                    setShowEditTeacherModal(false);
                    setSelectedTeacher(null);
                    fetchTeachers(); // Refresh teachers list
                }}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={showDeleteModal}
                title={`حذف ${teacherToDelete?.is_academic === false ? 'مدرب' : 'مدرس'}`}
                message={`هل أنت متأكد من حذف ${teacherToDelete?.is_academic === false ? 'المدرب' : 'المدرس'} "${teacherToDelete?.name || ''}"؟ سيتم حذف جميع البيانات المرتبطة به ولا يمكن التراجع عن هذا الإجراء.`}
                itemName={teacherToDelete?.name}
                onConfirm={handleDeleteTeacher}
                onClose={closeDeleteModal}
            />
        </>
    );
}
