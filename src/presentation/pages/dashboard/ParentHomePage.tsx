import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { motion } from 'framer-motion';
import { ParentChildSkeleton } from '../../components/ui/skeletons/ParentChildSkeleton';
import {
    Users,
    TrendingUp,
    ChevronLeft,
    AlertCircle,
    Calendar,
    BookOpen,
    Loader2,
    GraduationCap,
    Clock,
    Sparkles,
    ArrowRight
} from 'lucide-react';
import { parentService } from '../../../data/api';
export function ParentHomePage() {
    const { user } = useAuthStore();
    const displayName = user?.name?.split(' ')[0] || 'ولي الأمر';

    // --- State ---
    const [children, setChildren] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch Linked Students
    useEffect(() => {
        const fetchChildren = async () => {
            try {
                const students = await parentService.getLinkedStudents();
                const mappedChildren = students.map((s: any) => ({
                    id: s.id,
                    name: s.name,
                    grade: s.grade || 'غير محدد',
                    avatar: s.image_path || s.avatar || null,
                    overallProgress: Math.round(s.overall_average_score || 0),
                    nextClass: 'لا توجد حصص قادمة', // TODO: fetch from schedule API
                    alerts: 0,
                    courses: s.active_subscriptions || s.total_subscriptions || (s.subjects?.length || 0)
                }));
                setChildren(mappedChildren);
            } catch (e) {
                console.error('Failed to fetch dashboard children:', e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchChildren();
    }, []);

    // Derived Stats
    const stats = {
        totalActiveCourses: children.reduce((acc, child) => acc + (child.courses || 0), 0)
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring' as const, stiffness: 100 }
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* Creates a subtle mesh gradient background for the page */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50/40 via-white to-white -z-10 pointer-events-none" />

            {/* Welcome Banner */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-shibl-crimson to-rose-900 rounded-[2rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl shadow-rose-900/20"
            >
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-4"
                        >
                            <Sparkles size={14} className="text-yellow-300" />
                            <span>نظرة عامة على أداء الأبناء</span>
                        </motion.div>
                        <h1 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
                            مرحباً، {displayName}! 👋
                        </h1>
                        <p className="text-white/90 text-lg md:text-xl font-medium leading-relaxed max-w-xl">
                            تابع تقدم أبنائك الأكاديمي وراقب مستواهم التعليمي أولاً بأول من لوحة تحكم واحدة متكاملة.
                        </p>
                    </div>
                </div>

                {/* Animated Background Decor */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.5, 1],
                        x: [0, 50, 0],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-0 left-0 w-80 h-80 bg-rose-500/20 rounded-full -ml-20 -mb-20 blur-3xl pointer-events-none"
                />
            </motion.div>

            {/* Quick Stats Row */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
                {/* Total Kids Stat */}
                <motion.div
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                    className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center justify-between group overflow-hidden relative"
                >
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                <Users size={20} />
                            </div>
                            <span className="text-slate-500 font-bold text-sm">عدد الأبناء</span>
                        </div>
                        <h3 className="text-4xl font-black text-slate-800 tracking-tight">{children.length}</h3>
                        <div className="flex items-center gap-1 mt-3 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg w-fit text-xs font-bold">
                            <TrendingUp size={14} />
                            جميعهم نشطون
                        </div>
                    </div>
                    {/* Background Icon */}
                    <Users className="absolute -left-4 -bottom-4 text-slate-50 w-32 h-32 rotate-12 group-hover:scale-110 transition-transform duration-500" />
                </motion.div>

                {/* Total Courses */}
                <motion.div
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                    className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center justify-between group overflow-hidden relative"
                >
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                                <BookOpen size={20} />
                            </div>
                            <span className="text-slate-500 font-bold text-sm">الدورات النشطة</span>
                        </div>
                        <h3 className="text-4xl font-black text-slate-800 tracking-tight">{stats.totalActiveCourses}</h3>
                        <p className="text-slate-400 text-xs font-bold mt-3 px-1">إجمالي الاشتراكات الحالية</p>
                    </div>
                    {/* Background Icon */}
                    <BookOpen className="absolute -left-4 -bottom-4 text-slate-50 w-32 h-32 rotate-12 group-hover:scale-110 transition-transform duration-500" />
                </motion.div>
            </motion.div>

            {/* My Children Content */}
            <div className="space-y-6">
                <div className="flex items-end justify-between px-2">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                            <span className="w-2 h-8 bg-shibl-crimson rounded-full block"></span>
                            أبنائي
                        </h2>
                        <p className="text-slate-500 mt-1 font-medium text-sm">تفاصيل الأداء والتقدم الدراسي لكل ابن</p>
                    </div>
                    <Link to="/parent/children" className="group flex items-center gap-2 text-shibl-crimson font-bold hover:bg-red-50 px-4 py-2 rounded-xl transition-all">
                        <span>عرض الكل</span>
                        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    </Link>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    {isLoading ? (
                        <>
                            <ParentChildSkeleton />
                            <ParentChildSkeleton />
                            <ParentChildSkeleton />
                            <ParentChildSkeleton />
                        </>
                    ) : children.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="col-span-1 md:col-span-2 text-center py-16 px-6 text-slate-500 bg-white rounded-[2.5rem] border border-dashed border-slate-200 shadow-sm"
                        >
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Users size={40} className="text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">لم يتم ربط أي أبناء بعد</h3>
                            <p className="max-w-md mx-auto mb-8 text-slate-400">ابدأ بإضافة أبنائك لمتابعة تقدمهم الدراسي والحصول على تقارير مفصلة</p>
                            <Link to="/parent/children" className="inline-flex items-center gap-2 bg-shibl-crimson text-white px-8 py-3 rounded-xl font-bold hover:bg-red-800 transition-all shadow-lg shadow-red-900/20 active:scale-95">
                                <Users size={20} />
                                أضف ابنك الأول
                            </Link>
                        </motion.div>
                    ) : (
                        children.map(child => (
                            <motion.div
                                key={child.id}
                                variants={itemVariants}
                                whileHover={{ y: -5, scale: 1.01 }}
                                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-200/70 transition-all duration-300 overflow-hidden group flex flex-col"
                            >
                                <div className="p-6 md:p-8 flex-1">
                                    <div className="flex items-start justify-between mb-8">
                                        <div className="flex items-center gap-5">
                                            <div className="relative">
                                                <div className="w-20 h-20 rounded-[1.2rem] overflow-hidden border-4 border-slate-50 shadow-inner bg-slate-100 flex items-center justify-center">
                                                    {child.avatar ? (
                                                        <img src={child.avatar} alt={child.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Users size={32} className="text-slate-300" />
                                                    )}
                                                </div>
                                                {child.alerts > 0 && (
                                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white animate-pulse">
                                                        {child.alerts}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-slate-900 mb-1.5">{child.name}</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold flex items-center gap-1.5">
                                                        <GraduationCap size={14} className="text-slate-400" />
                                                        {child.grade}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Progress Bar */}
                                        <div>
                                            <div className="flex justify-between items-end mb-2">
                                                <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">التقدم العام للفصل</span>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-2xl font-black text-shibl-crimson">{child.overallProgress}</span>
                                                    <span className="text-xs font-bold text-slate-400 mb-1">%</span>
                                                </div>
                                            </div>
                                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${child.overallProgress}%` }}
                                                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                                                    className="h-full bg-gradient-to-r from-shibl-crimson to-rose-400 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.3)]"
                                                />
                                            </div>
                                        </div>

                                        {/* Next Class Widget */}
                                        <div className="flex items-center gap-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-500 shrink-0">
                                                <Clock size={24} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 font-bold mb-0.5">الموعد القادم</p>
                                                <p className="text-sm font-bold text-slate-700 leading-tight">{child.nextClass}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Action */}
                                <div className="bg-slate-50 px-8 py-5 border-t border-slate-100 flex items-center justify-between group-hover:bg-slate-100/80 transition-colors">
                                    <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                                        <BookOpen size={16} />
                                        <span>{child.courses} دورات مسجلة</span>
                                    </div>
                                    <Link to="/parent/children" className="flex items-center gap-2 text-shibl-crimson font-black text-sm hover:translate-x-[-4px] transition-transform">
                                        التفاصيل
                                        <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </motion.div>
                        ))
                    )}
                </motion.div>
            </div>

        </div>
    );
}
