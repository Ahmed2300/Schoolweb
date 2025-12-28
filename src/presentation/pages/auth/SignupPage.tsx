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
    BarChart3,
    Star,
    Flag,
    BadgeCheck,
    Building
} from 'lucide-react';

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
        countryCode: '+20',
        countryId: 0,
        cityId: 0,
        password: '',
        confirmPassword: '',
    });

    // Fetch countries on mount
    useEffect(() => {
        const fetchCountries = async () => {
            setLoadingCountries(true);
            try {
                const response = await apiClient.get(endpoints.locations.countries);
                const countryData = response.data.data || response.data;
                setCountries(countryData);
                // Set default country if available
                if (countryData.length > 0) {
                    setFormData(prev => ({ ...prev, countryId: countryData[0].id }));
                }
            } catch (err) {
                console.error('Failed to fetch countries:', err);
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
                setCities(cityData);
                // Set default city if available
                if (cityData.length > 0) {
                    setFormData(prev => ({ ...prev, cityId: cityData[0].id }));
                } else {
                    setFormData(prev => ({ ...prev, cityId: 0 }));
                }
            } catch (err) {
                console.error('Failed to fetch cities:', err);
                setCities([]);
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
                });
            } else {
                await authService.parentRegister({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    password_confirmation: formData.confirmPassword,
                });
            }

            // Navigate to email verification page
            navigate(ROUTES.VERIFY_EMAIL, {
                state: { email: formData.email, userType }
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
                                <BarChart3 size={28} className="text-white" />
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

                            {/* Country (Student only) */}
                            {userType === 'student' && (
                                <>
                                    <div className="form-control w-full">
                                        <label className="label pb-1">
                                            <span className="label-text font-bold text-slate-700">الدولة</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                className="input-pro pr-12"
                                                value={formData.countryId}
                                                onChange={(e) => setFormData(prev => ({ ...prev, countryId: Number(e.target.value), cityId: 0 }))}
                                                dir="rtl"
                                                disabled={loadingCountries}
                                            >
                                                {loadingCountries ? (
                                                    <option value="0">جاري التحميل...</option>
                                                ) : countries.length === 0 ? (
                                                    <option value="0">لا توجد دول متاحة</option>
                                                ) : (
                                                    countries.map((country) => (
                                                        <option key={country.id} value={country.id}>
                                                            {getLocalizedName(country.name, isRTL ? 'ar' : 'en')}
                                                        </option>
                                                    ))
                                                )}
                                            </select>
                                            <Flag size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        </div>
                                    </div>

                                    {/* City */}
                                    <div className="form-control w-full">
                                        <label className="label pb-1">
                                            <span className="label-text font-bold text-slate-700">المدينة</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                className="input-pro pr-12"
                                                value={formData.cityId}
                                                onChange={(e) => setFormData(prev => ({ ...prev, cityId: Number(e.target.value) }))}
                                                dir="rtl"
                                                disabled={loadingCities || !formData.countryId}
                                            >
                                                {loadingCities ? (
                                                    <option value="0">جاري التحميل...</option>
                                                ) : cities.length === 0 ? (
                                                    <option value="0">اختر الدولة أولاً</option>
                                                ) : (
                                                    cities.map((city) => (
                                                        <option key={city.id} value={city.id}>
                                                            {getLocalizedName(city.name, isRTL ? 'ar' : 'en')}
                                                        </option>
                                                    ))
                                                )}
                                            </select>
                                            <Building size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        </div>
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
