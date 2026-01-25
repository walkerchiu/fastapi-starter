import { Skeleton } from '../ui/Skeleton';

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
  healthy: 'bg-green-500',
  degraded: 'bg-yellow-500',
  unhealthy: 'bg-red-500',
  unknown: 'bg-gray-400',
};

const statusTextColors = {
  healthy: 'text-green-700 dark:text-green-400',
  degraded: 'text-yellow-700 dark:text-yellow-400',
  unhealthy: 'text-red-700 dark:text-red-400',
  unknown: 'text-gray-700 dark:text-gray-400',
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
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${statusColors[status]}`}
    />
  );
}

function HealthStatusSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
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
      <div
        className={`rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800 ${className}`}
      >
        <HealthStatusSkeleton />
      </div>
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
    <div
      className={`rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800 ${className}`}
    >
      {/* Overall Status */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              status.overall === 'healthy'
                ? 'bg-green-100 dark:bg-green-900/50'
                : status.overall === 'degraded'
                  ? 'bg-yellow-100 dark:bg-yellow-900/50'
                  : 'bg-red-100 dark:bg-red-900/50'
            }`}
          >
            <StatusIndicator status={status.overall} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              System Status
            </p>
            <p
              className={`text-lg font-semibold ${statusTextColors[status.overall]}`}
            >
              {statusLabels[status.overall]}
            </p>
          </div>
        </div>
        {status.lastChecked && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Last checked: {formatLastChecked(status.lastChecked)}
          </p>
        )}
      </div>

      {/* Components */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Components
        </p>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {status.components.map((component) => (
            <div
              key={component.name}
              className="flex items-center justify-between py-2"
            >
              <div className="flex items-center gap-2">
                <StatusIndicator status={component.status} />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {component.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {component.message && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {component.message}
                  </span>
                )}
                <span className="text-sm tabular-nums text-gray-500 dark:text-gray-400">
                  {formatLatency(component.latency)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
