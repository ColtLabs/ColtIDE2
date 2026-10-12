import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { useToolchainStore } from '../store/toolchainStore';
import { usePanelStore } from '../store/panelStore';
import { useWorkspaceStore } from '../store/workspaceStore';
import type { ColtDiagnosticItem } from '../toolchain/types';

export const ProblemsPanel: React.FC = () => {
  const { diagnostics } = useToolchainStore();
  const { setJumpToPosition } = usePanelStore();
  const { openFile } = useWorkspaceStore();

  const handleDiagnosticClick = (diag: ColtDiagnosticItem) => {
    // If diagnostic is for a known file, open it first
    if (diag.file && diag.file !== '<stdin>') {
      openFile(diag.file);
    }
    setJumpToPosition({
      line: diag.span.start.line || diag.line,
      column: diag.span.start.column || diag.column,
      file: diag.file,
    });
  };

  if (diagnostics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-xs text-[#8b949e]">
        <CheckCircle size={24} className="text-[#00d2b4] mb-2" />
        <span>No problems detected in the current file.</span>
        <span className="text-[11px] text-[#484f58] mt-0.5">Colt syntax and catalog validation clean</span>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto font-mono text-xs select-none">
      <div className="divide-y divide-[#21262d]">
        {diagnostics.map((diag, idx) => {
          const isError = diag.severity === 'error';
          const isWarning = diag.severity === 'warning';

          return (
            <div
              key={`${diag.code}-${diag.line}-${diag.column}-${idx}`}
              onClick={() => handleDiagnosticClick(diag)}
              className="flex items-start gap-2.5 px-3 py-2 hover:bg-[#161b22] cursor-pointer transition-colors group"
            >
              {/* Severity Icon */}
              <div className="mt-0.5 shrink-0">
                {isError ? (
                  <AlertCircle size={14} className="text-[#f85149]" />
                ) : isWarning ? (
                  <AlertTriangle size={14} className="text-[#d29922]" />
                ) : (
                  <Info size={14} className="text-[#58a6ff]" />
                )}
              </div>

              {/* Message, Code and Hint */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#e6edf3] group-hover:text-white truncate">
                    {diag.message}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#1f242c] text-[#8b949e] border border-[#30363d]">
                    {diag.code}
                  </span>
                </div>

                {diag.hint && (
                  <div className="text-[11px] text-[#8b949e] mt-0.5">
                    <span className="text-[#e3b341]">Hint:</span> {diag.hint}
                  </div>
                )}
              </div>

              {/* Location Badge */}
              <div className="text-[11px] text-[#8b949e] shrink-0 font-sans group-hover:text-[#c9d1d9]">
                Line {diag.line}, Col {diag.column}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
