import type { StateCreator, StoreMutatorIdentifier } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';

/**
 * Standard middleware stack for development stores.
 * Includes: devtools + subscribeWithSelector
 *
 * @example
 * const useStore = create<MyState>()(
 *   withDevtools(
 *     (set, get) => ({ ... }),
 *     { name: 'MyStore' }
 *   )
 * );
 */
export function withDevtools<
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  initializer: StateCreator<T, [...Mps, ['zustand/devtools', never]], Mcs>,
  options: { name: string; enabled?: boolean },
): StateCreator<T, Mps, [['zustand/devtools', never], ...Mcs]> {
  return devtools(initializer, {
    name: options.name,
    enabled: options.enabled ?? process.env.NODE_ENV === 'development',
  });
}

/**
 * Standard middleware stack for persisted stores.
 * Includes: devtools + persist + subscribeWithSelector
 *
 * @example
 * const useStore = create<MyState>()(
 *   withPersist(
 *     (set, get) => ({ ... }),
 *     { name: 'MyStore', storageKey: 'my-store' }
 *   )
 * );
 */
export function withPersist<
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  initializer: StateCreator<
    T,
    [...Mps, ['zustand/persist', unknown], ['zustand/devtools', never]],
    Mcs
  >,
  options: {
    name: string;
    storageKey: string;
    enabled?: boolean;
    partialize?: (state: T) => Partial<T>;
  },
): StateCreator<
  T,
  Mps,
  [['zustand/persist', unknown], ['zustand/devtools', never], ...Mcs]
> {
  return persist(
    devtools(initializer, {
      name: options.name,
      enabled: options.enabled ?? process.env.NODE_ENV === 'development',
    }),
    {
      name: options.storageKey,
      partialize: options.partialize,
    },
  );
}

/**
 * Standard middleware stack with selectors for reactive subscriptions.
 * Includes: devtools + subscribeWithSelector
 *
 * @example
 * const useStore = create<MyState>()(
 *   withSelectors(
 *     (set, get) => ({ ... }),
 *     { name: 'MyStore' }
 *   )
 * );
 *
 * // Subscribe to specific state changes
 * useStore.subscribe(
 *   (state) => state.count,
 *   (count) => console.log('Count changed:', count)
 * );
 */
export function withSelectors<
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  initializer: StateCreator<
    T,
    [
      ...Mps,
      ['zustand/subscribeWithSelector', never],
      ['zustand/devtools', never],
    ],
    Mcs
  >,
  options: { name: string; enabled?: boolean },
): StateCreator<
  T,
  Mps,
  [
    ['zustand/subscribeWithSelector', never],
    ['zustand/devtools', never],
    ...Mcs,
  ]
> {
  return subscribeWithSelector(
    devtools(initializer, {
      name: options.name,
      enabled: options.enabled ?? process.env.NODE_ENV === 'development',
    }),
  );
}
