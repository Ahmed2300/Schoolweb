import { useState } from 'react';
import {
    User,
    Lock,
    Bell,
    Save,
    Camera,
    Mail,
    Phone,
    MapPin,
    Loader2,
    Eye,
    EyeOff
} from 'lucide-react';
import { useAuthStore } from '../../store';
import { authService, commonService } from '../../../data/api';
import { useEffect } from 'react';

export function ParentSettingsPage() {
    const { user, setUser } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');

    // Profile State
    const [profile, setProfile] = useState<{
        name: string;
        email: string;
        phone: string;
        address: string;
        avatar: string | null;
        avatarFile: File | null;
    }>({
        name: user?.name || '',
        email: user?.email || '',
        phone: (user as { phone?: string })?.phone || '',
        address: (user as { address?: string })?.address || '',
        avatar: user?.avatar || null,
        avatarFile: null,
    });
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);

    const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

    // Location State
    const [states, setStates] = useState<{ id: number; name: string }[]>([]);
    const [isLoadingLocations, setIsLoadingLocations] = useState(false);

    useEffect(() => {
        const fetchLocations = async () => {
            setIsLoadingLocations(true);
            try {
                // 1. Fetch Countries to find Oman
                const countries = await commonService.getCountries();
                const oman = countries.find(c => c.name.includes('Oman') || c.name.includes('عمان'));

                if (oman) {
                    // 2. Fetch Cities/States for Oman
                    const cities = await commonService.getCities(oman.id);
                    setStates(cities);
                }
            } catch (error) {
                console.error('Failed to fetch locations', error);
            } finally {
                setIsLoadingLocations(false);
            }
        };

        fetchLocations();
    }, []);

    // Password State
    const [passwordForm, setPasswordForm] = useState({
        old_password: '',
        new_password: '',
        new_password_confirmation: '',
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [notifications, setNotifications] = useState({
        email_academic: true,
        email_financial: true,
        sms_attendance: true,
        sms_marketing: false
    });

    // Profile Update Handler
    const handleProfileSave = async () => {
        setProfileLoading(true);
        setProfileError(null);
        setProfileSuccess(null);

        try {
            const response = await authService.parentUpdateProfile({
                name: profile.name,
                address: profile.address,
                avatar: profile.avatarFile,
            });

            if (response.success) {
                // Update the local profile state with the new data
                if (response.data?.parent) {
                    setProfile(prev => ({
                        ...prev,
                        ...prev,
                        name: response.data!.parent!.name || prev.name,
                        address: (response.data!.parent as any)?.address || prev.address,
                        avatar: response.data!.parent!.avatar || prev.avatar,
                        avatarFile: null, // Reset file input
                    }));
                    // Update global store
                    setUser({
                        ...user!,
                        name: response.data!.parent!.name,
                        avatar: response.data!.parent!.avatar,
                        // @ts-ignore
                        address: response.data!.parent!.address
                    });
                }
                setProfileSuccess('تم تحديث الملف الشخصي بنجاح');
            }
        } catch (error) {
            setProfileError(error instanceof Error ? error.message : 'حدث خطأ أثناء التحديث');
        } finally {
            setProfileLoading(false);
        }
    };

    // Password Change Handler
    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordLoading(true);
        setPasswordError(null);
        setPasswordSuccess(null);

        if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
            setPasswordError('كلمة المرور الجديدة غير متطابقة');
            setPasswordLoading(false);
            return;
        }

        if (passwordForm.new_password.length < 8) {
            setPasswordError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
            setPasswordLoading(false);
            return;
        }

        try {
            const response = await authService.parentChangePassword(passwordForm);
            if (response.success) {
                setPasswordSuccess('تم تغيير كلمة المرور بنجاح');
                setPasswordForm({ old_password: '', new_password: '', new_password_confirmation: '' });
            }
        } catch (error) {
            setPasswordError(error instanceof Error ? error.message : 'حدث خطأ أثناء تغيير كلمة المرور');
        } finally {
            setPasswordLoading(false);
        }
    };

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
                                        {profile.avatar ? (
                                            <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={40} />
                                        )}
                                    </div>
                                    <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 w-8 h-8 bg-shibl-crimson text-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform cursor-pointer">
                                        <Camera size={14} />
                                        <input
                                            id="avatar-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    // Validate file size (Max 2MB)
                                                    if (file.size > 2 * 1024 * 1024) {
                                                        setProfileError('حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 2 ميجابايت');
                                                        return;
                                                    }
                                                    setProfileError(null); // Clear previous errors
                                                    setProfile(prev => ({
                                                        ...prev,
                                                        avatarFile: file,
                                                        avatar: URL.createObjectURL(file) // Preview
                                                    }));
                                                }
                                            }}
                                        />
                                    </label>
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

                                <div className="space-y-2 opacity-60">
                                    <label className="text-xs font-bold text-slate-500">رقم الهاتف <span className="text-[10px] text-red-400">(للقراءة فقط)</span></label>
                                    <div className="relative">
                                        <input
                                            type="tel"
                                            value={profile.phone}
                                            disabled
                                            className="w-full h-11 pl-4 pr-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 outline-none text-sm font-bold cursor-not-allowed"
                                        />
                                        <Phone size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">العنوان</label>
                                    <div className="flex gap-2">
                                        <div className="relative w-1/3">
                                            <select
                                                disabled
                                                className="w-full h-11 pl-4 pr-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 outline-none text-sm font-bold appearance-none"
                                            >
                                                <option>سلطنة عمان</option>
                                            </select>
                                            <MapPin size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        </div>
                                        <div className="relative w-2/3">
                                            <select
                                                value={profile.address}
                                                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                                className="w-full h-11 pl-4 pr-10 rounded-xl bg-slate-50 border border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all text-sm font-bold text-charcoal appearance-none"
                                            >
                                                <option value="">اختر الولاية/المحافظة</option>
                                                {isLoadingLocations ? (
                                                    <option>جاري التحميل...</option>
                                                ) : (
                                                    states.map((state) => (
                                                        <option key={state.id} value={state.name}>
                                                            {state.name}
                                                        </option>
                                                    ))
                                                )}
                                            </select>
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* Error/Success Messages */}
                            {profileError && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                                    {profileError}
                                </div>
                            )}
                            {profileSuccess && (
                                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm">
                                    {profileSuccess}
                                </div>
                            )}

                            <div className="flex justify-end">
                                <button
                                    onClick={handleProfileSave}
                                    disabled={profileLoading}
                                    className="bg-charcoal text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-black transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {profileLoading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            جاري الحفظ...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            حفظ التغييرات
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-8 space-y-6">
                            <h3 className="font-bold text-lg text-charcoal">تغيير كلمة المرور</h3>
                            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                                {/* Error/Success Messages */}
                                {passwordError && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                                        {passwordError}
                                    </div>
                                )}
                                {passwordSuccess && (
                                    <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm">
                                        {passwordSuccess}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">كلمة المرور الحالية</label>
                                    <div className="relative">
                                        <input
                                            type={showOldPassword ? 'text' : 'password'}
                                            value={passwordForm.old_password}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                                            className="w-full h-11 px-4 pr-12 rounded-xl bg-slate-50 border border-slate-200 focus:border-shibl-crimson outline-none"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowOldPassword(!showOldPassword)}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">كلمة المرور الجديدة</label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={passwordForm.new_password}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                                            className="w-full h-11 px-4 pr-12 rounded-xl bg-slate-50 border border-slate-200 focus:border-shibl-crimson outline-none"
                                            minLength={8}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-400">يجب أن تكون 8 أحرف على الأقل</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">تأكيد كلمة المرور الجديدة</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={passwordForm.new_password_confirmation}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })}
                                            className="w-full h-11 px-4 pr-12 rounded-xl bg-slate-50 border border-slate-200 focus:border-shibl-crimson outline-none"
                                            minLength={8}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={passwordLoading}
                                    className="w-full bg-shibl-crimson text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {passwordLoading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            جاري التحديث...
                                        </>
                                    ) : (
                                        <>
                                            <Lock size={18} />
                                            تحديث كلمة المرور
                                        </>
                                    )}
                                </button>
                            </form>
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
