import { useState, useEffect } from 'react';
import {
    X,
    User,
    Mail,
    Phone,
    Lock,
    Eye,
    EyeOff,
    Loader2,
    GraduationCap,
    MapPin,
    AlertCircle
} from 'lucide-react';
import { adminService, CreateStudentRequest } from '../../../data/api/adminService';

interface AddStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface GradeData {
    id: number;
    name: string;
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
        parent_phone: '',
        how_do_you_know_us: '',
        grade_id: undefined,
        country_id: undefined,
        city_id: undefined,
        status: 'active',
    });

    // UI States
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Data for dropdowns
    const [grades, setGrades] = useState<GradeData[]>([]);
    const [countries, setCountries] = useState<CountryData[]>([]);
    const [cities, setCities] = useState<CityData[]>([]);
    const [loadingGrades, setLoadingGrades] = useState(false);
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
                parent_phone: '',
                how_do_you_know_us: '',
                grade_id: undefined,
                country_id: undefined,
                city_id: undefined,
                status: 'active',
            });
            setError(null);
            fetchGrades();
            fetchCountries();
        }
    }, [isOpen]);

    // Fetch grades
    const fetchGrades = async () => {
        setLoadingGrades(true);
        try {
            const response = await adminService.getGrades();
            setGrades(response.data || []);
        } catch (err) {
            console.error('Error fetching grades:', err);
        } finally {
            setLoadingGrades(false);
        }
    };

    // Fetch countries
    const fetchCountries = async () => {
        setLoadingCountries(true);
        try {
            const response = await adminService.getCountries();
            setCountries(response.data || []);
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
            const response = await adminService.getCities({ country_id: countryId });
            setCities(response.data || []);
        } catch (err) {
            console.error('Error fetching cities:', err);
        } finally {
            setLoadingCities(false);
        }
    };

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value === '' ? undefined : (
                ['grade_id', 'country_id', 'city_id'].includes(name) ? Number(value) : value
            ),
        }));
    };

    // Handle submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validation
        if (!formData.name || !formData.email || !formData.password) {
            setError('الاسم والبريد الإلكتروني وكلمة المرور مطلوبة');
            setLoading(false);
            return;
        }

        if (formData.password.length < 8) {
            setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
            setLoading(false);
            return;
        }

        if (formData.password !== formData.password_confirmation) {
            setError('كلمة المرور غير متطابقة');
            setLoading(false);
            return;
        }

        try {
            await adminService.createStudent(formData);
            onSuccess();
        } catch (err: any) {
            console.error('Error creating student:', err);
            setError(err.response?.data?.message || 'فشل في إضافة الطالب');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-[20px] shadow-xl w-full max-w-xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-6 py-5 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                            <GraduationCap className="text-white" size={24} />
                        </div>
                        <div className="text-white">
                            <h2 className="text-lg font-extrabold">إضافة طالب جديد</h2>
                            <p className="text-xs text-white/80">أدخل بيانات الطالب</p>
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
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-[12px] text-sm flex items-center gap-2">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

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

                        {/* Grade */}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">المرحلة الدراسية</label>
                            <div className="relative">
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <GraduationCap size={18} />
                                </div>
                                <select
                                    name="grade_id"
                                    value={formData.grade_id || ''}
                                    onChange={handleChange}
                                    className="w-full h-11 pr-12 pl-4 rounded-[10px] border border-slate-200 focus:border-blue-500 outline-none text-sm appearance-none bg-white"
                                    disabled={loadingGrades}
                                >
                                    <option value="">اختر المرحلة</option>
                                    {grades.map(grade => (
                                        <option key={grade.id} value={grade.id}>{grade.name}</option>
                                    ))}
                                </select>
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
                                    placeholder="رقم هاتف ولي الأمر"
                                    className="w-full h-11 pr-12 pl-4 rounded-[10px] border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm"
                                    dir="ltr"
                                />
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
                        <div className="md:col-span-2">
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

                        {/* Status */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">الحالة</label>
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
                    </div>
                </form>

                {/* Footer */}
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
                        disabled={loading}
                        className="flex-1 h-11 rounded-pill bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                جاري الإضافة...
                            </>
                        ) : (
                            <>
                                <GraduationCap size={18} />
                                إضافة الطالب
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
