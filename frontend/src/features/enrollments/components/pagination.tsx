// frontend/src/features/enrollments/components/pagination.tsx
import { Button } from "../../../shared/ui/button";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
};

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  isLoading,
}: PaginationProps): JSX.Element {
  const canGoBack = currentPage > 1;
  const canGoForward = currentPage < totalPages;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <p className="text-sm text-slate-600">
        Page {currentPage} of {totalPages} - {totalItems} total
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          className="px-3 py-1.5"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoBack || isLoading}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="px-3 py-1.5"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoForward || isLoading}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
