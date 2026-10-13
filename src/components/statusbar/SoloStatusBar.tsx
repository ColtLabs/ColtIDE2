import React from 'react';
import { Settings, CheckCircle2, AlertTriangle, AlertCircle, Cpu } from 'lucide-react';
import { useToolchainStore } from '../../store/toolchainStore';
import { usePanelStore } from '../../store/panelStore';
import { useWorkspaceStore } from '../../store/workspaceStore';

export const SoloStatusBar: React.FC = () => {
  const { status, diagnostics } = useToolchainStore();
  const { cursorPosition, setSettingsOpen, setActivePanelTab, setBottomPanelOpen } =
    usePanelStore();
  const { activeTab } = useWorkspaceStore();

  const isMock = status.isMock;
  const isOnline = status.available && !status.isMock;

  const handleProblemsClick = () => {
    setActivePanelTab('problems');
    setBottomPanelOpen(true);
  };

  return (
    <footer className="flex items-center justify-between h-[26px] bg-sidebar/95 border-t border-border/80 px-3 text-[11px] font-mono text-muted-foreground select-none z-20 shrink-0">
      {/* Left items: Toolchain status & protocol */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => setSettingsOpen(true)}
          className="flex items-center gap-1.5 px-1.5 py-0.5 rounded hover:bg-card/70 hover:text-foreground transition-colors group"
          title="Colt Toolchain status (click to configure binary path)"
        >
          {isOnline ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-primary font-medium">Colt v{status.version || '0.2.0'}</span>
              <span className="text-muted-foreground/60 text-[10px] font-sans">[Online]</span>
            </>
          ) : isMock ? (
            <>
              <AlertTriangle size={12} className="text-amber-400" />
              <span className="text-amber-400 font-semibold">[MOCK TOOLCHAIN - DEV]</span>
            </>
          ) : (
            <>
              <Cpu size={12} className="text-destructive" />
              <span className="text-destructive font-medium">Toolchain Offline</span>
            </>
          )}
        </button>

        <span className="text-border/60">|</span>
        <span className="text-muted-foreground/80">Protocol v{status.protocolVersion || '1'}</span>
        <span className="text-border/60">|</span>
        <span className="text-muted-foreground/80 font-sans">
          {activeTab?.endsWith('.colt') ? 'Colt 0.2' : 'Plain Text'}
        </span>
      </div>

      {/* Right items: Diagnostics, Cursor position, UTF-8, Settings */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={handleProblemsClick}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-card/70 transition-colors"
          title="Toggle Problems panel"
        >
          {diagnostics.length === 0 ? (
            <span className="flex items-center gap-1 text-primary">
              <CheckCircle2 size={11} />
              <span>0 Problems</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-destructive font-semibold">
              <AlertCircle size={11} />
              <span>{diagnostics.length} Problems</span>
            </span>
          )}
        </button>

        <span className="text-border/60">|</span>
        <span className="text-muted-foreground/90">
          Ln {cursorPosition.line}, Col {cursorPosition.column}
        </span>

        <span className="text-border/60">|</span>
        <span className="text-muted-foreground/75">Spaces: 2</span>

        <span className="text-border/60">|</span>
        <span className="text-muted-foreground/75">UTF-8</span>

        <span className="text-border/60">|</span>
        <button
          onClick={() => setSettingsOpen(true)}
          title="Toolchain & IDE Settings"
          className="p-1 hover:text-foreground hover:bg-card/70 rounded transition-colors"
        >
          <Settings size={12} />
        </button>
      </div>
    </footer>
  );
};
