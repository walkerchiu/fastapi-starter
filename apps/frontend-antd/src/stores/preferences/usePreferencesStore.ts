import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { UserPreferences } from '../types';

/**
 * Default user preferences
 */
const defaultPreferences: UserPreferences = {
  sidebarCollapsed: false,
  defaultPageSize: 10,
  dateFormat: 'YYYY-MM-DD',
  timeFormat: '24h',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  language: 'en',
  compactMode: false,
  animations: true,
  soundEnabled: false,
  autoRefreshInterval: 0, // 0 means disabled
};

/**
 * Available page size options
 */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

/**
 * Available date format options
 */
export const DATE_FORMAT_OPTIONS = [
  'YYYY-MM-DD',
  'DD/MM/YYYY',
  'MM/DD/YYYY',
  'YYYY/MM/DD',
] as const;

/**
 * Available time format options
 */
export const TIME_FORMAT_OPTIONS = ['12h', '24h'] as const;

/**
 * Auto refresh interval options (in seconds, 0 = disabled)
 */
export const AUTO_REFRESH_OPTIONS = [0, 5, 10, 30, 60, 300] as const;

interface PreferencesState {
  preferences: UserPreferences;
}

interface PreferencesActions {
  /**
   * Update a single preference
   */
  setPreference: <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K],
  ) => void;

  /**
   * Update multiple preferences at once
   */
  setPreferences: (preferences: Partial<UserPreferences>) => void;

  /**
   * Reset all preferences to defaults
   */
  resetPreferences: () => void;

  /**
   * Toggle compact mode
   */
  toggleCompactMode: () => void;

  /**
   * Toggle animations
   */
  toggleAnimations: () => void;

  /**
   * Toggle sound
   */
  toggleSound: () => void;

  /**
   * Set page size
   */
  setPageSize: (size: number) => void;

  /**
   * Set language
   */
  setLanguage: (language: string) => void;

  /**
   * Set auto refresh interval
   */
  setAutoRefreshInterval: (seconds: number) => void;
}

type PreferencesStore = PreferencesState & PreferencesActions;

/**
 * User Preferences Store
 *
 * Manages user preferences with localStorage persistence.
 */
export const usePreferencesStore = create<PreferencesStore>()(
  devtools(
    persist(
      (set) => ({
        preferences: defaultPreferences,

        setPreference: (key, value) => {
          set(
            (state) => ({
              preferences: {
                ...state.preferences,
                [key]: value,
              },
            }),
            false,
            { type: 'setPreference', key, value },
          );
        },

        setPreferences: (newPreferences) => {
          set(
            (state) => ({
              preferences: {
                ...state.preferences,
                ...newPreferences,
              },
            }),
            false,
            { type: 'setPreferences', preferences: newPreferences },
          );
        },

        resetPreferences: () => {
          set({ preferences: defaultPreferences }, false, {
            type: 'resetPreferences',
          });
        },

        toggleCompactMode: () => {
          set(
            (state) => ({
              preferences: {
                ...state.preferences,
                compactMode: !state.preferences.compactMode,
              },
            }),
            false,
            { type: 'toggleCompactMode' },
          );
        },

        toggleAnimations: () => {
          set(
            (state) => ({
              preferences: {
                ...state.preferences,
                animations: !state.preferences.animations,
              },
            }),
            false,
            { type: 'toggleAnimations' },
          );
        },

        toggleSound: () => {
          set(
            (state) => ({
              preferences: {
                ...state.preferences,
                soundEnabled: !state.preferences.soundEnabled,
              },
            }),
            false,
            { type: 'toggleSound' },
          );
        },

        setPageSize: (size) => {
          set(
            (state) => ({
              preferences: {
                ...state.preferences,
                defaultPageSize: size,
              },
            }),
            false,
            { type: 'setPageSize', size },
          );
        },

        setLanguage: (language) => {
          set(
            (state) => ({
              preferences: {
                ...state.preferences,
                language,
              },
            }),
            false,
            { type: 'setLanguage', language },
          );
        },

        setAutoRefreshInterval: (seconds) => {
          set(
            (state) => ({
              preferences: {
                ...state.preferences,
                autoRefreshInterval: seconds,
              },
            }),
            false,
            { type: 'setAutoRefreshInterval', seconds },
          );
        },
      }),
      {
        name: 'user-preferences-storage',
        partialize: (state) => ({ preferences: state.preferences }),
      },
    ),
    {
      name: 'PreferencesStore',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
);

// Selector hooks for better performance
export const usePreference = <K extends keyof UserPreferences>(key: K) =>
  usePreferencesStore((state) => state.preferences[key]);

export const useCompactMode = () =>
  usePreferencesStore((state) => state.preferences.compactMode);

export const useAnimationsEnabled = () =>
  usePreferencesStore((state) => state.preferences.animations);

export const usePageSize = () =>
  usePreferencesStore((state) => state.preferences.defaultPageSize);

export const useAutoRefreshInterval = () =>
  usePreferencesStore((state) => state.preferences.autoRefreshInterval);
