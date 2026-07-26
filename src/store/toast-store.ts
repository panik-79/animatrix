import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warn' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number; // in milliseconds (default: 4000)
}

interface ToastState {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => string;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const duration = toast.duration ?? 4000;

    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }

    return id;
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

// Reusable toast helper function
export const toast = {
  success: (title: string, description?: string, duration?: number) =>
    useToastStore.getState().addToast({ type: 'success', title, description, duration }),

  error: (title: string, description?: string, duration?: number) =>
    useToastStore.getState().addToast({ type: 'error', title, description, duration }),

  warn: (title: string, description?: string, duration?: number) =>
    useToastStore.getState().addToast({ type: 'warn', title, description, duration }),

  info: (title: string, description?: string, duration?: number) =>
    useToastStore.getState().addToast({ type: 'info', title, description, duration }),
};
