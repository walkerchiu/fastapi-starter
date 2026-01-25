'use client';

import { forwardRef, useCallback } from 'react';
import MuiPagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

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

const sizeMap: Record<PaginationSize, 'small' | 'medium' | 'large'> = {
  sm: 'small',
  md: 'medium',
  lg: 'large',
};

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
    const handleChange = useCallback(
      (_event: React.ChangeEvent<unknown>, page: number) => {
        if (page !== currentPage) {
          onPageChange(page);
        }
      },
      [currentPage, onPageChange],
    );

    if (totalPages <= 1) {
      return null;
    }

    return (
      <Stack
        ref={ref}
        direction="row"
        spacing={1}
        className={className}
        component="nav"
        aria-label="Pagination"
      >
        <MuiPagination
          count={totalPages}
          page={currentPage}
          onChange={handleChange}
          size={sizeMap[size]}
          siblingCount={siblingCount}
          showFirstButton={showFirstLast}
          showLastButton={showFirstLast}
          shape="rounded"
          color="primary"
        />
      </Stack>
    );
  },
);

Pagination.displayName = 'Pagination';
