import React, { useEffect } from 'react';
import { WorkspaceExplorer } from './components/WorkspaceExplorer';
import { EditorTabs } from './components/EditorTabs';
import { Breadcrumbs } from './components/Breadcrumbs';
import { MonacoEditor } from './components/MonacoEditor';
import { BottomPanel } from './components/BottomPanel';
import { ToolchainStatusBar } from './components/ToolchainStatusBar';
import { SettingsModal } from './components/SettingsModal';
import { ToolchainManager } from './toolchain/toolchainManager';
import { useToolchainStore } from './store/toolchainStore';

export const App: React.FC = () => {
  const { setStatus, addLog } = useToolchainStore();

  useEffect(() => {
    // Initialize toolchain discovery on startup
    const initToolchain = async () => {
      addLog('info', 'Discovering Colt toolchain executable...');
      const status = await ToolchainManager.getInstance().initialize();
      setStatus(status);

      if (status.available && !status.isMock) {
        addLog(
          'success',
          `Connected to Colt Toolchain v${status.version} (Protocol v${status.protocolVersion}). Capabilities: ${status.capabilities.join(', ')}`
        );
      } else {
        addLog(
          'info',
          'Colt native executable not detected on default paths. Using Mock Toolchain for development.'
        );
      }
    };

    initToolchain();
  }, [setStatus, addLog]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0e1117] text-[#c9d1d9] overflow-hidden select-none font-sans">
      {/* Top Application Bar */}
      <header className="flex items-center justify-between h-8 bg-[#161b22] border-b border-[#30363d] px-3 select-none">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[#00d2b4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="font-bold text-xs tracking-wider text-white">
            ColtStudio <span className="text-[#00d2b4] text-[10px] font-normal font-mono">v0.1.0</span>
          </span>
        </div>

        <div className="text-[11px] text-[#8b949e] font-mono">
          Native Desktop IDE for Colt
        </div>

        <div className="w-16" />
      </header>

      {/* Main IDE Workspace Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Workspace File Explorer */}
        <WorkspaceExplorer />

        {/* Editor & Panel Main Area */}
        <main className="flex flex-col flex-1 overflow-hidden bg-[#0e1117]">
          <EditorTabs />
          <Breadcrumbs />
          <div className="flex-1 overflow-hidden relative">
            <MonacoEditor />
          </div>
          <BottomPanel />
        </main>
      </div>

      {/* Global Status Bar */}
      <ToolchainStatusBar />

      {/* Settings Modal */}
      <SettingsModal />
    </div>
  );
};

export default App;
