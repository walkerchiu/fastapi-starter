import {
  forwardRef,
  type HTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from 'react';

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  striped?: boolean;
}

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ striped = false, className = '', children, ...props }, ref) => {
    const baseStyles = 'w-full text-sm text-left';

    return (
      <div className="overflow-x-auto">
        <table
          ref={ref}
          className={[baseStyles, striped ? 'table-striped' : '', className]
            .filter(Boolean)
            .join(' ')}
          {...props}
        >
          {children}
        </table>
      </div>
    );
  },
);

Table.displayName = 'Table';

export type TableHeaderProps = HTMLAttributes<HTMLTableSectionElement>;

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  TableHeaderProps
>(({ className = '', children, ...props }, ref) => {
  const baseStyles =
    'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-200';

  return (
    <thead
      ref={ref}
      className={[baseStyles, className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </thead>
  );
});

TableHeader.displayName = 'TableHeader';

export type TableBodyProps = HTMLAttributes<HTMLTableSectionElement>;

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className = '', children, ...props }, ref) => {
    const baseStyles = 'divide-y divide-gray-200 dark:divide-gray-700';

    return (
      <tbody
        ref={ref}
        className={[baseStyles, className].filter(Boolean).join(' ')}
        {...props}
      >
        {children}
      </tbody>
    );
  },
);

TableBody.displayName = 'TableBody';

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ selected = false, className = '', children, ...props }, ref) => {
    const baseStyles =
      'bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 transition-colors';
    const selectedStyles = selected
      ? 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30'
      : '';

    return (
      <tr
        ref={ref}
        className={[baseStyles, selectedStyles, className]
          .filter(Boolean)
          .join(' ')}
        aria-selected={selected ? true : undefined}
        {...props}
      >
        {children}
      </tr>
    );
  },
);

TableRow.displayName = 'TableRow';

export type SortDirection = 'asc' | 'desc' | null;

export interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
  sortDirection?: SortDirection;
  onSort?: () => void;
}

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  (
    {
      sortable = false,
      sortDirection,
      onSort,
      className = '',
      children,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'px-4 py-3 font-semibold text-left border-b border-gray-200 dark:border-gray-700';
    const sortableStyles = sortable
      ? 'cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700'
      : '';

    const handleClick = () => {
      if (sortable && onSort) {
        onSort();
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (sortable && onSort && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        onSort();
      }
    };

    return (
      <th
        ref={ref}
        className={[baseStyles, sortableStyles, className]
          .filter(Boolean)
          .join(' ')}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={sortable ? 0 : undefined}
        aria-sort={
          sortDirection === 'asc'
            ? 'ascending'
            : sortDirection === 'desc'
              ? 'descending'
              : undefined
        }
        {...props}
      >
        <span className="inline-flex items-center gap-2">
          {children}
          {sortable && (
            <span className="inline-flex flex-col" aria-hidden="true">
              <svg
                className={`h-3 w-3 ${
                  sortDirection === 'asc'
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
              <svg
                className={`-mt-1 h-3 w-3 ${
                  sortDirection === 'desc'
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </span>
          )}
        </span>
      </th>
    );
  },
);

TableHead.displayName = 'TableHead';

export type TableCellProps = TdHTMLAttributes<HTMLTableCellElement>;

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className = '', children, ...props }, ref) => {
    const baseStyles =
      'px-4 py-3 text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700';

    return (
      <td
        ref={ref}
        className={[baseStyles, className].filter(Boolean).join(' ')}
        {...props}
      >
        {children}
      </td>
    );
  },
);

TableCell.displayName = 'TableCell';
