import { Skeleton } from '../Skeleton';

export const ParentChildrenSkeleton = () => {
    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-10 animate-pulse">
            {/* 1. Header & Student Selector Skeleton */}
            <div className="flex flex-col gap-6">
                <div>
                    <Skeleton className="h-8 w-48 rounded-lg mb-2" />
                    <Skeleton className="h-4 w-64 rounded-lg" />
                </div>

                {/* Horizontal List of Children */}
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 pl-4 pr-2 py-2 rounded-full border border-slate-100 min-w-[180px]">
                            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-3 w-2/3 rounded" />
                                <Skeleton className="h-2 w-1/2 rounded" />
                            </div>
                        </div>
                    ))}
                    <div className="w-8 h-8 rounded-full bg-slate-100 shrink-0" />
                </div>
            </div>

            {/* 2. Main Dashboard Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                {/* Left Column (Profile & Key Metrics) - Span 4 */}
                <div className="lg:col-span-4 space-y-6 md:space-y-8">

                    {/* Hero Card Skeleton */}
                    <div className="bg-white rounded-[24px] overflow-hidden border border-slate-200 relative shadow-sm h-[400px] flex flex-col items-center p-8">
                        <div className="absolute top-0 w-full h-1.5 bg-slate-100"></div>

                        <Skeleton className="w-24 h-24 md:w-28 md:h-28 rounded-full mb-6" />

                        <Skeleton className="h-6 w-48 rounded-lg mb-3" />
                        <Skeleton className="h-4 w-32 rounded-lg mb-8" />

                        {/* Circular Stats Row */}
                        <div className="w-full pt-6 border-t border-slate-50 flex justify-center">
                            <Skeleton className="w-16 h-16 rounded-full" />
                        </div>

                        <div className="w-full mt-auto pt-4 flex justify-center">
                            <Skeleton className="h-4 w-32 rounded" />
                        </div>
                    </div>

                    {/* Quick Actions Skeleton */}
                    <div className="space-y-3">
                        <Skeleton className="h-16 w-full rounded-xl" />
                    </div>
                </div>

                {/* Right Column (Detailed Analysis) - Span 8 */}
                <div className="lg:col-span-8 space-y-6 md:space-y-8">

                    {/* Graph Skeleton */}
                    <div className="bg-white rounded-[24px] p-6 md:p-8 border border-slate-200 shadow-sm">
                        <div className="flex justify-between mb-8">
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-48 rounded-lg" />
                                <Skeleton className="h-4 w-32 rounded-lg" />
                            </div>
                            <Skeleton className="h-6 w-24 rounded-lg" />
                        </div>
                        <Skeleton className="h-32 w-full rounded-xl" />
                    </div>

                    {/* Recent Exams Skeleton */}
                    <div className="bg-white rounded-[24px] p-6 md:p-8 border border-slate-200 shadow-sm">
                        <div className="flex justify-between mb-6">
                            <Skeleton className="h-6 w-40 rounded-lg" />
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                                    <Skeleton className="h-4 w-1/3 rounded" />
                                    <Skeleton className="h-4 w-20 rounded" />
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                    <Skeleton className="h-4 w-12 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Subject Cards Grid Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2].map((i) => (
                            <div key={i} className="bg-white rounded-[24px] border border-slate-100 overflow-hidden h-[320px] flex flex-col">
                                <Skeleton className="h-32 w-full" />
                                <div className="p-5 flex flex-col flex-1 space-y-4">
                                    <Skeleton className="h-6 w-3/4 rounded-lg" />
                                    <Skeleton className="h-4 w-1/2 rounded-lg" />

                                    <div className="mt-auto space-y-2">
                                        <div className="flex justify-between">
                                            <Skeleton className="h-3 w-16 rounded" />
                                            <Skeleton className="h-3 w-8 rounded" />
                                        </div>
                                        <Skeleton className="h-2 w-full rounded-full" />
                                    </div>

                                    <div className="pt-4 border-t border-slate-50 flex justify-between">
                                        <Skeleton className="h-4 w-24 rounded" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
