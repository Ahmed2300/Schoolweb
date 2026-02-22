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
    AlertCircle,
    Phone,
    Map,
    Facebook,
    Link as LinkIcon,
    Plus,
    Edit,
    Trash2,
    X,
    MoreHorizontal,
    Moon,
} from 'lucide-react';
import { useAuthStore } from '../../store';
import { adminService } from '../../../data/api/adminService';
import { useThemeStore } from '../../../store/themeStore';

// Types
type SettingsTab = 'profile' | 'general' | 'contact' | 'roles' | 'locations' | 'payments' | 'notifications';

export function AdminSettingsPage() {
    const { user: currentUser, setUser } = useAuthStore();
    const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
    const { isDarkMode, toggleTheme } = useThemeStore();

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

    // General Settings States
    interface GeneralSettings {
        platform_name: string;
        support_email: string;
        description: string;
        logo_path: string;
        maintenance_mode: boolean;
        registration_open: boolean;
        default_language: string;
    }
    const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
        platform_name: '',
        support_email: '',
        description: '',
        logo_path: '',
        maintenance_mode: false,
        registration_open: true,
        default_language: 'ar'
    });
    const [generalLoading, setGeneralLoading] = useState(false);
    const [generalSaving, setGeneralSaving] = useState(false);
    const [generalSuccess, setGeneralSuccess] = useState<string | null>(null);

    // Contact Settings States
    interface ContactSettings {
        contact_phone: string;
        contact_whatsapp: string;
        contact_address: string;
        contact_map_url: string;
        working_hours: string;
        social_facebook: string;
        social_twitter: string;
        social_instagram: string;
        social_youtube: string;
    }
    const [contactSettings, setContactSettings] = useState<ContactSettings>({
        contact_phone: '',
        contact_whatsapp: '',
        contact_address: '',
        contact_map_url: '',
        working_hours: '',
        social_facebook: '',
        social_twitter: '',
        social_instagram: '',
        social_youtube: ''
    });
    const [contactLoading, setContactLoading] = useState(false);
    const [contactSaving, setContactSaving] = useState(false);

    // Payment Settings States
    interface PaymentSettings {
        enable_ios_payments: boolean;
        bank_account: string;
        phone_wallet: string;
    }
    const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
        enable_ios_payments: false,
        bank_account: '',
        phone_wallet: ''
    });
    // Bank Details Split State
    const [bankDetails, setBankDetails] = useState({
        bankName: '',
        accountName: '',
        accountNumber: '',
        iban: ''
    });
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentSaving, setPaymentSaving] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

    // Locations Settings States
    interface Country {
        id: number;
        name: string;
        code: string;
    }
    interface City {
        id: number;
        country_id: number;
        name: string;
    }
    const [countries, setCountries] = useState<Country[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const [isLocationLoading, setIsLocationLoading] = useState(false);

    // Modals & Forms
    const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
    const [isCityModalOpen, setIsCityModalOpen] = useState(false);
    const [editingCountry, setEditingCountry] = useState<Country | null>(null);
    const [editingCity, setEditingCity] = useState<City | null>(null);
    const [countryForm, setCountryForm] = useState({ name: '', code: '' });
    const [cityForm, setCityForm] = useState({ name: '' });

    const [contactSuccess, setContactSuccess] = useState<string | null>(null);

    // Initialize profile form with current user data
    useEffect(() => {
        if (currentUser) {
            setProfileName(currentUser.name || '');
            setProfileEmail(currentUser.email || '');
        }
    }, [currentUser]);

    // Fetch Settings
    // Fetch Locations Data
    useEffect(() => {
        if (activeTab === 'locations') {
            fetchCountries();
        }
    }, [activeTab]);

    useEffect(() => {
        if (selectedCountry) {
            fetchCities(selectedCountry.id);
        } else {
            setCities([]);
        }
    }, [selectedCountry]);

    const fetchCountries = async () => {
        setIsLocationLoading(true);
        try {
            const response = await adminService.getCountries({ per_page: 100 });
            setCountries(response.data);
        } catch (error) {
            console.error('Failed to fetch countries:', error);
        } finally {
            setIsLocationLoading(false);
        }
    };

    const fetchCities = async (countryId: number) => {
        setIsLocationLoading(true);
        try {
            const response = await adminService.getCities({ country_id: countryId, per_page: 100 });
            setCities(response.data);
        } catch (error) {
            console.error('Failed to fetch cities:', error);
        } finally {
            setIsLocationLoading(false);
        }
    };

    // Country Handlers
    const handleSaveCountry = async () => {
        try {
            if (editingCountry) {
                await adminService.updateCountry(editingCountry.id, countryForm);
            } else {
                await adminService.createCountry(countryForm);
            }
            fetchCountries();
            setIsCountryModalOpen(false);
            setEditingCountry(null);
            setCountryForm({ name: '', code: '' });
        } catch (error) {
            console.error('Failed to save country:', error);
        }
    };

    const handleDeleteCountry = async (id: number) => {
        if (window.confirm('هل أنت متأكد من حذف هذه الدولة؟')) {
            try {
                await adminService.deleteCountry(id);
                fetchCountries();
                if (selectedCountry?.id === id) {
                    setSelectedCountry(null);
                }
            } catch (error) {
                console.error('Failed to delete country:', error);
            }
        }
    };

    // City Handlers
    const handleSaveCity = async () => {
        if (!selectedCountry) return;
        try {
            if (editingCity) {
                await adminService.updateCity(editingCity.id, { ...cityForm, country_id: selectedCountry.id });
            } else {
                await adminService.createCity({ ...cityForm, country_id: selectedCountry.id });
            }
            fetchCities(selectedCountry.id);
            setIsCityModalOpen(false);
            setEditingCity(null);
            setCityForm({ name: '' });
        } catch (error) {
            console.error('Failed to save city:', error);
        }
    };

    const handleDeleteCity = async (id: number) => {
        if (window.confirm('هل أنت متأكد من حذف هذه المدينة؟')) {
            try {
                await adminService.deleteCity(id);
                if (selectedCountry) fetchCities(selectedCountry.id);
            } catch (error) {
                console.error('Failed to delete city:', error);
            }
        }
    };

    useEffect(() => {
        const fetchSettings = async () => {
            if (activeTab === 'general') {
                setGeneralLoading(true);
                try {
                    const data = await adminService.getAllSettings();
                    const settingsList = Array.isArray(data) ? data : (data.data || []);
                    const settingsMap: any = {};
                    settingsList.forEach((s: any) => { settingsMap[s.key] = s.value; });

                    setGeneralSettings(prev => ({
                        ...prev,
                        platform_name: settingsMap.platform_name || '',
                        support_email: settingsMap.support_email || '',
                        description: settingsMap.description || '',
                        logo_path: settingsMap.logo_path || '',
                        maintenance_mode: settingsMap.maintenance_mode === '1', // backend stores as string '1'/'0' usually
                        registration_open: settingsMap.registration_open === '1',
                        default_language: settingsMap.default_language || 'ar'
                    }));
                } catch (error) {
                    console.error("Failed to fetch general settings", error);
                } finally {
                    setGeneralLoading(false);
                }
            } else if (activeTab === 'contact') {
                setContactLoading(true);
                try {
                    const data = await adminService.getAllSettings();
                    const settingsList = Array.isArray(data) ? data : (data.data || []);
                    const settingsMap: any = {};
                    settingsList.forEach((s: any) => { settingsMap[s.key] = s.value; });

                    // Parse social links from JSON
                    let socialLinks: any = {};
                    if (settingsMap.social_media_links) {
                        try {
                            socialLinks = typeof settingsMap.social_media_links === 'string'
                                ? JSON.parse(settingsMap.social_media_links)
                                : settingsMap.social_media_links;
                        } catch (e) {
                            console.error("Failed to parse social media links", e);
                        }
                    }

                    setContactSettings(prev => ({
                        ...prev,
                        contact_phone: settingsMap.contact_phone || '',
                        contact_whatsapp: settingsMap.contact_whatsapp || '',
                        contact_address: settingsMap.contact_address || '',
                        contact_map_url: settingsMap.contact_map_url || '',
                        working_hours: settingsMap.working_hours || '',
                        social_facebook: socialLinks.facebook || '',
                        social_twitter: socialLinks.twitter || '',
                        social_instagram: socialLinks.instagram || '',
                        social_youtube: socialLinks.youtube || ''
                    }));
                } catch (error) {
                    console.error("Failed to fetch contact settings", error);
                } finally {
                    setContactLoading(false);
                }
            } else if (activeTab === 'payments') {
                setPaymentLoading(true);
                try {
                    const data = await adminService.getAllSettings();
                    const settingsList = Array.isArray(data) ? data : (data.data || []);
                    const settingsMap: any = {};
                    settingsList.forEach((s: any) => { settingsMap[s.key] = s.value; });

                    const bankAccountRaw = settingsMap.bank_account || '';
                    const bankLines = bankAccountRaw.split('\n');

                    setPaymentSettings({
                        enable_ios_payments: settingsMap.enable_ios_payments === '1' || settingsMap.enable_ios_payments === 'true' || settingsMap.enable_ios_payments === true,
                        bank_account: bankAccountRaw,
                        phone_wallet: settingsMap.phone_wallet || ''
                    });

                    setBankDetails({
                        bankName: bankLines[0] || '',
                        accountName: bankLines[1] || '',
                        accountNumber: bankLines[2] || '',
                        iban: bankLines[3] || ''
                    });
                } catch (error) {
                    console.error("Failed to fetch payment settings", error);
                } finally {
                    setPaymentLoading(false);
                }
            }
        };

        fetchSettings();
    }, [activeTab]);


    // Clear messages after 5 seconds
    useEffect(() => {
        const clearTimer = setTimeout(() => {
            setProfileSuccess(null);
            setProfileError(null);
            setPasswordSuccess(null);
            setPasswordError(null);
            setGeneralSuccess(null);
            setContactSuccess(null);
        }, 5000);
        return () => clearTimeout(clearTimer);
    }, [profileSuccess, profileError, passwordSuccess, passwordError, generalSuccess, contactSuccess]);


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

    const handleGeneralSave = async () => {
        setGeneralSaving(true);
        try {
            await Promise.all([
                adminService.upsertSetting('platform_name', generalSettings.platform_name, 'text', 'اسم المنصة'),
                adminService.upsertSetting('support_email', generalSettings.support_email, 'text', 'بريد الدعم'),
                adminService.upsertSetting('description', generalSettings.description, 'text', 'وصف SEO'),
                adminService.upsertSetting('maintenance_mode', generalSettings.maintenance_mode ? '1' : '0', 'boolean', 'وضع الصيانة'),
                adminService.upsertSetting('registration_open', generalSettings.registration_open ? '1' : '0', 'boolean', 'فتح التسجيل'),
                adminService.upsertSetting('default_language', generalSettings.default_language, 'text', 'اللغة الافتراضية'),
            ]);
            setGeneralSuccess('تم حفظ الإعدادات العامة بنجاح');
        } catch (error) {
            console.error("Failed to save general settings", error);
            // Show error toast if we had one
        } finally {
            setGeneralSaving(false);
        }
    };

    const handleContactSave = async () => {
        setContactSaving(true);
        try {
            const socialLinks = {
                facebook: contactSettings.social_facebook,
                twitter: contactSettings.social_twitter,
                instagram: contactSettings.social_instagram,
                youtube: contactSettings.social_youtube
            };

            await Promise.all([
                adminService.upsertSetting('contact_phone', contactSettings.contact_phone, 'text', 'رقم الهاتف'),
                adminService.upsertSetting('contact_whatsapp', contactSettings.contact_whatsapp, 'text', 'رقم واتساب'),
                adminService.upsertSetting('contact_address', contactSettings.contact_address, 'text', 'العنوان'),
                adminService.upsertSetting('contact_map_url', contactSettings.contact_map_url, 'text', 'رابط الخريطة'),
                adminService.upsertSetting('working_hours', contactSettings.working_hours, 'text', 'ساعات العمل'),
                // Save social links as one JSON object
                adminService.upsertSetting('social_media_links', JSON.stringify(socialLinks), 'json', 'روابط التواصل الاجتماعي'),
            ]);
            setContactSuccess('تم حفظ بيانات التواصل بنجاح');
        } catch (error) {
            console.error("Failed to save contact settings", error);
        } finally {
            setContactSaving(false);
        }
    };

    const handleLogoUpload = async (file: File) => {
        try {
            // Upload logic here - need to implement in adminService if not exists or use generic upload
            await adminService.uploadLogo(file); // Hypothetically created
            setGeneralSuccess('تم تحديث الشعار بنجاح (تحديث الصفحة لرؤية التغيير)');
        } catch (error) {
            console.error("Logo upload failed", error);
        }
    };

    // Roles (Mock Data for preview)
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
                    <h1 className="text-2xl font-extrabold text-charcoal dark:text-white mb-1">الإعدادات</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">تخصيص خصائص المنصة وإدارة النظام</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 dark:border-white/10 mb-8 overflow-x-auto">
                <div className="flex items-center gap-6 min-w-max">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`pb-4 px-2 font-bold text-sm transition-all relative flex items-center gap-2 ${activeTab === 'profile' ? 'text-shibl-crimson' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                            }`}
                    >
                        <User size={20} />
                        <span>حسابي</span>
                        {activeTab === 'profile' && <div className="absolute bottom-0 right-0 left-0 h-0.5 bg-shibl-crimson rounded-t-full" />}
                    </button>

                    <button
                        onClick={() => setActiveTab('general')}
                        className={`pb-4 px-2 font-bold text-sm transition-all relative flex items-center gap-2 ${activeTab === 'general' ? 'text-shibl-crimson' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                            }`}
                    >
                        <Settings size={20} />
                        <span>عام</span>
                        {activeTab === 'general' && <div className="absolute bottom-0 right-0 left-0 h-0.5 bg-shibl-crimson rounded-t-full" />}
                    </button>

                    <button
                        onClick={() => setActiveTab('contact')}
                        className={`pb-4 px-2 font-bold text-sm transition-all relative flex items-center gap-2 ${activeTab === 'contact' ? 'text-shibl-crimson' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                            }`}
                    >
                        <Phone size={20} />
                        <span>طرق التواصل</span>
                        {activeTab === 'contact' && <div className="absolute bottom-0 right-0 left-0 h-0.5 bg-shibl-crimson rounded-t-full" />}
                    </button>

                    <button
                        onClick={() => setActiveTab('roles')}
                        className={`pb-4 px-2 font-bold text-sm transition-all relative flex items-center gap-2 ${activeTab === 'roles' ? 'text-shibl-crimson' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                            }`}
                    >
                        <Shield size={20} />
                        <span>الأدوار والصلاحيات</span>
                        {activeTab === 'roles' && <div className="absolute bottom-0 right-0 left-0 h-0.5 bg-shibl-crimson rounded-t-full" />}
                    </button>

                    <button
                        onClick={() => setActiveTab('locations')}
                        className={`pb-4 px-2 font-bold text-sm transition-all relative flex items-center gap-2 ${activeTab === 'locations' ? 'text-shibl-crimson' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                            }`}
                    >
                        <MapPin size={20} />
                        <span>البلدان والمدن</span>
                        {activeTab === 'locations' && <div className="absolute bottom-0 right-0 left-0 h-0.5 bg-shibl-crimson rounded-t-full" />}
                    </button>

                    <button
                        onClick={() => setActiveTab('payments')}
                        className={`pb-4 px-2 font-bold text-sm transition-all relative flex items-center gap-2 ${activeTab === 'payments' ? 'text-shibl-crimson' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                            }`}
                    >
                        <CreditCard size={20} />
                        <span>بوابات الدفع</span>
                        {activeTab === 'payments' && <div className="absolute bottom-0 right-0 left-0 h-0.5 bg-shibl-crimson rounded-t-full" />}
                    </button>

                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`pb-4 px-2 font-bold text-sm transition-all relative flex items-center gap-2 ${activeTab === 'notifications' ? 'text-shibl-crimson' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
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
                    <div className="bg-white dark:bg-[#1E1E1E] rounded-[20px] shadow-card border border-slate-100 dark:border-white/10 p-6">
                        <h3 className="font-bold text-charcoal dark:text-white mb-6 flex items-center gap-2">
                            <User size={20} className="text-slate-400" />
                            الملف الشخصي
                        </h3>

                        {/* Success/Error Messages */}
                        {profileSuccess && (
                            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 rounded-[12px] text-sm flex items-center gap-2">
                                <CheckCircle size={18} />
                                {profileSuccess}
                            </div>
                        )}
                        {profileError && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50 text-red-700 dark:text-red-300 rounded-[12px] text-sm flex items-center gap-2">
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
                                    <p className="font-bold text-charcoal dark:text-white">{profileName || 'Admin'}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{profileEmail}</p>
                                </div>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">الاسم</label>
                                <div className="relative">
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        value={profileName}
                                        onChange={(e) => setProfileName(e.target.value)}
                                        className="w-full h-11 pr-12 pl-4 rounded-[10px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#2A2A2A] text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-sm font-medium"
                                        dir="auto"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">البريد الإلكتروني</label>
                                <div className="relative">
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        value={profileEmail}
                                        onChange={(e) => setProfileEmail(e.target.value)}
                                        className="w-full h-11 pr-12 pl-4 rounded-[10px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#2A2A2A] text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-sm font-medium"
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
                    <div className="bg-white dark:bg-[#1E1E1E] rounded-[20px] shadow-card border border-slate-100 dark:border-white/10 p-6">
                        <h3 className="font-bold text-charcoal dark:text-white mb-6 flex items-center gap-2">
                            <Lock size={20} className="text-slate-400" />
                            تغيير كلمة المرور
                        </h3>

                        {/* Success/Error Messages */}
                        {passwordSuccess && (
                            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 rounded-[12px] text-sm flex items-center gap-2">
                                <CheckCircle size={18} />
                                {passwordSuccess}
                            </div>
                        )}
                        {passwordError && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50 text-red-700 dark:text-red-300 rounded-[12px] text-sm flex items-center gap-2">
                                <AlertCircle size={18} />
                                {passwordError}
                            </div>
                        )}

                        <form onSubmit={handlePasswordUpdate} className="space-y-4">
                            {/* Current Password */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">كلمة المرور الحالية</label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="أدخل كلمة المرور الحالية"
                                        className="w-full h-11 px-4 rounded-[10px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#2A2A2A] text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-sm font-medium"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                                    >
                                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">كلمة المرور الجديدة</label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="أدخل كلمة المرور الجديدة"
                                        className="w-full h-11 px-4 rounded-[10px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#2A2A2A] text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-sm font-medium"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                                    >
                                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">يجب أن تكون 8 أحرف على الأقل</p>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">تأكيد كلمة المرور</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="أعد كتابة كلمة المرور الجديدة"
                                        className="w-full h-11 px-4 rounded-[10px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#2A2A2A] text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-sm font-medium"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={passwordLoading || !newPassword || !confirmPassword}
                                className="w-full h-11 mt-4 rounded-[10px] bg-charcoal dark:bg-white/10 hover:bg-slate-800 dark:hover:bg-white/20 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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

                    {/* App Preferences (Dark Mode) */}
                    <div className="bg-white dark:bg-[#1E1E1E] rounded-[20px] shadow-card border border-slate-100 dark:border-white/10 p-6 lg:col-span-2">
                        <h3 className="font-bold text-charcoal dark:text-white mb-6 flex items-center gap-2">
                            <Settings size={20} className="text-slate-400" />
                            تفضيلات التطبيق
                        </h3>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-[#2A2A2A] border border-slate-100 dark:border-white/10 hover:border-slate-200 dark:hover:border-white/20 transition-colors max-w-sm">
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
                                    style={{ direction: 'ltr' }}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* General Tab Content */}
            {activeTab === 'general' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Platform Info */}
                    <div className="bg-white dark:bg-[#1E1E1E] rounded-[20px] shadow-card border border-slate-100 dark:border-white/10 p-6">
                        <h3 className="font-bold text-charcoal dark:text-white mb-6 flex items-center gap-2">
                            <Settings size={20} className="text-slate-400" />
                            معلومات المنصة
                        </h3>

                        {generalSuccess && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-[12px] text-sm flex items-center gap-2">
                                <CheckCircle size={18} />
                                {generalSuccess}
                            </div>
                        )}

                        <div className="flex flex-col md:flex-row gap-6 mb-6 items-center md:items-start">
                            {/* Logo Upload */}
                            <div className="shrink-0 flex flex-col items-center gap-2">

                                <div className="w-32 h-32 rounded-full border-2 border-dashed border-slate-300 hover:border-shibl-crimson bg-slate-50 flex flex-col items-center justify-center cursor-pointer transition-colors group relative overflow-hidden">
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        accept="image/*"
                                        onChange={(e) => e.target.files && handleLogoUpload(e.target.files[0])}
                                    />
                                    {generalSettings.logo_path ? (
                                        <img src={generalSettings.logo_path} alt="Logo" className="w-full h-full object-cover rounded-full" />
                                    ) : (
                                        <>
                                            <Upload size={24} className="text-slate-400 group-hover:text-shibl-crimson transition-colors" />
                                            <span className="text-xs text-slate-500 mt-2">تحميل الشعار</span>
                                        </>
                                    )}
                                </div>
                                <span className="text-xs text-slate-400">PNG, JPG (Max 2MB)</span>
                            </div>

                            {/* Inputs */}
                            <div className="flex-1 w-full space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">اسم الموقع</label>
                                    <input
                                        type="text"
                                        value={generalSettings.platform_name}
                                        onChange={(e) => setGeneralSettings({ ...generalSettings, platform_name: e.target.value })}
                                        className="w-full h-11 px-4 rounded-[10px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#2A2A2A] text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-sm font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">بريد الدعم الفني</label>
                                    <input
                                        type="email"
                                        value={generalSettings.support_email}
                                        onChange={(e) => setGeneralSettings({ ...generalSettings, support_email: e.target.value })}
                                        className="w-full h-11 px-4 rounded-[10px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#2A2A2A] text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-sm font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">وصف مختصر (SEO)</label>
                            <textarea
                                value={generalSettings.description}
                                onChange={(e) => setGeneralSettings({ ...generalSettings, description: e.target.value })}
                                className="w-full h-24 px-4 py-3 rounded-[10px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#2A2A2A] text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-sm font-medium resize-none"
                                placeholder="منصة تعليمية رائدة..."
                            />
                        </div>

                        <button
                            onClick={handleGeneralSave}
                            disabled={generalSaving}
                            className="w-full h-11 mt-6 rounded-[10px] bg-shibl-crimson hover:bg-red-800 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
                        >
                            {generalSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            حفظ التغييرات
                        </button>
                    </div>

                    {/* System Settings */}
                    <div className="bg-white dark:bg-[#1E1E1E] rounded-[20px] shadow-card border border-slate-100 dark:border-white/10 p-6">
                        <h3 className="font-bold text-charcoal dark:text-white mb-6 flex items-center gap-2">
                            <Shield size={20} className="text-slate-400" />
                            إعدادات النظام
                        </h3>

                        <div className="space-y-6">
                            {/* Maintenance Mode */}
                            <div className="flex items-center justify-between p-4 rounded-[12px] bg-slate-50 dark:bg-[#2A2A2A] border border-slate-100 dark:border-white/10">
                                <div>
                                    <p className="font-bold text-charcoal dark:text-white text-sm">وضع الصيانة</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">عند التفعيل، ستكون المنصة غير متاحة للزوار</p>
                                </div>
                                <button
                                    onClick={() => setGeneralSettings({ ...generalSettings, maintenance_mode: !generalSettings.maintenance_mode })}
                                    className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${generalSettings.maintenance_mode ? 'bg-red-500' : 'bg-slate-300'
                                        }`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-sm ${generalSettings.maintenance_mode ? 'left-1' : 'left-6'
                                        }`} />
                                </button>
                            </div>

                            {/* Registration Toggle */}
                            <div className="flex items-center justify-between p-4 rounded-[12px] bg-slate-50 dark:bg-[#2A2A2A] border border-slate-100 dark:border-white/10">
                                <div>
                                    <p className="font-bold text-charcoal dark:text-white text-sm">فتح التسجيل</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">السماح بتسجيل مستخدمين جدد</p>
                                </div>
                                <button
                                    onClick={() => setGeneralSettings({ ...generalSettings, registration_open: !generalSettings.registration_open })}
                                    className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${generalSettings.registration_open ? 'bg-green-500' : 'bg-slate-300'
                                        }`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-sm ${generalSettings.registration_open ? 'left-1' : 'left-6'
                                        }`} />
                                </button>
                            </div>

                            {/* Default Language */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">اللغة الافتراضية</label>
                                <div className="relative">
                                    <select
                                        value={generalSettings.default_language}
                                        onChange={(e) => setGeneralSettings({ ...generalSettings, default_language: e.target.value })}
                                        className="w-full h-11 px-4 rounded-[10px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#2A2A2A] dark:text-white focus:border-shibl-crimson outline-none text-sm font-medium appearance-none"
                                    >
                                        <option value="ar">العربية (Arabic)</option>
                                        <option value="en">الإنجليزية (English)</option>
                                    </select>
                                    <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }

            {/* Contact Tab Content */}
            {
                activeTab === 'contact' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Contact Info */}
                        <div className="bg-white dark:bg-[#1E1E1E] rounded-[20px] shadow-card border border-slate-100 dark:border-white/10 p-6">
                            <h3 className="font-bold text-charcoal dark:text-white mb-6 flex items-center gap-2">
                                <Phone size={20} className="text-slate-400" />
                                بيانات التواصل
                            </h3>

                            {contactSuccess && (
                                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-[12px] text-sm flex items-center gap-2">
                                    <CheckCircle size={18} />
                                    {contactSuccess}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">رقم الهاتف الرئيسي</label>
                                    <div className="relative">
                                        <Phone size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={contactSettings.contact_phone}
                                            onChange={(e) => setContactSettings({ ...contactSettings, contact_phone: e.target.value })}
                                            className="w-full h-11 pr-12 pl-4 rounded-[10px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#2A2A2A] text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-sm font-medium"
                                            dir="ltr"
                                            placeholder="+966 50 000 0000"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">رقم الواتساب</label>
                                    <div className="relative">
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs bg-slate-100 rounded px-1">WA</div>
                                        <input
                                            type="text"
                                            value={contactSettings.contact_whatsapp}
                                            onChange={(e) => setContactSettings({ ...contactSettings, contact_whatsapp: e.target.value })}
                                            className="w-full h-11 pr-12 pl-4 rounded-[10px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#2A2A2A] text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-sm font-medium"
                                            dir="ltr"
                                            placeholder="Same format"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">العنوان</label>
                                    <div className="relative">
                                        <MapPin size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={contactSettings.contact_address}
                                            onChange={(e) => setContactSettings({ ...contactSettings, contact_address: e.target.value })}
                                            className="w-full h-11 pr-12 pl-4 rounded-[10px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#2A2A2A] text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-sm font-medium"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">رابط الخريطة (Google Maps)</label>
                                    <div className="relative">
                                        <Map size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={contactSettings.contact_map_url}
                                            onChange={(e) => setContactSettings({ ...contactSettings, contact_map_url: e.target.value })}
                                            className="w-full h-11 pr-12 pl-4 rounded-[10px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#2A2A2A] text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-sm font-medium"
                                            dir="ltr"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">ساعات العمل</label>
                                    <textarea
                                        value={contactSettings.working_hours}
                                        onChange={(e) => setContactSettings({ ...contactSettings, working_hours: e.target.value })}
                                        className="w-full h-24 px-4 py-3 rounded-[10px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#2A2A2A] text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-sm font-medium resize-none"
                                        placeholder="الأحد - الخميس: 9 ص - 5 م..."
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleContactSave}
                                disabled={contactSaving}
                                className="w-full h-11 mt-6 rounded-[10px] bg-shibl-crimson hover:bg-red-800 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
                            >
                                {contactSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                حفظ التغييرات
                            </button>
                        </div>

                        {/* Social Media */}
                        <div className="bg-white dark:bg-[#1E1E1E] rounded-[20px] shadow-card border border-slate-100 dark:border-white/10 p-6">
                            <h3 className="font-bold text-charcoal dark:text-white mb-6 flex items-center gap-2">
                                <Globe size={20} className="text-slate-400" />
                                حسابات التواصل الاجتماعي
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">فيسبوك</label>
                                    <div className="relative">
                                        <Facebook size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600" />
                                        <input
                                            type="text"
                                            value={contactSettings.social_facebook}
                                            onChange={(e) => setContactSettings({ ...contactSettings, social_facebook: e.target.value })}
                                            className="w-full h-11 pr-12 pl-4 rounded-[10px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#2A2A2A] text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-sm font-medium"
                                            dir="ltr"
                                            placeholder="https://facebook.com/..."
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">تويتر (X)</label>
                                    <div className="relative">
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-black text-xs">X</span>
                                        <input
                                            type="text"
                                            value={contactSettings.social_twitter}
                                            onChange={(e) => setContactSettings({ ...contactSettings, social_twitter: e.target.value })}
                                            className="w-full h-11 pr-12 pl-4 rounded-[10px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#2A2A2A] text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-sm font-medium"
                                            dir="ltr"
                                            placeholder="https://twitter.com/..."
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">انستجرام</label>
                                    <div className="relative">
                                        <LinkIcon size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-pink-600" />
                                        <input
                                            type="text"
                                            value={contactSettings.social_instagram}
                                            onChange={(e) => setContactSettings({ ...contactSettings, social_instagram: e.target.value })}
                                            className="w-full h-11 pr-12 pl-4 rounded-[10px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#2A2A2A] text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-sm font-medium"
                                            dir="ltr"
                                            placeholder="https://instagram.com/..."
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">يوتيوب</label>
                                    <div className="relative">
                                        <LinkIcon size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-red-600" />
                                        <input
                                            type="text"
                                            value={contactSettings.social_youtube}
                                            onChange={(e) => setContactSettings({ ...contactSettings, social_youtube: e.target.value })}
                                            className="w-full h-11 pr-12 pl-4 rounded-[10px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#2A2A2A] text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-sm font-medium"
                                            dir="ltr"
                                            placeholder="https://youtube.com/..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Roles Tab Placeholder */}
            {
                activeTab === 'roles' && (
                    <div className="bg-white dark:bg-[#1E1E1E] rounded-[20px] shadow-card border border-slate-100 dark:border-white/10 overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
                            <h3 className="font-bold text-charcoal dark:text-white">الأدوار المتاحة</h3>
                            <button className="text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-lg font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                                + إضافة دور جديد
                            </button>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-white/10">
                            {roles.map((role) => (
                                <div key={role.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <div>
                                        <h4 className="font-bold text-charcoal dark:text-white">{role.name}</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{role.description}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full">
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
                )
            }

            {/* Locations Tab */}
            {
                activeTab === 'locations' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Countries Section */}
                            <div className="bg-white dark:bg-[#1E1E1E] rounded-[20px] shadow-card border border-slate-100 dark:border-white/10 p-6 flex flex-col h-[600px]">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-charcoal dark:text-white flex items-center gap-2">
                                            <Globe className="text-shibl-crimson" size={20} />
                                            الدول
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">إدارة قائمة الدول المتاحة</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setEditingCountry(null);
                                            setCountryForm({ name: '', code: '' });
                                            setIsCountryModalOpen(true);
                                        }}
                                        className="p-2 bg-shibl-crimson/10 text-shibl-crimson rounded-lg hover:bg-shibl-crimson/20 transition-colors"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                                    {isLocationLoading && countries.length === 0 ? (
                                        <div className="flex justify-center items-center h-40">
                                            <Loader2 className="animate-spin text-shibl-crimson" />
                                        </div>
                                    ) : countries.length === 0 ? (
                                        <div className="text-center py-10 text-slate-400">لا توجد دول مضافة</div>
                                    ) : (
                                        countries.map((country) => (
                                            <div
                                                key={country.id}
                                                onClick={() => setSelectedCountry(country)}
                                                className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedCountry?.id === country.id
                                                    ? 'border-shibl-crimson bg-shibl-crimson/5 shadow-sm'
                                                    : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-bold text-charcoal dark:text-white">{country.name}</h4>
                                                        <span className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded mt-1 inline-block">
                                                            {country.code}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingCountry(country);
                                                                setCountryForm({ name: country.name, code: country.code });
                                                                setIsCountryModalOpen(true);
                                                            }}
                                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteCountry(country.id);
                                                            }}
                                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Cities Section */}
                            <div className="bg-white dark:bg-[#1E1E1E] rounded-[20px] shadow-card border border-slate-100 dark:border-white/10 p-6 flex flex-col h-[600px]">
                                {selectedCountry ? (
                                    <>
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h3 className="text-lg font-bold text-charcoal dark:text-white flex items-center gap-2">
                                                    <MapPin className="text-shibl-crimson" size={20} />
                                                    المدن - {selectedCountry.name}
                                                </h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">إدارة المدن التابعة للدولة المحددة</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setEditingCity(null);
                                                    setCityForm({ name: '' });
                                                    setIsCityModalOpen(true);
                                                }}
                                                className="p-2 bg-shibl-crimson/10 text-shibl-crimson rounded-lg hover:bg-shibl-crimson/20 transition-colors"
                                            >
                                                <Plus size={20} />
                                            </button>
                                        </div>

                                        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                                            {isLocationLoading ? (
                                                <div className="flex justify-center items-center h-40">
                                                    <Loader2 className="animate-spin text-shibl-crimson" />
                                                </div>
                                            ) : cities.length === 0 ? (
                                                <div className="text-center py-10 text-slate-400">لا توجد مدن مضافة لهذه الدولة</div>
                                            ) : (
                                                cities.map((city) => (
                                                    <div
                                                        key={city.id}
                                                        className="p-4 rounded-xl border border-slate-100 dark:border-white/10 hover:border-slate-200 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5 transition-all flex items-center justify-between group"
                                                    >
                                                        <h4 className="font-bold text-charcoal dark:text-white">{city.name}</h4>
                                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingCity(city);
                                                                    setCityForm({ name: city.name });
                                                                    setIsCityModalOpen(true);
                                                                }}
                                                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteCity(city.id)}
                                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                        <Globe size={48} className="mb-4 opacity-20" />
                                        <p>اختر دولة لعرض وإدارة مدنها</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Country Modal */}
                        {isCountryModalOpen && (
                            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                                <div className="bg-white dark:bg-[#1E1E1E] rounded-[20px] w-full max-w-md p-6 shadow-xl animate-in zoom-in-95 duration-200">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-bold text-charcoal dark:text-white">
                                            {editingCountry ? 'تعديل بيانات الدولة' : 'اضافة دولة جديدة'}
                                        </h3>
                                        <button onClick={() => setIsCountryModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                            <X size={24} />
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-charcoal dark:text-white mb-2">اسم الدولة</label>
                                            <input
                                                type="text"
                                                value={countryForm.name}
                                                onChange={(e) => setCountryForm({ ...countryForm, name: e.target.value })}
                                                className="w-full h-11 px-4 rounded-[10px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#2A2A2A] text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-sm font-medium"
                                                placeholder="مثال: المملكة العربية السعودية"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-charcoal dark:text-white mb-2">كود الدولة</label>
                                            <input
                                                type="text"
                                                value={countryForm.code}
                                                onChange={(e) => setCountryForm({ ...countryForm, code: e.target.value })}
                                                className="w-full h-11 px-4 rounded-[10px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#2A2A2A] text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-sm font-medium font-mono"
                                                placeholder="مثال: SA"
                                            />
                                        </div>
                                        <div className="flex justify-end gap-3 mt-6">
                                            <button
                                                onClick={() => setIsCountryModalOpen(false)}
                                                className="px-6 h-11 rounded-[10px] font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                                            >
                                                إلغاء
                                            </button>
                                            <button
                                                onClick={handleSaveCountry}
                                                disabled={!countryForm.name || !countryForm.code}
                                                className="px-6 h-11 bg-shibl-crimson hover:bg-shibl-crimson-dark text-white rounded-[10px] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                حفظ
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* City Modal */}
                        {isCityModalOpen && (
                            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                                <div className="bg-white dark:bg-[#1E1E1E] rounded-[20px] w-full max-w-md p-6 shadow-xl animate-in zoom-in-95 duration-200">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-bold text-charcoal dark:text-white">
                                            {editingCity ? 'تعديل بيانات المدينة' : 'اضافة مدينة جديدة'}
                                        </h3>
                                        <button onClick={() => setIsCityModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                            <X size={24} />
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-charcoal dark:text-white mb-2">اسم المدينة</label>
                                            <input
                                                type="text"
                                                value={cityForm.name}
                                                onChange={(e) => setCityForm({ ...cityForm, name: e.target.value })}
                                                className="w-full h-11 px-4 rounded-[10px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#2A2A2A] text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-sm font-medium"
                                                placeholder="مثال: الرياض"
                                            />
                                        </div>
                                        <div className="flex justify-end gap-3 mt-6">
                                            <button
                                                onClick={() => setIsCityModalOpen(false)}
                                                className="px-6 h-11 rounded-[10px] font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                                            >
                                                إلغاء
                                            </button>
                                            <button
                                                onClick={handleSaveCity}
                                                disabled={!cityForm.name}
                                                className="px-6 h-11 bg-shibl-crimson hover:bg-shibl-crimson-dark text-white rounded-[10px] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                حفظ
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )
            }

            {/* Payments Tab */}
            {
                activeTab === 'payments' && (
                    <div className="space-y-6">
                        {/* iOS Payments Toggle */}
                        <div className="bg-white dark:bg-[#1E1E1E] rounded-[20px] shadow-card border border-slate-100 dark:border-white/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-charcoal dark:text-white flex items-center gap-2">
                                    <CreditCard className="text-shibl-crimson" size={20} />
                                    مدفوعات iOS
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                    تمكين أو تعطيل المدفوعات من خلال تطبيقات iOS
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={paymentSettings.enable_ios_payments}
                                        onChange={async (e) => {
                                            const newValue = e.target.checked;
                                            setPaymentSettings(prev => ({ ...prev, enable_ios_payments: newValue }));
                                            // Auto-save toggle
                                            try {
                                                await adminService.upsertSetting('enable_ios_payments', newValue ? '1' : '0', 'boolean', 'مدفوعات iOS');
                                                setPaymentSuccess('تم تحديث حالة مدفوعات iOS');
                                                setTimeout(() => setPaymentSuccess(null), 3000);
                                            } catch (error) {
                                                console.error("Failed to update iOS payment setting", error);
                                            }
                                        }}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-shibl-crimson/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-shibl-crimson"></div>
                                </label>
                            </div>
                        </div>

                        {/* Payment Information Form */}
                        <div className="bg-white dark:bg-[#1E1E1E] rounded-[20px] shadow-card border border-slate-100 dark:border-white/10 p-6">
                            <h3 className="text-lg font-bold text-charcoal dark:text-white mb-6 flex items-center gap-2">
                                <Settings size={20} className="text-shibl-crimson" />
                                بيانات الدفع والتحويل
                            </h3>

                            <div className="space-y-6">
                                {/* Bank Account */}
                                {/* Bank Account - Structured Inputs */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-charcoal dark:text-white border-b border-slate-100 dark:border-white/10 pb-2">بيانات الحساب البنكي</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">اسم البنك</label>
                                            <input
                                                type="text"
                                                value={bankDetails.bankName}
                                                onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                                                className="w-full h-11 px-4 rounded-[10px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#2A2A2A] text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-sm font-medium"
                                                placeholder="مثال: بنك مسقط"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">اسم صاحب الحساب</label>
                                            <input
                                                type="text"
                                                value={bankDetails.accountName}
                                                onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                                                className="w-full h-11 px-4 rounded-[10px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#2A2A2A] text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-sm font-medium"
                                                placeholder="الاسم بالكامل كما يظهر في الحساب البنكي"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">رقم الحساب</label>
                                            <input
                                                type="text"
                                                value={bankDetails.accountNumber}
                                                onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                                                className="w-full h-11 px-4 rounded-[10px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#2A2A2A] text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-sm font-medium font-mono"
                                                dir="ltr"
                                                placeholder="000000000000"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">رقم الآيبان (IBAN)</label>
                                            <input
                                                type="text"
                                                value={bankDetails.iban}
                                                onChange={(e) => setBankDetails({ ...bankDetails, iban: e.target.value })}
                                                className="w-full h-11 px-4 rounded-[10px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#2A2A2A] text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-sm font-medium font-mono"
                                                dir="ltr"
                                                placeholder="OM..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Wallet Number */}
                                <div>
                                    <label className="block text-sm font-bold text-charcoal dark:text-white mb-2">رقم المحفظة الإلكترونية</label>
                                    <div className="relative">
                                        <Phone size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={paymentSettings.phone_wallet}
                                            onChange={(e) => setPaymentSettings(prev => ({ ...prev, phone_wallet: e.target.value }))}
                                            className="w-full h-11 pr-12 pl-4 rounded-[10px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#2A2A2A] text-charcoal dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none text-sm font-medium"
                                            placeholder="01xxxxxxxxx"
                                            dir="ltr"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center justify-end gap-3">
                                {paymentSuccess && (
                                    <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg animate-in fade-in slide-in-from-bottom-2">
                                        <CheckCircle size={16} />
                                        <span className="text-sm font-bold">{paymentSuccess}</span>
                                    </div>
                                )}
                                <button
                                    onClick={async () => {
                                        setPaymentSaving(true);
                                        try {
                                            // Construct bank_account string: Name\nAccountName\nAccountNumber\nIBAN
                                            // Use trim() to clean up inputs, but maintain the 4-line structure even if empty
                                            const bankAccountString = [
                                                bankDetails.bankName.trim(),
                                                bankDetails.accountName.trim(),
                                                bankDetails.accountNumber.trim(),
                                                bankDetails.iban.trim()
                                            ].join('\n');

                                            await Promise.all([
                                                adminService.upsertSetting('bank_account', bankAccountString, 'text'),
                                                adminService.upsertSetting('phone_wallet', paymentSettings.phone_wallet, 'text')
                                            ]);
                                            setPaymentSuccess('تم حفظ بيانات الدفع بنجاح');
                                            setTimeout(() => setPaymentSuccess(null), 3000);
                                        } catch (error) {
                                            console.error("Failed to save payment settings", error);
                                        } finally {
                                            setPaymentSaving(false);
                                        }
                                    }}
                                    disabled={paymentSaving}
                                    className="h-11 px-8 bg-shibl-crimson hover:bg-shibl-crimson-dark text-white rounded-[10px] font-bold transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-shibl-crimson/20"
                                >
                                    {paymentSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    حفظ التغييرات
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Notifications Tab Placeholder */}
            {
                activeTab === 'notifications' && (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#1E1E1E] rounded-[20px] border border-slate-100 dark:border-white/10 shadow-sm">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-white/10 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle size={32} className="text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-charcoal dark:text-white mb-2">قريباً</h3>
                        <p className="text-slate-500 dark:text-slate-400">هذا القسم قيد التطوير</p>
                    </div>
                )
            }
        </>
    );
}
