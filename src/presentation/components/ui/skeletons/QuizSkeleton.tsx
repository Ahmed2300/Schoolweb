import { Skeleton } from "../Skeleton";

export function QuizSkeleton() {
    return (
        <div className="bg-white rounded-[1.5rem] p-6 border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between flex-wrap gap-6 relative z-10">
                {/* Quiz Info Skeleton */}
                <div className="flex items-center gap-5 flex-1 min-w-[240px]">
                    <Skeleton className="w-16 h-16 rounded-2xl" /> {/* Score box */}
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-6 w-48 rounded-lg" /> {/* Title */}
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-24 rounded-md" /> {/* Course name */}
                        </div>
                    </div>
                </div>

                {/* Stats & Date Skeleton */}
                <div className="flex items-center gap-8 md:gap-12 flex-wrap">
                    <div className="text-right">
                        <Skeleton className="h-3 w-16 mb-2 ml-auto" /> {/* Label */}
                        <div className="flex items-center justify-end gap-1.5">
                            <Skeleton className="h-4 w-24 rounded" /> {/* Date */}
                        </div>
                    </div>

                    <div className="text-right pl-4 border-l border-slate-100">
                        <Skeleton className="h-3 w-12 mb-2 ml-auto" /> {/* Label */}
                        <Skeleton className="h-7 w-16 rounded ml-auto" /> {/* Score */}
                    </div>

                    <div className="min-w-[100px] flex justify-end">
                        <Skeleton className="h-8 w-24 rounded-full" /> {/* Status Badge */}
                    </div>
                </div>
            </div>

            {/* Progress Bar Skeleton */}
            <div className="mt-5 relative">
                <div className="flex justify-between mb-1.5 px-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-20" />
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <Skeleton className="h-full w-1/2 rounded-full" />
                </div>
            </div>
        </div>
    );
}
