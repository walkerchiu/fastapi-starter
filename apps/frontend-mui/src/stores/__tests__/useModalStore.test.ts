import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import type { FC } from 'react';

import { useModalStore } from '../ui/useModalStore';
import type { ModalComponentProps } from '../types';

// Mock modal component
const MockModal: FC<ModalComponentProps> = () => null;

describe('useModalStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    const { getState } = useModalStore;
    act(() => {
      getState().closeAllModals();
    });
  });

  describe('openModal', () => {
    it('should open a modal with default options', () => {
      const { getState } = useModalStore;

      act(() => {
        getState().openModal(MockModal);
      });

      const { modals, activeModalId } = getState();
      expect(modals).toHaveLength(1);
      expect(modals[0]?.component).toBe(MockModal);
      expect(modals[0]?.options?.closeOnOverlayClick).toBe(true);
      expect(modals[0]?.options?.closeOnEscape).toBe(true);
      expect(modals[0]?.options?.preventScroll).toBe(true);
      expect(activeModalId).toBe(modals[0]?.id);
    });

    it('should open a modal with custom props', () => {
      const { getState } = useModalStore;
      const customProps = { title: 'Test Modal', data: { foo: 'bar' } };

      act(() => {
        getState().openModal(MockModal, customProps);
      });

      const modal = getState().modals[0];
      expect(modal?.props).toEqual(customProps);
    });

    it('should open a modal with custom options', () => {
      const { getState } = useModalStore;

      act(() => {
        getState().openModal(
          MockModal,
          {},
          {
            closeOnOverlayClick: false,
            closeOnEscape: false,
            preventScroll: false,
          },
        );
      });

      const modal = getState().modals[0];
      expect(modal?.options?.closeOnOverlayClick).toBe(false);
      expect(modal?.options?.closeOnEscape).toBe(false);
      expect(modal?.options?.preventScroll).toBe(false);
    });

    it('should return the modal ID', () => {
      const { getState } = useModalStore;

      let modalId: string = '';
      act(() => {
        modalId = getState().openModal(MockModal);
      });

      expect(modalId).toBeTruthy();
      expect(getState().modals[0]?.id).toBe(modalId);
    });

    it('should support stacked modals', () => {
      const { getState } = useModalStore;

      act(() => {
        getState().openModal(MockModal, { title: 'First' });
        getState().openModal(MockModal, { title: 'Second' });
      });

      const { modals, activeModalId } = getState();
      expect(modals).toHaveLength(2);
      expect((modals[0]?.props as Record<string, unknown>)?.['title']).toBe(
        'First',
      );
      expect((modals[1]?.props as Record<string, unknown>)?.['title']).toBe(
        'Second',
      );
      expect(activeModalId).toBe(modals[1]?.id);
    });
  });

  describe('closeModal', () => {
    it('should close a modal by ID', () => {
      const { getState } = useModalStore;

      let modalId: string = '';
      act(() => {
        modalId = getState().openModal(MockModal);
      });

      act(() => {
        getState().closeModal(modalId);
      });

      expect(getState().modals).toHaveLength(0);
      expect(getState().activeModalId).toBeNull();
    });

    it('should update activeModalId to previous modal when closing stacked', () => {
      const { getState } = useModalStore;

      let firstId: string = '';
      act(() => {
        firstId = getState().openModal(MockModal, { title: 'First' });
        getState().openModal(MockModal, { title: 'Second' });
      });

      const secondId = getState().activeModalId;

      act(() => {
        getState().closeModal(secondId!);
      });

      expect(getState().modals).toHaveLength(1);
      expect(getState().activeModalId).toBe(firstId);
    });
  });

  describe('closeTopModal', () => {
    it('should close the topmost modal', () => {
      const { getState } = useModalStore;

      act(() => {
        getState().openModal(MockModal, { title: 'First' });
        getState().openModal(MockModal, { title: 'Second' });
      });

      act(() => {
        getState().closeTopModal();
      });

      const { modals } = getState();
      expect(modals).toHaveLength(1);
      expect((modals[0]?.props as Record<string, unknown>)?.['title']).toBe(
        'First',
      );
    });

    it('should do nothing when no modals are open', () => {
      const { getState } = useModalStore;

      act(() => {
        getState().closeTopModal();
      });

      expect(getState().modals).toHaveLength(0);
    });
  });

  describe('closeAllModals', () => {
    it('should close all modals', () => {
      const { getState } = useModalStore;

      act(() => {
        getState().openModal(MockModal);
        getState().openModal(MockModal);
        getState().openModal(MockModal);
      });

      expect(getState().modals).toHaveLength(3);

      act(() => {
        getState().closeAllModals();
      });

      expect(getState().modals).toHaveLength(0);
      expect(getState().activeModalId).toBeNull();
    });
  });

  describe('isModalOpen', () => {
    it('should return true if modal is open', () => {
      const { getState } = useModalStore;

      let modalId: string = '';
      act(() => {
        modalId = getState().openModal(MockModal);
      });

      expect(getState().isModalOpen(modalId)).toBe(true);
    });

    it('should return false if modal is not open', () => {
      const { getState } = useModalStore;

      expect(getState().isModalOpen('non-existent')).toBe(false);
    });
  });

  describe('getModalCount', () => {
    it('should return the correct count', () => {
      const { getState } = useModalStore;

      expect(getState().getModalCount()).toBe(0);

      act(() => {
        getState().openModal(MockModal);
        getState().openModal(MockModal);
      });

      expect(getState().getModalCount()).toBe(2);
    });
  });
});
