import { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks';
import { influencerService, InfluencerDashboardData } from '../../../data/api/influencerService';
import {
    Wallet,
    Users,
    Activity,
    AlertCircle,
    Loader2,
    Plus,
    ChevronLeft,
    ChevronRight,
    ArrowUpLeft,
    ArrowUpRight
} from 'lucide-react';
import { WithdrawalRequestModal } from '../../components/influencer/WithdrawalRequestModal';

export function InfluencerDashboardPage() {
    const { isRTL } = useLanguage();
    const [data, setData] = useState<InfluencerDashboardData | null>(null);
    const [usagesData, setUsagesData] = useState<{ data: any[], meta: any } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUsagesLoading, setIsUsagesLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchDashboardInfo = async () => {
            setIsLoading(true);
            try {
                const dashboardResponse = await influencerService.getDashboard();
                setData(dashboardResponse);
            } catch (err: unknown) {
                if (err && typeof err === 'object' && 'response' in err) {
                    const errorResponse = err as { response?: { data?: { message?: string } } };
                    setError(errorResponse.response?.data?.message || 'Failed to load dashboard data');
                } else if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('Failed to load dashboard data');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardInfo();
    }, []);

    useEffect(() => {
        const fetchUsages = async () => {
            setIsUsagesLoading(true);
            try {
                const usagesResponse = await influencerService.getUsages(currentPage);
                setUsagesData(usagesResponse);

                // Set total pages from meta
                if (usagesResponse.meta && (usagesResponse.meta as any).last_page) {
                    setTotalPages((usagesResponse.meta as any).last_page);
                } else if (usagesResponse.meta && (usagesResponse.meta as any).total) {
                    const perPage = (usagesResponse.meta as any).per_page || 15;
                    setTotalPages(Math.ceil((usagesResponse.meta as any).total / perPage));
                }
            } catch (error) {
                console.error('Failed to load usages', error);
            } finally {
                setIsUsagesLoading(false);
            }
        };
        fetchUsages();
    }, [currentPage]);

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-neutral-400 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-3">
                <AlertCircle className="shrink-0" />
                <p>{error}</p>
            </div>
        );
    }

    interface StatCardProps {
        title: string;
        value: string | number;
        icon: React.ReactNode;
        iconBgClass: string;
        iconTextClass: string;
        actionLabel?: string;
        onAction?: () => void;
    }

    const StatCard = ({ title, value, icon, iconBgClass, iconTextClass, actionLabel, onAction }: StatCardProps) => (
        <div className="bg-[#18181A] rounded-2xl p-6 border border-[#27272A] flex flex-col items-stretch h-full">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-[#888888] text-sm font-medium mb-3">{title}</h3>
                    <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-white/5 shadow-inner ${iconBgClass} ${iconTextClass}`}>
                    {icon}
                </div>
            </div>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[#27272A] text-[#888888] font-semibold hover:text-white hover:bg-[#27272A] transition-all"
                >
                    <Plus size={18} />
                    {actionLabel}
                </button>
            )}
        </div>
    );

    return (
        <div className="space-y-6 text-white" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">لوحة القيادة</h1>
                    <p className="text-[#888888]">نظرة عامة على أرباحك واستخدامات الكود الخاص بك.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <StatCard
                    title="الرصيد المتاح"
                    value={`${data?.current_balance || 0} ر.ع`}
                    icon={<Wallet size={24} />}
                    iconBgClass="bg-emerald-500/10"
                    iconTextClass="text-emerald-500"
                    actionLabel="طلب سحب"
                    onAction={() => setIsWithdrawModalOpen(true)}
                />
                <StatCard
                    title="إجمالي المسحوبات"
                    value={`${data?.total_withdrawn || 0} ر.ع`}
                    icon={isRTL ? <ArrowUpLeft size={24} /> : <ArrowUpRight size={24} />}
                    iconBgClass="bg-indigo-500/10"
                    iconTextClass="text-indigo-400"
                />
                <StatCard
                    title="مرات الاستخدام"
                    value={data?.total_usages || 0}
                    icon={<Users size={24} />}
                    iconBgClass="bg-blue-500/10"
                    iconTextClass="text-blue-400"
                />
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Top Codes Table */}
                <div className="bg-[#18181A] rounded-2xl border border-[#27272A] overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-[#27272A] flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                            {isRTL ? <ArrowUpLeft size={20} /> : <ArrowUpRight size={20} />}
                        </div>
                        <h2 className="text-lg font-bold text-white">أعلى الأكواد استخداماً</h2>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-right" dir="rtl">
                            <thead className="border-b border-[#27272A]">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-[#888888]">الكود</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-[#888888] text-center">الاستخدام</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-[#888888] text-left">العمولة</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#27272A]">
                                {data?.top_codes?.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-[#888888] text-sm">
                                            لا توجد بيانات متاحة
                                        </td>
                                    </tr>
                                ) : (
                                    data?.top_codes?.map((code, index) => (
                                        <tr key={index} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-white">
                                                {code.code}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-[#888888] text-center">
                                                {code.usage_count}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-emerald-500 font-medium text-left">
                                                {code.total_commission} ر.ع
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Usages Table */}
            <div className="bg-[#18181A] rounded-2xl border border-[#27272A] overflow-hidden">
                <div className="p-6 border-b border-[#27272A] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Activity size={20} />
                    </div>
                    <h2 className="text-lg font-bold text-white">سجل العمليات الأخيرة</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-right" dir="rtl">
                        <thead className="border-b border-[#27272A]">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-[#888888]">اسم العميل</th>
                                <th className="px-6 py-4 text-xs font-semibold text-[#888888]">كود الخصم</th>
                                <th className="px-6 py-4 text-xs font-semibold text-[#888888] text-center">قيمة الخصم</th>
                                <th className="px-6 py-4 text-xs font-semibold text-[#888888] text-center">العمولة</th>
                                <th className="px-6 py-4 text-xs font-semibold text-[#888888] text-left">الحالة</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#27272A] relative">
                            {isUsagesLoading && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8">
                                        <div className="flex justify-center items-center">
                                            <Loader2 className="w-6 h-6 text-[#888888] animate-spin" />
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {!isUsagesLoading && usagesData?.data?.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-[#888888] text-sm">
                                        لم يتم استخدام الكود الخاص بك حتى الآن
                                    </td>
                                </tr>
                            ) : (
                                !isUsagesLoading && usagesData?.data?.map((usage) => (
                                    <tr key={usage.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-white">
                                            {usage.student?.name || 'مستخدم غير معروف'}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-white">
                                            {usage.code?.code}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-center text-[#888888]">
                                            {usage.discount_amount} ر.ع
                                        </td>
                                        <td className="px-6 py-4 text-sm text-center text-emerald-500 font-medium">
                                            +{usage.commission_earned} ر.ع
                                        </td>
                                        <td className="px-6 py-4 text-left">
                                            {usage.usable?.status === 'active' || usage.usable?.status === 'approved' || usage.usable?.status === 'completed' ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                    مكتمل
                                                </span>
                                            ) : usage.usable?.status === 'pending' ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                    قيد المعالجة
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                                                    مرفوض أو غير صالح
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-[#27272A]">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1 || isUsagesLoading}
                            className="p-2 rounded-xl text-[#888888] hover:bg-white/5 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                        <span className="text-sm text-[#888888]">
                            صفحة {currentPage} من {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || isUsagesLoading}
                            className="p-2 rounded-xl text-[#888888] hover:bg-white/5 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                    </div>
                )}
            </div>

            {/* Withdrawal Modal */}
            <WithdrawalRequestModal
                isOpen={isWithdrawModalOpen}
                onClose={() => setIsWithdrawModalOpen(false)}
                currentBalance={data?.current_balance || 0}
                onSuccess={(amount) => {
                    // Optimistically update the balance
                    if (data) {
                        setData({
                            ...data,
                            current_balance: data.current_balance - amount
                        });
                    }
                }}
            />
        </div>
    );
}
