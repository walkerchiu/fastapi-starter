import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { act } from '@testing-library/react';

import { useNotificationStore } from '../ui/useNotificationStore';

describe('useNotificationStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Reset the store before each test
    const { getState } = useNotificationStore;
    act(() => {
      // Clear all notifications
      const notifications = [...getState().notifications];
      notifications.forEach((n) => {
        getState().removeNotification(n.id);
      });
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('addNotification', () => {
    it('should add a notification with default values', () => {
      const { getState } = useNotificationStore;

      act(() => {
        getState().addNotification({
          message: 'Test message',
          severity: 'info',
        });
      });

      const notifications = getState().notifications;
      expect(notifications).toHaveLength(1);
      expect(notifications[0]!.message).toBe('Test message');
      expect(notifications[0]!.severity).toBe('info');
      expect(notifications[0]!.duration).toBe(5000);
    });

    it('should add a notification with custom duration', () => {
      const { getState } = useNotificationStore;

      act(() => {
        getState().addNotification({
          message: 'Custom duration',
          severity: 'warning',
          duration: 10000,
        });
      });

      const notifications = getState().notifications;
      expect(notifications[0]!.duration).toBe(10000);
    });

    it('should generate unique IDs for notifications', () => {
      const { getState } = useNotificationStore;

      act(() => {
        getState().addNotification({
          message: 'First',
          severity: 'info',
          duration: 0,
        });
        getState().addNotification({
          message: 'Second',
          severity: 'info',
          duration: 0,
        });
      });

      const notifications = getState().notifications;
      expect(notifications[0]!.id).not.toBe(notifications[1]!.id);
    });
  });

  describe('removeNotification', () => {
    it('should remove a notification by ID', () => {
      const { getState } = useNotificationStore;

      act(() => {
        getState().addNotification({
          message: 'To remove',
          severity: 'info',
          duration: 0,
        });
      });

      const id = getState().notifications[0]!.id;

      act(() => {
        getState().removeNotification(id);
      });

      expect(getState().notifications).toHaveLength(0);
    });

    it('should not affect other notifications when removing one', () => {
      const { getState } = useNotificationStore;

      act(() => {
        // Use duration: 0 to prevent auto-dismiss
        // Note: new notifications are added at the beginning (newest first)
        getState().addNotification({
          message: 'First',
          severity: 'info',
          duration: 0,
        });
        getState().addNotification({
          message: 'Second',
          severity: 'info',
          duration: 0,
        });
      });

      // After adding: notifications = [Second, First] (newest first)
      // Find the 'Second' notification (newest, at index 0)
      const secondNotification = getState().notifications.find(
        (n) => n.message === 'Second',
      );

      act(() => {
        getState().removeNotification(secondNotification!.id);
      });

      const notifications = getState().notifications;
      expect(notifications).toHaveLength(1);
      expect(notifications[0]!.message).toBe('First');
    });
  });

  describe('convenience methods', () => {
    it('should add success notification', () => {
      const { getState } = useNotificationStore;

      act(() => {
        getState().success('Success message', { duration: 0 });
      });

      const notification = getState().notifications[0]!;
      expect(notification.message).toBe('Success message');
      expect(notification.severity).toBe('success');
    });

    it('should add error notification', () => {
      const { getState } = useNotificationStore;

      act(() => {
        getState().error('Error message', { duration: 0 });
      });

      const notification = getState().notifications[0]!;
      expect(notification.message).toBe('Error message');
      expect(notification.severity).toBe('error');
    });

    it('should add warning notification', () => {
      const { getState } = useNotificationStore;

      act(() => {
        getState().warning('Warning message', { duration: 0 });
      });

      const notification = getState().notifications[0]!;
      expect(notification.message).toBe('Warning message');
      expect(notification.severity).toBe('warning');
    });

    it('should add info notification', () => {
      const { getState } = useNotificationStore;

      act(() => {
        getState().info('Info message', { duration: 0 });
      });

      const notification = getState().notifications[0]!;
      expect(notification.message).toBe('Info message');
      expect(notification.severity).toBe('info');
    });

    it('should accept options in convenience methods', () => {
      const { getState } = useNotificationStore;

      act(() => {
        getState().success('With options', {
          duration: 3000,
          dismissible: false,
        });
      });

      const notification = getState().notifications[0]!;
      expect(notification.duration).toBe(3000);
      expect(notification.dismissible).toBe(false);
    });
  });

  describe('auto-dismiss', () => {
    it('should auto-dismiss notification after duration', () => {
      const { getState } = useNotificationStore;

      act(() => {
        getState().addNotification({
          message: 'Auto dismiss',
          severity: 'info',
          duration: 5000,
        });
      });

      expect(getState().notifications).toHaveLength(1);

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(getState().notifications).toHaveLength(0);
    });

    it('should not auto-dismiss when duration is 0', () => {
      const { getState } = useNotificationStore;

      act(() => {
        getState().addNotification({
          message: 'No auto dismiss',
          severity: 'info',
          duration: 0,
        });
      });

      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(getState().notifications).toHaveLength(1);
    });
  });
});
