import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';

/**
 * Pagination Component
 * 
 * A reusable pagination component for displaying and navigating through paginated data.
 * Displays current page, total pages, item range, and provides First/Previous/Next/Last navigation
 * with page number buttons and ellipsis.
 * 
 * @param currentPage - The current active page number (1-indexed)
 * @param totalPages - The total number of pages available
 * @param totalItems - Optional total number of items across all pages
 * @param pageSize - Optional number of items per page (used with totalItems for range display)
 * @param currentPageCount - Optional number of items on current page (used for accurate range display)
 * @param showPageInfo - Whether to show page information text (default: true)
 * @param onPageChange - Callback function called when page changes, receives new page number
 */

export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  currentPageCount?: number;
  showPageInfo?: boolean;
  onPageChange: (page: number) => void;
};

/**
 * Helper function to safely get current page number
 * Ensures page is always at least 1
 */
function getCurrentPageSafe(page: number, totalPages: number): number {
  return Math.min(Math.max(1, page), totalPages);
}

/**
 * Helper function to generate page numbers with ellipsis
 * Shows first page, last page, and pages around current page (±2)
 * Returns array with page numbers and '...' for ellipsis
 */
function getPageNumbers(current: number, total: number): (number | string)[] {
  const delta = 2;
  const range: number[] = [];
  const rangeWithDots: (number | string)[] = [];
  let last: number | null = null;

  // Collect pages to show: first, last, and current ± delta
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }

  // Build range with ellipsis
  for (const page of range) {
    if (last !== null) {
      if (page - last === 2) {
        // Gap of 1, show the missing page
        rangeWithDots.push(last + 1);
      } else if (page - last !== 1) {
        // Gap of more than 1, show ellipsis
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(page);
    last = page;
  }

  return rangeWithDots;
}

/**
 * Pagination Component
 * 
 * Renders pagination controls with page information and navigation buttons.
 * Only displays when totalPages > 1 to avoid showing pagination for single-page results.
 */
export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  currentPageCount,
  showPageInfo = true,
  onPageChange,
}: PaginationProps) {
  const safeTotalPages = Math.max(1, totalPages || 1);
  const safeCurrentPage = getCurrentPageSafe(currentPage, safeTotalPages);

  // Don't render pagination if there's only one page or no pages
  if (safeTotalPages <= 1) {
    return null;
  }

  // Calculate item range for display
  const startIndex =
    totalItems && pageSize ? (safeCurrentPage - 1) * pageSize + 1 : null;
  const endIndex =
    startIndex && pageSize && currentPageCount
      ? startIndex + currentPageCount - 1
      : null;

  // Get page numbers with ellipsis
  const pageNumbers = getPageNumbers(safeCurrentPage, safeTotalPages);

  return (
    <div className="flex flex-col gap-2 border-t border-gray-200 bg-gray-50 px-4 py-3">
      {/* Page information text */}
      {showPageInfo && (
        <div className="text-sm text-gray-600 text-center">
          {totalItems && pageSize && currentPageCount ? (
            <>Showing {startIndex} to {endIndex} of {totalItems}</>
          ) : (
            <>Page {safeCurrentPage} of {safeTotalPages}</>
          )}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-center items-center gap-2">
        {/* First Page button */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={safeCurrentPage === 1}
          className="btn-secondary btn-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          aria-label="First page"
        >
          <FiChevronsLeft size={15} />
        </button>

        {/* Previous button */}
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, safeCurrentPage - 1))}
          disabled={safeCurrentPage === 1}
          className="btn-secondary btn-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          aria-label="Previous page"
        >
          <FiChevronLeft size={15} />
        </button>

        {/* Page number buttons with ellipsis */}
        {pageNumbers.map((page, idx) =>
          page === '...' ? (
            <span
              key={`ellipsis-${idx}`}
              className="px-2 text-gray-400 select-none text-sm"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page as number)}
              className={`px-3 py-1 rounded-xl border transition text-xs font-semibold ${
                page === safeCurrentPage
                  ? 'bg-brand-primary text-white border-brand-primary'
                  : 'btn-secondary btn-sm border-gray-300 hover:bg-brand-primary/10'
              }`}
              aria-label={`Go to page ${page}`}
              aria-current={page === safeCurrentPage ? 'page' : undefined}
            >
              {page}
            </button>
          )
        )}

        {/* Next button */}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(safeTotalPages, safeCurrentPage + 1))}
          disabled={safeCurrentPage === safeTotalPages}
          className="btn-secondary btn-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          aria-label="Next page"
        >
          <FiChevronRight size={15} />
        </button>

        {/* Last Page button */}
        <button
          type="button"
          onClick={() => onPageChange(safeTotalPages)}
          disabled={safeCurrentPage === safeTotalPages}
          className="btn-secondary btn-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          aria-label="Last page"
        >
          <FiChevronsRight size={15} />
        </button>
      </div>
    </div>
  );
}

export default Pagination;
