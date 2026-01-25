import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';

import { useRealtimeStore } from '../examples/useRealtimeStore';

describe('useRealtimeStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    const { getState } = useRealtimeStore;
    act(() => {
      getState().reset();
    });
  });

  describe('subscribe', () => {
    it('should create a new channel', () => {
      const { getState } = useRealtimeStore;

      act(() => {
        getState().subscribe('test-channel');
      });

      const channel = getState().channels.get('test-channel');
      expect(channel).toBeDefined();
      expect(channel?.id).toBe('test-channel');
      expect(channel?.status).toBe('connecting');
      expect(channel?.data).toEqual([]);
    });

    it('should not duplicate existing channels', () => {
      const { getState } = useRealtimeStore;

      act(() => {
        getState().subscribe('test-channel');
        getState().setChannelStatus('test-channel', 'connected');
        getState().subscribe('test-channel');
      });

      const channel = getState().channels.get('test-channel');
      expect(channel?.status).toBe('connected');
    });

    it('should accept custom config', () => {
      const { getState } = useRealtimeStore;

      act(() => {
        getState().subscribe('test-channel', { maxDataPoints: 500 });
      });

      const channel = getState().channels.get('test-channel');
      expect(channel?.maxDataPoints).toBe(500);
    });
  });

  describe('unsubscribe', () => {
    it('should remove a channel', () => {
      const { getState } = useRealtimeStore;

      act(() => {
        getState().subscribe('test-channel');
      });

      expect(getState().channels.has('test-channel')).toBe(true);

      act(() => {
        getState().unsubscribe('test-channel');
      });

      expect(getState().channels.has('test-channel')).toBe(false);
    });
  });

  describe('setChannelStatus', () => {
    it('should update channel status', () => {
      const { getState } = useRealtimeStore;

      act(() => {
        getState().subscribe('test-channel');
      });

      act(() => {
        getState().setChannelStatus('test-channel', 'connected');
      });

      expect(getState().channels.get('test-channel')?.status).toBe('connected');
    });

    it('should increment error count on error status', () => {
      const { getState } = useRealtimeStore;

      act(() => {
        getState().subscribe('test-channel');
      });

      act(() => {
        getState().setChannelStatus('test-channel', 'error');
        getState().setChannelStatus('test-channel', 'error');
      });

      expect(getState().channels.get('test-channel')?.errorCount).toBe(2);
    });
  });

  describe('addDataPoint', () => {
    it('should add a data point to a channel', () => {
      const { getState } = useRealtimeStore;

      act(() => {
        getState().subscribe('test-channel');
      });

      act(() => {
        getState().addDataPoint('test-channel', {
          timestamp: 1000,
          value: 42,
        });
      });

      const channel = getState().channels.get('test-channel');
      expect(channel?.data).toHaveLength(1);
      expect(channel?.data[0]?.value).toBe(42);
      expect(channel?.data[0]?.timestamp).toBe(1000);
      expect(channel?.data[0]?.id).toBeDefined();
    });

    it('should update lastUpdated timestamp', () => {
      const { getState } = useRealtimeStore;

      act(() => {
        getState().subscribe('test-channel');
      });

      act(() => {
        getState().addDataPoint('test-channel', {
          timestamp: Date.now(),
          value: 42,
        });
      });

      expect(
        getState().channels.get('test-channel')?.lastUpdated,
      ).toBeDefined();
    });

    it('should set status to connected', () => {
      const { getState } = useRealtimeStore;

      act(() => {
        getState().subscribe('test-channel');
      });

      expect(getState().channels.get('test-channel')?.status).toBe(
        'connecting',
      );

      act(() => {
        getState().addDataPoint('test-channel', {
          timestamp: Date.now(),
          value: 42,
        });
      });

      expect(getState().channels.get('test-channel')?.status).toBe('connected');
    });

    it('should limit data points to maxDataPoints', () => {
      const { getState } = useRealtimeStore;

      act(() => {
        getState().subscribe('test-channel', { maxDataPoints: 3 });
      });

      act(() => {
        for (let i = 0; i < 5; i++) {
          getState().addDataPoint('test-channel', {
            timestamp: i * 1000,
            value: i,
          });
        }
      });

      const channel = getState().channels.get('test-channel');
      expect(channel?.data).toHaveLength(3);
      expect(channel?.data[0]?.value).toBe(2);
      expect(channel?.data[2]?.value).toBe(4);
    });
  });

  describe('addDataPoints', () => {
    it('should add multiple data points at once', () => {
      const { getState } = useRealtimeStore;

      act(() => {
        getState().subscribe('test-channel');
      });

      act(() => {
        getState().addDataPoints('test-channel', [
          { timestamp: 1000, value: 1 },
          { timestamp: 2000, value: 2 },
          { timestamp: 3000, value: 3 },
        ]);
      });

      const channel = getState().channels.get('test-channel');
      expect(channel?.data).toHaveLength(3);
    });

    it('should limit data points to maxDataPoints for batch', () => {
      const { getState } = useRealtimeStore;

      act(() => {
        getState().subscribe('test-channel', { maxDataPoints: 2 });
      });

      act(() => {
        getState().addDataPoints('test-channel', [
          { timestamp: 1000, value: 1 },
          { timestamp: 2000, value: 2 },
          { timestamp: 3000, value: 3 },
          { timestamp: 4000, value: 4 },
        ]);
      });

      const channel = getState().channels.get('test-channel');
      expect(channel?.data).toHaveLength(2);
      expect(channel?.data[0]?.value).toBe(3);
      expect(channel?.data[1]?.value).toBe(4);
    });
  });

  describe('clearChannelData', () => {
    it('should clear all data from a channel', () => {
      const { getState } = useRealtimeStore;

      act(() => {
        getState().subscribe('test-channel');
        getState().addDataPoint('test-channel', { timestamp: 1000, value: 42 });
      });

      expect(getState().channels.get('test-channel')?.data).toHaveLength(1);

      act(() => {
        getState().clearChannelData('test-channel');
      });

      const channel = getState().channels.get('test-channel');
      expect(channel?.data).toHaveLength(0);
      expect(channel?.lastUpdated).toBeNull();
    });
  });

  describe('setGlobalStatus', () => {
    it('should set global connection status', () => {
      const { getState } = useRealtimeStore;

      act(() => {
        getState().setGlobalStatus('connected');
      });

      expect(getState().globalStatus).toBe('connected');
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      const { getState } = useRealtimeStore;

      act(() => {
        getState().setError('Connection failed');
      });

      expect(getState().lastError).toBe('Connection failed');
    });

    it('should clear error message with null', () => {
      const { getState } = useRealtimeStore;

      act(() => {
        getState().setError('Connection failed');
        getState().setError(null);
      });

      expect(getState().lastError).toBeNull();
    });
  });

  describe('toggleAutoReconnect', () => {
    it('should toggle auto reconnect', () => {
      const { getState } = useRealtimeStore;

      expect(getState().autoReconnect).toBe(true);

      act(() => {
        getState().toggleAutoReconnect();
      });

      expect(getState().autoReconnect).toBe(false);
    });
  });

  describe('setReconnectInterval', () => {
    it('should set reconnect interval', () => {
      const { getState } = useRealtimeStore;

      act(() => {
        getState().setReconnectInterval(10000);
      });

      expect(getState().reconnectInterval).toBe(10000);
    });
  });

  describe('getLatestDataPoint', () => {
    it('should return the latest data point', () => {
      const { getState } = useRealtimeStore;

      act(() => {
        getState().subscribe('test-channel');
        getState().addDataPoint('test-channel', { timestamp: 1000, value: 1 });
        getState().addDataPoint('test-channel', { timestamp: 2000, value: 2 });
        getState().addDataPoint('test-channel', { timestamp: 3000, value: 3 });
      });

      const latest = getState().getLatestDataPoint('test-channel');
      expect(latest?.value).toBe(3);
    });

    it('should return null for non-existent channel', () => {
      const { getState } = useRealtimeStore;

      const latest = getState().getLatestDataPoint('non-existent');
      expect(latest).toBeNull();
    });

    it('should return null for empty channel', () => {
      const { getState } = useRealtimeStore;

      act(() => {
        getState().subscribe('test-channel');
      });

      const latest = getState().getLatestDataPoint('test-channel');
      expect(latest).toBeNull();
    });
  });

  describe('getChannel', () => {
    it('should return channel by ID', () => {
      const { getState } = useRealtimeStore;

      act(() => {
        getState().subscribe('test-channel');
      });

      const channel = getState().getChannel('test-channel');
      expect(channel?.id).toBe('test-channel');
    });

    it('should return undefined for non-existent channel', () => {
      const { getState } = useRealtimeStore;

      const channel = getState().getChannel('non-existent');
      expect(channel).toBeUndefined();
    });
  });

  describe('reset', () => {
    it('should reset store to initial state', () => {
      const { getState } = useRealtimeStore;

      act(() => {
        getState().subscribe('test-channel');
        getState().setGlobalStatus('connected');
        getState().setError('Some error');
        getState().toggleAutoReconnect();
      });

      act(() => {
        getState().reset();
      });

      expect(getState().channels.size).toBe(0);
      expect(getState().globalStatus).toBe('disconnected');
      expect(getState().lastError).toBeNull();
      expect(getState().autoReconnect).toBe(true);
    });
  });
});
