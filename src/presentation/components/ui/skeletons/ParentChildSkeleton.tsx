import { Skeleton } from '../Skeleton';

export const ParentChildSkeleton = () => {
    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col h-full">
            <div className="p-6 md:p-8 flex-1">
                {/* Header: Avatar & Name */}
                <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-5 w-full">
                        <Skeleton className="w-20 h-20 rounded-[1.2rem]" />
                        <div className="space-y-3 flex-1">
                            <Skeleton className="h-6 w-1/2 rounded-lg" />
                            <Skeleton className="h-4 w-1/3 rounded-lg" />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Progress Bar */}
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <Skeleton className="h-3 w-1/4 rounded" />
                            <Skeleton className="h-6 w-12 rounded" />
                        </div>
                        <Skeleton className="h-3 w-full rounded-full" />
                    </div>

                    {/* Next Class Widget */}
                    <div className="flex items-center gap-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                        <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-3 w-1/3 rounded" />
                            <Skeleton className="h-4 w-2/3 rounded" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Action */}
            <div className="bg-slate-50 px-8 py-5 border-t border-slate-100 flex items-center justify-between">
                <Skeleton className="h-4 w-1/3 rounded" />
                <Skeleton className="h-4 w-1/4 rounded" />
            </div>
        </div>
    );
};
