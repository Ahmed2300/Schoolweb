import { useState } from 'react';
import {
    User,
    Lock,
    Bell,
    Globe,
    Save,
    Camera,
    Mail,
    Phone,
    MapPin
} from 'lucide-react';
import { useAuthStore } from '../../store';

export function ParentSettingsPage() {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');

    // Mock States
    const [profile, setProfile] = useState({
        name: user?.name || 'ولي أمر الطالب',
        email: user?.email || 'parent@example.com',
        phone: '96123456',
        address: 'مسقط، سلطنة عمان',
        bio: 'مهتم بمتابعة الأنشطة اللاصفية.'
    });

    const [notifications, setNotifications] = useState({
        email_academic: true,
        email_financial: true,
        sms_attendance: true,
        sms_marketing: false
    });

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-extrabold text-charcoal mb-2">إعدادات الحساب</h1>
                <p className="text-slate-500 text-sm">إدارة الملف الشخصي والأمان وتفضيلات الإشعارات</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Settings Sidebar */}
                <div className="lg:col-span-1 space-y-2">
                    {[
                        { id: 'profile', label: 'الملف الشخصي', icon: User },
                        { id: 'security', label: 'كلمة المرور والأمان', icon: Lock },
                        { id: 'notifications', label: 'الإشعارات', icon: Bell },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`
                                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold
                                ${activeTab === tab.id
                                    ? 'bg-shibl-crimson text-white shadow-md'
                                    : 'bg-white text-slate-500 hover:bg-slate-50'
                                }
                            `}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    {activeTab === 'profile' && (
                        <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-8 space-y-8">
                            {/* Avatar Section */}
                            <div className="flex flex-col items-center">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-sm overflow-hidden flex items-center justify-center text-slate-300">
                                        {user?.avatar ? ( // Mock check, actually generic
                                            <img src="/images/avatar-placeholder.png" alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={40} />
                                        )}
                                    </div>
                                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-shibl-crimson text-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform">
                                        <Camera size={14} />
                                    </button>
                                </div>
                                <h3 className="mt-4 font-bold text-lg text-charcoal">{profile.name}</h3>
                                <p className="text-slate-400 text-xs">ولي أمر</p>
                            </div>

                            {/* Form */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">الاسم الكامل</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={profile.name}
                                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                            className="w-full h-11 pl-4 pr-10 rounded-xl bg-slate-50 border border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all text-sm font-bold text-charcoal"
                                        />
                                        <User size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">البريد الإلكتروني</label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            value={profile.email}
                                            disabled
                                            className="w-full h-11 pl-4 pr-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 outline-none text-sm font-bold cursor-not-allowed"
                                        />
                                        <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">رقم الهاتف</label>
                                    <div className="relative">
                                        <input
                                            type="tel"
                                            value={profile.phone}
                                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                            className="w-full h-11 pl-4 pr-10 rounded-xl bg-slate-50 border border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all text-sm font-bold text-charcoal"
                                        />
                                        <Phone size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">العنوان</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={profile.address}
                                            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                            className="w-full h-11 pl-4 pr-10 rounded-xl bg-slate-50 border border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all text-sm font-bold text-charcoal"
                                        />
                                        <MapPin size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            <div className="flex justify-end">
                                <button className="bg-charcoal text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-black transition-colors flex items-center gap-2">
                                    <Save size={18} />
                                    حفظ التغييرات
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-8 space-y-6">
                            <h3 className="font-bold text-lg text-charcoal">تغيير كلمة المرور</h3>
                            <div className="space-y-4 max-w-md">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">كلمة المرور الحالية</label>
                                    <input type="password" className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-shibl-crimson outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">كلمة المرور الجديدة</label>
                                    <input type="password" className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-shibl-crimson outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">تأكيد كلمة المرور الجديدة</label>
                                    <input type="password" className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-shibl-crimson outline-none" />
                                </div>
                                <button className="w-full bg-slate-100 text-slate-400 font-bold py-3 rounded-xl cursor-not-allowed">تحديث كلمة المرور</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-8 space-y-6">
                            <h3 className="font-bold text-lg text-charcoal">تفضيلات الإشعارات</h3>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-charcoal text-sm">التنبيهات الأكاديمية</p>
                                        <p className="text-xs text-slate-400">احصل على إشعارات عند صدور النتائج أو الواجبات</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={notifications.email_academic} onChange={() => setNotifications({ ...notifications, email_academic: !notifications.email_academic })} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-shibl-crimson"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-charcoal text-sm">التنبيهات المالية</p>
                                        <p className="text-xs text-slate-400">تذكيرات بمواعيد الدفع والفواتير الجديدة</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={notifications.email_financial} onChange={() => setNotifications({ ...notifications, email_financial: !notifications.email_financial })} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-shibl-crimson"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-charcoal text-sm">رسائل الغياب والحضور</p>
                                        <p className="text-xs text-slate-400">تنبيه فوري عبر SMS في حال غياب الطالب</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={notifications.sms_attendance} onChange={() => setNotifications({ ...notifications, sms_attendance: !notifications.sms_attendance })} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-shibl-crimson"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
