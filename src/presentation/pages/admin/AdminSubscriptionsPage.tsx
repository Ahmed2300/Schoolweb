import { useState } from 'react';
import {
    Search,
    Download,
    CreditCard,
    Clock,
    AlertCircle,
    DollarSign,
    Calendar,
    Check,
    X,
    Eye,
    FileText,
    User,
    BookOpen,
    XCircle
} from 'lucide-react';

// Types
type SubTab = 'pending' | 'active' | 'expired';
type SubscriptionType = 'course' | 'package';
type SubscriptionStatus = 'active' | 'pending' | 'expired' | 'rejected';

interface PendingSubscription {
    id: number;
    studentName: string;
    avatar: string;
    courseName: string;
    type: SubscriptionType;
    amount: string;
    receiptDate: string;
    receiptImage?: string;
}

interface ActiveSubscription {
    id: number;
    studentName: string;
    avatar: string;
    subscriptionType: SubscriptionType;
    coursesIncluded: string[];
    startDate: string;
    endDate: string;
    daysRemaining: number;
    totalDays: number;
}

// Mock data - Pending
const mockPendingSubscriptions: PendingSubscription[] = [
    { id: 1, studentName: 'أحمد علي', avatar: 'أ', courseName: 'الرياضيات - الصف الثالث', type: 'course', amount: '15 ر.ع', receiptDate: 'منذ ساعتين' },
    { id: 2, studentName: 'فاطمة حسن', avatar: 'ف', courseName: 'باقة الترم الأول الكاملة', type: 'package', amount: '45 ر.ع', receiptDate: 'منذ 4 ساعات' },
    { id: 3, studentName: 'محمد سالم', avatar: 'م', courseName: 'تجويد القرآن الكريم', type: 'course', amount: '25 ر.ع', receiptDate: 'منذ يوم' },
];

// Mock data - Active
const mockActiveSubscriptions: ActiveSubscription[] = [
    { id: 1, studentName: 'نور الهدى', avatar: 'ن', subscriptionType: 'package', coursesIncluded: ['الرياضيات', 'الفيزياء', 'اللغة العربية'], startDate: '1 ديسمبر 2024', endDate: '1 مارس 2025', daysRemaining: 62, totalDays: 90 },
    { id: 2, studentName: 'يوسف أحمد', avatar: 'ي', subscriptionType: 'course', coursesIncluded: ['أساسيات البرمجة'], startDate: '15 نوفمبر 2024', endDate: '15 فبراير 2025', daysRemaining: 48, totalDays: 90 },
    { id: 3, studentName: 'مريم خالد', avatar: 'م', subscriptionType: 'course', coursesIncluded: ['تجويد القرآن'], startDate: '20 ديسمبر 2024', endDate: '20 مارس 2025', daysRemaining: 81, totalDays: 90 },
];

const stats = [
    { icon: <CreditCard size={22} className="text-green-600" />, label: 'الاشتراكات النشطة', value: '2,540', bgColor: 'bg-green-50' },
    { icon: <Clock size={22} className="text-amber-600" />, label: 'طلبات معلقة', value: '12', bgColor: 'bg-amber-50' },
    { icon: <DollarSign size={22} className="text-shibl-crimson" />, label: 'إيرادات الشهر', value: '4,500 ر.ع', bgColor: 'bg-red-50' },
    { icon: <AlertCircle size={22} className="text-blue-600" />, label: 'تنتهي قريباً', value: '85', bgColor: 'bg-blue-50' },
];

const typeConfig: Record<SubscriptionType, { label: string; bgColor: string; textColor: string }> = {
    course: { label: 'كورس', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
    package: { label: 'باقة', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
};

export function AdminSubscriptionsPage() {
    const [activeTab, setActiveTab] = useState<SubTab>('pending');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedReceipt, setSelectedReceipt] = useState<PendingSubscription | null>(null);

    const pendingCount = mockPendingSubscriptions.length;

    return (
        <>
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <h1 className="text-2xl font-extrabold text-charcoal">إدارة الاشتراكات</h1>

                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 lg:w-72">
                        <input
                            type="text"
                            placeholder="بحث بالاسم أو الكورس..."
                            className="w-full h-11 pl-4 pr-11 rounded-[12px] bg-white border border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>

                    {/* Export Button */}
                    <button className="h-11 px-5 rounded-[12px] bg-white border border-slate-200 hover:border-shibl-crimson text-slate-600 hover:text-shibl-crimson font-semibold text-sm transition-all flex items-center gap-2">
                        <Download size={18} />
                        <span>تصدير</span>
                    </button>
                </div>
            </div>

            {/* Main Tabs */}
            <div className="flex gap-3 mb-6">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`flex items-center gap-2 px-5 py-3 rounded-[12px] font-bold text-sm transition-all duration-300 ${activeTab === 'pending'
                            ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25'
                            : 'bg-white text-slate-600 hover:bg-amber-50 border border-slate-200'
                        }`}
                >
                    <Clock size={18} />
                    <span>طلبات معلقة</span>
                    {pendingCount > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'pending' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
                            }`}>
                            {pendingCount}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('active')}
                    className={`flex items-center gap-2 px-5 py-3 rounded-[12px] font-bold text-sm transition-all duration-300 ${activeTab === 'active'
                            ? 'bg-green-600 text-white shadow-lg shadow-green-600/25'
                            : 'bg-white text-slate-600 hover:bg-green-50 border border-slate-200'
                        }`}
                >
                    <CreditCard size={18} />
                    <span>الاشتراكات النشطة</span>
                </button>
                <button
                    onClick={() => setActiveTab('expired')}
                    className={`flex items-center gap-2 px-5 py-3 rounded-[12px] font-bold text-sm transition-all duration-300 ${activeTab === 'expired'
                            ? 'bg-slate-600 text-white shadow-lg shadow-slate-600/25'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                >
                    <XCircle size={18} />
                    <span>منتهية</span>
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

            {/* Pending Tab Content */}
            {activeTab === 'pending' && (
                <div className="bg-white rounded-[16px] shadow-card overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                        <Clock size={20} className="text-amber-600" />
                        <h2 className="font-bold text-charcoal">طلبات الاشتراك المعلقة</h2>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                            {pendingCount} طلب
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الطالب</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الكورس/الباقة</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">النوع</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">المبلغ</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">تاريخ الطلب</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {mockPendingSubscriptions.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                                                    {sub.avatar}
                                                </div>
                                                <span className="font-semibold text-charcoal">{sub.studentName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <BookOpen size={16} className="text-slate-400" />
                                                <span className="text-sm text-charcoal">{sub.courseName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${typeConfig[sub.type].bgColor} ${typeConfig[sub.type].textColor}`}>
                                                {typeConfig[sub.type].label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-shibl-crimson">{sub.amount}</td>
                                        <td className="px-6 py-4 text-sm text-slate-grey">{sub.receiptDate}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setSelectedReceipt(sub)}
                                                    className="py-2 px-3 rounded-[8px] bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs transition-colors flex items-center gap-1"
                                                >
                                                    <Eye size={14} />
                                                    الإيصال
                                                </button>
                                                <button className="py-2 px-4 rounded-[8px] bg-green-100 hover:bg-green-200 text-green-700 font-semibold text-xs transition-colors flex items-center gap-1">
                                                    <Check size={14} />
                                                    قبول
                                                </button>
                                                <button className="py-2 px-4 rounded-[8px] bg-red-100 hover:bg-red-200 text-red-600 font-semibold text-xs transition-colors flex items-center gap-1">
                                                    <X size={14} />
                                                    رفض
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Active Tab Content */}
            {activeTab === 'active' && (
                <div className="bg-white rounded-[16px] shadow-card overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                        <CreditCard size={20} className="text-green-600" />
                        <h2 className="font-bold text-charcoal">الاشتراكات النشطة</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الطالب</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">النوع</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">الكورسات</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">تاريخ البدء</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">تاريخ الانتهاء</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-grey uppercase">المتبقي</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {mockActiveSubscriptions.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                                                    {sub.avatar}
                                                </div>
                                                <span className="font-semibold text-charcoal">{sub.studentName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${typeConfig[sub.subscriptionType].bgColor} ${typeConfig[sub.subscriptionType].textColor}`}>
                                                {typeConfig[sub.subscriptionType].label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {sub.coursesIncluded.map((course, idx) => (
                                                    <span key={idx} className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                        {course}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-grey">{sub.startDate}</td>
                                        <td className="px-6 py-4 text-sm text-slate-grey">{sub.endDate}</td>
                                        <td className="px-6 py-4">
                                            <div className="w-32">
                                                <div className="flex items-center justify-between text-xs mb-1">
                                                    <span className="font-semibold text-charcoal">{sub.daysRemaining} يوم</span>
                                                    <span className="text-slate-grey">من {sub.totalDays}</span>
                                                </div>
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${sub.daysRemaining < 14 ? 'bg-red-500' : sub.daysRemaining < 30 ? 'bg-amber-500' : 'bg-green-500'
                                                            }`}
                                                        style={{ width: `${(sub.daysRemaining / sub.totalDays) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Expired Tab Content */}
            {activeTab === 'expired' && (
                <div className="bg-white rounded-[16px] shadow-card p-12 text-center">
                    <XCircle size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-charcoal mb-2">لا توجد اشتراكات منتهية</h3>
                    <p className="text-sm text-slate-grey">ستظهر هنا الاشتراكات المنتهية</p>
                </div>
            )}

            {/* Receipt Preview Modal */}
            {selectedReceipt && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedReceipt(null)}>
                    <div className="bg-white rounded-[20px] max-w-lg w-full overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-charcoal">معاينة الإيصال</h3>
                            <button onClick={() => setSelectedReceipt(null)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
                                <X size={18} className="text-slate-500" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            {/* Receipt Image Placeholder */}
                            <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 rounded-[12px] flex items-center justify-center mb-6">
                                <FileText size={48} className="text-slate-400" />
                            </div>

                            {/* Details */}
                            <div className="space-y-4 mb-6">
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-[10px]">
                                    <User size={18} className="text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-grey">الطالب</p>
                                        <p className="font-semibold text-charcoal">{selectedReceipt.studentName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-[10px]">
                                    <BookOpen size={18} className="text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-grey">الكورس/الباقة</p>
                                        <p className="font-semibold text-charcoal">{selectedReceipt.courseName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-[10px]">
                                    <DollarSign size={18} className="text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-grey">المبلغ</p>
                                        <p className="font-bold text-shibl-crimson text-lg">{selectedReceipt.amount}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button className="flex-1 py-3 rounded-[12px] bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2">
                                    <Check size={18} />
                                    قبول الاشتراك
                                </button>
                                <button className="flex-1 py-3 rounded-[12px] bg-red-100 hover:bg-red-200 text-red-600 font-bold text-sm transition-colors flex items-center justify-center gap-2">
                                    <X size={18} />
                                    رفض
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
