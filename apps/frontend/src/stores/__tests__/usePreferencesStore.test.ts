import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';

import { usePreferencesStore } from '../preferences/usePreferencesStore';

describe('usePreferencesStore', () => {
  const defaultPreferences = {
    sidebarCollapsed: false,
    defaultPageSize: 10,
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: 'en',
    compactMode: false,
    animations: true,
    soundEnabled: false,
    autoRefreshInterval: 0,
  };

  beforeEach(() => {
    // Reset the store before each test
    const { getState } = usePreferencesStore;
    act(() => {
      getState().resetPreferences();
    });
  });

  describe('setPreference', () => {
    it('should set a single preference', () => {
      const { getState } = usePreferencesStore;

      act(() => {
        getState().setPreference('defaultPageSize', 50);
      });

      expect(getState().preferences.defaultPageSize).toBe(50);
    });

    it('should not affect other preferences', () => {
      const { getState } = usePreferencesStore;

      act(() => {
        getState().setPreference('compactMode', true);
      });

      expect(getState().preferences.compactMode).toBe(true);
      expect(getState().preferences.defaultPageSize).toBe(
        defaultPreferences.defaultPageSize,
      );
      expect(getState().preferences.animations).toBe(
        defaultPreferences.animations,
      );
    });
  });

  describe('setPreferences', () => {
    it('should set multiple preferences at once', () => {
      const { getState } = usePreferencesStore;

      act(() => {
        getState().setPreferences({
          defaultPageSize: 20,
          compactMode: true,
          language: 'zh-TW',
        });
      });

      const { preferences } = getState();
      expect(preferences.defaultPageSize).toBe(20);
      expect(preferences.compactMode).toBe(true);
      expect(preferences.language).toBe('zh-TW');
    });
  });

  describe('resetPreferences', () => {
    it('should reset all preferences to defaults', () => {
      const { getState } = usePreferencesStore;

      act(() => {
        getState().setPreferences({
          defaultPageSize: 100,
          compactMode: true,
          animations: false,
          soundEnabled: true,
        });
      });

      act(() => {
        getState().resetPreferences();
      });

      const { preferences } = getState();
      expect(preferences.defaultPageSize).toBe(
        defaultPreferences.defaultPageSize,
      );
      expect(preferences.compactMode).toBe(defaultPreferences.compactMode);
      expect(preferences.animations).toBe(defaultPreferences.animations);
      expect(preferences.soundEnabled).toBe(defaultPreferences.soundEnabled);
    });
  });

  describe('toggleCompactMode', () => {
    it('should toggle compact mode', () => {
      const { getState } = usePreferencesStore;

      expect(getState().preferences.compactMode).toBe(false);

      act(() => {
        getState().toggleCompactMode();
      });

      expect(getState().preferences.compactMode).toBe(true);

      act(() => {
        getState().toggleCompactMode();
      });

      expect(getState().preferences.compactMode).toBe(false);
    });
  });

  describe('toggleAnimations', () => {
    it('should toggle animations', () => {
      const { getState } = usePreferencesStore;

      expect(getState().preferences.animations).toBe(true);

      act(() => {
        getState().toggleAnimations();
      });

      expect(getState().preferences.animations).toBe(false);

      act(() => {
        getState().toggleAnimations();
      });

      expect(getState().preferences.animations).toBe(true);
    });
  });

  describe('toggleSound', () => {
    it('should toggle sound', () => {
      const { getState } = usePreferencesStore;

      expect(getState().preferences.soundEnabled).toBe(false);

      act(() => {
        getState().toggleSound();
      });

      expect(getState().preferences.soundEnabled).toBe(true);

      act(() => {
        getState().toggleSound();
      });

      expect(getState().preferences.soundEnabled).toBe(false);
    });
  });

  describe('setPageSize', () => {
    it('should set page size', () => {
      const { getState } = usePreferencesStore;

      act(() => {
        getState().setPageSize(50);
      });

      expect(getState().preferences.defaultPageSize).toBe(50);
    });
  });

  describe('setLanguage', () => {
    it('should set language', () => {
      const { getState } = usePreferencesStore;

      act(() => {
        getState().setLanguage('zh-TW');
      });

      expect(getState().preferences.language).toBe('zh-TW');
    });
  });

  describe('setAutoRefreshInterval', () => {
    it('should set auto refresh interval', () => {
      const { getState } = usePreferencesStore;

      act(() => {
        getState().setAutoRefreshInterval(30);
      });

      expect(getState().preferences.autoRefreshInterval).toBe(30);
    });

    it('should allow setting to 0 (disabled)', () => {
      const { getState } = usePreferencesStore;

      act(() => {
        getState().setAutoRefreshInterval(30);
      });

      act(() => {
        getState().setAutoRefreshInterval(0);
      });

      expect(getState().preferences.autoRefreshInterval).toBe(0);
    });
  });
});
