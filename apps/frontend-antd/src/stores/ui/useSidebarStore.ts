import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface SidebarState {
  /**
   * Whether the sidebar is collapsed (minimized).
   */
  isCollapsed: boolean;

  /**
   * Whether the sidebar is open on mobile.
   */
  isMobileOpen: boolean;

  /**
   * Current sidebar width in pixels (when not collapsed).
   */
  width: number;

  /**
   * Minimum sidebar width.
   */
  minWidth: number;

  /**
   * Maximum sidebar width.
   */
  maxWidth: number;

  /**
   * Currently expanded menu group IDs.
   */
  expandedGroups: string[];
}

interface SidebarActions {
  /**
   * Toggle sidebar collapsed state.
   */
  toggleCollapsed: () => void;

  /**
   * Set sidebar collapsed state.
   */
  setCollapsed: (collapsed: boolean) => void;

  /**
   * Toggle mobile sidebar.
   */
  toggleMobile: () => void;

  /**
   * Set mobile sidebar open state.
   */
  setMobileOpen: (open: boolean) => void;

  /**
   * Set sidebar width.
   */
  setWidth: (width: number) => void;

  /**
   * Toggle a menu group's expanded state.
   */
  toggleGroup: (groupId: string) => void;

  /**
   * Expand a menu group.
   */
  expandGroup: (groupId: string) => void;

  /**
   * Collapse a menu group.
   */
  collapseGroup: (groupId: string) => void;

  /**
   * Collapse all menu groups.
   */
  collapseAllGroups: () => void;

  /**
   * Reset sidebar to default state.
   */
  reset: () => void;
}

export type SidebarStore = SidebarState & SidebarActions;

const DEFAULT_STATE: SidebarState = {
  isCollapsed: false,
  isMobileOpen: false,
  width: 256,
  minWidth: 200,
  maxWidth: 400,
  expandedGroups: [],
};

/**
 * Sidebar state management store.
 * Persists collapse state and width to localStorage.
 */
export const useSidebarStore = create<SidebarStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...DEFAULT_STATE,

        toggleCollapsed: () => {
          set(
            (state) => ({ isCollapsed: !state.isCollapsed }),
            false,
            'sidebar/toggleCollapsed',
          );
        },

        setCollapsed: (collapsed) => {
          set({ isCollapsed: collapsed }, false, 'sidebar/setCollapsed');
        },

        toggleMobile: () => {
          set(
            (state) => ({ isMobileOpen: !state.isMobileOpen }),
            false,
            'sidebar/toggleMobile',
          );
        },

        setMobileOpen: (open) => {
          set({ isMobileOpen: open }, false, 'sidebar/setMobileOpen');
        },

        setWidth: (width) => {
          const { minWidth, maxWidth } = get();
          const clampedWidth = Math.min(Math.max(width, minWidth), maxWidth);
          set({ width: clampedWidth }, false, 'sidebar/setWidth');
        },

        toggleGroup: (groupId) => {
          set(
            (state) => {
              const isExpanded = state.expandedGroups.includes(groupId);
              return {
                expandedGroups: isExpanded
                  ? state.expandedGroups.filter((id) => id !== groupId)
                  : [...state.expandedGroups, groupId],
              };
            },
            false,
            'sidebar/toggleGroup',
          );
        },

        expandGroup: (groupId) => {
          set(
            (state) => {
              if (state.expandedGroups.includes(groupId)) {
                return state;
              }
              return {
                expandedGroups: [...state.expandedGroups, groupId],
              };
            },
            false,
            'sidebar/expandGroup',
          );
        },

        collapseGroup: (groupId) => {
          set(
            (state) => ({
              expandedGroups: state.expandedGroups.filter(
                (id) => id !== groupId,
              ),
            }),
            false,
            'sidebar/collapseGroup',
          );
        },

        collapseAllGroups: () => {
          set({ expandedGroups: [] }, false, 'sidebar/collapseAllGroups');
        },

        reset: () => {
          set(DEFAULT_STATE, false, 'sidebar/reset');
        },
      }),
      {
        name: 'sidebar-storage',
        partialize: (state) => ({
          isCollapsed: state.isCollapsed,
          width: state.width,
          expandedGroups: state.expandedGroups,
        }),
      },
    ),
    {
      name: 'SidebarStore',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
);

/**
 * Selector hooks for better performance.
 */
export const useSidebarCollapsed = () =>
  useSidebarStore((state) => state.isCollapsed);

export const useSidebarMobileOpen = () =>
  useSidebarStore((state) => state.isMobileOpen);

export const useSidebarWidth = () => useSidebarStore((state) => state.width);

export const useSidebarExpandedGroups = () =>
  useSidebarStore((state) => state.expandedGroups);
