import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
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
      <div className="flex flex-col items-center justify-center h-full text-xs text-muted-foreground select-none">
        <CheckCircle2 size={24} className="text-primary mb-2" />
        <span className="font-medium text-foreground">No problems detected in the current file.</span>
        <span className="text-[11px] text-muted-foreground/60 mt-0.5">
          Colt syntax and catalog validation are clean
        </span>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto font-mono text-xs select-none">
      <div className="divide-y divide-border/40">
        {diagnostics.map((diag, idx) => {
          const isError = diag.severity === 'error';
          const isWarning = diag.severity === 'warning';

          return (
            <div
              key={`${diag.code}-${diag.line}-${diag.column}-${idx}`}
              onClick={() => handleDiagnosticClick(diag)}
              className="flex items-start gap-2.5 px-3 py-2 hover:bg-card/60 cursor-pointer transition-colors group"
            >
              {/* Severity Icon */}
              <div className="mt-0.5 shrink-0">
                {isError ? (
                  <AlertCircle size={14} className="text-destructive" />
                ) : isWarning ? (
                  <AlertTriangle size={14} className="text-amber-400" />
                ) : (
                  <Info size={14} className="text-sky-400" />
                )}
              </div>

              {/* Message, Code and Hint */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {diag.message}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-card text-muted-foreground border border-border/60">
                    {diag.code}
                  </span>
                </div>

                {diag.hint && (
                  <div className="text-[11px] text-muted-foreground/90 mt-0.5">
                    <span className="text-amber-400 font-semibold">Hint:</span> {diag.hint}
                  </div>
                )}
              </div>

              {/* Location Badge */}
              <div className="text-[11px] text-muted-foreground/70 shrink-0 font-sans group-hover:text-foreground">
                Line {diag.line}, Col {diag.column}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
