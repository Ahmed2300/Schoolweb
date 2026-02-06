// src/presentation/components/courses/Pagination.tsx
import { useLanguage } from '../../hooks';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onNext: () => void;
    onPrev: () => void;
    isLoading?: boolean;
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    onNext,
    onPrev,
    isLoading = false,
}: PaginationProps) {
    const { isRTL } = useLanguage();

    if (totalPages <= 1) return null;

    const pages = generatePageNumbers(currentPage, totalPages);

    return (
        <nav className="flex items-center justify-center gap-2 py-4" aria-label="Courses pagination" dir="ltr">
            <button
                type="button"
                onClick={onPrev}
                disabled={currentPage === 1 || isLoading}
                className={`p-2 rounded-lg border border-slate-200 transition-all duration-200 
                    ${currentPage === 1 || isLoading
                        ? 'text-slate-300 cursor-not-allowed bg-slate-50'
                        : 'text-slate-600 hover:text-shibl-crimson hover:bg-red-50 hover:border-red-100 hover:shadow-sm'
                    }`}
                aria-label={isRTL ? 'الصفحة السابقة' : 'Previous page'}
            >
                {/* Always point left for 'Previous' in LTR layout */}
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                </svg>
            </button>

            <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-xl shadow-sm border border-slate-100">
                {pages.map((page, index) => (
                    page === '...' ? (
                        <span key={`ellipsis-${index}`} className="w-9 h-9 flex items-center justify-center text-slate-400 font-medium select-none">...</span>
                    ) : (
                        <button
                            key={page}
                            type="button"
                            onClick={() => onPageChange(page as number)}
                            disabled={isLoading}
                            className={`w-9 h-9 rounded-[10px] text-sm font-bold transition-all duration-200 flex items-center justify-center
                                ${currentPage === page
                                    ? 'bg-shibl-crimson text-white shadow-md shadow-red-200 scale-105'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                            aria-current={currentPage === page ? 'page' : undefined}
                        >
                            {page}
                        </button>
                    )
                ))}
            </div>

            <button
                type="button"
                onClick={onNext}
                disabled={currentPage === totalPages || isLoading}
                className={`p-2 rounded-lg border border-slate-200 transition-all duration-200 
                    ${currentPage === totalPages || isLoading
                        ? 'text-slate-300 cursor-not-allowed bg-slate-50'
                        : 'text-slate-600 hover:text-shibl-crimson hover:bg-red-50 hover:border-red-100 hover:shadow-sm'
                    }`}
                aria-label={isRTL ? 'الصفحة التالية' : 'Next page'}
            >
                {/* Always point right for 'Next' in LTR layout */}
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                </svg>
            </button>
        </nav>
    );
}

function generatePageNumbers(current: number, total: number): (number | '...')[] {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | '...')[] = [];

    pages.push(1);

    if (current > 3) {
        pages.push('...');
    }

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
            pages.push(i);
        }
    }

    if (current < total - 2) {
        pages.push('...');
    }

    if (!pages.includes(total)) {
        pages.push(total);
    }

    return pages;
}
