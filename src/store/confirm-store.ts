import { create } from "zustand";

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
}

interface ConfirmState {
  isOpen: boolean;
  options: ConfirmOptions | null;
  resolveFn: ((value: boolean) => void) | null;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  handleConfirm: () => void;
  handleCancel: () => void;
}

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  isOpen: false,
  options: null,
  resolveFn: null,

  confirm: (options) => {
    return new Promise<boolean>((resolve) => {
      set({
        isOpen: true,
        options,
        resolveFn: resolve,
      });
    });
  },

  handleConfirm: () => {
    const { resolveFn } = get();
    if (resolveFn) resolveFn(true);
    set({ isOpen: false, options: null, resolveFn: null });
  },

  handleCancel: () => {
    const { resolveFn } = get();
    if (resolveFn) resolveFn(false);
    set({ isOpen: false, options: null, resolveFn: null });
  },
}));

export const confirmDialog = (options: ConfirmOptions) => {
  return useConfirmStore.getState().confirm(options);
};
