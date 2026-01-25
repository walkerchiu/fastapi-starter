import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface ModalState {
  /**
   * Set of currently open modal IDs.
   */
  openModals: Set<string>;
}

interface ModalActions {
  /**
   * Open a modal by ID.
   */
  openModal: (id: string) => void;

  /**
   * Close a modal by ID.
   */
  closeModal: (id: string) => void;

  /**
   * Check if a modal is open.
   */
  isOpen: (id: string) => boolean;

  /**
   * Close all modals.
   */
  closeAllModals: () => void;

  /**
   * Get the number of open modals.
   */
  getModalCount: () => number;
}

export type ModalStore = ModalState & ModalActions;

/**
 * Global modal store for managing modal dialogs.
 * Uses simple ID-based approach for Ant Design modals.
 *
 * @example
 * // In parent component
 * const { openModal } = useModalStore();
 * <Button onClick={() => openModal('editProfile')}>Edit</Button>
 *
 * @example
 * // In modal component
 * const { isOpen, closeModal } = useModalStore();
 * const open = isOpen('editProfile');
 * <Modal open={open} onClose={() => closeModal('editProfile')}>...</Modal>
 */
export const useModalStore = create<ModalStore>()(
  devtools(
    (set, get) => ({
      openModals: new Set<string>(),

      openModal: (id) => {
        set(
          (state) => {
            const newModals = new Set(state.openModals);
            newModals.add(id);
            return { openModals: newModals };
          },
          false,
          'modal/open',
        );

        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
      },

      closeModal: (id) => {
        set(
          (state) => {
            const newModals = new Set(state.openModals);
            newModals.delete(id);

            // Restore body scroll if no more modals
            if (newModals.size === 0) {
              document.body.style.overflow = '';
            }

            return { openModals: newModals };
          },
          false,
          'modal/close',
        );
      },

      isOpen: (id) => {
        return get().openModals.has(id);
      },

      closeAllModals: () => {
        set({ openModals: new Set() }, false, 'modal/closeAll');
        document.body.style.overflow = '';
      },

      getModalCount: () => {
        return get().openModals.size;
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
export const useIsModalOpen = (id: string) =>
  useModalStore((state) => state.openModals.has(id));

export const useModalActions = () =>
  useModalStore((state) => ({
    openModal: state.openModal,
    closeModal: state.closeModal,
    isOpen: state.isOpen,
    closeAllModals: state.closeAllModals,
    getModalCount: state.getModalCount,
  }));
