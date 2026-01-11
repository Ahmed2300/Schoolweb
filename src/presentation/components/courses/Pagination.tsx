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
        <nav className="pagination" aria-label="Courses pagination">
            <button
                type="button"
                onClick={onPrev}
                disabled={currentPage === 1 || isLoading}
                className="pagination__btn pagination__btn--prev"
                aria-label={isRTL ? 'الصفحة السابقة' : 'Previous page'}
            >
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                </svg>
            </button>

            <div className="pagination__pages">
                {pages.map((page, index) => (
                    page === '...' ? (
                        <span key={`ellipsis-${index}`} className="pagination__ellipsis">...</span>
                    ) : (
                        <button
                            key={page}
                            type="button"
                            onClick={() => onPageChange(page as number)}
                            disabled={isLoading}
                            className={`pagination__page ${currentPage === page ? 'pagination__page--active' : ''}`}
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
                className="pagination__btn pagination__btn--next"
                aria-label={isRTL ? 'الصفحة التالية' : 'Next page'}
            >
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
