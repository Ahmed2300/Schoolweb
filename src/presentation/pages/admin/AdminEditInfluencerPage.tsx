import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

export function AdminEditInfluencerPage() {
    const { id } = useParams<{ id: string }>();
    const { isRTL } = useLanguage();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const [editingCode, setEditingCode] = useState<{ id: number; code: string; is_active: boolean } | null>(null);
    const [codeForm, setCodeForm] = useState({ code: '', is_active: true });
    const [isCodeUpdating, setIsCodeUpdating] = useState(false);

    const [formData, setFormData] = useState<Partial<CreateInfluencerRequest & { codes: { id: number; code: string; is_active: boolean }[] }>>({
        name: '',
        email: '',
        mobile: '',
        fixed_commission_amount: 0,
        status: 'active'
    });

    const [passwordConfirm, setPasswordConfirm] = useState('');

    useEffect(() => {
        if (!id) return;

        const fetchInfluencer = async () => {
            try {
                const response = await adminService.getInfluencer(Number(id));
                const influencer = response.data;
                setFormData({
                    name: influencer.name,
                    email: influencer.email,
                    mobile: influencer.mobile || '',
                    fixed_commission_amount: influencer.fixed_commission_amount,
                    status: influencer.status || 'active',
                    codes: influencer.codes || []
                });
            } catch (error: any) {
                toast.error('تعذر تحميل بيانات الشريك');
                navigate('/admin/influencers');
            } finally {
                setIsFetching(false);
            }
        };

        fetchInfluencer();
    }, [id, navigate]);

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

        if (formData.password && formData.password.length > 0) {
            if (formData.password.length < 8) {
                toast.error('كلمة المرور يجب أن تتكون من 8 خانات على الأقل');
                return;
            }
            if (formData.password !== passwordConfirm) {
                toast.error('كلمات المرور غير متطابقة');
                return;
            }
        }

        setIsLoading(true);
        try {
            await adminService.updateInfluencer(Number(id), formData);
            toast.success('تم تحديث بيانات الشريك بنجاح');
            navigate('/admin/influencers');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'تعذر تحديث بيانات الشريك.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCode) return;

        if (!codeForm.code.trim()) {
            toast.error('الكود الترويجي مطلوب');
            return;
        }

        setIsCodeUpdating(true);
        try {
            const response = await adminService.updateAffiliateCode(editingCode.id, {
                code: codeForm.code,
                is_active: codeForm.is_active
            });

            // Update local state
            setFormData(prev => ({
                ...prev,
                codes: prev.codes?.map(c => c.id === response.data.id ? response.data : c)
            }));

            toast.success('تم تحديث الكود الترويجي بنجاح');
            setEditingCode(null);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'تعذر تحديث الكود الترويجي');
        } finally {
            setIsCodeUpdating(false);
        }
    };

    if (isFetching) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400 min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-shibl-crimson" />
                <p>جاري تحميل البيانات...</p>
            </div>
        );
    }

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
                        تعديل بيانات المسوق
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        تحديث معلومات المسوق أو تغيير كلمة المرور والعمولة.
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
                                        value={formData.name || ''}
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
                                        value={formData.email || ''}
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
                                        value={formData.mobile || ''}
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
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">تغيير كلمة المرور</h2>
                        </div>
                        <p className="text-sm text-slate-500 mb-4 cursor-pointer hover:text-shibl-crimson transition-colors select-none">اترك الحقول فارغة إذا كنت لا تريد تغيير كلمة المرور.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    كلمة المرور الجديدة
                                </label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password || ''}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:bg-white dark:focus:bg-[#1E1E1E] outline-none transition-all dark:text-white text-left tracking-widest pl-10"
                                    />
                                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    تأكيد كلمة المرور الجديدة
                                </label>
                                <div className="relative">
                                    <input
                                        type="password"
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
                                        value={formData.fixed_commission_amount || 0}
                                        onChange={handleNumberChange}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:bg-white dark:focus:bg-[#1E1E1E] outline-none transition-all dark:text-white text-left pl-12"
                                        dir="ltr"
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium select-none">OMR</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">سيتم تطبيق هذه النسبة على جميع عمليات البيع القادمة.</p>
                            </div>

                            {/* Codes List */}
                            {formData.codes && formData.codes.length > 0 && (
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        الأكواد الترويجية الخاصة بالمسوق
                                    </label>
                                    <div className="flex flex-col gap-3">
                                        {formData.codes.map(code => (
                                            <div key={code.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-sm font-bold text-slate-800 dark:text-white">{code.code}</span>
                                                    {code.is_active ? (
                                                        <span className="w-2 h-2 rounded-full bg-emerald-500" title="نشط"></span>
                                                    ) : (
                                                        <span className="w-2 h-2 rounded-full bg-red-500" title="غير نشط"></span>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingCode(code);
                                                        setCodeForm({ code: code.code, is_active: code.is_active });
                                                    }}
                                                    className="p-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20 transition-colors"
                                                >
                                                    تعديل
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center md:col-span-2 mt-4">
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
                            <span>حفظ التعديلات</span>
                        </button>
                    </div>

                </div>
            </form>

            {/* Edit Code Modal */}
            {editingCode && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl w-full max-w-md shadow-xl border border-slate-100 dark:border-white/10 overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/5">
                            <h3 className="font-bold text-slate-800 dark:text-white">تعديل الكود الترويجي</h3>
                            <button
                                onClick={() => setEditingCode(null)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleUpdateCode} className="p-6 space-y-4">
                            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 flex gap-3 text-amber-800 dark:text-amber-300">
                                <div className="shrink-0 mt-0.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                </div>
                                <div>
                                    <p className="text-sm font-bold mb-1">تحذير</p>
                                    <p className="text-xs leading-relaxed">
                                        تغيير اسم الكود الترويجي قد يؤثر على الطلاب الذين يحتفظون بالكود القديم. يفضل إيقاف الكود الحالي وإنشاء كود جديد بدلاً من تغيير اسمه.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    اسم الكود
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={codeForm.code}
                                    onChange={(e) => setCodeForm(prev => ({ ...prev, code: e.target.value.toUpperCase().replace(/\s/g, '') }))}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:bg-white dark:focus:bg-[#1E1E1E] outline-none transition-all dark:text-white font-mono uppercase"
                                    dir="ltr"
                                />
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">حالة الكود</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={codeForm.is_active}
                                        onChange={(e) => setCodeForm(prev => ({ ...prev, is_active: e.target.checked }))}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                </label>
                            </div>

                            <div className="flex gap-3 pt-6 border-t border-slate-100 dark:border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setEditingCode(null)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCodeUpdating || !codeForm.code.trim()}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-shibl-crimson text-white font-medium hover:bg-shibl-crimson/90 transition-colors disabled:opacity-50"
                                >
                                    {isCodeUpdating ? <Loader2 size={18} className="animate-spin" /> : <span>حفظ الكود</span>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
