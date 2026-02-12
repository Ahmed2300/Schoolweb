import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../hooks';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../../store/themeStore';
import { teacherAuthService } from '../../../data/api/teacherAuthService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileFormSchema, passwordFormSchema, type ProfileFormValues, type PasswordFormValues } from './schemas/teacherSettingsSchema';
import { toast } from 'react-hot-toast';

// Icons
import {
    User,
    Mail,
    Phone,
    Lock,
    Bell,
    Moon,
    Save,
    Eye,
    EyeOff,
    Camera,
    Languages,
    Briefcase
} from 'lucide-react';

// Section component for grouping settings
function SettingsSection({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
    return (
        <div className={`bg-white dark:bg-[#1E1E1E] rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm overflow-hidden ${className}`}>
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

export function TeacherSettingsPage() {
    const { isRTL, language } = useLanguage();
    const { user, setUser } = useAuthStore();

    // Avatar State
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.image_path || user?.avatar || null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Profile Form
    const {
        register: registerProfile,
        handleSubmit: handleProfileSubmit,
        formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
        reset: resetProfile
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            specialization: (user as any)?.specialization || '',
            qualification: (user as any)?.qualification || '',
        }
    });

    // Password Form
    const [showPasswords, setShowPasswords] = useState({
        current: false,
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
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        }
    });

    // Preferences state (Local only for now)
    const [preferences, setPreferences] = useState({
        emailNotifications: true,
        pushNotifications: true,
    });
    const { isDarkMode, toggleTheme } = useThemeStore();

    // Handle Image Selection
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('حجم الصورة يجب أن لا يتجاوز 5 ميجابايت');
                return;
            }
            if (!file.type.startsWith('image/')) {
                toast.error('يرجى اختيار ملف صورة صالح');
                return;
            }

            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Submit Profile
    const onProfileSubmit = async (data: ProfileFormValues) => {
        try {
            const response = await teacherAuthService.updateProfile({
                name: data.name,
                phone: data.phone || undefined,
                specialization: data.specialization || undefined,
                qualification: data.qualification || undefined,
                image: avatarFile || undefined
            });

            if (response.success && response.data?.teacher) {
                // Merge new teacher data with existing user to preserve critical props like role
                const updatedTeacher = response.data.teacher;
                setUser({
                    ...user, // Preserve existing user properties (role, etc.)
                    ...updatedTeacher, // Override with new teacher data
                    avatar: updatedTeacher.image_path || user?.avatar, // Map image_path to avatar
                } as any);
                toast.success('تم تحديث الملف الشخصي بنجاح');

                // Update avatar preview with new image from server
                if (updatedTeacher.image_path) {
                    setAvatarPreview(updatedTeacher.image_path);
                }

                // Reset form with new values (optional, but good practice)
                resetProfile({
                    name: updatedTeacher.name,
                    email: updatedTeacher.email,
                    phone: updatedTeacher.phone || '',
                    specialization: updatedTeacher.specialization || '',
                    qualification: updatedTeacher.qualification || '',
                });
                setAvatarFile(null); // Clear selected file
            }
        } catch (error: any) {
            console.error('Update profile error:', error);
            const msg = error.response?.data?.message || 'حدث خطأ أثناء تحديث الملف الشخصي';
            toast.error(msg);
        }
    };

    // Submit Password
    const onPasswordSubmit = async (data: PasswordFormValues) => {
        try {
            const response = await teacherAuthService.changePassword({
                old_password: data.currentPassword,
                new_password: data.newPassword,
                new_password_confirmation: data.confirmPassword,
            });

            if (response.success) {
                toast.success('تم تغيير كلمة المرور بنجاح');
                resetPassword();
            }
        } catch (error: any) {
            console.error('Change password error:', error);
            const msg = error.response?.data?.message || 'فشل تغيير كلمة المرور';
            toast.error(msg);
        }
    };

    // Toggle Theme (Managed by Store)

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-10" dir={isRTL ? 'rtl' : 'ltr'}>

            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-charcoal dark:text-white">الإعدادات</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">إدارة ملفك الشخصي، الأمان، والتفضيلات</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Content: Profile & Password */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Profile Section */}
                    <SettingsSection title="الملف الشخصي">
                        <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-8">

                            {/* Avatar Upload */}
                            <div className="flex flex-col items-center sm:flex-row gap-6">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-100 relative">
                                        {avatarPreview ? (
                                            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-gray-500">
                                                <User size={40} />
                                            </div>
                                        )}
                                        {/* Overlay loading/hover */}
                                        <div
                                            className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Camera className="text-white" size={24} />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-shibl-crimson text-white flex items-center justify-center shadow-md hover:bg-red-700 transition-colors"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Camera size={14} />
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                    />
                                </div>
                                <div className="text-center sm:text-right flex-1">
                                    <h3 className="font-semibold text-charcoal dark:text-white">{user?.name || 'المعلم'}</h3>
                                    <p className="text-sm text-slate-500 dark:text-gray-400 mb-2">{user?.email}</p>
                                    <p className="text-xs text-slate-400">
                                        صيغ المدعومة: JPG, PNG. الحد الأقصى: 5MB
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField label="الاسم الكامل" error={profileErrors.name?.message} required>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            {...registerProfile('name')}
                                            className={`w-full h-12 px-4 ${isRTL ? 'pl-10' : 'pr-10'} rounded-xl bg-white dark:bg-[#121212] border outline-none transition-all dark:text-white ${profileErrors.name ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-slate-200 dark:border-white/10 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10'}`}
                                            placeholder="الاسم الكامل"
                                        />
                                        <User size={18} className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-slate-400`} />
                                    </div>
                                </FormField>

                                <FormField label="البريد الإلكتروني" error={profileErrors.email?.message} required>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            {...registerProfile('email')}
                                            readOnly
                                            className={`w-full h-12 px-4 ${isRTL ? 'pl-10' : 'pr-10'} rounded-xl bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-gray-400 cursor-not-allowed outline-none`}
                                            dir="ltr"
                                        />
                                        <Mail size={18} className={`absolute ${isRTL ? 'left-3 pl-1' : 'right-3'} top-1/2 -translate-y-1/2 text-slate-400`} />
                                    </div>
                                </FormField>

                                <FormField label="رقم الهاتف" error={profileErrors.phone?.message}>
                                    <div className="relative">
                                        <input
                                            type="tel"
                                            {...registerProfile('phone')}
                                            className={`w-full h-12 px-4 ${isRTL ? 'pl-10' : 'pr-10'} rounded-xl bg-white dark:bg-[#121212] border outline-none transition-all dark:text-white ${profileErrors.phone ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-slate-200 dark:border-white/10 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10'}`}
                                            placeholder="+966 5XX XXX XXXX"
                                            dir="ltr"
                                        />
                                        <Phone size={18} className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-slate-400`} />
                                    </div>
                                </FormField>

                                <FormField label="التخصص" error={profileErrors.specialization?.message}>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            {...registerProfile('specialization')}
                                            className="w-full h-12 px-4 rounded-xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all placeholder:text-slate-400 dark:text-white"
                                            placeholder="مثال: الرياضيات"
                                        />
                                        <Briefcase size={18} className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-slate-400`} />
                                    </div>
                                </FormField>

                                <FormField label="المؤهل العلمي" error={profileErrors.qualification?.message}>
                                    <input
                                        type="text"
                                        {...registerProfile('qualification')}
                                        className="w-full h-12 px-4 rounded-xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all placeholder:text-slate-400 dark:text-white"
                                        placeholder="مثال: بكالوريوس تربية"
                                    />
                                </FormField>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={isProfileSubmitting || (!avatarFile && !Object.keys(profileErrors).length && false)} // Simple check, keep valid always clickable usually
                                    className="h-11 px-8 rounded-xl bg-shibl-crimson hover:bg-red-700 text-white font-medium shadow-lg shadow-red-600/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isProfileSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>جاري الحفظ...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            <span>حفظ التغييرات</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </SettingsSection>

                    {/* Password Section */}
                    <SettingsSection title="تغيير كلمة المرور">
                        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-5 max-w-lg">

                            <FormField label="كلمة المرور الحالية" error={passwordErrors.currentPassword?.message} required>
                                <div className="relative">
                                    <input
                                        type={showPasswords.current ? 'text' : 'password'}
                                        {...registerPassword('currentPassword')}
                                        className={`w-full h-12 px-4 ${isRTL ? 'pl-10' : 'pr-10'} rounded-xl bg-white dark:bg-[#121212] border outline-none transition-all dark:text-white ${passwordErrors.currentPassword ? 'border-red-300 focus:border-red-500' : 'border-slate-200 dark:border-white/10 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10'}`}
                                        dir="ltr"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords(p => ({ ...p, current: !p.current }))}
                                        className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-slate-400 hover:text-charcoal`}
                                    >
                                        {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </FormField>

                            <FormField label="كلمة المرور الجديدة" error={passwordErrors.newPassword?.message} required>
                                <div className="relative">
                                    <input
                                        type={showPasswords.new ? 'text' : 'password'}
                                        {...registerPassword('newPassword')}
                                        className={`w-full h-12 px-4 ${isRTL ? 'pl-10' : 'pr-10'} rounded-xl bg-white dark:bg-[#121212] border outline-none transition-all dark:text-white ${passwordErrors.newPassword ? 'border-red-300 focus:border-red-500' : 'border-slate-200 dark:border-white/10 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10'}`}
                                        dir="ltr"
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

                            <FormField label="تأكيد كلمة المرور" error={passwordErrors.confirmPassword?.message} required>
                                <div className="relative">
                                    <input
                                        type={showPasswords.confirm ? 'text' : 'password'}
                                        {...registerPassword('confirmPassword')}
                                        className={`w-full h-12 px-4 ${isRTL ? 'pl-10' : 'pr-10'} rounded-xl bg-white dark:bg-[#121212] border outline-none transition-all dark:text-white ${passwordErrors.confirmPassword ? 'border-red-300 focus:border-red-500' : 'border-slate-200 dark:border-white/10 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10'}`}
                                        dir="ltr"
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

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isPasswordSubmitting}
                                    className="h-11 px-8 rounded-xl bg-charcoal hover:bg-slate-800 text-white font-medium shadow-lg shadow-slate-800/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isPasswordSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>جاري التغيير...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Lock size={18} />
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
                            <div className="flex items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-[#1E1E1E] border border-slate-100/50 dark:border-white/10 hover:border-slate-200 dark:hover:border-white/20 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-indigo-100/50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                        <Moon size={18} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-charcoal dark:text-white text-sm">الوضع الداكن</p>
                                        <p className="text-xs text-slate-500 dark:text-gray-400">مظهر مريح للعين</p>
                                    </div>
                                </div>
                                <button
                                    onClick={toggleTheme}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-white/10'}`}
                                >
                                    <span
                                        className={`${isDarkMode ? '-translate-x-6' : '-translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                        style={{ direction: 'ltr' }} // Fix wrapper direction issues
                                    />
                                </button>
                            </div>

                            {/* Notifications */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#1E1E1E] border border-slate-100/50 dark:border-white/10 hover:border-slate-200 dark:hover:border-white/20 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-blue-100/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                        <Mail size={18} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-charcoal dark:text-white text-sm">إشعارات البريد</p>
                                        <p className="text-xs text-slate-500 dark:text-gray-400">تلقي التنبيهات المهمة</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setPreferences(p => ({ ...p, emailNotifications: !p.emailNotifications }))}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${preferences.emailNotifications ? 'bg-blue-600' : 'bg-slate-200'}`}
                                >
                                    <span
                                        className={`${preferences.emailNotifications ? '-translate-x-6' : '-translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                        style={{ direction: 'ltr' }}
                                    />
                                </button>
                            </div>

                            {/* Language - Example for future extension */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#1E1E1E] border border-slate-100/50 dark:border-white/10 hover:border-slate-200 dark:hover:border-white/20 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                        <Languages size={18} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-charcoal dark:text-white text-sm">اللغة</p>
                                        <p className="text-xs text-slate-500 dark:text-gray-400">العربية (الافتراضية)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SettingsSection>

                    <div className="bg-gradient-to-br from-shibl-crimson/5 to-transparent dark:from-shibl-crimson/10 rounded-2xl border border-shibl-crimson/10 p-6">
                        <h3 className="text-shibl-crimson font-bold mb-2">أمان الحساب</h3>
                        <p className="text-sm text-slate-600 dark:text-gray-400 mb-4 leading-relaxed">
                            تأكد من استخدام كلمة مرور قوية تتكون من أحرف وأرقام ورموز. لا تشارك كلمة مرورك الخاصة مع أي شخص.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-gray-500">
                            <Lock size={12} />
                            <span>بياناتك مشفرة ومحمية</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TeacherSettingsPage;
