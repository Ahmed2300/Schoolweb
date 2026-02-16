import { Skeleton } from "../Skeleton";

export function PackageCardSkeleton() {
    return (
        <div className="bg-white rounded-[20px] overflow-hidden border border-slate-100 shadow-sm">
            {/* Image Skeleton */}
            <div className="relative h-44 w-full">
                <Skeleton className="h-full w-full" />

                {/* Badge Skeletons */}
                <div className="absolute top-4 left-4">
                    <Skeleton className="h-8 w-20 rounded-full bg-white/50 backdrop-blur-sm" />
                </div>
                <div className="absolute top-4 right-4">
                    <Skeleton className="h-8 w-20 rounded-full bg-slate-500/20" />
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="p-6 space-y-4">
                {/* Title */}
                <Skeleton className="h-7 w-3/4 rounded-lg" />

                {/* Description */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full rounded-md" />
                    <Skeleton className="h-4 w-2/3 rounded-md" />
                </div>

                {/* Savings Badge Skeleton */}
                <Skeleton className="h-9 w-1/3 rounded-lg" />

                {/* Stats Row */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                        <Skeleton className="w-8 h-8 rounded-lg" />
                        <Skeleton className="h-4 w-12 rounded-md" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                </div>

                {/* Button Skeleton */}
                <Skeleton className="h-12 w-full rounded-full mt-2" />
            </div>
        </div>
    );
}
