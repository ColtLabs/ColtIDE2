import React from 'react';
import { Settings, CheckCircle2, AlertTriangle, Cpu } from 'lucide-react';
import { useToolchainStore } from '../store/toolchainStore';
import { usePanelStore } from '../store/panelStore';

export const ToolchainStatusBar: React.FC = () => {
  const { status, diagnostics } = useToolchainStore();
  const { cursorPosition, setSettingsOpen } = usePanelStore();

  const isMock = status.isMock;
  const isOnline = status.available && !status.isMock;

  return (
    <div className="flex items-center justify-between h-6 bg-[#161b22] border-t border-[#30363d] px-3 text-[11px] font-mono text-[#8b949e] select-none">
      {/* Left items: Toolchain status & protocol */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSettingsOpen(true)}
          className="flex items-center gap-1.5 hover:text-white transition group"
          title="Click to configure Colt Toolchain path"
        >
          {isOnline ? (
            <>
              <CheckCircle2 size={12} className="text-[#00d2b4]" />
              <span className="text-[#00d2b4] font-medium">Colt v{status.version || '0.2.0'}</span>
              <span className="text-[#484f58]">[Online]</span>
            </>
          ) : isMock ? (
            <>
              <AlertTriangle size={12} className="text-[#d29922]" />
              <span className="text-[#d29922] font-semibold">[MOCK TOOLCHAIN - DEV]</span>
            </>
          ) : (
            <>
              <Cpu size={12} className="text-[#f85149]" />
              <span className="text-[#f85149]">Toolchain Offline</span>
            </>
          )}
        </button>

        <span className="text-[#30363d]">|</span>
        <span>Protocol: {status.protocolVersion || '1'}</span>
        <span className="text-[#30363d]">|</span>
        <span>Language: Colt 0.2</span>
      </div>

      {/* Right items: Diagnostics, Cursor position, Settings */}
      <div className="flex items-center gap-3">
        <span>
          {diagnostics.length === 0 ? (
            <span className="text-[#00d2b4]">0 Problems</span>
          ) : (
            <span className="text-[#f85149] font-medium">{diagnostics.length} Problems</span>
          )}
        </span>

        <span className="text-[#30363d]">|</span>
        <span>
          Ln {cursorPosition.line}, Col {cursorPosition.column}
        </span>

        <span className="text-[#30363d]">|</span>
        <span>UTF-8</span>

        <span className="text-[#30363d]">|</span>
        <button
          onClick={() => setSettingsOpen(true)}
          title="Toolchain & IDE Settings"
          className="p-0.5 hover:text-white transition"
        >
          <Settings size={12} />
        </button>
      </div>
    </div>
  );
};
