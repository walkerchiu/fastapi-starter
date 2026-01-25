import { type ReactNode } from 'react';
import { Avatar } from '../ui/Avatar';
import { Skeleton } from '../ui/Skeleton';

export interface ActivityItem {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  target?: string;
  timestamp: Date | string;
  icon?: ReactNode;
}

export interface ActivityFeedProps {
  items: ActivityItem[];
  loading?: boolean;
  emptyText?: string;
  className?: string;
}

function formatTimestamp(timestamp: Date | string): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

function ActivityItemComponent({ item }: { item: ActivityItem }) {
  return (
    <div className="flex gap-3 py-3">
      <div className="shrink-0">
        {item.icon ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            {item.icon}
          </div>
        ) : (
          <Avatar
            src={item.user.avatar}
            alt={item.user.name}
            name={item.user.name}
            size="sm"
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-900 dark:text-gray-100">
          <span className="font-medium">{item.user.name}</span>{' '}
          <span className="text-gray-600 dark:text-gray-400">
            {item.action}
          </span>
          {item.target && (
            <>
              {' '}
              <span className="font-medium">{item.target}</span>
            </>
          )}
        </p>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-500">
          {formatTimestamp(item.timestamp)}
        </p>
      </div>
    </div>
  );
}

function ActivityItemSkeleton() {
  return (
    <div className="flex gap-3 py-3">
      <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="mt-1 h-3 w-16" />
      </div>
    </div>
  );
}

export function ActivityFeed({
  items,
  loading = false,
  emptyText = 'No recent activity',
  className = '',
}: ActivityFeedProps) {
  if (loading) {
    return (
      <div
        className={`divide-y divide-gray-100 dark:divide-gray-800 ${className}`}
      >
        {Array.from({ length: 5 }).map((_, index) => (
          <ActivityItemSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        className={`py-8 text-center text-sm text-gray-500 dark:text-gray-400 ${className}`}
      >
        {emptyText}
      </div>
    );
  }

  return (
    <div
      className={`divide-y divide-gray-100 dark:divide-gray-800 ${className}`}
    >
      {items.map((item) => (
        <ActivityItemComponent key={item.id} item={item} />
      ))}
    </div>
  );
}
