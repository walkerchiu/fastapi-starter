import {
  type ButtonHTMLAttributes,
  forwardRef,
  useCallback,
  useMemo,
} from 'react';

export type PaginationSize = 'sm' | 'md' | 'lg';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  size?: PaginationSize;
  className?: string;
  showFirstLast?: boolean;
}

interface PageButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  size: PaginationSize;
}

const sizeStyles: Record<PaginationSize, string> = {
  sm: 'h-7 min-w-7 px-2 text-xs',
  md: 'h-9 min-w-9 px-3 text-sm',
  lg: 'h-11 min-w-11 px-4 text-base',
};

const iconSizeStyles: Record<PaginationSize, string> = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

const PageButton = forwardRef<HTMLButtonElement, PageButtonProps>(
  ({ isActive = false, size, className = '', children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed';
    const activeStyles = isActive
      ? 'bg-indigo-600 text-white dark:bg-indigo-500'
      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700';

    return (
      <button
        ref={ref}
        className={[baseStyles, activeStyles, sizeStyles[size], className]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {children}
      </button>
    );
  },
);

PageButton.displayName = 'PageButton';

function range(start: number, end: number): number[] {
  const length = end - start + 1;
  return Array.from({ length }, (_, idx) => idx + start);
}

const DOTS = 'dots';

function usePagination({
  totalPages,
  siblingCount = 1,
  currentPage,
}: {
  totalPages: number;
  siblingCount: number;
  currentPage: number;
}): (number | typeof DOTS)[] {
  return useMemo(() => {
    const totalPageNumbers = siblingCount + 5;

    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = range(1, leftItemCount);
      return [...leftRange, DOTS, totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(totalPages - rightItemCount + 1, totalPages);
      return [firstPageIndex, DOTS, ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }

    return range(1, totalPages);
  }, [totalPages, siblingCount, currentPage]);
}

export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  (
    {
      currentPage,
      totalPages,
      onPageChange,
      siblingCount = 1,
      size = 'md',
      className = '',
      showFirstLast = true,
    },
    ref,
  ) => {
    const paginationRange = usePagination({
      currentPage,
      totalPages,
      siblingCount,
    });

    const handlePageChange = useCallback(
      (page: number) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
          onPageChange(page);
        }
      },
      [currentPage, totalPages, onPageChange],
    );

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent) => {
        if (event.key === 'ArrowLeft') {
          handlePageChange(currentPage - 1);
        } else if (event.key === 'ArrowRight') {
          handlePageChange(currentPage + 1);
        }
      },
      [currentPage, handlePageChange],
    );

    if (totalPages <= 1) {
      return null;
    }

    const iconSize = iconSizeStyles[size];

    return (
      <nav
        ref={ref}
        className={['flex items-center gap-1', className]
          .filter(Boolean)
          .join(' ')}
        aria-label="Pagination"
        onKeyDown={handleKeyDown}
      >
        {showFirstLast && (
          <PageButton
            size={size}
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            aria-label="Go to first page"
          >
            <svg
              className={iconSize}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </PageButton>
        )}

        <PageButton
          size={size}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Go to previous page"
        >
          <svg
            className={iconSize}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </PageButton>

        {paginationRange.map((pageNumber, index) => {
          if (pageNumber === DOTS) {
            return (
              <span
                key={`dots-${index}`}
                className={[
                  'inline-flex items-center justify-center text-gray-500 dark:text-gray-400',
                  sizeStyles[size],
                ].join(' ')}
                aria-hidden="true"
              >
                ...
              </span>
            );
          }

          return (
            <PageButton
              key={pageNumber}
              size={size}
              isActive={pageNumber === currentPage}
              onClick={() => handlePageChange(pageNumber)}
              aria-label={`Go to page ${pageNumber}`}
              aria-current={pageNumber === currentPage ? 'page' : undefined}
            >
              {pageNumber}
            </PageButton>
          );
        })}

        <PageButton
          size={size}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Go to next page"
        >
          <svg
            className={iconSize}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </PageButton>

        {showFirstLast && (
          <PageButton
            size={size}
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Go to last page"
          >
            <svg
              className={iconSize}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            </svg>
          </PageButton>
        )}
      </nav>
    );
  },
);

Pagination.displayName = 'Pagination';
