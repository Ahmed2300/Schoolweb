import { useState } from 'react';
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
    DollarSign
} from 'lucide-react';
import { AddTeacherModal } from '../../components/admin/AddTeacherModal';

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
                            placeholder="بحث عن مدرس أو مدرب..."
                            className="w-full h-11 pl-4 pr-11 rounded-[12px] bg-white border border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all text-sm"
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
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-[16px] p-4 shadow-card flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-[12px] flex items-center justify-center ${stat.bgColor}`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-xs text-slate-grey font-medium">{stat.label}</p>
                            <span className="text-xl font-extrabold text-charcoal">{stat.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Teachers Tab Content */}
            {activeTab === 'teachers' && (
                <>
                    <div className="bg-white rounded-[16px] shadow-card overflow-hidden mb-6">
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
                                        <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">عدد الطلاب</th>
                                        <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الحالة</th>
                                        <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {mockTeachers.map((teacher) => (
                                        <tr key={teacher.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm">
                                                        {teacher.avatar}
                                                    </div>
                                                    <span className="font-semibold text-charcoal">{teacher.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {teacher.subjects.map((subject, idx) => (
                                                        <span key={idx} className={`px-2 py-0.5 rounded-full text-xs font-semibold ${subjectColors[subject] || 'bg-slate-100 text-slate-600'}`}>
                                                            {subject}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {teacher.grades.map((grade, idx) => (
                                                        <span key={idx} className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                                                            {grade}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-charcoal">{teacher.students}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${statusConfig[teacher.status].bgColor} ${statusConfig[teacher.status].textColor}`}>
                                                    {statusConfig[teacher.status].label}
                                                </span>
                                            </td>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {mockInstructors.map((instructor) => (
                                <div key={instructor.id} className="bg-white rounded-[16px] shadow-card overflow-hidden hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-white font-bold text-xl">
                                                    {instructor.avatar}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-charcoal text-lg">{instructor.name}</h3>
                                                    <p className="text-sm text-slate-grey">{instructor.specialty}</p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig[instructor.status].bgColor} ${statusConfig[instructor.status].textColor}`}>
                                                {statusConfig[instructor.status].label}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 mb-4 py-4 border-t border-b border-slate-100">
                                            <div className="text-center">
                                                <p className="text-xs text-slate-grey mb-1">عدد الدورات</p>
                                                <p className="font-bold text-charcoal">{instructor.courses}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs text-slate-grey mb-1">الإيرادات</p>
                                                <p className="font-bold text-green-600">{instructor.revenue}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs text-slate-grey mb-1">التقييم</p>
                                                <div className="flex items-center justify-center gap-1">
                                                    <Star size={14} className="text-amber-400 fill-amber-400" />
                                                    <span className="font-bold text-charcoal">{instructor.rating}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button className="flex-1 py-2.5 rounded-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm transition-colors flex items-center justify-center gap-1">
                                                <Eye size={16} />
                                                عرض الملف
                                            </button>
                                            <button className="py-2.5 px-4 rounded-[10px] bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors">
                                                <Edit2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Pending Requests Section */}
            <div className="bg-white rounded-[16px] shadow-card overflow-hidden">
                <button
                    onClick={() => setShowPendingRequests(!showPendingRequests)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <AlertCircle size={20} className="text-amber-600" />
                        <h2 className="font-bold text-charcoal">طلبات معلقة</h2>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                            {mockPendingRequests.length}
                        </span>
                    </div>
                    {showPendingRequests ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                </button>

                {showPendingRequests && (
                    <div className="px-6 pb-4 divide-y divide-slate-100">
                        {mockPendingRequests.map((request) => (
                            <div key={request.id} className="py-4 flex items-center justify-between gap-4">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-charcoal">{request.description}</p>
                                    <p className="text-xs text-slate-grey mt-1">من: {request.from} • {request.time}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="py-2 px-4 rounded-[10px] bg-green-100 hover:bg-green-200 text-green-700 font-semibold text-sm transition-colors flex items-center gap-1">
                                        <Check size={16} />
                                        قبول
                                    </button>
                                    <button className="py-2 px-4 rounded-[10px] bg-red-100 hover:bg-red-200 text-red-600 font-semibold text-sm transition-colors flex items-center gap-1">
                                        <X size={16} />
                                        رفض
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Teacher Modal */}
            <AddTeacherModal
                isOpen={showAddTeacherModal}
                onClose={() => setShowAddTeacherModal(false)}
                onSuccess={() => {
                    setShowAddTeacherModal(false);
                    // TODO: Refresh teachers list when connected to real data
                }}
            />
        </>
    );
}
