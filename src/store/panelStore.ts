import { create } from 'zustand';

export type PanelTab = 'problems' | 'output' | 'terminal' | 'schema';

interface PanelState {
  activePanelTab: PanelTab;
  isBottomPanelOpen: boolean;
  cursorPosition: { line: number; column: number };
  jumpToPosition: { line: number; column: number; file: string } | null;
  isSettingsOpen: boolean;

  setActivePanelTab: (tab: PanelTab) => void;
  toggleBottomPanel: () => void;
  setBottomPanelOpen: (open: boolean) => void;
  setCursorPosition: (line: number, column: number) => void;
  setJumpToPosition: (pos: { line: number; column: number; file: string } | null) => void;
  setSettingsOpen: (open: boolean) => void;
}

export const usePanelStore = create<PanelState>((set) => ({
  activePanelTab: 'problems',
  isBottomPanelOpen: true,
  cursorPosition: { line: 1, column: 1 },
  jumpToPosition: null,
  isSettingsOpen: false,

  setActivePanelTab: (tab) => set({ activePanelTab: tab, isBottomPanelOpen: true }),
  toggleBottomPanel: () => set((s) => ({ isBottomPanelOpen: !s.isBottomPanelOpen })),
  setBottomPanelOpen: (open) => set({ isBottomPanelOpen: open }),
  setCursorPosition: (line, column) => set({ cursorPosition: { line, column } }),
  setJumpToPosition: (pos) => set({ jumpToPosition: pos }),
  setSettingsOpen: (open) => set({ isSettingsOpen: open }),
}));
