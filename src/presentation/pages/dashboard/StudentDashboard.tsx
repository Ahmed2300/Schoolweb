import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks';
import { useAuthStore } from '../../store';
import { authService } from '../../../data/api/authService';
import { ROUTES } from '../../../shared/constants';
import { LogoutModal } from '../../components/ui';

// Lucide Icons
import {
    Home,
    BookOpen,
    Star,
    Calendar,
    FileQuestion,
    Video,
    User,
    Search,
    TrendingUp,
    Clock,
    GraduationCap,
    CheckCircle2,
    LogOut
} from 'lucide-react';

// Mock data for courses (will be replaced with API data later)
const mockCourses = [
    { id: 1, title: 'الرياضيات - الجبر', teacher: 'د. محمد علي', progress: 60, image: '/images/signin-student.png', category: 'academic' },
    { id: 2, title: 'الفيزياء - الميكانيكا', teacher: 'أ. فاطمة حسن', progress: 45, image: '/images/signup-student.png', category: 'academic' },
    { id: 3, title: 'التاريخ - العصر الحديث', teacher: 'د. عمر خالد', progress: 80, image: '/images/hero-student.png', category: 'academic' },
    { id: 4, title: 'اللغة العربية - النحو', teacher: 'أ. سارة أحمد', progress: 30, image: '/images/signup-parent.png', category: 'academic' },
    { id: 5, title: 'القرآن الكريم - جزء عم', teacher: 'الشيخ أحمد', progress: 90, image: '/images/signin-parent.png', category: 'skills' },
    { id: 6, title: 'الفقه الإسلامي', teacher: 'الشيخ سالم', progress: 55, image: '/images/hero-student.png', category: 'skills' },
];

export function StudentDashboard() {
    const { isRTL } = useLanguage();
    const navigate = useNavigate();
    const { user, logout: clearAuthStore } = useAuthStore();

    const [activeTab, setActiveTab] = useState<'academic' | 'skills'>('academic');
    const [activeNav, setActiveNav] = useState('home');
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // Calculate stats (mock - will be from API)
    const mockStats = {
        activeCourses: mockCourses.length,
        overallProgress: Math.round(mockCourses.reduce((acc, c) => acc + c.progress, 0) / mockCourses.length),
        upcomingSessions: 2,
    };

    const filteredCourses = mockCourses.filter(course =>
        activeTab === 'academic' ? course.category === 'academic' : course.category === 'skills'
    );

    const navItems = [
        { id: 'home', icon: Home, label: 'الرئيسية' },
        { id: 'academic', icon: BookOpen, label: 'الأكاديمي' },
        { id: 'skills', icon: Star, label: 'المهارات' },
        { id: 'schedule', icon: Calendar, label: 'الجدول' },
        { id: 'quizzes', icon: FileQuestion, label: 'الاختبارات' },
        { id: 'live', icon: Video, label: 'جلسات مباشرة' },
        { id: 'profile', icon: User, label: 'الملف الشخصي' },
    ];

    // Handle logout with API call
    const handleLogout = async () => {
        try {
            // Call logout API based on user role
            const userType = user?.role === 'parent' ? 'parent' : 'student';
            await authService.logout(userType);
        } catch (error) {
            console.error('Logout API error:', error);
            // Continue with local logout even if API fails
        } finally {
            // Clear local auth state
            clearAuthStore();
            navigate(ROUTES.LOGIN);
        }
    };

    // Get user display name (first name or full name)
    const displayName = user?.name?.split(' ')[0] || 'طالب';

    // Get user initials for avatar fallback
    const userInitials = user?.name?.charAt(0) || 'ط';

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Logout Confirmation Modal */}
            <LogoutModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleLogout}
                userName={displayName}
            />

            {/* Sidebar - Modern Clean Design */}
            <aside className="w-24 bg-white border-l border-slate-100 flex flex-col fixed h-full z-50 shadow-sm">

                {/* Navigation */}
                <nav className="flex-1 py-6">
                    <ul className="space-y-1 px-2">
                        {navItems.map(item => {
                            const IconComponent = item.icon;
                            return (
                                <li key={item.id}>
                                    <button
                                        onClick={() => setActiveNav(item.id)}
                                        className={`w-full flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl transition-all ${activeNav === item.id
                                            ? 'bg-shibl-crimson text-white'
                                            : 'text-slate-500 hover:bg-slate-50'
                                            }`}
                                    >
                                        <IconComponent
                                            size={20}
                                            className={activeNav === item.id ? 'text-white' : 'text-slate-400'}
                                        />
                                        <span className="text-[10px] font-bold">{item.label}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Logout Button */}
                <div className="p-2 border-t border-slate-100">
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="w-full flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all"
                    >
                        <LogOut size={20} />
                        <span className="text-[10px] font-bold">خروج</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 mr-24">
                {/* Header */}
                <header className="h-16 bg-white/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-40">
                    {/* Logo */}
                    <Link to={ROUTES.HOME} className="flex items-center gap-2">
                        <img src="/images/subol-red.png" alt="سُبُل" className="w-8 h-8" />
                    </Link>

                    {/* Search */}
                    <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2 w-full max-w-sm mx-4">
                        <Search size={18} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="بحث..."
                            className="bg-transparent border-none outline-none flex-1 text-sm text-charcoal placeholder-slate-400"
                        />
                    </div>

                    {/* Profile Avatar */}
                    <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-shibl-crimson ring-offset-2 flex items-center justify-center bg-gradient-to-br from-shibl-crimson to-shibl-crimson-dark text-white font-bold">
                        {user?.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span>{userInitials}</span>
                        )}
                    </div>
                </header>

                {/* Content */}
                <div className="p-6">
                    {/* Welcome Card - Modern Design */}
                    <div className="bg-gradient-to-l from-shibl-crimson via-shibl-crimson to-[#8B0A12] rounded-[28px] p-6 text-white mb-6 relative overflow-hidden">
                        <div className="flex items-center gap-6">
                            {/* Text Content */}
                            <div className="flex-1">
                                <h1 className="text-2xl font-extrabold mb-1">مرحباً، {displayName}! 👋</h1>
                                <p className="text-white/70 text-sm mb-6">تابع تقدمك واستكشف فرصك التعليمية.</p>

                                {/* Stats inside welcome card */}
                                <div className="flex gap-3 flex-wrap">
                                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center gap-2">
                                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                            <GraduationCap size={16} />
                                        </div>
                                        <div>
                                            <p className="text-lg font-extrabold">{mockStats.activeCourses}</p>
                                            <p className="text-[10px] text-white/70">دورات نشطة</p>
                                        </div>
                                    </div>

                                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center gap-2">
                                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                            <TrendingUp size={16} />
                                        </div>
                                        <div>
                                            <p className="text-lg font-extrabold">{mockStats.overallProgress}%</p>
                                            <p className="text-[10px] text-white/70">التقدم</p>
                                        </div>
                                    </div>

                                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center gap-2">
                                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                            <Clock size={16} />
                                        </div>
                                        <div>
                                            <p className="text-lg font-extrabold">{mockStats.upcomingSessions}</p>
                                            <p className="text-[10px] text-white/70">حصص قادمة</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Decorative circles */}
                        <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/5 rounded-full"></div>
                        <div className="absolute left-20 -bottom-16 w-24 h-24 bg-white/5 rounded-full"></div>
                    </div>

                    {/* Tabs - Clean Toggle Design */}
                    <div className="flex items-center gap-0 mb-6 bg-slate-100 p-1 rounded-2xl w-fit">
                        <button
                            onClick={() => setActiveTab('academic')}
                            className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'academic'
                                ? 'bg-shibl-crimson text-white shadow-lg'
                                : 'text-slate-500 hover:text-charcoal'
                                }`}
                        >
                            الأكاديمي
                        </button>
                        <button
                            onClick={() => setActiveTab('skills')}
                            className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'skills'
                                ? 'bg-shibl-crimson text-white shadow-lg'
                                : 'text-slate-500 hover:text-charcoal'
                                }`}
                        >
                            المهارات
                        </button>
                    </div>

                    {/* Course Grid - Modern Card Design */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredCourses.map(course => (
                            <div
                                key={course.id}
                                className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex cursor-pointer"
                            >
                                {/* Thumbnail */}
                                <div className="w-32 h-32 flex-shrink-0 overflow-hidden">
                                    <img
                                        src={course.image}
                                        alt={course.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-4 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-bold text-charcoal mb-1 text-sm">{course.title}</h3>
                                        <p className="text-slate-400 text-xs">{course.teacher}</p>
                                    </div>

                                    {/* Progress */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-shibl-crimson rounded-full transition-all"
                                                style={{ width: `${course.progress}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs">
                                            {course.progress >= 50 && (
                                                <CheckCircle2 size={14} className="text-shibl-crimson" />
                                            )}
                                            <span className="text-slate-500 font-medium">{course.progress}% مكتمل</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default StudentDashboard;
