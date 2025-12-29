import { useState } from 'react';
import {
    Save,
    Globe,
    Shield,
    CreditCard,
    Bell,
    Settings,
    Upload,
    AlertTriangle,
    MapPin
} from 'lucide-react';

// Types
type SettingsTab = 'general' | 'roles' | 'locations' | 'payments' | 'notifications';

export function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');

    // Form States (Mock)
    const [siteName, setSiteName] = useState('منصتي التعليمية');
    const [supportEmail, setSupportEmail] = useState('support@platform.com');
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [registrationOpen, setRegistrationOpen] = useState(true);

    // Mock Data for Roles (Preview)
    const roles = [
        { id: 1, name: 'Admin', description: 'كامل الصلاحيات', users: 3 },
        { id: 2, name: 'Teacher', description: 'إدارة الكورسات والطلاب', users: 45 },
        { id: 3, name: 'Student', description: 'تصفح ومشاهدة المحتوى', users: 2500 },
    ];

    return (
        <>
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-extrabold text-charcoal mb-1">الإعدادات</h1>
                    <p className="text-slate-500 text-sm">تخصيص خصائص المنصة وإدارة النظام</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="h-11 px-6 rounded-[12px] bg-shibl-crimson hover:bg-red-800 text-white font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-red-900/10">
                        <Save size={18} />
                        <span>حفظ التغييرات</span>
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 mb-8 overflow-x-auto">
                <div className="flex items-center gap-6 min-w-max">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`pb-4 px-2 font-bold text-sm transition-all relative flex items-center gap-2 ${activeTab === 'general' ? 'text-shibl-crimson' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Settings size={20} />
                        <span>عام</span>
                        {activeTab === 'general' && <div className="absolute bottom-0 right-0 left-0 h-0.5 bg-shibl-crimson rounded-t-full" />}
                    </button>

                    <button
                        onClick={() => setActiveTab('roles')}
                        className={`pb-4 px-2 font-bold text-sm transition-all relative flex items-center gap-2 ${activeTab === 'roles' ? 'text-shibl-crimson' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Shield size={20} />
                        <span>الأدوار والصلاحيات</span>
                        {activeTab === 'roles' && <div className="absolute bottom-0 right-0 left-0 h-0.5 bg-shibl-crimson rounded-t-full" />}
                    </button>

                    <button
                        onClick={() => setActiveTab('locations')}
                        className={`pb-4 px-2 font-bold text-sm transition-all relative flex items-center gap-2 ${activeTab === 'locations' ? 'text-shibl-crimson' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <MapPin size={20} />
                        <span>البلدان والمدن</span>
                        {activeTab === 'locations' && <div className="absolute bottom-0 right-0 left-0 h-0.5 bg-shibl-crimson rounded-t-full" />}
                    </button>

                    <button
                        onClick={() => setActiveTab('payments')}
                        className={`pb-4 px-2 font-bold text-sm transition-all relative flex items-center gap-2 ${activeTab === 'payments' ? 'text-shibl-crimson' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <CreditCard size={20} />
                        <span>بوابات الدفع</span>
                        {activeTab === 'payments' && <div className="absolute bottom-0 right-0 left-0 h-0.5 bg-shibl-crimson rounded-t-full" />}
                    </button>

                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`pb-4 px-2 font-bold text-sm transition-all relative flex items-center gap-2 ${activeTab === 'notifications' ? 'text-shibl-crimson' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Bell size={20} />
                        <span>الإشعارات</span>
                        {activeTab === 'notifications' && <div className="absolute bottom-0 right-0 left-0 h-0.5 bg-shibl-crimson rounded-t-full" />}
                    </button>
                </div>
            </div>

            {/* General Tab Content */}
            {activeTab === 'general' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Platform Info */}
                    <div className="bg-white rounded-[20px] shadow-card border border-slate-100 p-6">
                        <h3 className="font-bold text-charcoal mb-6 flex items-center gap-2">
                            <Settings size={20} className="text-slate-400" />
                            معلومات المنصة
                        </h3>

                        <div className="flex flex-col md:flex-row gap-6 mb-6 items-center md:items-start">
                            {/* Logo Upload */}
                            <div className="shrink-0 flex flex-col items-center gap-2">
                                <div className="w-32 h-32 rounded-full border-2 border-dashed border-slate-300 hover:border-shibl-crimson bg-slate-50 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                                    <Upload size={24} className="text-slate-400 group-hover:text-shibl-crimson transition-colors" />
                                    <span className="text-xs text-slate-500 mt-2">تحميل الشعار</span>
                                </div>
                                <span className="text-xs text-slate-400">PNG, JPG (Max 2MB)</span>
                            </div>

                            {/* Inputs */}
                            <div className="flex-1 w-full space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">اسم الموقع</label>
                                    <input
                                        type="text"
                                        value={siteName}
                                        onChange={(e) => setSiteName(e.target.value)}
                                        className="w-full h-11 px-4 rounded-[10px] border border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-sm font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">بريد الدعم الفني</label>
                                    <input
                                        type="email"
                                        value={supportEmail}
                                        onChange={(e) => setSupportEmail(e.target.value)}
                                        className="w-full h-11 px-4 rounded-[10px] border border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-sm font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">وصف مختصر (SEO)</label>
                            <textarea
                                className="w-full h-24 px-4 py-3 rounded-[10px] border border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-sm font-medium resize-none"
                                placeholder="منصة تعليمية رائدة..."
                            />
                        </div>
                    </div>

                    {/* System Settings */}
                    <div className="bg-white rounded-[20px] shadow-card border border-slate-100 p-6">
                        <h3 className="font-bold text-charcoal mb-6 flex items-center gap-2">
                            <Shield size={20} className="text-slate-400" />
                            إعدادات النظام
                        </h3>

                        <div className="space-y-6">
                            {/* Maintenance Mode */}
                            <div className="flex items-center justify-between p-4 rounded-[12px] bg-slate-50 border border-slate-100">
                                <div>
                                    <p className="font-bold text-charcoal text-sm">وضع الصيانة</p>
                                    <p className="text-xs text-slate-500 mt-1">عند التفعيل، ستكون المنصة غير متاحة للزوار</p>
                                </div>
                                <button
                                    onClick={() => setMaintenanceMode(!maintenanceMode)}
                                    className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${maintenanceMode ? 'bg-red-500' : 'bg-slate-300'
                                        }`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-sm ${maintenanceMode ? 'left-1' : 'left-6'
                                        }`} />
                                </button>
                            </div>

                            {/* Registration Toggle */}
                            <div className="flex items-center justify-between p-4 rounded-[12px] bg-slate-50 border border-slate-100">
                                <div>
                                    <p className="font-bold text-charcoal text-sm">فتح التسجيل</p>
                                    <p className="text-xs text-slate-500 mt-1">السماح بتسجيل مستخدمين جدد</p>
                                </div>
                                <button
                                    onClick={() => setRegistrationOpen(!registrationOpen)}
                                    className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${registrationOpen ? 'bg-green-500' : 'bg-slate-300'
                                        }`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-sm ${registrationOpen ? 'left-1' : 'left-6'
                                        }`} />
                                </button>
                            </div>

                            {/* Default Language */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-2">اللغة الافتراضية</label>
                                <div className="relative">
                                    <select className="w-full h-11 px-4 rounded-[10px] border border-slate-200 focus:border-shibl-crimson outline-none text-sm font-medium appearance-none bg-white">
                                        <option value="ar">العربية (Arabic)</option>
                                        <option value="en">الإنجليزية (English)</option>
                                    </select>
                                    <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Roles Tab Placeholder */}
            {activeTab === 'roles' && (
                <div className="bg-white rounded-[20px] shadow-card border border-slate-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-charcoal">الأدوار المتاحة</h3>
                        <button className="text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-bold hover:bg-blue-100 transition-colors">
                            + إضافة دور جديد
                        </button>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {roles.map((role) => (
                            <div key={role.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div>
                                    <h4 className="font-bold text-charcoal">{role.name}</h4>
                                    <p className="text-sm text-slate-500">{role.description}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                                        {role.users} مستخدم
                                    </span>
                                    <button className="text-slate-400 hover:text-shibl-crimson">
                                        <Settings size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Locations Tab Placeholder */}
            {activeTab === 'locations' && (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[20px] border border-slate-100 shadow-sm">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                        <MapPin size={32} className="text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold text-charcoal mb-2">إدارة المواقع</h3>
                    <p className="text-slate-500">سيتم إضافة إدارة الدول والمدن هنا (API Available)</p>
                    <div className="mt-4 flex gap-2">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-mono rounded">GET /api/v1/countries</span>
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-mono rounded">GET /api/v1/cities</span>
                    </div>
                </div>
            )}

            {/* Other Tabs */}
            {(activeTab === 'payments' || activeTab === 'notifications') && (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[20px] border border-slate-100 shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle size={32} className="text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-charcoal mb-2">قريباً</h3>
                    <p className="text-slate-500">هذا القسم قيد التطوير</p>
                </div>
            )}
        </>
    );
}
