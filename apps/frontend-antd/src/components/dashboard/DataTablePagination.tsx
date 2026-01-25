'use client';

import { Pagination, Space, Typography } from 'antd';
import { Select } from '../ui/Select';

const { Text } = Typography;

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
  className,
}: DataTablePaginationProps) {
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  if (total === 0) {
    return null;
  }

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      {/* Info */}
      <Text type="secondary">
        Showing {startItem} to {endItem} of {total} results
      </Text>

      <Space size={16}>
        {/* Page size selector */}
        {onPageSizeChange && (
          <Space size={8}>
            <Text type="secondary">Rows:</Text>
            <Select
              value={pageSize.toString()}
              onChange={(value) => onPageSizeChange(Number(value))}
              options={pageSizeOptions.map((size) => ({
                value: size.toString(),
                label: size.toString(),
              }))}
              size="sm"
            />
          </Space>
        )}

        {/* Pagination controls */}
        <Pagination
          current={page}
          pageSize={pageSize}
          total={total}
          onChange={onPageChange}
          showSizeChanger={false}
          showQuickJumper={total > 100}
          size="small"
        />
      </Space>
    </div>
  );
}
