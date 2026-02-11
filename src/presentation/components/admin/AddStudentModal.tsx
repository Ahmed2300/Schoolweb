import { useState, useEffect, useCallback, useRef } from 'react';
import {
    X,
    User,
    Mail,
    Phone,
    Lock,
    Eye,
    EyeOff,
    Loader2,
    MapPin,
    AlertCircle,
    CheckCircle2,
    Users,
    Search
} from 'lucide-react';
import { adminService, CreateStudentRequest, UserData } from '../../../data/api/adminService';
import { commonService } from '../../../data/api/commonService';

interface AddStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface CountryData {
    id: number;
    name: string;
}

interface CityData {
    id: number;
    name: string;
}

export function AddStudentModal({ isOpen, onClose, onSuccess }: AddStudentModalProps) {
    // Form data
    const [formData, setFormData] = useState<CreateStudentRequest>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        how_do_you_know_us: '',
        country_id: undefined,
        city_id: undefined,
        status: 'active',
        // Parent fields
        parent_email: '',
        parent_name: '',
        parent_password: '',
        parent_phone: '',
    });

    // UI States
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showParentPassword, setShowParentPassword] = useState(false);

    // Parent lookup states
    const [parentLookupLoading, setParentLookupLoading] = useState(false);
    const [foundParent, setFoundParent] = useState<UserData | null>(null);
    const [parentLookupDone, setParentLookupDone] = useState(false);
    const parentLookupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Data for dropdowns
    const [countries, setCountries] = useState<CountryData[]>([]);
    const [cities, setCities] = useState<CityData[]>([]);
    const [loadingCountries, setLoadingCountries] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);

    // How do you know us options
    const howDoYouKnowUsOptions = [
        'Instagram',
        'Twitter',
        'Snapchat',
        'Facebook',
        'WhatsApp',
        'Phone Call',
        'Friend',
        'Other',
    ];

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: '',
                email: '',
                password: '',
                password_confirmation: '',
                phone: '',
                how_do_you_know_us: '',
                country_id: undefined,
                city_id: undefined,
                status: 'active',
                parent_email: '',
                parent_name: '',
                parent_password: '',
                parent_phone: '',
            });
            setError(null);
            setFoundParent(null);
            setParentLookupDone(false);
            setShowPassword(false);
            setShowConfirmPassword(false);
            setShowParentPassword(false);
            fetchCountries();
        }
    }, [isOpen]);

    // Fetch countries
    const fetchCountries = async () => {
        setLoadingCountries(true);
        try {
            const list = await commonService.getCountries();
            setCountries(list);
            // Default to Oman if found
            const oman = list.find((c) => c.name.includes('عمان') || c.name.toLowerCase().includes('oman'));
            if (oman) {
                setFormData(prev => ({ ...prev, country_id: oman.id }));
            }
        } catch (err) {
            console.error('Error fetching countries:', err);
        } finally {
            setLoadingCountries(false);
        }
    };

    // Fetch cities when country changes
    useEffect(() => {
        if (formData.country_id) {
            fetchCities(formData.country_id);
        } else {
            setCities([]);
        }
    }, [formData.country_id]);

    const fetchCities = async (countryId: number) => {
        setLoadingCities(true);
        try {
            const list = await commonService.getCities(countryId);
            setCities(list);
        } catch (err) {
            console.error('Error fetching cities:', err);
        } finally {
            setLoadingCities(false);
        }
    };

    // ─── Parent Email Debounced Lookup ───
    const lookupParentByEmail = useCallback(async (email: string) => {
        if (!email || !email.includes('@')) {
            setFoundParent(null);
            setParentLookupDone(false);
            return;
        }

        setParentLookupLoading(true);
        setParentLookupDone(false);
        try {
            const result = await adminService.searchParentByEmail(email);
            setFoundParent(result);
        } catch {
            setFoundParent(null);
        } finally {
            setParentLookupLoading(false);
            setParentLookupDone(true);
        }
    }, []);

    // Debounce parent email input
    const handleParentEmailChange = (email: string) => {
        setFormData(prev => ({ ...prev, parent_email: email }));
        setFoundParent(null);
        setParentLookupDone(false);

        if (parentLookupTimerRef.current) {
            clearTimeout(parentLookupTimerRef.current);
        }

        parentLookupTimerRef.current = setTimeout(() => {
            lookupParentByEmail(email);
        }, 600);
    };

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (parentLookupTimerRef.current) {
                clearTimeout(parentLookupTimerRef.current);
            }
        };
    }, []);

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value === '' ? undefined : (
                ['country_id', 'city_id'].includes(name) ? Number(value) : value
            ),
        }));
    };

    // Handle submit
    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError(null);

        // ─── Student Validation ───
        if (!formData.name || !formData.email || !formData.password) {
            setError('اسم الطالب والبريد الإلكتروني وكلمة المرور مطلوبة');
            setLoading(false);
            return;
        }

        if (formData.password.length < 8) {
            setError('كلمة مرور الطالب يجب أن تكون 8 أحرف على الأقل');
            setLoading(false);
            return;
        }

        if (formData.password !== formData.password_confirmation) {
            setError('كلمة مرور الطالب غير متطابقة');
            setLoading(false);
            return;
        }

        // ─── Parent Validation ───
        if (!formData.parent_email) {
            setError('البريد الإلكتروني لولي الأمر مطلوب');
            setLoading(false);
            return;
        }

        // If parent is NEW (not found), name and password are required
        if (!foundParent) {
            if (!formData.parent_name) {
                setError('اسم ولي الأمر مطلوب لإنشاء حساب جديد');
                setLoading(false);
                return;
            }
            if (!formData.parent_password || formData.parent_password.length < 8) {
                setError('كلمة مرور ولي الأمر مطلوبة (8 أحرف على الأقل)');
                setLoading(false);
                return;
            }
        }

        try {
            // Build the request payload — omit parent_name/password if parent exists
            const payload: CreateStudentRequest = {
                ...formData,
                parent_email: formData.parent_email,
            };

            if (foundParent) {
                // Existing parent — no need to send name/password
                delete payload.parent_name;
                delete payload.parent_password;
            }

            await adminService.createStudent(payload);
            onSuccess();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            console.error('Error creating student:', err);
            setError(error.response?.data?.message || 'فشل في إضافة الطالب وولي الأمر');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const parentIsNew = parentLookupDone && !foundParent;
    const parentIsExisting = parentLookupDone && !!foundParent;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-[20px] shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-6 py-5 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                            <Users className="text-white" size={24} />
                        </div>
                        <div className="text-white">
                            <h2 className="text-lg font-extrabold">إضافة طالب وولي أمر</h2>
                            <p className="text-xs text-white/80">أدخل بيانات الطالب وولي الأمر معًا</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-[12px] text-sm flex items-center gap-2">
                            <AlertCircle size={18} className="shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* ════════════════════════════════════════════════════════
                        SECTION 1: Student Information
                       ════════════════════════════════════════════════════════ */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                <User size={18} className="text-blue-600" />
                            </div>
                            <h3 className="text-sm font-bold text-charcoal">بيانات الطالب</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Name */}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">الاسم *</label>
                                <div className="relative">
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="اسم الطالب الكامل"
                                        className="w-full h-11 pr-12 pl-4 rounded-[10px] border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm"
                                        dir="auto"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">البريد الإلكتروني *</label>
                                <div className="relative">
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="student@example.com"
                                        className="w-full h-11 pr-12 pl-4 rounded-[10px] border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm"
                                        dir="ltr"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">رقم الهاتف</label>
                                <div className="relative">
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Phone size={18} />
                                    </div>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone || ''}
                                        onChange={handleChange}
                                        placeholder="رقم هاتف الطالب"
                                        className="w-full h-11 pr-12 pl-4 rounded-[10px] border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm"
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">كلمة المرور *</label>
                                <div className="relative">
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full h-11 pr-12 pl-12 rounded-[10px] border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">تأكيد كلمة المرور *</label>
                                <div className="relative">
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="password_confirmation"
                                        value={formData.password_confirmation}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full h-11 pr-12 pl-12 rounded-[10px] border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Country */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">الدولة</label>
                                <div className="relative">
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <MapPin size={18} />
                                    </div>
                                    <select
                                        name="country_id"
                                        value={formData.country_id || ''}
                                        onChange={handleChange}
                                        className="w-full h-11 pr-12 pl-4 rounded-[10px] border border-slate-200 focus:border-blue-500 outline-none text-sm appearance-none bg-white"
                                        disabled={loadingCountries}
                                    >
                                        <option value="">اختر الدولة</option>
                                        {countries.map(country => (
                                            <option key={country.id} value={country.id}>{country.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* City */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">المدينة</label>
                                <div className="relative">
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <MapPin size={18} />
                                    </div>
                                    <select
                                        name="city_id"
                                        value={formData.city_id || ''}
                                        onChange={handleChange}
                                        className="w-full h-11 pr-12 pl-4 rounded-[10px] border border-slate-200 focus:border-blue-500 outline-none text-sm appearance-none bg-white"
                                        disabled={loadingCities || !formData.country_id}
                                    >
                                        <option value="">اختر المدينة</option>
                                        {cities.map(city => (
                                            <option key={city.id} value={city.id}>{city.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* How do you know us */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">كيف عرفت عنا؟</label>
                                <select
                                    name="how_do_you_know_us"
                                    value={formData.how_do_you_know_us || ''}
                                    onChange={handleChange}
                                    className="w-full h-11 px-4 rounded-[10px] border border-slate-200 focus:border-blue-500 outline-none text-sm appearance-none bg-white"
                                >
                                    <option value="">اختر...</option>
                                    {howDoYouKnowUsOptions.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-white px-3 text-xs font-semibold text-slate-400">ربط ولي الأمر</span>
                        </div>
                    </div>

                    {/* ════════════════════════════════════════════════════════
                        SECTION 2: Parent Information
                       ════════════════════════════════════════════════════════ */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                                <Users size={18} className="text-green-600" />
                            </div>
                            <h3 className="text-sm font-bold text-charcoal">بيانات ولي الأمر</h3>
                        </div>

                        <div className="space-y-4">
                            {/* Parent Email + Lookup */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                                    البريد الإلكتروني لولي الأمر *
                                </label>
                                <div className="relative">
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Search size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        value={formData.parent_email}
                                        onChange={(e) => handleParentEmailChange(e.target.value)}
                                        placeholder="أدخل بريد ولي الأمر للبحث أو الإنشاء..."
                                        className={`w-full h-11 pr-12 pl-12 rounded-[10px] border outline-none text-sm transition-colors ${parentIsExisting
                                            ? 'border-green-400 focus:border-green-500 focus:ring-4 focus:ring-green-500/10'
                                            : parentIsNew
                                                ? 'border-amber-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10'
                                                : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                                            }`}
                                        dir="ltr"
                                        required
                                    />
                                    {/* Status indicator */}
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                        {parentLookupLoading && (
                                            <Loader2 size={18} className="animate-spin text-blue-500" />
                                        )}
                                        {parentIsExisting && (
                                            <CheckCircle2 size={18} className="text-green-500" />
                                        )}
                                        {parentIsNew && (
                                            <User size={18} className="text-amber-500" />
                                        )}
                                    </div>
                                </div>

                                {/* Lookup Result Banner */}
                                {parentIsExisting && foundParent && (
                                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-[10px] flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                                            {foundParent.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-green-800 truncate">{foundParent.name}</p>
                                            <p className="text-xs text-green-600">تم العثور على حساب ولي أمر مسجل — سيتم ربط الطالب به</p>
                                        </div>
                                        <CheckCircle2 size={20} className="text-green-500 shrink-0 mr-auto" />
                                    </div>
                                )}

                                {parentIsNew && (
                                    <p className="mt-1.5 text-xs text-amber-600 flex items-center gap-1">
                                        <AlertCircle size={14} />
                                        لم يتم العثور على حساب — سيتم إنشاء حساب جديد لولي الأمر
                                    </p>
                                )}
                            </div>

                            {/* Conditional: New Parent Fields (only when not found) */}
                            {parentIsNew && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-amber-50/50 border border-amber-100 rounded-[12px] animate-in fade-in-0 duration-200">
                                    <p className="md:col-span-2 text-xs font-semibold text-amber-700 flex items-center gap-1.5 -mt-1 mb-1">
                                        <User size={14} />
                                        بيانات ولي الأمر الجديد
                                    </p>

                                    {/* Parent Name */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1.5">اسم ولي الأمر *</label>
                                        <div className="relative">
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                                <User size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                name="parent_name"
                                                value={formData.parent_name || ''}
                                                onChange={handleChange}
                                                placeholder="الاسم الكامل"
                                                className="w-full h-11 pr-12 pl-4 rounded-[10px] border border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none text-sm bg-white"
                                                dir="auto"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Parent Phone */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1.5">هاتف ولي الأمر</label>
                                        <div className="relative">
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                                <Phone size={18} />
                                            </div>
                                            <input
                                                type="tel"
                                                name="parent_phone"
                                                value={formData.parent_phone || ''}
                                                onChange={handleChange}
                                                placeholder="رقم الهاتف"
                                                className="w-full h-11 pr-12 pl-4 rounded-[10px] border border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none text-sm bg-white"
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>

                                    {/* Parent Password */}
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-600 mb-1.5">كلمة مرور ولي الأمر *</label>
                                        <div className="relative">
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                                <Lock size={18} />
                                            </div>
                                            <input
                                                type={showParentPassword ? 'text' : 'password'}
                                                name="parent_password"
                                                value={formData.parent_password || ''}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                className="w-full h-11 pr-12 pl-12 rounded-[10px] border border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none text-sm bg-white"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowParentPassword(!showParentPassword)}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showParentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Parent Phone — shown when parent exists (they may just want to update) */}
                            {parentIsExisting && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">هاتف ولي الأمر</label>
                                    <div className="relative">
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                            <Phone size={18} />
                                        </div>
                                        <input
                                            type="tel"
                                            name="parent_phone"
                                            value={formData.parent_phone || ''}
                                            onChange={handleChange}
                                            placeholder="رقم هاتف ولي الأمر (اختياري)"
                                            className="w-full h-11 pr-12 pl-4 rounded-[10px] border border-slate-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none text-sm"
                                            dir="ltr"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">حالة الطالب</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="status"
                                    value="active"
                                    checked={formData.status === 'active'}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm text-slate-700">نشط</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="status"
                                    value="inactive"
                                    checked={formData.status === 'inactive'}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm text-slate-700">غير نشط</span>
                            </label>
                        </div>
                    </div>
                </form>

                {/* Footer — Single unified button */}
                <div className="px-6 py-4 border-t border-slate-100 flex gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 h-11 rounded-pill bg-slate-100 hover:bg-slate-200 text-charcoal font-semibold text-sm transition-all"
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || parentLookupLoading}
                        className="flex-[2] h-11 rounded-pill bg-gradient-to-l from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                جاري الإضافة...
                            </>
                        ) : (
                            <>
                                <Users size={18} />
                                إضافة الطالب وولي الأمر
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
