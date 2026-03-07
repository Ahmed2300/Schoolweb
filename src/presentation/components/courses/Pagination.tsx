import { useLanguage } from '../../hooks';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

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

    // Ensure valid numbers
    const current = Math.max(1, Number(currentPage) || 1);
    const total = Math.max(1, Number(totalPages) || 1);

    // Generate page numbers
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];

        if (total <= 7) {
            for (let i = 1; i <= total; i++) pages.push(i);
        } else {
            if (current <= 4) {
                pages.push(1, 2, 3, 4, 5, '...', total);
            } else if (current >= total - 3) {
                pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
            } else {
                pages.push(1, '...', current - 1, current, current + 1, '...', total);
            }
        }
        return pages;
    };

    const pages = getPageNumbers();

    return (
        <nav
            className="flex items-center justify-center gap-1.5 md:gap-2 py-6 w-full"
            aria-label="Pagination"
            dir="ltr"
        >
            <button
                type="button"
                onClick={onPrev}
                disabled={current <= 1 || isLoading}
                className={`flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 transition-all duration-300
                    ${current <= 1 || isLoading
                        ? 'text-slate-300 bg-slate-50 cursor-not-allowed opacity-70'
                        : 'text-slate-600 bg-white hover:border-shibl-crimson hover:text-shibl-crimson hover:shadow-md hover:-translate-y-0.5'
                    }`}
                aria-label={isRTL ? 'الصفحة السابقة' : 'Previous page'}
            >
                {/* LTR arrow is default. If RTL context, we visually point it 'Next' (right) for 'Previous' depending on design, 
                    but here we always keep LTR direction for pagination numbers so arrow directions stay fixed */}
                <ChevronLeft size={20} />
            </button>

            <div className="flex items-center gap-1 bg-white px-2 py-1.5 rounded-xl shadow-sm border border-slate-100">
                {pages.map((page, index) => (
                    page === '...' ? (
                        <div key={`ellipsis-${index}`} className="w-10 h-10 flex items-center justify-center text-slate-400">
                            <MoreHorizontal size={18} />
                        </div>
                    ) : (
                        <button
                            key={`page-${page}`}
                            type="button"
                            onClick={() => onPageChange(Number(page))}
                            disabled={isLoading}
                            className={`w-10 h-10 rounded-[10px] text-sm font-bold transition-all duration-300 flex items-center justify-center
                                ${current === page
                                    ? 'bg-shibl-crimson text-white shadow-lg shadow-shibl-crimson/25 scale-105'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-shibl-crimson'
                                }
                                ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
                            `}
                            aria-current={current === page ? 'page' : undefined}
                        >
                            {page}
                        </button>
                    )
                ))}
            </div>

            <button
                type="button"
                onClick={onNext}
                disabled={current >= total || isLoading}
                className={`flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 transition-all duration-300
                    ${current >= total || isLoading
                        ? 'text-slate-300 bg-slate-50 cursor-not-allowed opacity-70'
                        : 'text-slate-600 bg-white hover:border-shibl-crimson hover:text-shibl-crimson hover:shadow-md hover:-translate-y-0.5'
                    }`}
                aria-label={isRTL ? 'الصفحة التالية' : 'Next page'}
            >
                <ChevronRight size={20} />
            </button>
        </nav>
    );
}
