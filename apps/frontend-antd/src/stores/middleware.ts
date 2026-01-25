import type { StateCreator } from 'zustand';

/**
 * Logger middleware for development debugging
 */
export const logger =
  <T extends object>(name: string) =>
  (config: StateCreator<T>): StateCreator<T> =>
  (set, get, api) =>
    config(
      (args) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[${name}] applying`, args);
        }
        set(args);
        if (process.env.NODE_ENV === 'development') {
          console.log(`[${name}] new state`, get());
        }
      },
      get,
      api,
    );

/**
 * Immer-like state updater middleware
 */
export const immerLike =
  <T extends object>(config: StateCreator<T>): StateCreator<T> =>
  (set, get, api) =>
    config(
      (partial) => {
        if (typeof partial === 'function') {
          set((state) => ({
            ...state,
            ...(partial as (state: T) => T)(state),
          }));
        } else {
          set(partial);
        }
      },
      get,
      api,
    );
