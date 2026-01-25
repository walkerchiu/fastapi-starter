import { Pagination as AntPagination } from 'antd';

export interface PaginationProps {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number, pageSize: number) => void;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean;
  disabled?: boolean;
  simple?: boolean;
  size?: 'default' | 'small';
  className?: string;
}

export function Pagination({
  current,
  pageSize,
  total,
  onChange,
  showSizeChanger = true,
  showQuickJumper = false,
  showTotal = true,
  disabled = false,
  simple = false,
  size = 'default',
  className,
}: PaginationProps) {
  return (
    <AntPagination
      current={current}
      pageSize={pageSize}
      total={total}
      onChange={onChange}
      onShowSizeChange={onChange}
      showSizeChanger={showSizeChanger}
      showQuickJumper={showQuickJumper}
      showTotal={showTotal ? (total) => `Total ${total} items` : undefined}
      disabled={disabled}
      simple={simple}
      size={size === 'small' ? 'small' : undefined}
      className={className}
    />
  );
}
