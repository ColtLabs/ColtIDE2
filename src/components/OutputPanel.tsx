import React from 'react';
import { Trash2, Terminal, Code2 } from 'lucide-react';
import { useToolchainStore } from '../store/toolchainStore';

export const OutputPanel: React.FC = () => {
  const { outputLogs, clearLogs, planResult } = useToolchainStore();

  return (
    <div className="flex flex-col h-full bg-[#0e1117] text-xs font-mono select-text">
      {/* Action Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#161b22] border-b border-[#30363d] select-none">
        <span className="text-[#8b949e] flex items-center gap-1.5 font-sans">
          <Terminal size={13} className="text-[#00d2b4]" />
          Colt Toolchain Output Stream
        </span>
        <button
          onClick={clearLogs}
          title="Clear Output Stream"
          className="p-1 text-[#8b949e] hover:text-white hover:bg-[#1f242c] rounded transition"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {/* If we have a compiled plan, show plan steps */}
        {planResult && planResult.steps.length > 0 && (
          <div className="mb-4 p-2.5 rounded bg-[#161b22] border border-[#30363d]">
            <div className="flex items-center gap-1.5 text-[#00d2b4] font-semibold mb-2">
              <Code2 size={14} />
              Compiled Multi-Engine Execution Plan ({planResult.steps.length} Steps)
            </div>
            <div className="space-y-2">
              {planResult.steps.map((step) => (
                <div
                  key={step.step}
                  className="p-2 rounded bg-[#0e1117] border border-[#21262d] text-[11px]"
                >
                  <div className="flex items-center justify-between text-[#58a6ff] mb-1">
                    <span className="font-bold">Step {step.step}: {step.operation}</span>
                    {step.collection && (
                      <span className="text-[#8b949e]">Collection: {step.collection}</span>
                    )}
                  </div>
                  {step.sql && (
                    <div className="text-[#e6edf3] bg-[#161b22] p-1.5 rounded overflow-x-auto text-[11px]">
                      {step.sql}
                    </div>
                  )}
                  {step.params && step.params.length > 0 && (
                    <div className="mt-1 text-[#8b949e] text-[10px]">
                      Params: {JSON.stringify(step.params)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Output Logs */}
        {outputLogs.map((log) => {
          const colorClass =
            log.type === 'error'
              ? 'text-[#f85149]'
              : log.type === 'success'
              ? 'text-[#00d2b4]'
              : 'text-[#c9d1d9]';

          return (
            <div key={log.id} className="flex items-start gap-2 leading-relaxed">
              <span className="text-[#484f58] shrink-0 font-sans">[{log.time}]</span>
              <span className={colorClass}>{log.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
