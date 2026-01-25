import { Card, Skeleton, Typography, Divider, Flex, Badge } from 'antd';

const { Text, Title } = Typography;

export interface HealthComponent {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  latency?: number;
  message?: string;
}

export interface HealthStatusData {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  components: HealthComponent[];
  lastChecked?: Date | string;
}

export interface HealthStatusProps {
  status: HealthStatusData;
  loading?: boolean;
  className?: string;
}

const statusColors: Record<string, string> = {
  healthy: '#52c41a',
  degraded: '#faad14',
  unhealthy: '#ff4d4f',
  unknown: '#8c8c8c',
};

const statusBadgeStatus: Record<
  string,
  'success' | 'warning' | 'error' | 'default'
> = {
  healthy: 'success',
  degraded: 'warning',
  unhealthy: 'error',
  unknown: 'default',
};

const statusLabels: Record<string, string> = {
  healthy: 'Healthy',
  degraded: 'Degraded',
  unhealthy: 'Unhealthy',
  unknown: 'Unknown',
};

function StatusIndicator({
  status,
}: {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
}) {
  return <Badge status={statusBadgeStatus[status]} />;
}

function HealthStatusSkeleton() {
  return (
    <div>
      <Flex align="center" gap={12} style={{ marginBottom: 24 }}>
        <Skeleton.Avatar active size={40} />
        <div>
          <Skeleton.Input
            active
            size="small"
            style={{ width: 80, marginBottom: 4 }}
          />
          <Skeleton.Input active size="small" style={{ width: 60 }} />
        </div>
      </Flex>
      <Flex vertical gap={12}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Flex key={i} justify="space-between">
            <Skeleton.Input active size="small" style={{ width: 100 }} />
            <Skeleton.Input active size="small" style={{ width: 60 }} />
          </Flex>
        ))}
      </Flex>
    </div>
  );
}

export function HealthStatus({
  status,
  loading = false,
  className = '',
}: HealthStatusProps) {
  if (loading) {
    return (
      <Card className={className}>
        <HealthStatusSkeleton />
      </Card>
    );
  }

  const formatLatency = (ms?: number) => {
    if (ms === undefined) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatLastChecked = (date?: Date | string) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString();
  };

  return (
    <Card className={className}>
      {/* Overall Status */}
      <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
        <Flex align="center" gap={12}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: `${statusColors[status.overall]}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: statusColors[status.overall],
              }}
            />
          </div>
          <div>
            <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
              System Status
            </Text>
            <Title
              level={5}
              style={{ margin: 0, color: statusColors[status.overall] }}
            >
              {statusLabels[status.overall]}
            </Title>
          </div>
        </Flex>
        {status.lastChecked && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            Last checked: {formatLastChecked(status.lastChecked)}
          </Text>
        )}
      </Flex>

      {/* Components */}
      <div>
        <Text strong style={{ display: 'block', marginBottom: 12 }}>
          Components
        </Text>
        <Flex vertical>
          {status.components.map((component, index) => (
            <div key={component.name}>
              {index > 0 && <Divider style={{ margin: '12px 0' }} />}
              <Flex justify="space-between" align="center">
                <Flex align="center" gap={8}>
                  <StatusIndicator status={component.status} />
                  <Text>{component.name}</Text>
                </Flex>
                <Flex align="center" gap={12}>
                  {component.message && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {component.message}
                    </Text>
                  )}
                  <Text
                    type="secondary"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {formatLatency(component.latency)}
                  </Text>
                </Flex>
              </Flex>
            </div>
          ))}
        </Flex>
      </div>
    </Card>
  );
}
