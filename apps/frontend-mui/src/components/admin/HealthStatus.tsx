import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Skeleton,
} from '@mui/material';

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

const statusColors = {
  healthy: 'success.main',
  degraded: 'warning.main',
  unhealthy: 'error.main',
  unknown: 'text.disabled',
};

const statusBgColors = {
  healthy: 'success.light',
  degraded: 'warning.light',
  unhealthy: 'error.light',
  unknown: 'action.hover',
};

const statusLabels = {
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
  return (
    <Box
      sx={{
        width: 10,
        height: 10,
        borderRadius: '50%',
        bgcolor: statusColors[status],
      }}
    />
  );
}

function HealthStatusSkeleton() {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Box>
          <Skeleton width={80} height={16} />
          <Skeleton width={60} height={24} sx={{ mt: 0.5 }} />
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Box
            key={i}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Skeleton width={100} height={16} />
            <Skeleton width={60} height={16} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export function HealthStatus({ status, loading = false }: HealthStatusProps) {
  if (loading) {
    return (
      <Card>
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
    <Card>
      <CardContent>
        {/* Overall Status */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: statusBgColors[status.overall],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <StatusIndicator status={status.overall} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                System Status
              </Typography>
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ color: statusColors[status.overall] }}
              >
                {statusLabels[status.overall]}
              </Typography>
            </Box>
          </Box>
          {status.lastChecked && (
            <Typography variant="caption" color="text.secondary">
              Last checked: {formatLastChecked(status.lastChecked)}
            </Typography>
          )}
        </Box>

        {/* Components */}
        <Box>
          <Typography
            variant="body2"
            fontWeight="medium"
            color="text.secondary"
            sx={{ mb: 1.5 }}
          >
            Components
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {status.components.map((component, index) => (
              <Box key={component.name}>
                {index > 0 && <Divider />}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 1.5,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StatusIndicator status={component.status} />
                    <Typography variant="body2">{component.name}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {component.message && (
                      <Typography variant="caption" color="text.secondary">
                        {component.message}
                      </Typography>
                    )}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {formatLatency(component.latency)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
