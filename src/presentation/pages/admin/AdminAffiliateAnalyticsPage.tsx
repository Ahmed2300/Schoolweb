import React, { useState, useEffect, useMemo } from 'react';
import { adminService, InfluencerData } from '../../../data/api/adminService';
import { TrendingUp, Activity, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

interface AggregatedUsage {
    code: string;
    influencerName: string;
    usageCount: number;
    totalCommission: number;
    isActive: boolean;
}

export const AdminAffiliateAnalyticsPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [aggregatedData, setAggregatedData] = useState<AggregatedUsage[]>([]);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // 1. Fetch all influencers
            let allInfluencers: InfluencerData[] = [];
            let currentInfluencerPage = 1;
            let infHasMore = true;

            while (infHasMore) {
                const infRes = await adminService.getInfluencers({ page: currentInfluencerPage, per_page: 50 });
                allInfluencers = [...allInfluencers, ...infRes.data];
                if (currentInfluencerPage >= infRes.meta.last_page) {
                    infHasMore = false;
                } else {
                    currentInfluencerPage++;
                }
            }

            // 2. Fetch usages for each influencer and aggregate data
            const usagesMap = new Map<string, AggregatedUsage>();

            // Initialize map with all codes to ensure unused active codes appear (with 0 usage)
            allInfluencers.forEach(influencer => {
                if (influencer.codes) {
                    influencer.codes.forEach(c => {
                        usagesMap.set(c.code, {
                            code: c.code,
                            influencerName: influencer.name,
                            usageCount: 0,
                            totalCommission: 0,
                            isActive: c.is_active
                        });
                    });
                }
            });

            // Fetch actual usages
            for (const influencer of allInfluencers) {
                let currentUsagePage = 1;
                let usageHasMore = true;

                while (usageHasMore) {
                    const usageRes = await adminService.getInfluencerUsages(influencer.id, { page: currentUsagePage, per_page: 50 });

                    usageRes.data.forEach((usage: any) => {
                        if (usage.code && usage.code.code) {
                            const codeStr = usage.code.code;
                            const existing = usagesMap.get(codeStr);
                            if (existing) {
                                existing.usageCount += 1;
                                existing.totalCommission += Number(usage.commission_earned) || 0;
                            } else {
                                // Fallback just in case standard initialization missed it
                                usagesMap.set(codeStr, {
                                    code: codeStr,
                                    influencerName: influencer.name,
                                    usageCount: 1,
                                    totalCommission: Number(usage.commission_earned) || 0,
                                    // Default fallback to true if not found in list, though rare
                                    isActive: true
                                });
                            }
                        }
                    });

                    if (currentUsagePage >= usageRes.meta.last_page) {
                        usageHasMore = false;
                    } else {
                        currentUsagePage++;
                    }
                }
            }

            // 3. Convert map to array and sort by usage count descending
            const dataArray = Array.from(usagesMap.values()).sort((a, b) => b.usageCount - a.usageCount);
            setAggregatedData(dataArray);

        } catch (err) {
            console.error('Failed to load affiliate analytics data', err);
            setError('حدث خطأ أثناء تحميل إحصائيات الأكواد الترويجية. يرجى المحاولة مرة أخرى.');
        } finally {
            setIsLoading(false);
        }
    };

    const summaryCards = useMemo(() => {
        let totalActiveUsages = 0;
        let totalActiveCodes = 0;
        let totalCommission = 0;

        aggregatedData.forEach(item => {
            if (item.isActive) {
                totalActiveUsages += item.usageCount;
                totalActiveCodes += 1;
            }
            totalCommission += item.totalCommission;
        });

        return { totalActiveUsages, totalActiveCodes, totalCommission };
    }, [aggregatedData]);

    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-8rem)] items-center justify-center bg-slate-50 dark:bg-slate-900 border-x border-slate-200 dark:border-white/10 mx-auto max-w-7xl">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">جاري تحميل البيانات وتجميع الإحصائيات...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[calc(100vh-8rem)] items-center justify-center bg-slate-50 dark:bg-slate-900 border-x border-slate-200 dark:border-white/10 mx-auto max-w-7xl">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10">
                        <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <p className="text-lg font-medium text-slate-900 dark:text-white">{error}</p>
                    <button
                        onClick={fetchAllData}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120]">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">إحصائيات الأكواد الترويجية</h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            تحليل استخدام الأكواد الترويجية والعمولات المكتسبة عبر جميع المؤثرين.
                        </p>
                    </div>
                    <button
                        onClick={fetchAllData}
                        className="inline-flex items-center gap-2 rounded-lg bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        تحديث الإحصائيات
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-200 dark:border-white/5"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                <Activity className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">استخدامات الأكواد النشطة</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{summaryCards.totalActiveUsages.toLocaleString()}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-200 dark:border-white/5"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">إجمالي الأكواد النشطة</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{summaryCards.totalActiveCodes.toLocaleString()}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-200 dark:border-white/5 sm:col-span-2 lg:col-span-1"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">إجمالي العمولات المكتسبة</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{summaryCards.totalCommission.toFixed(2)} ر.ع</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Main Table */}
                <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                                        اسم المؤثر
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                                        كود الخصم
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                                        مرات الاستخدام
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                                        إجمالي العمولات
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                                {aggregatedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                                            لا توجد بيانات متاحة حالياً.
                                        </td>
                                    </tr>
                                ) : (
                                    aggregatedData.map((item, index) => {
                                        const isTop = index === 0 && item.usageCount > 0;
                                        return (
                                            <tr
                                                key={item.code}
                                                className={`transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 ${isTop ? 'bg-amber-50/50 dark:bg-amber-500/5' : ''}`}
                                            >
                                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                                    {isTop && <span className="text-amber-500 dark:text-amber-400" title="الأكثر استخداماً">⭐</span>}
                                                    {item.influencerName}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-medium border ${item.isActive
                                                        ? 'bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-white/10'
                                                        : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20 opacity-75'
                                                        }`}>
                                                        {item.code} {isTop && <span className="mr-2 opacity-75">(الأفضل)</span>}
                                                    </span>
                                                    {!item.isActive && <span className="text-xs text-red-500 mr-2">(غير نشط)</span>}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                                                    {item.usageCount.toLocaleString()}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400 font-mono">
                                                    {item.totalCommission.toFixed(2)} ر.ع
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
