import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, RefreshCw, Cpu } from 'lucide-react';
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
      <div className="w-[520px] bg-[#161b22] border border-[#30363d] rounded-lg shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#1f242c] border-b border-[#30363d]">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#e6edf3]">
            <Cpu size={16} className="text-[#00d2b4]" />
            Colt Toolchain & Integration Settings
          </div>
          <button
            onClick={() => setSettingsOpen(false)}
            className="p-1 text-[#8b949e] hover:text-white rounded hover:bg-[#30363d]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 text-xs">
          {/* Active Status Card */}
          <div className="p-3 rounded bg-[#0e1117] border border-[#30363d] space-y-2">
            <div className="text-[#8b949e] font-semibold text-[11px] uppercase tracking-wider">
              Current Toolchain Status
            </div>
            <div className="flex items-center gap-2">
              {status.available && !status.isMock ? (
                <>
                  <CheckCircle size={16} className="text-[#00d2b4]" />
                  <span className="text-[#00d2b4] font-bold">Native Colt Toolchain Active</span>
                  <span className="text-[#8b949e]">v{status.version}</span>
                </>
              ) : (
                <>
                  <AlertTriangle size={16} className="text-[#d29922]" />
                  <span className="text-[#d29922] font-bold">
                    Mock Mode (Simulated Toolchain for Development)
                  </span>
                </>
              )}
            </div>
            <div className="text-[11px] text-[#8b949e]">
              Capabilities: {status.capabilities.join(', ') || 'none'}
            </div>
          </div>

          {/* Configurable Executable Path */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#c9d1d9] flex items-center justify-between">
              <span>Colt Executable Path (colt.compilerPath)</span>
              <span className="text-[10px] text-[#8b949e] font-normal">
                Leave empty for auto-discovery
              </span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={pathInput}
                placeholder="Auto-detect (e.g. ./target/release/colt.exe or PATH)"
                onChange={(e) => setPathInput(e.target.value)}
                className="flex-1 bg-[#0e1117] text-white font-mono px-3 py-1.5 rounded border border-[#30363d] focus:border-[#00d2b4] focus:outline-none"
              />
              <button
                onClick={handleTestPath}
                disabled={testing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#00d2b4] text-[#0e1117] font-semibold hover:bg-[#00d2b4]/90 disabled:opacity-50"
              >
                <RefreshCw size={13} className={testing ? 'animate-spin' : ''} />
                Verify
              </button>
            </div>
            <p className="text-[11px] text-[#8b949e]">
              Searches configured path first, then workspace local build, sibling ColtLang repository, and system PATH.
            </p>
          </div>

          {/* Test / Feedback message */}
          {testResult && (
            <div
              className={`p-2.5 rounded border text-[11px] ${
                testResult.includes('successful')
                  ? 'bg-[#13322b] text-[#00d2b4] border-[#00d2b4]/30'
                  : 'bg-[#3b2d1d] text-[#d29922] border-[#d29922]/30'
              }`}
            >
              {testResult}
            </div>
          )}

          {/* Fallback Switch */}
          <div className="pt-2 border-t border-[#30363d] flex items-center justify-between">
            <div>
              <div className="font-semibold text-[#c9d1d9]">Simulated Mock Mode</div>
              <div className="text-[11px] text-[#8b949e]">
                Force simulated responses for UI layout and offline testing
              </div>
            </div>
            <button
              onClick={handleUseMock}
              className="px-2.5 py-1 rounded bg-[#21262d] text-[#c9d1d9] border border-[#30363d] hover:bg-[#30363d] transition"
            >
              Engage Mock
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-4 py-3 bg-[#1f242c] border-t border-[#30363d]">
          <button
            onClick={() => setSettingsOpen(false)}
            className="px-4 py-1.5 rounded bg-[#21262d] text-white hover:bg-[#30363d] font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
