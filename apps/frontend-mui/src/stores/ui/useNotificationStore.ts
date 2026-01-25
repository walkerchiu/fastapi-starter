import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { generateId, type Notification } from '../types';

/**
 * Maximum number of notifications to keep in the store.
 */
const MAX_NOTIFICATIONS = 5;

/**
 * Default duration for auto-dismissing notifications (ms).
 */
const DEFAULT_DURATION = 5000;

interface NotificationState {
  notifications: Notification[];
}

interface NotificationActions {
  /**
   * Add a new notification.
   */
  addNotification: (
    notification: Omit<Notification, 'id'> & { id?: string },
  ) => string;

  /**
   * Remove a notification by ID.
   */
  removeNotification: (id: string) => void;

  /**
   * Remove all notifications.
   */
  clearNotifications: () => void;

  /**
   * Convenience method for success notifications.
   */
  success: (message: string, options?: Partial<Notification>) => string;

  /**
   * Convenience method for error notifications.
   */
  error: (message: string, options?: Partial<Notification>) => string;

  /**
   * Convenience method for warning notifications.
   */
  warning: (message: string, options?: Partial<Notification>) => string;

  /**
   * Convenience method for info notifications.
   */
  info: (message: string, options?: Partial<Notification>) => string;
}

export type NotificationStore = NotificationState & NotificationActions;

/**
 * Global notification store for managing toast/snackbar notifications.
 *
 * @example
 * // Basic usage
 * const { success, error } = useNotificationStore();
 * success('Profile updated successfully');
 * error('Failed to save changes');
 *
 * @example
 * // With options
 * const { addNotification } = useNotificationStore();
 * addNotification({
 *   message: 'New order received',
 *   severity: 'info',
 *   title: 'Order #1234',
 *   action: {
 *     label: 'View',
 *     onClick: () => router.push('/orders/1234'),
 *   },
 * });
 *
 * @example
 * // Outside React components
 * useNotificationStore.getState().success('Background task completed');
 */
export const useNotificationStore = create<NotificationStore>()(
  devtools(
    (set, get) => ({
      notifications: [],

      addNotification: (notification) => {
        const id = notification.id || generateId('notif');
        const newNotification: Notification = {
          id,
          severity: notification.severity,
          message: notification.message,
          title: notification.title,
          duration: notification.duration ?? DEFAULT_DURATION,
          dismissible: notification.dismissible ?? true,
          action: notification.action,
        };

        set(
          (state) => {
            const notifications = [newNotification, ...state.notifications];
            // Keep only the most recent notifications
            if (notifications.length > MAX_NOTIFICATIONS) {
              notifications.pop();
            }
            return { notifications };
          },
          false,
          'notification/add',
        );

        // Auto-dismiss if duration is set
        if (newNotification.duration && newNotification.duration > 0) {
          setTimeout(() => {
            get().removeNotification(id);
          }, newNotification.duration);
        }

        return id;
      },

      removeNotification: (id) => {
        set(
          (state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          }),
          false,
          'notification/remove',
        );
      },

      clearNotifications: () => {
        set({ notifications: [] }, false, 'notification/clear');
      },

      success: (message, options = {}) => {
        return get().addNotification({
          message,
          severity: 'success',
          ...options,
        });
      },

      error: (message, options = {}) => {
        return get().addNotification({
          message,
          severity: 'error',
          duration: options.duration ?? 0, // Errors don't auto-dismiss by default
          ...options,
        });
      },

      warning: (message, options = {}) => {
        return get().addNotification({
          message,
          severity: 'warning',
          ...options,
        });
      },

      info: (message, options = {}) => {
        return get().addNotification({
          message,
          severity: 'info',
          ...options,
        });
      },
    }),
    {
      name: 'NotificationStore',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
);

/**
 * Selector hooks for better performance.
 */
export const useNotifications = () =>
  useNotificationStore((state) => state.notifications);

export const useNotificationActions = () =>
  useNotificationStore((state) => ({
    addNotification: state.addNotification,
    removeNotification: state.removeNotification,
    clearNotifications: state.clearNotifications,
    success: state.success,
    error: state.error,
    warning: state.warning,
    info: state.info,
  }));
