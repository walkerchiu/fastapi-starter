'use client';

import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  type SelectChangeEvent,
} from '@mui/material';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export interface DataTablePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function DataTablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
}: DataTablePaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (page > 3) {
        pages.push('ellipsis');
      }

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) {
        pages.push('ellipsis');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  if (total === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      {/* Info */}
      <Typography variant="body2" color="text.secondary">
        Showing {startItem} to {endItem} of {total} results
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Page size selector */}
        {onPageSizeChange && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Rows:
            </Typography>
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <Select
                value={pageSize.toString()}
                onChange={(e: SelectChangeEvent) =>
                  onPageSizeChange(Number(e.target.value))
                }
              >
                {pageSizeOptions.map((size) => (
                  <MenuItem key={size} value={size.toString()}>
                    {size}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        {/* Pagination controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={() => onPageChange(1)}
            disabled={!canGoPrevious}
            aria-label="First page"
          >
            <FirstPageIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onPageChange(page - 1)}
            disabled={!canGoPrevious}
            aria-label="Previous page"
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>

          {getPageNumbers().map((pageNum, index) =>
            pageNum === 'ellipsis' ? (
              <Typography
                key={`ellipsis-${index}`}
                variant="body2"
                sx={{ px: 1, color: 'text.secondary' }}
              >
                ...
              </Typography>
            ) : (
              <IconButton
                key={pageNum}
                size="small"
                onClick={() => onPageChange(pageNum)}
                sx={{
                  minWidth: 36,
                  borderRadius: 1,
                  bgcolor: pageNum === page ? 'primary.main' : 'transparent',
                  color: pageNum === page ? 'primary.contrastText' : 'inherit',
                  '&:hover': {
                    bgcolor: pageNum === page ? 'primary.dark' : 'action.hover',
                  },
                }}
              >
                {pageNum}
              </IconButton>
            ),
          )}

          <IconButton
            size="small"
            onClick={() => onPageChange(page + 1)}
            disabled={!canGoNext}
            aria-label="Next page"
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onPageChange(totalPages)}
            disabled={!canGoNext}
            aria-label="Last page"
          >
            <LastPageIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
