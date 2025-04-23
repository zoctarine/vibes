import { create } from 'zustand';

interface VisibilityState {
  isVisible: boolean;
  toggleVisibility: () => void;
}

export const useVisibilityStore = create<VisibilityState>((set) => ({
  isVisible: true,
  toggleVisibility: () => set((state) => ({ isVisible: !state.isVisible })),
}));