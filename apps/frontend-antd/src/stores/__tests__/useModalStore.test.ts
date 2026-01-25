import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';

import { useModalStore } from '../ui/useModalStore';

describe('useModalStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    const { getState } = useModalStore;
    act(() => {
      getState().closeAllModals();
    });
  });

  describe('openModal', () => {
    it('should open a modal by ID', () => {
      const { getState } = useModalStore;

      act(() => {
        getState().openModal('test-modal');
      });

      expect(getState().isOpen('test-modal')).toBe(true);
      expect(getState().getModalCount()).toBe(1);
    });

    it('should support multiple open modals', () => {
      const { getState } = useModalStore;

      act(() => {
        getState().openModal('modal-1');
        getState().openModal('modal-2');
      });

      expect(getState().isOpen('modal-1')).toBe(true);
      expect(getState().isOpen('modal-2')).toBe(true);
      expect(getState().getModalCount()).toBe(2);
    });

    it('should not duplicate same modal ID', () => {
      const { getState } = useModalStore;

      act(() => {
        getState().openModal('test-modal');
        getState().openModal('test-modal');
      });

      expect(getState().getModalCount()).toBe(1);
    });
  });

  describe('closeModal', () => {
    it('should close a modal by ID', () => {
      const { getState } = useModalStore;

      act(() => {
        getState().openModal('test-modal');
      });

      expect(getState().isOpen('test-modal')).toBe(true);

      act(() => {
        getState().closeModal('test-modal');
      });

      expect(getState().isOpen('test-modal')).toBe(false);
      expect(getState().getModalCount()).toBe(0);
    });

    it('should not affect other modals when closing one', () => {
      const { getState } = useModalStore;

      act(() => {
        getState().openModal('modal-1');
        getState().openModal('modal-2');
      });

      act(() => {
        getState().closeModal('modal-1');
      });

      expect(getState().isOpen('modal-1')).toBe(false);
      expect(getState().isOpen('modal-2')).toBe(true);
      expect(getState().getModalCount()).toBe(1);
    });
  });

  describe('isOpen', () => {
    it('should return true if modal is open', () => {
      const { getState } = useModalStore;

      act(() => {
        getState().openModal('test-modal');
      });

      expect(getState().isOpen('test-modal')).toBe(true);
    });

    it('should return false if modal is not open', () => {
      const { getState } = useModalStore;

      expect(getState().isOpen('non-existent')).toBe(false);
    });
  });

  describe('closeAllModals', () => {
    it('should close all modals', () => {
      const { getState } = useModalStore;

      act(() => {
        getState().openModal('modal-1');
        getState().openModal('modal-2');
        getState().openModal('modal-3');
      });

      expect(getState().getModalCount()).toBe(3);

      act(() => {
        getState().closeAllModals();
      });

      expect(getState().getModalCount()).toBe(0);
      expect(getState().isOpen('modal-1')).toBe(false);
      expect(getState().isOpen('modal-2')).toBe(false);
      expect(getState().isOpen('modal-3')).toBe(false);
    });
  });

  describe('getModalCount', () => {
    it('should return the correct count', () => {
      const { getState } = useModalStore;

      expect(getState().getModalCount()).toBe(0);

      act(() => {
        getState().openModal('modal-1');
        getState().openModal('modal-2');
      });

      expect(getState().getModalCount()).toBe(2);
    });
  });
});
