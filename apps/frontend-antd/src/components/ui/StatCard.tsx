import { type ReactNode } from 'react';
import { Card, Statistic } from 'antd';

export interface StatCardProps {
  title: string;
  value: number | string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  precision?: number;
  loading?: boolean;
  trend?: 'up' | 'down';
  trendValue?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  prefix,
  suffix,
  precision,
  loading = false,
  trend,
  trendValue,
  className,
}: StatCardProps) {
  const getTrendColor = () => {
    if (trend === 'up') return '#52c41a';
    if (trend === 'down') return '#ff4d4f';
    return undefined;
  };

  return (
    <Card className={className} loading={loading}>
      <Statistic
        title={title}
        value={value}
        prefix={prefix}
        suffix={
          <>
            {suffix}
            {trendValue && (
              <span
                style={{
                  color: getTrendColor(),
                  fontSize: 14,
                  marginLeft: 8,
                }}
              >
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''}
                {trendValue}
              </span>
            )}
          </>
        }
        precision={precision}
      />
    </Card>
  );
}
