import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import {
  generateId,
  type ModalConfig,
  type ModalComponentProps,
} from '../types';

interface ModalState {
  /**
   * Stack of open modals (supports nested modals).
   */
  modals: ModalConfig[];

  /**
   * Currently focused modal ID.
   */
  activeModalId: string | null;
}

interface ModalActions {
  /**
   * Open a modal with the given component and props.
   */
  openModal: <T extends ModalComponentProps>(
    component: React.ComponentType<T>,
    props?: Partial<Omit<T, keyof ModalComponentProps>>,
    options?: ModalConfig['options'],
  ) => string;

  /**
   * Close a specific modal by ID.
   */
  closeModal: (id: string) => void;

  /**
   * Close the topmost modal.
   */
  closeTopModal: () => void;

  /**
   * Close all modals.
   */
  closeAllModals: () => void;

  /**
   * Check if a specific modal is open.
   */
  isModalOpen: (id: string) => boolean;

  /**
   * Get the number of open modals.
   */
  getModalCount: () => number;
}

export type ModalStore = ModalState & ModalActions;

/**
 * Global modal store for managing modal dialogs.
 * Supports stacking multiple modals.
 *
 * @example
 * // Open a modal
 * const { openModal, closeModal } = useModalStore();
 *
 * const modalId = openModal(ConfirmDialog, {
 *   title: 'Delete Item?',
 *   onConfirm: () => handleDelete(),
 * });
 *
 * // Close specific modal
 * closeModal(modalId);
 *
 * @example
 * // In the modal component
 * function ConfirmDialog({ onClose, isOpen, title, onConfirm }) {
 *   return (
 *     <Modal open={isOpen} onClose={onClose}>
 *       <h2>{title}</h2>
 *       <button onClick={() => { onConfirm(); onClose(); }}>Confirm</button>
 *     </Modal>
 *   );
 * }
 */
export const useModalStore = create<ModalStore>()(
  devtools(
    (set, get) => ({
      modals: [],
      activeModalId: null,

      openModal: (component, props = {}, options = {}) => {
        const id = generateId('modal');

        set(
          (state) => ({
            modals: [
              ...state.modals,
              {
                id,
                component:
                  component as React.ComponentType<ModalComponentProps>,
                props,
                options: {
                  closeOnOverlayClick: true,
                  closeOnEscape: true,
                  preventScroll: true,
                  ...options,
                },
              },
            ],
            activeModalId: id,
          }),
          false,
          'modal/open',
        );

        // Prevent body scroll when modal is open
        if (options.preventScroll !== false) {
          document.body.style.overflow = 'hidden';
        }

        return id;
      },

      closeModal: (id) => {
        set(
          (state) => {
            const newModals = state.modals.filter((m) => m.id !== id);
            const newActiveId =
              newModals.length > 0
                ? (newModals[newModals.length - 1]?.id ?? null)
                : null;

            // Restore body scroll if no more modals
            if (newModals.length === 0) {
              document.body.style.overflow = '';
            }

            return {
              modals: newModals,
              activeModalId: newActiveId,
            };
          },
          false,
          'modal/close',
        );
      },

      closeTopModal: () => {
        const { modals, closeModal } = get();
        if (modals.length > 0) {
          const topModal = modals[modals.length - 1];
          if (topModal) {
            closeModal(topModal.id);
          }
        }
      },

      closeAllModals: () => {
        set({ modals: [], activeModalId: null }, false, 'modal/closeAll');
        document.body.style.overflow = '';
      },

      isModalOpen: (id) => {
        return get().modals.some((m) => m.id === id);
      },

      getModalCount: () => {
        return get().modals.length;
      },
    }),
    {
      name: 'ModalStore',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
);

/**
 * Selector hooks for better performance.
 */
export const useModals = () => useModalStore((state) => state.modals);

export const useActiveModalId = () =>
  useModalStore((state) => state.activeModalId);

export const useModalActions = () =>
  useModalStore((state) => ({
    openModal: state.openModal,
    closeModal: state.closeModal,
    closeTopModal: state.closeTopModal,
    closeAllModals: state.closeAllModals,
    isModalOpen: state.isModalOpen,
    getModalCount: state.getModalCount,
  }));
