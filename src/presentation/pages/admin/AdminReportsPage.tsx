import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Calendar,
    Download,
    TrendingUp,
    DollarSign,
    Users,
    BookOpen,
    GraduationCap,
    UserCheck,
    MoreHorizontal,
    X
} from 'lucide-react';
import adminService, { RegistrationReportData, RecentRegistration, FinancialStatistics } from '@/data/api/adminService';

// ==================== TYPES ====================

type ReportTab = 'financial' | 'users' | 'content';

interface StatsCardProps {
    title: string;
    value: number | string;
    change?: number;
    icon: React.ReactNode;
    bgColor: string;
    iconBgColor: string;
    isLoading?: boolean;
}

interface UserDistribution {
    students: number;
    teachers: number;
    parents: number;
}

// ==================== SKELETON COMPONENTS ====================

function StatsCardSkeleton() {
    return (
        <div className="bg-white dark:bg-[#1E1E1E] rounded-[20px] p-6 shadow-card border border-slate-100 dark:border-white/10 animate-pulse">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-slate-200" />
                <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-24 mb-2" />
                    <div className="h-8 bg-slate-200 rounded w-32" />
                </div>
            </div>
        </div>
    );
}

function ChartSkeleton() {
    return (
        <div className="bg-white dark:bg-[#1E1E1E] rounded-[20px] p-6 shadow-card border border-slate-100 dark:border-white/10 animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-48 mb-8" />
            <div className="h-64 bg-slate-100 rounded-lg flex items-end justify-between gap-2 p-4">
                {[...Array(12)].map((_, i) => (
                    <div key={i} className="flex-1 bg-slate-200 rounded-t" style={{ height: `${Math.random() * 60 + 20}%` }} />
                ))}
            </div>
        </div>
    );
}

function TableSkeleton() {
    return (
        <div className="bg-white dark:bg-[#1E1E1E] rounded-[20px] shadow-card border border-slate-100 dark:border-white/10 overflow-hidden animate-pulse">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-white/10">
                <div className="h-6 bg-slate-200 rounded w-32" />
            </div>
            <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                        <div className="w-10 h-10 bg-slate-200 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-slate-200 rounded w-24" />
                            <div className="h-3 bg-slate-200 rounded w-16" />
                        </div>
                        <div className="h-6 bg-slate-200 rounded w-16" />
                    </div>
                ))}
            </div>
        </div>
    );
}

// ==================== STAT CARD COMPONENT ====================

function StatsCard({ title, value, change, icon, bgColor, iconBgColor, isLoading }: StatsCardProps) {
    if (isLoading) return <StatsCardSkeleton />;

    return (
        <div className={`${bgColor} rounded-[20px] p-6 shadow-card border border-slate-100 relative overflow-hidden group`}>
            <div className="flex items-center gap-4">
                <div className={`w-14 h-14 ${iconBgColor} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    {icon}
                </div>
                <div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mb-1">{title}</p>
                    <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-extrabold text-charcoal dark:text-white">{value.toLocaleString('ar-EG')}</h3>
                        {change !== undefined && (
                            <span className={`flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                <TrendingUp size={12} className="ml-1" />
                                {change >= 0 ? '+' : ''}{change}%
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ==================== LINE CHART COMPONENT ====================

interface LineChartProps {
    students: RegistrationReportData[];
    teachers: RegistrationReportData[];
    parents: RegistrationReportData[];
    isLoading?: boolean;
}

function RegistrationLineChart({ students, teachers, parents, isLoading }: LineChartProps) {
    if (isLoading) return <ChartSkeleton />;

    // Merge all dates and create a unified dataset
    const allDates = useMemo(() => {
        const dateSet = new Set<string>();
        [...students, ...teachers, ...parents].forEach(d => dateSet.add(d.date));
        return Array.from(dateSet).sort();
    }, [students, teachers, parents]);

    // Create lookup maps for efficient data access
    const studentMap = useMemo(() => new Map(students.map(d => [d.date, d.count])), [students]);
    const teacherMap = useMemo(() => new Map(teachers.map(d => [d.date, d.count])), [teachers]);
    const parentMap = useMemo(() => new Map(parents.map(d => [d.date, d.count])), [parents]);

    // Calculate cumulative counts for the line chart
    const chartData = useMemo(() => {
        let studentTotal = 0, teacherTotal = 0, parentTotal = 0;
        return allDates.map(date => {
            studentTotal += studentMap.get(date) || 0;
            teacherTotal += teacherMap.get(date) || 0;
            parentTotal += parentMap.get(date) || 0;
            return { date, studentTotal, teacherTotal, parentTotal };
        });
    }, [allDates, studentMap, teacherMap, parentMap]);

    if (chartData.length === 0) {
        return (
            <div className="bg-white dark:bg-[#1E1E1E] rounded-[20px] p-6 shadow-card border border-slate-100 dark:border-white/10">
                <h3 className="font-bold text-charcoal dark:text-white text-lg mb-4">نمو التسجيلات بمرور الوقت</h3>
                <div className="h-64 flex items-center justify-center text-slate-400">
                    لا توجد بيانات متاحة
                </div>
            </div>
        );
    }

    // Calculate chart dimensions
    const maxValue = Math.max(...chartData.flatMap(d => [d.studentTotal, d.teacherTotal, d.parentTotal]));
    const chartHeight = 256;
    const yScale = maxValue > 0 ? chartHeight / (maxValue * 1.1) : 1;

    // Generate SVG path for each line
    const generatePath = (data: number[]) => {
        if (data.length === 0) return '';
        const stepWidth = 100 / (data.length - 1 || 1);
        return data.map((value, i) => {
            const x = i * stepWidth;
            const y = 100 - (value / (maxValue * 1.1 || 1)) * 100;
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ');
    };

    const studentPath = generatePath(chartData.map(d => d.studentTotal));
    const teacherPath = generatePath(chartData.map(d => d.teacherTotal));
    const parentPath = generatePath(chartData.map(d => d.parentTotal));

    return (
        <div className="bg-white dark:bg-[#1E1E1E] rounded-[20px] p-6 shadow-card border border-slate-100 dark:border-white/10">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-charcoal dark:text-white text-lg">نمو التسجيلات بمرور الوقت</h3>
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-slate-600">نمو الطلاب</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-slate-600">المدرسين</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-amber-500" />
                        <span className="text-slate-600">أولياء الأمور</span>
                    </div>
                </div>
            </div>

            {/* SVG Line Chart */}
            <div className="relative h-64">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                    {/* Grid lines */}
                    {[0, 25, 50, 75, 100].map(y => (
                        <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#f1f5f9" strokeWidth="0.5" />
                    ))}
                    {/* Data lines */}
                    <path d={studentPath} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d={teacherPath} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d={parentPath} fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {/* Y-axis labels */}
                <div className="absolute right-full mr-2 top-0 bottom-0 flex flex-col justify-between text-xs text-slate-400">
                    <span>{Math.round(maxValue * 1.1).toLocaleString('ar-EG')}</span>
                    <span>{Math.round(maxValue * 0.55).toLocaleString('ar-EG')}</span>
                    <span>0</span>
                </div>
            </div>
            {/* X-axis labels */}
            <div className="flex justify-between mt-2 text-xs text-slate-400">
                {chartData.filter((_, i) => i % Math.ceil(chartData.length / 6) === 0).map((d, i) => (
                    <span key={i}>{new Date(d.date).toLocaleDateString('ar-EG', { month: 'short' })}</span>
                ))}
            </div>
        </div>
    );
}

// ==================== DONUT CHART COMPONENT ====================

interface DonutChartProps {
    distribution: UserDistribution;
    isLoading?: boolean;
}

function UserDistributionDonut({ distribution, isLoading }: DonutChartProps) {
    if (isLoading) {
        return (
            <div className="bg-white dark:bg-[#1E1E1E] rounded-[20px] p-6 shadow-card border border-slate-100 dark:border-white/10 animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-40 mb-8" />
                <div className="w-48 h-48 mx-auto bg-slate-200 rounded-full mb-8" />
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-4 bg-slate-200 rounded" />)}
                </div>
            </div>
        );
    }

    const total = distribution.students + distribution.teachers + distribution.parents;
    const studentPercent = total > 0 ? (distribution.students / total) * 100 : 0;
    const teacherPercent = total > 0 ? (distribution.teachers / total) * 100 : 0;
    const parentPercent = total > 0 ? (distribution.parents / total) * 100 : 0;

    // SVG donut chart calculations (circumference = 2 * PI * r = 2 * 3.14159 * 40 ≈ 251.2)
    const circumference = 251.2;
    const studentDash = (studentPercent / 100) * circumference;
    const teacherDash = (teacherPercent / 100) * circumference;
    const parentDash = (parentPercent / 100) * circumference;

    return (
        <div className="bg-white dark:bg-[#1E1E1E] rounded-[20px] p-6 shadow-card border border-slate-100 dark:border-white/10">
            <h3 className="font-bold text-charcoal dark:text-white text-lg mb-8">توزيع قاعدة المستخدمين</h3>

            <div className="relative w-48 h-48 mx-auto mb-8">
                <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F1F5F9" strokeWidth="20" />
                    {/* Students segment */}
                    <circle
                        cx="50" cy="50" r="40"
                        fill="transparent"
                        stroke="#3b82f6"
                        strokeWidth="20"
                        strokeDasharray={`${studentDash} ${circumference}`}
                        className="transition-all duration-1000 ease-out"
                    />
                    {/* Teachers segment */}
                    <circle
                        cx="50" cy="50" r="40"
                        fill="transparent"
                        stroke="#10b981"
                        strokeWidth="20"
                        strokeDasharray={`${teacherDash} ${circumference}`}
                        strokeDashoffset={`-${studentDash}`}
                        className="transition-all duration-1000 ease-out"
                    />
                    {/* Parents segment */}
                    <circle
                        cx="50" cy="50" r="40"
                        fill="transparent"
                        stroke="#f59e0b"
                        strokeWidth="20"
                        strokeDasharray={`${parentDash} ${circumference}`}
                        strokeDashoffset={`-${studentDash + teacherDash}`}
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs text-slate-400 font-medium">الإجمالي</span>
                    <span className="text-xl font-extrabold text-charcoal dark:text-white">{total.toLocaleString('ar-EG')}</span>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-sm font-medium text-slate-600">Students</span>
                    </div>
                    <span className="text-sm font-bold text-charcoal dark:text-white">{studentPercent.toFixed(0)}%</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-sm font-medium text-slate-600">Teachers</span>
                    </div>
                    <span className="text-sm font-bold text-charcoal dark:text-white">{teacherPercent.toFixed(0)}%</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <span className="text-sm font-medium text-slate-600">Parents</span>
                    </div>
                    <span className="text-sm font-bold text-charcoal dark:text-white">{parentPercent.toFixed(0)}%</span>
                </div>
            </div>
        </div>
    );
}

// ==================== RECENT REGISTRATIONS TABLE ====================

// RecentRegistration type is imported from adminService.ts

interface RecentRegistrationsTableProps {
    registrations: RecentRegistration[];
    isLoading?: boolean;
    onViewAll?: () => void;
}

function RecentRegistrationsTable({ registrations, isLoading, onViewAll }: RecentRegistrationsTableProps) {
    if (isLoading) return <TableSkeleton />;

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'student': return <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">طالب</span>;
            case 'teacher': return <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">مدرس</span>;
            case 'parent': return <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">ولي أمر</span>;
            default: return null;
        }
    };

    return (
        <div className="bg-white dark:bg-[#1E1E1E] rounded-[20px] shadow-card border border-slate-100 dark:border-white/10 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
                <h3 className="font-bold text-charcoal dark:text-white text-lg">أحدث التسجيلات</h3>
                <button
                    onClick={onViewAll}
                    className="text-sm text-shibl-crimson font-bold hover:underline"
                >
                    عرض الكل
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-[#2A2A2A] border-b border-slate-100 dark:border-white/10">
                            <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">اسم المستخدم</th>
                            <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">دوار</th>
                            <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">تاريخ التسجيل</th>
                            <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الحالة</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                        {registrations.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-slate-400">لا توجد تسجيلات حديثة</td>
                            </tr>
                        ) : (
                            registrations.map((reg) => (
                                <tr key={reg.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-bold text-charcoal dark:text-white text-sm">{reg.name}</td>
                                    <td className="px-6 py-4">{getRoleBadge(reg.role)}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400">
                                        {new Date(reg.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${reg.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {reg.status === 'active' ? 'نشط' : 'غير نشط'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ==================== VIEW ALL MODAL ====================

interface AllRegistrationsModalProps {
    isOpen: boolean;
    onClose: () => void;
    registrations: RecentRegistration[];
    isLoading: boolean;
}

function AllRegistrationsModal({ isOpen, onClose, registrations, isLoading }: AllRegistrationsModalProps) {
    if (!isOpen) return null;

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'student': return <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">طالب</span>;
            case 'teacher': return <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">مدرس</span>;
            case 'parent': return <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">ولي أمر</span>;
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-[#1E1E1E] rounded-[20px] shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
                    <h2 className="font-bold text-charcoal dark:text-white text-xl">جميع التسجيلات</h2>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                    >
                        <X size={20} className="text-slate-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-10 h-10 border-4 border-shibl-crimson border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : registrations.length === 0 ? (
                        <div className="flex items-center justify-center py-20 text-slate-400">
                            لا توجد تسجيلات
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="sticky top-0 bg-slate-50 dark:bg-[#2A2A2A] border-b border-slate-100 dark:border-white/10">
                                <tr>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">اسم المستخدم</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الدور</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">تاريخ التسجيل</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الحالة</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                                {registrations.map((reg) => (
                                    <tr key={`${reg.role}-${reg.id}`} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-bold text-charcoal dark:text-white text-sm">{reg.name}</td>
                                        <td className="px-6 py-4">{getRoleBadge(reg.role)}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400">
                                            {new Date(reg.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${reg.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {reg.status === 'active' ? 'نشط' : 'غير نشط'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-[#2A2A2A] text-sm text-slate-500 dark:text-slate-400 text-center">
                    إجمالي التسجيلات: {registrations.length}
                </div>
            </div>
        </div>
    );
}

// ==================== MAIN PAGE COMPONENT ====================

export function AdminReportsPage() {
    const [activeTab, setActiveTab] = useState<ReportTab>('users');
    const [dateRange] = useState('آخر 30 يوم');
    const [showAllRegistrationsModal, setShowAllRegistrationsModal] = useState(false);

    // Fetch all registration reports using TanStack Query
    const {
        data: registrationData,
        isLoading: isRegistrationLoading,
        isError: isRegistrationError
    } = useQuery({
        queryKey: ['admin-reports', 'registrations'],
        queryFn: () => adminService.getAllRegistrationReports(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Calculate totals for stats cards
    const stats = useMemo(() => {
        if (!registrationData) return { students: 0, teachers: 0, parents: 0 };
        return {
            students: registrationData.students.reduce((sum, d) => sum + d.count, 0),
            teachers: registrationData.teachers.reduce((sum, d) => sum + d.count, 0),
            parents: registrationData.parents.reduce((sum, d) => sum + d.count, 0),
        };
    }, [registrationData]);

    // Fetch recent registrations (5 for initial display)
    const {
        data: recentRegistrations = [],
        isLoading: isRecentLoading,
    } = useQuery({
        queryKey: ['admin-reports', 'recent-registrations', 5],
        queryFn: () => adminService.getRecentRegistrations(5),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Fetch all registrations (50 for modal) - only when modal is open
    const {
        data: allRegistrations = [],
        isLoading: isAllRegistrationsLoading,
    } = useQuery({
        queryKey: ['admin-reports', 'all-registrations', 50],
        queryFn: () => adminService.getRecentRegistrations(50),
        staleTime: 5 * 60 * 1000,
        enabled: showAllRegistrationsModal, // Only fetch when modal is open
    });

    // Fetch financial statistics (only when financial tab is active)
    const {
        data: financialStats,
        isLoading: isFinancialLoading,
    } = useQuery({
        queryKey: ['admin-reports', 'financial-statistics'],
        queryFn: () => adminService.getFinancialStatistics(),
        staleTime: 5 * 60 * 1000,
        enabled: activeTab === 'financial',
    });

    // Format currency helper
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-OM', {
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
        }).format(amount) + ' ر.ع.';
    };

    return (
        <>
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-extrabold text-charcoal dark:text-white mb-1">التقارير والتحليلات</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">نظرة شاملة على أداء المنصة والإيرادات</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Date Picker */}
                    <div className="h-11 px-4 bg-white dark:bg-[#2A2A2A] border border-slate-200 dark:border-white/10 rounded-[12px] dark:text-white flex items-center gap-2 text-slate-600 font-medium text-sm cursor-pointer hover:border-shibl-crimson transition-colors">
                        <Calendar size={18} />
                        <span>{dateRange}</span>
                    </div>

                    {/* Export Button */}
                    <button className="h-11 px-5 rounded-[12px] bg-white dark:bg-[#2A2A2A] border border-slate-200 dark:border-white/10 dark:text-white hover:border-shibl-crimson text-slate-600 hover:text-shibl-crimson font-semibold text-sm transition-all flex items-center gap-2">
                        <Download size={18} />
                        <span>تصدير</span>
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 mb-8">
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => setActiveTab('financial')}
                        className={`pb-4 px-2 font-bold text-sm transition-all relative ${activeTab === 'financial' ? 'text-shibl-crimson' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <div className="flex items-center gap-2">
                            <DollarSign size={20} />
                            <span>التقارير المالية</span>
                        </div>
                        {activeTab === 'financial' && <div className="absolute bottom-0 right-0 left-0 h-0.5 bg-shibl-crimson rounded-t-full" />}
                    </button>

                    <button
                        onClick={() => setActiveTab('users')}
                        className={`pb-4 px-2 font-bold text-sm transition-all relative ${activeTab === 'users' ? 'text-shibl-crimson' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <div className="flex items-center gap-2">
                            <Users size={20} />
                            <span>تحليلات المستخدمين</span>
                        </div>
                        {activeTab === 'users' && <div className="absolute bottom-0 right-0 left-0 h-0.5 bg-shibl-crimson rounded-t-full" />}
                    </button>

                    <button
                        onClick={() => setActiveTab('content')}
                        className={`pb-4 px-2 font-bold text-sm transition-all relative ${activeTab === 'content' ? 'text-shibl-crimson' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <div className="flex items-center gap-2">
                            <BookOpen size={20} />
                            <span>أداء المحتوى</span>
                        </div>
                        {activeTab === 'content' && <div className="absolute bottom-0 right-0 left-0 h-0.5 bg-shibl-crimson rounded-t-full" />}
                    </button>
                </div>
            </div>

            {/* Users Analytics Tab */}
            {activeTab === 'users' && (
                <div className="space-y-6">
                    {/* Error State */}
                    {isRegistrationError && (
                        <div className="bg-red-50 border border-red-200 rounded-[12px] p-4 text-red-700 text-sm">
                            حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.
                        </div>
                    )}

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatsCard
                            title="إجمالي الطلاب"
                            value={stats.students}
                            change={4.5}
                            icon={<GraduationCap size={28} className="text-blue-600" />}
                            bgColor="bg-white"
                            iconBgColor="bg-blue-100"
                            isLoading={isRegistrationLoading}
                        />
                        <StatsCard
                            title="إجمالي المدرسين"
                            value={stats.teachers}
                            change={2.1}
                            icon={<UserCheck size={28} className="text-emerald-600" />}
                            bgColor="bg-white"
                            iconBgColor="bg-emerald-100"
                            isLoading={isRegistrationLoading}
                        />
                        <StatsCard
                            title="إجمالي أولياء الأمور"
                            value={stats.parents}
                            change={3.8}
                            icon={<Users size={28} className="text-amber-600" />}
                            bgColor="bg-white"
                            iconBgColor="bg-amber-100"
                            isLoading={isRegistrationLoading}
                        />
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Line Chart - takes 2 columns */}
                        <div className="lg:col-span-2">
                            <RegistrationLineChart
                                students={registrationData?.students || []}
                                teachers={registrationData?.teachers || []}
                                parents={registrationData?.parents || []}
                                isLoading={isRegistrationLoading}
                            />
                        </div>

                        {/* Donut Chart */}
                        <UserDistributionDonut
                            distribution={stats}
                            isLoading={isRegistrationLoading}
                        />
                    </div>

                    {/* Recent Registrations Table */}
                    <RecentRegistrationsTable
                        registrations={recentRegistrations}
                        isLoading={isRegistrationLoading}
                        onViewAll={() => setShowAllRegistrationsModal(true)}
                    />
                </div>
            )}

            {/* Financial Tab */}
            {activeTab === 'financial' && (
                <div className="space-y-8">
                    {/* Financial Loading State */}
                    {isFinancialLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <StatsCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : financialStats ? (
                        <>
                            {/* Financial Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Total Revenue */}
                                <StatsCard
                                    title="إجمالي الإيرادات"
                                    value={formatCurrency(financialStats.payments.approved_amount)}
                                    change={undefined}
                                    icon={<DollarSign size={24} />}
                                    bgColor="bg-gradient-to-br from-emerald-50 to-emerald-100"
                                    iconBgColor="bg-emerald-500"
                                />

                                {/* Pending Amount */}
                                <StatsCard
                                    title="مبالغ معلقة"
                                    value={formatCurrency(financialStats.payments.pending_amount)}
                                    change={undefined}
                                    icon={<TrendingUp size={24} />}
                                    bgColor="bg-gradient-to-br from-amber-50 to-amber-100"
                                    iconBgColor="bg-amber-500"
                                />

                                {/* Active Subscriptions */}
                                <StatsCard
                                    title="الاشتراكات النشطة"
                                    value={financialStats.subscriptions.active_subscriptions.toLocaleString('ar-EG')}
                                    change={undefined}
                                    icon={<UserCheck size={24} />}
                                    bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
                                    iconBgColor="bg-blue-500"
                                />

                                {/* Total Payments */}
                                <StatsCard
                                    title="إجمالي المدفوعات"
                                    value={financialStats.payments.total_payments.toLocaleString('ar-EG')}
                                    change={undefined}
                                    icon={<Users size={24} />}
                                    bgColor="bg-gradient-to-br from-purple-50 to-purple-100"
                                    iconBgColor="bg-purple-500"
                                />
                            </div>

                            {/* Payment Status Summary */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Payments Breakdown */}
                                <div className="bg-white dark:bg-[#1E1E1E] rounded-[20px] shadow-card border border-slate-100 dark:border-white/10 p-6">
                                    <h3 className="font-bold text-charcoal dark:text-white text-lg mb-6">ملخص المدفوعات</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                                                <span className="font-medium text-charcoal dark:text-white">مدفوعات معتمدة</span>
                                            </div>
                                            <div className="text-left">
                                                <span className="font-bold text-emerald-600">{financialStats.payments.approved_count}</span>
                                                <span className="text-slate-500 text-sm mr-2">({formatCurrency(financialStats.payments.approved_amount)})</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 bg-amber-500 rounded-full" />
                                                <span className="font-medium text-charcoal dark:text-white">مدفوعات معلقة</span>
                                            </div>
                                            <div className="text-left">
                                                <span className="font-bold text-amber-600">{financialStats.payments.pending_count}</span>
                                                <span className="text-slate-500 text-sm mr-2">({formatCurrency(financialStats.payments.pending_amount)})</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 bg-red-500 rounded-full" />
                                                <span className="font-medium text-charcoal dark:text-white">مدفوعات مرفوضة</span>
                                            </div>
                                            <div className="text-left">
                                                <span className="font-bold text-red-600">{financialStats.payments.rejected_count}</span>
                                                <span className="text-slate-500 text-sm mr-2">({formatCurrency(financialStats.payments.rejected_amount)})</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Subscriptions Breakdown */}
                                <div className="bg-white dark:bg-[#1E1E1E] rounded-[20px] shadow-card border border-slate-100 dark:border-white/10 p-6">
                                    <h3 className="font-bold text-charcoal dark:text-white text-lg mb-6">ملخص الاشتراكات</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                                                <span className="font-medium text-charcoal dark:text-white">اشتراكات نشطة</span>
                                            </div>
                                            <span className="font-bold text-blue-600 text-xl">{financialStats.subscriptions.active_subscriptions}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 bg-slate-400 rounded-full" />
                                                <span className="font-medium text-charcoal dark:text-white">اشتراكات غير نشطة</span>
                                            </div>
                                            <span className="font-bold text-slate-600 text-xl">{financialStats.subscriptions.inactive_subscriptions}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                                                <span className="font-medium text-charcoal dark:text-white">اشتراكات حالية (سارية)</span>
                                            </div>
                                            <span className="font-bold text-emerald-600 text-xl">{financialStats.subscriptions.current_subscriptions}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 bg-purple-500 rounded-full" />
                                                <span className="font-medium text-charcoal dark:text-white">إجمالي الاشتراكات</span>
                                            </div>
                                            <span className="font-bold text-purple-600 text-xl">{financialStats.subscriptions.total_subscriptions}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#1E1E1E] rounded-[20px] border border-slate-100 dark:border-white/10 shadow-sm">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                                <DollarSign size={32} className="text-shibl-crimson" />
                            </div>
                            <h3 className="text-xl font-bold text-charcoal dark:text-white mb-2">لا توجد بيانات مالية</h3>
                            <p className="text-slate-500">لم يتم العثور على بيانات مالية في هذه الفترة.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Content Tab Placeholder */}
            {activeTab === 'content' && (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#1E1E1E] rounded-[20px] border border-slate-100 dark:border-white/10 shadow-sm">
                    <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                        <BookOpen size={32} className="text-purple-500" />
                    </div>
                    <h3 className="text-xl font-bold text-charcoal dark:text-white mb-2">تحليلات المحتوى قريباً</h3>
                    <p className="text-slate-500">ستتمكن قريباً من تتبع أداء الكورسات والدروس الأكثر مشاهدة.</p>
                </div>
            )}

            {/* All Registrations Modal */}
            <AllRegistrationsModal
                isOpen={showAllRegistrationsModal}
                onClose={() => setShowAllRegistrationsModal(false)}
                registrations={allRegistrations}
                isLoading={isAllRegistrationsLoading}
            />
        </>
    );
}
