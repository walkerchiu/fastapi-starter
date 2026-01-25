/**
 * Common types for Zustand stores.
 */

/**
 * Notification severity levels.
 */
export type NotificationSeverity = 'success' | 'error' | 'warning' | 'info';

/**
 * Notification item.
 */
export interface Notification {
  id: string;
  message: string;
  severity: NotificationSeverity;
  title?: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Modal configuration.
 */
export interface ModalConfig {
  id: string;
  component: React.ComponentType<ModalComponentProps>;
  props?: Record<string, unknown>;
  options?: {
    closeOnOverlayClick?: boolean;
    closeOnEscape?: boolean;
    preventScroll?: boolean;
  };
}

/**
 * Props passed to modal components.
 */
export interface ModalComponentProps {
  onClose: () => void;
  isOpen: boolean;
}

/**
 * User preferences that persist across sessions.
 */
export interface UserPreferences {
  // Layout
  sidebarCollapsed: boolean;
  sidebarWidth?: number;

  // Table/List preferences
  defaultPageSize: number;
  defaultSortOrder?: 'asc' | 'desc';

  // Dashboard
  dashboardLayout?: 'grid' | 'list';

  // Display preferences
  compactMode: boolean;
  animations: boolean;

  // Accessibility
  reducedMotion?: boolean;
  highContrast?: boolean;

  // Sound
  soundEnabled: boolean;

  // Auto refresh
  autoRefreshInterval: number;

  // Locale (separate from i18n, for user-specific overrides)
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  numberFormat?: string;
}

/**
 * Real-time data point for time-series data.
 * Useful for SCADA, stock tickers, IoT dashboards.
 */
export interface DataPoint {
  id?: string;
  timestamp: number;
  value: number;
  metadata?: Record<string, unknown>;
}

/**
 * Real-time channel subscription.
 */
export interface RealtimeChannel {
  id: string;
  name: string;
  status:
    | 'connecting'
    | 'connected'
    | 'disconnected'
    | 'reconnecting'
    | 'error';
  lastUpdate: number | null;
  lastUpdated?: number | null;
  data: DataPoint[];
  maxDataPoints: number;
  error?: string;
  errorCount?: number;
}

/**
 * Connection status for WebSocket/SSE.
 */
export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error';

/**
 * Helper type for creating action names in DevTools.
 */
export type ActionName<T extends string> = `${T}/${string}`;

/**
 * Helper to generate unique IDs for notifications, modals, etc.
 */
export function generateId(prefix = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
}
