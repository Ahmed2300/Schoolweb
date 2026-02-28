import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks';
import adminService, { InfluencerData } from '../../../data/api/adminService';
import {
    Users,
    Search,
    MoreVertical,
    RefreshCcw,
    AlertCircle,
    Loader2,
    Check,
    X,
    Wallet,
    Edit2,
    Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

export function AdminInfluencersPage() {
    const { isRTL } = useLanguage();
    const navigate = useNavigate(); // added useNavigate
    const [influencers, setInfluencers] = useState<InfluencerData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [editingCommissionId, setEditingCommissionId] = useState<number | null>(null);
    const [commissionInputValue, setCommissionInputValue] = useState('');
    const [selectedCodes, setSelectedCodes] = useState<{ id: number, code: string, is_active: boolean }[] | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [influencerToDelete, setInfluencerToDelete] = useState<number | null>(null);

    const fetchInfluencers = async (page = 1, search = '') => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await adminService.getInfluencers({ page, per_page: 15, search });
            setInfluencers(response.data);
            setTotalPages(response.meta.last_page);
            setCurrentPage(response.meta.current_page);
        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء تحميل المؤثرين');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchInfluencers(1, searchQuery);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchInfluencers(currentPage, searchQuery);
    };

    const handleToggleActive = async (id: number) => {
        const originalInfluencers = [...influencers];

        // Optimistic Update
        setInfluencers(influencers.map(inf =>
            inf.id === id ? { ...inf, status: inf.status === 'active' ? 'inactive' : 'active' } : inf
        ));

        try {
            const response = await adminService.toggleInfluencerActive(id);
            toast.success(response.message);
            // Sync with backend state
            setInfluencers(influencers.map(inf =>
                inf.id === id ? { ...inf, status: response.is_active ? 'active' : 'inactive' } : inf
            ));
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'تعذر تحديث حالة المؤثر');
            setInfluencers(originalInfluencers); // Rollback
        }
    };

    const handleUpdateCommission = async (id: number) => {
        const amount = parseFloat(commissionInputValue);
        if (isNaN(amount) || amount < 0) {
            toast.error('يرجى إدخال مبلغ صحيح');
            return;
        }

        try {
            const response = await adminService.updateInfluencerCommission(id, amount);
            toast.success(response.message);
            setInfluencers(influencers.map(inf =>
                inf.id === id ? { ...inf, fixed_commission_amount: response.influencer.fixed_commission_amount } : inf
            ));
            setEditingCommissionId(null);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'تعذر تحديث العمولة');
        }
    };

    const handleDelete = (id: number) => {
        setInfluencerToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!influencerToDelete) return;

        try {
            await adminService.deleteInfluencer(influencerToDelete);
            toast.success('تم حذف الشريك بنجاح');
            // Remove from UI immediately or refetch if we want accurate pagination
            setInfluencers(influencers.filter(inf => inf.id !== influencerToDelete));
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'تعذر حذف الشريك');
        } finally {
            setIsDeleteModalOpen(false);
            setInfluencerToDelete(null);
        }
    };

    return (
        <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Users className="text-shibl-crimson" />
                        الشركاء والمؤثرون
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        إدارة حسابات الشركاء وتتبع العمولات والأكواد الترويجية.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-white/5">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    {/* Search */}
                    <div className="relative flex-1 w-full">
                        <input
                            type="text"
                            placeholder="ابحث بالاسم، البريد الإلكتروني، أو الكود..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-4 pr-11 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:bg-white dark:focus:bg-[#1E1E1E] outline-none transition-all dark:text-white"
                        />
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing || isLoading}
                            className="p-3 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-colors"
                        >
                            <RefreshCcw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                        </button>
                        <button
                            onClick={() => navigate('/admin/influencers/create')}
                            className="px-6 py-2.5 rounded-xl bg-shibl-crimson text-white font-medium hover:bg-shibl-crimson/90 transition-colors"
                        >
                            إضافة شريك
                        </button>
                    </div>
                </div>
            </div>

            {/* Content area */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden min-h-[400px]">
                {isLoading && !isRefreshing ? (
                    <div className="flex flex-col items-center justify-center p-12 text-slate-400 h-[400px]">
                        <Loader2 className="w-8 h-8 animate-spin mb-4 text-shibl-crimson" />
                        <p>جاري تحميل البيانات...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center p-12 h-[400px]">
                        <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-4">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">تعذر تحميل البيانات</h3>
                        <p className="text-slate-500 text-center mb-6 max-w-md">{error}</p>
                        <button
                            onClick={() => fetchInfluencers(currentPage, searchQuery)}
                            className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                        >
                            إعادة المحاولة
                        </button>
                    </div>
                ) : influencers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-slate-500 h-[400px]">
                        <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-4">
                            <Users className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-lg font-medium text-slate-700 dark:text-slate-300">لا توجد بيانات متاحة لأنه لا يوجد بيانات حتى الآن!</p>
                        <p className="text-sm mt-1">لم يتم العثور على أي بيانات مطابقة.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400">المؤثر</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400">الكود الترويجي</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400">العمولة الثابتة (ر.ع)</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400">الرصيد المتاح</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400">الحالة</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 text-left">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                {influencers.map((influencer) => (
                                    <tr key={influencer.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shrink-0">
                                                    <span className="text-indigo-700 dark:text-indigo-400 font-bold text-sm">
                                                        {influencer.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 dark:text-white">{influencer.name}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{influencer.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {(!influencer.codes || influencer.codes.length === 0) ? (
                                                <span className="text-slate-400 dark:text-slate-500 font-mono text-xs">لا يوجد</span>
                                            ) : influencer.codes.length === 1 ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10">
                                                    {influencer.codes[0].code}
                                                </span>
                                            ) : (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10">
                                                        {influencer.codes[0].code}
                                                    </span>
                                                    <button
                                                        onClick={() => setSelectedCodes(influencer.codes!)}
                                                        className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 transition-colors"
                                                    >
                                                        ...
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingCommissionId === influencer.id ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        value={commissionInputValue}
                                                        onChange={(e) => setCommissionInputValue(e.target.value)}
                                                        className="w-20 px-2 py-1 text-sm rounded bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 outline-none focus:border-shibl-crimson text-center dark:text-white"
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => handleUpdateCommission(influencer.id)}
                                                        className="p-1.5 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                                    >
                                                        <Check size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingCommissionId(null)}
                                                        className="p-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div
                                                    onClick={() => {
                                                        setEditingCommissionId(influencer.id);
                                                        setCommissionInputValue(influencer.fixed_commission_amount.toString());
                                                    }}
                                                    className="flex items-center gap-2 cursor-pointer group"
                                                >
                                                    <span className="font-medium text-slate-700 dark:text-slate-300">
                                                        {influencer.fixed_commission_amount} ر.ع
                                                    </span>
                                                    <span className="text-xs text-shibl-crimson opacity-0 group-hover:opacity-100 transition-opacity">تعديل</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                                                <Wallet size={16} />
                                                <span>{influencer.balance ?? 0} ر.ع</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {influencer.status === 'active' ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400">
                                                    نشط
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400">
                                                    غير نشط
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-left">
                                            <div className="flex justify-end items-center gap-2">
                                                <button
                                                    onClick={() => navigate(`/admin/influencers/${influencer.id}/edit`)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                                                    title="تعديل الشريك"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(influencer.id)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                                    title="حذف الشريك"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleActive(influencer.id)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${influencer.status === 'active'
                                                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
                                                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20'
                                                        }`}
                                                >
                                                    {influencer.status === 'active' ? 'إيقاف' : 'تفعيل'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && !isLoading && !error && influencers.length > 0 && (
                    <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => fetchInfluencers(currentPage - 1, searchQuery)}
                            className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 dark:bg-black/20 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                        >
                            السابق
                        </button>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                            صفحة {currentPage} من {totalPages}
                        </span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => fetchInfluencers(currentPage + 1, searchQuery)}
                            className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 dark:bg-black/20 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                        >
                            التالي
                        </button>
                    </div>
                )}
            </div>

            {/* Codes Modal */}
            {selectedCodes && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl w-full max-w-sm shadow-xl border border-slate-100 dark:border-white/10 overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/5">
                            <h3 className="font-bold text-slate-800 dark:text-white">الأكواد الترويجية</h3>
                            <button
                                onClick={() => setSelectedCodes(null)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
                            {selectedCodes.map(c => (
                                <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                    <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{c.code}</span>
                                    {c.is_active ? (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">نشط</span>
                                    ) : (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">غير نشط</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl w-full max-w-sm shadow-xl border border-slate-100 dark:border-white/10 overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">حذف الشريك</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                                هل أنت متأكد من رغبتك في حذف هذا الشريك؟ سيتم حذف جميع الأكواد الخاصة به. لا يمكن التراجع عن هذا الإجراء.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setIsDeleteModalOpen(false);
                                        setInfluencerToDelete(null);
                                    }}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                                >
                                    تأكيد الحذف
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
