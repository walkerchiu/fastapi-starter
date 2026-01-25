import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

import type { ConnectionStatus, DataPoint, RealtimeChannel } from '../types';
import { generateId } from '../types';

/**
 * Maximum number of data points to keep per channel
 * This prevents memory issues with long-running applications
 */
const MAX_DATA_POINTS = 1000;

/**
 * Default reconnect interval in milliseconds
 */
const DEFAULT_RECONNECT_INTERVAL = 5000;

interface RealtimeState {
  /**
   * All active channels
   */
  channels: Map<string, RealtimeChannel>;

  /**
   * Global connection status
   */
  globalStatus: ConnectionStatus;

  /**
   * Last error message
   */
  lastError: string | null;

  /**
   * Whether auto-reconnect is enabled
   */
  autoReconnect: boolean;

  /**
   * Reconnect interval in milliseconds
   */
  reconnectInterval: number;
}

interface RealtimeActions {
  /**
   * Subscribe to a new channel
   */
  subscribe: (channelId: string, config?: Partial<RealtimeChannel>) => void;

  /**
   * Unsubscribe from a channel
   */
  unsubscribe: (channelId: string) => void;

  /**
   * Update channel status
   */
  setChannelStatus: (channelId: string, status: ConnectionStatus) => void;

  /**
   * Add data point to a channel
   */
  addDataPoint: (channelId: string, data: Omit<DataPoint, 'id'>) => void;

  /**
   * Add multiple data points to a channel (batch update)
   */
  addDataPoints: (channelId: string, data: Omit<DataPoint, 'id'>[]) => void;

  /**
   * Clear all data from a channel
   */
  clearChannelData: (channelId: string) => void;

  /**
   * Set global connection status
   */
  setGlobalStatus: (status: ConnectionStatus) => void;

  /**
   * Set error message
   */
  setError: (error: string | null) => void;

  /**
   * Toggle auto-reconnect
   */
  toggleAutoReconnect: () => void;

  /**
   * Set reconnect interval
   */
  setReconnectInterval: (interval: number) => void;

  /**
   * Reset store to initial state
   */
  reset: () => void;

  /**
   * Get latest data point from a channel
   */
  getLatestDataPoint: (channelId: string) => DataPoint | null;

  /**
   * Get channel by ID
   */
  getChannel: (channelId: string) => RealtimeChannel | undefined;
}

type RealtimeStore = RealtimeState & RealtimeActions;

const initialState: RealtimeState = {
  channels: new Map(),
  globalStatus: 'disconnected',
  lastError: null,
  autoReconnect: true,
  reconnectInterval: DEFAULT_RECONNECT_INTERVAL,
};

/**
 * Real-time Data Store
 *
 * Manages real-time data streams for SCADA, stock tickers, IoT sensors, etc.
 * Supports multiple channels with independent connection states.
 *
 * Features:
 * - Multiple channel support
 * - Connection state management
 * - Data point buffering with automatic cleanup
 * - Auto-reconnect capability
 * - Batch data updates for performance
 *
 * @example
 * ```tsx
 * import { useRealtimeStore } from '@/stores/examples';
 *
 * // Subscribe to a stock ticker
 * function StockTicker({ symbol }: { symbol: string }) {
 *   const { subscribe, unsubscribe, channels } = useRealtimeStore();
 *
 *   useEffect(() => {
 *     subscribe(symbol, { maxDataPoints: 100 });
 *     return () => unsubscribe(symbol);
 *   }, [symbol]);
 *
 *   const channel = channels.get(symbol);
 *   const latestPrice = channel?.data[channel.data.length - 1]?.value;
 *
 *   return (
 *     <div>
 *       <span>{symbol}</span>
 *       <span>{latestPrice?.toFixed(2)}</span>
 *       <span className={channel?.status === 'connected' ? 'text-green-500' : 'text-red-500'}>
 *         {channel?.status}
 *       </span>
 *     </div>
 *   );
 * }
 *
 * // SCADA sensor monitoring
 * function SensorMonitor({ sensorId }: { sensorId: string }) {
 *   const { subscribe, addDataPoint, channels } = useRealtimeStore();
 *
 *   useEffect(() => {
 *     subscribe(`sensor-${sensorId}`);
 *
 *     // Simulate WebSocket connection
 *     const ws = new WebSocket(`wss://api.example.com/sensors/${sensorId}`);
 *     ws.onmessage = (event) => {
 *       const data = JSON.parse(event.data);
 *       addDataPoint(`sensor-${sensorId}`, {
 *         timestamp: Date.now(),
 *         value: data.reading,
 *         metadata: { unit: data.unit, quality: data.quality },
 *       });
 *     };
 *
 *     return () => ws.close();
 *   }, [sensorId]);
 *
 *   const channel = channels.get(`sensor-${sensorId}`);
 *   return <SensorChart data={channel?.data ?? []} />;
 * }
 * ```
 */
export const useRealtimeStore = create<RealtimeStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...initialState,

      subscribe: (channelId, config = {}) => {
        set(
          (state) => {
            const channels = new Map(state.channels);
            if (!channels.has(channelId)) {
              channels.set(channelId, {
                id: channelId,
                name: config.name ?? channelId,
                status: 'connecting',
                data: [],
                lastUpdate: null,
                lastUpdated: null,
                errorCount: 0,
                maxDataPoints: config.maxDataPoints ?? MAX_DATA_POINTS,
                ...config,
              });
            }
            return { channels };
          },
          false,
          { type: 'subscribe', channelId },
        );
      },

      unsubscribe: (channelId) => {
        set(
          (state) => {
            const channels = new Map(state.channels);
            channels.delete(channelId);
            return { channels };
          },
          false,
          { type: 'unsubscribe', channelId },
        );
      },

      setChannelStatus: (channelId, status) => {
        set(
          (state) => {
            const channels = new Map(state.channels);
            const channel = channels.get(channelId);
            if (channel) {
              channels.set(channelId, {
                ...channel,
                status,
                errorCount:
                  status === 'error'
                    ? (channel.errorCount ?? 0) + 1
                    : (channel.errorCount ?? 0),
              });
            }
            return { channels };
          },
          false,
          { type: 'setChannelStatus', channelId, status },
        );
      },

      addDataPoint: (channelId, data) => {
        set(
          (state) => {
            const channels = new Map(state.channels);
            const channel = channels.get(channelId);
            if (channel) {
              const newDataPoint: DataPoint = {
                ...data,
                id: generateId('dp'),
              };

              // Keep only the last maxDataPoints
              const maxPoints = channel.maxDataPoints ?? MAX_DATA_POINTS;
              const newData = [...channel.data, newDataPoint].slice(-maxPoints);

              channels.set(channelId, {
                ...channel,
                data: newData,
                lastUpdated: Date.now(),
                status: 'connected',
              });
            }
            return { channels };
          },
          false,
          { type: 'addDataPoint', channelId },
        );
      },

      addDataPoints: (channelId, dataPoints) => {
        set(
          (state) => {
            const channels = new Map(state.channels);
            const channel = channels.get(channelId);
            if (channel) {
              const newDataPoints: DataPoint[] = dataPoints.map((data) => ({
                ...data,
                id: generateId('dp'),
              }));

              // Keep only the last maxDataPoints
              const maxPoints = channel.maxDataPoints ?? MAX_DATA_POINTS;
              const newData = [...channel.data, ...newDataPoints].slice(
                -maxPoints,
              );

              channels.set(channelId, {
                ...channel,
                data: newData,
                lastUpdated: Date.now(),
                status: 'connected',
              });
            }
            return { channels };
          },
          false,
          { type: 'addDataPoints', channelId, count: dataPoints.length },
        );
      },

      clearChannelData: (channelId) => {
        set(
          (state) => {
            const channels = new Map(state.channels);
            const channel = channels.get(channelId);
            if (channel) {
              channels.set(channelId, {
                ...channel,
                data: [],
                lastUpdated: null,
              });
            }
            return { channels };
          },
          false,
          { type: 'clearChannelData', channelId },
        );
      },

      setGlobalStatus: (status) => {
        set({ globalStatus: status }, false, {
          type: 'setGlobalStatus',
          status,
        });
      },

      setError: (error) => {
        set({ lastError: error }, false, { type: 'setError', error });
      },

      toggleAutoReconnect: () => {
        set((state) => ({ autoReconnect: !state.autoReconnect }), false, {
          type: 'toggleAutoReconnect',
        });
      },

      setReconnectInterval: (interval) => {
        set({ reconnectInterval: interval }, false, {
          type: 'setReconnectInterval',
          interval,
        });
      },

      reset: () => {
        set(initialState, false, { type: 'reset' });
      },

      getLatestDataPoint: (channelId) => {
        const channel = get().channels.get(channelId);
        if (!channel || channel.data.length === 0) return null;
        return channel.data[channel.data.length - 1] ?? null;
      },

      getChannel: (channelId) => {
        return get().channels.get(channelId);
      },
    })),
    {
      name: 'RealtimeStore',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
);

// Selector hooks for better performance
export const useChannel = (channelId: string) =>
  useRealtimeStore((state) => state.channels.get(channelId));

export const useChannelData = (channelId: string) =>
  useRealtimeStore((state) => state.channels.get(channelId)?.data ?? []);

export const useChannelStatus = (channelId: string) =>
  useRealtimeStore(
    (state) => state.channels.get(channelId)?.status ?? 'disconnected',
  );

export const useGlobalStatus = () =>
  useRealtimeStore((state) => state.globalStatus);

export const useLatestValue = (channelId: string) =>
  useRealtimeStore((state) => {
    const channel = state.channels.get(channelId);
    if (!channel || channel.data.length === 0) return null;
    const latestDataPoint = channel.data[channel.data.length - 1];
    return latestDataPoint?.value ?? null;
  });
