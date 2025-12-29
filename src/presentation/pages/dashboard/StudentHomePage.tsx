import { useState } from 'react';
import { useAuthStore } from '../../store';
import {
    GraduationCap,
    TrendingUp,
    Clock,
    CheckCircle2
} from 'lucide-react';

// Mock data
const mockCourses = [
    { id: 1, title: 'الرياضيات - الجبر', teacher: 'د. محمد علي', progress: 60, image: '/images/signin-student.png', category: 'academic' },
    { id: 2, title: 'الفيزياء - الميكانيكا', teacher: 'أ. فاطمة حسن', progress: 45, image: '/images/signup-student.png', category: 'academic' },
    { id: 3, title: 'التاريخ - العصر الحديث', teacher: 'د. عمر خالد', progress: 80, image: '/images/hero-student.png', category: 'academic' },
    { id: 4, title: 'اللغة العربية - النحو', teacher: 'أ. سارة أحمد', progress: 30, image: '/images/signup-parent.png', category: 'academic' },
    { id: 5, title: 'القرآن الكريم - جزء عم', teacher: 'الشيخ أحمد', progress: 90, image: '/images/signin-parent.png', category: 'skills' },
    { id: 6, title: 'الفقه الإسلامي', teacher: 'الشيخ سالم', progress: 55, image: '/images/hero-student.png', category: 'skills' },
];

export function StudentHomePage() {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'academic' | 'skills'>('academic');

    // Stats
    const mockStats = {
        activeCourses: mockCourses.length,
        overallProgress: Math.round(mockCourses.reduce((acc, c) => acc + c.progress, 0) / mockCourses.length),
        upcomingSessions: 2,
    };

    const filteredCourses = mockCourses.filter(course =>
        activeTab === 'academic' ? course.category === 'academic' : course.category === 'skills'
    );

    const displayName = user?.name?.split(' ')[0] || 'طالب';

    return (
        <div className="p-6">
            {/* Welcome Card */}
            <div className="bg-gradient-to-l from-shibl-crimson via-shibl-crimson to-[#8B0A12] rounded-[28px] p-6 text-white mb-6 relative overflow-hidden">
                <div className="flex items-center gap-6">
                    <div className="flex-1">
                        <h1 className="text-2xl font-extrabold mb-1">مرحباً، {displayName}! 👋</h1>
                        <p className="text-white/70 text-sm mb-6">تابع تقدمك واستكشف فرصك التعليمية.</p>

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

                {/* Decor */}
                <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/5 rounded-full"></div>
                <div className="absolute left-20 -bottom-16 w-24 h-24 bg-white/5 rounded-full"></div>
            </div>

            {/* Tabs */}
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

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCourses.map(course => (
                    <div
                        key={course.id}
                        className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex cursor-pointer group"
                    >
                        <div className="w-32 h-32 flex-shrink-0 overflow-hidden">
                            <img
                                src={course.image}
                                alt={course.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>

                        <div className="flex-1 p-4 flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-charcoal mb-1 text-sm">{course.title}</h3>
                                <p className="text-slate-400 text-xs">{course.teacher}</p>
                            </div>

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
    );
}
