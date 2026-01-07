import { useState, useEffect } from 'react';
import {
    Save,
    Globe,
    Shield,
    CreditCard,
    Bell,
    Settings,
    Upload,
    AlertTriangle,
    MapPin,
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Loader2,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../../store';
import { adminService } from '../../../data/api/adminService';

// Types
type SettingsTab = 'profile' | 'general' | 'roles' | 'locations' | 'payments' | 'notifications';

export function AdminSettingsPage() {
    const { user: currentUser, setUser } = useAuthStore();
    const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

    // Profile Form States
    const [profileName, setProfileName] = useState('');
    const [profileEmail, setProfileEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Profile Form UI States
    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    // Initialize profile form with current user data
    useEffect(() => {
        if (currentUser) {
            setProfileName(currentUser.name || '');
            setProfileEmail(currentUser.email || '');
        }
    }, [currentUser]);

    // Clear messages after 5 seconds
    useEffect(() => {
        if (profileSuccess || profileError) {
            const timer = setTimeout(() => {
                setProfileSuccess(null);
                setProfileError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [profileSuccess, profileError]);

    useEffect(() => {
        if (passwordSuccess || passwordError) {
            const timer = setTimeout(() => {
                setPasswordSuccess(null);
                setPasswordError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [passwordSuccess, passwordError]);

    // Handle profile update
    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileError(null);
        setProfileSuccess(null);

        try {
            if (!currentUser?.id) throw new Error('المستخدم غير موجود');

            const updatedAdmin = await adminService.updateAdmin(Number(currentUser.id), {
                name: profileName,
                email: profileEmail,
            });

            // Update local state
            setUser({
                ...currentUser,
                name: updatedAdmin.name || profileName,
                email: updatedAdmin.email || profileEmail,
            });

            setProfileSuccess('تم تحديث الملف الشخصي بنجاح');
        } catch (err: any) {
            console.error('Error updating profile:', err);
            setProfileError(err.response?.data?.message || 'فشل في تحديث الملف الشخصي');
        } finally {
            setProfileLoading(false);
        }
    };

    // Handle password update
    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordLoading(true);
        setPasswordError(null);
        setPasswordSuccess(null);

        // Validate
        if (newPassword.length < 8) {
            setPasswordError('كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل');
            setPasswordLoading(false);
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError('كلمة المرور الجديدة غير متطابقة');
            setPasswordLoading(false);
            return;
        }

        try {
            if (!currentUser?.id) throw new Error('المستخدم غير موجود');

            await adminService.updateAdmin(Number(currentUser.id), {
                password: newPassword,
                password_confirmation: confirmPassword,
            });

            // Clear password fields
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setPasswordSuccess('تم تغيير كلمة المرور بنجاح');
        } catch (err: any) {
            console.error('Error updating password:', err);
            setPasswordError(err.response?.data?.message || 'فشل في تغيير كلمة المرور');
        } finally {
            setPasswordLoading(false);
        }
    };

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
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 mb-8 overflow-x-auto">
                <div className="flex items-center gap-6 min-w-max">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`pb-4 px-2 font-bold text-sm transition-all relative flex items-center gap-2 ${activeTab === 'profile' ? 'text-shibl-crimson' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <User size={20} />
                        <span>حسابي</span>
                        {activeTab === 'profile' && <div className="absolute bottom-0 right-0 left-0 h-0.5 bg-shibl-crimson rounded-t-full" />}
                    </button>

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

            {/* Profile Tab Content */}
            {activeTab === 'profile' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Profile Info */}
                    <div className="bg-white rounded-[20px] shadow-card border border-slate-100 p-6">
                        <h3 className="font-bold text-charcoal mb-6 flex items-center gap-2">
                            <User size={20} className="text-slate-400" />
                            الملف الشخصي
                        </h3>

                        {/* Success/Error Messages */}
                        {profileSuccess && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-[12px] text-sm flex items-center gap-2">
                                <CheckCircle size={18} />
                                {profileSuccess}
                            </div>
                        )}
                        {profileError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-[12px] text-sm flex items-center gap-2">
                                <AlertCircle size={18} />
                                {profileError}
                            </div>
                        )}

                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            {/* Avatar */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-shibl-crimson to-red-700 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-shibl-crimson/20">
                                    {profileName.charAt(0) || 'A'}
                                </div>
                                <div>
                                    <p className="font-bold text-charcoal">{profileName || 'Admin'}</p>
                                    <p className="text-sm text-slate-500">{profileEmail}</p>
                                </div>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">الاسم</label>
                                <div className="relative">
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        value={profileName}
                                        onChange={(e) => setProfileName(e.target.value)}
                                        className="w-full h-11 pr-12 pl-4 rounded-[10px] border border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-sm font-medium"
                                        dir="auto"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">البريد الإلكتروني</label>
                                <div className="relative">
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        value={profileEmail}
                                        onChange={(e) => setProfileEmail(e.target.value)}
                                        className="w-full h-11 pr-12 pl-4 rounded-[10px] border border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-sm font-medium"
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={profileLoading}
                                className="w-full h-11 mt-4 rounded-[10px] bg-shibl-crimson hover:bg-red-800 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
                        </form>
                    </div>

                    {/* Change Password */}
                    <div className="bg-white rounded-[20px] shadow-card border border-slate-100 p-6">
                        <h3 className="font-bold text-charcoal mb-6 flex items-center gap-2">
                            <Lock size={20} className="text-slate-400" />
                            تغيير كلمة المرور
                        </h3>

                        {/* Success/Error Messages */}
                        {passwordSuccess && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-[12px] text-sm flex items-center gap-2">
                                <CheckCircle size={18} />
                                {passwordSuccess}
                            </div>
                        )}
                        {passwordError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-[12px] text-sm flex items-center gap-2">
                                <AlertCircle size={18} />
                                {passwordError}
                            </div>
                        )}

                        <form onSubmit={handlePasswordUpdate} className="space-y-4">
                            {/* Current Password */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">كلمة المرور الحالية</label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="أدخل كلمة المرور الحالية"
                                        className="w-full h-11 px-4 rounded-[10px] border border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-sm font-medium"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">كلمة المرور الجديدة</label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="أدخل كلمة المرور الجديدة"
                                        className="w-full h-11 px-4 rounded-[10px] border border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-sm font-medium"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">يجب أن تكون 8 أحرف على الأقل</p>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">تأكيد كلمة المرور</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="أعد كتابة كلمة المرور الجديدة"
                                        className="w-full h-11 px-4 rounded-[10px] border border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-sm font-medium"
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
                                disabled={passwordLoading || !newPassword || !confirmPassword}
                                className="w-full h-11 mt-4 rounded-[10px] bg-charcoal hover:bg-slate-800 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {passwordLoading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        جاري التغيير...
                                    </>
                                ) : (
                                    <>
                                        <Lock size={18} />
                                        تغيير كلمة المرور
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

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

                        <button className="w-full h-11 mt-6 rounded-[10px] bg-shibl-crimson hover:bg-red-800 text-white font-bold text-sm transition-all flex items-center justify-center gap-2">
                            <Save size={18} />
                            حفظ التغييرات
                        </button>
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

