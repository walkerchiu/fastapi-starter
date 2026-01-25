import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';

import { useSidebarStore } from '../ui/useSidebarStore';

describe('useSidebarStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    const { getState } = useSidebarStore;
    act(() => {
      getState().reset();
    });
  });

  describe('toggleCollapsed', () => {
    it('should toggle collapsed state', () => {
      const { getState } = useSidebarStore;

      expect(getState().isCollapsed).toBe(false);

      act(() => {
        getState().toggleCollapsed();
      });

      expect(getState().isCollapsed).toBe(true);

      act(() => {
        getState().toggleCollapsed();
      });

      expect(getState().isCollapsed).toBe(false);
    });
  });

  describe('setCollapsed', () => {
    it('should set collapsed state directly', () => {
      const { getState } = useSidebarStore;

      act(() => {
        getState().setCollapsed(true);
      });

      expect(getState().isCollapsed).toBe(true);

      act(() => {
        getState().setCollapsed(false);
      });

      expect(getState().isCollapsed).toBe(false);
    });
  });

  describe('toggleMobile', () => {
    it('should toggle mobile open state', () => {
      const { getState } = useSidebarStore;

      expect(getState().isMobileOpen).toBe(false);

      act(() => {
        getState().toggleMobile();
      });

      expect(getState().isMobileOpen).toBe(true);

      act(() => {
        getState().toggleMobile();
      });

      expect(getState().isMobileOpen).toBe(false);
    });
  });

  describe('setMobileOpen', () => {
    it('should set mobile open state directly', () => {
      const { getState } = useSidebarStore;

      act(() => {
        getState().setMobileOpen(true);
      });

      expect(getState().isMobileOpen).toBe(true);

      act(() => {
        getState().setMobileOpen(false);
      });

      expect(getState().isMobileOpen).toBe(false);
    });
  });

  describe('setWidth', () => {
    it('should set sidebar width', () => {
      const { getState } = useSidebarStore;

      act(() => {
        getState().setWidth(300);
      });

      expect(getState().width).toBe(300);
    });

    it('should enforce minimum width', () => {
      const { getState } = useSidebarStore;
      const minWidth = getState().minWidth;

      act(() => {
        getState().setWidth(50);
      });

      expect(getState().width).toBe(minWidth);
    });

    it('should enforce maximum width', () => {
      const { getState } = useSidebarStore;
      const maxWidth = getState().maxWidth;

      act(() => {
        getState().setWidth(500);
      });

      expect(getState().width).toBe(maxWidth);
    });
  });

  describe('toggleGroup', () => {
    it('should add group to expanded list', () => {
      const { getState } = useSidebarStore;

      act(() => {
        getState().toggleGroup('users');
      });

      expect(getState().expandedGroups).toContain('users');
    });

    it('should remove group from expanded list if already expanded', () => {
      const { getState } = useSidebarStore;

      act(() => {
        getState().expandGroup('users');
        getState().expandGroup('settings');
      });

      act(() => {
        getState().toggleGroup('users');
      });

      expect(getState().expandedGroups).not.toContain('users');
      expect(getState().expandedGroups).toContain('settings');
    });
  });

  describe('expandGroup', () => {
    it('should expand a group', () => {
      const { getState } = useSidebarStore;

      act(() => {
        getState().expandGroup('users');
      });

      expect(getState().expandedGroups).toContain('users');
    });

    it('should not duplicate if already expanded', () => {
      const { getState } = useSidebarStore;

      act(() => {
        getState().expandGroup('users');
        getState().expandGroup('users');
      });

      expect(
        getState().expandedGroups.filter((g) => g === 'users'),
      ).toHaveLength(1);
    });
  });

  describe('collapseGroup', () => {
    it('should collapse a group', () => {
      const { getState } = useSidebarStore;

      act(() => {
        getState().expandGroup('users');
        getState().expandGroup('settings');
      });

      act(() => {
        getState().collapseGroup('users');
      });

      expect(getState().expandedGroups).not.toContain('users');
      expect(getState().expandedGroups).toContain('settings');
    });
  });

  describe('collapseAllGroups', () => {
    it('should collapse all groups', () => {
      const { getState } = useSidebarStore;

      act(() => {
        getState().expandGroup('users');
        getState().expandGroup('settings');
        getState().expandGroup('reports');
      });

      act(() => {
        getState().collapseAllGroups();
      });

      expect(getState().expandedGroups).toEqual([]);
    });
  });

  describe('reset', () => {
    it('should reset to default state', () => {
      const { getState } = useSidebarStore;

      act(() => {
        getState().setCollapsed(true);
        getState().setMobileOpen(true);
        getState().setWidth(300);
        getState().expandGroup('users');
      });

      act(() => {
        getState().reset();
      });

      expect(getState().isCollapsed).toBe(false);
      expect(getState().isMobileOpen).toBe(false);
      expect(getState().width).toBe(256);
      expect(getState().expandedGroups).toEqual([]);
    });
  });
});
