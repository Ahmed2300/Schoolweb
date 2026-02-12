import React from 'react';

/**
 * Basic Skeleton component for loading states.
 * Uses Tailwind CSS animate-pulse effect.
 */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-800 ${className || ''}`}
            {...props}
        />
    );
}
