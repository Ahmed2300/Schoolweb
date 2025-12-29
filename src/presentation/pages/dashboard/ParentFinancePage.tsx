import { useState } from 'react';
import {
    CreditCard,
    Download,
    Clock,
    CheckCircle2,
    AlertCircle,
    Plus,
    FileText,
    DollarSign
} from 'lucide-react';

// Mock Data Types
interface Transaction {
    id: string;
    description: string;
    studentName: string;
    date: string;
    amount: number;
    status: 'paid' | 'pending' | 'failed';
    invoiceUrl: string;
}

interface PaymentMethod {
    id: string;
    type: 'visa' | 'mastercard';
    last4: string;
    expiry: string;
    isDefault: boolean;
}

export function ParentFinancePage() {
    // Mock Data
    const [transactions] = useState<Transaction[]>([
        { id: 'INV-2024-001', description: 'اشتراك الفصل الدراسي الأول - رياضيات', studentName: 'أحمد', date: '2024-09-01', amount: 15.000, status: 'paid', invoiceUrl: '#' },
        { id: 'INV-2024-002', description: 'اشتراك الفصل الدراسي الأول - علوم', studentName: 'أحمد', date: '2024-09-01', amount: 15.000, status: 'paid', invoiceUrl: '#' },
        { id: 'INV-2024-003', description: 'اشتراك شهري - لغة إنجليزية', studentName: 'سارة', date: '2024-10-05', amount: 10.000, status: 'paid', invoiceUrl: '#' },
        { id: 'INV-2024-004', description: 'رسوم التسجيل المتأخر', studentName: 'سارة', date: '2024-10-05', amount: 5.000, status: 'pending', invoiceUrl: '#' },
        { id: 'INV-2024-005', description: 'كتاب الأنشطة التفاعلية', studentName: 'أحمد', date: '2024-11-20', amount: 8.500, status: 'failed', invoiceUrl: '#' },
    ]);

    const [paymentMethods] = useState<PaymentMethod[]>([
        { id: 'pm_1', type: 'visa', last4: '4242', expiry: '12/25', isDefault: true },
        { id: 'pm_2', type: 'mastercard', last4: '8899', expiry: '08/26', isDefault: false },
    ]);

    // Derived Stats
    const totalDue = transactions.filter(t => t.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0);
    const totalPaid = transactions.filter(t => t.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-charcoal mb-2">المالية والمدفوعات</h1>
                <p className="text-slate-500 text-sm">إدارة الفواتير وطرق الدفع وسجل المعاملات</p>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Due (Outstanding) */}
                <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                                <AlertCircle size={24} />
                            </div>
                            {totalDue > 0 && (
                                <button className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-red-600 transition-colors">
                                    دفع الآن
                                </button>
                            )}
                        </div>
                        <p className="text-slate-500 font-bold text-sm mb-1">المبالغ المستحقة</p>
                        <h3 className="text-3xl font-extrabold text-charcoal">{totalDue.toFixed(3)} <span className="text-sm text-slate-400">ر.ع</span></h3>
                    </div>
                </div>

                {/* Total Paid */}
                <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center">
                            <CheckCircle2 size={24} />
                        </div>
                    </div>
                    <p className="text-slate-500 font-bold text-sm mb-1">إجمالي المدفوعات</p>
                    <h3 className="text-3xl font-extrabold text-charcoal">{totalPaid.toFixed(3)} <span className="text-sm text-slate-400">ر.ع</span></h3>
                </div>

                {/* Payment Methods */}
                <div className="bg-charcoal text-white p-6 rounded-[24px] shadow-lg relative overflow-hidden group cursor-pointer transition-transform hover:scale-[1.02]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                <CreditCard size={24} />
                            </div>
                            <span className="bg-white/10 px-2 py-1 rounded text-xs">الافتراضية</span>
                        </div>

                        <div>
                            <p className="text-white/60 text-sm font-bold mb-1">Visa تنتهي في {paymentMethods[0].expiry}</p>
                            <p className="text-2xl font-mono tracking-wider">•••• {paymentMethods[0].last4}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Transaction History Table */}
                <div className="lg:col-span-2 bg-white rounded-[24px] border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-charcoal">سجل المعاملات</h3>
                        <button className="text-shibl-crimson text-sm font-bold flex items-center gap-1 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                            <Download size={16} />
                            تصدير كشف حساب
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-right border-b border-slate-100">
                                    <th className="pb-4 text-slate-400 font-bold text-xs">رقم الفاتورة</th>
                                    <th className="pb-4 text-slate-400 font-bold text-xs">الوصف</th>
                                    <th className="pb-4 text-slate-400 font-bold text-xs">الطالب</th>
                                    <th className="pb-4 text-slate-400 font-bold text-xs">التاريخ</th>
                                    <th className="pb-4 text-slate-400 font-bold text-xs">المبلغ</th>
                                    <th className="pb-4 text-slate-400 font-bold text-xs">الحالة</th>
                                    <th className="pb-4 text-slate-400 font-bold text-xs"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {transactions.map((tx) => (
                                    <tr key={tx.id} className="group hover:bg-slate-50 transition-colors">
                                        <td className="py-4 font-mono text-xs text-slate-500 font-bold">{tx.id}</td>
                                        <td className="py-4 font-bold text-charcoal text-sm">{tx.description}</td>
                                        <td className="py-4 text-sm text-slate-600">{tx.studentName}</td>
                                        <td className="py-4 text-sm text-slate-500 font-medium">{tx.date}</td>
                                        <td className="py-4 font-bold text-charcoal">{tx.amount.toFixed(3)} ر.ع</td>
                                        <td className="py-4">
                                            <span className={`
                                                inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold
                                                ${tx.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                    tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}
                                            `}>
                                                {tx.status === 'paid' && <CheckCircle2 size={12} />}
                                                {tx.status === 'pending' && <Clock size={12} />}
                                                {tx.status === 'failed' && <AlertCircle size={12} />}
                                                {tx.status === 'paid' ? 'مدفوع' : tx.status === 'pending' ? 'مستحق' : 'فشل'}
                                            </span>
                                        </td>
                                        <td className="py-4 text-left">
                                            <button className="p-2 text-slate-400 hover:text-shibl-crimson hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200">
                                                <FileText size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sidebar: Payment Methods & Actions */}
                <div className="space-y-6">
                    {/* Add Method Card */}
                    <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-charcoal mb-4">طرق الدفع المحفوظة</h3>
                        <div className="space-y-3">
                            {paymentMethods.map(method => (
                                <div key={method.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-slate-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-8 bg-white border border-slate-200 rounded flex items-center justify-center">
                                            {method.type === 'visa' ? <span className="font-bold text-blue-800 text-xs italic">VISA</span> : <span className="font-bold text-red-600 text-xs">MC</span>}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-charcoal">•••• {method.last4}</p>
                                            <p className="text-[10px] text-slate-400">تنتهي في {method.expiry}</p>
                                        </div>
                                    </div>
                                    {method.isDefault && <span className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-500">الافتراضي</span>}
                                </div>
                            ))}

                            <button className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center gap-2 text-slate-400 font-bold text-sm hover:border-shibl-crimson hover:text-shibl-crimson transition-all">
                                <Plus size={18} />
                                إضافة بطاقة جديدة
                            </button>
                        </div>
                    </div>

                    {/* Subscription Summary */}
                    <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-[24px] p-6 text-white shadow-lg">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h3 className="font-bold text-lg">باقة العائلة</h3>
                                <p className="text-slate-400 text-xs mt-1">تجدد في 1 يناير 2025</p>
                            </div>
                            <div className="bg-white/10 p-2 rounded-lg">
                                <DollarSign size={20} className="text-yellow-400" />
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">إجمالي الأبناء</span>
                                <span className="font-bold">2 طالب</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">إجمالي المواد</span>
                                <span className="font-bold">10 مواد</span>
                            </div>
                            <div className="h-px bg-white/10 my-2"></div>
                            <div className="flex justify-between text-lg">
                                <span className="text-slate-200 font-bold">المجموع الشهري</span>
                                <span className="font-bold text-yellow-400">30.000 ر.ع</span>
                            </div>
                        </div>

                        <button className="w-full bg-white text-charcoal font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors">
                            إدارة الاشتراك
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
