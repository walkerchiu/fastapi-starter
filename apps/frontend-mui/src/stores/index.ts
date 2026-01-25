/**
 * Zustand State Management
 *
 * This module provides global state management using Zustand.
 * Each store is organized by domain and includes:
 * - DevTools integration for time-travel debugging
 * - Persist middleware for localStorage persistence (where applicable)
 * - Selector hooks for optimized re-renders
 *
 * Architecture:
 * - UI stores: Transient UI state (notifications, modals, sidebar)
 * - Preferences: User preferences with persistence
 * - Examples: Reference implementations for specific use cases
 *
 * Usage with TanStack Query:
 * - Use Zustand for client-only state (UI, preferences, local data)
 * - Use TanStack Query for server state (API data, caching)
 * - They complement each other well
 *
 * @example
 * ```tsx
 * import { useNotificationStore, usePreferencesStore } from '@/stores';
 *
 * function MyComponent() {
 *   const { success, error } = useNotificationStore();
 *   const { preferences } = usePreferencesStore();
 *
 *   const handleSave = async () => {
 *     try {
 *       await saveData();
 *       success('Data saved successfully!');
 *     } catch (err) {
 *       error('Failed to save data');
 *     }
 *   };
 *
 *   return <button onClick={handleSave}>Save</button>;
 * }
 * ```
 */

// Types
export type {
  NotificationSeverity,
  Notification,
  ModalConfig,
  ModalComponentProps,
  UserPreferences,
  ConnectionStatus,
  DataPoint,
  RealtimeChannel,
} from './types';

export { generateId } from './types';

// Middleware utilities
export { withDevtools, withPersist, withSelectors } from './middleware';

// UI Stores
export {
  // Notification store
  useNotificationStore,
  useNotifications,
  useNotificationActions,
  type NotificationStore,
  // Modal store
  useModalStore,
  useModals,
  useActiveModalId,
  useModalActions,
  type ModalStore,
  // Sidebar store
  useSidebarStore,
  useSidebarCollapsed,
  useSidebarMobileOpen,
  useSidebarWidth,
  useSidebarExpandedGroups,
  type SidebarStore,
} from './ui';

// Preferences Store
export {
  usePreferencesStore,
  usePreference,
  useCompactMode,
  useAnimationsEnabled,
  usePageSize,
  useAutoRefreshInterval,
  PAGE_SIZE_OPTIONS,
  DATE_FORMAT_OPTIONS,
  TIME_FORMAT_OPTIONS,
  AUTO_REFRESH_OPTIONS,
} from './preferences';

// Example Stores (for reference implementations)
export {
  useRealtimeStore,
  useChannel,
  useChannelData,
  useChannelStatus,
  useGlobalStatus,
  useLatestValue,
} from './examples';
