import { useState } from 'react';
import {
    Search,
    Filter,
    Plus,
    BookOpen,
    GraduationCap,
    Lightbulb,
    Users,
    PlayCircle,
    Star,
    Eye,
    Edit2,
    Trash2,
    ChevronLeft,
    ChevronRight,
    ChevronDown
} from 'lucide-react';

// Types
type CourseType = 'academic' | 'skills';
type CourseStatus = 'active' | 'draft' | 'archived';
type MainTab = 'academic' | 'skills';

interface AcademicCourse {
    id: number;
    subject: string;
    grade: string;
    term: string;
    teacher: string;
    students: number;
    lessons: number;
    status: CourseStatus;
}

interface SkillsCourse {
    id: number;
    title: string;
    category: string;
    instructor: string;
    students: number;
    lessons: number;
    price: string;
    rating: number;
    status: CourseStatus;
    thumbnail?: string;
}

// Mock data - Academic courses
const academicCourses: AcademicCourse[] = [
    { id: 1, subject: 'الرياضيات', grade: 'الصف الأول الإعدادي', term: 'الترم الأول', teacher: 'أحمد محمد', students: 245, lessons: 32, status: 'active' },
    { id: 2, subject: 'اللغة العربية', grade: 'الصف الأول الإعدادي', term: 'الترم الأول', teacher: 'فاطمة علي', students: 198, lessons: 28, status: 'active' },
    { id: 3, subject: 'الفيزياء', grade: 'الصف الثاني الثانوي', term: 'الترم الثاني', teacher: 'محمد إبراهيم', students: 156, lessons: 24, status: 'active' },
    { id: 4, subject: 'الكيمياء', grade: 'الصف الثالث الثانوي', term: 'الترم الأول', teacher: 'نور الهدى', students: 0, lessons: 12, status: 'draft' },
];

// Mock data - Skills courses
const skillsCourses: SkillsCourse[] = [
    { id: 1, title: 'تجويد القرآن الكريم', category: 'القرآن', instructor: 'الشيخ أحمد', students: 520, lessons: 45, price: '25 ر.ع', rating: 4.9, status: 'active' },
    { id: 2, title: 'أحكام الفقه الإسلامي', category: 'الفقه', instructor: 'الشيخ محمد', students: 340, lessons: 30, price: '20 ر.ع', rating: 4.8, status: 'active' },
    { id: 3, title: 'أساسيات البرمجة', category: 'البرمجة', instructor: 'م. سارة', students: 180, lessons: 25, price: '35 ر.ع', rating: 4.7, status: 'active' },
    { id: 4, title: 'اللغة الإنجليزية للمبتدئين', category: 'اللغات', instructor: 'أ. ليلى', students: 0, lessons: 15, price: '30 ر.ع', rating: 0, status: 'draft' },
];

const skillsCategories = ['الكل', 'القرآن', 'الفقه', 'البرمجة', 'اللغات'];

const stats = [
    { icon: <GraduationCap size={22} className="text-blue-600" />, label: 'كورسات أكاديمية', value: '48', bgColor: 'bg-blue-50' },
    { icon: <Lightbulb size={22} className="text-green-600" />, label: 'كورسات مهارات', value: '24', bgColor: 'bg-green-50' },
    { icon: <Users size={22} className="text-shibl-crimson" />, label: 'إجمالي المسجلين', value: '3,240', bgColor: 'bg-red-50' },
    { icon: <PlayCircle size={22} className="text-purple-600" />, label: 'إجمالي الدروس', value: '856', bgColor: 'bg-purple-50' },
];

const statusConfig: Record<CourseStatus, { label: string; bgColor: string; textColor: string }> = {
    active: { label: 'نشط', bgColor: 'bg-green-100', textColor: 'text-green-700' },
    draft: { label: 'مسودة', bgColor: 'bg-amber-100', textColor: 'text-amber-700' },
    archived: { label: 'مؤرشف', bgColor: 'bg-slate-100', textColor: 'text-slate-500' },
};

const categoryColors: Record<string, string> = {
    'القرآن': 'bg-emerald-100 text-emerald-700',
    'الفقه': 'bg-teal-100 text-teal-700',
    'البرمجة': 'bg-blue-100 text-blue-700',
    'اللغات': 'bg-purple-100 text-purple-700',
};

export function AdminCoursesPage() {
    const [activeTab, setActiveTab] = useState<MainTab>('academic');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('الكل');
    const [selectedGrade, setSelectedGrade] = useState('الكل');
    const [selectedTerm, setSelectedTerm] = useState('الكل');

    return (
        <>
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <h1 className="text-2xl font-extrabold text-charcoal">إدارة الكورسات</h1>

                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 lg:w-72">
                        <input
                            type="text"
                            placeholder="بحث في الكورسات..."
                            className="w-full h-11 pl-4 pr-11 rounded-[12px] bg-white border border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>

                    {/* Add Course Button */}
                    <button className="h-11 px-6 rounded-pill bg-shibl-crimson hover:bg-shibl-crimson-dark text-white font-bold text-sm shadow-crimson transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2">
                        <Plus size={18} />
                        <span>إضافة كورس</span>
                    </button>
                </div>
            </div>

            {/* Main Tabs - Academic vs Skills */}
            <div className="flex gap-3 mb-6">
                <button
                    onClick={() => setActiveTab('academic')}
                    className={`flex items-center gap-3 px-6 py-3.5 rounded-[16px] font-bold text-sm transition-all duration-300 ${activeTab === 'academic'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                        : 'bg-white text-slate-600 hover:bg-blue-50 border border-slate-200'
                        }`}
                >
                    <GraduationCap size={20} />
                    <span>الشق الأكاديمي</span>
                </button>
                <button
                    onClick={() => setActiveTab('skills')}
                    className={`flex items-center gap-3 px-6 py-3.5 rounded-[16px] font-bold text-sm transition-all duration-300 ${activeTab === 'skills'
                        ? 'bg-green-600 text-white shadow-lg shadow-green-600/25'
                        : 'bg-white text-slate-600 hover:bg-green-50 border border-slate-200'
                        }`}
                >
                    <Lightbulb size={20} />
                    <span>الشق غير الأكاديمي</span>
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

            {/* Academic Tab Content */}
            {activeTab === 'academic' && (
                <>
                    {/* Filters */}
                    <div className="flex gap-3 mb-6">
                        <div className="relative">
                            <select
                                value={selectedGrade}
                                onChange={(e) => setSelectedGrade(e.target.value)}
                                className="h-11 pl-10 pr-4 rounded-[12px] bg-white border border-slate-200 text-sm font-medium text-charcoal appearance-none cursor-pointer focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none"
                            >
                                <option value="الكل">كل الصفوف</option>
                                <option value="الصف الأول الإعدادي">الصف الأول الإعدادي</option>
                                <option value="الصف الثاني الثانوي">الصف الثاني الثانوي</option>
                                <option value="الصف الثالث الثانوي">الصف الثالث الثانوي</option>
                            </select>
                            <ChevronDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                        <div className="relative">
                            <select
                                value={selectedTerm}
                                onChange={(e) => setSelectedTerm(e.target.value)}
                                className="h-11 pl-10 pr-4 rounded-[12px] bg-white border border-slate-200 text-sm font-medium text-charcoal appearance-none cursor-pointer focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none"
                            >
                                <option value="الكل">كل الترمات</option>
                                <option value="الترم الأول">الترم الأول</option>
                                <option value="الترم الثاني">الترم الثاني</option>
                            </select>
                            <ChevronDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Academic Courses Table */}
                    <div className="bg-white rounded-[16px] shadow-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">المادة</th>
                                        <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الصف</th>
                                        <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الترم</th>
                                        <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">المدرس</th>
                                        <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الطلاب</th>
                                        <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الدروس</th>
                                        <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الحالة</th>
                                        <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {academicCourses.map((course) => (
                                        <tr key={course.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-[12px] bg-blue-100 flex items-center justify-center">
                                                        <BookOpen size={18} className="text-blue-600" />
                                                    </div>
                                                    <span className="font-semibold text-charcoal">{course.subject}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-grey">{course.grade}</td>
                                            <td className="px-6 py-4 text-sm text-slate-grey">{course.term}</td>
                                            <td className="px-6 py-4 text-sm text-charcoal font-medium">{course.teacher}</td>
                                            <td className="px-6 py-4 text-sm text-charcoal font-semibold">{course.students}</td>
                                            <td className="px-6 py-4 text-sm text-charcoal">{course.lessons}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${statusConfig[course.status].bgColor} ${statusConfig[course.status].textColor}`}>
                                                    {statusConfig[course.status].label}
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

            {/* Skills Tab Content */}
            {activeTab === 'skills' && (
                <>
                    {/* Category Filters */}
                    <div className="flex gap-2 mb-6 flex-wrap">
                        {skillsCategories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-5 py-2.5 rounded-[12px] font-semibold text-sm transition-all duration-200 ${selectedCategory === category
                                    ? 'bg-green-600 text-white shadow-lg shadow-green-600/25'
                                    : 'bg-white text-slate-600 hover:bg-green-50 border border-slate-200'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Skills Courses Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {skillsCourses
                            .filter(c => selectedCategory === 'الكل' || c.category === selectedCategory)
                            .map((course) => (
                                <div key={course.id} className="bg-white rounded-[16px] shadow-card overflow-hidden hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                                    {/* Thumbnail */}
                                    <div className="h-40 bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center relative">
                                        <BookOpen size={48} className="text-white/50" />
                                        <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${categoryColors[course.category] || 'bg-slate-100 text-slate-600'}`}>
                                            {course.category}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5">
                                        <h3 className="font-bold text-charcoal text-lg mb-2">{course.title}</h3>
                                        <p className="text-sm text-slate-grey mb-3">{course.instructor}</p>

                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-1">
                                                <Star size={16} className="text-amber-400 fill-amber-400" />
                                                <span className="text-sm font-semibold text-charcoal">{course.rating || '-'}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-sm text-slate-grey">
                                                <Users size={14} />
                                                <span>{course.students} طالب</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                            <span className="font-extrabold text-shibl-crimson text-lg">{course.price}</span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig[course.status].bgColor} ${statusConfig[course.status].textColor}`}>
                                                {statusConfig[course.status].label}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </>
            )}
        </>
    );
}
