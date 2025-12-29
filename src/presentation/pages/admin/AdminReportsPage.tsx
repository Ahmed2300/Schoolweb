import { useState } from 'react';
import {
    Calendar,
    Download,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    BookOpen,
    CreditCard,
    PieChart,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Filter,
    MoreHorizontal,
    Clock
} from 'lucide-react';

// Types
type ReportTab = 'financial' | 'users' | 'content';

// Mock Data
const transactions = [
    { id: 'TRX-9821', student: 'أحمد علي', item: 'باقة الصف الثالث - الفصل الأول', amount: '45.000 ر.ع', date: '28 ديسمبر 2024', status: 'completed' },
    { id: 'TRX-9822', student: 'سارة محمد', item: 'كورس أساسيات التصميم', amount: '15.000 ر.ع', date: '28 ديسمبر 2024', status: 'completed' },
    { id: 'TRX-9823', student: 'خالد يوسف', item: 'باقة اللغة الإنجليزية', amount: '30.000 ر.ع', date: '27 ديسمبر 2024', status: 'pending' },
    { id: 'TRX-9824', student: 'نورة عبدالله', item: 'كورس البرمجة للأطفال', amount: '20.000 ر.ع', date: '27 ديسمبر 2024', status: 'refunded' },
    { id: 'TRX-9825', student: 'عمر حسن', item: 'باقة الرياضيات الشاملة', amount: '50.000 ر.ع', date: '26 ديسمبر 2024', status: 'completed' },
];

const monthlyRevenue = [
    { month: 'يناير', value: 65, label: '3.2K' },
    { month: 'فبراير', value: 45, label: '2.4K' },
    { month: 'مارس', value: 75, label: '3.8K' },
    { month: 'أبريل', value: 55, label: '2.9K' },
    { month: 'مايو', value: 85, label: '4.5K' },
    { month: 'يونيو', value: 70, label: '3.6K' },
];

export function AdminReportsPage() {
    const [activeTab, setActiveTab] = useState<ReportTab>('financial');
    const [dateRange, setDateRange] = useState('ديسمبر 2024');

    return (
        <>
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-extrabold text-charcoal mb-1">التقارير والتحليلات</h1>
                    <p className="text-slate-500 text-sm">نظرة شاملة على أداء المنصة والإيرادات</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Date Picker Mock */}
                    <div className="h-11 px-4 bg-white border border-slate-200 rounded-[12px] flex items-center gap-2 text-slate-600 font-medium text-sm cursor-pointer hover:border-shibl-crimson transition-colors">
                        <Calendar size={18} />
                        <span>{dateRange}</span>
                    </div>

                    {/* Export Button */}
                    <button className="h-11 px-5 rounded-[12px] bg-white border border-slate-200 hover:border-shibl-crimson text-slate-600 hover:text-shibl-crimson font-semibold text-sm transition-all flex items-center gap-2">
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
                        className={`pb-4 px-2 font-bold text-sm transition-all relative ${activeTab === 'financial'
                            ? 'text-shibl-crimson'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <DollarSign size={20} />
                            <span>التقارير المالية</span>
                        </div>
                        {activeTab === 'financial' && (
                            <div className="absolute bottom-0 right-0 left-0 h-0.5 bg-shibl-crimson rounded-t-full" />
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab('users')}
                        className={`pb-4 px-2 font-bold text-sm transition-all relative ${activeTab === 'users'
                            ? 'text-shibl-crimson'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Users size={20} />
                            <span>تحليلات المستخدمين</span>
                        </div>
                        {activeTab === 'users' && (
                            <div className="absolute bottom-0 right-0 left-0 h-0.5 bg-shibl-crimson rounded-t-full" />
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab('content')}
                        className={`pb-4 px-2 font-bold text-sm transition-all relative ${activeTab === 'content'
                            ? 'text-shibl-crimson'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <BookOpen size={20} />
                            <span>أداء المحتوى</span>
                        </div>
                        {activeTab === 'content' && (
                            <div className="absolute bottom-0 right-0 left-0 h-0.5 bg-shibl-crimson rounded-t-full" />
                        )}
                    </button>
                </div>
            </div>

            {/* Content Content - Financial Tab */}
            {activeTab === 'financial' && (
                <div className="space-y-6">
                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Revenue Card */}
                        <div className="bg-white rounded-[20px] p-6 shadow-card border border-slate-100 relative overflow-hidden group">
                            <div className="absolute -left-4 -top-4 w-24 h-24 bg-red-50 rounded-full group-hover:scale-110 transition-transform duration-500" />
                            <div className="relative">
                                <p className="text-slate-500 font-medium mb-2">إجمالي الإيرادات</p>
                                <div className="flex items-end gap-3 mb-2">
                                    <h3 className="text-3xl font-extrabold text-charcoal">4,500 ر.ع</h3>
                                    <span className="flex items-center text-green-500 bg-green-50 px-2 py-0.5 rounded-full text-xs font-bold mb-1">
                                        <TrendingUp size={14} className="ml-1" />
                                        12.5%
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400">مقارنة بالشهر الماضي</p>
                            </div>
                        </div>

                        {/* Profit Card */}
                        <div className="bg-white rounded-[20px] p-6 shadow-card border border-slate-100 relative overflow-hidden group">
                            <div className="absolute -left-4 -top-4 w-24 h-24 bg-green-50 rounded-full group-hover:scale-110 transition-transform duration-500" />
                            <div className="relative">
                                <p className="text-slate-500 font-medium mb-2">صافي الربح</p>
                                <div className="flex items-end gap-3 mb-2">
                                    <h3 className="text-3xl font-extrabold text-charcoal">3,850 ر.ع</h3>
                                    <span className="flex items-center text-green-500 bg-green-50 px-2 py-0.5 rounded-full text-xs font-bold mb-1">
                                        <TrendingUp size={14} className="ml-1" />
                                        8.2%
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400">بعد خصم العمولات والمصاريف</p>
                            </div>
                        </div>

                        {/* Pending Payouts Card */}
                        <div className="bg-white rounded-[20px] p-6 shadow-card border border-slate-100 relative overflow-hidden group">
                            <div className="absolute -left-4 -top-4 w-24 h-24 bg-amber-50 rounded-full group-hover:scale-110 transition-transform duration-500" />
                            <div className="relative">
                                <p className="text-slate-500 font-medium mb-2">مدفوعات معلقة</p>
                                <div className="flex items-end gap-3 mb-2">
                                    <h3 className="text-3xl font-extrabold text-charcoal">240 ر.ع</h3>
                                    <span className="flex items-center text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-xs font-bold mb-1">
                                        <Clock size={14} className="ml-1" />
                                        5 طلبات
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400">بانتظار الموافقة</p>
                            </div>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Bar Chart */}
                        <div className="lg:col-span-2 bg-white rounded-[20px] p-6 shadow-card border border-slate-100">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="font-bold text-charcoal text-lg">تحليل الإيرادات الشهرية</h3>
                                <button className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>

                            {/* Simple CSS Bar Chart */}
                            <div className="h-64 flex items-end justify-between gap-4 px-2">
                                {monthlyRevenue.map((item, index) => (
                                    <div key={index} className="flex flex-col items-center gap-3 group flex-1">
                                        <div className="relative w-full max-w-[40px] bg-slate-100 rounded-t-[8px] h-full flex items-end overflow-hidden">
                                            <div
                                                className="w-full bg-shibl-crimson rounded-t-[8px] transition-all duration-1000 group-hover:bg-red-700 relative"
                                                style={{ height: `${item.value}%` }}
                                            >
                                                <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-charcoal text-white text-xs font-bold py-1 px-2 rounded transition-opacity whitespace-nowrap z-10">
                                                    {item.label} ر.ع
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-xs font-medium text-slate-500">{item.month}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Donut Chart Visual */}
                        <div className="bg-white rounded-[20px] p-6 shadow-card border border-slate-100">
                            <h3 className="font-bold text-charcoal text-lg mb-8">توزيع الإيرادات</h3>

                            <div className="relative w-48 h-48 mx-auto mb-8">
                                {/* SVG Donut Chart */}
                                <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F1F5F9" strokeWidth="20" />
                                    {/* Segment 1: Academic (70%) */}
                                    <circle
                                        cx="50" cy="50" r="40"
                                        fill="transparent"
                                        stroke="#AF0C15"
                                        strokeWidth="20"
                                        strokeDasharray="175.9 251.2" // 70% of circumference (2 * pi * 40 ≈ 251.2)
                                        className="transition-all duration-1000 ease-out"
                                    />
                                    {/* Segment 2: Skills (30%) */}
                                    <circle
                                        cx="50" cy="50" r="40"
                                        fill="transparent"
                                        stroke="#10B981"
                                        strokeWidth="20"
                                        strokeDasharray="75.4 251.2" // 30%
                                        strokeDashoffset="-175.9"
                                        className="transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                {/* Center Text */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-xs text-slate-400 font-medium">الإجمالي</span>
                                    <span className="text-xl font-extrabold text-charcoal">4.5K</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-shibl-crimson" />
                                        <span className="text-sm font-medium text-slate-600">المسار الأكاديمي</span>
                                    </div>
                                    <span className="text-sm font-bold text-charcoal">70%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                        <span className="text-sm font-medium text-slate-600">تطوير المهارات</span>
                                    </div>
                                    <span className="text-sm font-bold text-charcoal">30%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Transactions Table */}
                    <div className="bg-white rounded-[20px] shadow-card border border-slate-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-charcoal text-lg">المعاملات الأخيرة</h3>
                            <button className="text-sm text-shibl-crimson font-bold hover:underline">عرض الكل</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">رقم المعاملة</th>
                                        <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الطالب</th>
                                        <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الخدمة / المنتج</th>
                                        <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">التاريخ</th>
                                        <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">المبلغ</th>
                                        <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الحالة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {transactions.map((trx) => (
                                        <tr key={trx.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-sm text-slate-500">{trx.id}</td>
                                            <td className="px-6 py-4 font-bold text-charcoal text-sm">{trx.student}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{trx.item}</td>
                                            <td className="px-6 py-4 text-sm text-slate-500">{trx.date}</td>
                                            <td className="px-6 py-4 font-bold text-charcoal text-sm">{trx.amount}</td>
                                            <td className="px-6 py-4">
                                                {trx.status === 'completed' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                                                        <ArrowUpRight size={14} />
                                                        ناجحة
                                                    </span>
                                                )}
                                                {trx.status === 'pending' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                                                        <Clock size={14} />
                                                        معلقة
                                                    </span>
                                                )}
                                                {trx.status === 'refunded' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                                                        <ArrowDownRight size={14} />
                                                        مستردة
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Users Tab Placeholder */}
            {activeTab === 'users' && (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[20px] border border-slate-100 shadow-sm">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                        <Users size={32} className="text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold text-charcoal mb-2">تحليلات المستخدمين قريباً</h3>
                    <p className="text-slate-500">جاري العمل على تطوير لوحة تحليلات تفاعلية لنمو وقرار المستخدمين.</p>
                </div>
            )}

            {/* Content Tab Placeholder */}
            {activeTab === 'content' && (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[20px] border border-slate-100 shadow-sm">
                    <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                        <BookOpen size={32} className="text-purple-500" />
                    </div>
                    <h3 className="text-xl font-bold text-charcoal mb-2">تحليلات المحتوى قريباً</h3>
                    <p className="text-slate-500">ستتمكن قريباً من تتبع أداء الكورسات والدروس الأكثر مشاهدة.</p>
                </div>
            )}
        </>
    );
}
