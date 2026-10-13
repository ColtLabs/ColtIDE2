import React, { useEffect, useState, useCallback, useRef } from 'react';
import { SoloTitlebar } from './components/titlebar/SoloTitlebar';
import { SoloIconRail, type RailTab } from './components/sidebar/SoloIconRail';
import { SoloSidebar } from './components/sidebar/SoloSidebar';
import { SoloColtanePanel } from './components/sidebar/SoloColtanePanel';
import { SoloTabs } from './components/editor/SoloTabs';
import { Breadcrumbs } from './components/Breadcrumbs';
import { MonacoEditor } from './components/MonacoEditor';
import { SoloBottomDrawer } from './components/drawer/SoloBottomDrawer';
import { SoloStatusBar } from './components/statusbar/SoloStatusBar';
import { SettingsModal } from './components/SettingsModal';
import { ToolchainManager } from './toolchain/toolchainManager';
import { useToolchainStore } from './store/toolchainStore';
import { usePanelStore } from './store/panelStore';

export const App: React.FC = () => {
  const { setStatus, addLog } = useToolchainStore();
  const { setActivePanelTab, setBottomPanelOpen } = usePanelStore();

  const [activeRailTab, setActiveRailTab] = useState<RailTab>('explorer');
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const isDraggingRef = useRef(false);

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

  // Handle Rail Tab switching
  const handleRailTabChange = (tab: RailTab) => {
    if (tab === 'problems') {
      setActivePanelTab('problems');
      setBottomPanelOpen(true);
      return;
    }
    if (tab === 'terminal') {
      setActivePanelTab('terminal');
      setBottomPanelOpen(true);
      return;
    }

    if (activeRailTab === tab) {
      // Toggle sidebar visibility on click
      setIsSidebarVisible((prev) => !prev);
    } else {
      setActiveRailTab(tab);
      setIsSidebarVisible(true);
    }
  };

  // Resizable sidebar logic
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      // Subtract the 48px width of the SoloIconRail
      const newWidth = Math.max(160, Math.min(480, moveEvent.clientX - 48));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-background text-foreground overflow-hidden select-none font-sans antialiased">
      {/* Solo-Styled Vibrancy Titlebar */}
      <SoloTitlebar />

      {/* Main Workspace Frame */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Leftmost Activity Icon Rail */}
        <SoloIconRail
          activeTab={activeRailTab}
          onTabChange={handleRailTabChange}
        />

        {/* Dynamic Translucent Sidebar */}
        {isSidebarVisible && (
          <>
            {activeRailTab === 'explorer' && <SoloSidebar width={sidebarWidth} />}
            {activeRailTab === 'coltane' && <SoloColtanePanel width={sidebarWidth} />}

            {/* Split Resizer Divider */}
            <div
              className="split-divider"
              onMouseDown={handleMouseDown}
              title="Drag to resize sidebar"
            />
          </>
        )}

        {/* Editor & Bottom Panels Area */}
        <main className="flex flex-col flex-1 overflow-hidden bg-background">
          <SoloTabs />
          <Breadcrumbs />

          <div className="flex-1 overflow-hidden relative bg-[#121215]">
            <MonacoEditor />
          </div>

          <SoloBottomDrawer />
        </main>
      </div>

      {/* Sleek Global Status Bar */}
      <SoloStatusBar />

      {/* Toolchain & Preferences Modal */}
      <SettingsModal />
    </div>
  );
};

export default App;
