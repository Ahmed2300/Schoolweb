import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks';
import { AuthNavbar } from '../../components';
import { ROUTES } from '../../../shared/constants';
import { authService } from '../../../data/api';
import apiClient from '../../../data/api/ApiClient';
import { endpoints } from '../../../data/api/endpoints';

// Lucide Icons
import {
    User,
    Mail,
    Phone,
    Lock,
    Eye,
    EyeOff,
    ArrowLeft,
    GraduationCap,
    Users,
    CheckCircle,
    Activity,
    Star,
    Flag,
    BadgeCheck,
    MessageCircle,
    MessageSquare,
    Globe,
    ChevronDown,
    Info,
    Smartphone,
    School,
    Sparkles,
    Facebook,
    Instagram,
    Twitter,
    Home,
    Building,
    FileText,
    Ghost,
    PhoneCall,
    X
} from 'lucide-react';

// How did you know us options with icons
const HOW_DID_YOU_KNOW_US_OPTIONS = [
    { value: 'instagram', label: 'انستجرام', Icon: Instagram, color: 'text-pink-600' },
    { value: 'twitter', label: 'تويتر', Icon: Twitter, color: 'text-sky-500' },
    { value: 'snapchat', label: 'سناب شات', Icon: Ghost, color: 'text-yellow-500' },
    { value: 'facebook', label: 'فيسبوك', Icon: Facebook, color: 'text-blue-600' },
    { value: 'whatsapp', label: 'واتس', Icon: MessageCircle, color: 'text-green-500' },
    { value: 'phone_call', label: 'مكالمة هاتفية', Icon: PhoneCall, color: 'text-purple-500' },
    { value: 'friend', label: 'صديق', Icon: Users, color: 'text-indigo-500' },
    { value: 'other', label: 'أخرى', Icon: FileText, color: 'text-slate-500' },
];



// No UserType needed - student only

// Types for API responses
interface LocalizedName {
    en?: string;
    ar?: string;
    [key: string]: string | undefined;
}

interface Country {
    id: number;
    name: string | LocalizedName;
    code?: string;
}

interface City {
    id: number;
    name: string | LocalizedName;
    country_id: number;
}

// Helper function to get the name string from localized object or string
const getLocalizedName = (name: string | LocalizedName | undefined, lang: string = 'ar'): string => {
    if (!name) return '';
    if (typeof name === 'string') return name;
    // Try requested language first, then fallback to 'en', then first available
    return name[lang] || name.en || name.ar || Object.values(name).find(v => v) || '';
};

export function SignupPage() {
    const { isRTL } = useLanguage();
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // Countries and cities state
    const [countries, setCountries] = useState<Country[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [loadingCountries, setLoadingCountries] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        countryCode: '+968',
        countryId: 0,
        cityId: 0,
        password: '',
        confirmPassword: '',
        // Parent fields - now required
        parentName: '',
        parentEmail: '',
        parentPhone: '',
        howDidYouKnowUs: '',
        howDidYouKnowUsOther: '',
    });

    // Dropdown state
    const [isHowDidYouKnowUsOpen, setIsHowDidYouKnowUsOpen] = useState(false);

    // Fallback countries for when API is unavailable
    const FALLBACK_COUNTRIES: Country[] = [
        { id: 1, name: 'عمان' },
        { id: 2, name: 'السعودية' },
        { id: 3, name: 'الإمارات' },
        { id: 4, name: 'الكويت' },
        { id: 5, name: 'البحرين' },
        { id: 6, name: 'قطر' },
    ];

    // Fallback cities for Oman
    const FALLBACK_CITIES: City[] = [
        { id: 1, name: 'مسقط', country_id: 1 },
        { id: 2, name: 'صلالة', country_id: 1 },
        { id: 3, name: 'صحار', country_id: 1 },
        { id: 4, name: 'نزوى', country_id: 1 },
        { id: 5, name: 'صور', country_id: 1 },
    ];

    // Fetch countries on mount and auto-select Oman
    useEffect(() => {
        const fetchCountries = async () => {
            setLoadingCountries(true);
            try {
                const response = await apiClient.get(endpoints.locations.countries);
                const countryData = response.data.data || response.data;
                if (countryData && countryData.length > 0) {
                    setCountries(countryData);

                    // Auto-select Oman as default country
                    const omanCountry = countryData.find((c: Country) => {
                        const name = getLocalizedName(c.name, 'en');
                        return name.toLowerCase() === 'oman' || name === 'عمان';
                    });

                    if (omanCountry) {
                        setFormData(prev => ({ ...prev, countryId: omanCountry.id }));
                    } else if (countryData.length > 0) {
                        setFormData(prev => ({ ...prev, countryId: countryData[0].id }));
                    }
                } else {
                    // Use fallback if no data returned
                    setCountries(FALLBACK_COUNTRIES);
                    setFormData(prev => ({ ...prev, countryId: 1 })); // Oman
                }
            } catch (err) {
                console.error('Failed to fetch countries, using fallback:', err);
                // Use fallback countries
                setCountries(FALLBACK_COUNTRIES);
                setFormData(prev => ({ ...prev, countryId: 1 })); // Default to Oman
            } finally {
                setLoadingCountries(false);
            }
        };
        fetchCountries();
    }, []);

    // Fetch cities when country changes
    useEffect(() => {
        const fetchCities = async () => {
            if (!formData.countryId) {
                setCities([]);
                return;
            }
            setLoadingCities(true);
            try {
                const response = await apiClient.get(endpoints.locations.cities(formData.countryId));
                const cityData = response.data.data || response.data;
                if (cityData && cityData.length > 0) {
                    setCities(cityData);
                    // Set default city if available
                    setFormData(prev => ({ ...prev, cityId: cityData[0].id }));
                } else {
                    // Use fallback cities for Oman if API returns empty
                    if (formData.countryId === 1) {
                        setCities(FALLBACK_CITIES);
                        setFormData(prev => ({ ...prev, cityId: 1 })); // Muscat
                    } else {
                        setCities([]);
                        setFormData(prev => ({ ...prev, cityId: 0 }));
                    }
                }
            } catch (err) {
                console.error('Failed to fetch cities, using fallback:', err);
                // Use fallback cities for Oman
                if (formData.countryId === 1) {
                    setCities(FALLBACK_CITIES);
                    setFormData(prev => ({ ...prev, cityId: 1 })); // Default to Muscat
                } else {
                    setCities([]);
                    setFormData(prev => ({ ...prev, cityId: 0 }));
                }
            } finally {
                setLoadingCities(false);
            }
        };
        fetchCities();
    }, [formData.countryId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreeTerms) return;

        // Custom validation
        const errors: Record<string, string> = {};

        if (!formData.name.trim()) {
            errors.name = 'الاسم مطلوب';
        }

        if (!formData.email) {
            errors.email = 'البريد الإلكتروني مطلوب';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'يرجى إدخال بريد إلكتروني صحيح';
        }

        if (!formData.phone) {
            errors.phone = 'رقم الهاتف مطلوب';
        }

        // Country and city required for students
        if (!formData.countryId || formData.countryId === 0) {
            errors.country = 'يرجى اختيار الدولة';
        }
        if (!formData.cityId || formData.cityId === 0) {
            errors.city = 'يرجى اختيار الولاية أو المدينة';
        }

        // Parent account fields - now REQUIRED
        if (!formData.parentName) {
            errors.parentName = 'اسم ولي الأمر مطلوب';
        }
        if (!formData.parentEmail) {
            errors.parentEmail = 'البريد الإلكتروني لولي الأمر مطلوب';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parentEmail)) {
            errors.parentEmail = 'يرجى إدخال بريد إلكتروني صحيح لولي الأمر';
        }
        if (!formData.parentPhone) {
            errors.parentPhone = 'رقم هاتف ولي الأمر مطلوب';
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('كلمتا المرور غير متطابقتين');
            return;
        }

        if (formData.password.length < 8) {
            setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Only student registration now
            await authService.studentRegister({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                password_confirmation: formData.confirmPassword,
                country_id: formData.countryId,
                city_id: formData.cityId,
                parent_phone: formData.parentPhone,
                parent_name: formData.parentName,
                parent_email: formData.parentEmail,
                how_do_you_know_us: formData.howDidYouKnowUs === 'other'
                    ? formData.howDidYouKnowUsOther
                    : (formData.howDidYouKnowUs || undefined),
            });

            // Navigate to email verification page with additional data to preserve it across the session
            // (since backend StudentResource doesn't return these fields on login/verify)
            navigate(ROUTES.VERIFY_EMAIL, {
                state: {
                    email: formData.email,
                    userType: 'student',
                }
            });
        } catch (err: any) {
            // Handle validation errors
            const errorMsg = err.response?.data?.message || err.message || '';

            if (errorMsg.includes('already registered') || errorMsg.includes('already been taken')) {
                setError('هذا البريد الإلكتروني مسجل بالفعل');
            } else {
                setError(err.response?.data?.message || 'حدث خطأ. يرجى المحاولة مرة أخرى');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
        setFieldErrors(prev => ({ ...prev, [field]: '' }));
    };

    return (
        <div className="min-h-screen bg-soft-cloud" dir={isRTL ? 'rtl' : 'ltr'}>
            <AuthNavbar />

            <div className="pt-[72px] min-h-screen grid lg:grid-cols-2">
                {/* Visual Section - Order 1 on desktop makes it appear on LEFT in RTL */}
                <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-red-50 via-rose-50 to-orange-50 p-12 relative overflow-hidden lg:order-1 sticky top-0 h-screen">
                    {/* Visual card removed - student only now */}

                    <div className="relative w-full max-w-lg flex flex-col items-center gap-6">
                        {/* Main Image */}
                        <div className="relative w-full max-w-[400px]">
                            <img
                                src="/images/signup-student.png"
                                alt="Student Illustration"
                                className="w-full h-auto rounded-3xl drop-shadow-2xl"
                            />
                        </div>

                        {/* Testimonial Card */}
                        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl max-w-xs absolute -bottom-12 left-1/2 -translate-x-1/2 w-full animate-float z-10 border border-white/50">
                            <div className="flex gap-1 mb-3 justify-center">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Star key={i} size={20} className="text-amber-400 fill-amber-400 drop-shadow-sm" />
                                ))}
                            </div>
                            <p className="text-[15px] leading-relaxed text-charcoal mb-4 text-center font-medium">
                                "أفضل منصة ساعدت ابني على التفوق، الدروس مشروحة بطريقة مبسطة ورائعة!"
                            </p>
                            <div className="flex items-center gap-3 justify-center">
                                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-xl border-2 border-white shadow-sm">
                                    <img src="/images/avatar-placeholder.png" alt="Sarah" className="w-full h-full rounded-full object-cover" onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah';
                                    }} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-charcoal text-[15px]">سارة الأحمد</span>
                                    <span className="text-xs text-slate-500 font-medium">ولية أمر</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visual card removed - student only now */}
                </div>

                {/* Form Section - Order 2 on desktop makes it appear on RIGHT in RTL */}
                <div className="flex items-center justify-center p-8 lg:order-2">
                    <div className="w-full max-w-[420px]">
                        {/* Logo */}
                        <div className="flex items-center gap-2 mb-8 justify-center lg:justify-start">
                            <img src="/images/subol-red.png" alt="سُبُل" className="w-8 h-8 lg:w-9 lg:h-9" />
                            <span className="text-2xl lg:text-3xl font-extrabold text-shibl-crimson">سُبُل</span>
                        </div>

                        {/* Header */}
                        <div className="mb-6 text-center lg:text-right">
                            <h1 className="text-3xl font-extrabold text-charcoal mb-2">
                                إنشاء حساب طالب جديد
                            </h1>
                            <p className="text-slate-grey">
                                انضم إلى مجتمعنا التعليمي اليوم
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center">
                                {error}
                            </div>
                        )}
                        {/* No tabs - student only registration */}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                            {/* Full Name */}
                            <div className="form-control w-full">
                                <label className="label pb-1">
                                    <span className="label-text font-bold text-slate-700">الاسم الكامل</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="أدخل اسمك الثلاثي"
                                        className={`input-pro pr-12 ${fieldErrors.name ? 'input-pro-error' : ''}`}
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        dir="rtl"
                                    />
                                    <User size={20} className={`absolute right-4 top-1/2 -translate-y-1/2 ${fieldErrors.name ? 'text-red-400' : 'text-slate-400'}`} />
                                </div>
                                {fieldErrors.name && <p className="text-red-500 text-sm mt-1">⚠ {fieldErrors.name}</p>}
                            </div>

                            {/* Email */}
                            <div className="form-control w-full">
                                <label className="label pb-1">
                                    <span className="label-text font-bold text-slate-700">البريد الإلكتروني</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        placeholder="name@example.com"
                                        className={`input-pro pr-12 ${fieldErrors.email ? 'input-pro-error' : ''}`}
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        dir="rtl"
                                    />
                                    <Mail size={20} className={`absolute right-4 top-1/2 -translate-y-1/2 ${fieldErrors.email ? 'text-red-400' : 'text-slate-400'}`} />
                                </div>
                                {fieldErrors.email && <p className="text-red-500 text-sm mt-1">⚠ {fieldErrors.email}</p>}
                            </div>

                            {/* Phone - Required */}
                            <div className="form-control w-full">
                                <label className="label pb-1">
                                    <span className="label-text font-bold text-slate-700">رقم الهاتف</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        placeholder="01xxxxxxxxx"
                                        className="input-pro pr-12 pl-24"
                                        value={formData.phone}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                        dir="rtl"
                                    />
                                    <User size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <div className="absolute left-0 top-0 bottom-0 flex items-center gap-1.5 px-4 bg-slate-50 border-r border-slate-200 rounded-l-lg text-slate-700 font-bold text-sm">
                                        <Flag size={16} />
                                        <span>{formData.countryCode}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Location - Country and City Selection */}
                            {/* Country Selection - Dynamic */}
                            <div className="form-control w-full">
                                <label className="label pb-1">
                                    <span className="label-text font-bold text-slate-700">الدولة</span>
                                </label>
                                <div className="relative">
                                    <select
                                        className={`input-pro pr-12 ${fieldErrors.country ? 'input-pro-error' : ''}`}
                                        value={formData.countryId}
                                        onChange={(e) => {
                                            const newCountryId = Number(e.target.value);
                                            setFormData(prev => ({ ...prev, countryId: newCountryId, cityId: 0 }));
                                            setFieldErrors(prev => ({ ...prev, country: '', city: '' }));
                                        }}
                                        dir="rtl"
                                        disabled={loadingCountries}
                                    >
                                        {loadingCountries ? (
                                            <option value="0">جاري التحميل...</option>
                                        ) : (
                                            <>
                                                <option value="0">اختر الدولة</option>
                                                {countries.map((country) => (
                                                    <option key={country.id} value={country.id}>
                                                        {getLocalizedName(country.name, 'ar')}
                                                    </option>
                                                ))}
                                            </>
                                        )}
                                    </select>
                                    <Flag size={20} className={`absolute right-4 top-1/2 -translate-y-1/2 ${fieldErrors.country ? 'text-red-400' : 'text-slate-400'}`} />
                                </div>
                                {fieldErrors.country && <p className="text-red-500 text-sm mt-1">⚠ {fieldErrors.country}</p>}
                            </div>

                            {/* City / Governorate Selection - Dynamic */}
                            <div className="form-control w-full">
                                <label className="label pb-1">
                                    <span className="label-text font-bold text-slate-700">الولاية / المدينة</span>
                                </label>
                                <div className="relative">
                                    <select
                                        className={`input-pro pr-12 ${fieldErrors.city ? 'input-pro-error' : ''}`}
                                        value={formData.cityId}
                                        onChange={(e) => {
                                            setFormData(prev => ({ ...prev, cityId: Number(e.target.value) }));
                                            setFieldErrors(prev => ({ ...prev, city: '' }));
                                        }}
                                        dir="rtl"
                                        disabled={loadingCities || !formData.countryId}
                                    >
                                        {loadingCities ? (
                                            <option value="0">جاري التحميل...</option>
                                        ) : cities.length === 0 ? (
                                            <option value="0">اختر الدولة أولاً</option>
                                        ) : (
                                            <>
                                                <option value="0">اختر الولاية / المدينة</option>
                                                {cities.map((city) => (
                                                    <option key={city.id} value={city.id}>
                                                        {getLocalizedName(city.name, 'ar')}
                                                    </option>
                                                ))}
                                            </>
                                        )}
                                    </select>
                                    <Building size={20} className={`absolute right-4 top-1/2 -translate-y-1/2 ${fieldErrors.city ? 'text-red-400' : 'text-slate-400'}`} />
                                </div>
                                {fieldErrors.city && <p className="text-red-500 text-sm mt-1">⚠ {fieldErrors.city}</p>}
                            </div>
                            {/* Parent Account (REQUIRED) */}
                            <div className="bg-blue-50/50 border-2 border-blue-300 rounded-xl p-5 mb-4">
                                <div className="flex items-start gap-2 mb-4">
                                    <Users size={20} className="text-blue-700 mt-0.5" />
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-base">بيانات ولي الأمر (مطلوبة)</h3>
                                        <p className="text-xs text-slate-600 mt-1">سيتم إنشاء حساب تلقائي لولي الأمر وإرسال بيانات الدخول عبر البريد الإلكتروني</p>
                                    </div>
                                </div>

                                {/* Parent Name */}
                                <div className="form-control w-full mb-3">
                                    <label className="label pb-1">
                                        <span className="label-text font-semibold text-slate-700">اسم ولي الأمر</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="أدخل اسم ولي الأمر"
                                            className={`input-pro pr-10 ${fieldErrors.parentName ? 'input-pro-error' : ''}`}
                                            value={formData.parentName}
                                            onChange={(e) => handleChange('parentName', e.target.value)}
                                            dir="rtl"
                                        />
                                        <User size={18} className={`absolute right-3 top-1/2 -translate-y-1/2 ${fieldErrors.parentName ? 'text-red-400' : 'text-slate-400'}`} />
                                    </div>
                                    {fieldErrors.parentName && <p className="text-red-500 text-sm mt-1">⚠ {fieldErrors.parentName}</p>}
                                </div>

                                {/* Parent Email */}
                                <div className="form-control w-full mb-3">
                                    <label className="label pb-1">
                                        <span className="label-text font-semibold text-slate-700">البريد الإلكتروني لولي الأمر</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            placeholder="parent@example.com"
                                            className={`input-pro pr-10 ${fieldErrors.parentEmail ? 'input-pro-error' : ''}`}
                                            value={formData.parentEmail}
                                            onChange={(e) => handleChange('parentEmail', e.target.value)}
                                            dir="ltr"
                                        />
                                        <Mail size={18} className={`absolute right-3 top-1/2 -translate-y-1/2 ${fieldErrors.parentEmail ? 'text-red-400' : 'text-slate-400'}`} />
                                    </div>
                                    {fieldErrors.parentEmail && <p className="text-red-500 text-sm mt-1">⚠ {fieldErrors.parentEmail}</p>}
                                </div>

                                {/* Parent Phone */}
                                <div className="form-control w-full">
                                    <label className="label pb-1">
                                        <span className="label-text font-semibold text-slate-700">هاتف ولي الأمر</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="tel"
                                            placeholder="9xxxxxxxx"
                                            className={`input-pro pr-10 pl-24 ${fieldErrors.parentPhone ? 'input-pro-error' : ''}`}
                                            value={formData.parentPhone}
                                            onChange={(e) => handleChange('parentPhone', e.target.value)}
                                            dir="ltr"
                                        />
                                        <Phone size={18} className={`absolute right-3 top-1/2 -translate-y-1/2 ${fieldErrors.parentPhone ? 'text-red-400' : 'text-slate-400'}`} />
                                        <div className="absolute left-0 top-0 bottom-0 flex items-center gap-1.5 px-3 bg-slate-50 border-r border-slate-200 rounded-l-lg text-slate-700 font-bold text-sm">
                                            <Flag size={14} />
                                            <span>+968</span>
                                        </div>
                                    </div>
                                    {fieldErrors.parentPhone && <p className="text-red-500 text-sm mt-1">⚠ {fieldErrors.parentPhone}</p>}
                                </div>
                            </div>

                            {/* How Did You Know Us - Custom Dropdown (Optional) */}
                            <div className="form-control w-full relative">
                                <label className="label pb-1">
                                    <span className="label-text font-bold text-slate-700">كيف عرفت عنا؟ (اختياري)</span>
                                </label>

                                <div className="relative">
                                    <button
                                        type="button"
                                        className={`input-pro w-full flex items-center justify-between text-right px-4 h-12 ${isHowDidYouKnowUsOpen ? 'border-shibl-crimson ring-2 ring-shibl-crimson/20' : ''}`}
                                        onClick={() => setIsHowDidYouKnowUsOpen(!isHowDidYouKnowUsOpen)}
                                    >
                                        <span className={`flex items-center gap-2 ${!formData.howDidYouKnowUs ? 'text-slate-400' : 'text-charcoal'}`}>
                                            {formData.howDidYouKnowUs ? (() => {
                                                const opt = HOW_DID_YOU_KNOW_US_OPTIONS.find(o => o.value === formData.howDidYouKnowUs);
                                                return opt ? (
                                                    <>
                                                        <opt.Icon size={18} className={opt.color} />
                                                        <span>{opt.label}</span>
                                                    </>
                                                ) : 'اختر...'
                                            })() : 'اختر...'}
                                        </span>
                                        <ChevronDown size={20} className={`text-slate-400 transition-transform ${isHowDidYouKnowUsOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isHowDidYouKnowUsOpen && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 z-50 max-h-60 overflow-y-auto">
                                            {HOW_DID_YOU_KNOW_US_OPTIONS.map((option) => (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-right border-b border-slate-50 last:border-none"
                                                    onClick={() => {
                                                        handleChange('howDidYouKnowUs', option.value);
                                                        setIsHowDidYouKnowUsOpen(false);
                                                    }}
                                                >
                                                    <option.Icon size={20} className={option.color} />
                                                    <span className="font-medium text-slate-700">{option.label}</span>
                                                    {formData.howDidYouKnowUs === option.value && (
                                                        <CheckCircle size={16} className="mr-auto text-shibl-crimson" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Show text input when 'other' is selected */}
                                {formData.howDidYouKnowUs === 'other' && (
                                    <div className="relative mt-3 animate-fadeIn">
                                        <input
                                            type="text"
                                            placeholder="يرجى تحديد كيف عرفت عنا..."
                                            className="input-pro pr-12"
                                            value={formData.howDidYouKnowUsOther}
                                            onChange={(e) => handleChange('howDidYouKnowUsOther', e.target.value)}
                                            dir="rtl"
                                        />
                                        <FileText size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    </div>
                                )}
                            </div>


                            {/* Password */}
                            <div className="form-control w-full">
                                <label className="label pb-1">
                                    <span className="label-text font-bold text-slate-700">كلمة المرور</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        className="input-pro pr-12 pl-12"
                                        value={formData.password}
                                        onChange={(e) => handleChange('password', e.target.value)}
                                        dir="rtl"
                                    />
                                    <Lock size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <button
                                        type="button"
                                        className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-blue-500"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="form-control w-full">
                                <label className="label pb-1">
                                    <span className="label-text font-bold text-slate-700">تأكيد كلمة المرور</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        className="input-pro pr-12 pl-12"
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                        dir="rtl"
                                    />
                                    <Lock size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <button
                                        type="button"
                                        className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-shibl-crimson"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {/* Terms */}
                            <div className="form-control">
                                <label className="label cursor-pointer justify-start gap-3">
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-primary checkbox-sm"
                                        checked={agreeTerms}
                                        onChange={(e) => setAgreeTerms(e.target.checked)}
                                    />
                                    <span className="label-text text-slate-grey text-sm">
                                        أوافق على <a href="#" className="text-shibl-crimson font-bold hover:underline">الشروط والأحكام</a>
                                    </span>
                                </label>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                className={`w-full mt-2 h-14 rounded-2xl text-lg font-bold gap-3 flex items-center justify-center transition-all duration-300 ${(isLoading || !agreeTerms)
                                    ? 'bg-slate-100 text-slate-400 border-2 border-slate-100 cursor-not-allowed'
                                    : 'btn-primary-pro text-white'
                                    }`}
                                disabled={isLoading || !agreeTerms}
                            >
                                {isLoading ? (
                                    <span className="loading loading-spinner"></span>
                                ) : (
                                    <>
                                        <span>إنشاء حساب</span>
                                        <ArrowLeft size={20} style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-slate-grey">
                            لديك حساب بالفعل؟{' '}
                            <Link to={ROUTES.LOGIN} className="text-shibl-crimson font-bold hover:underline">تسجيل الدخول</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div >
    );
}
