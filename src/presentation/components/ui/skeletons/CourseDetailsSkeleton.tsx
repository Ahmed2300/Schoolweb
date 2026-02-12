import React from 'react';

export const CourseDetailsSkeleton = () => {
    return (
        <div className="container mx-auto px-4 py-8 pb-32 animate-pulse">
            {/* Header Skeleton */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 border border-slate-200 dark:border-white/5 shadow-sm mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-1 bg-slate-100 dark:bg-white/5"></div>

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="w-full">
                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-4 w-16 bg-slate-200 dark:bg-white/10 rounded"></div>
                            <div className="h-4 w-4 bg-slate-200 dark:bg-white/10 rounded"></div>
                            <div className="h-4 w-24 bg-slate-200 dark:bg-white/10 rounded"></div>
                        </div>

                        {/* Title */}
                        <div className="h-8 w-64 bg-slate-200 dark:bg-white/10 rounded-lg mb-4"></div>

                        {/* Meta Tags */}
                        <div className="flex items-center gap-4">
                            <div className="h-6 w-16 bg-slate-200 dark:bg-white/10 rounded-full"></div>
                            <div className="h-6 w-20 bg-slate-200 dark:bg-white/10 rounded-full"></div>
                            <div className="h-6 w-16 bg-slate-200 dark:bg-white/10 rounded-full"></div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-200 dark:bg-white/10 rounded-xl"></div>
                        <div className="w-32 h-10 bg-slate-200 dark:bg-white/10 rounded-xl"></div>
                    </div>
                </div>

                {/* Info Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                            <div className="w-10 h-10 bg-slate-200 dark:bg-white/10 rounded-lg"></div>
                            <div className="flex-1">
                                <div className="h-3 w-16 bg-slate-200 dark:bg-white/10 rounded mb-2"></div>
                                <div className="h-6 w-8 bg-slate-200 dark:bg-white/10 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tab Navigation Skeleton */}
                <div className="flex gap-4 mt-8 border-b border-slate-100 dark:border-white/5 pb-1">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-8 w-24 bg-slate-200 dark:bg-white/10 rounded-t-lg"></div>
                    ))}
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="h-8 w-32 bg-slate-200 dark:bg-white/10 rounded-lg"></div>
                    <div className="h-10 w-32 bg-slate-200 dark:bg-white/10 rounded-lg"></div>
                </div>

                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-slate-200 dark:border-white/5 overflow-hidden">
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="w-5 h-8 bg-slate-200 dark:bg-white/10 rounded"></div>
                                    <div className="w-10 h-10 bg-slate-200 dark:bg-white/10 rounded-lg"></div>
                                    <div className="space-y-2">
                                        <div className="h-5 w-48 bg-slate-200 dark:bg-white/10 rounded"></div>
                                        <div className="h-3 w-32 bg-slate-200 dark:bg-white/10 rounded"></div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-8 h-8 bg-slate-200 dark:bg-white/10 rounded-lg"></div>
                                    <div className="w-8 h-8 bg-slate-200 dark:bg-white/10 rounded-lg"></div>
                                    <div className="w-8 h-8 bg-slate-200 dark:bg-white/10 rounded-lg"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
