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
    Building,
    MessageCircle,
    Instagram,
    Twitter,
    Facebook,
    Ghost,
    PhoneCall,
    FileText,
    ChevronDown,
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

// Omani Governorates / Cities (matching backend seeder)
const OMAN_GOVERNORATES = [
    { id: 0, name: 'اختر الولاية' },
    { id: 1, name: 'مسقط' },
    { id: 2, name: 'صلالة' },
    { id: 3, name: 'صحار' },
    { id: 4, name: 'نزوى' },
    { id: 5, name: 'صور' },
    { id: 6, name: 'عبري' },
    { id: 7, name: 'بوشر' },
    { id: 8, name: 'السيب' },
    { id: 9, name: 'العامرات' },
];

type UserType = 'student' | 'parent';

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

    const [userType, setUserType] = useState<UserType>('student');
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
        countryCode: '+968', // Oman country code
        countryId: 0,
        cityId: 0,
        password: '',
        confirmPassword: '',
        parentPhone: '', // New field
        howDidYouKnowUs: '', // New field
        howDidYouKnowUsOther: '', // Text for 'other' option
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
            if (userType === 'student') {
                await authService.studentRegister({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    password_confirmation: formData.confirmPassword,
                    country_id: formData.countryId,
                    city_id: formData.cityId,
                    parent_phone: formData.parentPhone || undefined,
                    how_do_you_know_us: formData.howDidYouKnowUs === 'other'
                        ? formData.howDidYouKnowUsOther
                        : (formData.howDidYouKnowUs || undefined),
                });
            } else {
                await authService.parentRegister({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    password_confirmation: formData.confirmPassword,
                });
            }

            // Navigate to email verification page with additional data to preserve it across the session
            // (since backend StudentResource doesn't return these fields on login/verify)
            navigate(ROUTES.VERIFY_EMAIL, {
                state: {
                    email: formData.email,
                    userType,
                    // Pass additional fields to merge after verification
                    phone: formData.phone,
                    parentPhone: formData.parentPhone,
                    howDidYouKnowUs: formData.howDidYouKnowUs === 'other' ? formData.howDidYouKnowUsOther : formData.howDidYouKnowUs
                }
            });
        } catch (err: any) {
            // Handle validation errors
            if (err.message?.includes('already registered') || err.message?.includes('already been taken')) {
                setError('هذا البريد الإلكتروني مسجل بالفعل');
            } else {
                setError(err.message || 'حدث خطأ. يرجى المحاولة مرة أخرى');
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
                <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-red-50 via-rose-50 to-orange-50 p-12 relative overflow-hidden lg:order-1">
                    {/* Floating Card - Top Left (corner, in empty space) */}
                    {userType === 'parent' && (
                        <div className="absolute top-8 left-8 floating-card-success p-4 flex items-center gap-3 animate-float z-10">
                            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
                                <CheckCircle size={24} className="text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white/90 font-medium text-sm">إشعار جديد</span>
                                <span className="text-white font-bold text-[15px]">تم حضور أحمد حصة الفيزياء</span>
                            </div>
                        </div>
                    )}

                    <div className="relative w-full max-w-lg flex flex-col items-center gap-6">
                        {/* Main Image */}
                        <div className="relative w-full max-w-[400px]">
                            <img
                                src={userType === 'student' ? '/images/signup-student.png' : '/images/signup-parent.png'}
                                alt="Illustration"
                                className="w-full h-auto rounded-3xl drop-shadow-2xl"
                            />
                        </div>

                        {/* Testimonial Card for Student */}
                        {userType === 'student' && (
                            <div className="bg-white rounded-3xl p-6 shadow-xl max-w-xs">
                                <div className="flex gap-1 mb-3">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star key={i} size={18} className="text-amber-500" fill="#F59E0B" />
                                    ))}
                                </div>
                                <p className="text-[15px] leading-relaxed text-charcoal mb-4">
                                    "أفضل منصة ساعدت ابني على التفوق، الدروس مشروحة بطريقة مبسطة ورائعة!"
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-shibl-crimson/10 flex items-center justify-center text-xl">👩</div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-charcoal text-[15px]">سارة الأحمد</span>
                                        <span className="text-xs text-slate-grey">ولية أمر</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Floating Card - Bottom Right (corner, in empty space) */}
                    {userType === 'parent' && (
                        <div className="absolute bottom-8 right-8 floating-card p-4 flex items-center gap-3 animate-float animation-delay-3000 z-10">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <Activity size={28} className="text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white font-extrabold text-lg">مستوى متقدم</span>
                                <span className="text-white/90 text-sm">⭐ أداء ممتاز</span>
                            </div>
                        </div>
                    )}
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
                                {userType === 'student' ? 'إنشاء حساب جديد' : 'إنشاء حساب ولي أمر'}
                            </h1>
                            <p className="text-slate-grey">
                                {userType === 'student'
                                    ? 'انضم إلى مجتمعنا التعليمي اليوم.'
                                    : 'تابع مستوى أبنائك الدراسي لحظة بلحظة.'
                                }
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center">
                                {error}
                            </div>
                        )}
                        {/* Tabs */}
                        <div className="flex bg-slate-100/50 p-1.5 rounded-2xl gap-2 mb-8">
                            <button
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 ${userType === 'student'
                                    ? 'bg-white text-shibl-crimson shadow-md shadow-shibl-crimson/10'
                                    : 'text-slate-grey hover:text-charcoal hover:bg-slate-50'
                                    }`}
                                onClick={() => setUserType('student')}
                            >
                                <GraduationCap size={20} />
                                <span>طالب</span>
                            </button>
                            <button
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 ${userType === 'parent'
                                    ? 'bg-white text-shibl-crimson shadow-md shadow-shibl-crimson/10'
                                    : 'text-slate-grey hover:text-charcoal hover:bg-slate-50'
                                    }`}
                                onClick={() => setUserType('parent')}
                            >
                                <Users size={20} />
                                <span>ولي أمر</span>
                            </button>
                        </div>

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

                            {/* Phone */}
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

                            {/* Location - Fixed Country (Oman) with Governorate dropdown - Both Student and Parent */}
                            <>
                                {/* Fixed Country - Oman */}
                                <div className="form-control w-full">
                                    <label className="label pb-1">
                                        <span className="label-text font-bold text-slate-700">الدولة</span>
                                    </label>
                                    <div className="bg-slate-100 px-4 py-3 rounded-xl flex items-center gap-3">
                                        <span className="text-xl">🇴🇲</span>
                                        <span className="font-bold text-slate-700">سلطنة عمان</span>
                                        <span className="text-xs text-slate-400 mr-auto">(ثابت)</span>
                                    </div>
                                </div>

                                {/* Governorate / City */}
                                <div className="form-control w-full">
                                    <label className="label pb-1">
                                        <span className="label-text font-bold text-slate-700">الولاية</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            className="input-pro pr-12"
                                            value={formData.cityId}
                                            onChange={(e) => setFormData(prev => ({ ...prev, cityId: Number(e.target.value) }))}
                                            dir="rtl"
                                        >
                                            {OMAN_GOVERNORATES.map((gov) => (
                                                <option key={gov.id} value={gov.id}>
                                                    {gov.name}
                                                </option>
                                            ))}
                                        </select>
                                        <Building size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    </div>
                                </div>
                            </>

                            {/* Student-only fields */}
                            {userType === 'student' && (
                                <>
                                    {/* Parent Phone (Optional) */}
                                    <div className="form-control w-full">
                                        <label className="label pb-1">
                                            <span className="label-text font-bold text-slate-700">هاتف ولي الأمر (اختياري)</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="tel"
                                                placeholder="9xxxxxxxx"
                                                className="input-pro pr-12 pl-24"
                                                value={formData.parentPhone}
                                                onChange={(e) => handleChange('parentPhone', e.target.value)}
                                                dir="ltr"
                                            />
                                            <Phone size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <div className="absolute left-0 top-0 bottom-0 flex items-center gap-1.5 px-4 bg-slate-50 border-r border-slate-200 rounded-l-lg text-slate-700 font-bold text-sm">
                                                <Flag size={16} />
                                                <span>+968</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* How Did You Know Us - Custom Dropdown */}
                                    <div className="form-control w-full relative">
                                        <label className="label pb-1">
                                            <span className="label-text font-bold text-slate-700">كيف عرفت عنا؟</span>
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
                                </>
                            )}

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
                                        <span>{userType === 'student' ? 'إنشاء حساب' : 'تسجيل كولي أمر'}</span>
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
        </div>
    );
}
