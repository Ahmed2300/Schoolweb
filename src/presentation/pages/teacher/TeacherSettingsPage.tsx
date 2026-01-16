import { useState } from 'react';
import { useLanguage } from '../../hooks';
import { useAuthStore } from '../../store';
import { teacherAuthService } from '../../../data/api/teacherAuthService';

// Icons
import {
    User,
    Mail,
    Phone,
    Lock,
    Bell,
    Moon,
    Globe,
    Save,
    Eye,
    EyeOff,
    AlertCircle,
    CheckCircle
} from 'lucide-react';

// Section component for grouping settings
function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/5 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
                <h2 className="text-lg font-bold text-white">{title}</h2>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

// Form field wrapper
function FormField({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">{label}</label>
            {children}
            {error && (
                <p className="text-red-400 text-xs flex items-center gap-1">
                    <AlertCircle size={12} />
                    {error}
                </p>
            )}
        </div>
    );
}

export function TeacherSettingsPage() {
    const { isRTL } = useLanguage();
    const { user } = useAuthStore();

    // Profile form state
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        specialization: '',
    });

    // Password form state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    // Preferences state
    const [preferences, setPreferences] = useState({
        emailNotifications: true,
        pushNotifications: true,
        darkMode: true,
        language: 'ar',
    });

    // Loading and feedback states
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleProfileSave = async () => {
        setIsLoading(true);
        setError('');
        try {
            // TODO: Call API to update profile
            // await teacherAuthService.updateProfile(profileData);
            setSuccess('تم حفظ الملف الشخصي بنجاح');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء الحفظ');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async () => {
        // Validate passwords
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('كلمات المرور غير متطابقة');
            return;
        }
        if (passwordData.newPassword.length < 8) {
            setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            await teacherAuthService.changePassword({
                old_password: passwordData.currentPassword,
                new_password: passwordData.newPassword,
                new_password_confirmation: passwordData.confirmPassword,
            });
            setSuccess('تم تغيير كلمة المرور بنجاح');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'فشل تغيير كلمة المرور');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-4xl" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Page Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">الإعدادات</h1>
                <p className="text-slate-400 mt-1">إدارة ملفك الشخصي وتفضيلات الحساب</p>
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                    <CheckCircle size={20} className="text-emerald-400" />
                    <span className="text-emerald-300">{success}</span>
                </div>
            )}
            {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                    <AlertCircle size={20} className="text-red-400" />
                    <span className="text-red-300">{error}</span>
                </div>
            )}

            {/* Profile Settings */}
            <SettingsSection title="الملف الشخصي">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="الاسم الكامل">
                        <div className="relative">
                            <input
                                type="text"
                                value={profileData.name}
                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                className="w-full h-12 px-4 pr-12 rounded-xl bg-white/5 border border-white/10 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-white placeholder:text-slate-500"
                                placeholder="محمد أحمد"
                            />
                            <User size={18} className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`} />
                        </div>
                    </FormField>

                    <FormField label="البريد الإلكتروني">
                        <div className="relative">
                            <input
                                type="email"
                                value={profileData.email}
                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                className="w-full h-12 px-4 pr-12 rounded-xl bg-white/5 border border-white/10 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-white placeholder:text-slate-500"
                                placeholder="teacher@subol.edu"
                                dir="ltr"
                            />
                            <Mail size={18} className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`} />
                        </div>
                    </FormField>

                    <FormField label="رقم الهاتف">
                        <div className="relative">
                            <input
                                type="tel"
                                value={profileData.phone}
                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                className="w-full h-12 px-4 pr-12 rounded-xl bg-white/5 border border-white/10 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-white placeholder:text-slate-500"
                                placeholder="+966 5XX XXX XXXX"
                                dir="ltr"
                            />
                            <Phone size={18} className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`} />
                        </div>
                    </FormField>

                    <FormField label="التخصص">
                        <input
                            type="text"
                            value={profileData.specialization}
                            onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
                            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-white placeholder:text-slate-500"
                            placeholder="الرياضيات والفيزياء"
                        />
                    </FormField>
                </div>

                <button
                    onClick={handleProfileSave}
                    disabled={isLoading}
                    className="mt-6 h-11 px-6 rounded-xl bg-shibl-crimson hover:bg-red-600 text-white font-medium flex items-center gap-2 transition-all disabled:opacity-50"
                >
                    <Save size={18} />
                    <span>حفظ التغييرات</span>
                </button>
            </SettingsSection>

            {/* Password Settings */}
            <SettingsSection title="تغيير كلمة المرور">
                <div className="space-y-4 max-w-md">
                    <FormField label="كلمة المرور الحالية">
                        <div className="relative">
                            <input
                                type={showPasswords.current ? 'text' : 'password'}
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                className="w-full h-12 px-4 pr-12 rounded-xl bg-white/5 border border-white/10 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-white"
                                dir="ltr"
                            />
                            <Lock size={18} className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`} />
                            <button
                                type="button"
                                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-slate-400 hover:text-white`}
                            >
                                {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </FormField>

                    <FormField label="كلمة المرور الجديدة">
                        <div className="relative">
                            <input
                                type={showPasswords.new ? 'text' : 'password'}
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                className="w-full h-12 px-4 pr-12 rounded-xl bg-white/5 border border-white/10 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-white"
                                dir="ltr"
                            />
                            <Lock size={18} className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`} />
                            <button
                                type="button"
                                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-slate-400 hover:text-white`}
                            >
                                {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </FormField>

                    <FormField label="تأكيد كلمة المرور">
                        <div className="relative">
                            <input
                                type={showPasswords.confirm ? 'text' : 'password'}
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                className="w-full h-12 px-4 pr-12 rounded-xl bg-white/5 border border-white/10 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-white"
                                dir="ltr"
                            />
                            <Lock size={18} className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`} />
                            <button
                                type="button"
                                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-slate-400 hover:text-white`}
                            >
                                {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </FormField>

                    <button
                        onClick={handlePasswordChange}
                        disabled={isLoading || !passwordData.currentPassword || !passwordData.newPassword}
                        className="h-11 px-6 rounded-xl bg-shibl-crimson hover:bg-red-600 text-white font-medium flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                        <Lock size={18} />
                        <span>تغيير كلمة المرور</span>
                    </button>
                </div>
            </SettingsSection>

            {/* Preferences */}
            <SettingsSection title="التفضيلات">
                <div className="space-y-4">
                    {/* Email Notifications */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <Mail size={20} className="text-blue-400" />
                            </div>
                            <div>
                                <p className="text-white font-medium">إشعارات البريد</p>
                                <p className="text-slate-400 text-sm">تلقي إشعارات عبر البريد الإلكتروني</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setPreferences({ ...preferences, emailNotifications: !preferences.emailNotifications })}
                            className={`w-12 h-6 rounded-full transition-all ${preferences.emailNotifications ? 'bg-shibl-crimson' : 'bg-slate-600'}`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${preferences.emailNotifications ? 'translate-x-6' : 'translate-x-0.5'}`} />
                        </button>
                    </div>

                    {/* Push Notifications */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                <Bell size={20} className="text-purple-400" />
                            </div>
                            <div>
                                <p className="text-white font-medium">إشعارات التطبيق</p>
                                <p className="text-slate-400 text-sm">إشعارات فورية في المتصفح</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setPreferences({ ...preferences, pushNotifications: !preferences.pushNotifications })}
                            className={`w-12 h-6 rounded-full transition-all ${preferences.pushNotifications ? 'bg-shibl-crimson' : 'bg-slate-600'}`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${preferences.pushNotifications ? 'translate-x-6' : 'translate-x-0.5'}`} />
                        </button>
                    </div>

                    {/* Dark Mode */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                <Moon size={20} className="text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-white font-medium">الوضع الداكن</p>
                                <p className="text-slate-400 text-sm">تفعيل المظهر الداكن</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setPreferences({ ...preferences, darkMode: !preferences.darkMode })}
                            className={`w-12 h-6 rounded-full transition-all ${preferences.darkMode ? 'bg-shibl-crimson' : 'bg-slate-600'}`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${preferences.darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
                        </button>
                    </div>
                </div>
            </SettingsSection>
        </div>
    );
}

export default TeacherSettingsPage;
