import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../hooks';
import { AuthNavbar } from '../../components';
import { ROUTES } from '../../../shared/constants';
import { authService } from '../../../data/api';
import apiClient from '../../../data/api/ApiClient';
import { endpoints } from '../../../data/api/endpoints';
import { motion, AnimatePresence } from 'framer-motion';

// Lucide Icons
import {
    User,
    Mail,
    Phone,
    Lock,
    Eye,
    EyeOff,
    ArrowLeft,
    CheckCircle,
    Star,
    Flag,
    Building,
    ChevronDown,
    MapPin,
    Sparkles,
    Ghost,
    Instagram,
    Twitter,
    Facebook,
    MessageCircle,
    PhoneCall,
    Users,
    FileText
} from 'lucide-react';

// Design Constants
const VISUAL_BG_GRADIENT = "bg-gradient-to-br from-shibl-crimson/5 via-rose-50 to-orange-50";
const INPUT_BASE_CLASSES = "w-full h-12 rounded-xl border-2 border-slate-100 bg-slate-50/50 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 transition-all duration-300 outline-none";
const INPUT_ERROR_CLASSES = "border-red-200 bg-red-50/50 text-red-900 placeholder:text-red-300 focus:border-red-500 focus:ring-red-500/10";

// How did you know us options
const HOW_DID_YOU_KNOW_US_OPTIONS = [
    { value: 'instagram', label: 'انستجرام', Icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50' },
    { value: 'twitter', label: 'تويتر', Icon: Twitter, color: 'text-sky-500', bg: 'bg-sky-50' },
    { value: 'snapchat', label: 'سناب شات', Icon: Ghost, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { value: 'facebook', label: 'فيسبوك', Icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50' },
    { value: 'whatsapp', label: 'واتس', Icon: MessageCircle, color: 'text-green-500', bg: 'bg-green-50' },
    { value: 'phone_call', label: 'مكالمة هاتفية', Icon: PhoneCall, color: 'text-purple-500', bg: 'bg-purple-50' },
    { value: 'friend', label: 'صديق', Icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { value: 'other', label: 'أخرى', Icon: FileText, color: 'text-slate-500', bg: 'bg-slate-50' },
];

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

const getLocalizedName = (name: string | LocalizedName | undefined, lang: string = 'ar'): string => {
    if (!name) return '';
    if (typeof name === 'string') return name;
    return name[lang] || name.en || name.ar || Object.values(name).find(v => v) || '';
};

export function SignupPage() {
    const { isRTL } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();

    // UI States
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [isThinking, setIsThinking] = useState(false); // For "Magic" loading feel

    // Data States
    const [countries, setCountries] = useState<Country[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [loadingCountries, setLoadingCountries] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);
    const [isHowDidYouKnowUsOpen, setIsHowDidYouKnowUsOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        countryCode: '+968',
        countryId: 0,
        cityId: 0,
        password: '',
        confirmPassword: '',
        parentName: '',
        parentEmail: '',
        parentPhone: '',
        howDidYouKnowUs: '',
        howDidYouKnowUsOther: '',
    });

    // Fallback Data
    const FALLBACK_COUNTRIES: Country[] = [
        { id: 1, name: 'عمان' }, { id: 2, name: 'السعودية' }, { id: 3, name: 'الإمارات' },
        { id: 4, name: 'الكويت' }, { id: 5, name: 'البحرين' }, { id: 6, name: 'قطر' },
    ];
    const FALLBACK_CITIES: City[] = [
        { id: 1, name: 'مسقط', country_id: 1 }, { id: 2, name: 'صلالة', country_id: 1 },
        { id: 3, name: 'صحار', country_id: 1 }, { id: 4, name: 'نزوى', country_id: 1 },
    ];

    // Data Fetching
    useEffect(() => {
        const fetchCountries = async () => {
            setLoadingCountries(true);
            try {
                const response = await apiClient.get(endpoints.locations.countries);
                const data = response.data.data || response.data;
                if (data?.length) {
                    setCountries(data);
                    const oman = data.find((c: Country) => getLocalizedName(c.name, 'en').toLowerCase().includes('oman'));
                    setFormData(prev => ({ ...prev, countryId: oman ? oman.id : data[0].id }));
                } else {
                    throw new Error('No data');
                }
            } catch {
                setCountries(FALLBACK_COUNTRIES);
                setFormData(prev => ({ ...prev, countryId: 1 }));
            } finally {
                setLoadingCountries(false);
            }
        };
        fetchCountries();
    }, []);

    useEffect(() => {
        const fetchCities = async () => {
            if (!formData.countryId) { setCities([]); return; }
            setLoadingCities(true);
            try {
                const response = await apiClient.get(endpoints.locations.cities(formData.countryId));
                const data = response.data.data || response.data;
                if (data?.length) {
                    setCities(data);
                    setFormData(prev => ({ ...prev, cityId: data[0].id }));
                } else {
                    throw new Error('No cities');
                }
            } catch {
                if (formData.countryId === 1) {
                    setCities(FALLBACK_CITIES);
                    setFormData(prev => ({ ...prev, cityId: 1 }));
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
        if (!agreeTerms || isLoading) return;

        // Validation
        const errors: Record<string, string> = {};
        if (!formData.name.trim()) errors.name = 'الاسم مطلوب';
        if (!formData.email) errors.email = 'البريد الإلكتروني مطلوب';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'البريد الإلكتروني غير صحيح';
        if (!formData.phone) errors.phone = 'رقم الهاتف مطلوب';
        if (!formData.countryId) errors.country = 'الدولة مطلوبة';
        if (!formData.cityId) errors.city = 'المدينة مطلوبة';

        // Parent Validation
        if (!formData.parentName) errors.parentName = 'اسم ولي الأمر مطلوب';
        if (!formData.parentEmail) errors.parentEmail = 'بريد ولي الأمر مطلوب';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parentEmail)) errors.parentEmail = 'بريد ولي الأمر غير صحيح';
        if (!formData.parentPhone) errors.parentPhone = 'هاتف ولي الأمر مطلوب';

        // Password Validation
        if (!formData.password) errors.password = 'كلمة المرور مطلوبة';
        else if (formData.password.length < 8) errors.password = 'يجب أن تكون 8 أحرف على الأقل';
        if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'كلمتا المرور غير متطابقتين';

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            const firstError = document.getElementById(Object.keys(errors)[0]);
            firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setIsLoading(true);
        setIsThinking(true);
        setError('');

        try {
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
                how_do_you_know_us: formData.howDidYouKnowUs === 'other' ? formData.howDidYouKnowUsOther : formData.howDidYouKnowUs || undefined,
            });

            // Simulate "thinking" time for premium feel if response is too fast
            setTimeout(() => {
                navigate(ROUTES.VERIFY_EMAIL, {
                    state: { email: formData.email, userType: 'student' }
                });
            }, 800);

        } catch (err: any) {
            setIsThinking(false);
            const apiErrors = err.response?.data?.errors;
            if (apiErrors) {
                if (apiErrors.email) setFieldErrors(prev => ({ ...prev, email: 'البريد مسجل بالفعل' }));
                if (apiErrors.parent_email) setFieldErrors(prev => ({ ...prev, parentEmail: 'بريد ولي الأمر مسجل' }));
                setError('يرجى مراجعة الأخطاء في النموذج');
            } else if (err.response?.data?.message?.includes('Duplicate')) {
                setError('البيانات مسجلة بالفعل');
            } else {
                setError(err.response?.data?.message || 'حدث خطأ غير متوقع');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (fieldErrors[field]) setFieldErrors(prev => ({ ...prev, [field]: '' }));
    };

    return (
        <div className="min-h-screen bg-soft-cloud" dir={isRTL ? 'rtl' : 'ltr'}>
            <AuthNavbar />

            <div className="pt-[72px] min-h-screen grid lg:grid-cols-2">

                {/* Visual Section - Sticky on Desktop */}
                <motion.div
                    initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className={`hidden lg:flex flex-col items-center justify-center ${VISUAL_BG_GRADIENT} p-12 relative overflow-hidden lg:order-1 sticky top-0 h-screen`}
                >
                    <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-10 left-10 w-64 h-64 bg-shibl-crimson/10 rounded-full blur-3xl animate-pulse" />
                        <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl animate-pulse delay-1000" />
                    </div>

                    <div className="relative w-full max-w-lg z-10 flex flex-col items-center gap-10">
                        <div className="relative">
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            >
                                <img src="/images/signup-student.png" alt="Student" className="w-full max-w-[420px] h-auto rounded-[2.5rem] shadow-2xl shadow-shibl-crimson/10 border-4 border-white/50" />
                            </motion.div>

                            {/* Floating Badge */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl border border-white/60 flex items-center gap-4 w-max"
                            >
                                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-500">
                                    <Sparkles size={24} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">رحلة تعليمية ممتعة</p>
                                    <p className="text-xs text-slate-500 font-medium">ابدأ مسارك نحو التفوق اليوم!</p>
                                </div>
                            </motion.div>
                        </div>

                        <div className="text-center space-y-2 max-w-md">
                            <h2 className="text-2xl font-bold text-slate-800">بيئة داعمة ومحفزة</h2>
                            <p className="text-slate-600 leading-relaxed">انضم لأكثر من 10,000 طالب وطالبة يحققون أعلى الدرجات مع نخبة من أفضل المعلمين.</p>
                        </div>
                    </div>
                </motion.div>

                {/* Form Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex flex-col items-center justify-center p-6 sm:p-10 lg:p-16 lg:order-2 bg-white"
                >
                    <div className="w-full max-w-2xl">

                        {/* Header */}
                        <div className="text-center mb-10">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <img src="/images/student-placeholder.png" alt="Student" className="w-24 h-24 object-contain rounded-full bg-slate-50 shadow-[0_0_30px_rgba(225,29,72,0.3)] ring-4 ring-rose-50" />
                            </div>
                            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">حساب طالب جديد</h1>
                            <p className="text-slate-500 font-medium">قم بتعبئة البيانات أدناه لإنشاء حسابك التعليمي</p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className="mb-6 p-4 bg-red-50 border-r-4 border-red-500 rounded-lg flex items-start gap-3"
                            >
                                <div className="p-1.5 bg-red-100 rounded-full text-red-600 mt-0.5"><Users size={16} /></div>
                                <p className="text-sm font-medium text-red-700 leading-relaxed">{error}</p>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                            {/* Personal Info Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">البيانات الشخصية</h3>
                                    <div className="h-px bg-slate-100 flex-1"></div>
                                </div>

                                <InputGroup
                                    id="name"
                                    label="الاسم الكامل"
                                    icon={User}
                                    value={formData.name}
                                    onChange={(v) => handleChange('name', v)}
                                    error={fieldErrors.name}
                                    placeholder="الاسم الثلاثي"
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputGroup
                                        id="email"
                                        label="البريد الإلكتروني"
                                        icon={Mail}
                                        type="email"
                                        value={formData.email}
                                        onChange={(v) => handleChange('email', v)}
                                        error={fieldErrors.email}
                                        placeholder="name@example.com"
                                        dir="ltr"
                                    />

                                    <div className="space-y-1.5" id="phone">
                                        <Label text="رقم الهاتف" error={!!fieldErrors.phone} />
                                        <div className="relative">
                                            <input
                                                type="tel"
                                                className={`${INPUT_BASE_CLASSES} ${fieldErrors.phone ? INPUT_ERROR_CLASSES : ''} pr-12 pl-20`}
                                                placeholder="9xxxxxxxx"
                                                value={formData.phone}
                                                onChange={(e) => handleChange('phone', e.target.value)}
                                                dir="ltr"
                                            />
                                            <Phone size={20} className={`absolute right-4 top-1/2 -translate-y-1/2 ${fieldErrors.phone ? 'text-red-500' : 'text-slate-400'}`} />
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-md text-slate-600 font-bold text-xs">
                                                <span>+968</span>
                                                <Flag size={12} />
                                            </div>
                                        </div>
                                        {fieldErrors.phone && <ErrorMessage msg={fieldErrors.phone} />}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Country */}
                                    <div className="space-y-1.5" id="country">
                                        <Label text="الدولة" error={!!fieldErrors.country} />
                                        <div className="relative">
                                            <select
                                                className={`${INPUT_BASE_CLASSES} px-4 appearance-none ${fieldErrors.country ? INPUT_ERROR_CLASSES : ''}`}
                                                value={formData.countryId}
                                                onChange={(e) => {
                                                    const cid = Number(e.target.value);
                                                    setFormData(p => ({ ...p, countryId: cid, cityId: 0 }));
                                                    setFieldErrors(p => ({ ...p, country: '', city: '' }));
                                                }}
                                                disabled={loadingCountries}
                                            >
                                                <option value="0">اختر الدولة</option>
                                                {countries.map(c => (
                                                    <option key={c.id} value={c.id}>{getLocalizedName(c.name, 'ar')}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        </div>
                                        {fieldErrors.country && <ErrorMessage msg={fieldErrors.country} />}
                                    </div>

                                    {/* City */}
                                    <div className="space-y-1.5" id="city">
                                        <Label text="المدينة / الولاية" error={!!fieldErrors.city} />
                                        <div className="relative">
                                            <select
                                                className={`${INPUT_BASE_CLASSES} px-4 appearance-none ${fieldErrors.city ? INPUT_ERROR_CLASSES : ''}`}
                                                value={formData.cityId}
                                                onChange={(e) => {
                                                    setFormData(p => ({ ...p, cityId: Number(e.target.value) }));
                                                    setFieldErrors(p => ({ ...p, city: '' }));
                                                }}
                                                disabled={loadingCities || !formData.countryId}
                                            >
                                                <option value="0">{loadingCities ? 'جاري التحميل...' : 'اختر المدينة'}</option>
                                                {cities.map(c => (
                                                    <option key={c.id} value={c.id}>{getLocalizedName(c.name, 'ar')}</option>
                                                ))}
                                            </select>
                                            <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        </div>
                                        {fieldErrors.city && <ErrorMessage msg={fieldErrors.city} />}
                                    </div>
                                </div>
                            </div>

                            {/* Parent Info Section */}
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <Users size={16} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">بيانات ولي الأمر</h3>
                                        <p className="text-[11px] text-slate-500">سيتم إنشاء حساب لولي الأمر تلقائياً للمتابعة</p>
                                    </div>
                                </div>

                                <InputGroup
                                    id="parentName"
                                    label="اسم ولي الأمر"
                                    icon={User}
                                    value={formData.parentName}
                                    onChange={(v) => handleChange('parentName', v)}
                                    error={fieldErrors.parentName}
                                    bg="bg-white"
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputGroup
                                        id="parentEmail"
                                        label="بريد ولي الأمر"
                                        icon={Mail}
                                        type="email"
                                        value={formData.parentEmail}
                                        onChange={(v) => handleChange('parentEmail', v)}
                                        error={fieldErrors.parentEmail}
                                        placeholder="parent@example.com"
                                        dir="ltr"
                                        bg="bg-white"
                                    />

                                    <div className="space-y-1.5" id="parentPhone">
                                        <Label text="هاتف ولي الأمر" error={!!fieldErrors.parentPhone} />
                                        <div className="relative">
                                            <input
                                                type="tel"
                                                className={`${INPUT_BASE_CLASSES} bg-white ${fieldErrors.parentPhone ? INPUT_ERROR_CLASSES : ''} pr-12 pl-20`}
                                                placeholder="9xxxxxxxx"
                                                value={formData.parentPhone}
                                                onChange={(e) => handleChange('parentPhone', e.target.value)}
                                                dir="ltr"
                                            />
                                            <Phone size={20} className={`absolute right-4 top-1/2 -translate-y-1/2 ${fieldErrors.parentPhone ? 'text-red-500' : 'text-slate-400'}`} />
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-md text-slate-600 font-bold text-xs">
                                                <span>+968</span>
                                                <Flag size={12} />
                                            </div>
                                        </div>
                                        {fieldErrors.parentPhone && <ErrorMessage msg={fieldErrors.parentPhone} />}
                                    </div>
                                </div>
                            </div>

                            {/* Security Section */}
                            <div className="space-y-4 pt-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <PasswordInput
                                        id="password"
                                        label="كلمة المرور"
                                        value={formData.password}
                                        onChange={(v) => handleChange('password', v)}
                                        show={showPassword}
                                        onToggle={() => setShowPassword(!showPassword)}
                                        error={fieldErrors.password}
                                    />
                                    <PasswordInput
                                        id="confirmPassword"
                                        label="تأكيد كلمة المرور"
                                        value={formData.confirmPassword}
                                        onChange={(v) => handleChange('confirmPassword', v)}
                                        show={showConfirmPassword}
                                        onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                                        error={fieldErrors.confirmPassword}
                                    />
                                </div>
                            </div>

                            {/* How Did You Know Us */}
                            <div className="space-y-1.5 relative">
                                <Label text="كيف عرفت عنا؟ (اختياري)" />
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsHowDidYouKnowUsOpen(!isHowDidYouKnowUsOpen)}
                                        className={`${INPUT_BASE_CLASSES} px-4 flex items-center justify-between`}
                                    >
                                        <span className="flex items-center gap-2 text-sm">
                                            {formData.howDidYouKnowUs ?
                                                (() => {
                                                    const opt = HOW_DID_YOU_KNOW_US_OPTIONS.find(o => o.value === formData.howDidYouKnowUs);
                                                    return opt ? <><opt.Icon size={18} className={opt.color} /> <span>{opt.label}</span></> : 'اختر...';
                                                })()
                                                : <span className="text-slate-400">اختر الطريقة...</span>}
                                        </span>
                                        <ChevronDown size={18} className={`text-slate-400 transition-transform ${isHowDidYouKnowUsOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {isHowDidYouKnowUsOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute top-14 left-0 right-0 bg-white border border-slate-100 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto p-2"
                                            >
                                                {HOW_DID_YOU_KNOW_US_OPTIONS.map(opt => (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        onClick={() => {
                                                            handleChange('howDidYouKnowUs', opt.value);
                                                            setIsHowDidYouKnowUsOpen(false);
                                                        }}
                                                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-right transition-colors hover:bg-slate-50 ${formData.howDidYouKnowUs === opt.value ? 'bg-slate-50 font-bold' : ''}`}
                                                    >
                                                        <div className={`w-8 h-8 rounded-full ${opt.bg} flex items-center justify-center`}>
                                                            <opt.Icon size={16} className={opt.color} />
                                                        </div>
                                                        <span className="text-sm text-slate-700">{opt.label}</span>
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                {formData.howDidYouKnowUs === 'other' && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                        <input
                                            type="text"
                                            className={`${INPUT_BASE_CLASSES} mt-2 px-4`}
                                            placeholder="يرجى الكتابة هنا..."
                                            value={formData.howDidYouKnowUsOther}
                                            onChange={(e) => handleChange('howDidYouKnowUsOther', e.target.value)}
                                        />
                                    </motion.div>
                                )}
                            </div>

                            {/* Terms */}
                            <div className="flex items-start gap-3 p-1">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        checked={agreeTerms}
                                        onChange={(e) => setAgreeTerms(e.target.checked)}
                                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-slate-300 transition-all checked:border-shibl-crimson checked:bg-shibl-crimson"
                                    />
                                    <CheckCircle size={14} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                                </div>
                                <label htmlFor="terms" className="text-sm text-slate-500 cursor-pointer select-none">
                                    أوافق على <Link to="#" className="text-shibl-crimson font-bold hover:underline">الشروط والأحكام</Link> وسياسة الخصوصية
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading || !agreeTerms}
                                className={`w-full h-14 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all duration-300
                                    ${(isLoading || !agreeTerms)
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                                        : 'bg-shibl-crimson text-white hover:bg-rose-700 hover:shadow-shibl-crimson/30 active:scale-[0.98]'
                                    }`}
                            >
                                {isThinking ? (
                                    <div className="flex items-center gap-2">
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>جاري إنشاء الحساب...</span>
                                    </div>
                                ) : (
                                    <>
                                        <span>إنشاء الحساب</span>
                                        <ArrowLeft size={20} className={isRTL ? 'rotate-180' : ''} />
                                    </>
                                )}
                            </button>

                            <div className="text-center pt-4">
                                <p className="text-slate-500">
                                    لديك حساب بالفعل؟{' '}
                                    <Link to={ROUTES.LOGIN} className="text-shibl-crimson font-bold hover:underline">تسجيل الدخول</Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

// Sub-components for cleanliness
const Label = ({ text, error }: { text: string; error?: boolean }) => (
    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${error ? 'text-red-500' : 'text-slate-500'}`}>
        {text}
    </label>
);

const ErrorMessage = ({ msg }: { msg: string }) => (
    <p className="flex items-center gap-1 text-[11px] font-bold text-red-500 mt-1.5 animate-pulse">
        <span className="block w-1 h-1 bg-red-500 rounded-full" /> {msg}
    </p>
);

interface InputGroupProps {
    id: string;
    label: string;
    icon: any;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    type?: string;
    placeholder?: string;
    dir?: string;
    bg?: string;
}

const InputGroup = ({ id, label, icon: Icon, value, onChange, error, type = 'text', placeholder, dir = 'rtl', bg }: InputGroupProps) => (
    <div className="space-y-1.5" id={id}>
        <Label text={label} error={!!error} />
        <div className="relative">
            <input
                type={type}
                className={`${INPUT_BASE_CLASSES} ${bg || ''} ${error ? INPUT_ERROR_CLASSES : ''} pr-12`}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                dir={dir}
            />
            <Icon size={20} className={`absolute right-4 top-1/2 -translate-y-1/2 ${error ? 'text-red-500' : 'text-slate-400'}`} />
        </div>
        {error && <ErrorMessage msg={error} />}
    </div>
);

interface PasswordInputProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    show: boolean;
    onToggle: () => void;
    error?: string;
}

const PasswordInput = ({ id, label, value, onChange, show, onToggle, error }: PasswordInputProps) => (
    <div className="space-y-1.5" id={id}>
        <Label text={label} error={!!error} />
        <div className="relative">
            <input
                type={show ? 'text' : 'password'}
                className={`${INPUT_BASE_CLASSES} ${error ? INPUT_ERROR_CLASSES : ''} pr-12 pl-12 text-lg tracking-wider`}
                placeholder="••••••••"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                dir="ltr"
            />
            <Lock size={20} className={`absolute right-4 top-1/2 -translate-y-1/2 ${error ? 'text-red-500' : 'text-slate-400'}`} />
            <button
                type="button"
                onClick={onToggle}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-shibl-crimson hover:bg-rose-50 transition-colors"
                tabIndex={-1}
            >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
        {error && <ErrorMessage msg={error} />}
    </div>
);
