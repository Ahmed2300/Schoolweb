import React from 'react';
import { Skeleton } from './Skeleton';

export function CourseDetailsSkeleton() {
    return (
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                    <div className="space-y-2 flex-1 md:flex-none">
                        <Skeleton className="h-8 w-48 md:w-64" />
                        <Skeleton className="h-4 w-full md:w-96" />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <Skeleton className="h-8 w-32 rounded-full" />
                </div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 bg-white/60 rounded-xl border border-slate-200/60">
                        <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-5 w-10" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs Skeleton */}
            <div className="border-b border-slate-200">
                <div className="flex gap-4 pb-2">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-10 w-24 rounded-lg" />
                    ))}
                </div>
            </div>

            {/* Content Area Skeleton */}
            <div className="space-y-4">
                <div className="flex justify-end">
                    <Skeleton className="h-10 w-32 rounded-lg" />
                </div>

                {/* Units List Skeleton */}
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <div className="px-5 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                    <Skeleton className="w-5 h-5 rounded" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-5 w-48" />
                                        <Skeleton className="h-3 w-32" />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Skeleton className="h-8 w-8 rounded-lg" />
                                    <Skeleton className="h-8 w-8 rounded-lg" />
                                    <Skeleton className="h-8 w-8 rounded-lg" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
