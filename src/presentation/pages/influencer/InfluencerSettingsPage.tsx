import { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../../store/themeStore';
import { influencerService } from '../../../data/api/influencerService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileFormSchema, passwordFormSchema, type ProfileFormValues, type PasswordFormValues } from './schemas/influencerSettingsSchema';
import { toast } from 'react-hot-toast';

// Icons
import {
    User,
    Mail,
    Phone,
    Lock,
    Moon,
    Save,
    Eye,
    EyeOff
} from 'lucide-react';

// Section component for grouping settings
function SettingsSection({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
    return (
        <div className={`bg-white dark:bg-[#1E1E1E] rounded-xl border border-slate-100 dark:border-white/10 shadow-sm overflow-hidden ${className}`}>
            <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                <h2 className="text-lg font-bold text-charcoal dark:text-slate-100">{title}</h2>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

// Form field wrapper
function FormField({ label, children, error, required = false }: { label: string; children: React.ReactNode; error?: string; required?: boolean }) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">
                {label}
                {required && <span className="text-red-500 mx-1">*</span>}
            </label>
            {children}
            {error && (
                <p className="text-red-500 text-xs flex items-center gap-1 animate-fadeIn">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                    {error}
                </p>
            )}
        </div>
    );
}

export function InfluencerSettingsPage() {
    const { isRTL } = useLanguage();
    const { user, setUser } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);

    // Profile Form
    const {
        register: registerProfile,
        handleSubmit: handleProfileSubmit,
        formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
        reset: resetProfile
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: '',
            phone: '',
        }
    });

    // Password Form
    const [showPasswords, setShowPasswords] = useState({
        new: false,
        confirm: false,
    });

    const {
        register: registerPassword,
        handleSubmit: handlePasswordSubmit,
        formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
        reset: resetPassword
    } = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: {
            newPassword: '',
            confirmPassword: '',
        }
    });

    const { isDarkMode, toggleTheme } = useThemeStore();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await influencerService.getProfile();
                if (response.data) {
                    resetProfile({
                        name: response.data.name,
                        phone: (response.data as any).phone || '',
                    });
                }
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            }
        };
        fetchProfile();
    }, [resetProfile]);

    // Submit Profile
    const onProfileSubmit = async (data: ProfileFormValues) => {
        try {
            setIsLoading(true);
            const response = await influencerService.updateProfile({
                name: data.name,
                phone: data.phone || undefined,
            });

            if (response.data) {
                // Update specific fields on the user without wiping out `data.affiliate_code`
                setUser({
                    ...user,
                    name: response.data.name,
                    email: response.data.email,
                    phone: (response.data as any).phone
                } as any);
                toast.success('تم تحديث الملف الشخصي بنجاح');
            }
        } catch (error: any) {
            console.error('Update profile error:', error);
            const msg = error.response?.data?.message || 'حدث خطأ أثناء تحديث الملف الشخصي';
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    // Submit Password
    const onPasswordSubmit = async (data: PasswordFormValues) => {
        if (!data.newPassword) return; // Nothing to submit

        try {
            await influencerService.updateProfile({
                password: data.newPassword,
            });

            toast.success('تم تغيير كلمة المرور بنجاح');
            resetPassword();
        } catch (error: any) {
            console.error('Change password error:', error);
            const msg = error.response?.data?.message || 'فشل تغيير كلمة المرور';
            toast.error(msg);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-10" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-charcoal dark:text-white">الإعدادات</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">إدارة ملفك الشخصي وتفضيلات الحساب</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Profile & Password */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Profile Section */}
                    <SettingsSection title="الملف الشخصي">
                        <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
                            <div className="flex flex-col items-center sm:flex-row gap-6 mb-8">
                                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-[#252525] border-4 border-white dark:border-[#333] shadow-md flex items-center justify-center text-slate-400 dark:text-gray-500">
                                    <User size={32} />
                                </div>
                                <div className="text-center sm:text-right flex-1">
                                    <h3 className="font-semibold text-lg text-charcoal dark:text-white">{user?.name}</h3>
                                    <p className="text-sm text-slate-500 dark:text-gray-400">{user?.email}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField label="الاسم الكامل" error={profileErrors.name?.message} required>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            {...registerProfile('name')}
                                            className={`w-full h-11 px-4 ${isRTL ? 'pl-10' : 'pr-10'} rounded-lg bg-white dark:bg-[#121212] border outline-none transition-all dark:text-white ${profileErrors.name ? 'border-red-300 focus:border-red-500' : 'border-slate-200 dark:border-white/10 focus:border-shibl-crimson focus:ring-2 focus:ring-shibl-crimson/20'}`}
                                            placeholder="الاسم الكامل"
                                        />
                                        <User size={18} className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-slate-400`} />
                                    </div>
                                </FormField>

                                <FormField label="رقم الهاتف" error={profileErrors.phone?.message}>
                                    <div className="relative">
                                        <input
                                            type="tel"
                                            {...registerProfile('phone')}
                                            className={`w-full h-11 px-4 ${isRTL ? 'pl-10' : 'pr-10'} rounded-lg bg-white dark:bg-[#121212] border outline-none transition-all dark:text-white ${profileErrors.phone ? 'border-red-300 focus:border-red-500' : 'border-slate-200 dark:border-white/10 focus:border-shibl-crimson focus:ring-2 focus:ring-shibl-crimson/20'}`}
                                            placeholder="+966 5XX XXX XXXX"
                                            dir="ltr"
                                        />
                                        <Phone size={18} className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-slate-400`} />
                                    </div>
                                </FormField>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={isProfileSubmitting || isLoading}
                                    className="h-10 px-6 rounded-lg bg-shibl-crimson hover:bg-red-700 text-white font-medium shadow-md shadow-red-600/10 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isProfileSubmitting || isLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>جاري الحفظ...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            <span>تحديث البيانات</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </SettingsSection>

                    {/* Password Section */}
                    <SettingsSection title="إعدادات المرور">
                        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField label="كلمة المرور الجديدة" error={passwordErrors.newPassword?.message}>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.new ? 'text' : 'password'}
                                            {...registerPassword('newPassword')}
                                            className={`w-full h-11 px-4 ${isRTL ? 'pl-10' : 'pr-10'} rounded-lg bg-white dark:bg-[#121212] border outline-none transition-all dark:text-white ${passwordErrors.newPassword ? 'border-red-300 focus:border-red-500' : 'border-slate-200 dark:border-white/10 focus:border-shibl-crimson focus:ring-2 focus:ring-shibl-crimson/20'}`}
                                            dir="ltr"
                                            placeholder="********"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords(p => ({ ...p, new: !p.new }))}
                                            className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-slate-400 hover:text-charcoal`}
                                        >
                                            {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </FormField>

                                <FormField label="تأكيد كلمة المرور" error={passwordErrors.confirmPassword?.message}>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.confirm ? 'text' : 'password'}
                                            {...registerPassword('confirmPassword')}
                                            className={`w-full h-11 px-4 ${isRTL ? 'pl-10' : 'pr-10'} rounded-lg bg-white dark:bg-[#121212] border outline-none transition-all dark:text-white ${passwordErrors.confirmPassword ? 'border-red-300 focus:border-red-500' : 'border-slate-200 dark:border-white/10 focus:border-shibl-crimson focus:ring-2 focus:ring-shibl-crimson/20'}`}
                                            dir="ltr"
                                            placeholder="********"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))}
                                            className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-slate-400 hover:text-charcoal`}
                                        >
                                            {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </FormField>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={isPasswordSubmitting}
                                    className="h-10 px-6 rounded-lg bg-slate-800 hover:bg-slate-900 dark:bg-white dark:text-black dark:hover:bg-slate-200 text-white font-medium shadow-md shadow-slate-800/10 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isPasswordSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>جاري التغيير...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Lock size={16} />
                                            <span>تحديث كلمة المرور</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </SettingsSection>
                </div>

                {/* Sidebar: Preferences */}
                <div className="space-y-6">
                    <SettingsSection title="تفضيلات التطبيق">
                        <div className="space-y-4">
                            {/* Dark Mode */}
                            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-[#252525] border border-slate-100/50 dark:border-white/10 hover:border-slate-200 dark:hover:border-white/20 transition-colors cursor-pointer" onClick={toggleTheme}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-100/50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                        <Moon size={20} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-charcoal dark:text-white text-sm">الوضع الداكن</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">تبديل مظهر المنصة</p>
                                    </div>
                                </div>
                                <div
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-white/20'}`}
                                >
                                    <span
                                        className={`${isDarkMode ? '-translate-x-6' : '-translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                        style={{ direction: 'ltr' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </SettingsSection>

                    {/* Security Info Panel */}
                    <div className="bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 rounded-xl p-5">
                        <h4 className="flex items-center gap-2 font-semibold text-blue-800 dark:text-blue-400 mb-2 text-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></span>
                            نصيحة أمنية
                        </h4>
                        <p className="text-xs text-blue-600 dark:text-blue-300 leading-relaxed opacity-90">
                            تأكد دائمًا من استخدام كلمة مرور قوية والاحتفاظ بها في مكان آمن. لا تقم بمشاركة بيناتك الشخصية مع الأخرين.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InfluencerSettingsPage;
