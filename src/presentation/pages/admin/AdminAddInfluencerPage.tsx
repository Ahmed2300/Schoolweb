import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks';
import adminService, { CreateInfluencerRequest } from '../../../data/api/adminService';
import {
    ArrowRight,
    ArrowLeft,
    Save,
    Lock,
    Phone,
    Mail,
    User,
    DollarSign,
    Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

export function AdminAddInfluencerPage() {
    const { isRTL } = useLanguage();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState<CreateInfluencerRequest>({
        name: '',
        email: '',
        mobile: '',
        password: '',
        fixed_commission_amount: 0,
        status: 'active'
    });

    const [passwordConfirm, setPasswordConfirm] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password && formData.password.length < 8) {
            toast.error('كلمة المرور يجب أن تتكون من 8 خانات على الأقل');
            return;
        }

        if (formData.password !== passwordConfirm) {
            toast.error('كلمات المرور غير متطابقة');
            return;
        }

        setIsLoading(true);
        try {
            await adminService.createInfluencer(formData);
            toast.success('تمت إضافة الشريك بنجاح');
            navigate('/admin/influencers');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'تعذر إضافة الشريك. يرجى التحقق من البيانات.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/admin/influencers')}
                    className="p-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                    {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        إضافة مسوق جديد
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        قم بملء البيانات التالية لإضافة مسوق جديد إلى النظام.
                    </p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-white/5">

                    {/* section: الشخصية */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <User className="text-shibl-crimson" size={20} />
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">البيانات الشخصية</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    الاسم الكامل
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="أدخل اسم المسوق الثلاثي"
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:bg-white dark:focus:bg-[#1E1E1E] outline-none transition-all dark:text-white text-right"
                                    />
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    البريد الإلكتروني
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="example@domain.com"
                                        className="w-full px-4 text-left py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:bg-white dark:focus:bg-[#1E1E1E] outline-none transition-all dark:text-white pl-10"
                                    />
                                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    رقم الهاتف
                                </label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        name="mobile"
                                        required
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        placeholder="+966 50 000 0000"
                                        className="w-full px-4 text-left py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:bg-white dark:focus:bg-[#1E1E1E] outline-none transition-all dark:text-white pl-10"
                                        dir="ltr"
                                    />
                                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-100 dark:border-white/5 my-8" />

                    {/* section: الأمان */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Lock className="text-shibl-crimson" size={20} />
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">الأمان</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    كلمة المرور
                                </label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:bg-white dark:focus:bg-[#1E1E1E] outline-none transition-all dark:text-white text-left tracking-widest pl-10"
                                    />
                                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                </div>
                                <p className="text-xs text-slate-500 mt-2">يجب أن تتكون من 8 خانات على الأقل.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    تأكيد كلمة المرور
                                </label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        required
                                        value={passwordConfirm}
                                        onChange={(e) => setPasswordConfirm(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:bg-white dark:focus:bg-[#1E1E1E] outline-none transition-all dark:text-white text-left tracking-widest pl-10"
                                    />
                                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-100 dark:border-white/5 my-8" />

                    {/* section: الإعدادات */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <DollarSign className="text-shibl-crimson" size={20} />
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white">إعدادات العمولة والأكواد</h2>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    قيمة العمولة الثابتة للمسوق (ر.ع)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        name="fixed_commission_amount"
                                        required
                                        value={formData.fixed_commission_amount || ''}
                                        onChange={handleNumberChange}
                                        placeholder="0.00"
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:bg-white dark:focus:bg-[#1E1E1E] outline-none transition-all dark:text-white text-left pl-12"
                                        dir="ltr"
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium select-none">OMR</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">سيتم تطبيق هذه النسبة على جميع عمليات البيع.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    نسبة الخصم للطالب (%)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="1"
                                        min="0"
                                        max="100"
                                        name="discount_percentage"
                                        value={formData.discount_percentage || ''}
                                        onChange={handleNumberChange}
                                        placeholder="0"
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:bg-white dark:focus:bg-[#1E1E1E] outline-none transition-all dark:text-white text-left pl-12"
                                        dir="ltr"
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium select-none">%</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">اختياري: نسبة الخصم التي يحصل عليها الطالب عند استخدام الكود.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    عدد أكواد الخصم المطلوبة
                                </label>
                                <input
                                    type="number"
                                    step="1"
                                    min="1"
                                    max="10"
                                    name="codes_count"
                                    value={formData.codes_count || ''}
                                    onChange={handleNumberChange}
                                    placeholder="اختياري (الافتراضي 1)"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:bg-white dark:focus:bg-[#1E1E1E] outline-none transition-all dark:text-white text-left"
                                    dir="ltr"
                                />
                                <p className="text-xs text-slate-500 mt-2">كم عدد الأكواد التي تريد إنشاؤها (من 1 إلى 10).</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    كود خصم مخصص (اختياري)
                                </label>
                                <input
                                    type="text"
                                    name="promo_code"
                                    value={formData.promo_code || ''}
                                    onChange={handleChange}
                                    placeholder="أدخل كود خصم مخصص"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:bg-white dark:focus:bg-[#1E1E1E] outline-none transition-all dark:text-white text-left uppercase"
                                    dir="ltr"
                                />
                                <p className="text-xs text-slate-500 mt-2">اتركه فارغاً لإنشاء كود تلقائي. في حال تعيين كود، يفضل تعيين العدد لـ 1.</p>
                            </div>

                            <div className="flex items-center md:col-span-2 md:mt-4">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="status"
                                        className="sr-only peer"
                                        checked={formData.status === 'active'}
                                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked ? 'active' : 'inactive' }))}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                    <span className="mr-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                                        الحساب نشط
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex rtl:flex-row-reverse items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-white/5">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/influencers')}
                            disabled={isLoading}
                            className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-shibl-crimson text-white font-bold hover:bg-shibl-crimson/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                            <span>حفظ المسوق</span>
                        </button>
                    </div>

                </div>
            </form>
        </div>
    );
}
