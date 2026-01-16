import { useMemo } from 'react';
import { useLanguage } from '../../hooks';
import { useAuthStore } from '../../store';

// Icons
import {
    BookOpen,
    Users,
    Plus,
    Search,
    MoreVertical,
    Play,
    Edit,
    Eye
} from 'lucide-react';

// Course card component
interface CourseCardProps {
    id: number;
    title: string;
    description: string;
    studentsCount: number;
    lessonsCount: number;
    status: 'active' | 'draft' | 'archived';
    thumbnail?: string;
}

function CourseCard({ title, description, studentsCount, lessonsCount, status }: CourseCardProps) {
    const statusStyles = {
        active: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'نشط' },
        draft: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'مسودة' },
        archived: { bg: 'bg-slate-500/10', text: 'text-slate-400', label: 'مؤرشف' },
    };

    const { bg, text, label } = statusStyles[status];

    return (
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/5 hover:border-white/10 transition-all group overflow-hidden">
            {/* Thumbnail */}
            <div className="h-40 bg-gradient-to-br from-shibl-crimson/20 to-purple-500/20 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen size={48} className="text-white/20" />
                </div>
                {/* Status Badge */}
                <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
                    {label}
                </span>
                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                    <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all">
                        <Eye size={18} />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-shibl-crimson hover:bg-red-600 flex items-center justify-center text-white transition-all">
                        <Play size={18} />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all">
                        <Edit size={18} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <h3 className="text-white font-bold text-lg mb-2 line-clamp-1">{title}</h3>
                <p className="text-slate-400 text-sm line-clamp-2 mb-4">{description}</p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-slate-400">
                        <Users size={14} />
                        <span>{studentsCount} طالب</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                        <BookOpen size={14} />
                        <span>{lessonsCount} درس</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function TeacherCoursesPage() {
    const { isRTL } = useLanguage();
    const { user } = useAuthStore();

    // Mock courses data - will be replaced with API call
    const courses = useMemo(() => [
        {
            id: 1,
            title: 'الرياضيات للصف الثالث الثانوي',
            description: 'دورة شاملة في الرياضيات تغطي الجبر والهندسة والتفاضل والتكامل',
            studentsCount: 45,
            lessonsCount: 24,
            status: 'active' as const,
        },
        {
            id: 2,
            title: 'الفيزياء للصف الثاني الثانوي',
            description: 'أساسيات الفيزياء والميكانيكا والكهرباء',
            studentsCount: 32,
            lessonsCount: 18,
            status: 'active' as const,
        },
        {
            id: 3,
            title: 'الكيمياء العضوية',
            description: 'مقدمة في الكيمياء العضوية والمركبات الكربونية',
            studentsCount: 28,
            lessonsCount: 15,
            status: 'draft' as const,
        },
        {
            id: 4,
            title: 'الأحياء للصف الأول الثانوي',
            description: 'علم الأحياء والخلية والوراثة',
            studentsCount: 51,
            lessonsCount: 20,
            status: 'active' as const,
        },
    ], []);

    return (
        <div className="space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">دوراتي</h1>
                    <p className="text-slate-400 mt-1">
                        إجمالي {courses.length} دورات
                    </p>
                </div>
                <button className="h-11 px-5 rounded-xl bg-shibl-crimson hover:bg-red-600 text-white font-medium flex items-center gap-2 transition-all hover:-translate-y-0.5 shadow-lg shadow-shibl-crimson/20">
                    <Plus size={18} />
                    <span>إضافة دورة جديدة</span>
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <input
                        type="text"
                        placeholder="ابحث عن دورة..."
                        className="w-full h-11 px-4 pr-12 rounded-xl bg-white/5 border border-white/10 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all text-sm text-white placeholder:text-slate-500"
                    />
                    <Search
                        size={18}
                        className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`}
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2">
                    {['الكل', 'نشط', 'مسودة', 'مؤرشف'].map((tab, index) => (
                        <button
                            key={tab}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${index === 0
                                    ? 'bg-shibl-crimson text-white'
                                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {courses.map((course) => (
                    <CourseCard key={course.id} {...course} />
                ))}
            </div>

            {/* Empty State (hidden when courses exist) */}
            {courses.length === 0 && (
                <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-6">
                        <BookOpen size={40} className="text-slate-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">لا توجد دورات بعد</h3>
                    <p className="text-slate-400 mb-6">ابدأ بإنشاء دورتك الأولى</p>
                    <button className="h-11 px-6 rounded-xl bg-shibl-crimson hover:bg-red-600 text-white font-medium inline-flex items-center gap-2 transition-all">
                        <Plus size={18} />
                        <span>إنشاء دورة</span>
                    </button>
                </div>
            )}
        </div>
    );
}

export default TeacherCoursesPage;
