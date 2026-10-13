import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, RefreshCw, Cpu } from 'lucide-react';
import { usePanelStore } from '../store/panelStore';
import { useToolchainStore } from '../store/toolchainStore';
import { ToolchainManager } from '../toolchain/toolchainManager';

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, setSettingsOpen } = usePanelStore();
  const { status, setStatus, addLog } = useToolchainStore();

  const [pathInput, setPathInput] = useState(status.executablePath || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  if (!isSettingsOpen) return null;

  const handleTestPath = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const newStatus = await ToolchainManager.getInstance().setConfiguredPath(pathInput);
      setStatus(newStatus);

      if (newStatus.available && !newStatus.isMock) {
        setTestResult(
          `Handshake successful! Detected ${newStatus.version} (Protocol v${newStatus.protocolVersion}). Capabilities: ${newStatus.capabilities.join(
            ', '
          )}`
        );
        addLog('success', `Toolchain path updated: ${pathInput}`);
      } else {
        setTestResult(`Native executable not found. Running in Mock fallback mode.`);
        addLog('error', `Toolchain detection failed at ${pathInput}. Mock fallback engaged.`);
      }
    } catch (err: unknown) {
      setTestResult(`Error: ${String(err)}`);
    } finally {
      setTesting(false);
    }
  };

  const handleUseMock = async () => {
    const newStatus = await ToolchainManager.getInstance().initialize(undefined);
    setStatus(newStatus);
    setTestResult('Switched to Mock Development Toolchain.');
    addLog('info', 'Switched to Mock Development Toolchain.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm select-none">
      <div className="w-[520px] bg-card/95 border border-border/80 rounded-xl shadow-glass overflow-hidden font-sans backdrop-blur-md">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b border-border/60">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Cpu size={16} className="text-primary" />
            Colt Toolchain & Integration Settings
          </div>
          <button
            onClick={() => setSettingsOpen(false)}
            className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-card/80 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 text-xs">
          {/* Active Status Card */}
          <div className="p-3 rounded-lg bg-background/80 border border-border/60 space-y-2">
            <div className="text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
              Current Toolchain Status
            </div>
            <div className="flex items-center gap-2">
              {status.available && !status.isMock ? (
                <>
                  <CheckCircle2 size={16} className="text-primary" />
                  <span className="text-primary font-bold">Native Colt Toolchain Active</span>
                  <span className="text-muted-foreground">v{status.version}</span>
                </>
              ) : (
                <>
                  <AlertTriangle size={16} className="text-amber-400" />
                  <span className="text-amber-400 font-bold">
                    Mock Mode (Simulated Toolchain for Development)
                  </span>
                </>
              )}
            </div>
            <div className="text-[11px] text-muted-foreground/80">
              Capabilities: {status.capabilities.join(', ') || 'none'}
            </div>
          </div>

          {/* Configurable Executable Path */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground flex items-center justify-between">
              <span>Colt Executable Path (colt.compilerPath)</span>
              <span className="text-[10px] text-muted-foreground font-normal">
                Leave empty for auto-discovery
              </span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={pathInput}
                placeholder="Auto-detect (e.g. ./target/release/colt.exe or PATH)"
                onChange={(e) => setPathInput(e.target.value)}
                className="flex-1 bg-background text-foreground font-mono px-3 py-1.5 rounded-md border border-border/70 focus:border-primary focus:outline-none transition-colors text-xs"
              />
              <button
                onClick={handleTestPath}
                disabled={testing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                <RefreshCw size={13} className={testing ? 'animate-spin' : ''} />
                Verify
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground/80">
              Searches configured path first, then workspace local build, sibling ColtLang repository, and system PATH.
            </p>
          </div>

          {/* Test / Feedback message */}
          {testResult && (
            <div
              className={`p-2.5 rounded-md border text-[11px] ${
                testResult.includes('successful')
                  ? 'bg-primary/10 text-primary border-primary/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              {testResult}
            </div>
          )}

          {/* Fallback Switch */}
          <div className="pt-2 border-t border-border/60 flex items-center justify-between">
            <div>
              <div className="font-semibold text-foreground">Simulated Mock Mode</div>
              <div className="text-[11px] text-muted-foreground/80">
                Force simulated responses for UI layout and offline testing
              </div>
            </div>
            <button
              onClick={handleUseMock}
              className="px-2.5 py-1 rounded-md bg-muted text-foreground border border-border/60 hover:bg-muted/80 transition"
            >
              Engage Mock
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-4 py-3 bg-muted/40 border-t border-border/60">
          <button
            onClick={() => setSettingsOpen(false)}
            className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-semibold transition text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
